// The footer at the bottom of every page, kept compact: one row on wide screens (the Axihex mark
// with what it is and where | the links | the social icons), two short rows on phones.
// At the end of the page, the floating back-to-top button lifts to sit just above the footer, so it
// never covers the footer's links or icons.

import { useEffect, useRef } from 'react'
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
  const footerRef = useRef<HTMLElement>(null)

  // How far the back-to-top button must rise to clear the footer (--footer-lift, used in global.css).
  useEffect(() => {
    const root = document.documentElement
    function update() {
      const footer = footerRef.current
      const button = document.querySelector<HTMLElement>('.back-to-top')
      if (!footer || !button) return
      const overlap = window.innerHeight - footer.getBoundingClientRect().top
      const gap = parseFloat(getComputedStyle(button).bottom) || 0
      root.style.setProperty('--footer-lift', `${Math.max(0, Math.round(overlap - gap + 12))}px`)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      root.style.removeProperty('--footer-lift')
    }
  }, [])

  return (
    <footer className="footer" ref={footerRef}>
      <div className="footer__inner">
        <div className="footer__brand">
          <Link to="/#home" className="footer__logo" state={{ replayWelcome: true }}>
            <AxihexMark className="footer__mark" /> {profile.brand}
          </Link>
          <p>
            Independent software studio
            <br />
            {profile.location}
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
