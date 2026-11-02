// The big welcome section at the top of the page.
// The text comes from src/data/profile.ts.

import { useEffect, useRef, useState } from 'react'
import { profile } from '../../data/profile.ts'
import Icon from '../../components/Icon.tsx'
import SocialLinks from '../../components/SocialLinks.tsx'
import GradientText from '../../components/GradientText.tsx'
import { asset } from '../../utils/asset.ts'
import { BACK_AT_TOP_EVENT } from '../../components/BackToTop.tsx'

// After the "back to top" button brings you up, the drawing plays on its own and stays this long
// (in milliseconds; it takes about 1.6s to draw) before fading out.
const SHOW_AFTER_BACK_TO_TOP_MS = 4000

// Types each phrase from profile.building, waits, deletes it, then moves to the next one.
// Returns the text typed so far.
function useTypingLoop(phrases: string[]) {
  // People who turn off animations just see the first phrase, already written.
  const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [text, setText] = useState(reduceMotion ? phrases[0] : '')

  useEffect(() => {
    if (reduceMotion) return

    let phrase = 0
    let length = 0
    let deleting = false
    let timer: number

    function step() {
      const full = phrases[phrase]
      length += deleting ? -1 : 1
      setText(full.slice(0, length))

      let delay = deleting ? 35 : 75 // deleting is faster than typing
      if (!deleting && length === full.length) {
        deleting = true
        delay = 1800 // pause so the finished phrase can be read
      } else if (deleting && length === 0) {
        deleting = false
        phrase = (phrase + 1) % phrases.length
        delay = 400
      }
      timer = window.setTimeout(step, delay)
    }

    timer = window.setTimeout(step, 600)
    return () => window.clearTimeout(timer)
  }, [phrases, reduceMotion])

  return text
}

// The longest phrase, used to reserve room for the typing line.
const longestPhrase = profile.building.reduce((a, b) => (b.length > a.length ? b : a))

// The bubble's word, typed one character at a time (see ".hero__art-char" in global.css).
// It's monospace and squeezed to an exact width (textLength), so every character is CHAR_W wide
// and the cursor can step along with the typing.
const GREETING = '<Welcome />'
const CHAR_W = 9
const BUBBLE = { x: 302, y: 22, padding: 14, height: 40 }
const TEXT_X = BUBBLE.x + BUBBLE.padding
const BUBBLE_W = BUBBLE.padding * 2 + GREETING.length * CHAR_W + 4 // + room for the cursor

// The code behind you: [indent, length] per line, in SVG units. Lines left of your head and lines
// right of it; anything that runs behind you is hidden by the silhouette mask anyway.
const CODE_LEFT: [number, number][] = [[0, 52], [12, 40], [12, 58], [24, 30], [12, 46], [0, 18], [0, 44], [12, 34]]
// The right ones stay under ~140 units with their token, so they end inside the window (x 480).
const CODE_RIGHT: [number, number][] = [[0, 96], [16, 70], [16, 70], [32, 80], [16, 56], [0, 30], [0, 88], [16, 72], [16, 64]]
// Every few lines a short "token" in the accent color, like syntax highlighting.
const ACCENT_LINES = new Set([1, 4, 7])

