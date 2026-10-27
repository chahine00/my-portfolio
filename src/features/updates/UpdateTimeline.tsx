// A REUSABLE timeline of posts. The home page shows the newest few,
// and the Blog page shows all of them, using this same component.
// Each card links to the post's own page (/blog/<slug>).
// Posts appear one by one as you scroll down to them (see src/utils/useReveal.ts).
// The WHOLE card is clickable: the title link is stretched over the card with CSS
// (see .card-link in global.css), so there's still just one real link per card.

import { Link } from 'react-router'
import { formatDate, isRecent } from '../../data/updates.ts'
import type { Update } from '../../data/updates.ts'
import { fallbackTo, thumb } from '../../utils/asset.ts'
import { useReveal } from '../../utils/useReveal.ts'

interface UpdateTimelineProps {
  updates: Update[]
}

// How many small photos a card shows. Extra photos become a "+N" on the last one.
const MAX_THUMBS = 3

function UpdateTimeline({ updates }: UpdateTimelineProps) {
  const listRef = useReveal<HTMLOListElement>()

  return (
    <ol className="timeline timeline--reveal timeline--posts" ref={listRef}>
      {updates.map((update) => {
        const postUrl = `/blog/${update.slug}`
        const hiddenCount = update.images.length - MAX_THUMBS

        return (
          <li className="timeline__item" key={update.slug}>
            <article className="card update-card card-clickable">
              <div className="update-card__meta">
                {/* <time> tells browsers and search engines that this text is a date. */}
                <time dateTime={update.date}>{formatDate(update.date)}</time>
                {isRecent(update.date) && <span className="badge-new">New</span>}
              </div>

              <h3>
                <Link to={postUrl} className="update-card__title card-link">
                  {update.title}
                </Link>
              </h3>
              <p>{update.summary}</p>

              {/* Small square previews of the photos. */}
              {update.images.length > 0 && (
                <div className="update-thumbs">
                  {update.images.slice(0, MAX_THUMBS).map((src, index) => (
                    <span className="update-thumbs__item" key={src}>
                      <img src={thumb(src)} onError={fallbackTo(src)} alt="" loading="lazy" decoding="async" />
                      {index === MAX_THUMBS - 1 && hiddenCount > 0 && (
                        <span className="update-thumbs__more">+{hiddenCount}</span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {update.tags && (
                <ul className="tags">
                  {update.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              )}

              {/* Looks like a link, but the whole card is the link. */}
              <span className="card-cta" aria-hidden="true">
                Read more <span>→</span>
              </span>
            </article>
          </li>
        )
      })}
    </ol>
  )
}

export default UpdateTimeline
