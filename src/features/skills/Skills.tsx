// The "Skills" section: a SHORT core stack, not everything you've ever used.
// Keep it focused (about 4 groups, 15–20 skills). The projects are where you prove them.
// Put the groups in the order that matches the jobs you want: the most important first.
//
// The frame looks like a small "control screen". When it scrolls into view, a scan line sweeps
// down once and the rows boot up one after another (the animation is in global.css).

import type { CSSProperties } from 'react'
import { useReveal } from '../../utils/useReveal.ts'

const coreStack = [
  {
    category: 'Backend',
    skills: ['Python', 'FastAPI', 'Flask', 'REST APIs', 'JWT / OAuth2', 'Node.js', 'C# / ASP.NET Core'],
  },
  {
    category: 'AI Integration',
    skills: ['LLMs', 'RAG Pipelines', 'Milvus', 'Prompt Engineering', 'AI Agents'],
  },
  {
    category: 'Data & Cloud',
    skills: ['SQL (MySQL)', 'Docker', 'AWS', 'Nginx', 'CI/CD'],
  },
  {
    category: 'Mobile',
    skills: ['React Native'],
  },
]

function Skills() {
  // Adds "is-visible" to the frame once it's on screen, which starts the animation.
  const sectionRef = useReveal<HTMLElement>('.stack')

  return (
    <section id="skills" className="section" ref={sectionRef}>
      <h1>Core Stack</h1>

      {/* One frame, one row per group: the group name on the left, its skills on the right. */}
      <div className="card stack stack--screen">
        <span className="stack__scan" aria-hidden="true" />
        <p className="stack__head" aria-hidden="true">
          <span className="stack__dot" /> ali.stack <span className="stack__count">[{coreStack.length}]</span>
        </p>
        {coreStack.map((group, i) => (
          // --i: its position, so the rows boot up one after another.
          <div className="stack__row" key={group.category} style={{ '--i': i } as CSSProperties}>
            <h3>{group.category}</h3>
            <ul className="tags">
              {group.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Skills
