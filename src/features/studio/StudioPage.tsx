// The Studio page (/studio, "Studio" in the navbar): what Axihex is, told as a story, opportunity
// first. The home page's Studio section is the short version and links here (the five pillars live
// there, in the honeycomb, so they aren't repeated here).
//   1. Right idea, right time. Built right.: what Axihex does, and the three things it makes
//   2. How we think: three lenses (opportunity, product, engineering), each with its questions
//   3. What we build: the five skills, and where the products live (with or without our name)
//   4. Have an idea? The philosophy, the invitation, and what "independent" means
// Text: src/data/identity.ts. Writing rule: plain words, no slogans, nothing presented as launched
// before it is.

import { useLayoutEffect } from 'react'
import { Link } from 'react-router'
import SectionTitle from '../../components/SectionTitle.tsx'
import GradientText from '../../components/GradientText.tsx'
import AxihexMark from '../../components/AxihexMark.tsx'
import Icon from '../../components/Icon.tsx'
import { channels, offerings, philosophy, studioLead, thinking } from '../../data/identity.ts'
import { STUDIO_DESCRIPTION, STUDIO_TITLE } from '../../data/seo.ts'
import { useDocumentTitle } from '../../utils/useDocumentTitle.ts'
import Capabilities from './Capabilities.tsx'
import BackLink from '../../components/BackLink.tsx'
import ScrollUpBack from '../../components/ScrollUpBack.tsx'
import { useBack } from '../../utils/pageHistory.ts'
import { hasProducts } from '../products/shownProducts.ts'

function StudioPage() {
  useDocumentTitle(STUDIO_TITLE, { description: STUDIO_DESCRIPTION })
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
          {/* One sentence per line. */}
          Right idea, right time.
          <br />
          <GradientText text="Built right." />
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

      {/* 2. How we think: three lenses, side by side. */}
      <section id="approach" className="section">
        <SectionTitle label="How we think about our products" title="When, what," accent="and how." />
        {/* Our own products (the three lenses, named in the label above), then a client's idea (the note). */}
        <ul className="lenses">
          {thinking.lenses.map((lens) => (
            <li key={lens.title} className="lens">
              <span className="trait__icon" aria-hidden="true">
                <Icon name={lens.icon} size={20} />
              </span>
              <strong>{lens.title}</strong>
              <span className="lens__line">{lens.line}</span>
              <ul>
                {lens.questions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="thinking__principle">{thinking.principle}</p>
        {/* Clients and founders: we help plan their idea with the same product thinking. */}
        <p className="thinking-client">
          <strong>For your idea:</strong> {thinking.clients}
        </p>
      </section>

      {/* 3. What we build: the five skills, then where the products live. */}
      <section id="capabilities" className="section">
        <SectionTitle label="What we build" title="Focused in engineering." accent="Flexible in what we build." />
        <Capabilities hideTitle />
        <div className="channels" id="brand">
          <div className="channels__text">
            <h3>With our name, or with its own.</h3>
            <p>
              Small tools live right here on axihex.com. Bigger apps and services get their own name and website.
              Wherever you find one, this mark tells you we built it:
            </p>
            <span className="built-by built-by--feature">
              <AxihexMark className="built-by__mark" /> Built by <span className="built-by__name">Axihex</span>
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

      {/* 4. The invitation: the philosophy, then the page's question, turned to the visitor. */}
      <section id="studio-contact" className="section studio-cta">
        <blockquote className="philosophy">
          <p>{philosophy}</p>
          <footer>Axihex philosophy</footer>
        </blockquote>
        <h2 className="studio-cta__title">
          Have an idea? <GradientText text="Now’s the time." />
        </h2>
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
