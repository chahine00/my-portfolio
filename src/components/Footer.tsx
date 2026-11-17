// The footer at the bottom of the page.

import SocialLinks from './SocialLinks.tsx'
import { callDuckOut, useDuckSentHome } from './duckStore.ts'

// Normal JavaScript works in a component file too.
// This gets the current year (for example 2026) so the footer never goes out of date.
const year = new Date().getFullYear()

function Footer() {
  // The visitor let the rubber duck out, then sent it home with its "×": offer to bring it back.
  const duckHome = useDuckSentHome()

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
            <button type="button" className="footer__duck" onClick={() => callDuckOut(null)}>
              Bring the duck back 🦆
            </button>
          </>
        )}
      </p>
    </footer>
  )
}

export default Footer
