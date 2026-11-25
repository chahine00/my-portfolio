// The Studio page (/studio, "Studio" in the navbar): what Axihex is, told as a story, opportunity
// first. The home page's Studio section is the short version and links here.
//   1. Where we see an opportunity, we build it: what Axihex does, and the three things it makes
//   2. What defines Axihex: four traits
//   3. From opportunity to product: the steps, the three sets of questions, and how we work with founders
//   3. Five pillars: the purpose, one line each (in full: the home page's honeycomb)
//   4. Capabilities: the five skills every product rests on
//   5. Built by Axihex: where the products live, with or without the Axihex name
//   6. The Axihex philosophy: one quote
//   7. Spotted an opportunity? Start a project, collaborate, or meet the founder
// Text: src/data/identity.ts. Writing rule: plain words, no slogans, nothing presented as launched
// before it is.

import { useLayoutEffect } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import SectionTitle from '../../components/SectionTitle.tsx'
import GradientText from '../../components/GradientText.tsx'
import AxihexMark from '../../components/AxihexMark.tsx'
import Icon from '../../components/Icon.tsx'
import { channels, offerings, philosophy, pillars, process, studioLead, thinking, traits } from '../../data/identity.ts'
import { STUDIO_DESCRIPTION, STUDIO_TITLE } from '../../data/seo.ts'
import { useDocumentTitle } from '../../utils/useDocumentTitle.ts'
import { useReveal } from '../../utils/useReveal.ts'
import Capabilities from './Capabilities.tsx'
import BackLink from '../../components/BackLink.tsx'
import ScrollUpBack from '../../components/ScrollUpBack.tsx'
import { useBack } from '../../utils/pageHistory.ts'
import { hasProducts } from '../products/shownProducts.ts'

function StudioPage() {
  useDocumentTitle(STUDIO_TITLE, { description: STUDIO_DESCRIPTION })
  const processRef = useReveal<HTMLOListElement>('.process__step')
  // The way back to the page you came from (the home page if there's none).
  const back = useBack('/studio', '/')

  // Open at the top, not where the previous page was scrolled to.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  return (
    <div className="page-enter studio-page">
      {/* 1. What Axihex does, opportunity first */}
      <section id="identity" className="section identity">
        <BackLink back={back} className="hero__back" />
        <p className="eyebrow">The studio</p>
        <h1 className="identity__title">
          Where we see an opportunity, <GradientText text="we build it." />
        </h1>
        <p className="identity__lead">{studioLead}</p>

        {/* The three things you'll find from Axihex: our own products first. */}
        <ul className="trait-grid trait-grid--3 offerings">
          {offerings.map((offering) => (
            <li key={offering.title} className="trait">
              <span className="trait__icon" aria-hidden="true">
                <Icon name={offering.icon} size={20} />
              </span>
              <strong>{offering.title}</strong>
              <span>{offering.text}</span>
            </li>
          ))}
        </ul>
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
      </section>

      {/* 3. From opportunity to product */}
      <section id="approach" className="section">
        <SectionTitle label="How it works" title="From opportunity" accent="to product." />
        <p className="studio-page__intro">
          Every Axihex product starts with an opportunity we spotted. With founders, we start from their idea and shape
          the plan together.
        </p>
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

        {/* The questions behind every build: how (engineering), what and for whom (product), when (opportunity). */}
        <div className="thinking thinking--3 thinking--after">
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
          <span className="thinking__plus" aria-hidden="true">
            +
          </span>
          <div className="thinking__col thinking__col--why">
            <p className="thinking__label">Opportunity thinking asks</p>
            <ul>
              {thinking.when.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="thinking__principle">{thinking.principle}</p>

        {/* Working with founders: the same questions, applied to their idea and their plan. */}
        <p className="thinking-client">{thinking.founders}</p>
      </section>

      {/* 3. The five pillars, one line each (in full: the home page's honeycomb). */}
      <section id="pillars" className="section">
        <SectionTitle label="Purpose" title="Five pillars." accent="One studio." />
        <ol className="purpose__list">
          {pillars.map((pillar, i) => (
            <li key={pillar.word}>
              <span className="purpose__num" aria-hidden="true">
                0{i + 1}
              </span>
              <strong>{pillar.word}</strong>
              <span>{pillar.statement}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* 4. Capabilities */}
      <section id="capabilities" className="section">
        <SectionTitle label="Capabilities" title="The technical" accent="foundation." />
        <p className="studio-page__intro">
          Our products can be very different: an app, a game, an online tool. Underneath, they’re all built with the same
          five skills below, so every new idea starts on solid ground.
        </p>
        <Capabilities />
      </section>

      {/* 5. Where the products live: a link shared on social media can lead to any of these. */}
      <section id="brand" className="section">
        <SectionTitle label="Built by Axihex" title="Wherever" accent="it lives." />
        <div className="channels">
          <div className="channels__text">
            <h3>Not everything we make is called Axihex.</h3>
            <p>
              A small tool can live right here on axihex.com. A bigger app or service gets its own name and website. Either
              way, you’ll find this mark on it.
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

      {/* 6. The Axihex philosophy: one quote on its own, before the invitation. */}
      <section id="philosophy" className="section" aria-label="Axihex philosophy">
        <blockquote className="philosophy">
          <p>{philosophy}</p>
          <footer>Axihex philosophy</footer>
        </blockquote>
      </section>

      {/* 7. The invitation: the page's question, turned to the visitor. */}
      <section id="studio-contact" className="section studio-cta">
        <h2 className="studio-cta__title">
          Spotted an opportunity? <GradientText text="Let’s build it." />
        </h2>
        <p className="studio-cta__note">
          Independent doesn’t mean solo: we work with clients, partners and other teams.
        </p>
        <div className="hero-actions studio-cta__actions">
          <Link to="/#contact" state={{ topic: 'project' }} className="button">
            Start a project <span aria-hidden="true">→</span>
          </Link>
          {/* Once Axihex has products to show, they're the other way in. */}
          {hasProducts ? (
            <Link to="/#products" className="button button-outline">
              See our products
            </Link>
          ) : (
            <Link to="/#contact" state={{ topic: 'collab' }} className="button button-outline">
              Collaborate
            </Link>
          )}
          <Link to="/background" className="forward-link">
            Meet the founder <span aria-hidden="true">→</span>
          </Link>
        </div>
        {/* The end of the page: the way back, like the link at the top (same look as the founder page's). */}
        <BackLink back={back} className="founder-back" />
      </section>

      {/* Phones, in the middle of the page: the same way back, under the thumb when you scroll up. */}
      <ScrollUpBack label={back.label} onClick={() => back.go()} />
    </div>
  )
}

export default StudioPage
