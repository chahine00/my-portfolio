// The home hero's picture: the Axihex engine. What goes in on the left (ideas, demand, problems),
// the Axihex hexagon in the middle, and what comes out on the right (web products, mobile apps,
// intelligent tools), joined by lines with light flowing along them.
//
// Scrolling down turns it into the five pillars: the hero (HomeHero.tsx) sets --p on the page as
// it scrolls away (0 at the top, 1 once it's mostly gone). The inputs and outputs slide in and fade,
// the hexagon grows a little, and five pillar nodes come out around it, ready for the pillars
// section below (PillarHive.tsx), whose honeycomb then opens out of its own center.
// Drawn on a 1000 × 620 grid: the SVG uses it directly, the HTML labels use % of it (and cqw, so
// everything scales together). Looks: global.css, under "Axihex engine".

import type { CSSProperties } from 'react'
import Icon from '../../components/Icon.tsx'
import type { IconName } from '../../components/iconNames.ts'
import { pillars } from '../../data/identity.ts'

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

const inputs = ['Ideas', 'Demand', 'Problems']
const outputs: { label: string; icon: IconName }[] = [
  { label: 'Web products', icon: 'globe' },
  { label: 'Mobile apps', icon: 'smartphone' },
  { label: 'Intelligent tools', icon: 'bulb' },
]

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

function AxihexEngine() {
  return (
    <div className="engine" aria-hidden="true">
      <svg className="engine__svg" viewBox={`0 0 ${W} ${H}`} focusable="false">
        <defs>
          <radialGradient id="engine-glow">
            <stop offset="0" style={{ stopColor: 'var(--accent)', stopOpacity: 0.22 }} />
            <stop offset="1" style={{ stopColor: 'var(--accent)', stopOpacity: 0 }} />
          </radialGradient>
        </defs>

        <circle cx={CX} cy={CY} r="300" fill="url(#engine-glow)" />
        {/* Two dashed rings, turning slowly in opposite directions. */}
        <circle className="engine__ring" cx={CX} cy={CY} r="178" />
        <circle className="engine__ring engine__ring--outer" cx={CX} cy={CY} r="246" />

        {/* In and out: the lines, then the light running along them. */}
        <g className="engine__links engine__links--in">
          {ROWS.map((y) => (
            <g key={y}>
              <path className="engine__line" d={inPath(y)} />
              <path className="engine__flow" d={inPath(y)} pathLength={100} style={{ '--d': `${y / -300}s` } as CSSProperties} />
            </g>
          ))}
        </g>
        <g className="engine__links engine__links--out">
          {ROWS.map((y) => (
            <g key={y}>
              <path className="engine__line" d={outPath(y)} />
              <path className="engine__flow" d={outPath(y)} pathLength={100} style={{ '--d': `${y / -300 - 0.6}s` } as CSSProperties} />
            </g>
          ))}
        </g>

        {/* The core: three hexagons, one inside the other, and the name. */}
        <g className="engine__core">
          <polygon className="engine__hex engine__hex--outer" points={hex(CORE_R)} />
          <polygon className="engine__hex engine__hex--mid" points={hex(CORE_R * 0.76)} />
          <polygon className="engine__hex engine__hex--inner" points={hex(CORE_R * 0.5)} />
          <text className="engine__name" x={CX} y={CY} textAnchor="middle" dominantBaseline="central">
            AXIHEX
          </text>
        </g>
      </svg>

      {/* What goes in: a dot at the start of each line, its word above. */}
      <div className="engine__side engine__side--in">
        {inputs.map((label, i) => (
          <span key={label} className="engine__input" style={at(IN_X, ROWS[i])}>
            <span className="engine__input-word">{label}</span>
          </span>
        ))}
      </div>

      {/* What comes out: a tile with its icon, the name under it. */}
      <div className="engine__side engine__side--out">
        {outputs.map((output, i) => (
          <span key={output.label} className="engine__output" style={at(OUT_X, ROWS[i])}>
            <span className="engine__tile">
              <Icon name={output.icon} size={28} />
            </span>
            <span className="engine__output-word">{output.label}</span>
          </span>
        ))}
      </div>

      {/* The five pillars, coming out of the hexagon as the hero scrolls away. */}
      {nodes.map(({ pillar, x, y }, k) => (
        <span key={pillar.word} className="engine__node" style={at(x, y, { '--k': k })}>
          <span className="engine__node-hex">
            <Icon name={pillar.icon} size={18} />
          </span>
          <span className="engine__node-word">{pillar.word}</span>
        </span>
      ))}
    </div>
  )
}

export default AxihexEngine
