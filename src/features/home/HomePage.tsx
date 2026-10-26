// The one-page home: all the sections you scroll through, in order.

import { useEffect, useLayoutEffect } from 'react'
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

  // When the URL has a #section (for example coming back from /updates to /#skills),
  // scroll to that section once the page is on screen.
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    }
  }, [hash, key])

  // Sections fade in as they scroll into view.
  // useLayoutEffect runs BEFORE the page is drawn, so sections don't flash visible first.
  useLayoutEffect(() => {
    // Respect visitors who turned on "reduce motion" in their system settings.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const sections = document.querySelectorAll('main .section')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target) // each section only animates once
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    sections.forEach((section) => {
      section.classList.add('reveal')
      observer.observe(section)
    })
    return () => observer.disconnect()
  }, [])

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
