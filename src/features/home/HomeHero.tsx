// The home page's hero, centered: what Axihex is, the headline, one short line, then the Axihex
// engine (AxihexEngine.tsx: what goes in, the hexagon, what comes out), the two ways in, and a
// nudge down to the studio. As it scrolls away, the engine turns into the five pillars, which the
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
  // gone. Set straight on the element (no re-render), at most once a frame. Visitors who turn off
  // animations keep the engine as it is (the CSS ignores --p for them).
  useEffect(() => {
    const hero = heroRef.current
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const update = () => {
      frame = 0
      const box = hero.getBoundingClientRect()
      const p = Math.min(Math.max(-box.top / (box.height * 0.55), 0), 1)
      hero.style.setProperty('--p', p.toFixed(3))
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

  return (
    // id="home" lets the navbar link "/#home" scroll here.
    <section id="home" ref={heroRef} className="engine-hero" style={{ '--p': 0 } as CSSProperties} aria-labelledby="home-title">
      <div className="engine-hero__text">
        <p className="eyebrow engine-hero__label">{profile.role}</p>
        <h1 id="home-title">
          {profile.headline} <GradientText text={profile.headlineAccent} />
        </h1>
        <p className="engine-hero__lede">{profile.intro}</p>
      </div>

      <div className="engine-hero__stage">
        <AxihexEngine />
      </div>

      <div className="engine-hero__after">
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
