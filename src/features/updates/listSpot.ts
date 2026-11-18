// Remembers where the Blog list was scrolled to, and which search/category it showed, so coming
// back from a post (its Back button, or the browser's back button) opens the list right there.
// Kept in sessionStorage: it lasts while the tab is open, and survives a page reload.

const KEY = 'blog-list-spot'

export interface ListSpot {
  search: string // e.g. "?category=Engineering", or "" for the full list
  y: number // how far down the page was scrolled
}

export function saveListSpot(spot: ListSpot) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(spot))
  } catch {
    // Storage blocked (private mode on some browsers): the list just opens at the top.
  }
}

export function readListSpot(): ListSpot | null {
  try {
    const spot = JSON.parse(sessionStorage.getItem(KEY) ?? 'null')
    return spot && typeof spot.y === 'number' && typeof spot.search === 'string' ? spot : null
  } catch {
    return null
  }
}
