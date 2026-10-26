// A round "back to top" button that floats at the bottom of every page.
// It only shows while you're scrolling (and not at the top of the page), then fades out
// a moment after you stop, so it doesn't sit on top of what you're reading.

import { useEffect, useRef, useState } from 'react'

// How long the button stays after the last scroll, in milliseconds.
const HIDE_AFTER_MS = 2000

function BackToTop() {
  // True while the visitor is scrolling (and for a moment after) below the top of the page.
  const [scrolling, setScrolling] = useState(false)
  // True while the mouse is over the button or it has keyboard focus: it then stays put.
  const [held, setHeld] = useState(false)
  // useRef keeps the timer between renders without causing a re-render.
  const hideTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    function handleScroll() {
      window.clearTimeout(hideTimer.current)
      if (window.scrollY <= 400) {
        setScrolling(false)
        return
      }
      setScrolling(true)
      hideTimer.current = window.setTimeout(() => setScrolling(false), HIDE_AFTER_MS)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.clearTimeout(hideTimer.current)
    }
  }, [])

  function scrollToTop() {
    // Smooth scrolling, unless the visitor turned on "reduce motion" in their system settings.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const visible = scrolling || (held && window.scrollY > 400)

  return (
    <button
      type="button"
      className={visible ? 'back-to-top back-to-top--visible' : 'back-to-top'}
      onClick={scrollToTop}
      // Only a real mouse or keyboard focus keeps it; a finger tap on a phone shouldn't make it stick.
      onPointerEnter={(event) => event.pointerType === 'mouse' && setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={(event) => event.currentTarget.matches(':focus-visible') && setHeld(true)}
      onBlur={() => setHeld(false)}
      aria-label="Back to top"
      title="Back to top"
    >
      ↑
    </button>
  )
}

export default BackToTop
