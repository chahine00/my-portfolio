// The newest posts on the home page, laid out like a magazine instead of a timeline
// (so the Blog section doesn't look like the Experience section):
// the newest post is a big "featured" card with a large photo, the next ones are smaller photo cards beside it.
// The cards animate in every time you scroll down to them (useReveal's "repeat").
// The WHOLE card is clickable: the title link is stretched over the card (see .card-link in global.css).

import { Link } from 'react-router'
import { formatDate, isRecent, readingTime } from '../../data/updates.ts'
import type { Update } from '../../data/updates.ts'
import { asset } from '../../utils/asset.ts'
import { useReveal } from '../../utils/useReveal.ts'

interface BlogPreviewProps {
  updates: Update[]
}

function BlogPreview({ updates }: BlogPreviewProps) {
  const listRef = useReveal<HTMLDivElement>('.blog-preview__item', updates.map((update) => update.slug).join(), true)

  return (
    <div className="blog-preview" ref={listRef}>
      {updates.map((update, index) => {
        const featured = index === 0
        const cover = update.images[0]

        return (
          <article
            key={update.slug}
            className={`blog-preview__item card-clickable${featured ? ' blog-preview__item--featured' : ''}`}
          >
            {/* The cover photo. Posts without photos get a colored panel with the category name. */}
            <div className="blog-preview__cover">
              {cover ? (
                <img src={asset(cover)} alt="" loading="lazy" decoding="async" />
              ) : (
                <span className="blog-preview__placeholder" aria-hidden="true">
                  {update.category}
                </span>
              )}
              <span className="blog-preview__category">{update.category}</span>
              {isRecent(update.date) && <span className="badge-new blog-preview__new">New</span>}
            </div>

            <div className="blog-preview__body">
              <p className="blog-preview__meta">
                <time dateTime={update.date}>{formatDate(update.date)}</time>
                <span aria-hidden="true">·</span>
                <span>{readingTime(update.content)} min read</span>
              </p>
              <h3>
                <Link to={`/blog/${update.slug}`} className="card-link">
                  {update.title}
                </Link>
              </h3>
              {/* Only the featured card has room for the summary. */}
              {featured && <p className="blog-preview__summary">{update.summary}</p>}
              <span className="card-cta" aria-hidden="true">
                Read more <span>→</span>
              </span>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default BlogPreview
