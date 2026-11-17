// A tiny robot that lives in the hero (the welcome section at the top of the home page).
//
// It isn't there at first: it patrols the "<Welcome />" box of the drawing behind the profile
// photo (Hero.tsx). Clicked or tapped there, it boots up and flies out into the hero. It stays in
// the hero (it's placed inside it, so it scrolls with it and never wanders off), and moves like a
// robot:
// - it walks in servo steps (move, stop, move…) along the top of your name, the two buttons and
//   the social icons, and turns around in a few jerky steps
// - it scans: its eyes sweep the visor while a light beam goes over what's in front of it
// - it flies to another spot with its jet: straight up, straight across, straight down, and lands
//   with a small clunk
// - it beeps now and then (a "!", "♪", "01" or "?" above it), turns to face your mouse, and jets
//   off when you tap or click right next to it
// - left alone for a while, it goes on standby (eyes dim, light off) until the mouse moves again
// Clicking it makes it say something. Its "×" (always shown while it's out) beams it back to the
// welcome box. Visitors who turned off animations get a robot that stands still on
// your name (and still talks).
//
// One requestAnimationFrame loop moves it with a transform, so React doesn't re-draw while it
// moves; only the speech bubble uses React state. The looks and the robot moves are in global.css
// under "tiny robot".

import { useLayoutEffect, useRef, useState } from 'react'
import RobotSprite from './RobotSprite.tsx'
import { robotOrigin, sendRobotHome, useRobotHome } from './robotStore.ts'

type Mode =
  | 'boot' // starting up where it came out (scan line, eyes switching on)
  | 'idle'
  | 'walk' // servo steps along the spot it stands on
  | 'turn'
  | 'scan'
  | 'jet' // flying to another spot
  | 'land'
  | 'standby' // asleep until the mouse moves
  | 'leave' // beaming back to the welcome box

// What it can stand on: your name (on top of the letters), the buttons, the row of social icons.
const PERCHES = '.hero__name, .hero-actions .button, .hero-actions .social-links'

const STEP_MS = 380 // one servo step: it moves for the first part, then stops
const MOVE_SHARE = 0.55
const SPEED = 30 // px per second, on average
const BOOT_MS = 700
const TURN_MS = 300
const SCAN_MS = 1800
const LAND_MS = 220
const LEAVE_MS = 550
const TALK_MS = 4500
const STANDBY_AFTER_MS = 25000 // no mouse movement for this long → standby

const LINES = [
  "Beep boop! I'm Ali's tiny helper bot.",
  'Scanning… this portfolio is 100% handmade.',
  'Try “View my work”: that’s where the good stuff is.',
  '01001000 01101001! (That’s “Hi” in binary.)',
  'Compiling coffee… ☕ please wait.',
  'Need a developer? My human is open for opportunities.',
]

const MARKS = ['!', '♪', '01', '?']

const random = (min: number, max: number) => min + Math.random() * (max - min)
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]

// Where it can stand on a spot, in the hero's coordinates: the top edge, from left to right.
function spanOf(el: Element, hero: HTMLElement) {
  const h = hero.getBoundingClientRect()
  let rect = el.getBoundingClientRect()
  let sink = 0 // how far below the box's top it stands (the letters start below their line box)
  let pad = 10 // keeps it off rounded corners and the ends of the text
  if (el.matches('.hero__name')) {
    rect = (el.lastElementChild ?? el).getBoundingClientRect()
    sink = rect.height * 0.16
    pad = 14
    // The "SOFTWARE ENGINEER" label sits just above your name: stay right of where its letters end.
    const label = hero.querySelector('.hero__text > .eyebrow')
    if (label?.firstChild) {
      const range = document.createRange()
      range.selectNodeContents(label)
      const labelEnd = range.getBoundingClientRect().right + 18
      if (labelEnd > rect.left + pad) rect = new DOMRect(labelEnd - pad, rect.top, rect.right - labelEnd + pad, rect.height)
    }
  } else if (el.matches('.social-links')) {
    const icons = el.querySelectorAll('a')
    if (icons.length) {
      const first = icons[0].getBoundingClientRect()
      const last = icons[icons.length - 1].getBoundingClientRect()
      rect = new DOMRect(first.left, first.top, last.right - first.left, first.height)
    }
    pad = 12
  }
  return { left: rect.left - h.left + pad, right: rect.right - h.left - pad, top: rect.top - h.top + sink }
}