// The drawing behind the photo: a code editor window in thin lines (muted text color) with you in
// front of it, and a speech bubble (accent color) that types "<Welcome />". Both colors are CSS
// variables, so it follows the theme. pathLength="1" lets the CSS "draw" every line the same way,
// whatever its real length. The timing of each part lives in global.css (".hero__art").
//
// The drawing stays BEHIND you: a mask cuts your silhouette out of it, made from the cut-out
// photo turned solid black (the filter). The cut-out sits exactly where the photo is on screen,
// which differs on wide screens (4:5 photo) and phones (square photo), so there are two copies
// and the CSS shows one. Without a cut-out photo there is no mask (the white photo hides it anyway).
function PhotoArt({ cutout }: { cutout?: string }) {
  const codeLine = (x: number, y: number, [indent, length]: [number, number], i: number, side: string) => (
    <g key={`${side}${i}`}>
      <path
        className="hero__art-line hero__art-code"
        style={{ animationDelay: `${0.55 + i * 0.07}s` }}
        pathLength={1}
        d={`M${x + indent} ${y} h${length}`}
      />
      {ACCENT_LINES.has(i) && (
        <path
          className="hero__art-line hero__art-token"
          style={{ animationDelay: `${0.65 + i * 0.07}s` }}
          pathLength={1}
          d={`M${x + indent + length + 8} ${y} h${Math.round(length * 0.45)}`}
        />
      )}
    </g>
  )

  return (
    <svg className="hero__art" viewBox="0 0 500 400" aria-hidden="true">
      {cutout && (
        <defs>
          <filter id="hero-art-silhouette">
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
            <feMorphology operator="dilate" radius="2" />
          </filter>
          <mask id="hero-art-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="500" height="400">
            <rect width="500" height="400" fill="#fff" />
            <image className="hero__art-cut--wide" href={cutout} x="22.7" y="21.2" width="378.8" height="378.8" filter="url(#hero-art-silhouette)" />
            <image className="hero__art-cut--phone" href={cutout} x="38.5" y="15.4" width="384.6" height="384.6" filter="url(#hero-art-silhouette)" />
          </mask>
        </defs>
      )}
      {/* The drawing's bottom (y=400) is the photo's bottom edge: the editor window stands on it. */}
      <g mask={cutout ? 'url(#hero-art-mask)' : undefined}>
        {/* The editor window: its outline, the title bar, the three window dots, then the code. */}
        <path className="hero__art-line hero__art-window" pathLength={1} d="M40 399 V82 a12 12 0 0 1 12 -12 H468 a12 12 0 0 1 12 12 V399" />
        <path className="hero__art-line hero__art-titlebar" pathLength={1} d="M40 96 H480" />
        {[56, 70, 84].map((cx, i) => (
          <circle key={cx} className="hero__art-dot" style={{ animationDelay: `${0.45 + i * 0.06}s` }} cx={cx} cy="83" r="3.2" />
        ))}
        {CODE_LEFT.map((line, i) => codeLine(56, 122 + i * 20, line, i, 'l'))}
        {CODE_RIGHT.map((line, i) => codeLine(318, 122 + i * 20, line, i, 'r'))}
      </g>
      {/* The speech bubble, on top of everything (not masked): pops out from its tail, then types the word. */}
      <g className="hero__art-bubble" style={{ transformOrigin: `${BUBBLE.x + 4}px ${BUBBLE.y + BUBBLE.height + 10}px` }}>
        <path
          className="hero__art-bubble-shape"
          d={`M${BUBBLE.x + 10} ${BUBBLE.y} H${BUBBLE.x + BUBBLE_W - 10} a10 10 0 0 1 10 10 V${BUBBLE.y + BUBBLE.height - 10} a10 10 0 0 1 -10 10 H${BUBBLE.x + 22} L${BUBBLE.x + 4} ${BUBBLE.y + BUBBLE.height + 10} L${BUBBLE.x + 8} ${BUBBLE.y + BUBBLE.height} a10 10 0 0 1 -8 -10 V${BUBBLE.y + 10} a10 10 0 0 1 10 -10 Z`}
        />
        <text className="hero__art-text" x={TEXT_X} y={BUBBLE.y + 26} textLength={GREETING.length * CHAR_W} lengthAdjust="spacing">
          {[...GREETING].map((char, i) => (
            <tspan key={i} className="hero__art-char" style={{ animationDelay: `${1.45 + i * 0.07}s` }}>
              {char}
            </tspan>
          ))}
        </text>
        {/* The cursor steps one character right each time one is typed, then blinks. */}
        <rect
          className="hero__art-cursor"
          style={{ '--typed': `${GREETING.length * CHAR_W}px`, '--chars': GREETING.length } as React.CSSProperties}
          x={TEXT_X + 1}
          y={BUBBLE.y + 12}
          width="2"
          height="18"
          rx="1"
        />
      </g>
    </svg>
  )
}

