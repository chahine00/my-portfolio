// The big welcome section at the top of the page.
// The text comes from src/data/profile.ts.

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { profile } from '../../data/profile.ts'
import Icon from '../../components/Icon.tsx'
import SocialLinks from '../../components/SocialLinks.tsx'
import { asset } from '../../utils/asset.ts'

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

// The flag's ripple: a wave that runs along the cloth, away from the pole. The pole edge stays put
// and the free edge swings the most, like real fabric. Each "frame" is the cloth's outline at one
// moment of the wave; the SVG <animate> tags below blend from frame to frame in a loop.
const FLAG = { left: 330, width: 88, top: 22, bottom: 64 }
// height = how far the free edge moves, length = size of one wave (both in SVG units),
// seconds = how long one wave takes to run along the flag. Gentle and slow, so the word stays easy to read.
const RIPPLE = { height: 3, length: 90, frames: 8, seconds: 2.6 }

// How far the cloth is pushed up or down at x, at a given moment (phase) of the wave.
function rippleAt(x: number, phase: number) {
  const fromPole = (x - FLAG.left) / FLAG.width // 0 at the pole, 1 at the free edge
  return RIPPLE.height * fromPole * Math.sin((2 * Math.PI * (x - FLAG.left)) / RIPPLE.length - phase)
}

// A wavy line across the flag at height y, as "x,y" points from the pole to the free edge.
function ripplePoints(y: number, phase: number) {
  const points: string[] = []
  for (let i = 0; i <= 16; i++) {
    const x = FLAG.left + (FLAG.width * i) / 16
    points.push(`${x.toFixed(1)},${(y + rippleAt(x, phase)).toFixed(1)}`)
  }
  return points
}

// The same thing for every frame, joined the way <animate values="..."> wants it (";" between frames).
// The last frame equals the first, so the loop has no jump.
function rippleFrames(shape: (phase: number) => string) {
  return Array.from({ length: RIPPLE.frames + 1 }, (_, i) => shape((2 * Math.PI * i) / RIPPLE.frames)).join(';')
}

const clothShape = (phase: number) =>
  `M${ripplePoints(FLAG.top, phase).join(' L')} L${ripplePoints(FLAG.bottom, phase).reverse().join(' L')} Z`
const textLine = (y: number) => (phase: number) => `M${ripplePoints(y, phase).join(' L')}`

const clothFrames = rippleFrames(clothShape)
// The word's baseline: a bit below the flag's middle, so the capitals look centered.
const TEXT_Y = 48.5
const textLineFrames = rippleFrames(textLine(TEXT_Y))

