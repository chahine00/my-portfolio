// The home hero's picture: the Axihex hexagon reimagined as the three layers of an application
// (Interface, Backend, Infrastructure).
// - At rest the plates float in a slow wave, each on its own beat, and light climbs up through them.
// - Hovering the drawing opens the stack up (an "exploded view"): the top plate rises, the bottom sinks.
// - Click a plate (or its button below) to select it: it lifts, spins once around its own axis (top
//   and sides together, like a real hexagonal plate), and the caption explains that layer.
// Colors follow the theme (light / dark): see "Home hero" in global.css.

import { useEffect, useRef, useState, type CSSProperties } from 'react'

const layers = [
  { name: 'Interface', description: 'The screens people use to find information and get things done.', y: 55 },
  { name: 'Backend', description: 'The rules, data and integrations behind each action on screen.', y: 115 },
  { name: 'Infrastructure', description: 'The hosting and deployment that keep the product available.', y: 175 },
]

// A plate: a regular hexagon of radius R lying flat, seen at an angle (its depth squashed by SQUASH,
// so the drawing is 44 units from the center to the front edge), and THICK units thick.
const R = 115
const SQUASH = 44 / (R * Math.sin(Math.PI / 3))
const THICK = 9
const SPIN_MS = 800

// The six corners after turning the plate by "turn" degrees around its vertical axis.
function corners(turn: number) {
  return Array.from({ length: 6 }, (_, k) => {
    const a = ((turn + k * 60) * Math.PI) / 180
    return { x: R * Math.cos(a), y: SQUASH * R * Math.sin(a), mid: Math.sin(a + Math.PI / 6) }
  })
}

const fmt = (n: number) => n.toFixed(2)

// The top face, and the sides that face the viewer (each a strip pushed down by the thickness).
function plateShape(turn: number) {
  const c = corners(turn)
  const face = `M${c.map((p) => `${fmt(p.x)} ${fmt(p.y)}`).join(' L')} Z`
  const side = c
    .map((p, k) => {
      const q = c[(k + 1) % 6]
      // Only the sides whose middle is in front (toward the viewer) show.
      if (p.mid <= 0) return ''
      return `M${fmt(p.x)} ${fmt(p.y)} L${fmt(q.x)} ${fmt(q.y)} L${fmt(q.x)} ${fmt(q.y + THICK)} L${fmt(p.x)} ${fmt(p.y + THICK)} Z`
    })
    .join(' ')
  return { face, side }
}

const still = plateShape(0)

// The glyph on a plate turns with it: un-squash, turn, squash again.
const glyphTurn = (turn: number) => `scale(1 ${SQUASH}) rotate(${turn}) scale(1 ${1 / SQUASH})`

function HeroMark() {
  const [selected, setSelected] = useState(0)
  // How far the selected plate has turned right now (0 to 360, in degrees).
  const [turn, setTurn] = useState(0)
  const frame = useRef(0)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  function select(i: number) {
    setSelected(i)
    cancelAnimationFrame(frame.current)
    setTurn(0)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let start = -1 // the first frame's time
    const step = (now: number) => {
      if (start < 0) start = now
      const t = Math.min((now - start) / SPIN_MS, 1)
      const eased = 1 - Math.pow(1 - t, 3) // fast start, soft landing
      setTurn(t < 1 ? eased * 360 : 0)
      if (t < 1) frame.current = requestAnimationFrame(step)
    }
    frame.current = requestAnimationFrame(step)
  }

  return (
    <figure className="layer-figure">
      <figcaption>The anatomy of an app</figcaption>
      <div className="layer-drawing">
        {/* Pointer shortcut only: the radio buttons below are the accessible way to choose a layer. */}
        <svg viewBox="0 0 390 290" focusable="false" aria-hidden="true">
          <defs>
            {/* style, not the stopColor attribute: CSS variables only work in style. */}
            <linearGradient id="plate-active" x1="0" y1="0" x2="1" y2="1">
              <stop style={{ stopColor: 'var(--plate-on-1)' }} />
              <stop offset="0.55" style={{ stopColor: 'var(--plate-on-2)' }} />
              <stop offset="1" style={{ stopColor: 'var(--plate-on-3)' }} />
            </linearGradient>
            <linearGradient id="plate-idle" x1="0" y1="0" x2="1" y2="1">
              <stop style={{ stopColor: 'var(--plate-idle-1)' }} />
              <stop offset="1" style={{ stopColor: 'var(--plate-idle-2)' }} />
            </linearGradient>
          </defs>
          <g transform="translate(195 30)">
            <ellipse className="layer-shadow" cx="0" cy="232" rx="110" ry="14" />
            <path className="layer-axis" d="M0 -24v250M-120 174l120 46 120-46" />
            {/* Drawn bottom to top, so the upper plates sit in front of the lower ones. */}
            {[2, 1, 0].map((i) => {
              const active = i === selected
              const plateTurn = active ? turn : 0
              const { face, side } = plateTurn ? plateShape(plateTurn) : still
              return (
                // Outer: the plate's place. Then: where it goes when the stack opens (hover), its
                // float (the wave), and the clickable plate itself.
                <g key={layers[i].name} transform={`translate(0 ${layers[i].y})`}>
                  <g className={`plate-slot plate-slot--${i}`}>
                    <g className="plate-float" style={{ '--i': i } as CSSProperties}>
                      <g className={active ? 'plate plate--active' : 'plate'} onClick={() => select(i)}>
                        <path className="plate-edge" d={side} />
                        <path className="plate-face" d={face} fill={active ? 'url(#plate-active)' : 'url(#plate-idle)'} />
                        <g transform={plateTurn ? glyphTurn(plateTurn) : undefined}>
                          {i === 0 && (
                            <g className="plate-glyph">
                              <path d="M-29 0 -14.5 -11h29L29 0 14.5 11h-29Z" />
                              <ellipse rx="6.5" ry="2.8" fill="currentColor" stroke="none" />
                            </g>
                          )}
                          {i === 1 && <path className="plate-glyph" d="m-41 1 25-10m-16 16 45-18m-32 23 29-12" />}
                          {i === 2 && <path className="plate-glyph" strokeDasharray="3 4" d="M-68 0 -34 -25h68L68 0 34 25h-68Z" />}
                        </g>
                        {/* The climbing light: each plate's edge brightens in turn, bottom to top. */}
                        <path className="plate-light" d={face} />
                      </g>
                    </g>
                  </g>
                </g>
              )
            })}
          </g>
        </svg>
      </div>
      <fieldset className="layer-switch">
        <legend className="sr-only">Explore an application layer</legend>
        {layers.map((layer, i) => (
          <label key={layer.name}>
            <input type="radio" name="app-layer" checked={selected === i} onChange={() => select(i)} />
            <span>{layer.name}</span>
          </label>
        ))}
      </fieldset>
      <p className="layer-caption" aria-live="polite">
        {layers[selected].description}
      </p>
    </figure>
  )
}

export default HeroMark