function Robot() {
  const rootRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<HTMLSpanElement>(null)
  const brain = useRef<{ talk: () => void; leave: () => void } | null>(null)
  const [line, setLine] = useState<string | null>(null)
  const [side, setSide] = useState<'left' | 'right'>('left')

  useLayoutEffect(() => {
    const root = rootRef.current
    const hero = root?.closest<HTMLElement>('.hero')
    if (!root || !hero) return
    const robot = root
    const heroEl = hero

    const s = {
      x: 0,
      y: 0, // where its feet are, in the hero
      dir: -1 as 1 | -1,
      mode: 'boot' as Mode,
      until: 0, // when the current move ends
      perch: null as HTMLElement | null,
      walkTo: 0,
      thenWalk: false, // after a turn, walk
      jet: null as null | { x0: number; y0: number; x1: number; y1: number; start: number; duration: number; to: HTMLElement },
      pointer: null as null | { x: number; y: number },
      lastPointer: performance.now(),
      talking: false,
      line: -1,
    }
    let frame = 0
    let last = performance.now()
    let talkTimer = 0

    const size = () => parseFloat(getComputedStyle(robot).getPropertyValue('--robot-size')) || 28
    // The spots it can use now: on screen, with room to stand.
    const perches = () =>
      [...heroEl.querySelectorAll<HTMLElement>(PERCHES)].filter((el) => {
        const span = spanOf(el, heroEl)
        return el.getBoundingClientRect().width > 0 && span.right - span.left >= 12
      })
    const name = () => heroEl.querySelector<HTMLElement>('.hero__name')

    function setMode(mode: Mode, ms = 0) {
      s.mode = mode
      s.until = performance.now() + ms
      robot.dataset.robot = mode
    }

    function setDir(dir: 1 | -1) {
      s.dir = dir
      robot.style.setProperty('--robot-dir', String(dir))
    }

    function place() {
      const sz = size()
      robot.style.transform = `translate(${Math.round(s.x - sz / 2)}px, ${Math.round(s.y - sz)}px)`
    }

    function beep(mark = pick(MARKS)) {
      const el = markRef.current
      if (!el) return
      el.textContent = mark
      el.classList.remove('is-on')
      void el.offsetWidth // restart its animation
      el.classList.add('is-on')
    }

    function jetTo(to: HTMLElement) {
      const span = spanOf(to, heroEl)
      const x1 = random(span.left, Math.max(span.left, span.right))
      const distance = Math.hypot(x1 - s.x, span.top - s.y)
      s.jet = { x0: s.x, y0: s.y, x1, y1: span.top, start: performance.now(), duration: clamp(distance * 3.2, 700, 1500), to }
      setDir(x1 >= s.x ? 1 : -1)
      setMode('jet')
    }

    function turn(dir: 1 | -1) {
      setDir(dir)
      setMode('turn', TURN_MS)
    }

    function rest(min = 700, max = 1600) {
      setMode('idle', random(min, max))
    }

    // What to do next, standing on its spot.
    function decide() {
      if (!s.perch) return
      const span = spanOf(s.perch, heroEl)
      const roll = Math.random()
      // Your mouse is in the hero, behind it: it turns to look at it, now and then.
      if (s.pointer && roll < 0.3 && Math.abs(s.pointer.x - s.x) > 30 && Math.sign(s.pointer.x - s.x) !== s.dir) {
        turn(s.pointer.x > s.x ? 1 : -1)
        return
      }
      if (roll < 0.45 && span.right - span.left > 40) {
        let to = random(span.left, span.right)
        if (Math.abs(to - s.x) < 24) to = clamp(s.x + s.dir * 48, span.left, span.right)
        s.walkTo = to
        const dir = to > s.x ? 1 : -1
        if (dir !== s.dir) {
          s.thenWalk = true
          turn(dir)
        } else setMode('walk')
        return
      }
      if (roll < 0.62) {
        setMode('scan', SCAN_MS)
        return
      }
      if (roll < 0.74) {
        beep()
        rest(1000, 1600)
        return
      }
      const others = perches().filter((p) => p !== s.perch)
      if (others.length) jetTo(pick(others))
      else rest()
    }

    function tick(now: number) {
      const dt = Math.min(now - last, 50) / 1000
      last = now
      const done = now >= s.until

      switch (s.mode) {
        case 'boot': {
          const to = perches().find((p) => p === name()) ?? perches()[0]
          if (done && to) jetTo(to)
          break
        }
        case 'jet': {
          const j = s.jet
          if (!j) break
          const p = (now - j.start) / j.duration
          const apex = Math.min(j.y0, j.y1) - 36
          if (p >= 1) {
            s.x = j.x1
            s.y = j.y1
            s.perch = j.to
            s.jet = null
            setMode('land', LAND_MS)
          } else if (p < 0.3) {
            // Straight up…
            const q = 1 - (1 - p / 0.3) ** 2
            s.x = j.x0
            s.y = j.y0 + (apex - j.y0) * q
          } else if (p < 0.72) {
            // …straight across…
            s.x = j.x0 + (j.x1 - j.x0) * ((p - 0.3) / 0.42)
            s.y = apex
          } else {
            // …and straight down.
            const q = ((p - 0.72) / 0.28) ** 2
            s.x = j.x1
            s.y = apex + (j.y1 - apex) * q
          }
          break
        }
        case 'walk': {
          if (!s.perch) break
          s.y = spanOf(s.perch, heroEl).top
          // Servo steps: it only moves during the first part of each step.
          if ((now % STEP_MS) / STEP_MS < MOVE_SHARE) s.x += (s.dir * SPEED * dt) / MOVE_SHARE
          if (s.dir > 0 ? s.x >= s.walkTo : s.x <= s.walkTo) {
            s.x = s.walkTo
            rest()
          }
          break
        }
        case 'turn':
          if (done) {
            if (s.thenWalk) {
              s.thenWalk = false
              setMode('walk')
            } else rest()
          }
          break
        case 'land':
        case 'scan':
          if (done) rest()
          break
        case 'idle':
        case 'standby':
          if (s.perch) {
            // Stay on its spot even if the layout changed (resize, fonts loading…).
            const span = spanOf(s.perch, heroEl)
            s.y = span.top
            s.x = clamp(s.x, span.left, Math.max(span.left, span.right))
          }
          if (s.mode === 'standby' || s.talking) break
          if (now - s.lastPointer > STANDBY_AFTER_MS) setMode('standby')
          else if (done) decide()
          break
        case 'leave':
          if (done) {
            sendRobotHome()
            return
          }
          break
      }
      place()
      frame = requestAnimationFrame(tick)
    }

    // Start where it came out of the welcome box (or on your name).
    const h = heroEl.getBoundingClientRect()
    const origin = robotOrigin()
    const nameEl = name()
    if (origin) {
      s.x = origin.left + origin.width / 2 - h.left
      s.y = origin.bottom - h.top
    } else if (nameEl) {
      const span = spanOf(nameEl, heroEl)
      s.x = (span.left + span.right) / 2
      s.y = span.top
    }
    setDir(-1)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion && nameEl) {
      // Animations off: it just stands on your name.
      const span = spanOf(nameEl, heroEl)
      s.perch = nameEl
      s.x = (span.left + span.right) / 2
      s.y = span.top
      setMode('idle')
      place()
    } else {
      setMode('boot', BOOT_MS)
      place()
      frame = requestAnimationFrame(tick)
    }

    function onPointerMove(event: PointerEvent) {
      s.lastPointer = performance.now()
      const r = heroEl.getBoundingClientRect()
      const inside = event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom
      s.pointer = inside ? { x: event.clientX - r.left, y: event.clientY - r.top } : null
      // Waking up from standby: a quick scan to look around.
      if (s.mode === 'standby') setMode('scan', 900)
    }

    // A click or tap right next to it (not on it) startles it: "!" and it jets off.
    function onPointerDown(event: PointerEvent) {
      s.lastPointer = performance.now()
      if (robot.contains(event.target as Node) || reduceMotion) return
      if (!['idle', 'walk', 'scan', 'turn'].includes(s.mode) || s.talking) return
      const r = heroEl.getBoundingClientRect()
      const near = Math.hypot(event.clientX - r.left - s.x, event.clientY - r.top - (s.y - size() / 2)) < 56
      const others = perches().filter((p) => p !== s.perch)
      if (near && others.length) {
        beep('!')
        jetTo(pick(others))
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })

    brain.current = {
      talk() {
        if (s.mode === 'leave' || s.mode === 'boot' || s.mode === 'jet') return
        s.talking = true
        s.lastPointer = performance.now()
        if (s.mode === 'walk' || s.mode === 'standby') setMode('idle')
        s.line = (s.line + 1) % LINES.length
        setLine(LINES[s.line])
        // The bubble opens toward the middle of the hero.
        setSide(s.x > heroEl.clientWidth / 2 ? 'right' : 'left')
        window.clearTimeout(talkTimer)
        talkTimer = window.setTimeout(() => {
          s.talking = false
          setLine(null)
          s.until = performance.now() + 800
        }, TALK_MS)
      },
      leave() {
        window.clearTimeout(talkTimer)
        s.talking = false
        setLine(null)
        s.jet = null
        setMode('leave', LEAVE_MS)
        if (!frame || reduceMotion) window.setTimeout(sendRobotHome, reduceMotion ? 0 : LEAVE_MS)
      },
    }

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(talkTimer)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      brain.current = null
    }
  }, [])

  return (
    <div ref={rootRef} className="robot" data-talking={line ? 'true' : undefined}>
      {line && (
        <p className="robot__bubble" data-side={side} role="status">
          {line}
        </p>
      )}
      <span ref={markRef} className="robot__mark" aria-hidden="true" />
      <button
        type="button"
        className="robot__hit"
        aria-label="Tiny robot. Click to hear what it says."
        onClick={() => brain.current?.talk()}
      >
        <span className="robot__flip">
          <RobotSprite className="robot__sprite" />
        </span>
      </button>
      <button
        type="button"
        className="robot__home"
        aria-label="Send the robot back to the welcome box"
        onClick={() => brain.current?.leave()}
      >
        ×
      </button>
    </div>
  )
}

// Only on the page while it's out of the welcome box.
function HeroRobot() {
  const home = useRobotHome()
  return home ? null : <Robot />
}

export default HeroRobot
