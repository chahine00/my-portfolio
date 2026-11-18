// The night desk: what the hero shows instead of the avatar every other time a visitor comes back
// to the top of the page (see useReturnSwap in Hero.tsx), so your face isn't on screen everywhere
// (the guide is the avatar too).
//
// A small, cozy workspace at night, drawn in SVG (no words or technology names on it, the hero's
// text already says what you build):
// - a window with the night sky: a moon, twinkling stars, and now and then a shooting star;
// - a laptop on the desk whose screen "types" code (colored bars, line after line), then starts over,
//   with its glow on the desk in front of it;
// - a desk lamp lighting the desk, a mug of coffee with rising steam, and a plant swaying a little.
// - The tiny robot (HeroRobot.tsx) has its home here while the desk shows, instead of the welcome
//   box behind the avatar: it stands on the desk, between the laptop and the mug. Like on the
//   welcome box, it comes out into the hero by itself after a moment, and once sent home with its
//   "Hide" button, it waits there with a "click me!" tag until clicked.
// Apart from the tiny robot, it's only decoration (the avatar's picture keeps its alt text), so
// screen readers skip it.
// The looks and the moves are in global.css under "night desk". Visitors who turn off animations
// get the whole scene still, with the code already typed.
// (The file keeps its old name, RobotLab: the scene used to be a big robot.)

import { useEffect, useId, useRef, type KeyboardEvent, type PointerEvent } from 'react'
import RobotSprite from '../../components/RobotSprite.tsx'
import { callRobotOut, isRobotDismissed } from '../../components/robotStore.ts'

const KID_OUT_AFTER_MS = 2200 // the tiny robot comes out by itself this long after the desk appears

// The scene is drawn in a 260 × 220 box. The desk's top is at DESK_Y.
const DESK_Y = 176

// The code on the laptop's screen: one row per line, each a few colored bars (x offset and
// width, in the screen's units). Indents make it look like real code.
const CODE: { x: number; w: number; tone: 1 | 2 | 3 | 4 }[][] = [
  [{ x: 0, w: 14, tone: 1 }, { x: 17, w: 22, tone: 2 }, { x: 42, w: 8, tone: 3 }],
  [{ x: 8, w: 18, tone: 4 }, { x: 29, w: 26, tone: 2 }],
  [{ x: 8, w: 10, tone: 1 }, { x: 21, w: 16, tone: 3 }, { x: 40, w: 20, tone: 2 }],
  [{ x: 16, w: 30, tone: 4 }],
  [{ x: 8, w: 12, tone: 3 }, { x: 23, w: 24, tone: 2 }],
  [{ x: 0, w: 6, tone: 1 }],
]
const SCREEN = { x: 70, y: 106, w: 92, h: 60 } // the laptop's screen
const LINE_GAP = 8.5 // between two rows of code
const ROW_DELAY = 0.55 // seconds between two rows starting to type

// The tiny robot: standing on the desk, between the laptop and the mug.
const KID = 34 // its size
const KID_X = 184 // its center
const KID_Y = DESK_Y - (KID * 38) / 40 // its feet (38 of 40 in its drawing) on the desk

const STARS = [
  { x: 34, y: 30, r: 1.3 },
  { x: 58, y: 22, r: 0.9 },
  { x: 96, y: 34, r: 1.1 },
  { x: 44, y: 58, r: 0.8 },
  { x: 78, y: 52, r: 1.4 },
  { x: 104, y: 70, r: 0.9 },
  { x: 30, y: 78, r: 1 },
]

interface RobotLabProps {
  robotHome: boolean // the tiny robot is at home (not out in the hero)
  robotDismissed: boolean // it was sent home with "Hide": it waits for a click
}

