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
import { asset } from '../utils/asset.ts'
import { guideTips, type GuideTip } from '../data/guide.ts'
import { edgeOf, findPlacements, fitsOnScreen, type Placement } from './avatarGuidePlacement.ts'

// "in": rising. "talk": typing and showing the bubble. "out": sinking back.
type Phase = 'in' | 'talk' | 'out'

const RISE_MS = 600 // same as the guide-rise animation in global.css
const SINK_MS = 450 // same as the guide-sink animation
const TYPE_MS = 30 // per letter
const READ_MS = 4500 // how long it stays once the sentence is typed…
const READ_PER_LETTER_MS = 55 // …plus this much per letter, so longer sentences stay longer
const DWELL_MS = 300 // how long you stay on a section before it comes out
const COOLDOWN_MS = 500 // the pause after a tip ends by itself (none when a new section takes over)
const AWAY_MS = 1500 // how long its spot can be off screen before it leaves
const LOWEST = 0.75 // the spot's edge must be in the top 75% of the screen (where you're reading)
const PLACES_TTL = 2000 // spots are measured again after this long (images load, cards reveal…)

// The sections whose tip was shown, with the element it hid behind. A section is removed once
// that element has fully left the screen, so its tip can play again when you come back.
const seen = new Map<string, HTMLElement>()

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

  useEffect(() => {
    phaseRef.current = phase
    shownRef.current = shown
  }, [phase, shown])

  // 1. Watch the scroll and pick the section to talk about.
  useEffect(() => {
    // The free spots of each section, measured once in a while (it's the costly part).
    const places = new Map<string, { at: number; width: number; spots: Placement[] }>()
    let candidate: { section: string; since: number } | null = null
    let cooldownUntil = 0
    let frame = 0
    let recheck = 0

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
      for (const [section, anchor] of seen) {
        if (section === shownRef.current?.tip.section) continue
        const rect = anchor.getBoundingClientRect()
        if (rect.bottom < 0 || rect.top > window.innerHeight) seen.delete(section)
      }

      const now = Date.now()
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

        if (candidate?.section !== tip.section) {
          candidate = { section: tip.section, since: now }
          return later(DWELL_MS + 20)
        }
        if (now - candidate.since < DWELL_MS) return later(DWELL_MS - (now - candidate.since) + 20)

        if (shownRef.current) {
          // Still talking about another section: it leaves now, and this one starts right after.
          if (phaseRef.current !== 'out') setPhase('out')
          return
        }
        candidate = null
        seen.set(tip.section, spot.anchor)
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
      if (!frame) frame = requestAnimationFrame(check)
    }

    function onResize() {
      places.clear()
      // Its spot was measured for the old size: let it go, a new one is found after.
      if (shownRef.current && phaseRef.current !== 'out') {
        unreadRef.current = true
        setPhase('out')
      }
      onScroll()
    }

    // A tip is over (step 4). If another section is waiting (it was sent away for it), that one
    // comes out straight away; otherwise wait a little before the next.
    function onDone() {
      cooldownUntil = candidate ? 0 : Date.now() + COOLDOWN_MS
      onScroll()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    window.addEventListener('avatar-guide:done', onDone)
    // A section may already be on screen when the page opens (e.g. a link to /#projects).
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('avatar-guide:done', onDone)
      cancelAnimationFrame(frame)
      window.clearTimeout(recheck)
    }
  }, [])

  // 2. While it's out, keep it on its spot as the page scrolls. The spot comes from the layout
  //    (edgeOf), so it doesn't move when the post under the mouse lifts on hover.
  //    When half of the avatar is off screen (under the navbar, or below the bottom), it's
  //    "away": the reading time waits, and only if it stays away for AWAY_MS does it leave.
  useEffect(() => {
    if (!shown) return
    const { spot } = shown
    let frame = 0
    let awaySince = 0 // 0 while it's on screen
    function follow() {
      const root = rootRef.current
      if (root) {
        const edge = edgeOf(spot)
        const x = edge.x - window.scrollX
        const y = edge.y - window.scrollY
        root.style.setProperty('--x', `${Math.round(x + spot.dx)}px`)
        root.style.setProperty('--y', `${Math.round(y - spot.rise)}px`)
        const middle = y - spot.rise / 2
        const offScreen = middle < navBottom() || middle > window.innerHeight
        const now = Date.now()
        if (offScreen && !awaySince) {
          awaySince = now
          setAway(true)
        } else if (!offScreen && awaySince) {
          awaySince = 0
          setAway(false)
        } else if (awaySince && now - awaySince > AWAY_MS && phaseRef.current !== 'out') {
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

  return (
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
    </div>
  )
}

export default AvatarGuide
