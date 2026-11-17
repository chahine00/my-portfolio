// The footer at the bottom of the page.

import SocialLinks from './SocialLinks.tsx'
import { setDuckHome, useDuckHome } from './duckStore.ts'

// Normal JavaScript works in a component file too.
// This gets the current year (for example 2026) so the footer never goes out of date.
const year = new Date().getFullYear()

function Footer() {
  // The visitor sent the rubber duck home: offer to bring it back.
  const duckHome = useDuckHome()

  return (
    <footer className="footer">
      <SocialLinks />
      {/* {year} inserts the value of the "year" variable into the text. */}
      <p>
        © {year} Ali Chahine · Built with React &amp; TypeScript · Hosted on AWS ·{' '}
        <a href="https://github.com/chahine00/my-portfolio" target="_blank" rel="noreferrer">
          View source
        </a>
        {duckHome && (
          <>
            {' · '}
            <button type="button" className="footer__duck" onClick={() => setDuckHome(false)}>
              Bring the duck back 🦆
            </button>
          </>
        )}
      </p>
    </footer>
  )
}

export default Footer
