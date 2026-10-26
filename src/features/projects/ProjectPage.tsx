// The page for ONE project (a "case study"), at /projects/<slug>.
// Every part below only appears if that project has the data for it.

import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { projects } from '../../data/projects.ts'
import Gallery from '../../components/Gallery.tsx'

function ProjectPage() {
  // useParams reads the ":slug" part of the URL (see the <Route> in App.tsx).
  const { slug } = useParams()
  const index = projects.findIndex((project) => project.slug === slug)
  const project = projects[index]

  // Start at the top whenever you open a project (including via Previous/Next links).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!project) {
    return (
      <section className="section">
        <h1>Project not found</h1>
        <p>This project doesn't exist or was removed.</p>
        <Link to="/#projects">← Back to projects</Link>
      </section>
    )
  }

  const previous = projects[index - 1]
  const next = projects[index + 1]

  // The small facts shown under the title. Only the ones this project has.
  const facts = [
    { label: 'Role', value: project.role },
    { label: 'When', value: project.period },
    { label: 'Team', value: project.team },
    { label: 'Status', value: project.status },
  ].filter((fact) => fact.value)

  // Split the overview into paragraphs wherever there's an empty line.
  const paragraphs = project.overview ? project.overview.split(/\n\s*\n/) : []

  return (
    <article className="section project-page">
      {/* Goes back to the home page and scrolls to the Projects section. */}
      <Link to="/#projects">← All projects</Link>

      <header className="project-page__header">
        {project.context && <p className="eyebrow">{project.context}</p>}
        <h1>{project.title}</h1>
        <p className="project-page__lead">{project.problem}</p>

        {facts.length > 0 && (
          <dl className="project-facts">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {(project.liveUrl || project.githubUrl) && (
          <div className="project-page__links">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="button">
                Live demo
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noreferrer" className="button button-outline">
                View code
              </a>
            )}
          </div>
        )}
      </header>

      {/* key={project.slug} gives each project a fresh gallery, starting at photo 1. */}
      {project.images && project.images.length > 0 && (
        <Gallery key={project.slug} images={project.images} title={project.title} />
      )}

      {project.metrics && (
        <ul className="metrics">
          {project.metrics.map((metric) => (
            <li key={metric.label} className="card">
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </li>
          ))}
        </ul>
      )}

      {project.result && <p className="project-card__result project-page__result">{project.result}</p>}

      {paragraphs.length > 0 && (
        <section className="project-page__block">
          <h2>Overview</h2>
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </section>
      )}

      {project.built && (
        <section className="project-page__block">
          <h2>What I built</h2>
          <ul className="check-list">
            {project.built.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
      )}

      {project.features && (
        <section className="project-page__block">
          <h2>Key features</h2>
          <ul className="check-list">
            {project.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>
      )}

      {project.challenges && (
        <section className="project-page__block">
          <h2>Challenges &amp; solutions</h2>
          <div className="challenges">
            {project.challenges.map((item) => (
              <div className="card" key={item.challenge}>
                <p>
                  <strong>Challenge:</strong> {item.challenge}
                </p>
                <p>
                  <strong>Solution:</strong> {item.solution}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {project.learnings && (
        <section className="project-page__block">
          <h2>What I learned</h2>
          <ul className="check-list">
            {project.learnings.map((learning) => (
              <li key={learning}>{learning}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="project-page__block">
        <h2>Tech stack</h2>
        <ul className="tags">
          {project.tech.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
      </section>

      {project.note && <p className="project-page__note">{project.note}</p>}

      <nav className="post__nav" aria-label="More projects">
        {previous ? (
          <Link to={`/projects/${previous.slug}`}>
            <span>← Previous project</span>
            {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/projects/${next.slug}`} className="post__nav-newer">
            <span>Next project →</span>
            {next.title}
          </Link>
        )}
      </nav>
    </article>
  )
}

export default ProjectPage
