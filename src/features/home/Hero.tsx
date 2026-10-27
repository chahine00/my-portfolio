// The big welcome section at the top of the page.
// The text comes from src/data/profile.ts.

import { useEffect, useRef, useState } from 'react'
import { profile } from '../../data/profile.ts'
import Icon from '../../components/Icon.tsx'
import SocialLinks from '../../components/SocialLinks.tsx'
import { asset } from '../../utils/asset.ts'

// "Ali Chahine" → "AC". Shown in the circle until you add a photo.
const initials = profile.name
  .split(' ')
  .map((word) => word[0])
  .join('')

// Types each phrase from profile.building, waits, deletes it, then moves to the next one.
// Returns the text typed so far.
function useTypingLoop(phrases: string[]) {
  // People who turn off animations just see the first phrase, already written.
  const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [text, setText] = useState(reduceMotion ? phrases[0] : '')

  useEffect(() => {
    if (reduceMotion) return

    let phrase = 0
    let length = 0
    let deleting = false
    let timer: number

    function step() {
      const full = phrases[phrase]
      length += deleting ? -1 : 1
      setText(full.slice(0, length))

      let delay = deleting ? 35 : 75 // deleting is faster than typing
      if (!deleting && length === full.length) {
        deleting = true
        delay = 1800 // pause so the finished phrase can be read
      } else if (deleting && length === 0) {
        deleting = false
        phrase = (phrase + 1) % phrases.length
        delay = 400
      }
      timer = window.setTimeout(step, delay)
    }

    timer = window.setTimeout(step, 600)
    return () => window.clearTimeout(timer)
  }, [phrases, reduceMotion])

  return text
}

// The longest phrase, used to reserve room for the typing line.
const longestPhrase = profile.building.reduce((a, b) => (b.length > a.length ? b : a))

function Hero() {
  const typed = useTypingLoop(profile.building)
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

        {/* A line of "code" that keeps typing what you build. Screen readers get the full list once instead. */}
        <p className="hero__code" aria-label={`I build ${profile.building.join(', ')}`}>
          {/* An invisible copy of the LONGEST phrase sits in the same spot and sets the line's size,
              so the page (and your photo next to it) doesn't jump when a long phrase wraps. */}
          <span className="hero__code-ghost" aria-hidden="true">
            &gt; ali.build('{longestPhrase}')
          </span>
          <span aria-hidden="true">
            <span className="hero__code-prompt">&gt;</span> ali.build(<span className="hero__code-string">'{typed}</span>
            <span className="hero__code-caret" />
            <span className="hero__code-string">'</span>)
          </span>
        </p>

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
