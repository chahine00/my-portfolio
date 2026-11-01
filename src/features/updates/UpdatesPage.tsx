// The Blog page: its own page at /blog, showing every post, with a search box and category buttons.
// The home page only shows a preview (see Updates.tsx).
// The search and the category live in the address (/blog?q=aws&category=Engineering),
// so a filtered list can be shared, and the home page can open the page already filtered.

import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router'
import { filterUpdates, sortedUpdates } from '../../data/updates.ts'
import BlogFilters from './BlogFilters.tsx'
import UpdateTimeline from './UpdateTimeline.tsx'

function UpdatesPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const category = params.get('category') ?? 'All'

  // A new page should start at the top, not wherever the previous page was scrolled to.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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

      <h1>Blog</h1>
      <p className="page-intro">
        {filtered
          ? `${matches.length} of ${sortedUpdates.length} posts match, newest first.`
          : `Everything I've shared so far — ${sortedUpdates.length} posts, newest first.`}
      </p>

      <BlogFilters
        query={query}
        category={category}
        onQueryChange={(value) => update('q', value, '')}
        onCategoryChange={(value) => update('category', value, 'All')}
      />

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
    </section>
  )
}

export default UpdatesPage
