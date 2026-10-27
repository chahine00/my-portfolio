// Soft colored glows behind the whole page. They drift slowly on their own, and slide
// in different directions as you scroll, so the background feels alive.
// The colors are in global.css (--glow-1, --glow-2, --glow-3), with a set for light and dark mode.

import { useEffect, useRef } from 'react'

function BackgroundGlow() {
  const layerRef = useRef<HTMLDivElement>(null)

  // Tell the CSS how far down the page you are, as --scroll: 0 at the top, 1 at the bottom.
  useEffect(() => {
    let frame = 0
    function update() {
      frame = 0
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0
      layerRef.current?.style.setProperty('--scroll', progress.toFixed(4))
    }
    // Scroll events fire very often: update at most once per screen refresh.
    function handleScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    // Only decoration, so screen readers skip it.
    <div className="bg-glow" ref={layerRef} aria-hidden="true">
      <span className="bg-glow__blob bg-glow__blob--1" />
      <span className="bg-glow__blob bg-glow__blob--2" />
      <span className="bg-glow__blob bg-glow__blob--3" />
    </div>
  )
}

export default BackgroundGlow
