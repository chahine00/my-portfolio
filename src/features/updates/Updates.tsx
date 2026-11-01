// The "Blog" section on the home page: a preview of the newest posts, a slim row of category
// links (each opens the Blog page showing only that category), and a button that opens the
// full Blog page. Searching and filtering happen on the Blog page itself.

import { Link } from 'react-router'
import { categories, sortedUpdates } from '../../data/updates.ts'
import UpdateTimeline from './UpdateTimeline.tsx'

// How many posts to preview on the home page.
const PREVIEW_COUNT = 3

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

      <nav className="blog-topics" aria-label="Blog categories">
        <span>Browse:</span>
        {categories.map((category) => (
          <Link key={category} to={`/blog?category=${encodeURIComponent(category)}`}>
            {category}
          </Link>
        ))}
      </nav>

      {/* .slice(0, 3) takes only the first 3 items (the newest ones). */}
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
