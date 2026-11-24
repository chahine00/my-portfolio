// The home hero's picture: the Axihex mark as a stack of three hexagon layers, seen in perspective,
// like the layers of a product being built. The top layer carries the Axihex mark (a hexagon with
// a dot); the middle one a few short "code" lines; the bottom one a dashed inner ring.
//
// Drawn in SVG, centered on (0, 0), in the same coordinates as the hover drawing (MarkArt in
// Hero.tsx). Each layer is a flat-top hexagon squashed to half its height (so it reads as a plate
// lying flat) with a thin side face for thickness.
// - At rest the layers float a little, each on its own beat, and light climbs up through them
//   (bottom, middle, top), like something being built.
// - While the hero is hovered (.hero__visual--on), the stack opens up into an "exploded view":
//   the top layer rises and the bottom one sinks, so MarkArt's lines can reach each layer.
// Only CSS transforms and opacity move, so it stays light. The looks and moves are in global.css
// under "hero mark". Decoration only: screen readers skip it.

import { useId, type CSSProperties } from 'react'
import { LAYER_R } from './heroMarkLayers.ts'

// How thick a layer looks (its radius and positions are in heroMarkLayers.ts).
const THICKNESS = 14
const SQUASH = 0.5 // perspective: the hexagon is drawn at half its height
const HALF_H = Math.round(((LAYER_R * Math.sqrt(3)) / 2) * SQUASH) // 52: from the center to the front edge

// The top face of a layer centered on (0, 0): a flat-top hexagon, squashed.
const face = (r = LAYER_R, h = HALF_H) => `M${-r} 0 L${-r / 2} ${-h} L${r / 2} ${-h} L${r} 0 L${r / 2} ${h} L${-r / 2} ${h} Z`
// Its thickness: the three front edges, pushed down.
const side = `M${-LAYER_R} 0 L${-LAYER_R / 2} ${HALF_H} L${LAYER_R / 2} ${HALF_H} L${LAYER_R} 0 V${THICKNESS} L${LAYER_R / 2} ${HALF_H + THICKNESS} L${-LAYER_R / 2} ${HALF_H + THICKNESS} L${-LAYER_R} ${THICKNESS} Z`

function HeroMark() {
  // Unique ids for the gradients, in case the mark is ever shown twice on a page.
  const id = useId().replace(/:/g, '')
  const edge = `hero-mark-edge-${id}`
  const fill = `hero-mark-fill-${id}`

  // Drawn bottom layer first, so each layer above covers the one under it.
  const layers = [2, 1, 0]

  return (
    <svg className="hero-mark" viewBox="-185 -185 370 370" aria-hidden="true">
      <defs>
        <linearGradient id={edge} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-2)" />
        </linearGradient>
        <linearGradient id={fill} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="color-mix(in srgb, var(--accent) 22%, var(--bg))" />
          <stop offset="100%" stopColor="color-mix(in srgb, var(--accent-2) 10%, var(--bg))" />
        </linearGradient>
      </defs>

      {/* A soft shadow under the stack. */}
      <ellipse className="hero-mark__shadow" cx="0" cy="150" rx="110" ry="18" />

      {layers.map((i) => (
        // The outer group moves the layer (rest / open, see global.css); the inner one floats.
        <g key={i} className={`hero-mark__layer hero-mark__layer--${i}`} style={{ '--i': i } as CSSProperties}>
          <g className="hero-mark__float">
            <path className="hero-mark__side" d={side} />
            <path className="hero-mark__face" d={face()} fill={`url(#${fill})`} stroke={`url(#${edge})`} />
            {/* The light that climbs up through the layers: a brighter edge, in turn. */}
            <path className="hero-mark__light" d={face()} />

            {i === 0 && (
              // The Axihex mark on the top layer: a hexagon with a dot, lying on it.
              <>
                <path className="hero-mark__logo" d={face(44, 19)} stroke={`url(#${edge})`} />
                <ellipse className="hero-mark__dot" rx="12" ry="6" fill={`url(#${edge})`} />
              </>
            )}
            {i === 1 && (
              // A few short lines, like code on the middle layer.
              <path className="hero-mark__lines" d="M-52 -12 h40 M-36 0 h56 M-20 12 h30" />
            )}
            {i === 2 && <path className="hero-mark__ring" d={face(80, 35)} />}
          </g>
        </g>
      ))}
    </svg>
  )
}

export default HeroMark
