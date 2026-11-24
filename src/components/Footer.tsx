// The footer at the bottom of every page: the Axihex mark and line, quick links in columns, the
// social icons, and the last line (with a tiny robot patrolling on top of it, FooterRobot.tsx).

import { Link } from 'react-router'
import SocialLinks from './SocialLinks.tsx'
import FooterRobot from './FooterRobot.tsx'
import AxihexMark from './AxihexMark.tsx'
import { profile } from '../data/profile.ts'
import { asset } from '../utils/asset.ts'
import { essence } from '../data/identity.ts'

// Normal JavaScript works in a component file too.
// This gets the current year (for example 2026) so the footer never goes out of date.
const year = new Date().getFullYear()

// The quick links, in columns. "to" starts with / (a page or a home section) or is a file.
const columns = [
  {
    title: 'Studio',
    links: [
      { to: '/#studio', label: 'About the studio' },
      { to: '/studio', label: 'Identity & vision' },
      { to: '/#projects', label: 'Work' },
      { to: '/blog', label: 'Blog' },
    ],
  },
  {
    title: 'Founder',
    links: [
      { to: '/background', label: `Meet ${profile.name.split(' ')[0]}` },
      { to: '/background#experience', label: 'Experience' },
      { to: '/Ali_Chahine_CV.pdf', label: 'Download CV', file: true },
    ],
  },
  {
    title: 'Contact',
    links: [
      { to: '/#contact', label: 'Start a project', topic: 'project' },
      { to: '/#contact', label: 'Get in touch' },
    ],
  },
]

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Link to="/#home" className="footer__logo" state={{ replayWelcome: true }}>
            <AxihexMark className="footer__mark" /> {profile.brand}
          </Link>
          <p>
            {profile.role}. {essence}
          </p>
          <SocialLinks />
        </div>

        <nav className="footer__nav" aria-label="Footer">
          {columns.map((column) => (
            <div key={column.title}>
              <p className="footer__heading">{column.title}</p>
              <ul>
                {column.links.map((item) => (
                  <li key={item.label}>
                    {'file' in item && item.file ? (
                      <a href={asset(item.to)} download="Ali_Chahine_CV.pdf">
                        {item.label}
                      </a>
                    ) : (
                      <Link to={item.to} state={'topic' in item ? { topic: item.topic } : undefined}>
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* {year} inserts the value of the "year" variable into the text. */}
      <div className="footer__line">
        <span className="footer__track">
          <FooterRobot />© {year} {profile.brand} · {profile.name} · Built with React &amp; TypeScript · Hosted on AWS ·{' '}
          <a href="https://github.com/chahine00/my-portfolio" target="_blank" rel="noreferrer">
            View source
          </a>
        </span>
      </div>
    </footer>
  )
}

export default Footer
