// The "Projects" section: shows one card per project.

// Import the data (the list of projects) and the component that draws ONE project.
import { projects } from '../../data/projects.ts'
import ProjectCard from './ProjectCard.tsx'
import SectionTitle from '../../components/SectionTitle.tsx'

function Projects() {
  return (
    <section id="projects" className="section">
      <SectionTitle label="Projects" title="Things I've" accent="built" />
      <div className="grid">
        {/*
          For each project in the list, render a <ProjectCard />.
          project={project} passes the data INTO the card. This is called a "prop".
          Props are how a parent component gives information to a child component.
        */}
        {/* "slideOffset" spreads the cards' photo slides over time, so they don't all move at once. */}
        {projects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} slideOffset={i / projects.length} />
        ))}
      </div>
    </section>
  )
}

export default Projects
