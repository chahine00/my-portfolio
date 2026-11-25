// Shown when the address doesn't match any page (e.g. a typo in the URL).

import { useLocation } from 'react-router'
import { useBack } from '../../utils/pageHistory.ts'
import { useDocumentTitle } from '../../utils/useDocumentTitle.ts'

function NotFound() {
  useDocumentTitle('Page not found', { noindex: true })
  // Back to the page you came from (the home page if there's none).
  const back = useBack(useLocation().pathname, '/')
  return (
    <section className="section not-found">
      <p className="not-found__code">404</p>
      <h1>Page not found</h1>
      <p>This page doesn't exist.</p>
      <button type="button" className="button" onClick={() => back.go()}>
        Back to {back.label}
      </button>
    </section>
  )
}

export default NotFound
