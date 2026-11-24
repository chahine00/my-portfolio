// The Studio section, right under the hero (navbar: "Studio", hero: "About the studio").
// A minimal, editorial introduction: strong type and three simple principles, no feature panel
// (the hero already carries the brand visual, the Axihex mark).
// 1. "The Studio": what Axihex believes, and its three principles: Explore, Build, Share.
// 2. "Behind Axihex": the experience the studio is built on, then a small founder card with the
//    avatar. The founder's avatar lives here and on /background, not in the hero, so it
//    represents the founder, not the whole brand.

import { Link } from 'react-router'
import GradientText from '../../components/GradientText.tsx'
import { asset } from '../../utils/asset.ts'
import { studio } from '../../data/studio.ts'
import Icon from '../../components/Icon.tsx'

function About() {
  return (
    <section id="studio" className="section studio">
      <div className="studio__intro">
        <p className="eyebrow">{studio.eyebrow}</p>
        <h2 className="studio__title">
          {studio.title} <GradientText text={studio.titleAccent} />
        </h2>
        <p className="studio__text">{studio.text}</p>
      </div>

      <ol className="studio__principles">
        {studio.principles.map((principle, i) => (
          <li key={principle.word}>
            <span className="studio__icon" aria-hidden="true">
              <Icon name={principle.icon} size={22} />
            </span>
            <span className="studio__num">0{i + 1} /</span>
            <strong>{principle.word}</strong>
            <span className="studio__note">{principle.note}</span>
          </li>
        ))}
      </ol>

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
