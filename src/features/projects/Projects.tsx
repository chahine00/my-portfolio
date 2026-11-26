// The "Selected work" section: every project in one grid, studio work first, then the founder's
// client work, then his work at previous employers. The first card is featured (full width).
// Each card's label (its "context", e.g. 'Client project') says who delivered it. Under the cards,
// one quiet line about who is behind the work, linking to the founder's page (/background).

import { Link } from 'react-router'
import { selectedProjects } from '../../data/projects.ts'
import { studio } from '../../data/studio.ts'
import { asset } from '../../utils/asset.ts'
import ProjectCard from './ProjectCard.tsx'
import { useReveal } from '../../utils/useReveal.ts'

function Projects() {
  // The cards fade in one after another as you scroll to them (see src/utils/useReveal.ts).
  const gridRef = useReveal<HTMLDivElement>('.work-card')
  if (!selectedProjects.length) return null

  return (
    <section id="projects" className="section work-section" aria-labelledby="work-title">
      <header className="work-heading">
        <div>
          <p className="eyebrow">Work</p>
          <h2 id="work-title">
            Selected <em>work.</em>
          </h2>
        </div>
      </header>
      <div className="work-grid" ref={gridRef}>
        {selectedProjects.map((project, index) => (
          <ProjectCard key={project.slug} project={project} featured={index === 0} />
        ))}
      </div>
      <p className="studio__founder work-founder">
        {studio.founderNote}{' '}
        <Link to="/background" className="founder-line">
          <img src={asset('/avatar.webp')} alt="" width={28} height={28} loading="lazy" />
          <span className="founder-line__more">{studio.founderLink} →</span>
        </Link>
      </p>
    </section>
  )
}

export default Projects
