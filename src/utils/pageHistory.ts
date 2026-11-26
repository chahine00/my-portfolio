// The trail of pages visited in this tab, so every "Back to …" control returns to the page you were
// really on before (and says its name), instead of a fixed page.
//
// - App.tsx records each page you open (recordVisit) and, on the home page, which section was on
//   screen when you left it (rememberHomeSection), so going back lands at that section.
// - Pages ask for their way back with useBack(). Pages of the same kind are skipped: after browsing
//   project → next project → next project, "Back" returns to where you came from before the projects.
// - Going back trims the trail (and so does the browser's back button), so the next "Back" from
//   there keeps walking back instead of bouncing between two pages.
// - Each page's scroll position is saved the moment you leave it (rememberScroll), and going back
//   (a "Back" link or the browser's back button) returns to that exact spot (restoreScroll).

import { useState } from 'react'
import { useNavigate, useNavigationType } from 'react-router'
import { projects } from '../data/projects.ts'
import { sortedUpdates } from '../data/updates.ts'

interface Visit {
  path: string // e.g. '/blog' or '/projects/cinetwork'
  search: string // e.g. '?category=Ideas'
  scroll?: number // how far down the page was when you left it, in pixels
}

const TRAIL_KEY = 'page-trail'
const HOME_SECTION_KEY = 'home-section'
const MAX = 40
// How far down each history entry was (by its key), for the browser's back/forward buttons.
const ENTRY_SCROLL_KEY = 'scroll-by-entry'
// How far down each page (path + search) was the last time you left it, for the navbar.
const PAGE_SCROLL_KEY = 'scroll-by-page'
// The last page visited in each navbar section (e.g. the post you were reading), for the navbar.
const SECTION_KEY = 'section-last'
const MAX_SCROLLS = 80

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

// The current history entry's key and state, as React Router stores them in the browser's history.
// "resume" (set by the navbar): open the page where you last left it. "fromNav": opened from the navbar.
interface EntryState {
  resume?: boolean
  fromNav?: boolean
}
function historyEntry(): { key?: string; usr?: EntryState | null } {
  return (window.history.state as { key?: string; usr?: EntryState | null } | null) ?? {}
}

// Keeps a { name: number } map from growing forever: the most recent entries are kept.
function writeScrollMap(key: string, map: Record<string, number>) {
  const entries = Object.entries(map)
  write(key, Object.fromEntries(entries.slice(-MAX_SCROLLS)))
}

// Which navbar section a page belongs to. Each section remembers the last page you saw in it, so
// its navbar link takes you back there (the post you were reading, the project you were viewing).
export type NavSection = 'home' | 'studio' | 'work' | 'products' | 'founder' | 'blog'

function sectionOf(path: string): NavSection | null {
  if (path === '/') return 'home'
  if (path === '/studio') return 'studio'
  if (path === '/background') return 'founder'
  if (path === '/blog' || path.startsWith('/blog/')) return 'blog'
  if (path.startsWith('/projects/')) return 'work'
  if (path.startsWith('/products/')) return 'products'
  return null
}

// The last page (path + search) visited in a section, or null when there's none to go back to.
export function lastInSection(section: NavSection): string | null {
  return read<Partial<Record<NavSection, string>>>(SECTION_KEY, {})[section] ?? null
}

function setLastInSection(section: NavSection, page: string | null) {
  const saved = read<Partial<Record<NavSection, string>>>(SECTION_KEY, {})
  if (page === null) delete saved[section]
  else saved[section] = page
  write(SECTION_KEY, saved)
}

// Whether a page has a saved scroll position (the navbar then opens it right there).
export function hasSavedScroll(page: string): boolean {
  return read<Record<string, number>>(PAGE_SCROLL_KEY, {})[page] !== undefined
}

// Where "Back" just sent the visitor (its place in the trail), so recordVisit trims instead of adding.
let backTo: number | null = null

// The trail once this page is added: going back (a "Back" link, or the browser's back button) trims
// it to that page; any other page is added at the end. Pure: the page reads it before App.tsx saves it.
// "popped": opened with the browser's back/forward buttons. Only then does opening the page before
// the last one count as a step back: clicking a link to it again (project → Home → the same
// project) is a new visit, so "Back" from there still returns to Home.
function withVisit(saved: Visit[], path: string, search: string, popped: boolean) {
  let trail = [...saved]
  const last = trail[trail.length - 1]
  if (backTo !== null && trail[backTo]?.path === path) {
    trail = trail.slice(0, backTo + 1)
  } else if (popped && trail.length > 1 && trail[trail.length - 2].path === path && last?.path !== path) {
    // Back to the page before (the browser's back button): step back in the trail too.
    trail = trail.slice(0, -1)
  } else if (last?.path !== path) {
    trail.push({ path, search })
  }
  // Keep the latest search (filters) of this page, and its saved scroll position.
  trail[trail.length - 1] = { ...trail[trail.length - 1], path, search }
  return trail.slice(-MAX)
}

