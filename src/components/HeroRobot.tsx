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
// - it beeps now and then (a "!", "♪", "01" or "?" above it), turns to face your mouse, and holds
//   still when the mouse comes close, so it's easy to click (it never runs away from it)
// - a click or tap right next to it counts as a click on it
// - left alone for a while, it goes on standby (eyes dim, light off) until the mouse moves again
// Clicking (or tapping) it makes it say something in a speech bubble. The bubble has a labeled
// "Hide" button that beams it back to the welcome box (a "×" there looked like it only
// closed the message). It sits on the bubble's side away from the robot, so a tap meant for the
// robot can't hit it by accident. The bubble closes when the page scrolls; with a mouse, also when
// the pointer leaves the robot and its bubble; on touch screens (no hover), also on any tap (except
// "Hide"), and by itself after 3 seconds. Visitors who turned off animations get a robot that stands still on
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

// What it can stand on: every item of the hero. The role label, your name (on top of the letters),
// the typing code line, the location and availability, the buttons, the social icons (not the photo).
const PERCHES = [
  '.hero__text > .eyebrow',
  '.hero__name',
  '.hero__code',
  '.hero__meta li',
  '.hero-actions .button',
  '.hero-actions .social-links',
].join(', ')
// Lines of text: it stands on the text itself (its first line), not on the whole block.
const TEXT_PERCHES = '.eyebrow, .hero__meta li'

const STEP_MS = 260 // one servo step: it moves for the first part, then stops (same as robot-step in global.css)
const MOVE_SHARE = 0.55
const SPEED = 38 // px per second, on average (slow: easy to catch)
const CALM_NEAR = 90 // a mouse this close: it holds still, so it's easy to click
const BOOT_MS = 700
const TURN_MS = 200
const SCAN_MS = 1100
const LAND_MS = 160
const LEAVE_MS = 550
// Touch screens (and keyboard): the bubble closes by itself after this long.
const READ_MS = 3000
const HOVER_OUT_MS = 350 // mouse: the bubble closes this long after the pointer leaves it and the robot
const SCROLL_CLOSE_PX = 4 // the bubble closes once the page has scrolled this far
const STANDBY_AFTER_MS = 25000 // no mouse movement for this long → standby
const CLOSE_GUARD_MS = 500 // "Hide" ignores taps this long after it appears (no hiding by a double tap)
const NEAR_TAP = 44 // touch: a tap this close to it counts as a tap on it (it's small, and moves)
const SCREEN_MARGIN = 16 // the bubble stays this far inside the screen

const LINES = [
  "Beep boop! I'm Ali's tiny helper bot. Unpaid, obviously.",
  'Scanning… this portfolio is 100% AI. Ali just pressed Enter. 🤖',
  'Try “View my work”: that’s where the good stuff is.',
  '01001000 01101001! (That’s “Hi” in binary. You’re welcome.)',
  'Compiling coffee… ☕ please wait.',
  'Need a developer? My human is open for opportunities. And snacks.',
  'I asked Ali for a raise. He gave me a bigger font size.',
  'It works on my machine. I AM the machine.',
  'Fun fact: I’m held together by 3 divs and a prayer.',
  'Don’t look at the CSS. Seriously. Don’t.',
  'I tried to fix a bug once. Now there are two of me.',
  'Ali writes the code. I take the credit.',
  'My battery is 4%. Hire Ali so I can retire.',
  'Warning: excessive clicking may cause robot dizziness. 😵',
  'I’m not lazy, I’m in power-saving mode.',
  'Ctrl+C, Ctrl+V… sorry, I mean “highly optimized engineering”.',
  'Fun fact: I have zero bugs. I call them “features”.',
  'I jumped on every button here. Quality assurance: done ✅',
  'Error 404: my motivation not found. Click again?',
  'Ali’s code is so clean, I use it as a mirror.',
  'This website was reviewed by a robot. 10/10, very biased.',
  'I run on JavaScript and pure optimism.',
  'Psst… the “Download CV” button is my favorite trampoline.',
  'Stop poking me! …okay, one more time.',
  'Loading a joke… 99%… 99%… 99%…',
  'I’d tell you a UDP joke, but you might not get it.',
  'There are 10 kinds of people: those who get binary, and you.',
  'My therapist says I should stop jumping on people’s names.',
]

