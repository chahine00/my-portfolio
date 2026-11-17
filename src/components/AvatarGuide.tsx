// The avatar as a little guide: when you scroll to a home section, it comes out right next to one
// of the section's posts (peeking over its top edge, or standing beside it), says a sentence about
// the section in a speech bubble, then sinks back down.
//
// - What and where: each section's sentence and spot are chosen in src/data/guide.ts.
//   avatarGuidePlacement.ts checks that neither the avatar nor its bubble covers any text or part
//   of a post there, and uses the nearest free spot when it would (on phones, for example).
//   No free spot on screen → it waits until there is one, instead of covering something.
// - The spots come from the page layout, so the mouse never moves it (not even a card lifting
//   on hover); the only thing the mouse does is send it away with a click.
// - When: as soon as a section's spot is on screen and you've stopped on it for a moment
//   (DWELL_MS), so scrolling quickly past a section doesn't make it pop up.
// - One at a time: if you move on to another section while it's talking, it leaves right away
//   and comes out again for the new section, so it always talks about what you're looking at.
// - Each section's tip shows once while you're there; once the spot has left the screen, it can
//   show again when you come back.
// - Scrolling it off screen doesn't send it away at once (on phones you often scroll past, then
//   back up to it): it waits AWAY_MS, with its reading time paused, and stays if you come back.
//   If it did leave before you could read it, it comes out again when you return to that spot.
// - It stays about 9 to 11 seconds (longer for longer sentences); clicking it sends it away.
// - It uses avatar-wave.webp: the avatar waving, cut out from "Friendly Waving Chibi Avatar.png"
//   and cropped to the upper body. It's one picture, so it moves as a whole (rises, tilts, bobs).
//   The animations are in global.css under "avatar guide".

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { asset } from '../utils/asset.ts'
import { guideTips, type GuideTip } from '../data/guide.ts'
import { edgeOf, findPlacements, fitsOnScreen, type Placement } from './avatarGuidePlacement.ts'

// "in": rising. "talk": typing and showing the bubble. "out": sinking back.
type Phase = 'in' | 'talk' | 'out'

const RISE_MS = 450 // same as the guide-rise animation in global.css
const SINK_MS = 450 // same as the guide-sink animation
const TYPE_MS = 30 // per letter
const READ_MS = 4500 // how long it stays once the sentence is typed…
const READ_PER_LETTER_MS = 55 // …plus this much per letter, so longer sentences stay longer
const DWELL_MS = 250 // how long a section stays in view before it comes out (counted while scrolling too)…
const SETTLE_MS = 120 // …and the page must have stopped scrolling this long (fast scrolling up and down doesn't call it)
const REPEAT_MS = 6000 // a section's tip plays again at the earliest this long after it last came out
const COOLDOWN_MS = 500 // the pause after a tip ends by itself (none when a new section takes over)
const AWAY_MS = 2000 // how long its spot can be off screen before it leaves…
const AWAY_AT_TOP_MS = 700 // …or this long when you're back at the top of the page
const TAKEOVER_MS = 400 // once it's scrolled away, another section must stay in view this long to take over
const LOWEST = 0.85 // the spot's edge must be in the top 85% of the screen (where you're reading)
const PLACES_TTL = 2000 // spots are measured again after this long (images load, cards reveal…)

// The sections whose tip was shown, with the element it hid behind and when. A section is removed
// once that element has left the screen and REPEAT_MS has passed, so its tip can play again when
// you come back (but not every time you scroll past it).
const seen = new Map<string, { anchor: HTMLElement; at: number; left: boolean }>()

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// The bottom of the navbar: nothing should come out underneath it. When the navbar isn't on
// screen (on phones it scrolls away with the page), that's the top of the screen.
function navBottom() {
  return Math.max(0, document.querySelector('.navbar')?.getBoundingClientRect().bottom ?? 0)
}

interface Shown {
  tip: GuideTip
  spot: Placement
}

