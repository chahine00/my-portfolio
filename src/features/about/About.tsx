// The Studio section, right under the hero (navbar: "Studio"). What Axihex is, in four steps:
// 1. The intro: what the studio believes, and a link to the full identity page (/studio).
// 2. The five pillars (PillarHive.tsx): Explore, Build, Showcase, Share, Grow, around the Axihex hexagon.
// 3. The core engineering capabilities: focused in engineering, flexible in what gets built.
// 4. "Behind Axihex": the experience the studio is built on, then a small founder card with the
//    avatar. The founder's avatar lives here and on /background, not in the hero, so it
//    represents the founder, not the whole brand.
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

      <div className="behind-axihex">
        <h3 className="behind-axihex__title">{studio.behindTitle}</h3>
        <div>
          {studio.behind.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          {/* The founder card: the avatar represents the founder here, not the brand. He stands on the
              card's bottom edge and steps out above its top edge, with a soft glow behind him. */}
          <Link to="/background" className="founder-card">
            <span className="founder-card__visual" aria-hidden="true">
              <img
                className="founder-card__avatar"
                src={asset('/avatar-stand.webp')}
                alt=""
                width={520}
                height={600}
                loading="lazy"
              />
            </span>
            <span className="founder-card__body">
              <span className="founder-card__title">{studio.founderCard.title}</span>
              {/* No name here: the home page stays about Axihex; the name is on /background. */}
              <span className="founder-card__text">{studio.founderCard.text}</span>
              <span className="founder-card__available">
                <span className="hero__available-dot" aria-hidden="true" /> {studio.founderCard.availability}
              </span>
              <span className="founder-card__link">
                {studio.founderCard.link}
                <span className="founder-card__arrow" aria-hidden="true">
                  →
                </span>
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default About
