// Shown when the address doesn't match any page (e.g. a typo in the URL).

import { Link } from 'react-router'

function NotFound() {
  return (
    <section className="section not-found">
      <p className="not-found__code">404</p>
      <h1>Page not found</h1>
      <p>This page doesn't exist.</p>
      <Link to="/" className="button">
        Back to home
      </Link>
    </section>
  )
}

export default NotFound
