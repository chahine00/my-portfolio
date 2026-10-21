// The footer at the bottom of the page.

// Normal JavaScript works in a component file too.
// This gets the current year (for example 2026) so the footer never goes out of date.
const year = new Date().getFullYear()

function Footer() {
  return (
    <footer className="footer">
      {/* {year} inserts the value of the "year" variable into the text. */}
      <p>© {year} Ali Chahine. All rights reserved.</p>
    </footer>
  )
}

export default Footer
