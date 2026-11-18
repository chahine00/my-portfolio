// A second tiny robot, on the footer's last line (the "© … · View source" line). It's the same
// drawing and moves as the hero robot (RobotSprite.tsx, "tiny robot" styles in global.css), but
// much simpler: it patrols that one line of text and never leaves it.
// - it walks in servo steps from one end of the line to the other, turns around, and now and then
//   stops to scan, wave or hop
// - it waves when you scroll down to the footer
// - it dances while the mouse is on it
// - clicked or tapped, it says a footer joke in a speech bubble, which closes by itself
// - its jokes open on hover too (as soon as the mouse is on it), and on phones as soon as a
//   finger touches it, at the same moment it starts dancing
// - once per visit, soon after the footer shows, it invites you to click it (a glow and a few
//   words in a small pill), unless a robot was already clicked (robotMet, until a reload). The pill only shows where it covers no text and
//   stays inside the footer and on screen; no room where it stands → it walks to a spot on the line
//   where there is, and if there's none, it only glows
// - it stops moving while the footer is off screen (saves battery)
// - visitors who turned off animations get a robot standing still at the end of the line
// One requestAnimationFrame loop moves it with a transform; only the speech bubble uses React state.

import { useEffect, useRef, useState } from 'react'
import RobotSprite from './RobotSprite.tsx'
import { rememberRobotMet, robotMet } from './robotStore.ts'

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
const TALK_MS = 3000 // the bubble closes by itself after this long (same as the hero robot)
const DURATIONS: Record<Mode, [number, number]> = {
  idle: [600, 1400],
  walk: [0, 0], // until it reaches its target
  turn: [200, 200],
  scan: [1100, 1100],
  wave: [1000, 1000],
  hop: [520, 520],
  dance: [0, 0], // while the mouse is on it
}

// Inviting you to click it (sayInvite): a little curiosity, never an order, the same with a mouse
// and on phones. It promises "one last thing", so the first thing it says when clicked right
// after is the useful one (PROMISED_LINE).
const INVITE = 'Before you go…'
const PROMISED_LINE = 'Psst… the contact form is just above. Ali reads every message.'
const PROMISE_MS = 10000 // clicked this soon after its invite: it says PROMISED_LINE
const INVITE_GAPS = [1800] // the wait before each invite while the footer is in view: just one
const TOUCH_DANCE_MS = 900 // touch: a finger on it makes it dance this long (same as the hero robot)
const PRESS_CLICK_GUARD_MS = 1500 // touch: the click that ends a press that opened a joke doesn't open another
const INVITE_SHOW_MS = 3200 // how long the words stay (same as robot-invite in global.css)
const GLOW_MS = 1600 // same as robot-glow in global.css

const between = ([min, max]: [number, number]) => min + Math.random() * (max - min)

