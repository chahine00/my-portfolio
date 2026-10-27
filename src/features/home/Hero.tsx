// The big welcome section at the top of the page.
// The text comes from src/data/profile.ts.

import { useEffect, useRef } from 'react'
import { profile } from '../../data/profile.ts'
import Icon from '../../components/Icon.tsx'
import SocialLinks from '../../components/SocialLinks.tsx'
import { asset } from '../../utils/asset.ts'

// "Ali Chahine" → "AC". Shown in the circle until you add a photo.
const initials = profile.name
  .split(' ')
  .map((word) => word[0])
  .join('')

function Hero() {
  const nameRef = useRef<HTMLSpanElement>(null)

  // Scrolling down runs the same color sweep as hovering: the further you scroll
  // (up to 40% of the screen's height), the further the colored band has moved across the name.
  // The page passes it to the CSS as --sweep (100% = not started, 0% = done).
  useEffect(() => {
    function handleScroll() {
      const progress = Math.min(window.scrollY / (window.innerHeight * 0.4), 1)
      nameRef.current?.style.setProperty('--sweep', `${100 - progress * 100}%`)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    // id="home" lets the navbar link "/#home" scroll here.
    <section id="home" className="section hero">
      <div className="hero__text">
        <p className="eyebrow">{profile.role}</p>
        {/* Hover the heading, or scroll down: a color sweep runs across the name. */}
        <h1 className="hero__title">
          Hi, I'm{' '}
          <span className="hero__name" ref={nameRef}>
            {profile.name}
          </span>
        </h1>
        <p className="hero__tagline">{profile.tagline}</p>

        <ul className="hero__meta">
          <li>
            <Icon name="pin" size={16} /> {profile.location}
          </li>
          {profile.availability && (
            // Every few seconds the line gives a little shake (see global.css).
            <li className="hero__available">
              <span className="hero__available-dot" /> {profile.availability}
            </li>
          )}
        </ul>

        {/* Buttons and icon links sit side by side in a row. */}
        <div className="hero-actions">
          <a href="#projects" className="button">
            View my work
          </a>
          {/* The PDF lives in /public, so it is served from the site root. */}
          <a href={asset('/Ali_Chahine_CV.pdf')} download="Ali_Chahine_CV.pdf" className="button button-outline">
            Download CV
          </a>
          <SocialLinks />
        </div>
      </div>

      <div className="hero__photo">
        {profile.photo ? <img src={asset(profile.photo)} alt={profile.name} /> : <span>{initials}</span>}
      </div>
    </section>
  )
}

export default Hero