function Hero() {
  const typed = useTypingLoop(profile.building)
  const nameRef = useRef<HTMLSpanElement>(null)
  // The hover drawing behind the photo. "hovered": the pointer is on the photo (drawing shown).
  // "drawing": the drawing is on the page; it stays a moment after you leave, so it can fade out.
  // "run" changes on every hover, which rebuilds the drawing so it starts again from nothing.
  const [hovered, setHovered] = useState(false)
  const [drawing, setDrawing] = useState(false)
  const [run, setRun] = useState(0)
  const hideTimer = useRef<number | undefined>(undefined)
  // True while a mouse is over the hero, so the back-to-top replay doesn't hide the drawing under it.
  const pointerInside = useRef(false)
  const replayTimer = useRef<number | undefined>(undefined)

  function startDrawing() {
    window.clearTimeout(hideTimer.current)
    window.clearTimeout(replayTimer.current)
    setRun((n) => n + 1)
    setHovered(true)
    setDrawing(true)
  }

  function stopDrawing() {
    setHovered(false)
    hideTimer.current = window.setTimeout(() => setDrawing(false), 300) // after the fade-out
  }

  useEffect(() => () => window.clearTimeout(hideTimer.current), [])

  // Arriving at the top via the "back to top" button replays the drawing, then fades it out
  // after a few seconds (unless the mouse is on the hero by then: it then behaves like a hover).
  useEffect(() => {
    function handleBackAtTop() {
      startDrawing()
      replayTimer.current = window.setTimeout(() => {
        if (!pointerInside.current) stopDrawing()
      }, SHOW_AFTER_BACK_TO_TOP_MS)
    }
    window.addEventListener(BACK_AT_TOP_EVENT, handleBackAtTop)
    return () => {
      window.removeEventListener(BACK_AT_TOP_EVENT, handleBackAtTop)
      window.clearTimeout(replayTimer.current)
    }
  }, [])

  // With a mouse, hovering the hero (name, text, photo) plays the drawing; leaving it hides it.
  // Phones and tablets can't hover, so there a finger on the screen (e.g. to scroll down) plays it,
  // and lifting the finger hides it. Touch events are used because they keep coming while the page
  // scrolls (pointer events stop as soon as scrolling starts).
  // (A finger also fires pointer "enter" and "leave", which is why the hover handlers skip touch.)
  useEffect(() => {
    function handleFingerDown(event: TouchEvent) {
      if (event.touches.length === 1) startDrawing() // the first finger only
    }
    function handleFingerUp(event: TouchEvent) {
      if (event.touches.length === 0) stopDrawing() // the last finger lifted
    }
    document.addEventListener('touchstart', handleFingerDown, { passive: true })
    document.addEventListener('touchend', handleFingerUp, { passive: true })
    document.addEventListener('touchcancel', handleFingerUp, { passive: true })
    return () => {
      document.removeEventListener('touchstart', handleFingerDown)
      document.removeEventListener('touchend', handleFingerUp)
      document.removeEventListener('touchcancel', handleFingerUp)
    }
  }, [])

  // Scrolling down runs the same color sweep as hovering: over the first 40% of the screen's
  // height the colored band crosses the name, then comes back the opposite way.
  // The page passes it to the CSS as --sweep (1 = band off one side, 0 = off the other).
  useEffect(() => {
    function handleScroll() {
      const progress = Math.min(window.scrollY / (window.innerHeight * 0.4), 1)
      // First half: 100% → 0% (across). Second half: 0% → 100% (back).
      const sweep = progress < 0.5 ? 1 - progress * 2 : (progress - 0.5) * 2
      nameRef.current?.style.setProperty('--sweep', `${sweep}`)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    // id="home" lets the navbar link "/#home" scroll here.
    // Hovering anywhere in it plays the drawing behind the photo (see PhotoArt; phones: see above).
    <section
      id="home"
      className="section hero"
      onPointerEnter={(event) => {
        if (event.pointerType === 'touch') return
        pointerInside.current = true
        startDrawing()
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'touch') return
        pointerInside.current = false
        stopDrawing()
      }}
    >
      <div className="hero__text">
        <p className="eyebrow">{profile.role}</p>
        {/* Hover the heading, or scroll down: a color sweep runs across the name. */}
        <h1 className="hero__title">
          Hi, I'm{' '}
          <span className="hero__name" ref={nameRef}>
            <GradientText text={profile.name} />
          </span>
        </h1>
        <p className="hero__tagline">{profile.tagline}</p>

        {/* A line of "code" that keeps typing what you build. Screen readers get the full list once instead. */}
        <p className="hero__code" aria-label={`I build ${profile.building.join(', ')}`}>
          {/* An invisible copy of the LONGEST phrase sits in the same spot and sets the line's size,
              so the page (and your photo next to it) doesn't jump when a long phrase wraps. */}
          <span className="hero__code-ghost" aria-hidden="true">
            &gt; ali.build('{longestPhrase}')
          </span>
          <span aria-hidden="true">
            <span className="hero__code-prompt">&gt;</span> ali.build(<span className="hero__code-string">'{typed}</span>
            <span className="hero__code-caret" />
            <span className="hero__code-string">'</span>)
          </span>
        </p>

        <ul className="hero__meta">
          <li>
            <Icon name="pin" size={16} /> {profile.location}
          </li>
          {profile.availability && (
            // Every few seconds the line gives a little shake (see global.css).
            <li className="hero__available">
              <span className="hero__available-dot" /> {profile.availability}
            </li>
          )}
        </ul>

        {/* Buttons and icon links sit side by side in a row. */}
        <div className="hero-actions">
          <a href="#projects" className="button">
            View my work
          </a>
          {/* The PDF lives in /public, so it is served from the site root. */}
          <a href={asset('/Ali_Chahine_CV.pdf')} download="Ali_Chahine_CV.pdf" className="button button-outline">
            Download CV
          </a>
          <SocialLinks />
        </div>
      </div>

      {/* The photo blends into the page: its left edge (its bottom edge on phones) fades into the
          background, and the text overlaps that faded part, so text and photo read as one piece.
          In dark mode the CSS swaps in the cut-out photo (photoDark) and hides the normal one. */}
      {profile.photo && (
        // Behind the photo: a line drawing (see PhotoArt above) that plays while the hero is hovered
        // (or a finger is on a phone's screen): mountains draw themselves, then a flag goes up on the peak.
        // Moving away fades it out; coming back redraws it.
        <div className={`hero__visual${hovered ? ' hero__visual--on' : ''}`}>
          {drawing && <PhotoArt key={run} cutout={profile.photoDark ? asset(profile.photoDark) : undefined} />}
          <div className={`hero__photo${profile.photoDark ? ' hero__photo--dual' : ''}`}>
            <img className="hero__photo-light" src={asset(profile.photo)} alt={profile.name} />
            {profile.photoDark && (
              <img className="hero__photo-dark" src={asset(profile.photoDark)} alt="" aria-hidden="true" />
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default Hero
