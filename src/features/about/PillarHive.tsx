// The five pillars of Axihex, as a honeycomb: the Axihex hexagon in the middle and a hexagon per
// pillar around it (Explore at the top left, then clockwise: Build, Showcase, Share, Grow). The sixth
// cell, on the left, is the visitor's: "Your idea" opens the Contact form. Growth feeds new ideas.
//
// The pillars are tabs: choosing one (click, hover with a mouse, or arrow keys) shows its panel on
// the right (below on phones), with a link to where that pillar lives on this site. While nobody
// has touched it and it's on screen, it moves to the next pillar by itself every few seconds.
// At rest the cells float in a slow wave. While the hive is on screen and the page is scrolled (up
// or down), a shine sweeps across every cell, one after another, so the cells read as buttons to
// press (phones have no hover to show it). It doesn't play while the page is still. Visitors who
// turn off animations get it still.
// Text: src/data/identity.ts. Looks: global.css, under "pillar hive".

import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { Link } from 'react-router'
import { pillars } from '../../data/identity.ts'
import AxihexMark from '../../components/AxihexMark.tsx'
import Icon from '../../components/Icon.tsx'

// The honeycomb, in % of the hive's width (cqw), around its center. PITCH: from one cell's center to
// its neighbor's (a cell's width plus the gap); ROW: the height between two rows of cells.
const PITCH = 32
const ROW = PITCH * 0.866
// Clockwise from the top left: the five pillars, then the visitor's cell on the left.
const spots = [
  { x: -PITCH / 2, y: -ROW },
  { x: PITCH / 2, y: -ROW },
  { x: PITCH, y: 0 },
  { x: PITCH / 2, y: ROW },
  { x: -PITCH / 2, y: ROW },
  { x: -PITCH, y: 0 },
]
const place = (spot: { x: number; y: number }, i: number) =>
  ({ left: `calc(50cqw + ${spot.x}cqw)`, top: `calc(46cqw + ${spot.y}cqw)`, '--i': i }) as CSSProperties

// How long each pillar shows by itself (also the progress bar's length, --hive-step in CSS).
const STEP_MS = 5200

// With a mouse, a pillar opens only once the pointer rests on it this long (in milliseconds), so
// sweeping across the honeycomb on the way to the card doesn't change the card. A click is instant.
const HOVER_INTENT_MS = 280

// How long one shine takes across all the cells (the last cell's delay plus its sweep, in global.css
// under "The shine"). Scrolling during a shine doesn't restart it; the next scroll after it does.
const SHINE_MS = 1700

function PillarHive() {
  const [active, setActive] = useState(0)
  // True until the visitor picks a pillar themselves.
  const [auto, setAuto] = useState(true)
  const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [onScreen, setOnScreen] = useState(false)
  const [shining, setShining] = useState(false)
  const shineTimer = useRef<number | undefined>(undefined)
  const hiveRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const hoverTimer = useRef<number | undefined>(undefined)
  const id = useId()
  const cycling = auto && onScreen && !reduceMotion

  // Only cycle while the hive is on screen.
  useEffect(() => {
    const hive = hiveRef.current
    if (!hive) return
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.35 })
    observer.observe(hive)
    return () => observer.disconnect()
  }, [])

  // The shine: plays when the page scrolls while the hive is on screen, once per scroll gesture.
  useEffect(() => {
    if (!onScreen || reduceMotion) return
    function handleScroll() {
      if (shineTimer.current !== undefined) return // a shine is already playing
      setShining(true)
      shineTimer.current = window.setTimeout(() => {
        shineTimer.current = undefined
        setShining(false)
      }, SHINE_MS)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [onScreen, reduceMotion])

  useEffect(() => () => window.clearTimeout(shineTimer.current), [])

  useEffect(() => {
    if (!cycling) return
    const timer = window.setTimeout(() => {
      if (!document.hidden) setActive((current) => (current + 1) % pillars.length)
    }, STEP_MS)
    return () => window.clearTimeout(timer)
  }, [cycling, active])

  function choose(index: number) {
    window.clearTimeout(hoverTimer.current)
    setAuto(false)
    setActive(index)
  }

  useEffect(() => () => window.clearTimeout(hoverTimer.current), [])

  // Arrow keys move between the pillars (around the ring), like any set of tabs.
  function handleKey(event: KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
    let next: number | undefined
    if (event.key in moves) next = (active + moves[event.key] + pillars.length) % pillars.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = pillars.length - 1
    if (next === undefined) return
    event.preventDefault()
    choose(next)
    tabRefs.current[next]?.focus()
  }

  const pillar = pillars[active]

  return (
    <div className="hive-layout">
      <div className={shining ? 'hive hive--shine' : 'hive'} ref={hiveRef}>
        {/* The center: the Axihex mark itself. */}
        <div className="hive__cell hive__cell--core" style={place({ x: 0, y: 0 }, 6)} aria-hidden="true">
          <span className="hive__hex">
            <span className="hive__hex-inner">
              <AxihexMark className="hive__mark" />
              <strong>Axihex</strong>
            </span>
          </span>
        </div>

        <div className="hive__tabs" role="tablist" aria-label="The five pillars of Axihex" onKeyDown={handleKey}>
          {pillars.map((item, i) => (
            <button
              key={item.word}
              ref={(element) => {
                tabRefs.current[i] = element
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`${id}-panel`}
              tabIndex={i === active ? 0 : -1}
              className={`hive__cell${i === active ? ' hive__cell--on' : ''}`}
              style={place(spots[i], i)}
              onClick={() => choose(i)}
              onPointerEnter={(event) => {
                if (event.pointerType !== 'mouse') return
                window.clearTimeout(hoverTimer.current)
                hoverTimer.current = window.setTimeout(() => choose(i), HOVER_INTENT_MS)
              }}
              onPointerLeave={() => window.clearTimeout(hoverTimer.current)}
            >
              <span className="hive__hex">
                <span className="hive__hex-inner">
                  <Icon name={item.icon} size={20} />
                  <span className="hive__word">{item.word}</span>
                  <span className="hive__num">0{i + 1}</span>
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* The sixth cell: the visitor's idea, the start of the next exploration. */}
        <Link to="/#contact" state={{ topic: 'project' }} className="hive__cell hive__cell--you" style={place(spots[5], 5)}>
          <span className="hive__hex">
            <span className="hive__hex-inner">
              <span className="hive__plus" aria-hidden="true">+</span>
              <span className="hive__word">Your idea</span>
            </span>
          </span>
        </Link>
      </div>

      <div className="hive-panel" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`}>
        {/* key: rebuilt per pillar, so its fade-in plays each time. */}
        <div key={active} className="hive-panel__body">
          <p className="hive-panel__count">
            <span className="hive-panel__icon" aria-hidden="true">
              <Icon name={pillar.icon} size={18} />
            </span>
            Pillar 0{active + 1} <span aria-hidden="true">/ 0{pillars.length}</span>
          </p>
          <h3 className="hive-panel__word">{pillar.word}</h3>
          <p className="hive-panel__statement">{pillar.statement}</p>
          <p className="hive-panel__text">{pillar.text}</p>
          <ul className="hive-panel__examples">
            {pillar.examples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
          <Link to={pillar.link.to} state={pillar.link.state} className="forward-link hive-panel__link">
            {pillar.link.label} <span aria-hidden="true">→</span>
          </Link>
        </div>
        {/* How long until the next pillar, while it moves by itself. */}
        {cycling && <span key={`bar-${active}`} className="hive-panel__progress" aria-hidden="true" />}
      </div>
    </div>
  )
}

export default PillarHive
