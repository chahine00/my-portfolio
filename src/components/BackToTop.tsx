// A round "back to top" button that floats in the bottom-right corner of every page.
// It only appears once you've scrolled down, so it doesn't cover the top of the page.

import { useEffect, useState } from 'react'

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
    // Smooth scrolling, unless the visitor turned on "reduce motion" in their system settings.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  return (
    <button type="button" className={visible ? 'back-to-top back-to-top--visible' : 'back-to-top'} onClick={scrollToTop} aria-label="Back to top" title="Back to top">
      ↑
    </button>
  )
}

export default BackToTop
