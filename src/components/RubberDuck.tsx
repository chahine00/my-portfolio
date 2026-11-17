// A little rubber duck that lives on the page, like the old desktop pets.
// ("Rubber duck debugging": explaining your code to a duck until you spot the bug yourself.)
//
// It isn't on the page at first. It lives on the "<Welcome />" box of the welcome drawing behind
// the profile photo (Hero.tsx): it pops up there once the box has typed its word, and walks a
// little along it. Each next step waits for the visitor (see duckStore.ts):
// Hovered or clicked on the box: it pops out of there (this component), hops onto your name, and
// then EXPLORES the whole website, with a small "brain" that picks what to do next from what's
// around it:
// - it explores: waddles, hops onto cards and section titles, walks along their top edge,
//   and at the end of one it may hop to the next, step off and fall, or turn back
// - it's curious: it watches your mouse, walks over to it, and hops onto the card you're hovering
// - it gets startled: a fast mouse rush or a tap right next to it makes it jump ("!") and run off
// - it gets tired: the more it does, the sooner it naps; if you leave the page alone it falls
//   asleep, and wakes up happy when you're back
// - it flies: long trips across the screen are flights (wings flapping, a wavy path), not hops
// - it watches the page: when cards and titles scroll into view, it notices ("!") and flies over
//   to check them out; when its own card scrolls away, it takes off to another one on screen
//   (or falls, now and then), instead of always dropping to the bottom
// - it reacts to scrolling: it holds on (flapping) while its card moves fast, and lands with a
//   little squash
// - it fidgets: looks around, pecks, flaps
// It only talks when clicked (never on its own). You can drag it anywhere (it falls when you let go).
// The little "×" next to it (on hover, or after a tap) sends it home to the welcome box: back to
// the start, waiting there until hovered or clicked. The footer link also brings it back out.
// (There's also a CALM mode, kept for later: it then stays in the hero, walking along your name,
// the code line, the location line and the buttons, until hovered or clicked. See duckStore.ts.)
//
// Everything runs in one requestAnimationFrame loop that moves the duck with a transform, so React
// doesn't re-draw while it moves. Only the speech bubble uses React state.
// Visitors who turned off animations get a duck that just sits in the corner (and still talks).

import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import DuckSprite from './DuckSprite.tsx'
import { duckOrigin, isDuckExploring, sendDuckHome, setDuckExploring, useDuckHome } from './duckStore.ts'

type Mode =
  | 'walk' // walking (data-run: faster)
  | 'idle' // standing, looking around now and then
  | 'peck' // pecking at the ground
  | 'flap' // flapping its wings (also: holding on during a fast scroll)
  | 'sleep'
  | 'crouch' // getting ready to jump
  | 'jump'
  | 'fly' // a longer trip through the air, wings flapping
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
const WALK_SPEED = 55 // px per second
const RUN_SPEED = 160
const FLY_SPEED = 650 // px per second, roughly, for flights across the screen
const FLY_AFTER = 260 // px: trips longer than this are flights, shorter ones are hops
const SLEEPY_AFTER = 30 // seconds with no mouse, scroll or touch before it dozes off
const CALM_GROUND_WIDTH = 160 // calm and not on your name: it stays this close to the bottom-left corner

