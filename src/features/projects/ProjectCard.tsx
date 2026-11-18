// A REUSABLE component: it draws one project card on the home page.
// The card is a short preview; clicking ANYWHERE on it opens the full page (ProjectPage.tsx).
// The title link is stretched over the whole card with CSS (see .card-link in global.css).
// GitHub / Live demo sit on top of it, so they still open their own links.
// A project with several photos shows them as a banner that slides to the next one by itself,
// and that visitors can swipe, drag or move with its arrows and dots.

import { useEffect, useRef, useState, type PointerEvent, type WheelEvent } from 'react'
import { Link, useNavigate } from 'react-router'
// "import type" imports only a TypeScript type (it disappears when the app runs).
import type { Project } from '../../data/projects.ts'
import { fallbackTo, thumb } from '../../utils/asset.ts'
import Icon from '../../components/Icon.tsx'

// This describes the PROPS this component accepts.
// Here it's just one prop, called "project", of type Project.
interface ProjectCardProps {
  project: Project
  // When this card's photos slide, as a share of SLIDE_EVERY (0 to 1). Each card gets a different
  // one, so the cards take turns instead of all sliding at the same moment.
  slideOffset?: number
}

// How long each photo stays before the banner slides to the next one (in milliseconds).
const SLIDE_EVERY = 2000

