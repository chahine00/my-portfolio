// The page for ONE post, at /blog/<slug>.
// The <slug> part of the URL tells us which post to show.

import { Fragment, useLayoutEffect } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { filterUpdates, formatDate, readingTime, sortedUpdates } from '../../data/updates.ts'
import { readListSpot } from './listSpot.ts'
import Gallery from '../../components/Gallery.tsx'
import ScrollUpBack from '../../components/ScrollUpBack.tsx'
import { useDocumentTitle } from '../../utils/useDocumentTitle.ts'
import { postDescription } from '../../data/seo.ts'

// Turns one paragraph of a post into what the page shows.
// Lines starting with "- " become a real bulleted list, so a long point that wraps lines up
// under its own text instead of under the dash. A short line ending with ":" right before a
// list ("What I used:") becomes a small bold label for that list. A short first line with no
// punctuation and more text under it ("💡 Key takeaway") becomes a section title. Everything
// else stays a normal paragraph, keeping its single line breaks.
function renderParagraph(paragraph: string, key: number) {
  const lines = paragraph.split('\n')
  const parts: ReactNode[] = []

  const first = lines[0].trim()
  if (lines.length > 1 && first.length <= 50 && !/[.!?:,;]/.test(first) && !first.startsWith('- ')) {
    parts.push(<h2 key="title" className="post__subhead">{first}</h2>)
    lines.shift()
  }

  let text: string[] = []
  let items: string[] = []

  function flushText(beforeList: boolean) {
    if (text.length === 0) return
    const last = text[text.length - 1].trim()
    // The label is only the LAST line before the list; any lines above it stay a paragraph.
    if (beforeList && last.endsWith(':') && last.length <= 80) {
      if (text.length > 1) parts.push(<p key={parts.length}>{text.slice(0, -1).join('\n')}</p>)
      parts.push(<p key={parts.length} className="post__lead-in">{last}</p>)
    } else {
      parts.push(<p key={parts.length}>{text.join('\n')}</p>)
    }
    text = []
  }

  function flushList() {
    if (items.length === 0) return
    parts.push(
      <ul key={parts.length} className="post__list">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>,
    )
    items = []
  }

  for (const line of lines) {
    const bullet = line.match(/^\s*- (.*)$/)
    if (bullet) {
      flushText(true)
      items.push(bullet[1])
    } else {
      flushList()
      text.push(line)
    }
  }
  flushText(false)
  flushList()

  return <Fragment key={key}>{parts}</Fragment>
}

function UpdatePost() {
  // useParams reads the ":slug" part of the URL (see the <Route> in App.tsx).
  const { slug } = useParams()
  const postIndex = sortedUpdates.findIndex((update) => update.slug === slug)
  const post = sortedUpdates[postIndex]
  const location = useLocation()
  const navigate = useNavigate()
  // The tab and Google show the post's title and summary (or "Post not found", kept out of Google).
  useDocumentTitle(post ? post.title : 'Post not found', { description: post && postDescription(post), noindex: !post })

  // "All posts" (top and bottom of the post): to the Blog list, where you left it. Opened straight from the list: just step back
  // (the list remembers its scroll spot). Otherwise (after Older/Newer, or a shared link), open the
  // list at this post's card, keeping the last search/category if this post is in it.
  function goBack() {
    if ((location.state as { fromList?: boolean } | null)?.fromList) {
      navigate(-1)
      return
    }
    const spot = readListSpot()
    let search = ''
    if (spot?.search) {
      const params = new URLSearchParams(spot.search)
      const inList = filterUpdates(sortedUpdates, params.get('q') ?? '', params.get('category') ?? 'All')
      if (inList.some((update) => update.slug === slug)) search = spot.search
    }
    navigate(`/blog${search}`, { state: { returnTo: slug } })
  }

  // Start at the top whenever you open a post (including via Older/Newer links).
  useLayoutEffect(() => {
    // 'instant': skip the smooth scrolling set in global.css, so the page opens at the top
    // instead of gliding up from where the previous page was.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [slug])

  // If the URL doesn't match any post (a typo, or a deleted post), say so.
  if (!post) {
    return (
      <section className="section">
        <h1>Post not found</h1>
        <p>This post doesn't exist or was removed.</p>
        <Link to="/blog" className="back-link">
          <span aria-hidden="true">←</span> See all posts
        </Link>
      </section>
    )
  }

  // The list is newest first, so the NEWER post is before this one and the OLDER one is after.
  const newer = sortedUpdates[postIndex - 1]
  const older = sortedUpdates[postIndex + 1]

  // Split the text into paragraphs wherever there's an empty line.
  const paragraphs = post.content.split(/\n\s*\n/)

  return (
    <article className="section post page-enter" key={post.slug}>
      {/* A button styled like the other back links: it returns to the list where you left it. */}
      <button type="button" className="back-link back-button" onClick={goBack}>
        <span aria-hidden="true">←</span> All posts
      </button>

      <header className="post__header">
        {/* The category opens the Blog page showing only that category. */}
        <div className="post__meta">
          <Link to={`/blog?category=${encodeURIComponent(post.category)}`} className="update-card__category">
            {post.category}
          </Link>
          <time dateTime={post.date} className="post__date">
            {formatDate(post.date)}
          </time>
          <span className="post__date">· {readingTime(post.content)} min read</span>
        </div>
        <h1>{post.title}</h1>
        {post.tags && (
          <ul className="tags">
            {post.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
      </header>

      {/* key={post.slug} gives each post a fresh gallery, so it starts again at photo 1. */}
      {post.images.length > 0 && <Gallery key={post.slug} images={post.images} title={post.title} />}

      <div className="post__body">
        {paragraphs.map(renderParagraph)}
      </div>

      {/* Older post | All posts | Newer post (phones: All posts under the other two), like a
          project's page. All posts goes back to the list where you left it. */}
      <nav className="post__nav post__nav--three" aria-label="More posts">
        {older ? (
          <Link to={`/blog/${older.slug}`} className="post__nav-prev" title={older.title}>
            <span className="post__nav-label"><b aria-hidden="true">←</b> Older post</span>
            <span className="post__nav-title">{older.title}</span>
          </Link>
        ) : (
          <span className="post__nav-prev" />
        )}
        <button type="button" className="button button-outline post__nav-all" onClick={goBack}>
          All posts
        </button>
        {newer ? (
          <Link to={`/blog/${newer.slug}`} className="post__nav-newer" title={newer.title}>
            <span className="post__nav-label">Newer post <b aria-hidden="true">→</b></span>
            <span className="post__nav-title">{newer.title}</span>
          </Link>
        ) : (
          <span className="post__nav-newer" />
        )}
      </nav>

      {/* Phones, in the middle of the post: the same way back, under the thumb when you scroll up. */}
      <ScrollUpBack key={post.slug} label="All posts" onClick={goBack} />
    </article>
  )
}

export default UpdatePost
