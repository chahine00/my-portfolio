// The home page's hero, centered: what Axihex is and the headline, then the Axihex engine
// (AxihexEngine.tsx: what goes in, the hexagon, what comes out) with its caption, the two ways in,
// and a nudge down to the studio. As it scrolls away, the engine turns into the five pillars, which the
// next section (About.tsx) takes over. Text: src/data/profile.ts.

import { useEffect, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { profile } from '../../data/profile.ts'
import GradientText from '../../components/GradientText.tsx'
import AxihexEngine from './AxihexEngine.tsx'
import { hasProducts } from '../products/shownProducts.ts'

function HomeHero() {
  const heroRef = useRef<HTMLElement>(null)

  // How far the hero has scrolled away, as --p: 0 at the top, 1 once a little over half of it is
  // gone (on phones, after a shorter scroll: the screen is short, so the turn into the pillars
  // happens while the hexagon is still on it). Set straight on the element (no re-render), at most
  // once a frame. Visitors who turn off animations keep the engine as it is (the CSS ignores --p).
  useEffect(() => {
    const hero = heroRef.current
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const phone = window.matchMedia('(max-width: 720px)')
    let frame = 0
    // What was last written, so nothing is rewritten unchanged: each write makes the browser
    // re-check the hero's styles, and past the turn (or before it) every scroll step was a no-op.
    let lastP = ''
    let lastSpan = ''
    let lastTop = ''
    const update = () => {
      frame = 0
      const box = hero.getBoundingClientRect()
      const span = box.height * (phone.matches ? 0.32 : 0.55)
      const p = Math.min(Math.max(-box.top / span, 0), 1).toFixed(3)
      const spanPx = `${Math.round(span)}px`
      if (spanPx !== lastSpan) hero.style.setProperty('--span', (lastSpan = spanPx))
      // Where the hero starts on the page: the stage's movement (global.css) is driven by the
      // browser from the scroll position itself, between this point and this point + --span.
      const topPx = `${Math.round(box.top + window.scrollY)}px`
      if (topPx !== lastTop) hero.style.setProperty('--hero-top', (lastTop = topPx))
      if (p === lastP) return
      hero.style.setProperty('--p', (lastP = p))
      // The pillar nodes are out: they can be clicked (before that they're hidden in the hexagon).
      hero.classList.toggle('engine-hero--pillars', Number(p) > 0.65)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // Off screen: the hero's animations pause (the CSS's "engine-hero--asleep"), so the glow, the
  // pulse and the running light cost nothing while the rest of the page is read.
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const observer = new IntersectionObserver(([entry]) => hero.classList.toggle('engine-hero--asleep', !entry.isIntersecting))
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  return (
    // id="home" lets the navbar link "/#home" scroll here.
    <section id="home" ref={heroRef} className="engine-hero" style={{ '--p': 0 } as CSSProperties} aria-labelledby="home-title">
      <div className="engine-hero__text">
        <p className="eyebrow engine-hero__label">{profile.role}</p>
        <h1 id="home-title">
          {profile.headline} <GradientText text={profile.headlineAccent} />
        </h1>
      </div>

      <div className="engine-hero__stage">
        <AxihexEngine />

        {/* The two ways in, under the engine and its caption. Inside the stage, so they move with
            the engine as it holds back while scrolling (never under it), and stay clear until the
            pillars come out. */}
        <div className="hero-actions engine-hero__actions">
          {/* Once Axihex has products to show, they lead. Then the work, and building together. */}
          {hasProducts ? (
            <Link to="/#products" className="button">
              See our products <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <Link to="/#projects" className="button">
              Explore our work <span aria-hidden="true">→</span>
            </Link>
          )}
          <Link to="/#contact" state={{ topic: 'project' }} className="button button-outline">
            Build with us
          </Link>
        </div>
      </div>

      <div className="engine-hero__after">
        {/* Down to the five pillars, right below. */}
        <Link to="/#studio" className="engine-hero__discover">
          Discover the studio
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </Link>
      </div>
    </section>
  )
}

export default HomeHero
