// A photo gallery, used by update posts and project pages: a big photo with arrows,
// a row of thumbnails, and a full-screen view when you click the big photo.

import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { asset } from '../utils/asset.ts'

interface GalleryProps {
  images: string[]
  title: string // used to describe the photos for screen readers
}

function Gallery({ images, title }: GalleryProps) {
  // Which photo is shown (0 = the first one).
  const [index, setIndex] = useState(0)
  // <dialog> is a built-in HTML pop-up. The ref lets us open it with showModal().
  const dialogRef = useRef<HTMLDialogElement>(null)

  const count = images.length
  const hasMany = count > 1

  // Go to photo i. The % (remainder) makes it wrap around: after the last comes the first.
  function show(i: number) {
    setIndex((i + count) % count)
  }

  // Left/right arrow keys switch photos.
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') show(index - 1)
    if (event.key === 'ArrowRight') show(index + 1)
  }

  const alt = `${title} — photo ${index + 1} of ${count}`

  // Previous / next buttons, used both in the gallery and in the full-screen view.
  const arrows = hasMany && (
    <>
      <button type="button" className="gallery__arrow gallery__arrow--prev" onClick={() => show(index - 1)} aria-label="Previous photo">
        ‹
      </button>
      <button type="button" className="gallery__arrow gallery__arrow--next" onClick={() => show(index + 1)} aria-label="Next photo">
        ›
      </button>
    </>
  )

  return (
    <div className="gallery" onKeyDown={handleKeyDown}>
      <div className="gallery__main">
        <button type="button" className="gallery__open" onClick={() => dialogRef.current?.showModal()} aria-label="View full size">
          <img src={asset(images[index])} alt={alt} />
        </button>
        {arrows}
        {hasMany && (
          <span className="gallery__counter">
            {index + 1} / {count}
          </span>
        )}
      </div>

      {hasMany && (
        <ul className="gallery__thumbs">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                className={i === index ? 'is-active' : undefined}
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
              >
                <img src={asset(src)} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Full-screen view. Esc closes it automatically; so does clicking the dark background. */}
      <dialog
        ref={dialogRef}
        className="lightbox"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close()
        }}
      >
        <img src={asset(images[index])} alt={alt} />
        {arrows}
        <button type="button" className="lightbox__close" onClick={() => dialogRef.current?.close()} aria-label="Close">
          ✕
        </button>
      </dialog>
    </div>
  )
}

export default Gallery
