// The footer at the bottom of every page, kept compact: one row on wide screens (the Axihex mark
// with what it is and where | the links | the social icons), two short rows on phones.

import { Link } from 'react-router'
import SocialLinks from './SocialLinks.tsx'
import AxihexMark from './AxihexMark.tsx'
import { profile } from '../data/profile.ts'

// The footer's links: "to" is a page or a home page section.
const links = [
  { to: '/studio', label: 'Studio' },
  { to: '/#projects', label: 'Selected work' },
  { to: '/blog', label: 'Insights' },
  { to: '/background', label: 'Founder & CV' },
  { to: '/#contact', label: 'Contact' },
]

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Link to="/#home" className="footer__logo" state={{ replayWelcome: true }}>
            <AxihexMark className="footer__mark" /> {profile.brand}
          </Link>
          {/* The studio's line, the same as the Studio page's headline, then where it is. */}
          <p>
            Where we see an opportunity, we build it.
            <br />
            Independent software studio · {profile.location}
          </p>
        </div>

        <nav className="footer__nav" aria-label="Footer">
          <ul>
            {links.map((item) => (
              <li key={item.label}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <SocialLinks />
      </div>
    </footer>
  )
}

export default Footer
