// A round "back to top" button that floats near the bottom of every page.
// It appears while you scroll (once you're past the top of the page) and fades out
// 2 seconds after you stop, so it doesn't sit on top of what you're reading. Once the footer is on
// screen it stays shown, floating over the footer at the same spot.
// It never shows over the Skills section.

import { useEffect, useRef, useState } from 'react'
import type { MouseEvent, PointerEvent } from 'react'
import Icon from './Icon.tsx'
import { goToTop } from '../utils/goToTop.ts'

// How long the button stays after the last scroll, in milliseconds.
const HIDE_AFTER_MS = 2000

// True while the Skills section (home page) is under the button, near the bottom of the screen.
// The button stays hidden there.
function isOverSkills() {
  const skills = document.getElementById('skills')
  if (!skills) return false
  const { top, bottom } = skills.getBoundingClientRect()
  const buttonZone = window.innerHeight - 80 // roughly where the button sits
  return top < buttonZone && bottom > buttonZone
}

// True once the footer is on screen: the end of the page, where the button stays shown.
function isAtFooter() {
  const footer = document.querySelector('.footer')
  return !!footer && footer.getBoundingClientRect().top < window.innerHeight
}

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
      const show = window.scrollY > 400 && !isOverSkills()
      setVisible(show)
      if (show && !isAtFooter()) {
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
    goToTop()
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
      className={visible || (hovered && !isOverSkills()) ? 'back-to-top back-to-top--visible' : 'back-to-top'}
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
