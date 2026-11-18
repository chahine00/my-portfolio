// Gives a page its own browser tab title, e.g. "Cinetwork — Ali Chahine". The title also shows in
// bookmarks and history, and when the link is shared. Leaving the page puts the site's usual title
// back (the one in index.html).

import { useEffect } from 'react'
import { profile } from '../data/profile.ts'

const SITE_TITLE = `${profile.name} — ${profile.role}`

export function useDocumentTitle(pageTitle?: string) {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} — ${profile.name}` : SITE_TITLE
    return () => {
      document.title = SITE_TITLE
    }
  }, [pageTitle])
}
