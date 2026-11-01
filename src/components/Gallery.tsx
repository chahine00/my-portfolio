// A photo gallery, used by update posts and project pages: a big photo with arrows,
// a row of thumbnails, and a full-screen view when you click the big photo.
// With several photos it moves to the next one by itself every few seconds (see AUTOPLAY_MS).

import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { asset, fallbackTo, thumb } from '../utils/asset.ts'

// How long each photo stays before the gallery moves on by itself, in milliseconds.
const AUTOPLAY_MS = 3000

interface GalleryProps {
  images: string[]
  title: string // used to describe the photos for screen readers
}

function Gallery({ images, title }: GalleryProps) {
  // Which photo is shown (0 = the first one).
  const [index, setIndex] = useState(0)
  // <dialog> is a built-in HTML pop-up. The ref lets us open it with showModal().
  const dialogRef = useRef<HTMLDialogElement>(null)
  const thumbsRef = useRef<HTMLUListElement>(null)
  // The autoplay waits while the mouse is on the gallery (so you can look at a photo)
  // and while the full-screen view is open.
  const [hovered, setHovered] = useState(false)
  const [fullScreen, setFullScreen] = useState(false)
  // People who turn off animations in their system settings don't get the autoplay.
  const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  const count = images.length
  const hasMany = count > 1

  // Autoplay: show the next photo after AUTOPLAY_MS. "index" is in the list below, so every
  // change of photo (by itself, or with an arrow or a thumbnail) starts a fresh full wait.
  useEffect(() => {
    if (!hasMany || hovered || fullScreen || reduceMotion) return
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS)
    return () => window.clearTimeout(timer)
  }, [index, count, hasMany, hovered, fullScreen, reduceMotion])

  // Keeps the current thumbnail visible in its row (the row scrolls sideways when there are many).
  // Only the row scrolls, never the page, so the autoplay can't pull you back up to the gallery.
  useEffect(() => {
    const row = thumbsRef.current
    const active = row?.children[index] as HTMLElement | undefined
    if (!row || !active) return
    const left = active.offsetLeft - row.offsetLeft
    if (left < row.scrollLeft || left + active.offsetWidth > row.scrollLeft + row.clientWidth) {
      row.scrollTo({ left: left - (row.clientWidth - active.offsetWidth) / 2, behavior: reduceMotion ? 'auto' : 'smooth' })
    }
  }, [index, reduceMotion])

  function openFullScreen() {
    dialogRef.current?.showModal()
    setFullScreen(true)
  }

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
    <div
      className="gallery"
      onKeyDown={handleKeyDown}
      // Only a real mouse pauses it: a finger tap on a phone shouldn't stop it for good.
      onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div className="gallery__main">
        <button type="button" className="gallery__open" onClick={openFullScreen} aria-label="View full size">
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
        <ul className="gallery__thumbs" ref={thumbsRef}>
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                className={i === index ? 'is-active' : undefined}
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
              >
                <img src={thumb(src)} onError={fallbackTo(src)} alt="" loading="lazy" decoding="async" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Full-screen view. Esc closes it automatically; so does clicking the dark background. */}
      <dialog
        ref={dialogRef}
        className="lightbox"
        // Fires however it closes (the ✕, Esc, or a click on the background): the autoplay resumes.
        onClose={() => setFullScreen(false)}
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
