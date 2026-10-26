// A round "back to top" button that floats at the bottom of every page.
// It only appears once you've scrolled down, so it doesn't cover the top of the page.

import { useEffect, useState } from 'react'

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      // React skips re-drawing when the value doesn't change, so this only does
      // real work at the moment you cross the 400px line.
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollToTop() {
    // Smooth scrolling, unless the visitor turned on "reduce motion" in their system settings.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  return (
    <button
      type="button"
      className={visible ? 'back-to-top back-to-top--visible' : 'back-to-top'}
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
    >
      ↑
    </button>
  )
}

export default BackToTop