function RobotLab({ robotHome, robotDismissed }: RobotLabProps) {
  const kidRef = useRef<SVGGElement>(null)
  // Unique ids for the SVG's gradients and masks.
  const id = useId().replace(/:/g, '')

  // Comes out by itself a moment after the desk appears (unless it was sent home with "Hide").
  useEffect(() => {
    if (!robotHome || robotDismissed) return
    const timer = window.setTimeout(() => {
      const kid = kidRef.current
      if (kid && !isRobotDismissed()) callRobotOut(kid.getBoundingClientRect())
    }, KID_OUT_AFTER_MS)
    return () => window.clearTimeout(timer)
  }, [robotHome, robotDismissed])

  // Pointer down (not click), like on the welcome box: it comes out from where it stands.
  function letKidOut(event: PointerEvent<SVGGElement> | KeyboardEvent<SVGGElement>) {
    event.stopPropagation()
    callRobotOut((kidRef.current ?? event.currentTarget).getBoundingClientRect())
  }

  return (
    <div className="lab">
      <svg className="desk" viewBox="0 0 260 220" aria-hidden={robotHome ? undefined : true}>
        <defs>
          <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1030" />
            <stop offset="1" stopColor="#27235a" />
          </linearGradient>
          <linearGradient id={`${id}-cone`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fde68a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${id}-glow`}>
            <stop offset="0" stopColor="var(--accent-2)" stopOpacity="0.45" />
            <stop offset="1" stopColor="var(--accent-2)" stopOpacity="0" />
          </radialGradient>
          {/* The moon's crescent: a disc with a smaller one cut out of it. */}
          <mask id={`${id}-moon`}>
            <circle cx="94" cy="28" r="11" fill="#fff" />
            <circle cx="99" cy="24" r="9.5" fill="#000" />
          </mask>
        </defs>

        {/* The window and its night sky. */}
        <g className="desk__window">
          <rect className="desk__sky" x="18" y="12" width="104" height="80" rx="6" fill={`url(#${id}-sky)`} />
          <circle className="desk__moon" cx="94" cy="28" r="11" mask={`url(#${id}-moon)`} />
          {STARS.map((s, i) => (
            <circle
              key={i}
              className="desk__star"
              cx={s.x}
              cy={s.y}
              r={s.r}
              style={{ animationDelay: `${(i * 0.7) % 3.1}s` }}
            />
          ))}
          <line className="desk__shooting" x1="40" y1="20" x2="62" y2="32" pathLength={1} />
          {/* The frame: outline and the cross bars. */}
          <rect className="desk__frame" x="18" y="12" width="104" height="80" rx="6" />
          <line className="desk__frame" x1="70" y1="12" x2="70" y2="92" />
          <line className="desk__frame" x1="18" y1="52" x2="122" y2="52" />
        </g>

        {/* The lamp's light on the desk (drawn first, under everything on the desk). */}
        <path className="desk__cone" d="M206 104 L162 176 L246 176 Z" fill={`url(#${id}-cone)`} />

        {/* The desk. */}
        <rect className="desk__top" x="6" y={DESK_Y} width="248" height="8" rx="3" />
        <rect className="desk__leg" x="16" y={DESK_Y + 8} width="7" height="34" rx="2" />
        <rect className="desk__leg" x="237" y={DESK_Y + 8} width="7" height="34" rx="2" />

        {/* The laptop's glow on the desk in front of it. */}
        <ellipse className="desk__glow" cx="116" cy={DESK_Y + 2} rx="60" ry="9" fill={`url(#${id}-glow)`} />

        {/* The plant, on the left. */}
        <g className="desk__plant">
          <g className="desk__leaves">
            <path d="M36 152 C 24 140, 20 128, 24 116 C 34 126, 38 138, 36 152 Z" />
            <path d="M38 152 C 44 136, 52 128, 62 126 C 60 138, 50 148, 38 152 Z" />
            <path d="M36 152 C 30 144, 18 142, 10 146 C 18 154, 28 156, 36 152 Z" />
          </g>
          <path className="desk__pot" d="M26 152 h22 l-3 24 h-16 z" />
        </g>

        {/* The laptop: the screen, then the base. */}
        <g className="desk__laptop">
          <rect className="desk__lid" x={SCREEN.x - 5} y={SCREEN.y - 5} width={SCREEN.w + 10} height={SCREEN.h + 10} rx="5" />
          <rect className="desk__screen" x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx="2" />
          {CODE.map((row, r) => (
            <g
              key={r}
              className="desk__code"
              style={{ animationDelay: `${(r * ROW_DELAY).toFixed(2)}s` }}
            >
              {row.map((bar, b) => (
                <rect
                  key={b}
                  className={`desk__bar desk__bar--${bar.tone}`}
                  x={SCREEN.x + 8 + bar.x}
                  y={SCREEN.y + 8 + r * LINE_GAP}
                  width={bar.w}
                  height="4"
                  rx="2"
                />
              ))}
            </g>
          ))}
          <rect
            className="desk__cursor"
            x={SCREEN.x + 8 + 10}
            y={SCREEN.y + 8 + (CODE.length - 1) * LINE_GAP - 1}
            width="3"
            height="6"
            rx="1"
          />
          <path className="desk__base" d={`M${SCREEN.x - 14} ${DESK_Y} L${SCREEN.x - 5} ${SCREEN.y + SCREEN.h + 5} H${SCREEN.x + SCREEN.w + 5} L${SCREEN.x + SCREEN.w + 14} ${DESK_Y} Z`} />
        </g>

        {/* The mug of coffee, with its steam. */}
        <g className="desk__mug">
          <path className="desk__steam" d="M212 150 c -4 -6, 4 -10, 0 -16 s 4 -10, 0 -14" />
          <path className="desk__steam desk__steam--late" d="M220 152 c -4 -6, 4 -10, 0 -16 s 4 -10, 0 -14" />
          <path className="desk__handle" d="M228 160 h3 a5 5 0 0 1 0 10 h-3" />
          <rect className="desk__cup" x="206" y="155" width="22" height="21" rx="3" />
        </g>

        {/* The lamp, on the right: its base, its arm, and its head bending over the desk. */}
        <g className="desk__lamp">
          <path className="desk__arm" d="M240 174 L246 132 L212 100" />
          <circle className="desk__joint" cx="246" cy="132" r="2.5" />
          <path className="desk__shade" d="M196 106 L206 92 L222 102 L214 112 Z" />
          <circle className="desk__bulb" cx="206" cy="108" r="3" />
          <rect className="desk__lamp-base" x="230" y={DESK_Y - 5} width="22" height="5" rx="2" />
        </g>

        {/* The tiny robot, standing on the desk. */}
        {robotHome && (
          <g
            className="lab__kid"
            role="button"
            tabIndex={0}
            aria-label="Tiny robot. Click to let it out."
            data-waiting={robotDismissed ? 'true' : undefined}
            onPointerDown={letKidOut}
            onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && letKidOut(event)}
          >
            {/* A bigger, invisible area to click or tap: the robot and its tag. */}
            <rect className="lab__kid-hit" x={KID_X - 30} y={KID_Y - 26} width={60} height={KID + 26} />
            <g className="lab__kid-tag">
              <rect x={KID_X - 30} y={KID_Y - 22} width={60} height={18} rx={9} />
              <text className="lab__kid-tag--mouse" x={KID_X} y={KID_Y - 9.5}>
                click me!
              </text>
              <text className="lab__kid-tag--touch" x={KID_X} y={KID_Y - 9.5}>
                tap me!
              </text>
            </g>
            {/* data-robot="walk": its legs and arms step (same CSS as HeroRobot). */}
            <g ref={kidRef} className="lab__kid-body" data-robot="walk">
              <RobotSprite x={KID_X - KID / 2} y={KID_Y} width={KID} height={KID} />
            </g>
          </g>
        )}
      </svg>
    </div>
  )
}

export default RobotLab
