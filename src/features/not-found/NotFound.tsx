// Shown when the address doesn't match any page (e.g. a typo in the URL). Its button always goes
// to the home page: people often land here from a broken outside link, with no useful page behind.

import { Link } from 'react-router'
import { useDocumentTitle } from '../../utils/useDocumentTitle.ts'

function NotFound() {
  useDocumentTitle('Page not found', { noindex: true })
  return (
    <section className="section not-found">
      <p className="not-found__code">404</p>
      <h1>Page not found</h1>
      <p>This page doesn't exist.</p>
      <Link to="/" className="button">
        Back to Home
      </Link>
    </section>
  )
}

export default NotFound
