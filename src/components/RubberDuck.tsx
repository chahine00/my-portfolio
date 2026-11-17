// A little rubber duck that lives on the page, like the old desktop pets.
// ("Rubber duck debugging": explaining your code to a duck until you spot the bug yourself.)
//
// It isn't there at first: it appears once the visitor discovers the welcome drawing behind the
// profile photo (hover, touch, or "back to top"). When the "<Welcome />" bubble has typed its word,
// the duck pops out of the bubble and hops onto your name (see releaseDuck in duckStore.ts).
// It starts CALM: it potters about the hero (walks along
// your name, the code line, the location line and the buttons, hops between them, looks around,
// pecks, naps), and rides along out of view when you scroll down.
// On pages without the hero it sits quietly in the bottom-left corner.
// Click it once and it starts EXPLORING (for the rest of the visit), with a small "brain" that
// picks what to do next from what's around it:
// - it explores: waddles, hops onto cards and section titles, walks along their top edge,
//   and at the end of one it may hop to the next, step off and fall, or turn back
// - it's curious: it watches your mouse, walks over to it, and hops onto the card you're hovering
// - it gets startled: a fast mouse rush or a tap right next to it makes it jump ("!") and run off
// - it gets tired: the more it does, the sooner it naps; if you leave the page alone it falls
//   asleep, and wakes up happy when you're back
// - it reacts to scrolling: it holds on (flapping) while its card moves fast, falls when its card
//   scrolls away, and lands with a little squash
// - it fidgets: looks around, pecks, flaps
// It only talks when clicked (never on its own). You can drag it anywhere (it falls when you let go).
// The little "×" next to it (on hover, or after a tap) sends it home: it disappears until the
// visitor brings it back from the footer, or reloads the page (see duckStore.ts).
//
// Everything runs in one requestAnimationFrame loop that moves the duck with a transform, so React
// doesn't re-draw while it moves. Only the speech bubble uses React state.
// Visitors who turned off animations get a duck that just sits in the corner (and still talks).

import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { duckOrigin, isDuckExploring, setDuckExploring, setDuckHome, useDuckHome, useDuckReleased } from './duckStore.ts'

type Mode =
  | 'walk' // walking (data-run: faster)
  | 'idle' // standing, looking around now and then
  | 'peck' // pecking at the ground
  | 'flap' // flapping its wings (also: holding on during a fast scroll)
  | 'sleep'
  | 'crouch' // getting ready to jump
  | 'jump'
  | 'fall'
  | 'land' // a little squash after landing
  | 'drag'
  | 'emerge' // popping out of the welcome bubble

// What the duck can stand on. It walks along the top edge of these.
// Boxes with a visible frame (it walks on their top border) and headings (it walks on top of the letters).
// Anything without a frame or text under the duck is skipped, so it never stands on empty space.
// The hero's parts: your name, the typing code line (the visible part, not its invisible
// size-keeping copy), the location line, and the two buttons.
const HERO_PERCHES = '.hero__name, .hero__code > span:last-child, .hero__meta, .hero-actions .button'
const PERCHES = `.card, .mindset__item, .job, .blog-preview__item, .stack, .stats, .contact-tile, .edu-degree, .section-title h2, ${HERO_PERCHES}`

// Things it says when clicked. Sitting in one of these sections, it may say that section's line instead.
const LINES = [
  "Quack! Explain your bug to me, I'm listening. 🦆",
  'Works on my machine. Quack.',
  "It's not a bug, it's a feature.",
  'Have you tried turning it off and on again?',
  'I reviewed 0 pull requests today. Quack.',
  'Did you check the logs?',
  '99 little bugs in the code… 🐞',
]
const SECTION_LINES: Record<string, string> = {
  about: 'Think bigger. Quack faster.',
  projects: "Click this card, it's a good one. 👀",
  experience: 'Real products, real users. Quack.',
  skills: 'I only speak one language: Quack.',
  education: 'Where it all started. 🎓',
  blog: 'Ali writes about what he learns. Worth a read!',
  contact: 'Go on, say hi to Ali! 👋',
}

const GRAVITY = 2400 // px per second², for falling
const WALK_SPEED = 40 // px per second
const RUN_SPEED = 120
const SLEEPY_AFTER = 30 // seconds with no mouse, scroll or touch before it dozes off
const CALM_GROUND_WIDTH = 160 // calm and not on your name: it stays this close to the bottom-left corner

interface Jump {
  fromX: number
  fromY: number
  target: Element | null // null = jumping down to the bottom of the screen
  offset: number // where on the target it lands, from its left edge (or the screen x for the bottom)
  t: number
  duration: number
}

interface State {
  mode: Mode
  x: number
  y: number
  vx: number // current walking speed (eases toward the goal speed)
  vy: number // falling speed
  dir: 1 | -1
  run: boolean
  timer: number // seconds left in the current action
  walkTo: number | null // walk toward this x, then stop (null = just walk)
  perch: Element | null // what it stands on (null = the bottom of the screen)
  offset: number // where on the perch, from its left edge
  jump: Jump | null
  energy: number // 1 = fresh, 0 = exhausted (then it naps)
  recent: Element[] // perches it visited lately, so it explores new ones
  lookTimer: number // when idle: seconds until it glances the other way
  intro: boolean // true until its first walk along your name, when the page opens
  leftFrom: Element | null // the perch it just stepped or fell off: it can't land straight back on it
  explore: boolean // false = calm (stays on your name), true = explores the whole page
  held: boolean // the mouse is on it: it stops and waits (so the "×" doesn't run away)
}