// The drawing behind the photo: everything is thin lines in the muted text color, except the
// flag, which is filled with the accent color. Both colors are CSS variables, so it follows the theme.
// pathLength="1" lets the CSS "draw" every line the same way, whatever its real length.
// The timing of each part lives in global.css (".hero__art").
//
// The drawing stays BEHIND you: a mask cuts your silhouette out of it, made from the cut-out
// photo turned solid black (the filter). The cut-out sits exactly where the photo is on screen,
// which differs on wide screens (4:5 photo) and phones (square photo), so there are two copies
// and the CSS shows one. Without a cut-out photo there is no mask (the white photo hides it anyway).
function PhotoArt({ cutout }: { cutout?: string }) {
  // People who turn off animations get a still flag (CSS can't stop <animate> tags, so we skip them).
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // One <animate> that loops a shape through its frames. Starts on the first frame.
  const ripple = (frames: string) =>
    still ? null : <animate attributeName="d" values={frames} dur={`${RIPPLE.seconds}s`} repeatCount="indefinite" />

  return (
    <svg className="hero__art" viewBox="0 0 500 400" aria-hidden="true">
      <defs>
        {/* The word rides on this wavy line, so it ripples with the cloth. */}
        <path id="hero-art-text-line" d={textLine(TEXT_Y)(0)}>
          {ripple(textLineFrames)}
        </path>
        {/* Light and shadow bands on the cloth, rolling outward with the wave, so it looks folded. */}
        <linearGradient
          id="hero-art-folds"
          gradientUnits="userSpaceOnUse"
          x1={FLAG.left}
          x2={FLAG.left + RIPPLE.length}
          y1="0"
          y2="0"
          spreadMethod="repeat"
        >
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="0.25" stopColor="#000" stopOpacity="0.12" />
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="0.75" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
          {!still && (
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              from="0 0"
              to={`${RIPPLE.length} 0`}
              dur={`${RIPPLE.seconds}s`}
              repeatCount="indefinite"
            />
          )}
        </linearGradient>
        {/* The cloth's color: the accent, a little lighter at the pole and deeper at the tip.
            The two colors are set in global.css (".hero__art-shade-*"), so they follow the theme. */}
        <linearGradient
          id="hero-art-cloth-fill"
          gradientUnits="userSpaceOnUse"
          x1={FLAG.left}
          y1={FLAG.top}
          x2={FLAG.left + FLAG.width}
          y2={FLAG.bottom}
        >
          <stop offset="0" className="hero__art-shade-light" />
          <stop offset="1" className="hero__art-shade-deep" />
        </linearGradient>
      </defs>
      {cutout && (
        <defs>
          <filter id="hero-art-silhouette">
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
            <feMorphology operator="dilate" radius="2" />
          </filter>
          <mask id="hero-art-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="500" height="400">
            <rect width="500" height="400" fill="#fff" />
            <image className="hero__art-cut--wide" href={cutout} x="46" y="71" width="329" height="329" filter="url(#hero-art-silhouette)" />
            <image className="hero__art-cut--phone" href={cutout} x="83.3" y="66.7" width="333.3" height="333.3" filter="url(#hero-art-silhouette)" />
          </mask>
        </defs>
      )}
      {/* The drawing's bottom (y=400) is the photo's bottom edge: the ground and the mountains' feet sit there. */}
      <g mask={cutout ? 'url(#hero-art-mask)' : undefined}>
        <path className="hero__art-line hero__art-ground" pathLength={1} d="M0 399 H500" />
        <path className="hero__art-line hero__art-back" pathLength={1} d="M8 399 L50 268 L70 282 L110 160 L150 250" />
        <path
          className="hero__art-line hero__art-main"
          pathLength={1}
          d="M170 399 L240 230 L262 246 L330 78 L388 185 L408 170 L492 399"
        />
        <path className="hero__art-line hero__art-snow" pathLength={1} d="M313 120 L322 111 L331 123 L341 110 L351 118" />
        <path className="hero__art-line hero__art-bird" pathLength={1} d="M425 120 q6 -6 12 0 q6 -6 12 0" />
        <path className="hero__art-line hero__art-bird" pathLength={1} d="M452 98 q5 -5 10 0 q5 -5 10 0" />
        <path className="hero__art-line hero__art-pole" pathLength={1} d="M330 79 V20" />
        {/* A small round cap on top of the pole. */}
        <circle className="hero__art-finial" cx="330" cy="17.5" r="2.6" />
        {/* Two groups: the outer one unrolls the flag from the pole, the inner one swings it
            (the ripple inside the cloth comes from the <animate> tags). */}
        <g className="hero__art-flag">
          <g className="hero__art-wave">
            <path className="hero__art-cloth" d={clothShape(0)}>
              {ripple(clothFrames)}
            </path>
            <path d={clothShape(0)} fill="url(#hero-art-folds)">
              {ripple(clothFrames)}
            </path>
            <text className="hero__art-text">
              <textPath href="#hero-art-text-line" startOffset="50%">
                Welcome
              </textPath>
            </text>
          </g>
        </g>
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

  function startDrawing() {
    window.clearTimeout(hideTimer.current)
    setRun((n) => n + 1)
    setHovered(true)
    setDrawing(true)
  }

  function stopDrawing() {
    setHovered(false)
    hideTimer.current = window.setTimeout(() => setDrawing(false), 300) // after the fade-out
  }

  useEffect(() => () => window.clearTimeout(hideTimer.current), [])

  // Phones and tablets can't hover, so there a tap on the photo plays the drawing, and a second
  // tap (on the photo or anywhere else) hides it. A mouse keeps the hover behavior.
  // (A finger also fires "enter" and "leave" around every tap, which is why those skip touch.)
  const visualRef = useRef<HTMLDivElement>(null)

  function handleTap(event: ReactPointerEvent) {
    if (event.pointerType !== 'touch') return
    if (hovered) stopDrawing()
    else startDrawing()
  }

  // While the drawing shows after a tap, a tap anywhere outside the photo hides it.
  useEffect(() => {
    if (!hovered) return
    function handleTapOutside(event: PointerEvent) {
      if (event.pointerType === 'touch' && !visualRef.current?.contains(event.target as Node)) stopDrawing()
    }
    document.addEventListener('pointerdown', handleTapOutside)
    return () => document.removeEventListener('pointerdown', handleTapOutside)
  }, [hovered])

  // Scrolling down runs the same color sweep as hovering: the further you scroll
  // (up to 40% of the screen's height), the further the colored band has moved across the name.
  // The page passes it to the CSS as --sweep (100% = not started, 0% = done).
  useEffect(() => {
    function handleScroll() {
      const progress = Math.min(window.scrollY / (window.innerHeight * 0.4), 1)
      nameRef.current?.style.setProperty('--sweep', `${100 - progress * 100}%`)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    // id="home" lets the navbar link "/#home" scroll here.
    <section id="home" className="section hero">
      <div className="hero__text">
        <p className="eyebrow">{profile.role}</p>
        {/* Hover the heading, or scroll down: a color sweep runs across the name. */}
        <h1 className="hero__title">
          Hi, I'm{' '}
          <span className="hero__name" ref={nameRef}>
            {profile.name}
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
        // Hovering the photo plays a line drawing behind it (see PhotoArt above): mountains draw
        // themselves, then a flag goes up on the peak. Moving away fades it out; coming back redraws it.
        // On touch screens a tap does the same (see handleTap).
        <div
          className={`hero__visual${hovered ? ' hero__visual--on' : ''}`}
          ref={visualRef}
          onPointerEnter={(event) => event.pointerType !== 'touch' && startDrawing()}
          onPointerLeave={(event) => event.pointerType !== 'touch' && stopDrawing()}
          onPointerUp={handleTap}
        >
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
