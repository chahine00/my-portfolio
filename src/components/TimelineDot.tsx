// The clickable dot next to each item on a timeline (jobs, blog posts).
// It's an invisible button sitting on top of the dot that the CSS draws (.timeline__item::before).
// Clicking it marks its item as selected (the dot grows, see global.css) and scrolls the item
// to the middle of the screen.

import type { MouseEvent } from 'react'

function TimelineDot({ label }: { label: string }) {
  function select(event: MouseEvent<HTMLButtonElement>) {
    const item = event.currentTarget.closest('.timeline__item')
    if (!item) return

    // The class is added by hand (not through React), like "is-visible" in useReveal.ts,
    // so the two don't overwrite each other. Only one item per timeline is selected.
    item.parentElement?.querySelectorAll('.is-selected').forEach((other) => other.classList.remove('is-selected'))
    item.classList.add('is-selected')

    // People who turn off animations jump straight there.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    item.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
  }

  return <button type="button" className="timeline__dot" aria-label={`Go to ${label}`} onClick={select} />
}

export default TimelineDot
