// The Studio section, right under the hero: what Axihex does, kept short.
// 1. The intro: the label, one paragraph, and a link to the full Studio page (/studio).
// 2. The five pillars (PillarHive.tsx): a honeycomb around the Axihex mark; each pillar explains itself.
// 3. The core engineering capabilities: what gets built.
// 4. One quiet line about who is behind it, linking to the founder's page.
// Everything else (process, pillars in brief, where products live, philosophy) lives on the Studio page.
// Text: src/data/studio.ts and src/data/identity.ts.

import { Link } from 'react-router'
import { asset } from '../../utils/asset.ts'
import { studio } from '../../data/studio.ts'
import PillarHive from './PillarHive.tsx'
import Capabilities from '../studio/Capabilities.tsx'

function About() {
  return (
    <section id="studio" className="section studio">
      <div className="studio__intro">
        {/* No big slogan title: the hero already says what Axihex is. The label is the heading. */}
        <h2 className="eyebrow">{studio.eyebrow}</h2>
        <p className="studio__text">{studio.text}</p>
        <Link to="/studio" className="forward-link studio__more">
          How we work <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="studio__block">
        <h3 className="studio__subtitle">
          {studio.pillarsTitle} <span className="studio__subtitle-muted">{studio.pillarsAccent}</span>
        </h3>
        <PillarHive />
      </div>

      <Capabilities />

      {/* Who is behind it: one small line, so the section stays about Axihex. */}
      <p className="studio__founder">
        {studio.founderNote}{' '}
        <Link to="/background" className="founder-line">
          <img src={asset('/avatar.webp')} alt="" width={28} height={28} loading="lazy" />
          <span className="founder-line__more">{studio.founderLink} →</span>
        </Link>
      </p>
    </section>
  )
}

export default About
