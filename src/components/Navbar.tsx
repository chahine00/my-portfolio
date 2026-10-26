// The navigation bar at the top of the page.

import { Link, useLocation } from 'react-router'
import { hasRecentUpdate } from '../data/updates.ts'
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
  { to: '/#experience', label: 'Experience' },
  { to: '/#projects', label: 'Projects', match: '/projects' },
  { to: '/#skills', label: 'Skills' },
  { to: '/updates', label: 'Updates', dot: hasRecentUpdate },
  { to: '/#contact', label: 'Contact' },
]

function Navbar() {
  const { pathname } = useLocation()

  return (
    // In JSX we write "className" instead of "class" (class is a reserved word in JavaScript).
    <header className="navbar">
      <Link to="/#home" className="navbar__brand">
        Ali Chahine
      </Link>
      <nav>
        <ul className="navbar__links">
          {/*
            Curly braces { } let you write JavaScript inside JSX.
            .map() goes through each item in the array and returns an <li> for it.
            React needs a unique "key" on each item in a list so it can keep track of them.
          */}
          {links.map((link) => {
            // Page links are highlighted on their own address; section links (/#…) only through "match".
            const match = link.match ?? (link.to.startsWith('/#') ? undefined : link.to)
            return (
              <li key={link.to}>
                <Link to={link.to} className={match && pathname.startsWith(match) ? 'active' : undefined}>
                  {link.label}
                  {/* The pulsing dot only shows when there's a post from the last 30 days. */}
                  {link.dot && <span className="navbar__dot" aria-label="new post" />}
                </Link>
              </li>
            )
          })}
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Navbar
