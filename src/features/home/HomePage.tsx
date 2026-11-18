// The one-page home: all the sections you scroll through, in order.

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigationType } from 'react-router'
import Hero from './Hero.tsx'
import About from '../about/About.tsx'
import Experience from '../experience/Experience.tsx'
import Projects from '../projects/Projects.tsx'
import Skills from '../skills/Skills.tsx'
import Education from '../education/Education.tsx'
import Updates from '../updates/Updates.tsx'
import Contact from '../contact/Contact.tsx'
import AvatarGuide from '../../components/AvatarGuide.tsx'
import { BACK_AT_TOP_EVENT } from '../../utils/goToTop.ts'
import { forgetProjectLeft, projectJustLeft, scrollToProjectCard } from '../projects/projectReturn.ts'
import { useDocumentTitle } from '../../utils/useDocumentTitle.ts'

function HomePage() {
  // useLocation tells us the current URL. "hash" is the #part, e.g. '#skills'.
  // "key" changes on every navigation, so clicking the same link twice still scrolls.
  const { hash, key, state } = useLocation()
  // Set by the navbar's Home link: the welcome drawing plays once the page is at the top.
  const replayWelcome = (state as { replayWelcome?: boolean } | null)?.replayWelcome === true
  // Set by a project page's "All projects" links: the project whose card to come back to.
  const returnToProject = (state as { returnToProject?: string } | null)?.returnToProject
  const navigationType = useNavigationType()
  useDocumentTitle() // the site's usual title

  // The phone's back gesture (or the browser's back button) from a project's page: open at that
  // project's card, like the page's "All projects" buttons do. Decided once, when the page opens.
  const [backToCard] = useState(() => (navigationType === 'POP' ? projectJustLeft() : null))
  // Set once it has scrolled there: the #section scroll below then leaves the page where it is.
  const atCard = useRef(false)
  useLayoutEffect(() => {
    forgetProjectLeft()
    if (backToCard && scrollToProjectCard(backToCard)) atCard.current = true
  }, [backToCard])

  // When the URL has a #section (for example coming back from /blog to /#skills),
  // scroll to that section once the page is on screen.
  // "#home" (your name in the navbar) always goes to the very top of the page, so the whole hero
  // shows below the menu. (Scrolling to the hero itself would hide its top under the taller
  // phone navbar.)
  useEffect(() => {
    // Just brought back to a project's card (above): stay there.
    if (atCard.current) {
      atCard.current = false
      return
    }
    if (hash === '#home') {
      window.scrollTo(0, 0)
      if (replayWelcome) window.dispatchEvent(new Event(BACK_AT_TOP_EVENT))
    } else if (hash) {
      // Back from a project's page: straight to that project's card (no glide past the sections
      // above), so you carry on from the project you were looking at.
      if (!returnToProject || !scrollToProjectCard(returnToProject)) {
        document.getElementById(hash.slice(1))?.scrollIntoView()
      }
    }
  }, [hash, key, replayWelcome, returnToProject])

  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Experience />
      <Skills />
      <Education />
      {/* The blog sits just before Contact: the latest news, then a way to get in touch. */}
      <Updates />
      <Contact />
      {/* The avatar peeks out at each section to say what it is (see AvatarGuide.tsx). */}
      <AvatarGuide />
    </>
  )
}

export default HomePage
