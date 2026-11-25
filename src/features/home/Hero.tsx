// The founder's welcome section (/background, the founder's professional page). The home page has
// its own hero (HomeHero.tsx). This one is the original personal hero:
//   "Meet Ali Chahine" with the avatar, ali.build(...), "View my work" and "Download CV".
// The text comes from src/data/profile.ts.

import { useEffect, useRef, useState } from 'react'
import { profile } from '../../data/profile.ts'
import Icon from '../../components/Icon.tsx'
import SocialLinks from '../../components/SocialLinks.tsx'
import GradientText from '../../components/GradientText.tsx'
import { BACK_AT_TOP_EVENT } from '../../utils/goToTop.ts'
import { asset } from '../../utils/asset.ts'
import { useRobotHome } from '../../components/robotStore.ts'
import RobotLab from './RobotLab.tsx'
import HeroRobot from '../../components/HeroRobot.tsx'
import { Link } from 'react-router'
import BackLink from '../../components/BackLink.tsx'
import { useBack } from '../../utils/pageHistory.ts'
import RobotPerch from './RobotPerch.tsx'

// How fast the welcome plays is --art-time in global.css (faster with a mouse, as it plays while
// you hover; as before on touch screens). The inline delays below are multiplied by it in CSS.
// Rounded: sums like 1.45 + 5 * 0.07 give 1.8000000000000003, and a delay like that once left a
// letter of the welcome invisible.
const artDelay = (seconds: number) => `calc(${Math.round(seconds * 1000)}ms * var(--art-time))`

// After the "back to top" button brings you up, the drawing plays on its own and stays this long
// (in milliseconds; it takes about 1.6s to draw) before fading out.
const SHOW_AFTER_BACK_TO_TOP_MS = 4000

