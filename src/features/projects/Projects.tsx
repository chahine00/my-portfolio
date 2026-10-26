// The "Projects" section: shows one card per project.

// Import the data (the list of projects) and the component that draws ONE project.
import { projects } from '../../data/projects.ts'
import ProjectCard from './ProjectCard.tsx'

function Projects() {
  return (
    <section id="projects" className="section">
      <h1>Projects</h1>
      <div className="grid">
        {/*
          For each project in the list, render a <ProjectCard />.
          project={project} passes the data INTO the card. This is called a "prop".
          Props are how a parent component gives information to a child component.
        */}
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  )
}

export default Projects
