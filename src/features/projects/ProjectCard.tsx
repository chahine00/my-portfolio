// One project card in the home page's "Selected work" grid. The whole card is one link to the
// project's page (ProjectPage.tsx). The first card is "featured": full width, bigger picture and title.

import { Link } from 'react-router'
import type { Project } from '../../data/projects.ts'
import { asset, fallbackTo, thumb } from '../../utils/asset.ts'
import Icon from '../../components/Icon.tsx'

function ProjectCard({ project, featured }: { project: Project; featured: boolean }) {
  const cover = project.images?.[0]
  const tech = project.cardTech ?? project.tech.slice(0, 4)

  return (
    // data-project-slug: coming back from a project's page, the home page scrolls to its card.
    <article className={featured ? 'work-card work-card--feature' : 'work-card'} data-project-slug={project.slug}>
      <Link className="work-card-link" to={`/projects/${project.slug}`}>
        {cover && (
          <img
            className="work-image"
            src={featured ? asset(cover) : thumb(cover)}
            onError={fallbackTo(cover)}
            alt=""
            width={1600}
            height={900}
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="work-copy">
          {project.context && <p className="eyebrow">{project.context}</p>}
          <h3>{project.title}</h3>
          <p>{project.summary ?? project.problem}</p>
          {project.highlight && (
            <p className="work-highlight">
              <Icon name="spark" size={14} /> {project.highlight}
            </p>
          )}
          <ul className="inline-tech" aria-label="Technology">
            {tech.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <span className="case-link">
            View project <span aria-hidden="true">↗</span>
          </span>
        </div>
      </Link>
    </article>
  )
}

export default ProjectCard