// After a few seconds without being clicked, it invites you to (two words at most).
const INVITES = ['Click me!', 'Psst!', 'Hey you!', 'Poke me!', 'Over here!', 'Boop me?', 'Hello?', 'Pick me!']
const TOUCH_INVITES = ['Tap me!', 'Psst!', 'Hey you!', 'Poke me!', 'Over here!', 'Boop me?', 'Hello?', 'Pick me!']
const INVITE_FIRST_MS = 6000 // the first invite, this long after it came out
const INVITE_EVERY_MS = 25000 // again, as long as it was never clicked…
const INVITE_AFTER_TALK_MS = 60000 // …and much less often once it has been
const INVITE_SHOW_MS = 2400 // how long an invite stays (same as robot-invite in global.css)

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
    // Only the name's first line: when the name wraps, standing on the lower line would put it
    // in the gap between the lines, on top of the letters above.
    const letters = el.lastElementChild ?? el
    rect = letters.getClientRects()[0] ?? letters.getBoundingClientRect()
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
  } else if (el.matches(TEXT_PERCHES)) {
    const range = document.createRange()
    range.selectNodeContents(el)
    rect = range.getClientRects()[0] ?? rect
    pad = 6
  } else if (el.matches('.hero__code')) {
    // The longest phrase's invisible copy: the line doesn't change while it types.
    const ghost = el.querySelector('.hero__code-ghost')
    if (ghost) {
      const range = document.createRange()
      range.selectNodeContents(ghost)
      rect = range.getClientRects()[0] ?? rect
    }
    pad = 8
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

const MIN_SIZE = 22 // it shrinks down to this when there's little room above a spot

// The free height above a spot (in the hero's coordinates), up to the nearest line of text or box
// over it in the hero's text column, so the robot can be sized to fit without covering any text.
function roomAbove(span: { left: number; right: number; top: number }, hero: HTMLElement) {
  const text = hero.querySelector('.hero__text')
  if (!text) return Infinity
  const h = hero.getBoundingClientRect()
  const range = document.createRange()
  range.selectNodeContents(text)
  let room = Infinity
  for (const r of range.getClientRects()) {
    if (!r.width || !r.height) continue
    const left = r.left - h.left
    const right = r.right - h.left
    const bottom = r.bottom - h.top
    if (right < span.left - 4 || left > span.right + 4) continue // not over this spot
    if (bottom > span.top + 1) continue // its own line, or something below
    room = Math.min(room, span.top - bottom)
  }
  return room
}

function Robot() {
  const rootRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<HTMLSpanElement>(null)
  const inviteRef = useRef<HTMLSpanElement>(null)
  const brain = useRef<{ talk: () => void; leave: () => void } | null>(null)
  const [line, setLine] = useState<string | null>(null)
  const [side, setSide] = useState<'left' | 'right'>('left')

  // Keep the speech bubble on screen: on a phone a long sentence can be wider than the room on
  // that side, which cut off the text and pushed its button off the screen. It slides back in.
  useLayoutEffect(() => {
    const bubble = rootRef.current?.querySelector<HTMLElement>('.robot__bubble')
    if (!bubble) return
    bubble.style.translate = ''
    const rect = bubble.getBoundingClientRect()
    const viewWidth = document.documentElement.clientWidth
    let shift = 0
    if (rect.left < SCREEN_MARGIN) shift = SCREEN_MARGIN - rect.left
    else if (rect.right > viewWidth - SCREEN_MARGIN) shift = viewWidth - SCREEN_MARGIN - rect.right
    if (shift) bubble.style.translate = `${Math.round(shift)}px 0`
  }, [line, side])

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
      hovered: false, // a mouse is on the robot or its bubble
      talkScrollY: 0, // where the page was scrolled when the bubble opened
      talkedAt: 0, // when it last started talking (the "Hide" button appears then)
      noTalkUntil: 0, // touch: the tap that just closed the bubble mustn't open it again
      talkAfterLanding: false, // tapped while flying: it talks once it has landed
      line: -1,
      order: [] as number[], // the sentences still to say, shuffled (no repeats until all are said)
      clicked: false, // it was clicked at least once: fewer invites
      nextInvite: performance.now() + INVITE_FIRST_MS,
    }
    let frame = 0
    let last = performance.now()
    let talkTimer = 0

    const size = () => parseFloat(getComputedStyle(robot).getPropertyValue('--robot-size')) || 28
    // Its full size (from the CSS). On each spot it may be shrunk to fit the room above (fitTo).
    const fullSize = size()
    function fitTo(perch: HTMLElement) {
      const room = roomAbove(spanOf(perch, heroEl), heroEl) - 2
      const sz = Math.round(clamp(room, Math.min(MIN_SIZE, fullSize), fullSize))
      robot.style.setProperty('--robot-size', `${sz}px`)
    }
    // The spots it can use now: on screen, with room to stand.
    // Every spot with room above for at least its smallest size (MIN_SIZE): on each one it is as
    // big as the room allows (fitTo), up to its full size, so it never covers text. Only spots
    // too cramped even for that are skipped. If none has room, it uses them all, shrunk.
    const perches = () => {
      const all = [...heroEl.querySelectorAll<HTMLElement>(PERCHES)].filter((el) => {
        const span = spanOf(el, heroEl)
        return el.getBoundingClientRect().width > 0 && span.right - span.left >= 12
      })
      const minFit = Math.min(MIN_SIZE, fullSize)
      const roomy = all.filter((el) => roomAbove(spanOf(el, heroEl), heroEl) - 2 >= minFit)
      return roomy.length ? roomy : all
    }
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
      s.jet = { x0: s.x, y0: s.y, x1, y1: span.top, start: performance.now(), duration: clamp(distance * 3.2, 750, 1500), to }
      setDir(x1 >= s.x ? 1 : -1)
      setMode('jet')
    }

    function turn(dir: 1 | -1) {
      setDir(dir)
      setMode('turn', TURN_MS)
    }

    function rest(min = 900, max = 2000) {
      setMode('idle', random(min, max))
    }

    // What to do next, standing on its spot.
    function decide() {
      if (!s.perch) return
      // Your mouse is coming close: it stays put (and faces it), so it's easy to click.
      if (s.pointer && Math.hypot(s.pointer.x - s.x, s.pointer.y - (s.y - size() / 2)) < CALM_NEAR) {
        if (Math.sign(s.pointer.x - s.x) !== s.dir && Math.abs(s.pointer.x - s.x) > 8) turn(s.pointer.x > s.x ? 1 : -1)
        else rest(300, 500)
        return
      }
      const span = spanOf(s.perch, heroEl)
      const roll = Math.random()
      // Your mouse is in the hero, behind it: it turns to look at it, now and then.
      if (s.pointer && roll < 0.3 && Math.abs(s.pointer.x - s.x) > 30 && Math.sign(s.pointer.x - s.x) !== s.dir) {
        turn(s.pointer.x > s.x ? 1 : -1)
        return
      }
      if (roll < 0.35 && span.right - span.left > 40) {
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
      if (roll < 0.47) {
        setMode('scan', SCAN_MS)
        return
      }
      if (roll < 0.55) {
        beep()
        rest(600, 1000)
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
            fitTo(j.to)
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
          // The mouse came close: it stops, so it's easy to click.
          if (s.pointer && Math.hypot(s.pointer.x - s.x, s.pointer.y - (s.y - size() / 2)) < CALM_NEAR) {
            rest(300, 500)
            break
          }
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
          if (done) {
            rest()
            if (s.talkAfterLanding) {
              s.talkAfterLanding = false
              talk()
            }
          }
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
      maybeInvite(now)
      place()
      frame = requestAnimationFrame(tick)
    }

    // Now and then, when nobody has clicked it for a while, it calls you: "Click me!", "Psst!"…
    function maybeInvite(now: number) {
      if (now < s.nextInvite) return
      if (s.talking || !['idle', 'walk', 'scan', 'turn'].includes(s.mode)) return
      const el = inviteRef.current
      if (!el) return
      const touch = window.matchMedia('(hover: none), (any-pointer: coarse)').matches
      el.textContent = pick(touch ? TOUCH_INVITES : INVITES)
      el.classList.remove('is-on')
      void el.offsetWidth // restart its animation
      el.classList.add('is-on')
      s.nextInvite = now + INVITE_SHOW_MS + (s.clicked ? INVITE_AFTER_TALK_MS : INVITE_EVERY_MS)
    }

    function hideInvite() {
      inviteRef.current?.classList.remove('is-on')
    }

    // The next sentence: a shuffled round of all of them, so none repeats until all were said.
    function nextLine() {
      if (!s.order.length) {
        s.order = LINES.map((_, i) => i).sort(() => Math.random() - 0.5)
        if (s.order[0] === s.line && s.order.length > 1) s.order.push(s.order.shift()!)
      }
      s.line = s.order.shift()!
      return LINES[s.line]
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
      fitTo(nameEl)
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
      if (s.mode === 'standby') setMode('scan', 600)
    }

    // A click right next to it (not on it) counts as a click on it. With a finger, a tap
    // that close is a tap that just missed it (it's small and moving): it counts as a tap on it.
    function onPointerDown(event: PointerEvent) {
      s.lastPointer = performance.now()
      const target = event.target instanceof Element ? event.target : null
      if (event.pointerType !== 'mouse') {
        // Touch, bubble open: ANY tap closes it (on the bubble, on the robot, anywhere), except
        // "Hide" itself. A tap on the robot doesn't open it again right away (noTalkUntil):
        // the next tap does, with its next sentence.
        if (s.talking) {
          if (target?.closest('.robot__home')) return
          quiet()
          s.noTalkUntil = performance.now() + 450
          return
        }
        if (target && robot.contains(target)) return // a tap on it: its own click makes it talk
        // A near miss is a tap on it (it's small, and moves).
        const r = heroEl.getBoundingClientRect()
        if (Math.hypot(event.clientX - r.left - s.x, event.clientY - r.top - (s.y - size() / 2)) < NEAR_TAP) talk()
        return
      }
      if (target && robot.contains(target)) return
      const r = heroEl.getBoundingClientRect()
      const distance = Math.hypot(event.clientX - r.left - s.x, event.clientY - r.top - (s.y - size() / 2))
      // Mouse: a click elsewhere closes its bubble too.
      if (s.talking) {
        quiet()
        return
      }
      // A click that just missed it counts as a click on it (it never runs away from the mouse).
      if (distance < NEAR_TAP) talk()
    }

    function talk() {
      if (s.mode === 'leave' || performance.now() < s.noTalkUntil) return
      // Tapped while booting up or flying: it answers once it has landed.
      if (s.mode === 'boot' || s.mode === 'jet') {
        s.talkAfterLanding = true
        return
      }
      s.talking = true
      s.clicked = true
      hideInvite()
      s.nextInvite = performance.now() + INVITE_AFTER_TALK_MS
      s.talkedAt = performance.now()
      s.lastPointer = performance.now()
      // It stops while it talks, so its bubble (and the "Hide" button) stays put.
      if (s.mode === 'walk' || s.mode === 'standby' || s.mode === 'turn') setMode('idle')
      s.thenWalk = false
      setLine(nextLine())
      // The bubble opens toward the middle of the hero.
      setSide(s.x > heroEl.clientWidth / 2 ? 'right' : 'left')
      s.talkScrollY = window.scrollY
      window.clearTimeout(talkTimer)
      // With a mouse on it, the bubble stays until the pointer leaves (see onPointerLeave);
      // otherwise (touch, keyboard) it closes by itself after a while.
      if (!s.hovered) {
        talkTimer = window.setTimeout(quiet, READ_MS)
      }
    }

    // Closes its speech bubble (it goes back to what it was doing a moment later).
    function quiet() {
      window.clearTimeout(talkTimer)
      if (!s.talking) return
      s.talking = false
      setLine(null)
      s.until = performance.now() + 800
    }

    // Mouse only: on the robot or its bubble (they're both inside it), the bubble stays open.
    // Leaving both closes it, after a short pause so moving from the robot up to the bubble
    // (across the small gap between them) doesn't.
    function onPointerEnter(event: PointerEvent) {
      if (event.pointerType !== 'mouse') return
      s.hovered = true
      window.clearTimeout(talkTimer)
    }

    function onPointerLeave(event: PointerEvent) {
      if (event.pointerType !== 'mouse') return
      s.hovered = false
      window.clearTimeout(talkTimer)
      if (s.talking) talkTimer = window.setTimeout(quiet, HOVER_OUT_MS)
    }

    // Scrolling the page closes the bubble (a few pixels of jitter don't).
    function onScroll() {
      if (s.talking && Math.abs(window.scrollY - s.talkScrollY) > SCROLL_CLOSE_PX) quiet()
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    robot.addEventListener('pointerenter', onPointerEnter)
    robot.addEventListener('pointerleave', onPointerLeave)

    brain.current = {
      talk,
      leave() {
        // Just appeared: that tap was meant for the robot (a double tap), not for "Hide".
        if (performance.now() - s.talkedAt < CLOSE_GUARD_MS) return
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
      window.removeEventListener('scroll', onScroll)
      robot.removeEventListener('pointerenter', onPointerEnter)
      robot.removeEventListener('pointerleave', onPointerLeave)
      brain.current = null
    }
  }, [])

  return (
    <div ref={rootRef} className="robot">
      {/* What it says. The bubble closes by itself (scroll, pointer away, tap elsewhere), so it needs
          no "×". Its only button is a clearly labeled one that hides the robot, on the side of the
          bubble away from the robot (so a tap meant for the robot can't land on it). */}
      {line && (
        <div className="robot__bubble" data-side={side}>
          <p role="status">{line}</p>
          <button
            type="button"
            className="robot__home"
            aria-label="Hide the robot (it goes back to the welcome box)"
            onClick={() => brain.current?.leave()}
          >
            Hide
          </button>
        </div>
      )}
      <span ref={markRef} className="robot__mark" aria-hidden="true" />
      {/* "Click me!" and friends: a small call above it, now and then (see maybeInvite). */}
      <span ref={inviteRef} className="robot__invite" aria-hidden="true" />
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
    </div>
  )
}

// Only on the page while it's out of the welcome box.
function HeroRobot() {
  const home = useRobotHome()
  return home ? null : <Robot />
}

export default HeroRobot
