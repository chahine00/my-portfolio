// The home hero's picture: the Axihex engine. What goes in on the left (ideas, demand, problems),
// the Axihex hexagon in the middle, and what comes out on the right (web products, mobile apps,
// intelligent tools), joined by lines with light flowing along them.
//
// On arrival it powers up: the hexagon lights, the lines draw themselves in, then out, and the
// tiles pop in, before the light starts running. After that the core sends out a slow pulse. It
// powers up again each time the navbar's Home link (or the back-to-top button) brings you back.
//
// Interactive:
// - Point at (or focus) an input or an output: its line lights up, the light runs faster, and
//   the caption under the drawing says what it means (at rest, it's the studio's line: we spot
//   opportunities, engineer solutions, and bring products to market).
// - Each one leads somewhere: an output to a project we built of that kind (in Selected work), an
//   input to the Explore pillar. With a mouse or the keyboard, a click goes there; on a touch
//   screen, the first tap explains it and a second tap goes there.
// - With a mouse, the hexagon and its rings lean a little toward the pointer.
// - The hexagon is a way in: clicking it goes down to the five pillars.
// - Once the pillar nodes are out (below), clicking one opens that pillar in the honeycomb.
//
// Scrolling down turns it into the five pillars: the hero (HomeHero.tsx) sets --p on the page as
// it scrolls away (0 at the top, 1 once it's mostly gone). The inputs and outputs slide in and fade,
// the hexagon grows a little, and five pillar nodes come out around it, ready for the pillars
// section below (PillarHive.tsx), whose honeycomb then opens out of its own center.
// Drawn on a 1000 × 620 grid: the SVG uses it directly, the HTML labels use % of it (and cqw, so
// everything scales together). Looks: global.css, under "Axihex engine".

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import Icon from '../../components/Icon.tsx'
import type { IconName } from '../../components/iconNames.ts'
import { pillars } from '../../data/identity.ts'
import { openPillar } from '../about/pillarEvents.ts'
import { BACK_AT_TOP_EVENT } from '../../utils/goToTop.ts'

const W = 1000
const H = 620
const CX = 500
const CY = 310

