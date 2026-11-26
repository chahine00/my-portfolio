// The five pillars, the heart of Axihex: right under the hero, big and centered. The hero's engine
// turns into five nodes as it scrolls away, and here the honeycomb (PillarHive.tsx) opens out of
// its own center, so it reads as looking inside Axihex. No paragraph: the title, then the honeycomb
// speaks for itself, each pillar leading to where it lives on the site. (What Axihex is, in words,
// opens the Studio page.)
// Text: src/data/studio.ts and src/data/identity.ts.

import { Link } from 'react-router'
import { studio } from '../../data/studio.ts'
import PillarHive from './PillarHive.tsx'

function About() {
  return (
    <section id="studio" className="section pillars-stage" aria-labelledby="pillars-title">
      <header className="pillars-stage__head">
        <p className="eyebrow">{studio.eyebrow}</p>
        <h2 id="pillars-title" className="pillars-stage__title">
          {studio.pillarsTitle} <span className="studio__subtitle-muted">{studio.pillarsAccent}</span>
        </h2>
      </header>

      <PillarHive />

      <Link to="/studio" className="forward-link pillars-stage__more">
        Identity, purpose &amp; vision <span aria-hidden="true">→</span>
      </Link>
    </section>
  )
}

export default About
