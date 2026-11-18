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
// - It stays as long as you're in its section, and leaves only once the whole section is off
//   screen (or when you click it). Then the next section's guide comes out.
// - Scrolling on inside the same section (a long one like Projects) moves it to a post that's
//   still on screen there, and it carries on with its sentence.
// - Each section's tip shows once while you're there; after you leave, it can show again when
//   you come back.
// - It uses avatar-wave.webp: the avatar waving, cropped to the upper body. It's one picture, so it moves as a whole (rises, tilts, bobs).
//   The animations are in global.css under "avatar guide".

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { asset } from '../utils/asset.ts'
import { guideTips, type GuideTip } from '../data/guide.ts'
import { dockSpot, edgeOf, findPlacements, fitsOnScreen, type Placement } from './avatarGuidePlacement.ts'

// "in": rising. "talk": typing and showing the bubble. "out": sinking back.
type Phase = 'in' | 'talk' | 'out'

const RISE_MS = 450 // same as the guide-rise animation in global.css
const SINK_MS = 450 // same as the guide-sink animation
const TYPE_MS = 30 // per letter
const DWELL_MS = 250 // how long a section stays in view before it comes out (counted while scrolling too)…
const SETTLE_MS = 120 // …and the page must have stopped scrolling this long (fast scrolling up and down doesn't call it)
const REPEAT_MS = 6000 // a section's tip plays again at the earliest this long after it last came out
const LEAVE_MS = 250 // its section must be off screen this long before it leaves (no flicker at the edge)
const SECTION_MARGIN = 60 // a section counts as on screen while more than this much of it shows
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

// True when you're in the middle of this section's content: it fills the screen from near the top
// to near the bottom. Then, if none of its posts has room for the guide, it comes out in the
// screen's corner instead (dockSpot), so scrolling fast past the title doesn't skip it.
function deepIn(section: HTMLElement) {
  const rect = section.getBoundingClientRect()
  return rect.top < window.innerHeight * 0.35 && rect.bottom > window.innerHeight * 0.65
}

