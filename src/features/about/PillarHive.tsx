// The five pillars of Axihex, drawn as the brand's own shape: the Axihex hexagon in the middle and
// a hexagon per pillar around it (Explore at the top, then clockwise: Build, Showcase, Share, Grow).
// Spokes join each pillar to the center, and a dashed ring joins the pillars in order, back to
// Explore: growth feeds new exploration.
//
// The pillars are tabs: choosing one (click, hover with a mouse, or arrow keys) shows its panel on
// the right (below on phones), with a link to where that pillar lives on this site. While nobody
// has touched it and it's on screen, it moves to the next pillar by itself every few seconds.
// Visitors who turn off animations get it still. Text: src/data/identity.ts. Looks: global.css,
// under "pillar hive".

import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { Link } from 'react-router'
import { pillars } from '../../data/identity.ts'
import AxihexMark from '../../components/AxihexMark.tsx'
import Icon from '../../components/Icon.tsx'

// Where each pillar's center sits, in % of the (square) hive: on a circle around the middle,
// starting at the top and going clockwise (one fifth of a turn each).
const RADIUS = 36
const spots = pillars.map((_, i) => {
  const angle = (-90 + i * 72) * (Math.PI / 180)
  return { x: 50 + RADIUS * Math.cos(angle), y: 50 + RADIUS * Math.sin(angle) }
})
const ring = `M${spots.map((s) => `${s.x.toFixed(2)} ${s.y.toFixed(2)}`).join(' L')} Z`

// How long each pillar shows by itself (also the progress bar's length, --hive-step in CSS).
const STEP_MS = 5200

function PillarHive() {
  const [active, setActive] = useState(0)
  // True until the visitor picks a pillar themselves.
  const [auto, setAuto] = useState(true)
  const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [onScreen, setOnScreen] = useState(false)
  const hiveRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
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

  useEffect(() => {
    if (!cycling) return
    const timer = window.setTimeout(() => {
      if (!document.hidden) setActive((current) => (current + 1) % pillars.length)
    }, STEP_MS)
    return () => window.clearTimeout(timer)
  }, [cycling, active])

  function choose(index: number) {
    setAuto(false)
    setActive(index)
  }

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
      <div className="hive" ref={hiveRef} style={{ '--active': active } as CSSProperties}>
        <svg className="hive__lines" viewBox="0 0 100 100" aria-hidden="true">
          <path className="hive__ring" d={ring} />
          {spots.map((spot, i) => (
            <path
              key={i}
              className={`hive__spoke${i === active ? ' hive__spoke--on' : ''}`}
              d={`M50 50 L${spot.x.toFixed(2)} ${spot.y.toFixed(2)}`}
            />
          ))}
          {/* A spark travelling the ring: the pillars feed each other. */}
          {!reduceMotion && (
            <circle className="hive__spark" r="0.9">
              <animateMotion dur="14s" repeatCount="indefinite" path={ring} />
            </circle>
          )}
        </svg>

        {/* The center: the Axihex mark itself. */}
        <div className="hive__core" aria-hidden="true">
          <span className="hive__core-inner">
            <AxihexMark className="hive__mark" />
            <strong>Axihex</strong>
            <span>Software studio</span>
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
              style={{ left: `${spots[i].x}%`, top: `${spots[i].y}%` } as CSSProperties}
              onClick={() => choose(i)}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse') choose(i)
              }}
            >
              <span className="hive__cell-inner">
                <span className="hive__num">0{i + 1}</span>
                <span className="hive__word">{item.word}</span>
              </span>
            </button>
          ))}
        </div>
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
          <Link to={pillar.link.to} className="forward-link hive-panel__link">
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
