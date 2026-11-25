// The home page's hero: a big headline on the left, and on the right the anatomy of an app
// (HeroMark.tsx), whose layers you can click. Text: src/data/profile.ts and src/data/studio.ts.

import { Link } from 'react-router'
import { profile } from '../../data/profile.ts'
import { proof } from '../../data/studio.ts'
import GradientText from '../../components/GradientText.tsx'
import Icon from '../../components/Icon.tsx'
import HeroMark from './HeroMark.tsx'
import { longestPhrase, useTypingLoop } from './typing.ts'

function HomeHero() {
  const typed = useTypingLoop(profile.building)

  return (
    // id="home" lets the navbar link "/#home" scroll here.
    <section id="home" className="home-hero" aria-labelledby="home-title">
      <div className="home-hero__text">
        <p className="eyebrow home-hero__label">{profile.role}</p>
        <h1 id="home-title">
          {profile.headline} <GradientText text={profile.headlineAccent} />
        </h1>
        <p className="home-hero__lede">{profile.intro}</p>

        {/* A line of "code" that keeps typing what Axihex builds. Screen readers get the list once. */}
        <p className="hero__code" aria-label={`Axihex builds ${profile.building.join(', ')}`}>
          <span className="hero__code-ghost" aria-hidden="true">
            &gt; axihex.build('{longestPhrase}')
          </span>
          <span aria-hidden="true">
            <span className="hero__code-prompt">&gt;</span> axihex.build(<span className="hero__code-string">'{typed}</span>
            <span className="hero__code-caret" />
            <span className="hero__code-string">'</span>)
          </span>
        </p>

        <div className="hero-actions">
          <Link to="/#projects" className="button">
            Explore our work <span aria-hidden="true">→</span>
          </Link>
          {/* The Contact form opens with "A project" chosen (Contact.tsx). */}
          <Link to="/#contact" state={{ topic: 'project' }} className="button button-outline">
            Start a project
          </Link>
        </div>

        {/* Proof the work is real: where it has shipped. */}
        <div className="hero__proof">
          <span className="hero__proof-label">Shipped to</span>
          <ul>
            {proof.map((item) => (
              <li key={item.label}>
                <Icon name={item.icon} size={15} /> {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <HeroMark />
    </section>
  )
}

export default HomeHero
