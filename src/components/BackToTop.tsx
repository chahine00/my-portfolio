// A round "back to top" button that floats in the bottom-right corner of every page.
// It only appears once you've scrolled down, so it doesn't cover the top of the page.

import { useEffect, useState } from 'react'
import type { MouseEvent, PointerEvent } from 'react'

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollToTop() {
    // After a trackpad or finger "flick" the page keeps gliding for a moment, and that glide
    // would cancel the trip to the top. So while we travel up, the leftover glide is ignored:
    // until the page reaches the top, or 1.5 seconds at most.
    const ignoreGlide = (event: Event) => event.preventDefault()
    window.addEventListener('wheel', ignoreGlide, { passive: false })
    window.addEventListener('touchmove', ignoreGlide, { passive: false })

    function release() {
      window.removeEventListener('wheel', ignoreGlide)
      window.removeEventListener('touchmove', ignoreGlide)
      window.removeEventListener('scroll', releaseAtTop)
      window.clearTimeout(timer)
    }
    function releaseAtTop() {
      if (window.scrollY <= 1) release()
    }
    const timer = window.setTimeout(release, 1500)
    window.addEventListener('scroll', releaseAtTop, { passive: true })

    // Smooth scrolling, unless the visitor turned on "reduce motion" in their system settings.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  // React as soon as a finger or the mouse button goes down. On phones, a tap while the page
  // is still gliding only stops the glide and never becomes a "click", so waiting for the
  // click would make the button feel dead.
  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return // only the main mouse button (or a finger)
    event.preventDefault()
    scrollToTop()
  }

  // Keyboard users (Enter or Space) still get a normal click. Clicks from a mouse or finger
  // were already handled on pointer down; event.detail is 0 only for keyboard clicks.
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail === 0) scrollToTop()
  }

  return (
    <button
      type="button"
      className={visible ? 'back-to-top back-to-top--visible' : 'back-to-top'}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      aria-label="Back to top"
      title="Back to top"
    >
      ↑
    </button>
  )
}

export default BackToTop