// The photo(s) at the top of the card. With one photo it's a still cover; with several,
// they sit side by side in a strip that moves left one photo at a time, then starts again.
// Visitors can move it too: swipe or drag it, use the arrows (they show on hover), click a dot,
// or scroll sideways on a trackpad. After that, it waits a full round before sliding by itself.
// A plain click (no drag) on a photo still opens the project, like the rest of the card.
function CoverBanner({ images, slideOffset = 0, pageUrl }: { images: string[]; slideOffset?: number; pageUrl: string }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  // Goes up each time the visitor moves the banner: that restarts the timer below.
  const [nudged, setNudged] = useState(0)
  // How far the strip is being dragged right now, in pixels (null when it isn't).
  const [drag, setDrag] = useState<number | null>(null)
  const coverRef = useRef<HTMLDivElement>(null)
  const pointer = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null)
  const wheelAt = useRef(0)
  const navigate = useNavigate()
  const many = images.length > 1

  const go = (to: number) => {
    setIndex((to + images.length) % images.length)
    setNudged((n) => n + 1)
  }

  useEffect(() => {
    const cover = coverRef.current
    if (!cover || images.length < 2) return
    // People who turn off animations keep a still cover.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let delay: number | undefined
    let timer: number | undefined
    const next = () => setIndex((current) => (current + 1) % images.length)
    function stop() {
      window.clearTimeout(delay)
      window.clearInterval(timer)
    }

    // Only slide while the card is on screen, so off-screen cards don't keep working.
    // The first slide waits a little longer on each card (its slideOffset); after that it slides
    // every SLIDE_EVERY. That keeps the cards out of step, so each one moves on its own.
    // Right after the visitor moved it, it waits twice as long.
    const observer = new IntersectionObserver(([entry]) => {
      stop()
      if (entry.isIntersecting && !paused) {
        delay = window.setTimeout(
          () => {
            next()
            timer = window.setInterval(next, SLIDE_EVERY)
          },
          nudged ? SLIDE_EVERY * 2 : SLIDE_EVERY * (1 + slideOffset),
        )
      }
    })
    observer.observe(cover)

    return () => {
      observer.disconnect()
      stop()
    }
  }, [images.length, paused, slideOffset, nudged])

  // Swipe / drag. Up-and-down movement is left to the page (touch-action: pan-y in global.css),
  // so scrolling the page over a card still works.
  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0 || (e.target as HTMLElement).closest('button')) return
    pointer.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false }
  }

  function onPointerMove(e: PointerEvent) {
    const p = pointer.current
    if (!p || p.id !== e.pointerId || !many) return
    const dx = e.clientX - p.x
    if (!p.moved && Math.abs(dx) < 6) return
    if (!p.moved) {
      // Sideways enough to be a swipe: follow it.
      if (Math.abs(e.clientY - p.y) > Math.abs(dx)) {
        pointer.current = null
        return
      }
      p.moved = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    setDrag(dx)
  }

  function onPointerUp(e: PointerEvent) {
    const p = pointer.current
    pointer.current = null
    if (!p || p.id !== e.pointerId) return
    if (!p.moved) {
      // A plain click: open the project, like anywhere else on the card (ctrl/cmd: in a new tab).
      if (e.metaKey || e.ctrlKey) window.open(coverRef.current?.closest('.project-card')?.querySelector<HTMLAnchorElement>('.card-link')?.href ?? pageUrl, '_blank')
      else navigate(pageUrl)
      return
    }
    const width = coverRef.current?.offsetWidth ?? 1
    const dx = e.clientX - p.x
    setDrag(null)
    if (Math.abs(dx) > width * 0.15) go(index + (dx < 0 ? 1 : -1))
  }

  function onPointerCancel() {
    pointer.current = null
    setDrag(null)
  }

  // Sideways scrolling on a trackpad (or shift + wheel): one photo per gesture.
  function onWheel(e: WheelEvent) {
    if (!many || Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 8) return
    const now = Date.now()
    if (now - wheelAt.current < 500) return
    wheelAt.current = now
    go(index + (e.deltaX > 0 ? 1 : -1))
  }

  // translateX moves the whole strip: photo 2 is at -100%, photo 3 at -200%…, plus the drag.
  const offset = drag === null ? `-${index * 100}%` : `calc(-${index * 100}% + ${drag}px)`

  return (
    // Hovering the card pauses the banner, so visitors can look at a photo.
    <div
      className={`project-card__cover${many ? ' project-card__cover--many' : ''}`}
      ref={coverRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onWheel={onWheel}
    >
      <div
        className={`cover-banner${drag !== null ? ' is-dragging' : ''}`}
        style={{ transform: `translateX(${offset})` }}
      >
        {/* Each photo is shown whole (never cropped), so wide screenshots and tall phone
            screenshots both fit. The space around it is filled with a blurred copy of the same photo. */}
        {images.map((src, i) => (
          <div className="cover-slide" key={src}>
            <img
              className="cover-slide__bg"
              src={thumb(src)}
              onError={fallbackTo(src)}
              alt=""
              aria-hidden="true"
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
            />
            <img
              className="cover-slide__img"
              src={thumb(src)}
              onError={fallbackTo(src)}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {many && (
        <>
          <button
            type="button"
            className="cover-banner__arrow cover-banner__arrow--prev"
            aria-label="Previous photo"
            onClick={() => go(index - 1)}
          >
            <Icon name="arrow-right" size={16} />
          </button>
          <button
            type="button"
            className="cover-banner__arrow cover-banner__arrow--next"
            aria-label="Next photo"
            onClick={() => go(index + 1)}
          >
            <Icon name="arrow-right" size={16} />
          </button>

          {/* The dots show which photo is on screen; clicking one goes to that photo. */}
          <div className="cover-banner__dots">
            {images.map((src, i) => (
              <button
                type="button"
                key={src}
                className={i === index ? 'is-active' : undefined}
                aria-label={`Photo ${i + 1} of ${images.length}`}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Props arrive as one object. { project } is "destructuring": it takes the
// "project" property out of that object so we can use it directly.
function ProjectCard({ project, slideOffset }: ProjectCardProps) {
  const pageUrl = `/projects/${project.slug}`

  // Role and period on one line, e.g. "Solo developer · 2026". .filter(Boolean) drops missing ones.
  const meta = [project.role, project.period].filter(Boolean).join(' · ')

  return (
    <article className="card project-card card-clickable">
      {/* ?. means "only if there are images"; an empty list shows no cover. */}
      {project.images?.length ? <CoverBanner images={project.images} slideOffset={slideOffset} pageUrl={pageUrl} /> : null}

      <h3>
        <Link to={pageUrl} className="project-card__title card-link">
          {project.title}
        </Link>
      </h3>
      {meta && <p className="project-card__role">{meta}</p>}

      <p>{project.problem}</p>

      {/* The result gets its own highlighted box: it's what recruiters remember. */}
      {project.result && <p className="project-card__result">{project.result}</p>}

      <ul className="tags">
        {project.tech.map((tech) => (
          <li key={tech}>{tech}</li>
        ))}
      </ul>

      {/* Two separate pill buttons: "View project" (filled) and the outside links (outlined). */}
      <div className="card__links">
        {/* Looks like a button, but the whole card is the link. */}
        <span className="card-pill card-pill--primary" aria-hidden="true">
          View project <Icon name="arrow-right" size={16} />
        </span>
        {/* target="_blank" opens the link in a new tab. */}
        {project.githubUrl && (
          <a className="card-pill" href={project.githubUrl} target="_blank" rel="noreferrer">
            <Icon name="github" size={15} /> GitHub
          </a>
        )}
        {project.liveUrl && (
          <a className="card-pill" href={project.liveUrl} target="_blank" rel="noreferrer">
            {project.liveLabel ?? 'Live demo'} <Icon name="external" size={15} />
          </a>
        )}
      </div>
    </article>
  )
}

export default ProjectCard
