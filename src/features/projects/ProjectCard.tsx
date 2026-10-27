// A REUSABLE component: it draws one project card on the home page.
// The card is a short preview; clicking ANYWHERE on it opens the full page (ProjectPage.tsx).
// The title link is stretched over the whole card with CSS (see .card-link in global.css).
// GitHub / Live demo sit on top of it, so they still open their own links.
// A project with several photos shows them as a banner that slides to the next one by itself.

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
// "import type" imports only a TypeScript type (it disappears when the app runs).
import type { Project } from '../../data/projects.ts'
import { fallbackTo, thumb } from '../../utils/asset.ts'

// This describes the PROPS this component accepts.
// Here it's just one prop, called "project", of type Project.
interface ProjectCardProps {
  project: Project
}

// How long each photo stays before the banner slides to the next one (in milliseconds).
const SLIDE_EVERY = 3500

// The photo(s) at the top of the card. With one photo it's a still cover; with several,
// they sit side by side in a strip that moves left one photo at a time, then starts again.
function CoverBanner({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const coverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cover = coverRef.current
    if (!cover || images.length < 2) return
    // People who turn off animations keep a still cover.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let timer: number | undefined
    // Only slide while the card is on screen, so off-screen cards don't keep working.
    const observer = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer)
      timer = undefined
      if (entry.isIntersecting && !paused) {
        timer = window.setInterval(() => setIndex((current) => (current + 1) % images.length), SLIDE_EVERY)
      }
    })
    observer.observe(cover)

    return () => {
      observer.disconnect()
      window.clearInterval(timer)
    }
  }, [images.length, paused])

  return (
    // Hovering the card pauses the banner, so visitors can look at a photo.
    <div
      className="project-card__cover"
      ref={coverRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* translateX moves the whole strip: photo 2 is at -100%, photo 3 at -200%… */}
      <div className="cover-banner" style={{ transform: `translateX(-${index * 100}%)` }}>
        {images.map((src, i) => (
          <img
            key={src}
            src={thumb(src)}
            onError={fallbackTo(src)}
            alt=""
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
      </div>

      {/* Small dots show which photo is on screen. */}
      {images.length > 1 && (
        <div className="cover-banner__dots" aria-hidden="true">
          {images.map((src, i) => (
            <span key={src} className={i === index ? 'is-active' : undefined} />
          ))}
        </div>
      )}
    </div>
  )
}

// Props arrive as one object. { project } is "destructuring": it takes the
// "project" property out of that object so we can use it directly.
function ProjectCard({ project }: ProjectCardProps) {
  const pageUrl = `/projects/${project.slug}`

  // Role and period on one line, e.g. "Solo developer · 2026". .filter(Boolean) drops missing ones.
  const meta = [project.role, project.period].filter(Boolean).join(' · ')

  return (
    <article className="card project-card card-clickable">
      {/* ?. means "only if there are images"; an empty list shows no cover. */}
      {project.images?.length ? <CoverBanner images={project.images} /> : null}

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

      <div className="card__links">
        {/* Looks like a link, but the whole card is the link. */}
        <span className="card-cta" aria-hidden="true">
          View project <span>→</span>
        </span>
        {/* target="_blank" opens the link in a new tab. */}
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noreferrer">
            GitHub
          </a>
        )}
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noreferrer">
            Live demo
          </a>
        )}
      </div>
    </article>
  )
}

export default ProjectCard
