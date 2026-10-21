// A REUSABLE component: it draws one project card.
// Projects.tsx uses it once for every project in the list.

// "import type" imports only a TypeScript type (it disappears when the app runs).
import type { Project } from '../../data/projects.ts'

// This describes the PROPS this component accepts.
// Here it's just one prop, called "project", of type Project.
interface ProjectCardProps {
  project: Project
}

// Props arrive as one object. { project } is "destructuring": it takes the
// "project" property out of that object so we can use it directly.
// It's the same as writing:  function ProjectCard(props: ProjectCardProps) { const project = props.project ... }
function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="card">
      <h3>{project.title}</h3>
      <p>{project.description}</p>

      <ul className="tags">
        {project.tech.map((tech) => (
          <li key={tech}>{tech}</li>
        ))}
      </ul>

      <div className="card__links">
        {/*
          CONDITIONAL RENDERING with &&:
          "if project.githubUrl has a value, show this link; otherwise show nothing".
          target="_blank" opens the link in a new tab.
        */}
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
