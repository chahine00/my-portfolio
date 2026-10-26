// A REUSABLE component: it draws one project card on the home page.
// The card is a short preview; clicking ANYWHERE on it opens the full page (ProjectPage.tsx).
// The title link is stretched over the whole card with CSS (see .card-link in global.css).
// GitHub / Live demo sit on top of it, so they still open their own links.

import { Link } from 'react-router'
// "import type" imports only a TypeScript type (it disappears when the app runs).
import type { Project } from '../../data/projects.ts'
import { asset } from '../../utils/asset.ts'

// This describes the PROPS this component accepts.
// Here it's just one prop, called "project", of type Project.
interface ProjectCardProps {
  project: Project
}

// Props arrive as one object. { project } is "destructuring": it takes the
// "project" property out of that object so we can use it directly.
function ProjectCard({ project }: ProjectCardProps) {
  const pageUrl = `/projects/${project.slug}`
  const cover = project.images?.[0] // ?.[0] = "the first image, if there are any images"

  // Role and period on one line, e.g. "Solo developer · 2026". .filter(Boolean) drops missing ones.
  const meta = [project.role, project.period].filter(Boolean).join(' · ')

  return (
    <article className="card project-card card-clickable">
      {cover && (
        <div className="project-card__cover">
          <img src={asset(cover)} alt="" loading="lazy" />
        </div>
      )}

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
