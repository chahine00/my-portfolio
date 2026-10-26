// The "Latest Updates" section on the home page: a preview of the newest posts,
// with a button that opens the full Updates page.

import { Link } from 'react-router'
import { sortedUpdates } from '../../data/updates.ts'
import UpdateTimeline from './UpdateTimeline.tsx'

// How many posts to preview on the home page.
const PREVIEW_COUNT = 3

function Updates() {
  return (
    <section id="updates" className="section">
      <div className="section-header">
        <h1>Latest Updates</h1>
        <Link to="/updates">See all →</Link>
      </div>
      <p className="page-intro">News, thoughts and things I've been working on.</p>

      {/* .slice(0, 3) takes only the first 3 items (the newest ones). */}
      <UpdateTimeline updates={sortedUpdates.slice(0, PREVIEW_COUNT)} />

      <div className="updates-footer">
        <Link to="/updates" className="button">
          View all updates ({sortedUpdates.length})
        </Link>
      </div>
    </section>
  )
}

export default Updates
