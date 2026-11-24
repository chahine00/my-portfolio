// A soft light that follows the mouse across cards (projects, blog posts, the studio's pillar panel and capabilities,
// the mindset, the contact boxes and form): a premium touch on bigger screens. It only shares the
// mouse position with the card under it (--spot-x / --spot-y); the light itself is CSS
// ("card spotlight" in global.css). Off on touch screens and for people who turn off animations.

import { useEffect } from 'react'

// The cards that get the light. Keep in sync with the "card spotlight" selectors in global.css.
export const SPOTLIGHT_CARDS =
  '.card, .caps__item, .hive-panel, .trait, .value-grid li, .mindset__item, .contact-panel, .contact-tile'

function Spotlight() {
  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!canHover || calm) return

    function onMove(event: PointerEvent) {
      const card = (event.target as Element | null)?.closest?.<HTMLElement>(SPOTLIGHT_CARDS)
      if (!card) return
      const rect = card.getBoundingClientRect()
      card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
      card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    return () => document.removeEventListener('pointermove', onMove)
  }, [])

  return null
}

export default Spotlight
