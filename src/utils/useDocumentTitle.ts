// Gives a page its own title, description and address for search engines, e.g. "Cinetwork | Ali Chahine".
// The title also shows in the browser tab, bookmarks and history.
//
// Each page's HTML file already has the right tags when it's first opened (scripts/seo-plugin.ts).
// This keeps them right while you move between pages inside the site without reloading.
// Leaving the page puts the home page's tags back.

import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { HOME_DESCRIPTION, SITE_TITLE, absoluteUrl, pageTitle } from '../data/seo.ts'

interface Options {
  description?: string // the page's own description; the home page's if left out
  noindex?: boolean // keep the page out of Google (pages that don't exist)
}

// Finds a <meta> or <link> in the <head>, or makes it if it isn't there yet.
function headTag(selector: string, create: () => HTMLElement) {
  let tag = document.head.querySelector<HTMLElement>(selector)
  if (!tag) {
    tag = create()
    document.head.appendChild(tag)
  }
  return tag
}

function setTags(title: string, description: string, url: string, noindex: boolean) {
  document.title = title
  headTag('meta[name="description"]', () => Object.assign(document.createElement('meta'), { name: 'description' })).setAttribute(
    'content',
    description,
  )
  headTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' })).setAttribute('href', url)
  headTag('meta[name="robots"]', () => Object.assign(document.createElement('meta'), { name: 'robots' })).setAttribute(
    'content',
    noindex ? 'noindex' : 'index, follow, max-image-preview:large',
  )
}

export function useDocumentTitle(title?: string, { description, noindex = false }: Options = {}) {
  const { pathname } = useLocation()
  useEffect(() => {
    setTags(pageTitle(title), description ?? HOME_DESCRIPTION, absoluteUrl(pathname), noindex)
    return () => setTags(SITE_TITLE, HOME_DESCRIPTION, absoluteUrl('/'), false)
  }, [title, description, noindex, pathname])
}
