// The navigation bar at the top of the page.

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useLocation } from 'react-router'
import { hasRecentUpdate } from '../data/updates.ts'
import { profile } from '../data/profile.ts'
import ThemeToggle from './ThemeToggle.tsx'

// Instead of writing each <li> by hand, we keep the links in an array.
// To add a new link, you only need to add one line here.
// "/#id" links go to a section of the home page (its id="") and scroll to it,
// so they also work from another page like /updates.
// A link can also open a separate page instead, like to: '/updates'.
// While you're on that page (or a page inside it, like /updates/some-post),
// the link is highlighted. "match" highlights a section link on other pages too:
// Projects is highlighted on /projects/some-project.
interface NavItem {
  to: string
  label: string
  match?: string // highlight this link while the address starts with this
  dot?: boolean // show the pulsing "new" dot
}

const links: NavItem[] = [
  { to: '/#about', label: 'About' },
  { to: '/#projects', label: 'Projects', match: '/projects' },
  { to: '/#experience', label: 'Experience' },
  { to: '/#skills', label: 'Skills' },
  { to: '/updates', label: 'Updates', dot: hasRecentUpdate },
  { to: '/#contact', label: 'Contact' },
]

function Navbar() {
  const { pathname } = useLocation()
  // Which home section is on screen right now, e.g. 'skills'. Used to light up its link.
  const [activeSection, setActiveSection] = useState('')
  // True once the page is scrolled a little: the navbar then gets a soft shadow.
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // "Scroll spy": watch the home sections and remember the one crossing the middle of the screen.
  useEffect(() => {
    if (pathname !== '/') return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        }
      },
      // Shrinks the watched area to a thin line across the middle of the screen.
      { rootMargin: '-50% 0px -50% 0px' },
    )
    document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [pathname])

  return (
    // In JSX we write "className" instead of "class" (class is a reserved word in JavaScript).
    <header className={scrolled ? 'navbar navbar--scrolled' : 'navbar'}>
      {/*
        On hover the name turns into a code tag, <Ali Chahine />, and the letters do a little wave.
        Each letter is its own <span> with its position (--i), so the wave can run left to right.
        Screen readers just read the aria-label, not the separate letters.
      */}
      <Link to="/#home" className="navbar__brand" aria-label={profile.name}>
        <span className="brand__bracket" aria-hidden="true">
          &lt;
        </span>
        <span aria-hidden="true">
          {[...profile.name].map((letter, i) => (
            <span key={i} className="brand__letter" style={{ '--i': i } as CSSProperties}>
              {/* A normal space would collapse, so use a non-breaking one. */}
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          ))}
        </span>
        <span className="brand__bracket brand__bracket--close" aria-hidden="true">
          /&gt;
        </span>
      </Link>
      <nav className="navbar__nav">
        <ul className="navbar__links">
          {/*
            Curly braces { } let you write JavaScript inside JSX.
            .map() goes through each item in the array and returns an <li> for it.
            React needs a unique "key" on each item in a list so it can keep track of them.
          */}
          {links.map((link) => {
            // Page links are highlighted on their own address; section links (/#…) only through "match".
            const match = link.match ?? (link.to.startsWith('/#') ? undefined : link.to)
            // On the home page, a section link is also active while you're reading that section.
            const onSection = pathname === '/' && link.to === `/#${activeSection}`
            const isActive = onSection || (match !== undefined && pathname.startsWith(match))
            return (
              <li key={link.to}>
                <Link to={link.to} className={isActive ? 'active' : undefined}>
                  {link.label}
                  {/* The pulsing dot only shows when there's a post from the last 30 days. */}
                  {link.dot && <span className="navbar__dot" aria-label="new post" />}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <ThemeToggle />
    </header>
  )
}

export default Navbar
