// The "About Me" section. Edit the text below to introduce yourself.
// The numbers come from "stats" in src/data/profile.ts.
// Hovering over the numbers (or pressing one) opens a panel right here (no new page) with
// your roles, also from profile.ts. Phones have no hover, so there it opens by itself once the
// numbers have been on screen for a moment. Once open it stays open, and closes only when the page
// is scrolled back to the very top (by scrolling or with the back-to-top button).

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { roles, stats } from '../../data/profile.ts'

// How long the mouse rests on the numbers before the panel opens, in milliseconds,
// so it doesn't pop open when the mouse just passes over them.
const OPEN_AFTER_HOVER_MS = 150

// How long the closing fade takes. Must match the "panel-close" animation in global.css.
const CLOSE_FADE_MS = 300

// Phones: how long the numbers stay on screen before the panel opens by itself, in milliseconds.
const OPEN_AFTER_SEEN_MS = 600

// Back at the top of the page means scrolled less than this many pixels.
const TOP_OF_PAGE = 10

function About() {
  const [rolesOpen, setRolesOpen] = useState(false)
  // True while the panel fades out, just before it's removed.
  const [closing, setClosing] = useState(false)
  // The waiting timer (to open after a hover, or to remove the panel after its fade).
  const timer = useRef(0)
  // Phones: a separate timer for "the numbers have been on screen for a moment".
  const seenTimer = useRef(0)
  const statsRef = useRef<HTMLUListElement>(null)

  // Stop a waiting timer if the section disappears.
  useEffect(() => () => clearTimeout(timer.current), [])

  function openPanel() {
    clearTimeout(timer.current)
    setClosing(false)
    setRolesOpen(true)
  }

  // Phones and tablets (screens with no hover): open by itself when the numbers are fully on
  // screen, in the upper 70% of it, for a moment. Scrolling past quickly doesn't open it.
  useEffect(() => {
    const stats = statsRef.current
    if (!stats || !window.matchMedia('(hover: none)').matches) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(seenTimer.current)
        if (entry.isIntersecting) seenTimer.current = window.setTimeout(openPanel, OPEN_AFTER_SEEN_MS)
      },
      { rootMargin: '0px 0px -30% 0px', threshold: 1 },
    )
    observer.observe(stats)
    return () => {
      observer.disconnect()
      clearTimeout(seenTimer.current)
    }
  }, [])

  // While the panel is open: when the page gets back to the very top, fade it out, then remove it.
  // It only reacts to scrolling, so opening it while already at the top doesn't close it.
  useEffect(() => {
    if (!rolesOpen) return

    function handleScroll() {
      if (window.scrollY > TOP_OF_PAGE) return
      clearTimeout(timer.current)
      setClosing(true)
      timer.current = window.setTimeout(() => {
        setRolesOpen(false)
        setClosing(false)
      }, CLOSE_FADE_MS)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [rolesOpen])

  // The mouse came onto the numbers: open after a short rest, so passing over them doesn't open it.
  // Only a real mouse counts: on phones, a tap opens it.
  function handleStatsEnter(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse' || rolesOpen) return
    clearTimeout(timer.current)
    timer.current = window.setTimeout(openPanel, OPEN_AFTER_HOVER_MS)
  }

  // Moving off the numbers before the short rest is over cancels the opening.
  function handleStatsLeave() {
    if (!rolesOpen) clearTimeout(timer.current)
  }

  return (
    <section id="about" className="section">
      {/* A small label above the heading: the navbar says "About", the title says "The Mindset". */}
      <p className="eyebrow">About</p>
      <h1>The Mindset</h1>
      <p>
        Real growth comes down to speed and flexibility. I try not to box myself into a single label - I just adapt quickly and pick up whatever tools I need, because staying relevant in the AI era means constantly moving forward.
      </p>

      <div>
        <ul
          className={rolesOpen ? 'stats stats--open' : 'stats'}
          ref={statsRef}
          onPointerEnter={handleStatsEnter}
          onPointerLeave={handleStatsLeave}
        >
          {stats.map((stat) => (
            <li key={stat.label}>
              {/* A button, so it works with the keyboard too. aria-expanded tells screen readers it's open. */}
              <button
                type="button"
                className={rolesOpen && !closing ? 'stats__toggle stats__toggle--open' : 'stats__toggle'}
                onClick={openPanel}
                aria-expanded={rolesOpen && !closing}
                aria-controls="roles-panel"
              >
                <strong>{stat.value}</strong>
                <span>
                  {stat.label} <span className="stats__caret" aria-hidden="true">▸</span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/*
          The roles panel: a "control screen" with a grid background and corner marks.
          A scan line sweeps down when it opens, and the role cards boot up one after another
          (--i is each card's position, used to delay its animation).
        */}
        {rolesOpen && (
          <div className={closing ? 'roles-panel roles-panel--closing' : 'roles-panel'} id="roles-panel">
            <p className="roles-panel__head" aria-hidden="true">
              <span className="roles-panel__dot" /> ali.roles <span className="roles-panel__count">[{roles.length}]</span>
            </p>
            <ul className="roles-panel__grid">
              {roles.map((role, i) => (
                <li key={role.name} className="role-card" style={{ '--i': i } as CSSProperties}>
                  <span className="role-card__index" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="role-card__name">
                    <span aria-hidden="true">&gt; </span>
                    {role.name}
                  </h3>
                  <p className="role-card__summary">{role.summary}</p>
                  <p className="role-card__proof">{role.proof}</p>
                  <ul className="role-card__stack">
                    {role.stack.map((tech) => (
                      <li key={tech}>{tech}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

export default About
