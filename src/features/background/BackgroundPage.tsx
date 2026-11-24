// The founder's page (/background, "Founder" in the navbar): Ali Chahine's professional portfolio,
// for recruiters and companies. The home page is about Axihex; its "Meet the founder" card leads here.
//   1. Personal introduction: the original hero ("Meet Ali Chahine", the avatar and its drawing)
//   2. Engineering mindset
//   3. Professional experience
//   4. Selected work: a short link to the projects on the home page (not the cards again)
//   5. Testimonials (only once real quotes are added, see src/data/founder.ts)
//   6. Technical expertise
//   7. Education & languages
//   8. Contact (the CV is in the hero)

import { useLayoutEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { profile } from '../../data/profile.ts'
import { BACKGROUND_DESCRIPTION } from '../../data/seo.ts'
import { useDocumentTitle } from '../../utils/useDocumentTitle.ts'
import { clearHash } from '../../utils/goToTop.ts'
import SectionTitle from '../../components/SectionTitle.tsx'
import Hero from '../home/Hero.tsx'
import Mindset from './Mindset.tsx'
import Testimonials from './Testimonials.tsx'
import Experience from '../experience/Experience.tsx'
import Skills from '../skills/Skills.tsx'
import Education from '../education/Education.tsx'

// After the work history: where to see that experience in practice. The project cards live on the
// home page (Selected Work), so this only links there instead of repeating them.
function SelectedWorkLink() {
  return (
    <section id="selected-work" className="section">
      <SectionTitle label="Selected Work" title="Experience in" accent="practice." />
      <p className="page-intro">Explore the projects I've built and contributed to throughout my engineering journey.</p>
      <Link to="/#projects" className="button arrow-button">
        View selected projects <span aria-hidden="true">→</span>
      </Link>
    </section>
  )
}

// The page's last step: a message. (The CV is in the hero, once.)
function FounderContact() {
  return (
    <section id="founder-contact" className="section">
      <SectionTitle label="Contact" title="Let's" accent="talk." />
      <p className="page-intro">
        {profile.founderAvailability && `${profile.founderAvailability}. `}Send a message and I'll get back to you.
      </p>
      <div className="hero-actions">
        {/* The form opens with "A role for the founder" chosen (Contact.tsx). */}
        <Link to="/#contact" state={{ topic: 'role' }} className="button">
          Get in touch
        </Link>
      </div>
      {/* The end of the page: the way back to the studio, like the link at the top. */}
      <Link to="/#studio" className="back-link founder-back">
        <span aria-hidden="true">←</span> Back to Axihex
      </Link>
    </section>
  )
}

function BackgroundPage() {
  useDocumentTitle(`${profile.name}, Founder`, { description: BACKGROUND_DESCRIPTION })

  // Open at the top (the hero), not where the previous page was scrolled to; or, with a #section
  // in the address (e.g. an old /#experience link sent here), at that section.
  // 'instant' skips the smooth scrolling set in global.css.
  const { hash } = useLocation()
  useLayoutEffect(() => {
    const section = hash ? document.getElementById(hash.slice(1)) : null
    if (section) section.scrollIntoView({ behavior: 'instant' })
    else window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    clearHash() // a clean address: /background, not /background#experience
  }, [hash])

  return (
    <div className="page-enter">
      <Hero variant="founder" />
      <Mindset />
      <Experience />
      <SelectedWorkLink />
      <Testimonials />
      <Skills />
      <Education />
      <FounderContact />
    </div>
  )
}

export default BackgroundPage
