// Remembers which project page you just left, so the phone's back gesture (or the browser's back
// button) to the home page lands on that project's card, like the page's "All projects" buttons.
// Kept for a few seconds only: it's about the step back you're taking right now.

const KEY = 'project-just-left'
const FRESH_MS = 5000

export function rememberProjectLeft(slug: string) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ slug, at: Date.now() }))
  } catch {
    // Storage blocked: the home page just opens where it would anyway.
  }
}

// The project left a moment ago, if any (still saved: see forgetProjectLeft).
export function projectJustLeft(): string | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) ?? 'null')
    return saved && typeof saved.slug === 'string' && Date.now() - saved.at < FRESH_MS ? saved.slug : null
  } catch {
    return null
  }
}

// Used up: the home page has opened, so it doesn't apply to a later visit.
export function forgetProjectLeft() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // Nothing to clear.
  }
}

// Scrolls the home page to a project's card (just under the navbar, see .project-card's
// scroll-margin-top) and keeps it there for a moment: pictures above it can still be loading and
// push it down (or up) after the jump. It lets go as soon as you scroll or touch the page yourself.
export function scrollToProjectCard(slug: string): boolean {
  const card = document.querySelector<HTMLElement>(`[data-project-slug="${CSS.escape(slug)}"]`)
  if (!card) return false
  card.scrollIntoView({ block: 'start', behavior: 'instant' })
  const wanted = card.getBoundingClientRect().top
  const until = performance.now() + 1500
  let frame = 0
  function letGo() {
    cancelAnimationFrame(frame)
    window.removeEventListener('wheel', letGo)
    window.removeEventListener('touchstart', letGo)
    window.removeEventListener('keydown', letGo)
  }
  function hold() {
    const drift = card!.getBoundingClientRect().top - wanted
    if (Math.abs(drift) > 1) window.scrollBy({ top: drift, behavior: 'instant' })
    if (performance.now() < until) frame = requestAnimationFrame(hold)
    else letGo()
  }
  window.addEventListener('wheel', letGo, { passive: true })
  window.addEventListener('touchstart', letGo, { passive: true })
  window.addEventListener('keydown', letGo)
  frame = requestAnimationFrame(hold)
  return true
}