// Records the page just opened. Returns the scroll position to go back to when this was a step back
// (a "Back" link, or the browser's back button: "popped"), or null for any other visit.
export function recordVisit(path: string, search: string, popped: boolean): number | null {
  const saved = read<Visit[]>(TRAIL_KEY, [])
  const scroll = restoringTo(path, popped)
  const left = saved[saved.length - 1]?.path
  write(TRAIL_KEY, withVisit(saved, path, search, popped))
  backTo = null
  // Remember this page as its section's last one. The project (or product) pages' list lives on the
  // home page: going straight back to it from a project (Back, "All projects", the back button)
  // means you're done with that project, so the Work link goes to the list again. (Leaving through
  // the navbar doesn't count: Work then still takes you back to the project.)
  const section = sectionOf(path)
  if (section) setLastInSection(section, path + search)
  // Tapping Work (or Products) while on a project goes to its list (/#projects): that closes it too.
  const hash = window.location.hash
  const leftByNav = historyEntry().usr?.fromNav && !popped
  if (path === '/' && left?.startsWith('/projects/') && (!leftByNav || hash === '#projects')) setLastInSection('work', null)
  if (path === '/' && left?.startsWith('/products/') && (!leftByNav || hash === '#products')) setLastInSection('products', null)
  return scroll ?? null
}

// The saved spot this page is about to be brought back to (App.tsx restores it right after), or
// undefined. Pages call it when they open, to skip their own "where to open" scrolling in that case.
// "popped": opened with the browser's back/forward buttons.
export function restoringTo(path: string, popped: boolean): number | undefined {
  const entry = historyEntry()
  // The browser's back/forward buttons: the exact spot this history entry was left at.
  if (popped && entry.key) {
    const y = read<Record<string, number>>(ENTRY_SCROLL_KEY, {})[entry.key]
    if (y !== undefined) return y
  }
  // Opened from the navbar: where you last left this page.
  if (entry.usr?.resume) {
    const y = read<Record<string, number>>(PAGE_SCROLL_KEY, {})[path + window.location.search]
    if (y !== undefined) return y
  }
  const trail = read<Visit[]>(TRAIL_KEY, [])
  if (backTo !== null && trail[backTo]?.path === path) return trail[backTo].scroll
  const before = trail[trail.length - 2]
  const last = trail[trail.length - 1]
  if (popped && before?.path === path && last?.path !== path) return before.scroll
  return undefined
}

// Saves how far down the current page is, on its trail entry. App.tsx calls it as you scroll and
// just before you leave (any click). Only when the trail's last page is the one on screen: while
// moving to another page, its "open at the top" must not overwrite the spot of the page you left.
export function rememberScroll() {
  const trail = read<Visit[]>(TRAIL_KEY, [])
  const last = trail[trail.length - 1]
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const path = window.location.pathname.slice(base.length) || '/'
  if (!last || last.path !== path) return
  const y = Math.round(window.scrollY)
  trail[trail.length - 1] = { ...last, scroll: y }
  write(TRAIL_KEY, trail)
  // Also by history entry (back/forward buttons) and by page (the navbar). Re-inserted, so the
  // most recently used stay when the maps are trimmed.
  const key = historyEntry().key
  if (key) {
    const byEntry = read<Record<string, number>>(ENTRY_SCROLL_KEY, {})
    delete byEntry[key]
    byEntry[key] = y
    writeScrollMap(ENTRY_SCROLL_KEY, byEntry)
  }
  const page = path + window.location.search
  const byPage = read<Record<string, number>>(PAGE_SCROLL_KEY, {})
  delete byPage[page]
  byPage[page] = y
  writeScrollMap(PAGE_SCROLL_KEY, byPage)
}

// Brings the page back to a saved spot, and holds it there until it's settled: the page's own "open
// at the top" step, a page whose file is still downloading (slow connections), and pictures
// appearing above can all move it after the first jump. It holds until the page is tall enough to
// reach the spot AND the position has stayed put for a moment (at most 5 seconds), and lets go as
// soon as you scroll or touch the page yourself.
const SETTLED_MS = 600
const RESTORE_MAX_MS = 5000

