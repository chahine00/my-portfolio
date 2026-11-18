// The robot's lab: what the hero shows instead of the avatar every other time a visitor comes back
// to the top of the page (see useReturnSwap in Hero.tsx), so your face isn't on screen everywhere
// (the guide is the avatar too).
//
// - A compact terminal at the bottom types a short status of what you build (profile.lab.lines in
//   src/data/profile.ts), one line after another (new lines push the old ones up, like a real
//   terminal), then starts over.
// - Above it, the robot (the same drawing as the tiny robot, RobotSprite.tsx, much bigger) floats
//   in the middle of your stack (profile.lab.stack): each technology is a node wired to it, and
//   pulses of data run along the wires, lighting the nodes up one after another.
// - The robot scans with its eyes, blinks its antenna light, and its core pulses.
// - The tiny robot (HeroRobot.tsx) has its home here while the lab shows, instead of the welcome
//   box behind the avatar: it rides on the big robot's head, like a child on its parent's
//   shoulders. Like on the welcome box, it comes out into the hero by itself after a moment, and
//   once sent home with its "Hide" button, it waits up there with a "click me!" tag until clicked.
// Apart from the tiny robot, it's only decoration (the avatar's picture keeps its alt text), so
// screen readers skip it.
// The looks and the moves are in global.css under "robot lab". Visitors who turn off animations
// get the whole terminal at once, and nothing moves.

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import RobotSprite from '../../components/RobotSprite.tsx'
import { callRobotOut, isRobotDismissed } from '../../components/robotStore.ts'
import { profile } from '../../data/profile.ts'

const TYPE_MS = 32 // per letter
const LINE_PAUSE_MS = 380 // between two lines
const HOLD_MS = 2600 // the full terminal stays this long before it starts over
const KID_OUT_AFTER_MS = 2200 // the tiny robot comes out by itself this long after the lab appears

// The terminal's text so far: the lines already typed, and how much of the current one.
function useTerminal(lines: string[]) {
  const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [state, setState] = useState({ line: reduceMotion ? lines.length : 0, chars: 0 })

  useEffect(() => {
    if (reduceMotion) return
    const { line, chars } = state
    let delay: number
    let next: typeof state
    if (line >= lines.length) {
      delay = HOLD_MS
      next = { line: 0, chars: 0 }
    } else if (chars < lines[line].length) {
      delay = TYPE_MS
      next = { line, chars: chars + 1 }
    } else {
      delay = LINE_PAUSE_MS
      next = { line: line + 1, chars: 0 }
    }
    const timer = window.setTimeout(() => setState(next), delay)
    return () => window.clearTimeout(timer)
  }, [state, lines, reduceMotion])

  return state
}

// The stack's nodes, around the robot, in the SVG's units
// (the network is drawn in a 260 × 220 box, the robot's core at its center).
const CX = 130
const CY = 112
const ROBOT = 120 // the robot's size
function nodeAt(i: number, count: number) {
  // Two columns on either side of the robot (never above its head or below its feet): the first
  // half on the left from top to bottom, the rest on the right.
  const perSide = Math.ceil(count / 2)
  const left = i < perSide
  const row = left ? i : i - perSide
  const rows = left ? perSide : count - perSide
  // Spread evenly from 50 above the robot's core to 50 below it; the middle ones a bit further
  // out, so the column curves around the robot.
  const t = rows > 1 ? row / (rows - 1) : 0.5 // 0 = top, 1 = bottom
  const out = 80 + Math.sin(t * Math.PI) * 10
  return { x: CX + (left ? -out : out), y: CY - 50 + t * 100 }
}

// Where the tiny robot rides: on the big robot's head, right of its antenna. The big robot's
// head starts 8 units down its 40-unit drawing, at 3× (ROBOT / 40).
const KID = 34 // its size
const KID_X = CX + 22 // its center
const HEAD_TOP = CY - (ROBOT * 28.7) / 40 + (ROBOT * 8) / 40
const KID_Y = HEAD_TOP - (KID * 38) / 40 // its feet (38 of 40 in its drawing) on the head

interface RobotLabProps {
  robotHome: boolean // the tiny robot is at home (not out in the hero)
  robotDismissed: boolean // it was sent home with "Hide": it waits for a click
}

function RobotLab({ robotHome, robotDismissed }: RobotLabProps) {
  const { lines, stack } = profile.lab
  const { line, chars } = useTerminal(lines)
  const kidRef = useRef<SVGGElement>(null)

  // Comes out by itself a moment after the lab appears (unless it was sent home with "Hide").
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
      <svg className="lab__net" viewBox="0 0 260 220" aria-hidden={robotHome ? undefined : true}>
        {/* The wires, from the robot's core to each node, with a pulse running along each one. */}
        {stack.map((name, i) => {
          const { x, y } = nodeAt(i, stack.length)
          const delay = `${(i * 0.45).toFixed(2)}s`
          return (
            <g key={name}>
              <line className="lab__wire" x1={CX} y1={CY} x2={x} y2={y} />
              <line
                className="lab__pulse"
                x1={CX}
                y1={CY}
                x2={x}
                y2={y}
                pathLength={1}
                style={{ animationDelay: delay }}
              />
            </g>
          )
        })}
        {/* A slow radar ring around the robot. */}
        <circle className="lab__ring" cx={CX} cy={CY} r="58" />
        <circle className="lab__ring lab__ring--late" cx={CX} cy={CY} r="58" />
        {stack.map((name, i) => {
          const { x, y } = nodeAt(i, stack.length)
          const w = name.length * 6.6 + 18
          return (
            <g key={name} className="lab__node" style={{ animationDelay: `${(i * 0.45 + 0.9).toFixed(2)}s` }}>
              <rect x={x - w / 2} y={y - 11} width={w} height={22} rx={11} />
              <text x={x} y={y + 3.8}>
                {name}
              </text>
            </g>
          )
        })}
        {/* The robot, floating in the middle (its core sits on the wires' center). */}
        <g className="lab__bot">
          {/* Its core is at (20, 28.7) of its 40 × 40 drawing: put that on the wires' center. */}
          <RobotSprite
            className="lab__robot"
            x={CX - ROBOT / 2}
            y={CY - (ROBOT * 28.7) / 40}
            width={ROBOT}
            height={ROBOT}
          />
          {/* The tiny robot, riding on its head (inside this group, so it floats with it). */}
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
        </g>
      </svg>
      <div className="lab__terminal" aria-hidden="true">
        <div className="lab__bar">
          <span />
          <span />
          <span />
          <em>robot@ali ~ </em>
        </div>
        <div className="lab__lines">
          {lines.map((text, i) => {
            if (i > line) return null
            const shown = i < line ? text : text.slice(0, chars)
            const done = i < line
            return (
              <p key={text} className={`lab__line${text.startsWith('✓') && done ? ' lab__line--ok' : ''}`}>
                {shown}
                {i === line && <span className="lab__caret" />}
              </p>
            )
          })}
          {line >= lines.length && (
            <p className="lab__line">
              $ <span className="lab__caret" />
            </p>
          )}
        </div>
      </div>

    </div>
  )
}

export default RobotLab
