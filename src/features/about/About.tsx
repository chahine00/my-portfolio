// The five pillars, the heart of Axihex: right under the hero, big and centered. The hero's engine
// turns into five nodes as it scrolls away, and here the honeycomb (PillarHive.tsx) opens out of
// its own center, so it reads as looking inside Axihex. One short line (the Studio page's opening),
// then the honeycomb speaks for itself: each pillar leads to where it lives on the site.
// Text: src/data/studio.ts and src/data/identity.ts.

import { Link } from 'react-router'
import { studio } from '../../data/studio.ts'
import { studioLead } from '../../data/identity.ts'
import PillarHive from './PillarHive.tsx'

function About() {
  return (
    <section id="studio" className="section pillars-stage" aria-labelledby="pillars-title">
      <header className="pillars-stage__head">
        <p className="eyebrow">{studio.eyebrow}</p>
        <h2 id="pillars-title" className="pillars-stage__title">
          {studio.pillarsTitle} <span className="studio__subtitle-muted">{studio.pillarsAccent}</span>
        </h2>
        <p className="pillars-stage__lede">{studioLead}</p>
      </header>

      <PillarHive />

      <Link to="/studio" className="forward-link pillars-stage__more">
        Identity, purpose &amp; vision <span aria-hidden="true">→</span>
      </Link>
    </section>
  )
}

export default About
