// The home hero's picture: the Axihex hexagon reimagined as the three layers of an application
// (Interface, Backend, Infrastructure).
// - At rest the plates bob in a quick ripple up the stack (it keeps opening and closing), the shadow
//   breathes with them, and a pulse of light shoots up through them every few seconds.
// - Hovering the drawing with a mouse opens the stack up (an "exploded view"): the top plate rises,
//   the bottom sinks. Not on touch screens, where a tap would move the plates under the finger.
// - Click a plate (or its button below) to select it: it lifts, spins once around its own axis (top
//   and sides together, like a real hexagonal plate, overshooting a little and springing back), and
//   the caption explains that layer.
// - On arrival the hexagons fly in from all over the drawing, scattered and tumbling, and come
//   together as a flying saucer, widest at the base: Infrastructure is its wide rim (the
//   foundation), Backend sits on it, Interface is the small dome on top, and the small scattered
//   hexagons become the lights around the rim. A soft beam then shines down from it. It plays when
//   the drawing first comes into view, and again when the navbar's Home link (or the back-to-top
//   button) brings you back to the top.
// Colors follow the theme (light / dark): see "Home hero" in global.css.

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { BACK_AT_TOP_EVENT } from '../../utils/goToTop.ts'

// "y": where the plate sits in the saucer; "sx"/"sy": its size there (Infrastructure the biggest,
// then Backend, then Interface: the dome, small and a little taller). "from": where it starts,
// scattered: an offset, a tilt and a size.
const layers = [
  {
    name: 'Interface',
    description: 'The screens people use to find information and get things done.',
    y: 100,
    sx: 0.46,
    sy: 0.62,
    from: { x: -150, y: -70, turn: -38, scale: 0.7 },
  },
  {
    name: 'Backend',
    description: 'The rules, data and integrations behind each action on screen.',
    y: 124,
    sx: 0.72,
    sy: 0.8,
    from: { x: 170, y: -40, turn: 24, scale: 0.55 },
  },
  {
    name: 'Infrastructure',
    description: 'The hosting and deployment that keep the product available.',
    y: 146,
    sx: 1,
    sy: 1,
    from: { x: -120, y: 90, turn: 46, scale: 0.8 },
  },
]

// A plate: a regular hexagon of radius R lying flat, seen at an angle (its depth squashed by SQUASH,
// so the drawing is 44 units from the center to the front edge), and THICK units thick.
const R = 115
const SQUASH = 44 / (R * Math.sin(Math.PI / 3))
const THICK = 9
const SPIN_MS = 700

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

// A small flat hexagon (the scattered pieces that become the rim's lights).
const smallHex = (r: number) =>
  `M${Array.from({ length: 6 }, (_, k) => {
    const a = (k * 60 * Math.PI) / 180
    return `${fmt(r * Math.cos(a))} ${fmt(r * SQUASH * 1.6 * Math.sin(a))}`
  }).join(' L')} Z`

// The rim's lights: along the plate's front sides (the ones facing the viewer), halfway down its
// thickness. Each starts somewhere around the drawing (dx, dy: how far from its place), tumbling.
const rimLights = (() => {
  const c = corners(0)
  const spots: { x: number; y: number }[] = []
  c.forEach((p, k) => {
    const q = c[(k + 1) % 6]
    if (p.mid <= 0) return
    for (const t of [0.25, 0.75]) spots.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t + THICK / 2 })
  })
  const starts = [
    { dx: 150, dy: -150 },
    { dx: -40, dy: -170 },
    { dx: 140, dy: 90 },
    { dx: -150, dy: 80 },
    { dx: 60, dy: -130 },
    { dx: -170, dy: -110 },
  ]
  return spots.map((spot, i) => ({ ...spot, ...starts[i % starts.length], turn: i % 2 ? 140 : -120 }))
})()
const lightHex = smallHex(3.6)

// The glyph on a plate turns with it: un-squash, turn, squash again.
const glyphTurn = (turn: number) => `scale(1 ${SQUASH}) rotate(${turn}) scale(1 ${1 / SQUASH})`

