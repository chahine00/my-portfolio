// A round "back to top" button that floats near the bottom of every page.
// It appears while you scroll (once you're past the top of the page) and fades out
// 2 seconds after you stop, so it doesn't sit on top of what you're reading.

import { useEffect, useRef, useState } from 'react'
import type { MouseEvent, PointerEvent } from 'react'
import Icon from './Icon.tsx'

// How long the button stays after the last scroll, in milliseconds.
const HIDE_AFTER_MS = 2000

function BackToTop() {
  const [visible, setVisible] = useState(false)
  // True while the mouse is over the button: it then stays, so it can't vanish under the cursor.
  const [hovered, setHovered] = useState(false)
  // useRef keeps the timer between renders without re-drawing anything.
  const hideTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    function handleScroll() {
      window.clearTimeout(hideTimer.current)
      // React only re-draws when the value actually changes, so this stays cheap while scrolling.
      setVisible(window.scrollY > 400)
      if (window.scrollY > 400) {
        hideTimer.current = window.setTimeout(() => setVisible(false), HIDE_AFTER_MS)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.clearTimeout(hideTimer.current)
    }
  }, [])

  function scrollToTop() {
    // The mouse is still over the button after a click; don't let that keep it shown at the top.
    setHovered(false)
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
      className={visible || hovered ? 'back-to-top back-to-top--visible' : 'back-to-top'}
      onPointerDown={handlePointerDown}
      // Only a real mouse keeps it shown; a finger tap on a phone shouldn't make it stick.
      onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={handleClick}
      aria-label="Back to top"
      title="Back to top"
    >
      {/* An icon, not the ↑ character: phone fonts draw that character thin. */}
      <Icon name="arrow-up" size={24} />
    </button>
  )
}

export default BackToTop