const random = (min: number, max: number) => min + Math.random() * (max - min)
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]

// Picks one option, more likely the heavier ones. Options with weight 0 are never picked.
function weighted<T>(options: [T, number][]): T {
  const usable = options.filter(([, weight]) => weight > 0)
  const total = usable.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = Math.random() * total
  for (const [option, weight] of usable) {
    roll -= weight
    if (roll <= 0) return option
  }
  return usable[0][0]
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Shown unless the visitor sent it home. Coming back mounts a fresh duck, which drops in again.
function RubberDuck() {
  const home = useDuckHome()
  // Hidden until the visitor discovers the welcome drawing: then it pops out of its bubble.
  const released = useDuckReleased()
  return released && !home ? <Duck /> : null
}

function Duck() {
  const duckRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<HTMLSpanElement>(null)
  const stateRef = useRef<State | null>(null)
  const [bubble, setBubble] = useState<{ text: string; side: 'left' | 'right' } | null>(null)
  const bubbleTimer = useRef<number | undefined>(undefined)
  // True while it waves goodbye, just before it goes home.
  const [leaving, setLeaving] = useState(false)
  // Set inside the effect below; makes the duck stop and listen when clicked.
  const listenRef = useRef<() => void>(() => {})
  // Dragging: where the pointer grabbed the duck, and whether it really moved (a drag) or not (a click).
  const drag = useRef<{ dx: number; dy: number; startX: number; startY: number; moved: boolean } | null>(null)

  // Show a speech bubble for a few seconds. It opens toward the middle of the screen.
  function say(text: string) {
    const state = stateRef.current
    if (!state) return
    setBubble({ text, side: state.x > window.innerWidth / 2 ? 'right' : 'left' })
    window.clearTimeout(bubbleTimer.current)
    bubbleTimer.current = window.setTimeout(() => setBubble(null), 3500)
  }

  // A little "!", "?" or "♪" above its head.
  function mark(symbol: string, ms = 900) {
    const element = markRef.current
    if (!element) return
    element.textContent = symbol
    element.classList.remove('is-on')
    void element.offsetWidth // restarts the pop animation
    element.classList.add('is-on')
    window.setTimeout(() => element.classList.remove('is-on'), ms)
  }

  useEffect(() => {
    const duck = duckRef.current
    if (!duck) return

    const size = () => 40
    // The bottom of the navbar, or the top of the screen when the navbar has scrolled away (phones).
    const navBottom = () => Math.max(0, document.querySelector('.navbar')?.getBoundingClientRect().bottom ?? 0)
    const groundY = () => window.innerHeight - size() - 6
    // The duck keeps clear of the back-to-top button in the bottom-right corner.
    const groundRight = () => window.innerWidth - size() - 72
    const now = () => performance.now() / 1000
    // How far it can hop: most of the screen's height, so it can get up from the bottom onto cards.
    const reach = () => Math.max(420, window.innerHeight * 0.85)

    const state: State = {
      mode: 'fall',
      x: random(16, Math.max(16, window.innerWidth * 0.4)),
      y: -60, // starts above the screen and drops in
      vx: 0,
      vy: 0,
      dir: 1,
      run: false,
      timer: 0,
      walkTo: null,
      perch: null,
      offset: 0,
      jump: null,
      energy: 1,
      recent: [],
      lookTimer: 1,
      intro: false,
      leftFrom: null,
      explore: isDuckExploring(),
      held: false,
    }
    stateRef.current = state

    function apply() {
      if (!duck) return
      duck.style.transform = `translate3d(${state.x.toFixed(1)}px, ${state.y.toFixed(1)}px, 0)`
      duck.dataset.mode = state.mode
      duck.dataset.dir = String(state.dir)
      duck.dataset.run = String(state.mode === 'walk' && state.run)
      // Facing (the CSS mirrors it) and how small it ducks to fit under the text above (see fit()).
      duck.style.setProperty('--duck-dir', String(state.dir))
      duck.style.setProperty('--duck-fit', fit().toFixed(2))
    }

    // Visitors who asked for less motion: the duck just sits in the bottom-left corner.
    if (prefersReducedMotion()) {
      const place = () => {
        Object.assign(state, { mode: 'idle', x: 16, y: groundY() })
        apply()
      }
      place()
      window.addEventListener('resize', place)
      return () => window.removeEventListener('resize', place)
    }

    // ---- What the duck notices -------------------------------------------------------------

    // The mouse: where it is, how fast it moves, and the card it's over.
    const cursor = { x: -999, y: -999, speed: 0, movedAt: -Infinity, hovered: null as Element | null }
    // The last time the visitor did anything (mouse, scroll, touch, keys).
    let lastInput = now()
    let scrollSpeed = 0 // px per second
    let lastScroll = window.scrollY
    let wokeByVisitor = false

    function noteInput() {
      if (state.mode === 'sleep' && now() - lastInput > SLEEPY_AFTER) wokeByVisitor = true
      lastInput = now()
    }

    function handleMouseMove(event: globalThis.PointerEvent) {
      // Mouse moves, and finger moves on a phone, both count.
      if (event.pointerType !== 'mouse' && event.pointerType !== 'touch') return
      const t = now()
      const dt = Math.max(t - cursor.movedAt, 0.008)
      const distance = Math.hypot(event.clientX - cursor.x, event.clientY - cursor.y)
      cursor.speed = dt < 0.2 ? distance / dt : 0
      cursor.x = event.clientX
      cursor.y = event.clientY
      cursor.movedAt = t
      const target = event.target instanceof Element ? event.target.closest(PERCHES) : null
      cursor.hovered = target && !duck?.contains(target) ? target : null
      noteInput()
    }

    // A tap right next to the duck (but not on it) startles it. A tap further away is something
    // to be curious about, like the mouse on a computer.
    function handlePointerDownAnywhere(event: globalThis.PointerEvent) {
      noteInput()
      if (duck?.contains(event.target as Node)) return
      if (event.pointerType !== 'mouse') {
        cursor.x = event.clientX
        cursor.y = event.clientY
        cursor.speed = 0
        cursor.movedAt = now()
        const target = event.target instanceof Element ? event.target.closest(PERCHES) : null
        cursor.hovered = target
      }
      const s = size()
      if (Math.hypot(event.clientX - (state.x + s / 2), event.clientY - (state.y + s / 2)) < 90) startle(event.clientX)
    }

    // ---- Where it can stand ----------------------------------------------------------------

    // The line the duck can walk on, for one perch:
    // - a box with a visible frame (border or background): its top border, minus the rounded corners
    // - anything else: the top of its first line of text, only as wide as the words themselves
    //   (and not under the small label just above a heading, so it never covers that label)
    // null when there's nothing to stand on.
    const frameCache = new WeakMap<Element, boolean>()
    const isClear = (color: string) => color === 'transparent' || /rgba?\(.*[,/]\s*0\)$/.test(color)

    function hasFrame(el: Element) {
      let framed = frameCache.get(el)
      if (framed === undefined) {
        const style = getComputedStyle(el)
        framed =
          (parseFloat(style.borderTopWidth) > 0 && !isClear(style.borderTopColor)) ||
          !isClear(style.backgroundColor) ||
          style.backgroundImage !== 'none' ||
          style.boxShadow !== 'none' // e.g. the outlined "Download CV" button
        frameCache.set(el, framed)
      }
      return framed
    }

    // The first line of text inside an element: where the words are, and the top of the letters.
    function firstLine(el: Element) {
      const range = document.createRange()
      range.selectNodeContents(el)
      const rects = [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0)
      if (!rects.length) return null
      const top = Math.min(...rects.map((rect) => rect.top))
      const line = rects.filter((rect) => rect.top < top + 4)
      const fontSize = parseFloat(getComputedStyle(el).fontSize) || 16
      return {
        left: Math.min(...line.map((rect) => rect.left)),
        right: Math.max(...line.map((rect) => rect.right)),
        top: top + fontSize * 0.2, // the line box starts a little above the capital letters
        bottom: Math.max(...line.map((rect) => rect.bottom)),
      }
    }

    // edge() is asked for many times per frame (every perch, while falling or choosing a hop), so
    // its answers are kept until the next frame.
    const edgeCache = new Map<Element, ReturnType<typeof measureEdge>>()
    function edge(el: Element) {
      if (!edgeCache.has(el)) edgeCache.set(el, measureEdge(el))
      return edgeCache.get(el)!
    }

    // How much free height there is above the duck where it stands now: the gap up to the text
    // (or button) right above it. The lines in the hero are only ~26px apart, less than the duck's
    // 40px, so there it ducks down (shrinks) to fit instead of covering the line above.
    function textRects(el: Element) {
      const range = document.createRange()
      range.selectNodeContents(el)
      return [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0)
    }

    function headroom(el: Element, top: number, from: number, to: number) {
      const s = size()
      const scope = el.closest('section') ?? document.body
      let room = s
      for (const other of scope.querySelectorAll('h1, h2, h3, p, li, .button')) {
        if (other === el || other.contains(el) || el.contains(other)) continue
        const box = other.getBoundingClientRect()
        // Quick skip: nowhere near the space above the duck.
        if (box.bottom < top - s || box.top >= top || box.right <= from || box.left >= to) continue
        const framed = hasFrame(other)
        const fontSize = parseFloat(getComputedStyle(other).fontSize) || 16
        for (const rect of framed ? [box] : textRects(other)) {
          if (rect.right <= from || rect.left >= to) continue
          // Text: the bottom of the letters, a little above the bottom of the line box.
          const bottom = framed ? rect.bottom : rect.bottom - fontSize * 0.2
          if (bottom > top - 1) continue
          room = Math.min(room, top - bottom)
        }
      }
      return room
    }

    // 1 = full size; smaller when standing under text that's close above (never below 0.55).
    function fit() {
      if (!state.perch || ['jump', 'fall', 'drag'].includes(state.mode)) return 1
      const rect = edge(state.perch)
      if (!rect) return 1
      const room = headroom(state.perch, rect.top, state.x + 4, state.x + size() - 4)
      return Math.min(1, Math.max(0.55, room / size()))
    }

    function measureEdge(el: Element) {
      if (!el.isConnected) return null
      let left: number
      let right: number
      let top: number
      if (hasFrame(el)) {
        const rect = el.getBoundingClientRect()
        const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0
        left = rect.left + Math.max(4, radius * 0.6)
        right = rect.right - Math.max(4, radius * 0.6)
        top = rect.top
      } else {
        const line = firstLine(el)
        if (!line) return null
        ;({ left, right, top } = line)
        // Keep clear of a small label right above it (like "PROJECTS" above "Things I've built").
        // (For the name in the hero, that's the "SOFTWARE ENGINEER" label above the whole heading.)
        const label = (el.matches('h1, h2') ? el : el.closest('h1, h2'))?.previousElementSibling
        const labelLine = label ? firstLine(label) : null
        // If that would leave no room (on phones the label sits centered right above the name, about
        // as wide), it stands on the words anyway: better a little over the label than nowhere.
        if (labelLine && labelLine.bottom > top - size() && labelLine.left < right) {
          const clearLeft = Math.max(left, labelLine.right + 8)
          if (right - clearLeft >= size() * 2) left = clearLeft
        }
      }
      return { left, right, top, width: right - left }
    }

    // Where the duck's left side can be on this perch, from `left` to `right`.
    type Edge = NonNullable<ReturnType<typeof edge>>

    function standable(rect: Edge) {
      const s = size()
      return (
        rect.width >= s * 2 &&
        rect.top - s > navBottom() + 4 &&
        rect.top < window.innerHeight - 10 &&
        rect.left >= -1 &&
        rect.right <= window.innerWidth + 1
      )
    }

    // The surface under the duck: the top edge of its perch, or the bottom of the screen.
    function surface() {
      const s = size()
      if (state.perch) {
        const rect = edge(state.perch)
        if (!rect) return null
        // Calm in the hero: it rides along with it, even out of view (under the navbar, or above
        // the screen), instead of falling down onto whatever you're reading.
        const ridesAlong = !state.explore && state.perch.closest('#home') !== null
        if (!standable(rect) && !ridesAlong) return null
        return { left: rect.left, right: rect.right - s, y: rect.top - s + 3 }
      }
      const right = Math.max(8, groundRight())
      return { left: 8, right: state.explore ? right : Math.min(right, 8 + CALM_GROUND_WIDTH), y: groundY() }
    }

    // Perches it could hop to from here, each with a score: closer, new and interesting ones score higher.
    function perchOptions(towards?: 1 | -1) {
      const s = size()
      const result: [Element, number][] = []
      for (const el of document.querySelectorAll(PERCHES)) {
        if (el === state.perch) continue
        const rect = edge(el)
        if (!rect || !standable(rect)) continue
        const dx = rect.left + rect.width / 2 - (state.x + s / 2)
        const dy = rect.top - (state.y + s)
        // Too far for a hop.
        if (Math.abs(dy) > reach() || Math.abs(dx) > 650) continue
        if (towards && Math.sign(dx) !== towards) continue
        let score = 1 / (1 + Math.hypot(dx, dy) / 250)
        if (state.recent.includes(el)) score *= 0.25 // been there lately: explore something else
        if (el === cursor.hovered) score *= 4 // you're looking at it: the duck is curious too
        result.push([el, score])
      }
      return result
    }

    function bestPerch(towards?: 1 | -1) {
      const choices = perchOptions(towards)
      return choices.length ? weighted(choices) : null
    }

    // ---- Actions ---------------------------------------------------------------------------

    function startJump(target: Element | null, landX?: number) {
      const s = size()
      let offset: number
      let toX: number
      let toY: number
      const rect = target ? edge(target) : null
      if (target && rect) {
        // Land near where it's heading, not always in the same spot.
        const preferred = landX !== undefined ? landX - rect.left : random(0, rect.width - s)
        offset = Math.min(Math.max(preferred, 0), rect.width - s)
        toX = rect.left + offset
        toY = rect.top - s
      } else {
        target = null
        offset = Math.min(Math.max(landX ?? state.x, 8), Math.max(8, groundRight()))
        toX = offset
        toY = groundY()
      }
      const distance = Math.hypot(toX - state.x, toY - state.y)
      state.jump = { fromX: state.x, fromY: state.y, target, offset, t: 0, duration: Math.min(0.75, 0.38 + distance / 1500) }
      state.dir = toX >= state.x ? 1 : -1
      state.mode = 'crouch'
      state.timer = 0.14
      state.energy -= 0.04
      lastJumpAt = now()
    }

    function startFall() {
      state.leftFrom = state.perch
      state.perch = null
      state.jump = null
      state.vy = 0
      state.mode = 'fall'
    }

    function walk(options: { to?: number; run?: boolean; seconds?: number } = {}) {
      state.mode = 'walk'
      state.run = options.run ?? false
      state.walkTo = options.to ?? null
      state.timer = options.seconds ?? random(2, 5)
      if (options.to !== undefined) state.dir = options.to >= state.x ? 1 : -1
      else if (Math.random() < 0.4) state.dir = state.dir === 1 ? -1 : 1
    }

    // Something made it jump: hop away from where the scare came from, or run off.
    function startle(fromX: number) {
      if (['jump', 'fall', 'drag', 'crouch', 'emerge'].includes(state.mode) || state.held) return
      mark('!')
      // Calm: just a flinch and a flap, it stays where it is.
      if (!state.explore) {
        Object.assign(state, { mode: 'flap', timer: 0.6, vx: 0 })
        return
      }
      const away = fromX > state.x ? -1 : 1
      const target = bestPerch(away)
      if (target && Math.random() < 0.7) startJump(target)
      else {
        walk({ run: true, seconds: random(1, 1.8) })
        state.dir = away
      }
    }

    // Clicked: it stops and listens (a sleeping duck wakes up with a start).
    listenRef.current = () => {
      if (state.mode === 'sleep') mark('!')
      if (['walk', 'idle', 'sleep', 'peck', 'flap'].includes(state.mode)) Object.assign(state, { mode: 'idle', timer: 3.5, vx: 0 })
    }

    // The brain: what to do next, when the current action ends.
    // Hops right after a hop look restless: the urge to hop again builds back up over ~8 seconds.
    let lastJumpAt = -Infinity
    const hopUrge = () => Math.min(1, Math.max(0.15, (now() - lastJumpAt) / 8))

    // During the first walk along your name it turns around at the ends instead of leaving
    // (on phones the name is short, so it would reach the end in a few seconds).
    let introUntil = 0

    function decide() {
      const t = now()

      // Just landed on your name after the page opened: a nice long walk along it first.
      if (state.intro) {
        state.intro = false
        if (state.perch?.matches('.hero__name')) {
          walk({ seconds: random(6, 9) })
          introUntil = now() + state.timer
          return
        }
      }

      // Just landed: catch its breath for a moment before doing anything else.
      if (state.mode === 'land') {
        Object.assign(state, { mode: 'idle', timer: random(0.8, 2), lookTimer: random(0.4, 1) })
        return
      }

      // The mouse is on it: it waits.
      if (state.held) {
        Object.assign(state, { mode: 'idle', timer: 0.5, vx: 0 })
        return
      }

      // Nobody around for a while: doze off until they come back.
      if (t - lastInput > SLEEPY_AFTER) {
        Object.assign(state, { mode: 'sleep', timer: 4 })
        return
      }
      // Worn out: a nap.
      if (state.energy < 0.15) {
        Object.assign(state, { mode: 'sleep', timer: random(6, 10) })
        return
      }

      if (!state.explore) {
        calmDecide()
        return
      }

      const s = size()
      const mouseActive = t - cursor.movedAt < 2
      const mouseDistance = Math.hypot(cursor.x - (state.x + s / 2), cursor.y - (state.y + s / 2))
      const mouseOnLevel = Math.abs(cursor.y - (state.y + s / 2)) < 120
      const hovered = cursor.hovered

      type Choice = 'wander' | 'rest' | 'peck' | 'flap' | 'explore' | 'follow' | 'visit-hovered' | 'hop-down' | 'nap'
      const choice = weighted<Choice>([
        ['wander', 3],
        ['rest', 2.2],
        ['peck', 1],
        ['flap', 0.6],
        ['explore', 2.4 * hopUrge()],
        // Curious about the mouse when it's around (but not when it's right on top of it).
        ['follow', mouseActive && mouseOnLevel && mouseDistance > 70 && mouseDistance < 450 ? 3 : 0],
        // You're hovering a card: it wants to see what's there.
        ['visit-hovered', mouseActive && hovered && hovered !== state.perch ? 2.5 : 0],
        ['hop-down', state.perch ? 0.5 * hopUrge() : 0],
        ['nap', (1 - state.energy) * 1.2],
      ])

      switch (choice) {
        case 'wander':
          walk()
          break
        case 'rest':
          Object.assign(state, { mode: 'idle', timer: random(1.2, 3.2), lookTimer: random(0.6, 1.4) })
          break
        case 'peck':
          Object.assign(state, { mode: 'peck', timer: random(0.9, 1.6) })
          break
        case 'flap':
          Object.assign(state, { mode: 'flap', timer: random(0.6, 1) })
          break
        case 'explore': {
          const target = bestPerch()
          if (target) startJump(target)
          else walk()
          break
        }
        case 'follow': {
          const ground = surface()
          if (!ground) break
          // Walk over and stop a little short of the mouse.
          const stopAt = cursor.x > state.x ? cursor.x - s - 24 : cursor.x + 24
          walk({ to: Math.min(Math.max(stopAt, ground.left), ground.right), seconds: 6 })
          if (Math.random() < 0.3) mark('?')
          break
        }
        case 'visit-hovered': {
          const rect = edge(hovered!)
          if (rect && standable(rect) && Math.abs(rect.top - state.y) < reach()) startJump(hovered, cursor.x - s / 2)
          else walk()
          break
        }
        case 'hop-down':
          startJump(null, state.x + state.dir * random(20, 80))
          break
        case 'nap':
          Object.assign(state, { mode: 'sleep', timer: random(5, 9) })
          break
      }
    }

    // Calm: it stays in the hero (or in its corner on other pages) and potters about, hopping
    // between your name, the code line, the location line and the buttons.
    // Dropped somewhere else (after a drag), it hops back into the hero when it can.
    function heroPerch(towards?: 1 | -1) {
      const s = size()
      const options: [Element, number][] = []
      for (const el of document.querySelectorAll(HERO_PERCHES)) {
        if (el === state.perch) continue
        const rect = edge(el)
        if (!rect || !standable(rect)) continue
        const dx = rect.left + rect.width / 2 - (state.x + s / 2)
        const dy = rect.top - (state.y + s)
        if (Math.abs(dy) > reach() || (towards && Math.sign(dx) !== towards)) continue
        let score = 1 / (1 + Math.hypot(dx, dy) / 200)
        if (state.recent.includes(el)) score *= 0.3
        if (el.matches('.hero__name')) score *= 1.5 // its favorite spot
        options.push([el, score])
      }
      return options.length ? weighted(options) : null
    }

    function calmDecide() {
      const inHero = state.perch?.closest('#home')
      if (!inHero) {
        const target = heroPerch()
        if (target) {
          startJump(target)
          return
        }
      }
      const next = inHero ? heroPerch() : null
      const choice = weighted<'wander' | 'rest' | 'peck' | 'flap' | 'hop' | 'nap'>([
        ['wander', 2.5],
        ['rest', 3],
        ['peck', 1.2],
        ['flap', 0.4],
        ['hop', next ? 1.6 * hopUrge() : 0],
        ['nap', 0.3 + (1 - state.energy) * 1.5],
      ])
      if (choice === 'wander') walk({ seconds: random(2, 4) })
      else if (choice === 'rest') Object.assign(state, { mode: 'idle', timer: random(1.5, 3.5), lookTimer: random(0.6, 1.4) })
      else if (choice === 'peck') Object.assign(state, { mode: 'peck', timer: random(0.9, 1.6) })
      else if (choice === 'flap') Object.assign(state, { mode: 'flap', timer: random(0.6, 1) })
      else if (choice === 'hop' && next) startJump(next)
      else Object.assign(state, { mode: 'sleep', timer: random(5, 9) })
    }

    // Reached the end of the surface while walking: turn back, hop to the next thing, or step off.
    function atEdge(dir: 1 | -1) {
      if (state.walkTo !== null) {
        state.walkTo = null
        Object.assign(state, { mode: 'idle', timer: random(0.8, 1.6) })
        return
      }
      // On its first walk along your name: it just turns around.
      if (now() < introUntil) {
        state.dir = dir === 1 ? -1 : 1
        return
      }
      // Calm: turn around, or hop to the next part of the hero in that direction (never off it).
      if (!state.explore) {
        const next = state.perch?.closest('#home') ? heroPerch(dir) : null
        if (next && Math.random() < 0.5 * hopUrge()) startJump(next)
        else state.dir = dir === 1 ? -1 : 1
        return
      }
      const next = bestPerch(dir)
      const action = weighted<'turn' | 'hop' | 'step-off'>([
        ['turn', 2],
        ['hop', next ? 2 * hopUrge() : 0],
        ['step-off', state.perch ? 1 : 0],
      ])
      if (action === 'hop' && next) startJump(next)
      else if (action === 'step-off') {
        state.x += dir * (size() / 2 + 6) // its body clears the edge, so it really drops
        startFall()
      } else {
        state.dir = dir === 1 ? -1 : 1
        if (Math.random() < 0.4) Object.assign(state, { mode: 'idle', timer: random(0.5, 1.2) })
      }
    }

    // ---- The loop -------------------------------------------------------------------------

    let frame = 0
    let lastTime = 0

    function tick(time: number) {
      frame = requestAnimationFrame(tick)
      edgeCache.clear() // things may have moved (scrolling, typing): measure again this frame
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0
      lastTime = time
      const s = size()
      const t = now()

      // How fast the page is scrolling (smoothed).
      const scrolled = window.scrollY - lastScroll
      lastScroll = window.scrollY
      if (dt > 0) scrollSpeed += (Math.abs(scrolled) / dt - scrollSpeed) * 0.2

      // Resting gets energy back; doing things uses it.
      if (state.mode === 'sleep') state.energy = Math.min(1, state.energy + dt * 0.08)
      else if (state.mode !== 'idle') state.energy = Math.max(0, state.energy - dt * 0.008)

      // Woken up by a visitor coming back: happy to see them.
      if (wokeByVisitor) {
        wokeByVisitor = false
        if (state.mode === 'sleep') {
          mark('♪', 1200)
          Object.assign(state, { mode: 'flap', timer: 0.8 })
        }
      }

      // A fast mouse rush right at it: startled.
      if (
        t - cursor.movedAt < 0.1 &&
        cursor.speed > 2200 &&
        Math.hypot(cursor.x - (state.x + s / 2), cursor.y - (state.y + s / 2)) < 110 &&
        !drag.current
      ) {
        cursor.speed = 0
        startle(cursor.x)
      }

      switch (state.mode) {
        // Popping out of the welcome bubble; then it hops down onto your name.
        case 'emerge': {
          state.timer -= dt
          if (state.timer > 0) break
          const name = document.querySelector('.hero__name')
          const nameEdge = name ? edge(name) : null
          if (name && nameEdge && standable(nameEdge)) {
            state.intro = true // a long first walk along your name after landing
            startJump(name)
          } else startFall()
          break
        }

        case 'drag':
          break

        case 'crouch':
          state.timer -= dt
          if (state.timer <= 0) state.mode = 'jump'
          // Stay on its spot while crouching (the spot may be scrolling).
          if (state.perch) {
            const ground = surface()
            if (ground) {
              state.x = (edge(state.perch)?.left ?? state.x - state.offset) + state.offset
              state.y = ground.y
            }
          }
          if (state.jump && state.mode === 'jump') {
            state.jump.fromX = state.x
            state.jump.fromY = state.y
          }
          break

        case 'jump': {
          const jump = state.jump!
          let toX: number
          let toY: number
          if (jump.target) {
            const rect = edge(jump.target)
            // The target scrolled away mid-air: fall instead.
            if (!rect || !standable(rect)) {
              startFall()
              break
            }
            toX = rect.left + jump.offset
            toY = rect.top - s + 3
          } else {
            toX = jump.offset
            toY = groundY()
          }
          jump.t += dt
          const p = Math.min(jump.t / jump.duration, 1)
          // A curved hop: a quadratic curve whose middle point sits above the higher end.
          const peak = Math.min(jump.fromY, toY) - 55
          state.x = jump.fromX + (toX - jump.fromX) * p
          state.y = (1 - p) * (1 - p) * jump.fromY + 2 * (1 - p) * p * peak + p * p * toY
          if (p >= 1) {
            state.perch = jump.target
            state.offset = jump.target ? jump.offset : 0
            if (jump.target) state.recent = [jump.target, ...state.recent].slice(0, 4)
            state.jump = null
            Object.assign(state, { mode: 'land', timer: 0.16, vx: 0, leftFrom: null })
          }
          break
        }

        case 'fall': {
          const previousY = state.y
          state.vy += GRAVITY * dt
          state.y += state.vy * dt
          // Land on a perch it falls past (its top edge crossed this frame), or on the bottom of the screen.
          for (const el of document.querySelectorAll(PERCHES)) {
            const rect = edge(el)
            if (!rect || el === state.leftFrom) continue
            const top = rect.top - s + 3
            if (previousY <= top && state.y >= top && state.x >= rect.left - s / 2 && state.x <= rect.right - s / 2 && standable(rect)) {
              state.perch = el
              state.offset = Math.min(Math.max(state.x - rect.left, 0), rect.width - s)
              state.y = top
              Object.assign(state, { mode: 'land', timer: 0.16, vx: 0, leftFrom: null })
              break
            }
          }
          if (state.mode === 'fall' && state.y >= groundY()) {
            state.y = groundY()
            state.x = Math.min(Math.max(state.x, 8), Math.max(8, groundRight()))
            Object.assign(state, { mode: 'land', timer: 0.16, vx: 0, leftFrom: null })
          }
          break
        }

        default: {
          // On a surface: walk / idle / peck / flap / sleep / land. The surface may move (scrolling).
          const ground = surface()
          if (!ground) {
            startFall()
            break
          }

          // Its card is scrolling fast: it holds on, flapping.
          if (state.perch && scrollSpeed > 1400 && state.mode !== 'sleep' && state.mode !== 'land') {
            Object.assign(state, { mode: 'flap', timer: 0.4, vx: 0 })
          }

          // The mouse is on it: it stops and waits.
          if (state.held && state.mode === 'walk') Object.assign(state, { mode: 'idle', timer: 0.5, vx: 0 })

          if (state.mode === 'walk') {
            // Ease into the walking speed instead of starting at full speed.
            let goal = (state.run ? RUN_SPEED : WALK_SPEED) * state.dir
            if (state.walkTo !== null) {
              const left = state.walkTo - state.x
              if (Math.abs(left) < 3) {
                state.walkTo = null
                // Arrived: face the mouse if that's what it walked to.
                if (t - cursor.movedAt < 3) state.dir = cursor.x > state.x + s / 2 ? 1 : -1
                Object.assign(state, { mode: 'idle', timer: random(1, 2.5), vx: 0, lookTimer: 1.5 })
                goal = 0
              } else {
                state.dir = left > 0 ? 1 : -1
                goal = Math.sign(left) * Math.min(WALK_SPEED, Math.abs(left) * 3 + 8)
              }
            }
            state.vx += (goal - state.vx) * Math.min(1, dt * 6)
            if (state.perch) state.offset += state.vx * dt
            else state.x += state.vx * dt
          }

          if (state.perch) state.x = (edge(state.perch)?.left ?? state.x - state.offset) + state.offset

          // The ends of the surface.
          if (state.x < ground.left) {
            state.x = ground.left
            state.vx = 0
            if (state.mode === 'walk') atEdge(-1)
          } else if (state.x > ground.right) {
            state.x = ground.right
            state.vx = 0
            if (state.mode === 'walk') atEdge(1)
          }
          if ((state.mode as Mode) === 'fall') break // stepped off the edge
          if (state.perch) state.offset = state.x - (edge(state.perch)?.left ?? state.x - state.offset)
          state.y = ground.y

          // Standing around: glance the other way now and then, and keep an eye on the mouse.
          if (state.mode === 'idle') {
            state.lookTimer -= dt
            if (state.lookTimer <= 0) {
              state.lookTimer = random(0.8, 2)
              const mouseNear = t - cursor.movedAt < 2 && Math.abs(cursor.x - state.x) < 400
              state.dir = mouseNear ? (cursor.x > state.x + s / 2 ? 1 : -1) : state.dir === 1 ? -1 : 1
            }
          }

          if ((state.mode as Mode) !== 'crouch') {
            state.timer -= dt
            if (state.timer <= 0) decide()
          }
        }
      }
      apply()
    }

    // Pause while the tab is hidden.
    function handleVisibility() {
      cancelAnimationFrame(frame)
      if (!document.hidden) {
        lastTime = 0
        lastScroll = window.scrollY
        frame = requestAnimationFrame(tick)
      }
    }

    // It appears inside the welcome bubble and pops out of it (see the 'emerge' step in tick).
    // Without a bubble (shouldn't happen), it drops in from the top as before.
    const origin = duckOrigin()
    if (origin) {
      Object.assign(state, {
        mode: 'emerge',
        timer: 0.6,
        x: origin.left + origin.width / 2 - size() / 2,
        y: origin.top + origin.height / 2 - size() / 2,
        dir: -1, // facing into the page, toward your name
      })
    } else if (!state.explore) {
      state.x = random(8, 8 + CALM_GROUND_WIDTH - size()) // calm: it drops into its corner
    }

    apply()
    frame = requestAnimationFrame(tick)
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('pointermove', handleMouseMove, { passive: true })
    window.addEventListener('pointerdown', handlePointerDownAnywhere, { passive: true })
    window.addEventListener('scroll', noteInput, { passive: true })
    window.addEventListener('keydown', noteInput)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('pointermove', handleMouseMove)
      window.removeEventListener('pointerdown', handlePointerDownAnywhere)
      window.removeEventListener('scroll', noteInput)
      window.removeEventListener('keydown', noteInput)
      window.clearTimeout(bubbleTimer.current)
    }
    // say() and mark() only use refs and a state setter, so the loop can keep using the first ones.
  }, [])

  // Clicked: it stops, and says something (about its section, sometimes).
  // The first click on a calm duck lets it explore the page, for the rest of this visit.
  function speak() {
    const state = stateRef.current
    if (!state) return
    listenRef.current()
    if (!state.explore) {
      state.explore = true
      setDuckExploring()
      mark('♪', 1200)
      say("Quack! Let's explore. 🦆")
      return
    }
    const section = state.perch?.closest('section[id]')?.id
    const sectionLine = section ? SECTION_LINES[section] : undefined
    say(sectionLine && Math.random() < 0.5 ? sectionLine : pick(LINES))
  }

  // The "×": it waves and shrinks away, until the visitor brings it back (footer) or reloads the page.
  function sendHome() {
    window.clearTimeout(bubbleTimer.current)
    setBubble(null)
    mark('👋', 600)
    setLeaving(true)
    setDuckHome(true, 550) // hidden once the goodbye animation is over
  }

  // A mouse on the duck: it stops walking, so the "×" stays under the cursor.
  function hold(held: boolean) {
    const state = stateRef.current
    if (state) state.held = held
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const state = stateRef.current
    if (!state) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { dx: event.clientX - state.x, dy: event.clientY - state.y, startX: event.clientX, startY: event.clientY, moved: false }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const state = stateRef.current
    const grab = drag.current
    if (!state || !grab) return
    if (!grab.moved && Math.hypot(event.clientX - grab.startX, event.clientY - grab.startY) < 6) return
    if (prefersReducedMotion()) return
    grab.moved = true
    state.mode = 'drag'
    state.perch = null
    state.jump = null
    state.x = event.clientX - grab.dx
    state.y = event.clientY - grab.dy
  }

  function handlePointerUp() {
    const state = stateRef.current
    const grab = drag.current
    drag.current = null
    if (!state || !grab) return
    if (grab.moved) Object.assign(state, { mode: 'fall', vy: 0 }) // let go: it falls and lands
    else speak()
  }

  return (
    <div
      className={leaving ? 'duck duck--leaving' : 'duck'}
      ref={duckRef}
      role="button"
      tabIndex={0}
      aria-label="Rubber duck. Click it to hear what it says."
      // While it talks (after a tap on a phone), the "×" shows too.
      data-talking={bubble ? 'true' : undefined}
      onPointerEnter={(event) => event.pointerType === 'mouse' && hold(true)}
      onPointerLeave={() => hold(false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return // keys on the "×" button
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          speak()
        }
      }}
    >
      {bubble && (
        <p className="duck__bubble" data-side={bubble.side} role="status">
          {bubble.text}
        </p>
      )}
      <span className="duck__mark" ref={markRef} aria-hidden="true" />
      {/* Sends the duck home. Its own pointer-down doesn't reach the duck (no drag, no talking). */}
      <button
        type="button"
        className="duck__home"
        aria-label="Send the duck home"
        title="Send the duck home"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={sendHome}
      >
        ×
      </button>
      <span className="duck__zzz" aria-hidden="true">
        z<small>z</small>
      </span>
      {/* The duck faces right; data-dir="-1" mirrors it to face left. */}
      <span className="duck__flip">
        <svg className="duck__sprite" viewBox="0 0 40 40" aria-hidden="true">
          <ellipse className="duck__shadow" cx="20" cy="38.5" rx="13" ry="1.5" />
          {/* Body, with a raised tail on the left */}
          <path className="duck__body" d="M5 22c-1-4 1-7 3-6 2 1 3 3 5 3h10c6 0 11 3 11 9 0 6-6 9-14 9S6 34 5 22z" />
          {/* Wing */}
          <path className="duck__wing" d="M12 26c3-2 9-2 12 1-2 4-9 5-12-1z" />
          {/* Head (it moves on its own when pecking) */}
          <g className="duck__head">
            <circle className="duck__body" cx="26" cy="13" r="8" />
            <path className="duck__beak" d="M32.5 13.5c3-1.5 6-1 6.5.5s-3 3-6.5 2.5z" />
            <circle className="duck__eye" cx="28.5" cy="11" r="1.4" />
          </g>
        </svg>
      </span>
    </div>
  )
}

export default RubberDuck
