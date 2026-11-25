// The one-page home: all the sections you scroll through, in order.

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router'
import HomeHero from './HomeHero.tsx'
import About from '../about/About.tsx'
import Projects from '../projects/Projects.tsx'
import Updates from '../updates/Updates.tsx'
import Contact from '../contact/Contact.tsx'
import AvatarGuide from '../../components/AvatarGuide.tsx'
import { BACK_AT_TOP_EVENT, clearHash } from '../../utils/goToTop.ts'
import { forgetProjectLeft, projectJustLeft, scrollToProjectCard } from '../projects/projectReturn.ts'
import { useDocumentTitle } from '../../utils/useDocumentTitle.ts'
import { restoringTo } from '../../utils/pageHistory.ts'

// Sections that used to be on the home page, and where they are now. Old links (in the CV, on
// LinkedIn, in bookmarks) to /#experience and the like are sent there instead of the page's top.
const MOVED_SECTIONS: Record<string, string> = {
  '#about': '/#studio',
  // The Direction section left the home page; mission and vision are on the Studio page.
  '#direction': '/studio#values',
  '#background': '/background',
  '#mindset': '/background#mindset',
  '#experience': '/background#experience',
  '#skills': '/background#skills',
  '#education': '/background#education',
}

function HomePage() {
  // useLocation tells us the current URL. "hash" is the #part, e.g. '#skills'.
  // "key" changes on every navigation, so clicking the same link twice still scrolls.
  const { hash, key, state } = useLocation()
  // Set by the navbar's Home link: the welcome drawing plays once the page is at the top.
  const replayWelcome = (state as { replayWelcome?: boolean } | null)?.replayWelcome === true
  // Set by a project page's "All projects" links: the project whose card to come back to.
  const returnToProject = (state as { returnToProject?: string } | null)?.returnToProject
  const navigationType = useNavigationType()
  const navigate = useNavigate()
  useDocumentTitle() // the site's usual title

  // An old link to a section that moved: go to its new place (replacing the old address).
  const moved = MOVED_SECTIONS[hash]
  useEffect(() => {
    if (moved) navigate(moved, { replace: true })
  }, [moved, navigate])

  // The phone's back gesture (or the browser's back button) from a project's page: open at that
  // project's card, like the page's "All projects" buttons do. Decided once, when the page opens.
  // Going back to an exact saved spot (App.tsx brings the page back to exactly where it was): the
  // page then does none of its own scrolling (project card, #section). Decided once, when it opens.
  const [restoring] = useState(() => restoringTo('/', navigationType === 'POP') !== undefined)
  const [backToCard] = useState(() => (navigationType === 'POP' && !restoring ? projectJustLeft() : null))
  const skipFirstScroll = useRef(restoring)
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
    if (moved) return // on its way to the section's new place (above)
    if (skipFirstScroll.current) {
      // Being brought back to the exact spot you left (App.tsx): no #section jump on top of it.
      skipFirstScroll.current = false
      if (hash) clearHash()
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
    // The section is on screen: take the "#section" out of the address (axihex.com/, not /#contact).
    if (hash) clearHash()
  }, [hash, key, replayWelcome, returnToProject, moved])

  return (
    <>
      <HomeHero />
      {/* Studio-first: Hero → Studio (pillars, traits, capabilities, process, Behind Axihex) → Work →
          Blog → Contact. The founder's background has its own page (/background), linked from
          "Meet the founder"; the full identity has its own page too (/studio, "Studio" in the navbar). */}
      <About />
      <Projects />
      {/* The blog sits just before Contact: the latest news, then a way to get in touch. */}
      <Updates />
      <Contact />
      {/* The tiny robot peeks out at a few sections to say what they are (see AvatarGuide.tsx). The
          founder's avatar appears on the founder's page only. */}
      <AvatarGuide turns={['robot']} />
    </>
  )
}

export default HomePage
