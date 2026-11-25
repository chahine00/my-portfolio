// The Studio page (/studio, "Studio" in the navbar): Axihex's identity, purpose and vision in full.
// The home page's Studio section is the short version and links here.
//   1. Identity: the official definition, and what Axihex is more than
//   2. What defines Axihex: four traits
//   3. Purpose: the five pillars, in depth
//   4. Capabilities: focused in engineering, flexible in what gets built
//   5. Approach: product thinking (how vs why) and the process, from a need to an improved product
//   6. One brand, many forms: what can live under Axihex, and where it ships
//   7. Values, mission and philosophy
//   8. An invitation: start a project, or meet the founder
// Text: src/data/identity.ts.

import { useLayoutEffect } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import SectionTitle from '../../components/SectionTitle.tsx'
import GradientText from '../../components/GradientText.tsx'
import AxihexMark from '../../components/AxihexMark.tsx'
import Icon from '../../components/Icon.tsx'
import {
  channels,
  definition,
  essence,
  measure,
  moreThan,
  isRather,
  mission,
  philosophy,
  pillars,
  process,
  thinking,
  traits,
  umbrella,
  values,
  vision,
} from '../../data/identity.ts'
import { STUDIO_DESCRIPTION, STUDIO_TITLE } from '../../data/seo.ts'
import { useDocumentTitle } from '../../utils/useDocumentTitle.ts'
import { useReveal } from '../../utils/useReveal.ts'
import Capabilities from './Capabilities.tsx'

