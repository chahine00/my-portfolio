// The navigation bar at the top of the page.
// On phones every link shows an icon with a small label (so all seven fit on one row), and the menu
// "moves" to the bottom of the screen once you scroll: the top bar scrolls away with the page and a
// matching bar slides up at the bottom (the "tab bar", see the end of this file). Same on every
// page, except the Blog list, where the Blog bar (search + categories) sticks at the top instead.

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useLocation } from 'react-router'
import { hasRecentUpdate } from '../data/updates.ts'
import { profile } from '../data/profile.ts'
import ThemeToggle from './ThemeToggle.tsx'
import Icon from './Icon.tsx'
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
  section?: string // a page link that also has a section on the home page (its id): highlight it there too
  dot?: boolean // show the pulsing "new" dot
  icon: IconName // shown on phones, above the label
}

const links: NavItem[] = [
  { to: '/#about', label: 'About', icon: 'user' },
  { to: '/#projects', label: 'Projects', match: '/projects', icon: 'folder' },
  { to: '/#experience', label: 'Experience', icon: 'briefcase' },
  { to: '/#skills', label: 'Skills', icon: 'code' },
  { to: '/#education', label: 'Education', icon: 'cap' },
  { to: '/blog', label: 'Blog', section: 'blog', dot: hasRecentUpdate, icon: 'pen' },
  { to: '/#contact', label: 'Contact', icon: 'chat' },
]

function Navbar() {
  const { pathname } = useLocation()
  // Which home section is on screen right now, e.g. 'skills'. Used to light up its link.
  const [activeSection, setActiveSection] = useState('')
  // True once the page is scrolled a little: the navbar then gets a soft shadow.
  const [scrolled, setScrolled] = useState(false)
  // Phones: true once the top bar's row of links starts scrolling out of view, which brings up the
  // tab bar. (Not waiting for the whole bar to leave: a half-hidden row of links is hard to tap,
  // so there's always one usable menu on screen.)
  const [pastTopBar, setPastTopBar] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const linksRowRef = useRef<HTMLElement>(null)
  const onHome = pathname === '/'
  // The Blog list has its own sticky bar at the top; a tab bar too would leave too little room for the posts.
  const showTabbar = pathname !== '/blog'

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
      // Where the row of links starts on the page (the header sits at the very top of the page).
      const row = linksRowRef.current
      const rowTop = row ? row.getBoundingClientRect().top + window.scrollY : (headerRef.current?.offsetHeight ?? 0)
      setPastTopBar(window.scrollY > rowTop)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Whether a link is the current place: its page, or (on the home page) the section on screen.
  function isActive(link: NavItem) {
    // Page links are highlighted on their own address; section links (/#…) only through "match".
    const match = link.match ?? (link.to.startsWith('/#') ? undefined : link.to)
    const onSection = onHome && (link.to === `/#${activeSection}` || link.section === activeSection)
    return onSection || (match !== undefined && pathname.startsWith(match))
  }

  // The list of links, used by the top bar and by the tab bar.
  const linkList = (
    <ul className="navbar__links">
      {/*
        Curly braces { } let you write JavaScript inside JSX.
        .map() goes through each item in the array and returns an <li> for it.
        React needs a unique "key" on each item in a list so it can keep track of them.
      */}
      {links.map((link) => (
        <li key={link.to}>
          <Link to={link.to} className={isActive(link) ? 'active' : undefined}>
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
          The name is shown as a code tag, <Ali Chahine />. It glides back and forth across the
          empty space at the top (its "lane"), the letters keep doing a little wave, and the tags breathe.
          Each letter is its own <span> with its position (--i), so the wave can run left to right.
          Screen readers just read the aria-label, not the separate letters.
        */}
        <div className="navbar__lane">
          {/* draggable={false}: a press that moves a little (easy on a moving target) would
              otherwise start dragging the link, and the click would be lost. */}
          <Link to="/#home" className="navbar__brand" aria-label={profile.name} draggable={false}>
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
        </div>
        <nav className="navbar__nav" ref={linksRowRef}>
          {linkList}
        </nav>
        <ThemeToggle />
      </header>

      {/* The tab bar: the same links at the bottom of the screen. On every page but the Blog list,
          and only shown on phones (CSS), once the top bar has scrolled away. While hidden, "inert"
          keeps it out of reach of the keyboard and screen readers. */}
      {showTabbar && (
        <nav
          className={pastTopBar ? 'tabbar tabbar--visible' : 'tabbar'}
          aria-label="Sections"
          inert={!pastTopBar}
        >
          {linkList}
        </nav>
      )}
    </>
  )
}

export default Navbar