// A pointy-top hexagon of radius r around the center.
const hex = (r: number) =>
  Array.from({ length: 6 }, (_, k) => {
    const a = ((-90 + 60 * k) * Math.PI) / 180
    return `${(CX + r * Math.cos(a)).toFixed(1)},${(CY + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')

const CORE_R = 128
// The hexagon's left and right corners (where the lines join it).
const CORE_LEFT = CX - CORE_R * Math.cos(Math.PI / 6)
const CORE_RIGHT = CX + CORE_R * Math.cos(Math.PI / 6)

const ROWS = [150, 310, 470]
const IN_X = 175
const OUT_X = 840
const BOX_W = 124

// What each one means (for the caption under the drawing) and where it leads: the inputs to the
// Explore pillar, each output to a project of that kind in Selected work ("project": its slug in
// src/data/projects.ts).
const inputs = [
  { label: 'Ideas', note: 'Our own, and the ones founders bring to us.' },
  { label: 'Demand', note: 'What people are already looking for, and not finding.' },
  { label: 'Problems', note: 'The slow, the broken and the missing, worth solving.' },
]
const INPUT_GOES = 'see how we explore'
const outputs: { label: string; icon: IconName; note: string; project: string }[] = [
  { label: 'Web products', icon: 'globe', note: 'Web apps, platforms, dashboards and online tools.', project: 'boxmind-academy' },
  { label: 'Mobile apps', icon: 'smartphone', note: 'Apps for iOS and Android, live in both stores.', project: 'cinetwork' },
  { label: 'Intelligent tools', icon: 'bulb', note: 'AI features that do real work inside a product.', project: 'boxmind-ai-backend' },
]
const OUTPUT_GOES = 'see one we built'

// Where an input or output leads.
function go(side: 'in' | 'out', row: number) {
  if (side === 'in') {
    openPillar(0) // Explore
    document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' })
    return
  }
  const card = document.querySelector<HTMLElement>(`[data-project-slug="${outputs[row].project}"]`)
  if (!card) return
  card.scrollIntoView({ behavior: 'smooth', block: 'center' })
  // A short glow on the card, so the eye finds it.
  card.classList.remove('work-card--found')
  void card.offsetWidth
  card.classList.add('work-card--found')
  window.setTimeout(() => card.classList.remove('work-card--found'), 2400)
}
// At rest, the caption is the studio's line, in two parts (the second in the accent gradient):
// what the engine does, from opportunity to market.
const RESTING = ['We spot opportunities, engineer solutions,', 'and bring products to market.']
const CORE_NOTE = 'Inside: five pillars that turn one into the other. Click to look inside.'

const inPath = (y: number) => `M${IN_X} ${y} C${IN_X + 130} ${y}, ${CORE_LEFT - 110} ${CY}, ${CORE_LEFT} ${CY}`
const outPath = (y: number) =>
  `M${CORE_RIGHT} ${CY} C${CORE_RIGHT + 110} ${CY}, ${OUT_X - BOX_W / 2 - 120} ${y}, ${OUT_X - BOX_W / 2} ${y}`

// The five pillar nodes: a ring around the hexagon, Explore at the top, then clockwise.
const NODE_R = 238
const nodes = pillars.map((pillar, k) => {
  const a = ((-90 + 72 * k) * Math.PI) / 180
  return { pillar, x: CX + NODE_R * Math.cos(a), y: CY + NODE_R * Math.sin(a) }
})

// A spot on the grid, as the HTML's position, plus how far it is from the center (for the nodes,
// which come out of the hexagon).
const at = (x: number, y: number, extra: Record<string, string | number> = {}) =>
  ({
    left: `${(x / W) * 100}%`,
    top: `${(y / H) * 100}%`,
    '--to-cx': `${((CX - x) / W) * 100}cqw`,
    '--to-cy': `${((CY - y) / W) * 100}cqw`,
    ...extra,
  }) as CSSProperties

// One layer of the drawing: an <svg> on the 1000 × 620 grid, filling the engine's box.
function Layer({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      className={className ? `engine__layer ${className}` : 'engine__layer'}
      viewBox={`0 0 ${W} ${H}`}
      focusable="false"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

// What's lit: an input ('in', row) or an output ('out', row), the core, or nothing.
type Hot = { side: 'in' | 'out'; row: number } | 'core' | null

function AxihexEngine() {
  const [hot, setHot] = useState<Hot>(null)
  // How the last press came: by touch, the first tap only explains.
  const [touch, setTouch] = useState(false)
  const engineRef = useRef<HTMLDivElement>(null)
  // Whether the part being pressed was already lit when the press began, and whether it's a touch
  // (refs: the click comes before the re-render the press asked for).
  const wasHot = useRef(false)
  const pressByTouch = useRef(false)

  // Brought back to the top (the navbar's Home link, the back-to-top button): power up again (a new
  // key rebuilds the drawing, which replays its entrance).
  const [run, setRun] = useState(0)
  useEffect(() => {
    const replay = () => {
      setHot(null)
      setRun((n) => n + 1)
    }
    window.addEventListener(BACK_AT_TOP_EVENT, replay)
    return () => window.removeEventListener(BACK_AT_TOP_EVENT, replay)
  }, [])

  const isHot = (side: 'in' | 'out', row: number) => hot !== null && hot !== 'core' && hot.side === side && hot.row === row
  const lit = hot && hot !== 'core' ? (hot.side === 'in' ? inputs : outputs)[hot.row] : null
  const goes = hot && hot !== 'core' ? (hot.side === 'in' ? INPUT_GOES : OUTPUT_GOES) : ''
  const readout =
    hot === 'core' ? CORE_NOTE : lit ? `${lit.label}: ${lit.note} ${touch ? 'Tap again' : 'Click'} to ${goes} →` : null

  // The lean toward the pointer: --mx / --my from -1 to 1 across the drawing (mouse only).
  function lean(event: PointerEvent<HTMLDivElement>) {
    const engine = engineRef.current
    if (!engine || event.pointerType !== 'mouse') return
    const box = engine.getBoundingClientRect()
    engine.style.setProperty('--mx', (((event.clientX - box.left) / box.width) * 2 - 1).toFixed(3))
    engine.style.setProperty('--my', (((event.clientY - box.top) / box.height) * 2 - 1).toFixed(3))
  }
  function unlean() {
    engineRef.current?.style.setProperty('--mx', '0')
    engineRef.current?.style.setProperty('--my', '0')
  }

  // Pointing (mouse), focus and a tap all light the same thing; leaving puts it back. The hexagon
  // only lights (it's a link of its own).
  const lightUp = (value: Hot) => ({
    onPointerEnter: (event: PointerEvent) => {
      if (event.pointerType === 'mouse') setHot(value)
    },
    onPointerLeave: (event: PointerEvent) => {
      if (event.pointerType === 'mouse') setHot(null)
    },
    onFocus: () => setHot(value),
    onBlur: () => setHot(null),
  })

  // An input or output: lights up, and leads to its place. A mouse click or the keyboard goes
  // straight there; a tap goes there only if it was already lit (the first tap explains it).
  const part = (side: 'in' | 'out', row: number) => ({
    ...lightUp({ side, row }),
    onPointerDown: (event: PointerEvent) => {
      pressByTouch.current = event.pointerType !== 'mouse'
      setTouch(pressByTouch.current)
      wasHot.current = isHot(side, row)
    },
    onClick: (event: MouseEvent) => {
      const tapped = event.detail > 0 && pressByTouch.current
      if (tapped && !wasHot.current) {
        setHot({ side, row })
        return
      }
      go(side, row)
    },
  })

  return (
    <div className="engine-wrap" key={run}>
      <div
        ref={engineRef}
        className={`engine${hot ? ' engine--hot' : ''}${hot === 'core' ? ' engine--core' : ''}`}
        onPointerMove={lean}
        onPointerLeave={unlean}
      >
        {/* The drawing, as a stack of layers on the same 1000 × 620 grid (each an <svg> filling the
            box, in the order they're drawn). Every part that moves all the time (the glow, the rings,
            the pulse, the middle hexagon's breath, the running light) is its own layer and moves as a
            whole, so the browser only slides or fades it, without redrawing the rest of the drawing
            (the blurred glow of the hexagon above all) on every frame. That keeps scrolling smooth. */}
        <span className="engine__layer engine__glow" aria-hidden="true" />
        {/* Two dashed rings, turning slowly in opposite directions. */}
        <span className="engine__layer engine__rings" aria-hidden="true">
          <Layer className="engine__ring">
            <circle cx={CX} cy={CY} r="178" />
          </Layer>
          <Layer className="engine__ring engine__ring--outer">
            <circle cx={CX} cy={CY} r="246" />
          </Layer>
        </span>

        {/* In and out: the lines, then the light running along them (its own layer). */}
        <Layer className="engine__links">
          {ROWS.map((y, row) => (
            <g key={`in-${y}`} className={isHot('in', row) ? 'engine__link engine__link--hot' : 'engine__link'}>
              <path className="engine__line engine__line--in" d={inPath(y)} pathLength={100} style={{ '--row': row } as CSSProperties} />
            </g>
          ))}
          {ROWS.map((y, row) => (
            <g key={`out-${y}`} className={isHot('out', row) ? 'engine__link engine__link--hot' : 'engine__link'}>
              <path className="engine__line engine__line--out" d={outPath(y)} pathLength={100} style={{ '--row': row } as CSSProperties} />
            </g>
          ))}
        </Layer>
        <Layer className="engine__links engine__flows">
          {ROWS.map((y, row) => (
            <g key={`in-${y}`} className={isHot('in', row) ? 'engine__link engine__link--hot' : 'engine__link'}>
              <path className="engine__flow" d={inPath(y)} pathLength={100} style={{ '--d': `${y / -300}s` } as CSSProperties} />
            </g>
          ))}
          {ROWS.map((y, row) => (
            <g key={`out-${y}`} className={isHot('out', row) ? 'engine__link engine__link--hot' : 'engine__link'}>
              <path className="engine__flow" d={outPath(y)} pathLength={100} style={{ '--d': `${y / -300 - 0.6}s` } as CSSProperties} />
            </g>
          ))}
        </Layer>

        {/* The pulse: two waves going out from the hexagon, one after the other. */}
        <Layer className="engine__pulse">
          <polygon points={hex(CORE_R)} />
        </Layer>
        <Layer className="engine__pulse engine__pulse--late">
          <polygon points={hex(CORE_R)} />
        </Layer>

        {/* The core: three hexagons, one inside the other, and the name. */}
        <span className="engine__layer engine__core" aria-hidden="true">
          <span className="engine__layer engine__lean">
            <Layer>
              <polygon className="engine__hex engine__hex--outer" points={hex(CORE_R)} />
            </Layer>
            <Layer className="engine__breathe">
              <polygon className="engine__hex engine__hex--mid" points={hex(CORE_R * 0.82)} />
            </Layer>
            <Layer>
              {/* The inner hexagon is wide enough for the name to sit fully inside it (its outline
                  used to cut through the first and last letters). */}
              <polygon className="engine__hex engine__hex--inner" points={hex(CORE_R * 0.64)} />
              <text className="engine__name" x={CX} y={CY} textAnchor="middle" dominantBaseline="central">
                AXIHEX
              </text>
            </Layer>
          </span>
        </span>

        {/* The hexagon, as a way in: down to the five pillars. */}
        <Link
          to="/#studio"
          className="engine__core-link"
          style={at(CX, CY)}
          aria-label="Look inside Axihex: the five pillars"
          {...lightUp('core')}
        />

        {/* What goes in: a dot at the start of each line, its word above. */}
        <div className="engine__side engine__side--in">
          {inputs.map((input, row) => (
            <button
              key={input.label}
              type="button"
              className={isHot('in', row) ? 'engine__input is-hot' : 'engine__input'}
              style={at(IN_X, ROWS[row], { '--row': row })}
              aria-describedby="engine-readout"
              {...part('in', row)}
            >
              <span className="engine__dot" aria-hidden="true" />
              <span className="engine__input-word">{input.label}</span>
            </button>
          ))}
        </div>

        {/* What comes out: a tile with its icon, the name under it. */}
        <div className="engine__side engine__side--out">
          {outputs.map((output, row) => (
            <button
              key={output.label}
              type="button"
              className={isHot('out', row) ? 'engine__output is-hot' : 'engine__output'}
              style={at(OUT_X, ROWS[row], { '--row': row })}
              aria-describedby="engine-readout"
              {...part('out', row)}
            >
              <span className="engine__tile" aria-hidden="true">
                <Icon name={output.icon} size={28} />
              </span>
              <span className="engine__output-word">{output.label}</span>
            </button>
          ))}
        </div>

        {/* The five pillars, coming out of the hexagon as the hero scrolls away. Clicking one (once
            they're out) opens it in the honeycomb below. A pointer shortcut: the honeycomb's own
            tabs are the accessible way to the pillars. */}
        {nodes.map(({ pillar, x, y }, k) => (
          <button
            key={pillar.word}
            type="button"
            className="engine__node"
            style={at(x, y, { '--k': k })}
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => {
              openPillar(k)
              document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <span className="engine__node-hex">
              <Icon name={pillar.icon} size={18} />
            </span>
            <span className="engine__node-word">{pillar.word}</span>
          </button>
        ))}
      </div>

      {/* What the lit part means (or the whole idea, at rest). */}
      <p id="engine-readout" className={readout ? 'engine__readout' : 'engine__readout engine__readout--rest'} aria-live="polite">
        {readout ? (
          <span key={readout}>{readout}</span>
        ) : (
          <span key="rest" className="engine__tagline">
            {RESTING[0]} <strong>{RESTING[1]}</strong>
          </span>
        )}
      </p>
    </div>
  )
}

export default AxihexEngine
