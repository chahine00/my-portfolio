// A round "back to top" button that floats in the bottom-right corner of every page.

function BackToTop() {
  function scrollToTop() {
    // Smooth scrolling, unless the visitor turned on "reduce motion" in their system settings.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  return (
    <button type="button" className="back-to-top" onClick={scrollToTop} aria-label="Back to top" title="Back to top">
      ↑
    </button>
  )
}

export default BackToTop
