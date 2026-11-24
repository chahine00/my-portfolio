// The trip back to the top of the page, shared by the back-to-top button and the navbar's Home link.

// Sent on window once the trip to the top arrives. The hero listens for it and replays its drawing.
export const BACK_AT_TOP_EVENT = 'back-to-top:arrived'

// The smooth trip to the top of the page; once there, the hero replays its welcome drawing.
// Used by this button and by the navbar's Home link.
export function goToTop() {
  // After a trackpad or finger "flick" the page keeps gliding for a moment, and that glide
  // would cancel the trip to the top. So while we travel up, the leftover glide is ignored:
  // until the page reaches the top, or 1.5 seconds at most.
  const ignoreGlide = (event: Event) => event.preventDefault()
  window.addEventListener('wheel', ignoreGlide, { passive: false })
  window.addEventListener('touchmove', ignoreGlide, { passive: false })

  function release() {
    window.removeEventListener('wheel', ignoreGlide)
    window.removeEventListener('touchmove', ignoreGlide)
    window.clearTimeout(glideTimer)
  }
  const glideTimer = window.setTimeout(release, 1500)

  // Separately, watch for the arrival at the top, and tell the hero (it replays its drawing).
  // This waits longer than the glide guard above: from far down a long page, the smooth trip
  // up can take more than 1.5 seconds. It stops watching if you scroll back down on the way.
  let lastY = window.scrollY
  function stopWatching() {
    window.removeEventListener('scroll', watchArrival)
    window.removeEventListener('scrollend', watchArrival)
    window.clearTimeout(giveUpTimer)
  }
  function watchArrival() {
    const y = window.scrollY
    if (y <= 2) {
      stopWatching()
      release()
      window.dispatchEvent(new Event(BACK_AT_TOP_EVENT))
    } else if (y > lastY + 2) {
      stopWatching() // the visitor scrolled down again: no replay
    }
    lastY = y
  }
  const giveUpTimer = window.setTimeout(stopWatching, 6000)
  window.addEventListener('scroll', watchArrival, { passive: true })
  window.addEventListener('scrollend', watchArrival, { passive: true })

  // Already at the top: nothing to travel, so the welcome plays right away.
  if (window.scrollY <= 2) {
    stopWatching()
    release()
    window.dispatchEvent(new Event(BACK_AT_TOP_EVENT))
    return
  }

  // Smooth scrolling, unless the visitor turned on "reduce motion" in their system settings.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
}

// Keeps the address clean: once a section link (like /#contact) has done its job and the page has
// scrolled there, the "#contact" is taken out of the address bar, so it shows axihex.com/ (or
// /background). Only the address changes: no reload, no new history entry, no scroll. Links with
// a # (old ones in a CV or a bookmark, or the menu's) still work, they just don't leave it behind.
export function clearHash() {
  if (!window.location.hash) return
  window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search)
}