// True while some of this section is on screen (below the navbar). The guide stays as long as
// its section is: it leaves only once you've left the whole section. A tip with leaveBelow
// (see guide.ts) leaves sooner on the way up: once the section's top is lower than that share
// of the screen.
function sectionOnScreen(tip: GuideTip) {
  const rect = document.getElementById(tip.section)?.getBoundingClientRect()
  if (!rect) return false
  const lowestTop = tip.leaveBelow ? window.innerHeight * tip.leaveBelow : window.innerHeight - SECTION_MARGIN
  return rect.bottom > navBottom() + SECTION_MARGIN && rect.top < lowestTop
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
  // Where it goes next when it moves to another post in the same section (you scrolled on, but
  // you're still in that section): it sinks, then rises there and carries on with its sentence.
  const moveRef = useRef<Placement | null>(null)

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

      const nav = navBottom()

      // It's out, its post has scrolled away, but you're still in the same section (a long one
      // like Projects): once the page rests, it moves to a post of that section that's on screen.
      const current = shownRef.current
      if (current && awayRef.current && phaseRef.current !== 'out' && !moveRef.current) {
        const section = document.getElementById(current.tip.section)
        if (section && sectionOnScreen(current.tip)) {
          const rest = SETTLE_MS - (now - scrolledAt)
          if (rest > 0) return later(rest + 20)
          places.delete(current.tip.section) // measured afresh: the posts may have moved since
          // No post with room on screen: the screen's corner.
          const spot =
            spotsFor(current.tip, section).find((s) => fitsOnScreen(s, nav, LOWEST)) ??
            (deepIn(section) ? dockSpot(section) : undefined)
          if (spot) {
            moveRef.current = spot
            seen.set(current.tip.section, { anchor: spot.anchor, at: now, left: false })
            setPhase('out')
            return
          }
          return
        }
      }
      // One at a time: while it's out, no other section comes (it leaves once you've left its
      // section, see step 2, and the next one comes right after).
      if (current) return

      for (const tip of guideTips) {
        if (seen.has(tip.section) || !sectionOnScreen(tip)) continue
        const section = document.getElementById(tip.section)
        if (!section) continue
        // Quick test first: is this section around the reading area at all?
        const rect = section.getBoundingClientRect()
        if (rect.top > window.innerHeight * LOWEST || rect.bottom < nav + 100) continue
        // A post with room next to it on screen, or, when you've scrolled into the middle of the
        // section (past its title), the screen's corner.
        const spot =
          spotsFor(tip, section).find((s) => fitsOnScreen(s, nav, LOWEST)) ??
          (deepIn(section) ? dockSpot(section) : undefined)
        if (!spot) continue

        // The section has to stay in view a moment (DWELL_MS), and the page has to rest (SETTLE_MS),
        // so it doesn't pop in and out while you fly by. Both are counted at the same time.
        if (candidate?.section !== tip.section) candidate = { section: tip.section, since: now }
        const wait = Math.max(DWELL_MS - (now - candidate.since), SETTLE_MS - (now - scrolledAt))
        if (wait > 0) return later(wait + 20)

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

    // Phones change the screen's height while you scroll (the address bar slides in and out):
    // that's not a new layout, so only a change of width counts.
    let lastWidth = window.innerWidth
    function onResize() {
      if (window.innerWidth === lastWidth) return recheckSoon()
      lastWidth = window.innerWidth
      places.clear()
      // Its spot was measured for the old size: let it go, a new one is found after.
      if (shownRef.current && phaseRef.current !== 'out') {
        unreadRef.current = true
        setPhase('out')
      }
      recheckSoon()
    }

    // A tip is over (step 4): the next section's can come out straight away.
    function onDone() {
      recheckSoon()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    window.addEventListener('avatar-guide:done', onDone)
    window.addEventListener('avatar-guide:away', recheckSoon)
    // A section may already be on screen when the page opens (e.g. a link to /#projects).
    recheckSoon()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('avatar-guide:done', onDone)
      window.removeEventListener('avatar-guide:away', recheckSoon)
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
  //    "away": step 1 moves it to a post of the section that's on screen. It leaves only when
  //    its whole section is off screen (for LEAVE_MS).
  useEffect(() => {
    if (!shown) return
    const { spot, tip } = shown
    let frame = 0
    let awaySince = 0 // 0 while it's on screen
    let leftSince = 0 // 0 while its section is on screen
    let placed: { x: number; y: number } | null = null
    function follow() {
      const root = rootRef.current
      if (root && spot.dock) {
        // In the screen's corner: fixed there by the CSS, just above the phone's tab bar when it
        // shows. It's never "away"; it only leaves with its section (below).
        const tabbar = document.querySelector('.tabbar--visible')?.getBoundingClientRect()
        const lift = tabbar && tabbar.height ? Math.max(0, window.innerHeight - tabbar.top) : 0
        root.style.setProperty('--dock-bottom', `${Math.round(lift)}px`)
      } else if (root) {
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
        const now = Date.now()
        if (offScreen && !awaySince) {
          awaySince = now
          awayRef.current = true
          setAway(true)
          // Look again now for a post on screen to move to (the scroll that got it here may
          // already have been checked).
          window.dispatchEvent(new Event('avatar-guide:away'))
        } else if (!offScreen && awaySince) {
          awaySince = 0
          setAway(false)
        }
      }
      if (root) {
        // It leaves only once you've left its whole section.
        const now = Date.now()
        if (sectionOnScreen(tip)) leftSince = 0
        else if (!leftSince) leftSince = now
        else if (now - leftSince > LEAVE_MS && phaseRef.current !== 'out') {
          moveRef.current = null
          unreadRef.current = false
          setPhase('out')
        }
      }
      frame = requestAnimationFrame(follow)
    }
    follow()
    return () => cancelAnimationFrame(frame)
  }, [shown])

  // 3. Rise → type the sentence → stay while you're in its section → sink.
  useEffect(() => {
    if (!shown) return
    const { text } = shown.tip
    let timer = 0
    if (phase === 'in') {
      timer = window.setTimeout(() => setPhase('talk'), reducedMotion() ? 0 : RISE_MS)
    } else if (phase === 'talk' && typed < text.length) {
      // People who turn off animations get the whole sentence at once.
      timer = window.setTimeout(() => setTyped(reducedMotion() ? text.length : typed + 1), TYPE_MS)
    } else if (phase === 'out') {
      // 4. Gone: free the spot for the next section. Not read? Let it come out there again.
      timer = window.setTimeout(
        () => {
          // Moving to another post of the same section: it rises there and goes on with the
          // sentence where it was (no new typing from the start).
          const next = moveRef.current
          if (next) {
            moveRef.current = null
            unreadRef.current = false
            setShown({ tip: shown.tip, spot: next })
            setPhase('in')
            setAway(false)
            return
          }
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
      data-dock={spot.dock ? '' : undefined}
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
          {/* A blinking cursor while it types. It takes no space, so the bubble's size doesn't change. */}
          {typed < tip.text.length && <span className="avatar-guide__caret" />}
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
