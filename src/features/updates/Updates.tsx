// The "Blog" section on the home page: a preview of the newest posts,
// with a button that opens the full Blog page.

import { Link } from 'react-router'
import { sortedUpdates } from '../../data/updates.ts'
import UpdateTimeline from './UpdateTimeline.tsx'

// How many posts to preview on the home page.
const PREVIEW_COUNT = 2

function Updates() {
  return (
    <section id="blog" className="section">
      <div className="section-header">
        <h1>Blog</h1>
        <Link to="/blog" className="forward-link">
          See all <span aria-hidden="true">→</span>
        </Link>
      </div>
      <p className="page-intro">News, thoughts and things I've been working on.</p>

      {/* .slice(0, 2) takes only the first 2 items (the newest ones). */}
      <UpdateTimeline updates={sortedUpdates.slice(0, PREVIEW_COUNT)} />

      <div className="updates-footer">
        <Link to="/blog" className="button">
          View all posts ({sortedUpdates.length})
        </Link>
      </div>
    </section>
  )
}

export default Updates
