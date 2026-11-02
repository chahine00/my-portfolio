// The Blog page: its own page at /blog, showing every post, with a search box and category buttons.
// The home page only shows a preview (see Updates.tsx).
// The search and the category live in the address (/blog?q=aws&category=Engineering),
// so a filtered list can be shared, and the home page can open the page already filtered.

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { filterUpdates, sortedUpdates } from '../../data/updates.ts'
import { asset } from '../../utils/asset.ts'
import BlogFilters from './BlogFilters.tsx'
import UpdateTimeline from './UpdateTimeline.tsx'

// For the banner: the main photo of the 3 newest posts that have one.
const bannerPhotos = sortedUpdates.filter((post) => post.images.length > 0).slice(0, 3)

function UpdatesPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const category = params.get('category') ?? 'All'

  // A new page should start at the top, not wherever the previous page was scrolled to.
  useLayoutEffect(() => {
    // 'instant': skip the smooth scrolling set in global.css, so the page opens at the top
    // instead of gliding up from where the previous page was.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  // Whether the Blog bar is stuck under the navbar right now. It changes the shape of the bar's
  // faded background (see .blog-bar--stuck in global.css).
  const barRef = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    function handleScroll() {
      const bar = barRef.current
      if (!bar) return
      // The bar is stuck when it sits at its "top" position (under the navbar, or the screen's top on phones).
      const stickAt = parseFloat(getComputedStyle(bar).top) || 0
      setStuck(window.scrollY > 0 && bar.getBoundingClientRect().top <= stickAt + 1)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  // A new search or category shows a new list: bring its first post into view, right under the
  // Blog bar. Only when you've scrolled past the list's start (otherwise it's already in view),
  // and not on the page's first showing.
  const resultsRef = useRef<HTMLDivElement>(null)
  const firstShow = useRef(true)

  useEffect(() => {
    if (firstShow.current) {
      firstShow.current = false
      return
    }
    const results = resultsRef.current
    const bar = barRef.current
    if (!results || !bar) return
    // Where the bar sticks (under the navbar, or at the screen's top on phones), plus its height.
    const barBottom = (parseFloat(getComputedStyle(bar).top) || 0) + bar.offsetHeight
    const target = results.getBoundingClientRect().top + window.scrollY - barBottom - 12
    if (window.scrollY > target) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({ top: target, behavior: reduceMotion ? 'auto' : 'smooth' })
    }
  }, [category, query])

  // Changes one value in the address. replace: typing doesn't add a "back" step for every letter.
  function update(key: string, value: string, empty: string) {
    const next = new URLSearchParams(params)
    if (value && value !== empty) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const matches = filterUpdates(sortedUpdates, query, category)
  const filtered = matches.length !== sortedUpdates.length

  return (
    <section className="section">
      {/* Goes back to the home page and scrolls to the Blog section. */}
      <Link to="/#blog" className="back-link">
        <span aria-hidden="true">←</span> Back to home
      </Link>

      {/* A banner, so the page looks like its own place and not like a section of the home page:
          the title on the left, a mosaic of recent post photos on the right (one big, two small). */}
      <header className="blog-hero">
        <div className="blog-hero__text">
          <p className="eyebrow">The blog</p>
          <h1>
            Notes, ideas <span className="blog-hero__amp">&</span> <span className="blog-hero__accent">milestones</span>
          </h1>
          <p>Lessons from real work, how I think about software, and the moments along the way.</p>
        </div>

        {/* Each photo opens its post. Full-size photos here: the small thumbnails look blurry this big. */}
        {bannerPhotos.length > 0 && (
          <div className={`blog-hero__mosaic blog-hero__mosaic--${bannerPhotos.length}`}>
            {bannerPhotos.map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`} className="blog-hero__tile" aria-label={post.title}>
                <img src={asset(post.images[0])} alt="" decoding="async" />
                <span className="blog-hero__caption">{post.title}</span>
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Sticks under the navbar while you scroll, so it's always clear you're on the Blog page.
          It holds the page name, how many posts are shown, the search and the categories. */}
      <div className={stuck ? 'blog-bar blog-bar--stuck' : 'blog-bar'} ref={barRef}>
        <p className="blog-bar__title">
          <span className="blog-bar__dot" aria-hidden="true" />
          Blog
          <span className="blog-bar__count">
            {filtered ? `${matches.length} of ${sortedUpdates.length} posts` : `${sortedUpdates.length} posts`}
          </span>
          {/* Always in reach while scrolling: the way back to the home page. */}
          <Link to="/#blog" className="blog-bar__home">
            <span aria-hidden="true">←</span> Home
          </Link>
        </p>
        <BlogFilters
          query={query}
          category={category}
          onQueryChange={(value) => update('q', value, '')}
          onCategoryChange={(value) => update('category', value, 'All')}
        />
      </div>

      <div ref={resultsRef}>
        {matches.length > 0 ? (
          <UpdateTimeline updates={matches} />
        ) : (
          <div className="blog-empty">
            <p>No posts match your search.</p>
            <button type="button" className="button button-outline" onClick={() => setParams({}, { replace: true })}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default UpdatesPage
