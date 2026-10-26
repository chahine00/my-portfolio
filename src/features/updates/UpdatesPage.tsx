// The Updates page: its own page at /updates, showing every post.
// The home page only shows a preview (see Updates.tsx).

import { useEffect } from 'react'
import { Link } from 'react-router'
import { sortedUpdates } from '../../data/updates.ts'
import UpdateTimeline from './UpdateTimeline.tsx'

function UpdatesPage() {
  // A new page should start at the top, not wherever the previous page was scrolled to.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <section className="section">
      {/* Goes back to the home page and scrolls to the Updates section. */}
      <Link to="/#updates">← Back to home</Link>

      <h1>All Updates</h1>
      <p className="page-intro">
        Everything I've shared so far — {sortedUpdates.length} posts, newest first.
      </p>

      <UpdateTimeline updates={sortedUpdates} />
    </section>
  )
}

export default UpdatesPage