function StudioPage() {
  useDocumentTitle(STUDIO_TITLE, { description: STUDIO_DESCRIPTION })
  const pillarsRef = useReveal<HTMLOListElement>('.pillar-row')
  const processRef = useReveal<HTMLOListElement>('.process__step')

  // Open at the top, not where the previous page was scrolled to.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  return (
    <div className="page-enter studio-page">
      {/* 1. Identity */}
      <section id="identity" className="section identity">
        <p className="eyebrow">Identity, purpose &amp; vision</p>
        <h1 className="identity__title">
          Where engineering meets <GradientText text="curiosity." />
        </h1>
        <p className="identity__lead">{definition}</p>

        <div className="identity__not">
          <p className="identity__not-label">More than</p>
          <ul>
            {moreThan.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="identity__is">
            <AxihexMark className="identity__mark" />
            {isRather}
          </p>
        </div>
      </section>

      {/* 2. What defines Axihex */}
      <section id="defines" className="section">
        <SectionTitle label="Identity" title="What defines" accent="Axihex." />
        <ul className="trait-grid">
          {traits.map((trait) => (
            <li key={trait.title} className="trait">
              <span className="trait__icon" aria-hidden="true">
                <Icon name={trait.icon} size={20} />
              </span>
              <strong>{trait.title}</strong>
              <span>{trait.text}</span>
            </li>
          ))}
        </ul>
        <p className="identity__footnote">
          Independent doesn't mean solo: Axihex collaborates with clients, partners, and other organizations, and its founder
          stays open to engineering roles.
        </p>
      </section>

      {/* 3. The five pillars, in depth */}
      <section id="pillars" className="section">
        <SectionTitle label="Purpose" title="Five pillars." accent="One studio." />
        <p className="studio-page__intro">Five complementary purposes. One consistent technology brand.</p>
        <ol className="pillar-rows" ref={pillarsRef}>
          {pillars.map((pillar, i) => (
            <li key={pillar.word} className="pillar-row">
              <span className="pillar-row__hex" aria-hidden="true">
                <span>0{i + 1}</span>
              </span>
              <div className="pillar-row__body">
                <h3>
                  {pillar.word} <span className="pillar-row__statement">{pillar.statement}</span>
                </h3>
                <p>{pillar.text}</p>
                <ul className="pillar-row__examples" aria-label="For example">
                  {pillar.examples.map((example) => (
                    <li key={example}>{example}</li>
                  ))}
                </ul>
                <p className="pillar-row__objective">
                  <span>Objective</span> {pillar.objective}
                </p>
                <Link to={pillar.link.to} className="forward-link">
                  {pillar.link.label} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 4. Capabilities */}
      <section id="capabilities" className="section">
        <SectionTitle label="Capabilities" title="The technical" accent="foundation." />
        <p className="studio-page__intro">
          A focused engineering identity, rather than a claim to specialize in every industry. These capabilities make
          different kinds of products possible.
        </p>
        <Capabilities />
      </section>

      {/* 5. Approach: product thinking */}
      <section id="approach" className="section">
        <SectionTitle label="Approach" title="Product thinking," accent="in practice." />
        <div className="thinking">
          <div className="thinking__col">
            <p className="thinking__label">Engineering asks</p>
            <ul>
              {thinking.how.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </div>
          <span className="thinking__plus" aria-hidden="true">
            +
          </span>
          <div className="thinking__col thinking__col--why">
            <p className="thinking__label">Product thinking asks</p>
            <ul>
              {thinking.why.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="thinking__principle">{thinking.principle}</p>

        <ol className="process" ref={processRef}>
          {process.map((step, i) => (
            <li key={step.title} className="process__step" style={{ '--i': i } as CSSProperties}>
              <span className="process__num" aria-hidden="true">
                {i + 1}
              </span>
              <strong>{step.title}</strong>
              <span>{step.text}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* 6. One brand, many forms */}
      <section id="brand" className="section">
        <SectionTitle label="Umbrella brand" title="One brand," accent="many forms." />
        <div className="umbrella">
          <div className="umbrella__root">
            <AxihexMark className="umbrella__mark" />
            <div>
              <strong>Axihex</strong>
              <span>Independent software studio &amp; technology brand</span>
            </div>
          </div>
          <ul className="umbrella__branches">
            {umbrella.map((branch) => (
              <li key={branch.title}>
                <span className="trait__icon" aria-hidden="true">
                  <Icon name={branch.icon} size={18} />
                </span>
                <strong>{branch.title}</strong>
                <span>{branch.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="channels">
          <div className="channels__text">
            <h3>Where it ships.</h3>
            <p>
              Not every product needs to live on axihex.com or carry its name. A small utility can live right here; a larger
              app can have its own name and identity, endorsed by the studio.
            </p>
            <span className="built-by">
              <AxihexMark className="built-by__mark" /> Built by Axihex
            </span>
          </div>
          <ul className="channels__list">
            {channels.map((channel) => (
              <li key={channel.title}>
                <Icon name={channel.icon} size={18} />
                <span>
                  <strong>{channel.title}</strong>
                  {channel.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 7. Mission, vision, values */}
      <section id="values" className="section">
        <SectionTitle label="Values" title="What we" accent="stand for." />
        <div className="mv">
          <div className="mv__item">
            <p className="direction__kicker">Mission</p>
            <p className="direction__mission">{mission}</p>
          </div>
          <div className="mv__item">
            <p className="direction__kicker">Long-term vision</p>
            <p>{vision}</p>
          </div>
        </div>
        <p className="direction__measure">{measure}</p>
        <ul className="value-grid">
          {values.map((value) => (
            <li key={value.title}>
              <span className="trait__icon" aria-hidden="true">
                <Icon name={value.icon} size={18} />
              </span>
              <strong>{value.title}</strong>
              <span>{value.text}</span>
            </li>
          ))}
        </ul>
        <blockquote className="philosophy">
          <p>{philosophy}</p>
          <footer>Axihex philosophy</footer>
        </blockquote>
      </section>

      {/* 8. An invitation */}
      <section id="studio-contact" className="section studio-cta">
        <p className="studio-cta__essence">{essence}</p>
        <h2 className="studio-cta__title">
          Have a project in mind? <GradientText text="Let's scope it." />
        </h2>
        <div className="hero-actions studio-cta__actions">
          <Link to="/#contact" state={{ topic: 'project' }} className="button">
            Start a project <span aria-hidden="true">→</span>
          </Link>
          <Link to="/#contact" state={{ topic: 'collab' }} className="button button-outline">
            Collaborate
          </Link>
          <Link to="/background" className="forward-link">
            Meet the founder <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default StudioPage