// layer / onLayer (optional): choosing a layer from outside (the capabilities beside it in
// BuildSection.tsx), and hearing which one the visitor picked here.
function HeroMark({ layer, onLayer }: { layer?: number; onLayer?: (index: number) => void } = {}) {
  const [selected, setSelected] = useState(0)
  // How far the selected plate has turned right now (0 to 360, in degrees).
  const [turn, setTurn] = useState(0)
  const frame = useRef(0)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  // A layer chosen from outside: select it here too (with its spin), unless it already is.
  const selectedRef = useRef(selected)
  const selectRef = useRef(select)
  useLayoutEffect(() => {
    selectedRef.current = selected
    selectRef.current = select
  })
  useEffect(() => {
    if (layer !== undefined && layer !== selectedRef.current) selectRef.current(layer)
  }, [layer])

  // The saucer comes together once the drawing is on screen (not while it's scrolled away), and
  // again each time the visitor is brought back to the top (a new "assembly" key replays it).
  const drawingRef = useRef<HTMLDivElement>(null)
  const [assembling, setAssembling] = useState(false)
  const [assembly, setAssembly] = useState(0)
  useEffect(() => {
    const drawing = drawingRef.current
    if (!drawing) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setAssembling(true)
        observer.disconnect()
      }
    })
    observer.observe(drawing)
    const replay = () => setAssembly((n) => n + 1)
    window.addEventListener(BACK_AT_TOP_EVENT, replay)
    return () => {
      observer.disconnect()
      window.removeEventListener(BACK_AT_TOP_EVENT, replay)
    }
  }, [])

  function select(i: number) {
    setSelected(i)
    onLayer?.(i)
    cancelAnimationFrame(frame.current)
    setTurn(0)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let start = -1 // the first frame's time
    const step = (now: number) => {
      if (start < 0) start = now
      const t = Math.min((now - start) / SPIN_MS, 1)
      // Fast start, then a small overshoot past a full turn that springs back (an "ease out back").
      const c = 1.6
      const eased = 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2)
      setTurn(t < 1 ? eased * 360 : 0)
      if (t < 1) frame.current = requestAnimationFrame(step)
    }
    frame.current = requestAnimationFrame(step)
  }

  return (
    <figure className="layer-figure">
      <figcaption>The anatomy of an app</figcaption>
      <div ref={drawingRef} className={assembling ? 'layer-drawing layer-drawing--assemble' : 'layer-drawing'}>
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
            {/* The beam under the saucer: bright at the saucer, fading toward the ground. */}
            <linearGradient id="saucer-beam" x1="0" y1="0" x2="0" y2="1">
              <stop style={{ stopColor: 'var(--plate-light)', stopOpacity: 0.32 }} />
              <stop offset="1" style={{ stopColor: 'var(--plate-light)', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          {/* key: a new value replays the whole assembly from the scattered start. */}
          <g key={assembly} transform="translate(195 30)">
            <g className="saucer-shadow">
              <ellipse className="layer-shadow" cx="0" cy="232" rx="110" ry="14" />
            </g>
            <path className="saucer-beam" d="M-40 200 L40 200 L100 234 L-100 234 Z" fill="url(#saucer-beam)" />
            {/* Drawn bottom to top, so the upper plates sit in front of the lower ones. */}
            {[2, 1, 0].map((i) => {
              const active = i === selected
              const plateTurn = active ? turn : 0
              const { face, side } = plateTurn ? plateShape(plateTurn) : still
              const { from } = layers[i]
              const start = {
                '--from-x': `${from.x}px`,
                '--from-y': `${from.y}px`,
                '--from-turn': `${from.turn}deg`,
                '--from-scale': from.scale,
                '--i': i,
              } as CSSProperties
              return (
                // Outer: the plate's place (and size) in the saucer. Then: its flight in from the
                // scattered start, where it goes when the stack opens (hover), its float (the
                // wave), and the plate's drawing.
                <g key={layers[i].name} transform={`translate(0 ${layers[i].y})`}>
                  <g className="plate-place" style={start}>
                  <g transform={`scale(${layers[i].sx} ${layers[i].sy})`}>
                  <g className={`plate-slot plate-slot--${i}`}>
                    <g className="plate-float" style={{ '--i': i } as CSSProperties}>
                      <g className={active ? 'plate plate--active' : 'plate'}>
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
                        {/* The rim's lights: scattered hexagons that fly in and settle along its edge. */}
                        {i === 2 &&
                          !plateTurn &&
                          rimLights.map((light, k) => (
                            <g key={k} transform={`translate(${fmt(light.x)} ${fmt(light.y)})`}>
                              <g
                                className="rim-light-place"
                                style={
                                  {
                                    '--from-x': `${light.dx}px`,
                                    '--from-y': `${light.dy}px`,
                                    '--from-turn': `${light.turn}deg`,
                                    '--k': k,
                                  } as CSSProperties
                                }
                              >
                                <path className="rim-light" d={lightHex} style={{ '--k': k } as CSSProperties} />
                              </g>
                            </g>
                          ))}
                      </g>
                    </g>
                    {/* The click area: an invisible plate that never floats, lifts or spins, so the
                        plate under the pointer is always the one selected. (When the drawing itself
                        was clicked, a plate could move out from under the pointer mid-click and the
                        plate behind it got the click.) */}
                    <path className="plate-hit" d={`${still.face} ${still.side}`} onClick={() => select(i)} />
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
