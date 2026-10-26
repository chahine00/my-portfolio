// The page for ONE post, at /updates/<slug>.
// The <slug> part of the URL tells us which post to show.

import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { formatDate, sortedUpdates } from '../../data/updates.ts'
import Gallery from '../../components/Gallery.tsx'

function UpdatePost() {
  // useParams reads the ":slug" part of the URL (see the <Route> in App.tsx).
  const { slug } = useParams()
  const postIndex = sortedUpdates.findIndex((update) => update.slug === slug)
  const post = sortedUpdates[postIndex]

  // Start at the top whenever you open a post (including via Older/Newer links).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  // If the URL doesn't match any post (a typo, or a deleted post), say so.
  if (!post) {
    return (
      <section className="section">
        <h1>Post not found</h1>
        <p>This post doesn't exist or was removed.</p>
        <Link to="/updates" className="back-link">
          <span aria-hidden="true">←</span> See all updates
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
    <article className="section post">
      <Link to="/updates" className="back-link">
        <span aria-hidden="true">←</span> All updates
      </Link>

      <header className="post__header">
        <time dateTime={post.date} className="post__date">
          {formatDate(post.date)}
        </time>
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
        {paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <nav className="post__nav" aria-label="More posts">
        {older ? (
          <Link to={`/updates/${older.slug}`} title={older.title}>
            <span className="post__nav-label"><b aria-hidden="true">←</b> Older post</span>
            <span className="post__nav-title">{older.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {newer && (
          <Link to={`/updates/${newer.slug}`} className="post__nav-newer" title={newer.title}>
            <span className="post__nav-label">Newer post <b aria-hidden="true">→</b></span>
            <span className="post__nav-title">{newer.title}</span>
          </Link>
        )}
      </nav>
    </article>
  )
}

export default UpdatePost