function FooterRobot() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [line, setLine] = useState<string | null>(null)
  const [side, setSide] = useState<'left' | 'right'>('left')
  const talkRef = useRef<() => void>(() => {})
  const clickRef = useRef<() => void>(() => {})
  const inviteRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const track = root?.parentElement
    if (!root || !track) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const footer = track.closest('footer') ?? track

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
    // Invites (sayInvite).
    let tapped = robotMet() // it (or the hero robot) was clicked: no more invites
    let pressTalkAt = 0
    let danceUntil = 0 // touch: a finger on it makes it dance this long (with a sentence)
    let invites = 0 // how many it showed
    let nextInvite = Infinity // when the next one is due (set when the footer comes into view)
    let inviteUntil = 0 // the words are showing until then (it holds still)
    let wordsAfterWalk = false // it's walking to a spot where the words fit
    let inviteTimer = 0
    let promiseUntil = 0 // clicked before then: it says PROMISED_LINE

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

    // A soft pulsing glow around it: "you can click me". A light, not a box: it hides no text.
    function glow() {
      root!.classList.remove('robot--glow')
      void root!.offsetWidth // restart its animation
      root!.classList.add('robot--glow')
      window.setTimeout(() => root!.classList.remove('robot--glow'), GLOW_MS)
    }

    // What must stay readable, in screen coordinates: each line of text in the footer (only where
    // the letters are), and its links and icons.
    function obstacles() {
      const rects: DOMRect[] = []
      const range = document.createRange()
      const walker = document.createTreeWalker(footer, NodeFilter.SHOW_TEXT)
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.textContent?.trim() || root!.contains(node)) continue
        range.selectNodeContents(node)
        for (const r of range.getClientRects()) if (r.width > 2 && r.height > 2) rects.push(r)
      }
      for (const el of footer.querySelectorAll('a, button, svg, img')) {
        if (root!.contains(el)) continue
        const r = el.getBoundingClientRect()
        if (r.width > 2 && r.height > 2) rects.push(r)
      }
      return rects
    }

    // Where the pill (w × h) can go around the robot standing at `at` on the line: above its head,
    // or beside it (toward the line's middle first). The first place that covers no text, stays
    // inside the footer (so nothing above it is covered) and on screen, as a position inside the
    // robot's box, or null.
    function inviteSpot(at: number, w: number, h: number, list: DOMRect[]) {
      const box = root!.getBoundingClientRect()
      const left = box.left - x + at
      const top = box.top
      const sz = box.width
      const area = footer.getBoundingClientRect()
      const viewWidth = document.documentElement.clientWidth
      const inward = at > room() / 2 ? 'left' : 'right'
      const spots: Record<string, [number, number]> = {
        above: [sz / 2 - w / 2, -h - 6],
        left: [-w - 6, sz * 0.15 - h / 2],
        right: [sz + 6, sz * 0.15 - h / 2],
      }
      for (const name of ['above', inward, inward === 'left' ? 'right' : 'left']) {
        const [dx, dy] = spots[name]
        const l = left + dx
        const t = top + dy
        const rr = l + w
        const b = t + h
        if (l < Math.max(8, area.left) || rr > Math.min(viewWidth - 8, area.right)) continue
        if (t < Math.max(4, area.top) || b > Math.min(window.innerHeight - 4, area.bottom)) continue
        if (list.some((o) => o.left < rr + 3 && o.right > l - 3 && o.top < b + 3 && o.bottom > t - 3)) continue
        return { x: dx, y: dy, name }
      }
      return null
    }

    // Says its invite ("Before you go…") where it covers no text. No room where it stands: it walks to
    // a spot on the line where there is (canMove) and says it there. No room anywhere: it only
    // glows.
    function sayInvite(now: number, canMove: boolean) {
      const el = inviteRef.current
      if (!el || tapped || talking || !visible) return inviteDone(now, false)
      el.textContent = INVITE
      promiseUntil = now + INVITE_SHOW_MS + PROMISE_MS
      el.classList.remove('is-on')
      el.style.left = '0px'
      el.style.top = '0px'
      const w = el.offsetWidth
      const h = el.offsetHeight
      const list = obstacles()
      glow()
      if (!reduceMotion) set(Math.random() < 0.5 ? 'wave' : 'hop', now)
      const spot = w && h ? inviteSpot(x, w, h, list) : null
      if (spot) {
        el.style.left = `${Math.round(spot.x)}px`
        el.style.top = `${Math.round(spot.y)}px`
        el.dataset.place = spot.name
        void el.offsetWidth // restart its animation
        el.classList.add('is-on')
        inviteUntil = now + INVITE_SHOW_MS
        window.clearTimeout(inviteTimer)
        inviteTimer = window.setTimeout(() => el.classList.remove('is-on'), INVITE_SHOW_MS)
        return inviteDone(now, true)
      }
      if (canMove && !reduceMotion && w && h) {
        const ends = [0, room() / 2, room()].sort((a, b) => Math.abs(a - x) - Math.abs(b - x))
        const to = ends.find((at) => Math.abs(at - x) > 2 && inviteSpot(at, w, h, list))
        if (to !== undefined) {
          target = to
          wordsAfterWalk = true
          const newDir = to >= x ? 1 : -1
          if (newDir !== dir) {
            dir = newDir
            place()
          }
          return set('walk', now)
        }
      }
      inviteDone(now, true)
    }

    function inviteDone(now: number, counted: boolean) {
      if (counted) invites += 1
      nextInvite = tapped ? Infinity : now + INVITE_SHOW_MS + (INVITE_GAPS[invites] ?? Infinity)
    }

    function hideInvite() {
      inviteRef.current?.classList.remove('is-on')
      inviteUntil = 0
      wordsAfterWalk = false
    }

    function tick(now: number) {
      const dt = Math.min(now - last, 100)
      last = now
      if (hovered || now < danceUntil) {
        if (mode !== 'dance') set('dance', now)
      } else if (mode === 'dance') {
        set('idle', now)
      } else if (now < inviteUntil) {
        // Its words are showing: it holds still, so they stay where they fit.
      } else if (!talking && !wordsAfterWalk && now >= nextInvite && mode !== 'turn') {
        // On time, even mid-walk: it stops where it is and says it (or walks to a roomier spot).
        nextInvite = Infinity // set again once this invite is over
        set('idle', now)
        sayInvite(now, true)
      } else if (mode === 'walk') {
        // Servo steps: it moves in the first part of each step, then stops.
        const moving = now % STEP_MS < STEP_MS * MOVE_SHARE
        if (moving) x += (dir * SPEED * dt) / 1000 / MOVE_SHARE
        if ((dir > 0 && x >= target) || (dir < 0 && x <= target)) {
          x = Math.max(0, Math.min(target, room()))
          set('idle', now)
          if (wordsAfterWalk) {
            wordsAfterWalk = false
            place()
            sayInvite(now, false)
          }
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
      const now = performance.now()
      if (visible) {
        start()
        if (!was && !reduceMotion && !hovered) set('wave', now)
        // Not clicked yet: invite soon after it comes into view (after its hello wave).
        if (!was && !tapped && invites < INVITE_GAPS.length) {
          nextInvite = now + INVITE_GAPS[invites] + (invites === 0 ? 1000 : 0)
          if (reduceMotion && invites === 0) {
            // No animation loop: one invite, if it fits where it stands.
            window.clearTimeout(inviteTimer)
            inviteTimer = window.setTimeout(() => sayInvite(performance.now(), false), INVITE_GAPS[0])
          }
        }
      } else {
        stop()
        hideInvite()
        if (!tapped) nextInvite = Infinity // set again when it comes back into view
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
      if (event.pointerType !== 'mouse') return
      if (!reduceMotion) hovered = true
      // The mouse on it: it tells a joke right away (once per hover).
      if (!talking) talkRef.current()
    }
    function onLeave(event: PointerEvent) {
      if (event.pointerType !== 'mouse') return
      hovered = false
    }
    // A finger on it: it dances and the joke opens at the same moment, like hovering it with a mouse.
    // A tap on it while it talks says the next sentence (with a dance, like any tap on it).
    function onDown(event: PointerEvent) {
      if (event.pointerType === 'mouse') return
      if (!reduceMotion) danceUntil = performance.now() + TOUCH_DANCE_MS
      pressTalkAt = performance.now()
      talkRef.current()
    }
    root.addEventListener('pointerenter', onEnter)
    root.addEventListener('pointerleave', onLeave)
    root.addEventListener('pointerdown', onDown)

    // Its own click (mouse, keyboard, or the end of a tap).
    clickRef.current = () => {
      if (performance.now() - pressTalkAt < PRESS_CLICK_GUARD_MS) return
      talkRef.current()
    }

    // Talks: a joke it didn't just say. It stops walking while it talks.
    talkRef.current = () => {
      tapped = true
      rememberRobotMet()
      nextInvite = Infinity
      hideInvite()
      const fresh = LINES.filter((l) => l !== lastLine)
      lastLine = performance.now() < promiseUntil ? PROMISED_LINE : fresh[Math.floor(Math.random() * fresh.length)]
      promiseUntil = 0
      setSide(x > room() / 2 ? 'right' : 'left')
      setLine(lastLine)
      if (mode === 'walk' || mode === 'turn') set('idle', performance.now())
      if (!reduceMotion && !hovered) set('hop', performance.now())
      talking = true
      window.clearTimeout(talkTimer)
      // Closes by itself after 3s, even while the mouse is still on it. It doesn't open again
      // until the mouse leaves and comes back.
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
      root.removeEventListener('pointerdown', onDown)
      window.clearTimeout(talkTimer)
      window.clearTimeout(inviteTimer)
    }
  }, [])

  return (
    <div ref={rootRef} className="robot footer-robot">
      {line && (
        <div className="robot__bubble" data-side={side}>
          <p role="status">{line}</p>
        </div>
      )}
      <span ref={inviteRef} className="robot__invite" aria-hidden="true" />
      <button
        type="button"
        className="robot__hit"
        aria-label="Tiny footer robot. Click or hover to hear what it says."
        onClick={() => clickRef.current()}
      >
        <span className="robot__flip">
          <RobotSprite className="robot__sprite" />
        </span>
      </button>
    </div>
  )
}

export default FooterRobot
