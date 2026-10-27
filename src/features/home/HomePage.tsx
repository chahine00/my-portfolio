// The one-page home: all the sections you scroll through, in order.

import { useEffect } from 'react'
import { useLocation } from 'react-router'
import Hero from './Hero.tsx'
import About from '../about/About.tsx'
import Experience from '../experience/Experience.tsx'
import Projects from '../projects/Projects.tsx'
import Skills from '../skills/Skills.tsx'
import Education from '../education/Education.tsx'
import Updates from '../updates/Updates.tsx'
import Testimonials from '../testimonials/Testimonials.tsx'
import Contact from '../contact/Contact.tsx'

function HomePage() {
  // useLocation tells us the current URL. "hash" is the #part, e.g. '#skills'.
  // "key" changes on every navigation, so clicking the same link twice still scrolls.
  const { hash, key } = useLocation()

  // When the URL has a #section (for example coming back from /blog to /#skills),
  // scroll to that section once the page is on screen.
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    }
  }, [hash, key])

  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Experience />
      <Skills />
      <Updates />
      <Education />
      <Testimonials />
      <Contact />
    </>
  )
}

export default HomePage
