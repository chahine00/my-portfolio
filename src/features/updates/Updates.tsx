// The "Blog" section on the home page, kept small on purpose: the three newest posts as a compact
// list (date, title, category; no pictures), and a link to the full Blog page.

import { Link } from 'react-router'
import { formatDate, readingTime, sortedUpdates } from '../../data/updates.ts'
import SectionTitle from '../../components/SectionTitle.tsx'

// How many posts to list on the home page.
const PREVIEW_COUNT = 3

function Updates() {
  if (!sortedUpdates.length) return null

  return (
    <section id="blog" className="section blog-mini">
      <SectionTitle
        label="Blog"
        title="Latest"
        accent="notes"
        action={
          <Link to="/blog" className="forward-link">
            All posts ({sortedUpdates.length}) <span aria-hidden="true">→</span>
          </Link>
        }
      />
      <ul className="notes-list">
        {sortedUpdates.slice(0, PREVIEW_COUNT).map((post) => (
          <li key={post.slug}>
            <Link to={`/blog/${post.slug}`}>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span className="notes-list__title">{post.title}</span>
              <span className="notes-list__meta">
                {post.category} · {readingTime(post.content)} min
              </span>
              <span className="notes-list__arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Updates
