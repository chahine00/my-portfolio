// A thin gradient line at the very top of the screen that fills from left to right as you scroll
// down the page. Hidden on pages too short to scroll. It moves with a transform, set straight on
// the element (no React re-draw while scrolling).

import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'

function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    let frame = 0
    function update() {
      frame = 0
      const bar = barRef.current
      if (!bar) return
      const max = document.documentElement.scrollHeight - window.innerHeight
      bar.style.opacity = max > 200 ? '1' : '0'
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // Pages grow after they open (images load, sections reveal): check again a moment later.
    const later = window.setTimeout(update, 800)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
      window.clearTimeout(later)
    }
  }, [pathname])

  return <div className="scroll-progress" ref={barRef} aria-hidden="true" />
}

export default ScrollProgress
