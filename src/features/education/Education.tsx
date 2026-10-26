// The "Education" section: degrees and bootcamps side by side, languages underneath.
// The data comes from src/data/education.ts.

import { certificates, degrees, languages } from '../../data/education.ts'
import type { EducationItem } from '../../data/education.ts'

// One card with a list of items. Used twice: for degrees and for bootcamps.
function EducationCard({ title, items }: { title: string; items: EducationItem[] }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <ul className="edu-list">
        {items.map((item) => (
          <li key={item.title}>
            <strong>{item.title}</strong>
            <span>
              {item.place} · {item.year}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Education() {
  return (
    <section id="education" className="section">
      <h1>Education</h1>

      <div className="edu-grid">
        <EducationCard title="Degrees" items={degrees} />
        <EducationCard title="Bootcamps & certificates" items={certificates} />
      </div>

      <p className="stack__also">
        <span>Languages:</span> {languages.join(' · ')}
      </p>
    </section>
  )
}

export default Education
