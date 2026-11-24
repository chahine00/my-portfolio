// The "Work" section: the projects in groups, so it's always clear who delivered what:
// Studio Work (under Axihex), Founder-led Projects (the founder's own client work), and the
// Founder's Experience (work at previous employers). Empty groups are left out.

import { projectCategories, projects } from '../../data/projects.ts'
import ProjectCard from './ProjectCard.tsx'
import SectionTitle from '../../components/SectionTitle.tsx'
import { useReveal } from '../../utils/useReveal.ts'

function Projects() {
  // The cards fade in one after another as you scroll to them (see src/utils/useReveal.ts).
  const groupsRef = useReveal<HTMLDivElement>('.project-card')

  const groups = projectCategories
    .map((category) => ({ ...category, items: projects.filter((project) => project.category === category.id) }))
    .filter((group) => group.items.length > 0)

  return (
    <section id="projects" className="section">
      <SectionTitle label="Selected Work" title="Engineering in" accent="practice" />
      {/* Attributed honestly: who delivered what (studio, the founder's clients, previous employers). */}
      <p className="page-intro">Real work, attributed honestly: studio projects, client work, and the founder's experience.</p>
      <div className="work-groups" ref={groupsRef}>
        {groups.map((group) => (
          <div key={group.id} className="work-group">
            <header className="work-group__head">
              <h3>{group.title}</h3>
              <p>{group.intro}</p>
            </header>
            {/* A group with a single project: the card on the left and a short line on the right,
                so the row is balanced on wide screens instead of half empty. */}
            <div className={group.items.length === 1 && group.aside ? 'grid work-group__solo' : 'grid'}>
              {/* "slideOffset" spreads the cards' photo slides over time, so they don't all move at once. */}
              {group.items.map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  slideOffset={projects.indexOf(project) / projects.length}
                />
              ))}
              {group.items.length === 1 && group.aside && <p className="work-group__aside">{group.aside}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Projects
