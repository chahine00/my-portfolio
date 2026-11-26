// The home hero's picture: the Axihex engine. What goes in on the left (ideas, demand, problems),
// the Axihex hexagon in the middle, and what comes out on the right (web products, mobile apps,
// intelligent tools), joined by lines with light flowing along them.
//
// On arrival it powers up once: the hexagon lights, the lines draw themselves in, then out, and the
// tiles pop in, before the light starts running. After that the core sends out a slow pulse.
//
// Interactive:
// - Hover (or tap, or focus) an input or an output: its line lights up, the light runs faster, and
//   the caption under the drawing says what it means (at rest, it's the studio's line: we spot
//   opportunities, engineer solutions, and bring products to market).
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

import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { Link } from 'react-router'
import Icon from '../../components/Icon.tsx'
import type { IconName } from '../../components/iconNames.ts'
import { pillars } from '../../data/identity.ts'
import { openPillar } from '../about/pillarEvents.ts'

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

// What each one means, for the readout under the drawing.
const inputs = [
  { label: 'Ideas', note: 'Our own, and the ones founders bring to us.' },
  { label: 'Demand', note: 'What people are already looking for, and not finding.' },
  { label: 'Problems', note: 'The slow, the broken and the missing, worth solving.' },
]
const outputs: { label: string; icon: IconName; note: string }[] = [
  { label: 'Web products', icon: 'globe', note: 'Web apps, platforms, dashboards and online tools.' },
  { label: 'Mobile apps', icon: 'smartphone', note: 'Apps for iOS and Android, live in both stores.' },
  { label: 'Intelligent tools', icon: 'bulb', note: 'AI features that do real work inside a product.' },
]
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

// What's lit: an input ('in', row) or an output ('out', row), the core, or nothing.
type Hot = { side: 'in' | 'out'; row: number } | 'core' | null

function AxihexEngine() {
  const [hot, setHot] = useState<Hot>(null)
  const engineRef = useRef<HTMLDivElement>(null)

  const isHot = (side: 'in' | 'out', row: number) => hot !== null && hot !== 'core' && hot.side === side && hot.row === row
  const lit = hot && hot !== 'core' ? (hot.side === 'in' ? inputs : outputs)[hot.row] : null
  const readout = hot === 'core' ? CORE_NOTE : lit ? `${lit.label}: ${lit.note}` : null

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

  // Hover, focus and tap all light the same thing; leaving puts it back.
  const lightUp = (value: Hot) => ({
    onPointerEnter: () => setHot(value),
    onPointerLeave: () => setHot(null),
    onFocus: () => setHot(value),
    onBlur: () => setHot(null),
    onClick: () => setHot(value),
  })

  return (
    <div className="engine-wrap">
      <div
        ref={engineRef}
        className={`engine${hot ? ' engine--hot' : ''}${hot === 'core' ? ' engine--core' : ''}`}
        onPointerMove={lean}
        onPointerLeave={unlean}
      >
        <svg className="engine__svg" viewBox={`0 0 ${W} ${H}`} focusable="false" aria-hidden="true">
          <defs>
            <radialGradient id="engine-glow">
              <stop offset="0" style={{ stopColor: 'var(--accent)', stopOpacity: 0.3 }} />
              <stop offset="1" style={{ stopColor: 'var(--accent)', stopOpacity: 0 }} />
            </radialGradient>
          </defs>

          <circle className="engine__glow" cx={CX} cy={CY} r="300" fill="url(#engine-glow)" />
          {/* Two dashed rings, turning slowly in opposite directions. */}
          <g className="engine__rings">
            <circle className="engine__ring" cx={CX} cy={CY} r="178" />
            <circle className="engine__ring engine__ring--outer" cx={CX} cy={CY} r="246" />
          </g>

          {/* In and out: the lines, then the light running along them. */}
          <g className="engine__links engine__links--in">
            {ROWS.map((y, row) => (
              <g key={y} className={isHot('in', row) ? 'engine__link engine__link--hot' : 'engine__link'}>
                <path className="engine__line" d={inPath(y)} pathLength={100} style={{ '--row': row } as CSSProperties} />
                <path className="engine__flow" d={inPath(y)} pathLength={100} style={{ '--d': `${y / -300}s` } as CSSProperties} />
              </g>
            ))}
          </g>
          <g className="engine__links engine__links--out">
            {ROWS.map((y, row) => (
              <g key={y} className={isHot('out', row) ? 'engine__link engine__link--hot' : 'engine__link'}>
                <path className="engine__line" d={outPath(y)} pathLength={100} style={{ '--row': row } as CSSProperties} />
                <path
                  className="engine__flow"
                  d={outPath(y)}
                  pathLength={100}
                  style={{ '--d': `${y / -300 - 0.6}s` } as CSSProperties}
                />
              </g>
            ))}
          </g>

          {/* The pulse: two waves going out from the hexagon, one after the other. */}
          <polygon className="engine__pulse" points={hex(CORE_R)} />
          <polygon className="engine__pulse engine__pulse--late" points={hex(CORE_R)} />

          {/* The core: three hexagons, one inside the other, and the name. */}
          <g className="engine__core">
            <g className="engine__lean">
              <polygon className="engine__hex engine__hex--outer" points={hex(CORE_R)} />
              <polygon className="engine__hex engine__hex--mid" points={hex(CORE_R * 0.82)} />
              {/* The inner hexagon is wide enough for the name to sit fully inside it (its outline
                  used to cut through the first and last letters). */}
              <polygon className="engine__hex engine__hex--inner" points={hex(CORE_R * 0.64)} />
              <text className="engine__name" x={CX} y={CY} textAnchor="middle" dominantBaseline="central">
                AXIHEX
              </text>
            </g>
          </g>
        </svg>

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
              {...lightUp({ side: 'in', row })}
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
              {...lightUp({ side: 'out', row })}
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
