// The navigation bar at the top of the page.
// Six links: Home, Studio, Work, Founder, Blog, Contact. "Studio" opens Axihex's identity, purpose and
// vision (/studio); "Home" goes to the top of the home page. On phones every link shows an icon with a
// small label (six tabs). On phones the menu is always at the bottom of the screen (the "tab bar",
// see the end of this file), on every page, and the top bar stays at the top with only the Axihex
// title and the theme button.

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useLocation } from 'react-router'
import { hasRecentUpdate } from '../data/updates.ts'
import { profile } from '../data/profile.ts'
import ThemeToggle from './ThemeToggle.tsx'
import { goToTop } from '../utils/goToTop.ts'
import Icon from './Icon.tsx'
import AxihexMark from './AxihexMark.tsx'
import { hasProducts } from '../features/products/shownProducts.ts'
import type { IconName } from './Icon.tsx'

// Instead of writing each <li> by hand, we keep the links in an array.
// To add a new link, you only need to add one line here.
// "/#id" links go to a section of the home page (its id="") and scroll to it,
// so they also work from another page like /blog.
// A link can also open a separate page instead, like to: '/blog'.
// While you're on that page (or a page inside it, like /blog/some-post),
// the link is highlighted. "match" highlights a section link on other pages too:
// Projects is highlighted on /projects/some-project.
interface NavItem {
  to: string
  label: string
  match?: string // highlight this link while the address starts with this
  sections?: string[] // home page sections (their ids) that highlight this link while on screen
  dot?: boolean // show the pulsing "new" dot
  icon: IconName // shown on phones, above the label
}

const links: NavItem[] = [
  // Home stays lit over the hero and the home page's Studio section (the short version of /studio).
  { to: '/#home', label: 'Home', icon: 'home', sections: ['home', 'studio'] },
  // The studio's own page, then the work, then the founder's own page (his professional portfolio,
  // /background), then the writing. Contact always last.
  { to: '/studio', label: 'Studio', icon: 'code' },
  // Axihex's own products: only once there's one to show (src/data/products.ts).
  ...(hasProducts ? [{ to: '/#products', label: 'Products', match: '/products', icon: 'box' as const }] : []),
  { to: '/#projects', label: 'Work', match: '/projects', icon: 'folder' },
  { to: '/background', label: 'Founder', icon: 'user' },
  { to: '/blog', label: 'Blog', sections: ['blog'], dot: hasRecentUpdate, icon: 'pen' },
  { to: '/#contact', label: 'Contact', icon: 'chat' },
]

function Navbar() {
  const { pathname } = useLocation()
  // Which home section is on screen right now, e.g. 'skills'. Used to light up its link.
  const [activeSection, setActiveSection] = useState('')
  // True once the page is scrolled a little: the navbar then gets a soft shadow.
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const onHome = pathname === '/'

  // Share the navbar's height with the CSS (--navbar-height), so section links stop right
  // under the bar. It changes with the screen size (on phones the links get their own row).
  // When the bar doesn't stay on screen (phones: home and blog pages, see global.css) it covers
  // nothing, so the height shared is 0.
  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    function share() {
      const stays = getComputedStyle(header!).position === 'sticky'
      document.documentElement.style.setProperty('--navbar-height', `${stays ? header!.offsetHeight : 0}px`)
      // Its full height either way: phones use it to make the home hero fill exactly the first screen.
      document.documentElement.style.setProperty('--topbar-height', `${header!.offsetHeight}px`)
    }
    const observer = new ResizeObserver(share)
    observer.observe(header)
    window.addEventListener('resize', share)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', share)
    }
  }, [pathname])

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Whether a link is the current place: its page, or (on the home page) the section on screen.
  function isActive(link: NavItem) {
    // Page links are highlighted on their own address; section links (/#…) only through "match".
    const match = link.match ?? (link.to.startsWith('/#') ? undefined : link.to)
    const onSection = onHome && (link.to === `/#${activeSection}` || (link.sections?.includes(activeSection) ?? false))
    return onSection || (match !== undefined && pathname.startsWith(match))
  }

  // The list of links, used by the top bar and by the tab bar.
  const linkList = () => (
    <ul className="navbar__links">
      {/*
        Curly braces { } let you write JavaScript inside JSX.
        .map() goes through each item in the array and returns an <li> for it.
        React needs a unique "key" on each item in a list so it can keep track of them.
      */}
      {links.map((link) => (
        <li key={link.to}>
          <Link
            to={link.to}
            className={isActive(link) ? 'active' : undefined}
            // Home works like the back-to-top button: a smooth trip up, then the welcome plays.
            // From another page, the home page opens at the top and plays it (see HomePage.tsx).
            state={link.to === '/#home' ? { replayWelcome: true } : undefined}
            onClick={(event) => {
              // Home on the home page, or Studio / Founder on their own page: a smooth trip to the top.
              if ((link.to === '/#home' && onHome) || (!link.to.startsWith('/#') && pathname === link.to)) {
                event.preventDefault()
                goToTop()
              }
            }}
          >
            {/* The icon only shows on phones (see .navbar__icon in global.css). */}
            <span className="navbar__icon" aria-hidden="true">
              <Icon name={link.icon} size={20} />
            </span>
            <span className="navbar__label">
              {link.label}
              {/* The pulsing dot only shows when there's a post from the last 30 days. */}
              {link.dot && <span className="navbar__dot" aria-label="new post" />}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )

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
    <>
      {/* In JSX we write "className" instead of "class" (class is a reserved word in JavaScript). */}
      <header ref={headerRef} className={scrolled ? 'navbar navbar--scrolled' : 'navbar'}>
        {/*
          The brand: a small hexagon mark, then the name, Axihex. It glides back and forth across the
          empty space at the top (its "lane"), and the letters keep doing a little wave.
          Each letter is its own <span> with its position (--i), so the wave can run left to right.
          Screen readers just read the aria-label, not the separate letters.
        */}
        <div className="navbar__lane">
          {/* draggable={false}: a press that moves a little (easy on a moving target) would
              otherwise start dragging the link, and the click would be lost. */}
          <Link to="/#home" className="navbar__brand" aria-label={`${profile.brand}, home`} draggable={false}>
            <AxihexMark className="brand__mark" />
            <span aria-hidden="true">
              {[...profile.brand].map((letter, i) => (
                <span key={i} className="brand__letter" style={{ '--i': i } as CSSProperties}>
                  {/* A normal space would collapse, so use a non-breaking one. */}
                  {letter === ' ' ? '\u00A0' : letter}
                </span>
              ))}
            </span>
          </Link>
        </div>
        <nav className="navbar__nav">
          {linkList()}
        </nav>
        <ThemeToggle />
      </header>

      {/* The tab bar: the same links at the bottom of the screen, on every page. Only shown on
          phones (CSS: display none elsewhere, which also hides it from screen readers). */}
      <nav className="tabbar tabbar--visible" aria-label="Sections">
        {linkList()}
      </nav>
    </>
  )
}

export default Navbar
