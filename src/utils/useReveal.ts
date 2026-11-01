// Makes the items of a list appear one by one as you scroll down to them.
// Put the returned ref on the list, and give the list the class "timeline--reveal"
// (the animation itself is in global.css). Used by Experience and the blog posts.
// watchKey: change it whenever the list's items change (e.g. after filtering), so the new items
// are watched too. Items that were already shown stay shown.
// repeat: when true, an item hides again once you scroll back up past it (it goes off the bottom
// of the screen), so scrolling down again plays its animation again.

import { useEffect, useRef } from 'react'

export function useReveal<T extends HTMLElement>(itemSelector = '.timeline__item', watchKey = '', repeat = false) {
  // Points at the list, so we can watch its items scroll into view.
  const listRef = useRef<T>(null)

  useEffect(() => {
    const items = listRef.current?.querySelectorAll<HTMLElement>(itemSelector)
    if (!items) return

    // IntersectionObserver tells us when an element enters the screen.
    // When it does, we add "is-visible" and the CSS animation plays (once, or again each time with "repeat").
    const list = [...items]
    function reveal(item: HTMLElement, order: number) {
      // If several items come into view at the same moment, show them one after another.
      item.style.setProperty('--reveal-delay', `${order * 0.2}s`)
      item.classList.add('is-visible')
      if (!repeat) observer.unobserve(item)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let order = 0
        for (const entry of entries) {
          const item = entry.target as HTMLElement
          if (!entry.isIntersecting) {
            // Fully off screen BELOW (you scrolled back up past it): hide it so it can play again.
            // Items that left through the top stay shown, so nothing blinks while scrolling down.
            if (repeat && entry.boundingClientRect.top > 0) item.classList.remove('is-visible')
            continue
          }
          if (entry.intersectionRatio < 0.15) continue
          // A jump down the page can skip items without them ever being on screen.
          // Those are above this one, so show them too instead of leaving gaps.
          const index = list.indexOf(item)
          list.slice(0, index + 1).forEach((item) => {
            if (!item.classList.contains('is-visible')) reveal(item, order++)
          })
        }
      },
      // 0: tells us when an item is completely gone; 0.15: when enough of it is showing.
      { threshold: [0, 0.15] },
    )

    items.forEach((item) => observer.observe(item))
    // Cleanup: stop watching when the list leaves the page.
    return () => observer.disconnect()
  }, [itemSelector, watchKey, repeat])

  return listRef
}
