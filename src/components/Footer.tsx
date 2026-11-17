// The footer at the bottom of the page.

import SocialLinks from './SocialLinks.tsx'
import FooterRobot from './FooterRobot.tsx'

// Normal JavaScript works in a component file too.
// This gets the current year (for example 2026) so the footer never goes out of date.
const year = new Date().getFullYear()

function Footer() {
  return (
    <footer className="footer">
      <SocialLinks />
      {/* {year} inserts the value of the "year" variable into the text. */}
      {/* The last line, with a tiny robot patrolling on top of it (FooterRobot.tsx). */}
      <p className="footer__line">
        <span className="footer__track">
          <FooterRobot />
          © {year} Ali Chahine · Built with React &amp; TypeScript · Hosted on AWS ·{' '}
          <a href="https://github.com/chahine00/my-portfolio" target="_blank" rel="noreferrer">
            View source
          </a>
        </span>
      </p>
    </footer>
  )
}

export default Footer
