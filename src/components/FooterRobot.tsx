// A second tiny robot, on the footer's last line (the "© … · View source" line). It's the same
// drawing and moves as the hero robot (RobotSprite.tsx, "tiny robot" styles in global.css), but
// much simpler: it patrols that one line of text and never leaves it.
// - it walks in servo steps from one end of the line to the other, turns around, and now and then
//   stops to scan, wave or hop
// - it waves when you scroll down to the footer
// - it dances while the mouse is on it
// - clicked or tapped, it says a footer joke in a speech bubble, which closes by itself
// - it stops moving while the footer is off screen (saves battery)
// - visitors who turned off animations get a robot standing still at the end of the line
// One requestAnimationFrame loop moves it with a transform; only the speech bubble uses React state.

import { useEffect, useRef, useState } from 'react'
import RobotSprite from './RobotSprite.tsx'

type Mode = 'idle' | 'walk' | 'turn' | 'scan' | 'wave' | 'hop' | 'dance'

const LINES = [
  'You reached the footer. Achievement unlocked: Professional Scroller.',
  "I guard the footer. Nobody gets past me. Except the 'View source' link.",
  "This is the end of the page. I checked. Twice.",
  'Fun fact: I walk this line all day. It’s a short line, but it’s mine.',
  'Psst… the contact form is just above. Ali reads every message.',
  'Back to top is that way ↑. I’ll stay here and hold the fort.',
  '404: more page not found. You’ve seen it all!',
  'My other job is in the hero section. This one has a better view.',
]

const STEP_MS = 260 // one servo step: it moves for the first part, then stops (same as robot-step)
const MOVE_SHARE = 0.55
const SPEED = 34 // px per second, on average
const TALK_MS = 3500 // the bubble closes by itself after this long
const DURATIONS: Record<Mode, [number, number]> = {
  idle: [900, 2200],
  walk: [0, 0], // until it reaches its target
  turn: [200, 200],
  scan: [1100, 1100],
  wave: [1000, 1000],
  hop: [520, 520],
  dance: [0, 0], // while the mouse is on it
}

const between = ([min, max]: [number, number]) => min + Math.random() * (max - min)

function FooterRobot() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [line, setLine] = useState<string | null>(null)
  const [side, setSide] = useState<'left' | 'right'>('left')
  const talkRef = useRef<() => void>(() => {})

  useEffect(() => {
    const root = rootRef.current
    const track = root?.parentElement
    if (!root || !track) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let x = 0
    let dir = 1
    let target = 0
    let mode: Mode = 'idle'
    let until = 0
    let hovered = false
    let frame = 0
    let last = 0
    let visible = false
    let lastLine = ''
    let talkTimer = 0
    let talking = false

    const size = () => root.offsetWidth
    const room = () => Math.max(0, track.clientWidth - size())

    function set(next: Mode, now: number) {
      mode = next
      until = now + between(DURATIONS[next])
      root!.dataset.robot = next
    }

    function place() {
      root!.style.transform = `translateX(${Math.round(x)}px)`
      root!.style.setProperty('--robot-dir', String(dir))
    }

    // What it does next, once it's done with the current move.
    function decide(now: number) {
      const roll = Math.random()
      if (roll < 0.5) {
        // Walk somewhere along the line (mostly far, so it really patrols).
        target = Math.random() * room()
        const newDir = target >= x ? 1 : -1
        if (newDir !== dir) {
          dir = newDir
          place()
          return set('turn', now)
        }
        return set('walk', now)
      }
      if (roll < 0.68) return set('scan', now)
      if (roll < 0.8) return set('hop', now)
      if (roll < 0.88) return set('wave', now)
      set('idle', now)
    }

    function tick(now: number) {
      const dt = Math.min(now - last, 100)
      last = now
      if (hovered) {
        if (mode !== 'dance') set('dance', now)
      } else if (mode === 'dance') {
        set('idle', now)
      } else if (mode === 'walk') {
        // Servo steps: it moves in the first part of each step, then stops.
        const moving = now % STEP_MS < STEP_MS * MOVE_SHARE
        if (moving) x += (dir * SPEED * dt) / 1000 / MOVE_SHARE
        if ((dir > 0 && x >= target) || (dir < 0 && x <= target)) {
          x = Math.max(0, Math.min(target, room()))
          set('idle', now)
        }
        place()
      } else if (mode === 'turn' && now >= until) {
        set('walk', now)
      } else if (now >= until && !talking) {
        decide(now)
      }
      frame = requestAnimationFrame(tick)
    }

    function start() {
      if (frame || reduceMotion) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
    function stop() {
      cancelAnimationFrame(frame)
      frame = 0
    }

    // Start at the right end of the line, facing left (towards the text).
    x = room()
    dir = -1
    place()
    root.dataset.robot = 'idle'

    // Scrolled down to the footer: it waves hello.
    const io = new IntersectionObserver(([entry]) => {
      const was = visible
      visible = entry.isIntersecting
      if (visible) {
        start()
        if (!was && !reduceMotion && !hovered) set('wave', performance.now())
      } else {
        stop()
      }
    })
    io.observe(track)

    // The line got wider or narrower (screen resized): stay on it.
    const ro = new ResizeObserver(() => {
      x = Math.min(x, room())
      target = Math.min(target, room())
      place()
    })
    ro.observe(track)

    function onEnter(event: PointerEvent) {
      if (event.pointerType === 'mouse' && !reduceMotion) hovered = true
    }
    function onLeave() {
      hovered = false
    }
    root.addEventListener('pointerenter', onEnter)
    root.addEventListener('pointerleave', onLeave)

    // Talks: a joke it didn't just say. It stops walking while it talks.
    talkRef.current = () => {
      const fresh = LINES.filter((l) => l !== lastLine)
      lastLine = fresh[Math.floor(Math.random() * fresh.length)]
      setSide(x > room() / 2 ? 'right' : 'left')
      setLine(lastLine)
      if (mode === 'walk' || mode === 'turn') set('idle', performance.now())
      if (!reduceMotion && !hovered) set('hop', performance.now())
      talking = true
      window.clearTimeout(talkTimer)
      talkTimer = window.setTimeout(() => {
        talking = false
        setLine(null)
      }, TALK_MS)
    }

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      root.removeEventListener('pointerenter', onEnter)
      root.removeEventListener('pointerleave', onLeave)
      window.clearTimeout(talkTimer)
    }
  }, [])

  return (
    <div ref={rootRef} className="robot footer-robot">
      {line && (
        <div className="robot__bubble" data-side={side}>
          <p role="status">{line}</p>
        </div>
      )}
      <button
        type="button"
        className="robot__hit"
        aria-label="Tiny footer robot. Click to hear what it says."
        onClick={() => talkRef.current()}
      >
        <span className="robot__flip">
          <RobotSprite className="robot__sprite" />
        </span>
      </button>
    </div>
  )
}

export default FooterRobot
