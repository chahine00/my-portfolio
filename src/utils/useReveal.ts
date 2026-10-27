// Makes the items of a list appear one by one as you scroll down to them.
// Put the returned ref on the list, and give the list the class "timeline--reveal"
// (the animation itself is in global.css). Used by Experience and the blog posts.

import { useEffect, useRef } from 'react'

export function useReveal<T extends HTMLElement>(itemSelector = '.timeline__item') {
  // Points at the list, so we can watch its items scroll into view.
  const listRef = useRef<T>(null)

  useEffect(() => {
    const items = listRef.current?.querySelectorAll<HTMLElement>(itemSelector)
    if (!items) return

    // IntersectionObserver tells us when an element enters the screen.
    // When it does, we add "is-visible" and the CSS animation plays (only once).
    const list = [...items]
    function reveal(item: HTMLElement, order: number) {
      // If several items come into view at the same moment, show them one after another.
      item.style.setProperty('--reveal-delay', `${order * 0.2}s`)
      item.classList.add('is-visible')
      observer.unobserve(item)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let order = 0
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          // A jump down the page can skip items without them ever being on screen.
          // Those are above this one, so show them too instead of leaving gaps.
          const index = list.indexOf(entry.target as HTMLElement)
          list.slice(0, index + 1).forEach((item) => {
            if (!item.classList.contains('is-visible')) reveal(item, order++)
          })
        }
      },
      { threshold: 0.15 },
    )

    items.forEach((item) => observer.observe(item))
    // Cleanup: stop watching when the list leaves the page.
    return () => observer.disconnect()
  }, [itemSelector])

  return listRef
}
