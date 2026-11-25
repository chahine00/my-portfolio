// The trail of pages visited in this tab, so every "Back to …" control returns to the page you were
// really on before (and says its name), instead of a fixed page.
//
// - App.tsx records each page you open (recordVisit) and, on the home page, which section was on
//   screen when you left it (rememberHomeSection), so going back lands at that section.
// - Pages ask for their way back with useBack(). Pages of the same kind are skipped: after browsing
//   project → next project → next project, "Back" returns to where you came from before the projects.
// - Going back trims the trail (and so does the browser's back button), so the next "Back" from
//   there keeps walking back instead of bouncing between two pages.

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { projects } from '../data/projects.ts'
import { sortedUpdates } from '../data/updates.ts'

interface Visit {
  path: string // e.g. '/blog' or '/projects/cinetwork'
  search: string // e.g. '?category=Ideas'
}

const TRAIL_KEY = 'page-trail'
const HOME_SECTION_KEY = 'home-section'
const MAX = 40

function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(sessionStorage.getItem(key) ?? 'null') ?? fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage blocked: back links use each page's default instead.
  }
}

// Where "Back" just sent the visitor (its place in the trail), so recordVisit trims instead of adding.
let backTo: number | null = null

// The trail once this page is added: going back (a "Back" link, or the browser's back button) trims
// it to that page; any other page is added at the end. Pure: the page reads it before App.tsx saves it.
function withVisit(saved: Visit[], path: string, search: string) {
  let trail = [...saved]
  const last = trail[trail.length - 1]
  if (backTo !== null && trail[backTo]?.path === path) {
    trail = trail.slice(0, backTo + 1)
  } else if (trail.length > 1 && trail[trail.length - 2].path === path && last?.path !== path) {
    // Back to the page before (the browser's back button): step back in the trail too.
    trail = trail.slice(0, -1)
  } else if (last?.path !== path) {
    trail.push({ path, search })
  }
  trail[trail.length - 1] = { path, search } // keep the latest search (filters) of this page
  return trail.slice(-MAX)
}

export function recordVisit(path: string, search: string) {
  write(TRAIL_KEY, withVisit(read<Visit[]>(TRAIL_KEY, []), path, search))
  backTo = null
}

// Called just before leaving the home page: the section crossing the middle of the screen.
export function rememberHomeSection() {
  const middle = window.innerHeight / 2
  const section = [...document.querySelectorAll<HTMLElement>('main section[id]')].find((el) => {
    const box = el.getBoundingClientRect()
    return box.top <= middle && box.bottom >= middle
  })
  write(HOME_SECTION_KEY, section?.id ?? 'home')
}

// What kind of page an address is: pages of the same kind are skipped when going back.
function kindOf(path: string) {
  if (path.startsWith('/projects/')) return 'project'
  if (path.startsWith('/blog/')) return 'post'
  return path
}

// The page's name, for "← Back to …".
function nameOf(path: string) {
  if (path === '/') return 'Home'
  if (path === '/blog') return 'Blog'
  if (path === '/studio') return 'Studio'
  if (path === '/background') return 'Founder'
  if (path.startsWith('/projects/')) return projects.find((p) => `/projects/${p.slug}` === path)?.title ?? 'the project'
  if (path.startsWith('/blog/')) return sortedUpdates.find((u) => `/blog/${u.slug}` === path)?.title ?? 'the post'
  return 'previous page'
}

export interface Back {
  path: string // the page going back to (no search or #section)
  label: string // its name
  homeSection: string // going back to the home page: the section it was left at
  go: (options?: { homeHash?: string; state?: unknown }) => void
}

// The way back from the current page. "fallback": where to go when there is no earlier page
// (opened from a shared link or a bookmark), e.g. '/' or '/blog'.
export function useBack(currentPath: string, fallback: string): Back {
  const navigate = useNavigate()
  // Decided once, when the page opens (before App.tsx records this visit).
  const [found] = useState(() => {
    // The trail as it will be with this page in it (its last entry is this page).
    const trail = withVisit(read<Visit[]>(TRAIL_KEY, []), currentPath, '')
    const kind = kindOf(currentPath)
    for (let i = trail.length - 2; i >= 0; i--) {
      if (trail[i].path !== currentPath && kindOf(trail[i].path) !== kind) return { index: i, visit: trail[i] }
    }
    return null
  })
  const visit = found?.visit ?? { path: fallback, search: '' }

  const [homeSection] = useState(() => read<string>(HOME_SECTION_KEY, 'home'))

  return {
    path: visit.path,
    label: nameOf(visit.path),
    homeSection,
    go(options) {
      backTo = found ? found.index : null
      if (visit.path === '/') {
        // The home page: back to the section you left it at (or the one this page asks for).
        const section = options?.homeHash ?? homeSection
        navigate(`/#${section}`, { state: options?.state })
      } else {
        navigate(visit.path + visit.search, { state: options?.state })
      }
    },
  }
}