function AvatarGuide() {
  const [shown, setShown] = useState<Shown | null>(null)
  const [phase, setPhase] = useState<Phase>('in')
  const [typed, setTyped] = useState(0)
  // True while its spot is scrolled off screen (the reading time waits).
  const [away, setAway] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  // True when it leaves before it was read (scrolled away, or the screen was resized): then the
  // section isn't counted as shown, and it comes out again there.
  const unreadRef = useRef(false)
  const shownRef = useRef<Shown | null>(null)
  const phaseRef = useRef<Phase>('in')
  const awayRef = useRef(false)

  useEffect(() => {
    phaseRef.current = phase
    shownRef.current = shown
    awayRef.current = away
  }, [phase, shown, away])

  // 1. Watch the scroll and pick the section to talk about.
  useEffect(() => {
    // The free spots of each section, measured once in a while (it's the costly part).
    const places = new Map<string, { at: number; width: number; spots: Placement[] }>()
    let candidate: { section: string; since: number } | null = null
    let cooldownUntil = 0
    let frame = 0
    let recheck = 0
    let scrolledAt = 0

    function spotsFor(tip: GuideTip, section: HTMLElement) {
      const now = Date.now()
      const known = places.get(tip.section)
      if (known && now - known.at < PLACES_TTL && known.width === window.innerWidth) return known.spots
      const spots = findPlacements(section, tip)
      places.set(tip.section, { at: now, width: window.innerWidth, spots })
      return spots
    }

    function later(ms: number) {
      window.clearTimeout(recheck)
      recheck = window.setTimeout(check, ms)
    }

    function check() {
      frame = 0
      // Sections you scrolled away from can show their tip again next time. Not the one that's
      // out right now: it handles being scrolled away itself (see step 2).
      const now = Date.now()
      for (const [section, entry] of seen) {
        if (section === shownRef.current?.tip.section) continue
        const rect = entry.anchor.getBoundingClientRect()
        if (rect.bottom < 0 || rect.top > window.innerHeight) entry.left = true
        if (entry.left && now - entry.at > REPEAT_MS) seen.delete(section)
      }

      if (now < cooldownUntil) return later(cooldownUntil - now + 20)
      const nav = navBottom()

      for (const tip of guideTips) {
        if (seen.has(tip.section)) continue
        const section = document.getElementById(tip.section)
        if (!section) continue
        // Quick test first: is this section around the reading area at all?
        const rect = section.getBoundingClientRect()
        if (rect.top > window.innerHeight * LOWEST || rect.bottom < nav + 100) continue
        const spot = spotsFor(tip, section).find((s) => fitsOnScreen(s, nav, LOWEST))
        if (!spot) continue

        // The section has to stay in view a moment (DWELL_MS), and the page has to rest (SETTLE_MS),
        // so it doesn't pop in and out while you fly by. Both are counted at the same time.
        if (candidate?.section !== tip.section) candidate = { section: tip.section, since: now }
        const wait = Math.max(DWELL_MS - (now - candidate.since), SETTLE_MS - (now - scrolledAt))
        if (wait > 0) return later(wait + 20)

        if (shownRef.current) {
          // Scrolling a bit up or down to another section doesn't send it away: while it's still
          // on screen it keeps talking (the next one comes after it's done). Once it's scrolled
          // away, the new section takes over after TAKEOVER_MS.
          if (!awayRef.current) return later(300)
          const hold = TAKEOVER_MS - (now - candidate.since)
          if (hold > 0) return later(hold + 20)
          // Still talking about another section: it leaves now, and this one starts right after.
          if (phaseRef.current !== 'out') setPhase('out')
          return
        }
        candidate = null
        seen.set(tip.section, { anchor: spot.anchor, at: now, left: false })
        unreadRef.current = false
        setShown({ tip, spot })
        setPhase('in')
        setTyped(0)
        setAway(false)
        return
      }
      candidate = null
    }

    function onScroll() {
      scrolledAt = Date.now()
      if (!frame) frame = requestAnimationFrame(check)
    }

    function recheckSoon() {
      if (!frame) frame = requestAnimationFrame(check)
    }

    function onResize() {
      places.clear()
      // Its spot was measured for the old size: let it go, a new one is found after.
      if (shownRef.current && phaseRef.current !== 'out') {
        unreadRef.current = true
        setPhase('out')
      }
      recheckSoon()
    }

    // A tip is over (step 4). If another section is waiting (it was sent away for it), that one
    // comes out straight away; otherwise wait a little before the next.
    function onDone() {
      cooldownUntil = candidate ? 0 : Date.now() + COOLDOWN_MS
      recheckSoon()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    window.addEventListener('avatar-guide:done', onDone)
    // A section may already be on screen when the page opens (e.g. a link to /#projects).
    recheckSoon()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('avatar-guide:done', onDone)
      cancelAnimationFrame(frame)
      window.clearTimeout(recheck)
    }
  }, [])

  // 2. While it's out, keep it on its spot. It's placed in page coordinates (position: absolute on
  //    <body>), so the browser scrolls it together with the page: no lag, no shaking while
  //    scrolling. This loop only moves it if the layout itself shifts (images load…), and only by
  //    whole pixels. The spot comes from the layout (edgeOf), so it doesn't move when the post
  //    under the mouse lifts on hover.
  //    When almost all of the avatar is off screen (under the navbar, or below the bottom), it's
  //    "away": the reading time waits, and only if it stays away for AWAY_MS does it leave
//    (almost at once, AWAY_AT_TOP_MS, when you're back at the top of the page).
  useEffect(() => {
    if (!shown) return
    const { spot } = shown
    let frame = 0
    let awaySince = 0 // 0 while it's on screen
    let placed: { x: number; y: number } | null = null
    function follow() {
      const root = rootRef.current
      if (root) {
        const edge = edgeOf(spot)
        const x = Math.round(edge.x + spot.dx)
        const y = Math.round(edge.y - spot.rise)
        // Sub-pixel noise from scrolling is ignored, so it never twitches.
        if (!placed || Math.abs(placed.x - x) > 1 || Math.abs(placed.y - y) > 1) {
          placed = { x, y }
          root.style.setProperty('--x', `${x}px`)
          root.style.setProperty('--y', `${y}px`)
        }
        // Away only once it's almost all hidden (less than a quarter of it showing), so a small
        // scroll back up or down doesn't send it away.
        const bottom = edge.y - window.scrollY
        const top = bottom - spot.rise
        const peek = spot.rise * 0.25
        const offScreen = bottom < navBottom() + peek || top > window.innerHeight - peek
        const atTop = window.scrollY < window.innerHeight / 2
        const now = Date.now()
        if (offScreen && !awaySince) {
          awaySince = now
          setAway(true)
        } else if (!offScreen && awaySince) {
          awaySince = 0
          setAway(false)
        } else if (awaySince && now - awaySince > (atTop ? AWAY_AT_TOP_MS : AWAY_MS) && phaseRef.current !== 'out') {
          unreadRef.current = true
          setPhase('out')
        }
      }
      frame = requestAnimationFrame(follow)
    }
    follow()
    return () => cancelAnimationFrame(frame)
  }, [shown])

  // 3. Rise → type the sentence → wait while it's read → sink.
  useEffect(() => {
    if (!shown) return
    const { text } = shown.tip
    let timer = 0
    if (phase === 'in') {
      timer = window.setTimeout(() => setPhase('talk'), reducedMotion() ? 0 : RISE_MS)
    } else if (phase === 'talk' && typed < text.length) {
      // People who turn off animations get the whole sentence at once.
      timer = window.setTimeout(() => setTyped(reducedMotion() ? text.length : typed + 1), TYPE_MS)
    } else if (phase === 'talk' && !away) {
      // Reading time grows with the sentence. It starts over when you come back to it.
      timer = window.setTimeout(() => setPhase('out'), READ_MS + text.length * READ_PER_LETTER_MS)
    } else if (phase === 'out') {
      // 4. Gone: free the spot for the next section. Not read? Let it come out there again.
      timer = window.setTimeout(
        () => {
          if (unreadRef.current) seen.delete(shown.tip.section)
          setShown(null)
          window.dispatchEvent(new Event('avatar-guide:done'))
        },
        reducedMotion() ? 150 : SINK_MS,
      )
    }
    return () => window.clearTimeout(timer)
  }, [shown, phase, typed, away])

  if (!shown) return null

  const { tip, spot } = shown
  const talking = phase === 'talk'

  return createPortal(
    <div
      ref={rootRef}
      className="avatar-guide"
      data-phase={phase}
      style={{ height: spot.rise }}
    >
      {/* Read out once, in full, by screen readers (the letter-by-letter text is hidden from them). */}
      <span className="sr-only" aria-live="polite">
        {talking ? tip.text : ''}
      </span>

      <div
        className="avatar-guide__bubble"
        data-side={spot.side}
        style={{ maxWidth: spot.bubbleWidth }}
        aria-hidden="true"
      >
        <p>
          {tip.text.slice(0, typed)}
          {/* The rest is there but invisible, so the bubble has its full size from the start. */}
          <span className="avatar-guide__rest">{tip.text.slice(typed)}</span>
        </p>
      </div>

      {/* Only the bottom of this box cuts the picture: that's the edge it rises from. */}
      <div className="avatar-guide__peek">
        <button
          type="button"
          className="avatar-guide__body"
          aria-label="Hide the guide"
          tabIndex={talking ? 0 : -1}
          onClick={() => setPhase('out')}
        >
          <img src={asset('/avatar-wave.webp')} alt="" draggable={false} />
        </button>
      </div>
    </div>,
    document.body,
  )
}

export default AvatarGuide