export function restoreScroll(y: number) {
  const start = performance.now()
  let steadySince = 0
  let frame = 0
  function letGo() {
    cancelAnimationFrame(frame)
    window.removeEventListener('wheel', letGo)
    window.removeEventListener('touchstart', letGo)
    window.removeEventListener('keydown', letGo)
  }
  function hold() {
    const now = performance.now()
    const maxY = document.documentElement.scrollHeight - window.innerHeight
    const target = Math.min(y, Math.max(0, maxY))
    if (Math.abs(window.scrollY - target) > 1) {
      window.scrollTo({ top: target, left: 0, behavior: 'instant' })
      steadySince = 0
    } else if (!steadySince) {
      steadySince = now
    }
    const reachable = maxY >= y - 1
    const settled = reachable && steadySince > 0 && now - steadySince > SETTLED_MS
    if (settled || now - start > RESTORE_MAX_MS) letGo()
    else frame = requestAnimationFrame(hold)
  }
  window.addEventListener('wheel', letGo, { passive: true })
  window.addEventListener('touchstart', letGo, { passive: true })
  window.addEventListener('keydown', letGo)
  hold() // right away (before the page is painted), then every frame until it's settled
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

// A real page of the site (not a "Page not found" address, nor an old one that redirects).
function isPage(path: string) {
  if (['/', '/blog', '/studio', '/background'].includes(path)) return true
  if (path.startsWith('/projects/')) return projects.some((p) => `/projects/${p.slug}` === path)
  if (path.startsWith('/blog/')) return sortedUpdates.some((u) => `/blog/${u.slug}` === path)
  return false
}

// The page's name, for "← Back to …".
function nameOf(path: string) {
  if (path === '/') return 'Home'
  if (path === '/blog') return 'Blog'
  if (path === '/studio') return 'Studio'
  if (path === '/background') return 'Founder'
  // Kept short, so "← Back to …" fits on one line on phones: a project's name before its subtitle
  // ("boxMind AI", not "boxMind AI: the backend behind…"), and "the post" for a blog post.
  if (path.startsWith('/projects/'))
    return projects.find((p) => `/projects/${p.slug}` === path)?.title.split(':')[0] ?? 'the project'
  if (path.startsWith('/blog/')) return 'the post'
  return 'previous page'
}

export interface Back {
  path: string // the page going back to (no search or #section)
  label: string // its name
  homeSection: string // going back to the home page: the section it was left at
  go: (options?: { homeHash?: string; state?: unknown }) => void
}

// When the last "back" happened. A fast double click (or a double tap) on a back link used to
// navigate twice, leaving the same page twice in the browser's history (so its own Back button
// then had to be pressed twice); presses within REPEAT_MS of the last one are ignored.
let lastBack = -Infinity
const REPEAT_MS = 700

// The way back from the current page. "fallback": where to go when there is no earlier page
// (opened from a shared link or a bookmark), e.g. '/' or '/blog'.
export function useBack(currentPath: string, fallback: string): Back {
  const navigate = useNavigate()
  const popped = useNavigationType() === 'POP'
  // Decided once, when the page opens (before App.tsx records this visit).
  const [found] = useState(() => {
    // The trail as it will be with this page in it (its last entry is this page).
    const trail = withVisit(read<Visit[]>(TRAIL_KEY, []), currentPath, '', popped)
    const kind = kindOf(currentPath)
    for (let i = trail.length - 2; i >= 0; i--) {
      const path = trail[i].path
      if (path !== currentPath && kindOf(path) !== kind && isPage(path)) return { index: i, visit: trail[i] }
    }
    return null
  })
  const visit: Visit = found?.visit ?? { path: fallback, search: '' }

  const [homeSection] = useState(() => read<string>(HOME_SECTION_KEY, 'home'))

  return {
    path: visit.path,
    label: nameOf(visit.path),
    homeSection,
    go(options) {
      const now = performance.now()
      if (now - lastBack < REPEAT_MS) return
      lastBack = now
      backTo = found ? found.index : null
      if (visit.path === '/' && visit.scroll !== undefined) {
        // The home page, at the exact spot you left it (App.tsx restores it): no #section to jump to.
        navigate('/', { state: options?.state })
      } else if (visit.path === '/') {
        // The home page: back to the section you left it at (or the one this page asks for).
        const section = options?.homeHash ?? homeSection
        navigate(`/#${section}`, { state: options?.state })
      } else {
        navigate(visit.path + visit.search, { state: options?.state })
      }
    },
  }
}