interface Jump {
  fromX: number
  fromY: number
  target: Element | null // null = jumping down to the bottom of the screen
  offset: number // where on the target it lands, from its left edge (or the screen x for the bottom)
  t: number
  duration: number
  fly: boolean // a flight (wavy, higher, wings flapping) instead of a hop
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

// Only on the page once it's been let out of the welcome box. Each time it comes out, a fresh duck
// starts from where it sat on the box.
function RubberDuck() {
  const home = useDuckHome()
  return home ? null : <Duck />
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
      if (!state.perch || ['jump', 'fly', 'fall', 'drag'].includes(state.mode)) return 1
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

    // Cards and titles that just came into view (scrolling, or the page changing): the duck notices
    // them. Each one is remembered with the moment it appeared; leaving the screen forgets it.
    const appeared = new Map<Element, number>()
    const mountedAt = now()
    const viewWatcher = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Ignore what was already on screen when the duck came out: that's not "new".
          if (entry.isIntersecting && now() - mountedAt > 1) appeared.set(entry.target, now())
          else if (!entry.isIntersecting) appeared.delete(entry.target)
        }
      },
      // "In view" = inside the middle 80% of the screen's height.
      { rootMargin: '-10% 0px -10% 0px' },
    )
    const watched = new WeakSet<Element>()
    function watchPerches() {
      for (const el of document.querySelectorAll(PERCHES)) {
        if (watched.has(el)) continue
        watched.add(el)
        viewWatcher.observe(el)
      }
    }

    // Anywhere on screen it could fly to (no distance limit), preferring what just appeared,
    // what's close, and what it hasn't visited lately. `freshOnly`: only things that just appeared.
    function visiblePerch(freshOnly = false) {
      const s = size()
      const t = now()
      const options: [Element, number][] = []
      for (const el of document.querySelectorAll(PERCHES)) {
        if (el === state.perch || el === state.leftFrom) continue
        const seenAt = appeared.get(el)
        const fresh = seenAt !== undefined && t - seenAt < 4
        if (freshOnly && !fresh) continue
        const rect = edge(el)
        if (!rect || !standable(rect)) continue
        const distance = Math.hypot(rect.left + rect.width / 2 - (state.x + s / 2), rect.top - (state.y + s))
        let score = 1 / (1 + distance / 400)
        if (fresh) score *= 3
        if (state.recent.includes(el)) score *= 0.3
        options.push([el, score])
      }
      return options.length ? weighted(options) : null
    }

    // Its perch is gone (scrolled away): take off to another spot on screen, or fall now and then.
    function perchLost() {
      state.leftFrom = state.perch
      state.perch = null
      const next = Math.random() < 0.8 ? visiblePerch() : null
      if (next) {
        mark('!')
        startJump(next, undefined, true)
      } else startFall()
    }

    // ---- Actions ---------------------------------------------------------------------------

    // A hop, or a flight when it's far (or `fly` asks for one).
    function startJump(target: Element | null, landX?: number, fly = false) {
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
      const flight = fly || distance > FLY_AFTER
      const duration = flight
        ? Math.min(1.8, Math.max(0.6, 0.35 + distance / FLY_SPEED))
        : Math.min(0.6, 0.3 + distance / 1800)
      state.jump = { fromX: state.x, fromY: state.y, target, offset, t: 0, duration, fly: flight }
      state.dir = toX >= state.x ? 1 : -1
      state.mode = 'crouch'
      state.timer = flight ? 0.1 : 0.12
      state.energy -= flight ? 0.06 : 0.04
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
      if (['jump', 'fly', 'fall', 'drag', 'crouch', 'emerge'].includes(state.mode) || state.held) return
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
    const hopUrge = () => Math.min(1, Math.max(0.15, (now() - lastJumpAt) / 5))

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

      const newThing = visiblePerch(true)
      type Choice =
        | 'wander' | 'rest' | 'peck' | 'flap' | 'explore' | 'fly-far' | 'visit-new'
        | 'follow' | 'visit-hovered' | 'hop-down' | 'nap'
      const choice = weighted<Choice>([
        // Something just scrolled into view: it wants to go and see.
        ['visit-new', newThing ? 4 : 0],
        // Now and then a long flight to somewhere else on the screen.
        ['fly-far', 1.1 * hopUrge()],
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
        case 'visit-new':
          if (Math.random() < 0.6) mark('!')
          startJump(newThing!)
          break
        case 'fly-far': {
          const target = visiblePerch()
          if (target) startJump(target, undefined, true)
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
          if (state.timer <= 0) state.mode = state.jump?.fly ? 'fly' : 'jump'
          // Stay on its spot while crouching (the spot may be scrolling).
          if (state.perch) {
            const ground = surface()
            if (ground) {
              state.x = (edge(state.perch)?.left ?? state.x - state.offset) + state.offset
              state.y = ground.y
            }
          }
          if (state.jump && (state.mode === 'jump' || state.mode === 'fly')) {
            state.jump.fromX = state.x
            state.jump.fromY = state.y
          }
          break

        case 'jump':
        case 'fly': {
          const jump = state.jump!
          let toX: number
          let toY: number
          if (jump.target) {
            const rect = edge(jump.target)
            // The target scrolled away mid-air: exploring, it turns toward another spot on screen
            // (from where it is now); otherwise it falls.
            if (!rect || !standable(rect)) {
              const next = state.explore ? visiblePerch() : null
              const nextRect = next ? edge(next) : null
              if (!next || !nextRect) {
                startFall()
                break
              }
              Object.assign(jump, {
                fromX: state.x,
                fromY: state.y,
                target: next,
                offset: random(0, Math.max(0, nextRect.width - s)),
                t: 0,
                duration: Math.min(1.4, Math.max(0.5, 0.3 + Math.hypot(nextRect.left - state.x, nextRect.top - state.y) / FLY_SPEED)),
                fly: true,
              })
              state.mode = 'fly'
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
          // A curve whose middle point sits above the higher end: a small arc for a hop, a big
          // one for a flight, which also bobs up and down a little as the wings beat.
          const distance = Math.hypot(toX - jump.fromX, toY - jump.fromY)
          const lift = jump.fly ? 40 + Math.min(140, distance * 0.18) : 55
          const peak = Math.min(jump.fromY, toY) - lift
          const ease = jump.fly ? p * p * (3 - 2 * p) : p // flights speed up, then slow down to land
          state.x = jump.fromX + (toX - jump.fromX) * ease
          state.y = (1 - p) * (1 - p) * jump.fromY + 2 * (1 - p) * p * peak + p * p * toY
          if (jump.fly) state.y += Math.sin(p * Math.PI * 4) * 5 * (1 - p)
          state.dir = toX >= state.x ? 1 : -1
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
            if (state.explore) perchLost()
            else startFall()
            break
          }

          // Exploring and something just scrolled into view: it notices right away (not only
          // when its current action ends), about half a second later on average, a bit later
          // when it has only just landed from a hop (hopUrge), so it doesn't look hyperactive.
          if (state.explore && !state.held && ['idle', 'walk', 'peck'].includes(state.mode) && Math.random() < dt * 2 * hopUrge()) {
            const newThing = visiblePerch(true)
            if (newThing) {
              if (Math.random() < 0.6) mark('!')
              startJump(newThing)
              break
            }
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

    watchPerches()
    // New cards appear when the page changes (another page, a filter…): look for them now and then.
    const watchTimer = window.setInterval(watchPerches, 2000)

    apply()
    frame = requestAnimationFrame(tick)
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('pointermove', handleMouseMove, { passive: true })
    window.addEventListener('pointerdown', handlePointerDownAnywhere, { passive: true })
    window.addEventListener('scroll', noteInput, { passive: true })
    window.addEventListener('keydown', noteInput)
    return () => {
      cancelAnimationFrame(frame)
      window.clearInterval(watchTimer)
      viewWatcher.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('pointermove', handleMouseMove)
      window.removeEventListener('pointerdown', handlePointerDownAnywhere)
      window.removeEventListener('scroll', noteInput)
      window.removeEventListener('keydown', noteInput)
      window.clearTimeout(bubbleTimer.current)
    }
    // say() and mark() only use refs and a state setter, so the loop can keep using the first ones.
  }, [])

  // A calm duck (in the hero) that's hovered or clicked starts exploring the whole website.
  // Returns false when it was already exploring.
  function startExploring() {
    const state = stateRef.current
    if (!state || state.explore) return false
    state.explore = true
    setDuckExploring()
    mark('♪', 1200)
    say("Quack! Let's explore. 🦆")
    return true
  }

  // Clicked: it stops, and says something (about its section, sometimes).
  // A calm duck starts exploring instead.
  function speak() {
    const state = stateRef.current
    if (!state) return
    listenRef.current()
    if (startExploring()) return
    const section = state.perch?.closest('section[id]')?.id
    const sectionLine = section ? SECTION_LINES[section] : undefined
    say(sectionLine && Math.random() < 0.5 ? sectionLine : pick(LINES))
  }

  // The "×": it waves and shrinks away, back home to the welcome box.
  function sendHome() {
    window.clearTimeout(bubbleTimer.current)
    setBubble(null)
    mark('👋', 600)
    setLeaving(true)
    sendDuckHome(550) // gone once the goodbye animation is over
  }

  // False until the mouse has left the duck once (see onPointerEnter below).
  const hoverCounts = useRef(false)

  // A mouse on the duck: it stops walking, so the "×" stays under the cursor.
  function hold(held: boolean) {
    const state = stateRef.current
    if (state) state.held = held
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const state = stateRef.current
    if (!state) return
    // Keep getting the pointer's moves while dragging, even outside the duck. Some browsers refuse
    // this for unusual pointers; the duck then still works, just without capture.
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // ignore
    }
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
      // A mouse on it: it stops walking (so the "×" stays put), and a calm duck starts exploring.
      // It just came out of the box under the mouse, so hovering only counts once the mouse has
      // left it at least once; otherwise it would skip its calm time in the hero.
      onPointerEnter={(event) => {
        if (event.pointerType !== 'mouse') return
        hold(true)
        if (hoverCounts.current) startExploring()
      }}
      onPointerLeave={() => {
        hold(false)
        hoverCounts.current = true
      }}
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
        <DuckSprite className="duck__sprite" />
      </span>
    </div>
  )
}

export default RubberDuck
