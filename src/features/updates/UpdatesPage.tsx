// The Blog page: its own page at /blog, showing every post, with a search box and category buttons.
// The home page only shows a preview (see Updates.tsx).
// The search and the category live in the address (/blog?q=aws&category=Engineering),
// so a filtered list can be shared, and the home page can open the page already filtered.

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigationType, useSearchParams } from 'react-router'
import { filterUpdates, sortedUpdates } from '../../data/updates.ts'
import { readListSpot, saveListSpot } from './listSpot.ts'
import BlogFilters from './BlogFilters.tsx'
import { useDocumentTitle } from '../../utils/useDocumentTitle.ts'
import UpdateTimeline from './UpdateTimeline.tsx'
import GradientText from '../../components/GradientText.tsx'

function UpdatesPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const category = params.get('category') ?? 'All'

  const location = useLocation()
  const navigationType = useNavigationType()
  useDocumentTitle('Blog')

  // Whether the Blog bar is stuck under the navbar right now. It changes the shape of the bar's
  // faded background (see .blog-bar--stuck in global.css).
  const barRef = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)

  // Where a post's card should land: just under the Blog bar.
  function cardTarget(card: Element) {
    const bar = barRef.current
    const barBottom = bar ? (parseFloat(getComputedStyle(bar).top) || 0) + bar.offsetHeight : 0
    return Math.max(0, card.getBoundingClientRect().top + window.scrollY - barBottom - 12)
  }

  // Where the page opens. Normally at the top. Coming back from a post (its Back button, or the
  // browser's back button), it opens where you left the list, or, if you moved on to other posts
  // with Older/Newer, at the card of the post you were reading.
  // How the page was opened, kept from its first showing.
  const [opening] = useState(() => ({
    returnTo: (location.state as { returnTo?: string } | null)?.returnTo,
    back: navigationType === 'POP',
    search: location.search,
  }))

  useLayoutEffect(() => {
    let top = 0
    const { returnTo, back, search } = opening
    if (returnTo || back) {
      const spot = readListSpot()
      const sameList = spot !== null && spot.search === search
      const card = returnTo ? document.querySelector(`[data-slug="${CSS.escape(returnTo)}"]`) : null
      // The saved spot still shows that card: use it, so the list looks just as you left it.
      const cardInView = (y: number) => {
        if (!card) return true
        const cardTop = card.getBoundingClientRect().top + window.scrollY - y
        return cardTop > 0 && cardTop < window.innerHeight - 80
      }
      if (sameList && cardInView(spot.y)) top = spot.y
      else if (card) top = cardTarget(card)
    }
    // 'instant': skip the smooth scrolling set in global.css, so the page doesn't glide there.
    window.scrollTo({ top, left: 0, behavior: 'instant' })
  }, [opening])

  // Remember where the list is scrolled to (and which search/category it shows), for coming back.
  // A layout effect, so it stops listening before the next page scrolls itself to the top.
  useLayoutEffect(() => {
    function remember() {
      saveListSpot({ search: window.location.search, y: window.scrollY })
    }
    window.addEventListener('scroll', remember, { passive: true })
    return () => window.removeEventListener('scroll', remember)
  }, [])

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
  // The search and category last shown. Compared instead of a "first time" flag, so it also
  // holds when React runs effects twice while developing.
  const shown = useRef(`${category}|${query}`)

  useEffect(() => {
    if (shown.current === `${category}|${query}`) return
    shown.current = `${category}|${query}`
    saveListSpot({ search: window.location.search, y: window.scrollY })
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
          the title on the left. The space on the right keeps the banner at its usual size. */}
      <header className="blog-hero">
        <div className="blog-hero__text">
          <p className="eyebrow">The blog</p>
          <h1>
            Notes, ideas <span className="blog-hero__amp">&</span> <span className="blog-hero__accent">
              <GradientText text="milestones" />
            </span>
          </h1>
          <p>Lessons from real work, how I think about software, and the moments along the way.</p>
        </div>

        <div className="blog-hero__space" aria-hidden="true" />
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
