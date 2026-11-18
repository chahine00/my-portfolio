// Phones: a small "← All posts" button (or any label) at the bottom left, above the tab bar, that
// shows up when you scroll UP in the middle of a long page and hides again when you scroll down.
// Scrolling up mid-page usually means you're thinking of leaving, so the way back is right under
// your thumb then, without covering the text while you read. It mirrors the back-to-top button on
// the right. It stays hidden while the page's own way back is on screen (the back link at the top,
// or the Older/Newer row and its "All …" button at the end), and fades out by itself a few
// seconds after you stop scrolling. Bigger screens don't show it
// (global.css): the page's links are easy to reach there.

import { useEffect, useRef, useState } from 'react'

const SHOW_AFTER_UP_PX = 40 // scrolled up this far in one go: it shows
const HIDE_AFTER_DOWN_PX = 12 // scrolled down this far: it hides (you're reading again)
const TOP_ZONE_PX = 400 // this close to the top, the page's own back link is in view: no button
const HIDE_AFTER_MS = 4000 // after the last scroll, it fades out by itself
// The page's own ways back: while one of them is on screen, the button isn't needed.
const OWN_LINKS = '.section > .back-link, .post__nav, .post__all'

interface ScrollUpBackProps {
  label: string
  onClick: () => void
}

function ScrollUpBack({ label, onClick }: ScrollUpBackProps) {
  const [visible, setVisible] = useState(false)
  const lastY = useRef(0)
  const upSince = useRef(0) // where the current scroll up started
  const downSince = useRef(0) // where the current scroll down started
  const hideTimer = useRef<number | undefined>(undefined)
  // How many of the page's own back links are on screen right now.
  const ownInView = useRef(0)

  useEffect(() => {
    const onScreen = new Set<Element>()
    const watcher = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target)
        else onScreen.delete(entry.target)
      }
      ownInView.current = onScreen.size
      if (onScreen.size > 0) setVisible(false)
    })
    document.querySelectorAll(OWN_LINKS).forEach((el) => watcher.observe(el))

    lastY.current = window.scrollY
    upSince.current = window.scrollY
    downSince.current = window.scrollY

    function handleScroll() {
      const y = window.scrollY
      const goingUp = y < lastY.current
      if (goingUp) downSince.current = y
      else upSince.current = y
      lastY.current = y

      if (y < TOP_ZONE_PX || ownInView.current > 0) {
        setVisible(false)
        return
      }
      if (goingUp && upSince.current - y >= SHOW_AFTER_UP_PX) setVisible(true)
      if (!goingUp && y - downSince.current >= HIDE_AFTER_DOWN_PX) setVisible(false)

      window.clearTimeout(hideTimer.current)
      hideTimer.current = window.setTimeout(() => setVisible(false), HIDE_AFTER_MS)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.clearTimeout(hideTimer.current)
      watcher.disconnect()
    }
  }, [])

  return (
    <button
      type="button"
      className={visible ? 'scroll-up-back scroll-up-back--visible' : 'scroll-up-back'}
      onClick={onClick}
      // While hidden it can't be reached with the keyboard or a screen reader (the page's own
      // links at the top and bottom do the same thing).
      inert={!visible}
    >
      <span aria-hidden="true">←</span> {label}
    </button>
  )
}

export default ScrollUpBack