// Phones and tablets: no mouse to hover with (checked when needed, a tablet can get a mouse).
// "(hover: none)" alone isn't enough: many phones (Samsung and other Android browsers, phones with
// a stylus) claim they CAN hover, and then the welcome never started there, by itself or with a
// tap. So any sign of a touch screen counts: a finger-sized pointer, or touch points.
// (Same test as the "touch screens" styles of the welcome drawing in global.css.)
function isTouchScreen() {
  return (
    window.matchMedia('(hover: none)').matches ||
    window.matchMedia('(any-pointer: coarse)').matches ||
    navigator.maxTouchPoints > 0
  )
}


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
// robotHome: the tiny robot is at home on the "<Welcome />" box (RobotPerch), once the word is typed.
function PhotoArt({ cutout, robotHome }: { cutout?: string; robotHome: boolean }) {
  const codeLine = (x: number, y: number, [indent, length]: [number, number], i: number, side: string) => (
    <g key={`${side}${i}`}>
      <path
        className="hero__art-line hero__art-code"
        style={{ animationDelay: artDelay(0.55 + i * 0.07) }}
        pathLength={1}
        d={`M${x + indent} ${y} h${length}`}
      />
      {ACCENT_LINES.has(i) && (
        <path
          className="hero__art-line hero__art-token"
          style={{ animationDelay: artDelay(0.65 + i * 0.07) }}
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
          <circle key={cx} className="hero__art-dot" style={{ animationDelay: artDelay(0.45 + i * 0.06) }} cx={cx} cy="83" r="3.2" />
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
            <tspan key={i} className="hero__art-char" style={{ animationDelay: artDelay(1.45 + i * 0.07) }}>
              {char}
            </tspan>
          ))}
        </text>
        {robotHome && <RobotPerch box={{ x: BUBBLE.x, y: BUBBLE.y, width: BUBBLE_W, height: BUBBLE.height }} />}
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

// Switches the hero between the avatar and the night desk (RobotLab.tsx) when a visitor comes
// back to the top: they scrolled down past the hero, stayed away at least AWAY_MS, and scrolled
// back up to it. Each return switches to the other one. A quick dip down and back up doesn't count.
const AWAY_MS = 3000

function useReturnSwap(enabled: boolean) {
  const [swapped, setSwapped] = useState(false)
  useEffect(() => {
    if (!enabled) return
    let leftAt = 0 // when the hero was scrolled away (0 while it's on screen)
    function onScroll() {
      const y = window.scrollY
      if (y > window.innerHeight * 0.9) {
        if (!leftAt) leftAt = Date.now()
      } else if (leftAt && y < window.innerHeight * 0.6) {
        // Back at the top: switch while it comes into view, so the visitor sees the change.
        if (Date.now() - leftAt >= AWAY_MS) setSwapped((current) => !current)
        leftAt = 0
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [enabled])
  return swapped
}

// "variant" is kept for the CSS (.hero--founder); there is only the founder's version now.
function Hero({ variant = 'founder' }: { variant?: 'founder' }) {
  const founder = true
  const nameRef = useRef<HTMLSpanElement>(null)
  // The way back to the page you came from (the home page if there's none).
  const back = useBack('/background', '/')
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
  // The tiny robot is at home on the welcome box (see PhotoArt).
  const robotHome = useRobotHome()
  // Founder: the avatar, or the night desk once a visitor comes back to the top (useReturnSwap).
  const lab = useReturnSwap(profile.lab)
  const away = lab

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

  // Arriving at the top via the "back to top" button replays the drawing. With a mouse it fades out
  // after a few seconds (unless the mouse is on the hero by then: it then behaves like a hover).
  // On touch screens it stays: there it's shown while the photo is on screen (see below).
  useEffect(() => {
    function handleBackAtTop() {
      startDrawing()
      if (isTouchScreen()) return
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
  // Touch screens (phones, tablets) can't hover, so there the drawing plays BY ITSELF when the photo
  // comes into view, and STAYS while it's on screen: no finger needs to stay down, fast scrolling
  // can't cut it short, and there's time to read "<Welcome />" and tap the robot on the box.
  // Once the photo has left the screen completely, coming back plays it again from the start.
  // A tap on the photo (or around it, the drawing's area) replays it.
  // (A finger also fires pointer "enter" and "leave", which is why the hover handlers skip touch.)
  useEffect(() => {
    if (!isTouchScreen()) return
    const visual = document.querySelector('.hero__visual')
    if (!visual) return

    let showing = false
    const watcher = new IntersectionObserver(
      ([entry]) => {
        // Mostly on screen: play (once per visit to the screen).
        if (entry.intersectionRatio >= 0.6 && !showing) {
          showing = true
          startDrawing()
        }
        // Completely off screen: hide it, so it plays fresh next time.
        else if (!entry.isIntersecting && showing) {
          showing = false
          stopDrawing()
        }
      },
      { threshold: [0, 0.6] },
    )
    watcher.observe(visual)

    function handleTap(event: TouchEvent) {
      if (!(event.target instanceof Element)) return
      // A tap on the robot waiting on the welcome box lets it out (PhotoArt): don't restart.
      if (event.target.closest('.hero__art-robot')) return
      if (event.target.closest('.hero__visual')) {
        showing = true
        startDrawing()
      }
    }
    document.addEventListener('touchstart', handleTap, { passive: true })
    return () => {
      watcher.disconnect()
      document.removeEventListener('touchstart', handleTap)
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
      className={`section hero hero--${variant}`}
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
        {/* Founder's page: the way back to the page you came from. */}
        {founder && <BackLink back={back} className="hero__back" />}
        <p className="eyebrow">
          {founder ? (
            // On narrow phones the line wraps before "Founder of Axihex", never inside it.
            <>
              {profile.founderTitle} · <span style={{ whiteSpace: 'nowrap' }}>Founder of {profile.brand}</span>
            </>
          ) : (
            profile.role
          )}
        </p>
        {/* Hover the heading, or scroll down: a color sweep runs across the name. */}
        <h1 className="hero__title">
          {founder ? 'Meet' : profile.headline}{' '}
          <span className="hero__name" ref={nameRef}>
            <GradientText text={founder ? profile.name : profile.headlineAccent} />
          </span>
        </h1>

        {/* Founder's page only: where he is and what he's open to. The home page stays about Axihex. */}
        {founder && (
          <ul className="hero__meta">
            <li>
              <Icon name="pin" size={16} /> {profile.location}
            </li>
            {profile.founderAvailability && (
              // Every few seconds the line gives a little shake (see global.css).
              <li className="hero__available">
                <span className="hero__available-dot" /> {profile.founderAvailability}
              </li>
            )}
          </ul>
        )}

        {/* Buttons and icon links sit side by side in a row. */}
        <div className="hero-actions">
          {founder ? (
            <>
              {/* The PDF lives in /public, so it is served from the site root. "Get in touch" is at
                  the end of the founder page, once (see BackgroundPage.tsx). */}
              <a href={asset('/Ali_Chahine_CV.pdf')} download="Ali_Chahine_CV.pdf" className="button">
                Download CV
              </a>
            </>
          ) : (
            <>
              <Link to="/#projects" className="button">
                Explore our work <span aria-hidden="true">→</span>
              </Link>
              {/* Client work and original products coexist: the studio welcomes projects, so say so up front.
                  The Contact form opens with "A project" chosen (Contact.tsx). */}
              <Link to="/#contact" state={{ topic: 'project' }} className="button button-outline">
                Start a project
              </Link>
            </>
          )}
          <SocialLinks />
        </div>


      </div>

      {/* Studio: the Axihex mark (HeroMark.tsx). Founder: the avatar, on a transparent background.
          Every other return to the top, the night desk takes its place (RobotLab.tsx). */}
      {(
        // Behind it: a line drawing (see PhotoArt above) that plays while the hero is hovered (or a
        // finger is on a phone's screen). Moving away fades it out; coming back redraws it.
        <div className={`hero__visual${founder ? ' hero__visual--avatar' : ''}${hovered ? ' hero__visual--on' : ''}`}>
          {/* An invisible area exactly where the drawing appears (it's bigger than the photo,
              and reaches past the hero on the right): hovering or touching anywhere in it plays the
              drawing too, not only the photo. It sits under the drawing, so the robot on the
              welcome box stays clickable. */}
          <span className="hero__hit" aria-hidden="true" />
          {/* Founder: the "<Welcome />" drawing, with the avatar's silhouette cut out of it.
              Studio: the "build" drawing around the Axihex mark (MarkArt). */}
          {drawing &&
            !away &&
            (founder ? (
              <PhotoArt key={run} cutout={asset(profile.photo)} robotHome={robotHome} />
            ) : (
              null
            ))}
          <div className={`hero__photo${away ? ' hero__photo--away' : ''}`}>
            {founder ? (
              // The first big picture on the page: "high" priority makes the browser fetch it first,
              // and width/height reserve its space so nothing jumps.
              <img src={asset(profile.photo)} alt={profile.name} width={1024} height={1024} fetchPriority="high" />
            ) : null}
          </div>
          {founder && lab && <RobotLab robotHome={robotHome} />}
        </div>
      )}

      {/* The tiny robot, once it's out of the welcome box: it lives in here (HeroRobot.tsx). */}
      <HeroRobot />
    </section>
  )
}

export default Hero
