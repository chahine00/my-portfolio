// The Studio section, right under the hero: what Axihex does, kept short.
// 1. The intro: the label, the title, one paragraph, and a link to the full Studio page (/studio).
// 2. The five pillars (PillarHive.tsx): a honeycomb around the Axihex mark; each pillar explains itself.
// 3. The core engineering capabilities: what gets built.
// 4. One quiet line about who is behind it, linking to the founder's page.
// Everything else (process, pillars in brief, where products live, philosophy) lives on the Studio page.
// Text: src/data/studio.ts and src/data/identity.ts.

import { Link } from 'react-router'
import GradientText from '../../components/GradientText.tsx'
import { asset } from '../../utils/asset.ts'
import { studio } from '../../data/studio.ts'
import PillarHive from './PillarHive.tsx'
import Capabilities from '../studio/Capabilities.tsx'

function About() {
  return (
    <section id="studio" className="section studio">
      <div className="studio__intro">
        <p className="eyebrow">{studio.eyebrow}</p>
        <h2 className="studio__title">
          {studio.title} <GradientText text={studio.titleAccent} />
        </h2>
        <p className="studio__text">{studio.text}</p>
        <Link to="/studio" className="forward-link studio__more">
          Identity, purpose &amp; vision <span aria-hidden="true">→</span>
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
