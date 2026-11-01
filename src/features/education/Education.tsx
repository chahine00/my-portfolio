// The "Education" section: university degrees first (bigger, with the university's logo),
// then certificates and bootcamps as smaller chips, then the languages with a small level meter.
// The data comes from src/data/education.ts.

import { certificates, degrees, languages } from '../../data/education.ts'
import type { EducationItem } from '../../data/education.ts'
import { asset } from '../../utils/asset.ts'
import SectionTitle from '../../components/SectionTitle.tsx'

// "Arab Open University" → "AOU", "SE Factory" → "SF". Shown until a logo is added.
function initialsOf(name: string) {
  return name
    .split(' ')
    .slice(0, 3)
    .map((word) => word[0].toUpperCase())
    .join('')
}

// The logo of the school or organizer, or its initials in a badge.
function Logo({ item }: { item: EducationItem }) {
  return (
    <span className="edu-logo" aria-hidden="true">
      {item.logo ? <img src={asset(item.logo)} alt="" /> : initialsOf(item.place)}
    </span>
  )
}

function Education() {
  return (
    <section id="education" className="section">
      <SectionTitle label="Education" title="Where I" accent="learned" />

      <p className="edu-group">University</p>
      <ul className="edu-degrees">
        {degrees.map((item) => (
          <li key={item.title} className="edu-degree">
            <Logo item={item} />
            <span>
              <strong>{item.title}</strong>
              <span className="edu-meta">
                {item.place} · {item.year}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <p className="edu-group">Certificates & bootcamps</p>
      <ul className="edu-strip">
        {certificates.map((item) => (
          <li key={item.title} className="edu-chip">
            <Logo item={item} />
            <span>
              <strong>{item.title}</strong>
              <span className="edu-meta">
                {item.place} · {item.year}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {/* Each language gets three small bars; its level fills that many of them. */}
      <ul className="languages">
        {languages.map((language) => (
          <li key={language.name} className="languages__item">
            <strong>{language.name}</strong>
            <span className="languages__bars" aria-hidden="true">
              {[1, 2, 3].map((bar) => (
                <span key={bar} className={bar <= language.level ? 'is-on' : undefined} />
              ))}
            </span>
            <span className="languages__label">{language.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Education
