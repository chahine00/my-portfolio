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
// - it notices you: its eyes follow the mouse, it waves when you scroll back up to the hero, and
//   hops when you hover the buttons or social icons
// - until you click it, it invites you to, a few times, spaced out (see maybeInvite): it glows and
//   makes a silent gesture (a wave or a hop), and if that gets no reaction, says two words in a
//   small pill where they cover no text. No room where it stands? It walks or hops to a spot where
//   the words fit. The first one comes right after it lands in the hero (from the welcome box or
//   the big robot), so it's clear it can be clicked. Then one at about 10s and one at about 25s,
//   and that's all: 3 per visit. It stops inviting once you've clicked it (remembered until a
//   reload, see robotMet in robotStore.ts), or once you go for the hero's main content (click or
//   tap its buttons or icons, or scroll away from the hero). Just moving the mouse over them
//   doesn't count: on a computer the mouse crosses them all the time.
//   Its favorite spot is the "Software Engineer" title: lots of free room above it, so the words
//   fit there without covering any text. It lands there first and flies back to it often.
// - its jokes open on hover too (as soon as the mouse is on it), and on phones as soon as a
//   finger touches it, at the same moment it starts dancing (not only on release)
// - it dances while the mouse is on it or right next to it (about to click), and for a moment
//   when a finger presses it
// - some sentences depend on what it stands on (your name, the CV button, the social icons…)
// - it stops moving while the hero is off screen or the tab is hidden (saves battery), and moves
//   less on touch screens
// Clicking (or tapping) it makes it say something in a speech bubble: just the words, no buttons.
// The bubble closes by itself after 3 seconds (with a mouse as on touch screens), and when the page
// scrolls; on touch screens, also on any tap. Visitors who turned off animations get a robot that stands still on
// your name (and still talks).
//
// One requestAnimationFrame loop moves it with a transform, so React doesn't re-draw while it
// moves; only the speech bubble uses React state. The looks and the robot moves are in global.css
// under "tiny robot".

import { useLayoutEffect, useRef, useState } from 'react'
import RobotSprite from './RobotSprite.tsx'
import { rememberRobotMet, robotMet, robotOrigin, sendRobotHome, useRobotHome } from './robotStore.ts'

type Mode =
  | 'boot' // starting up where it came out (scan line, eyes switching on)
  | 'wave' // a gesture: waves its arm, antenna light blinking
  | 'hop' // a gesture: a little hop on the spot
  | 'dance' // the mouse is on it or about to click it (or a finger is pressing it)
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
  '.hero__proof li',
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
// Touch screens (and keyboard): the bubble closes by itself after this long.
const READ_MS = 3000
const SCROLL_CLOSE_PX = 4 // the bubble closes once the page has scrolled this far
const STANDBY_AFTER_MS = 45000 // no mouse movement for this long → standby (mouse screens only)
const NEAR_TAP = 44 // touch: a tap this close to it counts as a tap on it (it's small, and moves)
const SCREEN_MARGIN = 16 // the bubble stays this far inside the screen

// What it says when clicked: a shuffled round, none repeats until all were said. Each hero has its
// own: on the home page (.hero--studio) it's the studio's bot, on the founder's page
// (.hero--founder) it's Ali's sidekick. A few robot jokes work on both.
const ROBOT_LINES = [
  '01001000 01101001! (That’s “Hi” in binary. You’re welcome.)',
  'It works on my machine. I AM the machine.',
  'I’m not lazy, I’m in power-saving mode.',
  'Warning: excessive clicking may cause robot dizziness.',
  'Loading a joke… 99%… 99%… 99%…',
  'I’d tell you a UDP joke, but you might not get it.',
  'There are 10 kinds of people: those who get binary, and you.',
  'Stop poking me! …okay, one more time.',
]

// Home: Axihex, the studio. Building, shipping, ideas, the hexagons and the board.
const STUDIO_LINES = [
  'Beep boop! I’m the Axihex studio bot. Head of Vibes, unpaid.',
  'Hexagons are the bestagons. Ask any bee. Or me.',
  'Idea → Build → Live. I moved a card once. Big day.',
  'status: live. Me? I’m status: lively.',
  'Building what’s next. I’m in charge of what’s now.',
  'Every great product starts as a weird idea. I started as three divs.',
  'I stacked those hexagon layers myself. Don’t tell the designer.',
  'Our build pipeline: coffee in, products out.',
  'Shipped to the App Store, Google Play and the web. I just ship jokes.',
  'Got an idea? The Contact section is right down there. I checked.',
  'This studio runs on curiosity, clean code and one tiny robot.',
  'I asked for a corner office. They gave me a corner of the hero.',
  'Version 1 is better than version never. Studio rule #1.',
  'I don’t write the software. I supervise it. From up here.',
  ...ROBOT_LINES,
]

// Founder's page: about Ali, his work, his CV. The old favorites, plus a few new ones.
const FOUNDER_LINES = [
  "Beep boop! I'm Ali's tiny helper bot. Unpaid, obviously.",
  'Need a developer? My human is open to opportunities. And snacks.',
  'I asked Ali for a raise. He gave me a bigger font size.',
  'Ali writes the code. I take the credit.',
  'My battery is 4%. Hire Ali so I can retire.',
  'Ali’s code is so clean, I use it as a mirror.',
  'Ali builds APIs. I build excuses. We both ship.',
  'First hire at boxMind AI. I was the second. Unofficially.',
  'Backend at his core. Me? Mostly bolts.',
  'He bought a MacBook just to ship one iOS app. Dedication.',
  'Two degrees: computer science and business. I have one setting: on.',
  'Scanning his CV… conclusion: hire before the robots do.',
  'Psst… the “Download CV” button is my favorite trampoline.',
  'Beirut’s finest engineer. I’m Beirut’s finest robot. Small category.',
  'He thinks bigger and adapts faster. I adapt slower but bounce higher.',
  ...ROBOT_LINES,
]

// Sentences that depend on what it stands on (the first matching selector wins). When it's clicked
// on one of these spots, it sometimes says one of these instead of a general sentence.
// The two heroes differ: .hero--studio is Axihex (home), .hero--founder is Ali (/background).
const PERCH_LINES: [string, string[]][] = [
  ['.hero--founder .hero__name', ['Standing on the boss. Don’t tell him.', 'Nice name. I’d hire it.', 'Careful: these letters are freshly compiled.']],
  ['.hero--studio .hero__name', ['Standing on what’s next. Comfy.', 'Careful: these letters are freshly compiled.', 'Next stop: whatever Axihex builds.']],
  ['.hero--founder .hero__text > .eyebrow', ['Software Engineer. And I’m his software.', 'Highest spot in the hero. King of the hill!']],
  ['.hero--studio .hero__text > .eyebrow', ['Independent, like me. Mostly.', 'Highest spot in the hero. King of the hill!']],
  ['.hero__code', ['Shh, this line is still typing!', 'axihex.build(\'robot\') → that’s me!']],
  ['.hero__proof li', ['Live here. Literally.', 'App stores, the web, the cloud… I’ve stood on all of them.', 'Shipped. Like a robot on a pill.']],
  ['.hero__meta li', ['Location checked. GPS: very confident.', 'Available? Hire him before I do.']],
  ['.hero-actions .button[download]', ['Bounce test: passed!', 'This downloads a CV. Not me. Please not me.']],
  ['.hero-actions .button', ['Press this one. Trust me, I’m a robot.', 'The projects are below. I’ve seen them. Twice.']],
  ['.hero-actions .social-links', ['Follow him, not me. I have no socials.', 'I tried LinkedIn. They asked for hands.']],
]
const PERCH_LINE_CHANCE = 0.4

// Inviting you to click it (see sayInvite): never an order ("click me", "tap me") and never about
// jokes, just a little curiosity, so the same words work with a mouse and on phones. It's smart
// about it:
// - the first one is a plain "Tap me!" (on phones and computers alike)
// - on a spot that has its own sentences (PERCH_LINES), it often hints at that spot, and if you
//   click it right after, it answers with a sentence about that same spot (s.promise)
// - with a mouse lingering near it without clicking, it notices you (NUDGES)
// - never the same words twice in a row
const FIRST_INVITE = 'Tap me!'
const INVITES = ['I know things…', 'Psst… hi there', 'Got a secret…', 'Curious?']
// One more invite per hero: who it is here.
const STUDIO_INVITE = 'Studio bot 👋'
const FOUNDER_INVITE = 'Ali’s sidekick 👋'
const SPOT_INVITES: [string, string[]][] = [
  ['.hero--founder .hero__name', ['I know him well', 'Guess who’s boss?']],
  ['.hero--studio .hero__name', ['I know what’s next', 'Peek ahead?']],
  ['.hero--founder .hero__text > .eyebrow', ['I work for him', 'Behind the title…']],
  ['.hero--studio .hero__text > .eyebrow', ['I work here', 'Behind the studio…']],
  ['.hero__code', ['I can read this']],
  ['.hero__proof li', ['Been there…', 'Shipped it!']],
  ['.hero__meta li', ['Fun fact here…']],
  ['.hero-actions .button[download]', ['Seen his CV?']],
  ['.hero-actions .button', ['Seen the work?']],
  ['.hero-actions .social-links', ['He’s on there…']],
]
const SPOT_INVITE_CHANCE = 0.7 // on such a spot, it hints at it this often
const PROMISE_MS = 10000 // clicked this soon after a spot hint (still there): it answers about it
const NUDGES = ['I see you 👀', 'Curious?', 'Hi there 👋'] // mouse lingering near it
const REMINDERS = ['There’s more…', 'Still here 👋', 'Back again?'] // once it was clicked
// The first invite comes a few seconds after it lands (FIRST_INVITE_MS, see 'jet' in tick): long
// enough to read the hero first, while it stands still on its spot. These are the waits before each
// one after it (counted from the end of the one before): it talks more once it has started.
const FIRST_INVITE_MS = 4500
const INVITE_GAPS = [2500, 5000, 7000, 9000, 12000]
const MAX_INVITES = 5 // per visit, with a mouse…
const MAX_TOUCH_INVITES = 5 // …on touch screens…
const MAX_STILL_INVITES = 1 // …and for visitors who turned off animations
const REMINDER_AFTER_MS = 30000 // once clicked: one reminder, after this long without another click
const MAX_INVITE_MOVES = 2 // it moves at most this many times to find room for the words
const INVITE_RETRY_MS = 8000 // the moment passed (scrolled away, mouse came close…): try later
// Its favorite spot, the "Software Engineer" title: roomy above, so it goes there often…
const TITLE_PERCH = '.hero__text > .eyebrow'
const TITLE_CHANCE = 0.55 // …when it flies somewhere, it picks the title this often
const TITLE_EARLY_MS = 2000 // …and on it, the next invite comes this much sooner
// Touch: right after a finger opens a joke (or lifts), stray events a phone sends around a tap
// (a tiny scroll, a late tap or click) don't close it. Only its 3s, or a real tap elsewhere after
// this, close it.
const TOUCH_GRACE_MS = 1000
const PRESS_CLICK_GUARD_MS = 1500 // touch: the click that ends a press that opened a joke doesn't open another
const GLOW_MS = 1600 // same as robot-glow in global.css
const INVITE_SHOW_MS = 3200 // how long the words stay (same as robot-invite in global.css)
const WORDS_AFTER_GESTURE_MS = 2200 // the words come this long after the gesture, if it got no reaction
const HERO_IN_VIEW = 0.6 // the hero must fill this much of the screen (or be this much on it)
const SCROLL_QUIET_MS = 700 // not right after a scroll
const TOUCH_QUIET_MS = 2000 // touch: no tap or scroll for this long first
const NUDGE_NEAR = 200 // mouse: the cursor this close without clicking…
const NUDGE_AFTER_MS = 1500 // …for this long: a good moment for an invite
const NUDGE_MIN_GAP_MS = 8000 // but not sooner than this after the last one
const WAVE_MS = 1000 // same as the wave in global.css
const HOP_MS = 520 // same as robot-hop in global.css
const DANCE_NEAR = 46 // mouse: the cursor this close to its middle (about to click): it dances
const TOUCH_DANCE_MS = 900 // a finger pressing it: it dances this long
const DANCE_FROM: Mode[] = ['idle', 'walk', 'scan', 'turn', 'standby', 'wave', 'hop']
const HOVER_HOP_GAP_MS = 4000 // hovering the buttons makes it hop at most this often

const MARKS = ['!', '♪', '01', '?']

// The bottom of the navbar (nothing should show under it), or the top of the screen.
function navBottom() {
  return Math.max(0, document.querySelector('.navbar')?.getBoundingClientRect().bottom ?? 0)
}

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

// What must stay readable in the hero's text column, in screen coordinates: each line of text
// (only where the letters are, not the whole width of the block), and the buttons and icons.
function textObstacles(hero: HTMLElement): DOMRect[] {
  const text = hero.querySelector('.hero__text')
  if (!text) return []
  const rects: DOMRect[] = []
  const range = document.createRange()
  const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue
    range.selectNodeContents(node)
    for (const r of range.getClientRects()) if (r.width > 2 && r.height > 2) rects.push(r)
  }
  for (const el of text.querySelectorAll('a, button, svg, img')) {
    const r = el.getBoundingClientRect()
    if (r.width > 2 && r.height > 2) rects.push(r)
  }
  return rects
}

// The free height above a spot (in the hero's coordinates), up to the nearest line of text or box
// over it in the hero's text column, so the robot can be sized to fit without covering any text.
function roomAbove(span: { left: number; right: number; top: number }, hero: HTMLElement) {
  const h = hero.getBoundingClientRect()
  let room = Infinity
  for (const r of textObstacles(hero)) {
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
  const brain = useRef<{ talk: () => void } | null>(null)
  const [line, setLine] = useState<string | null>(null)
  const [side, setSide] = useState<'left' | 'right'>('left')

  // Keep the speech bubble on screen: on a phone a long sentence can be wider than the room on
  // that side, which cut off the text and pushed its button off the screen. It slides back in.
  // And when there's no room above the robot (it stands high, e.g. on the "Software Engineer"
  // label), the bubble would hide under the navbar: it opens below the robot instead.
  useLayoutEffect(() => {
    const bubble = rootRef.current?.querySelector<HTMLElement>('.robot__bubble')
    if (!bubble) return
    bubble.style.translate = ''
    delete bubble.dataset.below
    if (bubble.getBoundingClientRect().top < navBottom() + 8) bubble.dataset.below = 'true'
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
    // Which hero it's in decides what it talks about: the studio (home) or Ali (founder's page).
    const onFounder = heroEl.classList.contains('hero--founder')
    const LINES = onFounder ? FOUNDER_LINES : STUDIO_LINES
    const invites = [...INVITES, onFounder ? FOUNDER_INVITE : STUDIO_INVITE]

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
      talkScrollY: 0, // where the page was scrolled when the bubble opened
      noTalkUntil: 0, // touch: the tap that just closed the bubble mustn't open it again
      talkAfterLanding: false, // tapped while flying: it talks once it has landed
      line: -1,
      order: [] as number[], // the sentences still to say, shuffled (no repeats until all are said)
      perchLine: '', // the last spot sentence it said (not twice in a row)
      // Invites (see maybeInvite).
      tapped: robotMet(), // it was clicked: no more invites, one reminder at most
      reminded: robotMet(), // met earlier (before coming back to this page): no reminder either
      promise: null as { perch: HTMLElement; until: number } | null, // it hinted at this spot (inviteWords)
      nudged: false, // this invite comes early because the mouse lingers near it
      lastInviteText: '',
      engaged: false, // you clicked the hero's buttons or icons, or scrolled away: no more invites
      hoverTalked: false, // this hover already opened a joke
      pressTalkAt: 0, // touch: when a press opened a joke (then when that finger lifted)
      fingerDown: false, // touch: a finger is pressing it right now (its joke waits to count down)
      touchAt: 0, // touch: when a finger last opened a joke, or lifted from it (see TOUCH_GRACE_MS)
      invites: 0, // how many it showed (before it was clicked)
      nextInvite: 0,
      lastInviteAt: 0,
      inviteUntil: 0, // the words are showing until then (it holds still)
      gestureForInvite: false, // the current wave/hop is an invite: the words may follow
      wordsAt: 0, // when the words come, if the gesture got no reaction
      wordsAfterLanding: false, // it hops to a spot with room for the words, then says them
      wordsAfterWalk: false, // it walks to such a spot, then says them
      inviteMoves: 0,
      nearSince: 0, // mouse: since when the cursor has been close (NUDGE_NEAR)
      greet: false, // it waves once it's standing (you scrolled back up to the hero)
      lastHoverHop: 0,
      onRobot: false, // the mouse is on it
      danceUntil: 0, // touch: it dances until then
      // The page.
      heroVisible: 1, // how much of the hero is on screen (of the screen, for a tall hero)
      visibleSince: performance.now(),
      scrolledAt: 0,
      lastTouch: 0,
      landed: false, // it landed in the hero once: its first invite comes right then
    }
    s.nextInvite = performance.now() + (INVITE_GAPS[s.invites] ?? Infinity)
    let frame = 0
    let paused = false
    let last = performance.now()
    let talkTimer = 0
    let stillInviteTimer = 0
    let inviteOffTimer = 0 // takes the invite pill off once it's over
    const touch = window.matchMedia('(hover: none), (any-pointer: coarse)').matches
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const maxInvites = reduceMotion ? MAX_STILL_INVITES : touch ? MAX_TOUCH_INVITES : MAX_INVITES

    const size = () => parseFloat(getComputedStyle(robot).getPropertyValue('--robot-size')) || 28
    // Its full size (from the CSS). On each spot it may be shrunk to fit the room above (fitTo).
    const fullSize = size()
    const sizeFor = (perch: HTMLElement) =>
      Math.round(clamp(roomAbove(spanOf(perch, heroEl), heroEl) - 2, Math.min(MIN_SIZE, fullSize), fullSize))
    function fitTo(perch: HTMLElement) {
      robot.style.setProperty('--robot-size', `${sizeFor(perch)}px`)
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
    const onTitle = () => !!s.perch?.matches(TITLE_PERCH)

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

    function jetTo(to: HTMLElement, x?: number) {
      const span = spanOf(to, heroEl)
      const x1 = x ?? random(span.left, Math.max(span.left, span.right))
      const distance = Math.hypot(x1 - s.x, span.top - s.y)
      s.jet = { x0: s.x, y0: s.y, x1, y1: span.top, start: performance.now(), duration: clamp(distance * 3.2, 750, 1500), to }
      setDir(x1 >= s.x ? 1 : -1)
      setMode('jet')
    }

    function turn(dir: 1 | -1) {
      setDir(dir)
      setMode('turn', TURN_MS)
    }

    // Touch screens: longer rests (it moves less, and saves battery).
    function rest(min = 600, max = 1400) {
      setMode('idle', random(min, max))
    }

    // A wave or a hop: to greet you, to react, or to invite you (then words may follow).
    function gesture(mode: 'wave' | 'hop', forInvite = false) {
      s.gestureForInvite = forInvite
      s.thenWalk = false
      setMode(mode, mode === 'wave' ? WAVE_MS : HOP_MS)
    }

    function afterGesture(now: number) {
      rest()
      if (s.gestureForInvite) {
        s.gestureForInvite = false
        s.wordsAt = now + WORDS_AFTER_GESTURE_MS
      }
    }

    // What to do next, standing on its spot.
    function decide() {
      if (!s.perch) return
      const now = performance.now()
      // Its invite is showing, or about to: it holds still, so the words stay where they fit.
      if (now < s.inviteUntil || s.wordsAt) {
        rest(300, 500)
        return
      }
      // You came back to the hero: it waves hello.
      if (s.greet) {
        s.greet = false
        gesture('wave')
        return
      }
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
      // Looks around (flying is the most eye-catching move: it does it a bit less often).
      if (roll < 0.72) {
        turn(s.dir > 0 ? -1 : 1)
        return
      }
      const others = perches().filter((p) => p !== s.perch)
      const title = others.find((p) => p.matches(TITLE_PERCH))
      if (title && Math.random() < TITLE_CHANCE) jetTo(title)
      else if (others.length) jetTo(pick(others))
      else rest()
    }

    function tick(now: number) {
      const dt = Math.min(now - last, 50) / 1000
      last = now
      const done = now >= s.until

      // The mouse is on it, or about to click it (or a finger presses it): it dances.
      const near = s.pointer && Math.hypot(s.pointer.x - s.x, s.pointer.y - (s.y - size() / 2)) < DANCE_NEAR
      const wantDance = !reduceMotion && (s.onRobot || !!near || now < s.danceUntil)
      if (wantDance && DANCE_FROM.includes(s.mode)) {
        s.thenWalk = false
        s.gestureForInvite = false
        s.wordsAfterWalk = false
        setMode('dance')
        beep('♪')
      } else if (!wantDance && s.mode === 'dance') rest(300, 600)

      // The mouse on it: it tells a joke right away (once per hover).
      if (s.onRobot && !s.hoverTalked && !s.talking) {
        s.hoverTalked = true
        talk()
      }

      switch (s.mode) {
        case 'boot': {
          const all = perches()
          const to = all.find((p) => p.matches(TITLE_PERCH)) ?? all.find((p) => p === name()) ?? all[0]
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
            // Its first landing in the hero (out of the welcome box or the big robot): it stands
            // still a few seconds (you read the hero first), then glows and says "Tap me!".
            if (!s.landed) {
              s.landed = true
              if (!s.tapped && s.invites === 0) {
                s.wordsAt = now + FIRST_INVITE_MS
                s.lastInviteAt = now
              }
            }
            // It came here to say its invite (there was no room for it at the last spot).
            if (s.wordsAfterLanding) {
              s.wordsAfterLanding = false
              s.wordsAt = now + 600
            }
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
            wordsNow(now)
            break
          }
          // Servo steps: it only moves during the first part of each step.
          if ((now % STEP_MS) / STEP_MS < MOVE_SHARE) s.x += (s.dir * SPEED * dt) / MOVE_SHARE
          if (s.dir > 0 ? s.x >= s.walkTo : s.x <= s.walkTo) {
            s.x = s.walkTo
            rest()
            wordsNow(now)
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
        case 'dance':
          if (s.perch) s.y = spanOf(s.perch, heroEl).top
          break
        case 'wave':
        case 'hop':
          if (done) afterGesture(now)
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
          // Standby only with a mouse: a phone has no mouse moving, so it would just fall asleep.
          if (!touch && now - s.lastPointer > STANDBY_AFTER_MS) setMode('standby')
          else if (done) decide()
          break
        case 'leave':
          if (done) {
            sendRobotHome()
            return
          }
          break
      }
      // Mouse: since when the cursor has been close to it (a good moment for an invite).
      if (s.pointer && Math.hypot(s.pointer.x - s.x, s.pointer.y - (s.y - size() / 2)) < NUDGE_NEAR) {
        if (!s.nearSince) s.nearSince = now
      } else s.nearSince = 0
      maybeInvite(now)
      place()
      frame = paused ? 0 : requestAnimationFrame(tick)
    }

    // Is this a good moment to invite you? Before it's clicked: up to maxInvites. After: a single
    // reminder, once it's due. And only while the hero is in view, the tab is open, the page
    // isn't scrolling and it isn't talking.
    function inviteAllowed(now: number) {
      const left = s.tapped ? !s.reminded : s.invites < maxInvites
      return (
        left &&
        !s.engaged &&
        !s.talking &&
        s.heroVisible >= HERO_IN_VIEW &&
        document.visibilityState === 'visible' &&
        now - s.scrolledAt > SCROLL_QUIET_MS
      )
    }

    // The invite, in steps. 1: when it's due, it glows and makes a silent gesture (a wave or a
    // hop). 2: if that got no reaction, two words in a small pill where they cover no text
    // (sayInvite). With a mouse it's due after INVITE_GAPS, or sooner when the cursor lingers
    // near it without clicking. On touch screens, after a few seconds without tapping or scrolling.
    function maybeInvite(now: number) {
      // Interrupted along the way (it danced, the hero scrolled away…): try again later.
      if (s.nextInvite === Infinity && !s.wordsAt && !s.gestureForInvite && !s.wordsAfterLanding && !s.wordsAfterWalk) {
        s.nextInvite = now + INVITE_RETRY_MS
      }
      if (s.wordsAt) {
        if (now < s.wordsAt) return
        s.wordsAt = 0
        if (inviteAllowed(now) && s.mode === 'idle') {
          if (s.invites === 0 && !s.tapped) glow() // the first one (after landing) had no gesture before it
          sayInvite(now, true)
        }
        else s.nextInvite = now + INVITE_RETRY_MS
        return
      }
      if (s.wordsAfterLanding || s.wordsAfterWalk || !inviteAllowed(now) || s.mode !== 'idle' || !s.perch) return
      if (touch) {
        if (now < s.nextInvite - (onTitle() ? TITLE_EARLY_MS : 0)) return
        if (now - Math.max(s.lastTouch, s.scrolledAt, s.visibleSince) < TOUCH_QUIET_MS) return
      } else {
        const nudge = s.nearSince > 0 && now - s.nearSince > NUDGE_AFTER_MS && now - s.lastInviteAt > NUDGE_MIN_GAP_MS
        if (!nudge && now < s.nextInvite - (onTitle() ? TITLE_EARLY_MS : 0)) return
        s.nudged = nudge && now < s.nextInvite // early because of the mouse: it noticed you
      }
      s.lastInviteAt = now
      s.nextInvite = Infinity // set again once the invite is over
      s.inviteMoves = 0
      glow()
      gesture(Math.random() < 0.5 ? 'wave' : 'hop', true)
    }

    // It arrived where it was going for its invite words: say them in a moment.
    function wordsNow(now: number) {
      if (!s.wordsAfterWalk) return
      s.wordsAfterWalk = false
      s.wordsAt = now + 300
    }

    // A soft pulsing glow around it: "you can click me". Never covers text (it's a light, not a box).
    function glow() {
      robot.classList.remove('robot--glow')
      void robot.offsetWidth // restart its animation
      robot.classList.add('robot--glow')
      window.setTimeout(() => robot.classList.remove('robot--glow'), GLOW_MS)
    }

    // Says the invite words where they cover no text. No room where it stands: it walks along its
    // spot, or hops to another one, where they fit (canMove), and says them there. No room
    // anywhere: the glow and the gesture were the invite.
    function sayInvite(now: number, canMove: boolean) {
      const text = inviteWords(now)
      const el = inviteRef.current
      if (!el) return
      const fit = placeInvite(text)
      if (fit) {
        el.classList.remove('is-on')
        void el.offsetWidth // restart its animation
        el.classList.add('is-on')
        s.inviteUntil = now + INVITE_SHOW_MS
        // Off once it's over: left on, its animation would play again after the next flight
        // (the pill is hidden while it flies, and showing it again restarts the animation).
        window.clearTimeout(inviteOffTimer)
        inviteOffTimer = window.setTimeout(() => el.classList.remove('is-on'), INVITE_SHOW_MS)
        inviteDone(now)
        return
      }
      if (canMove && s.inviteMoves < MAX_INVITE_MOVES) {
        const spot = findInviteSpot()
        if (spot) {
          s.inviteMoves += 1
          if (spot.perch === s.perch) {
            s.walkTo = spot.x
            s.wordsAfterWalk = true
            const dir = spot.x > s.x ? 1 : -1
            if (Math.abs(spot.x - s.x) < 2) wordsNow(now)
            else if (dir !== s.dir) {
              s.thenWalk = true
              turn(dir)
            } else setMode('walk')
          } else {
            s.wordsAfterLanding = true
            jetTo(spot.perch, spot.x)
          }
          return
        }
      }
      glow()
      inviteDone(now)
    }

    // The words for this invite (see INVITES).
    function inviteWords(now: number) {
      const fresh = (list: string[]) => {
        const rest = list.filter((t) => t !== s.lastInviteText)
        return pick(rest.length ? rest : list)
      }
      s.promise = null
      let text: string
      if (s.tapped) text = fresh(REMINDERS)
      else if (s.invites === 0) text = FIRST_INVITE
      else if (s.nudged) text = fresh(NUDGES)
      else {
        const spot = s.perch ? SPOT_INVITES.find(([sel]) => s.perch!.matches(sel)) : undefined
        if (spot && Math.random() < SPOT_INVITE_CHANCE) {
          text = fresh(spot[1])
          s.promise = { perch: s.perch!, until: now + INVITE_SHOW_MS + PROMISE_MS }
        } else text = fresh(invites)
      }
      s.nudged = false
      s.lastInviteText = text
      return text
    }

    function inviteDone(now: number) {
      if (s.tapped) s.reminded = true
      else s.invites += 1
      s.nextInvite = s.tapped ? Infinity : now + INVITE_SHOW_MS + (INVITE_GAPS[s.invites] ?? Infinity)
    }

    // Where the pill can go around a robot box (screen coordinates): above its head, or beside it
    // (toward the middle of the hero first, then the other side). The first place that covers no
    // text and stays on screen, as a position inside the robot's box, or null.
    function inviteSpotAround(left: number, top: number, sz: number, w: number, h: number, robotX: number) {
      const inward = robotX > heroEl.clientWidth / 2 ? 'left' : 'right'
      const spots: Record<string, [number, number]> = {
        above: [sz / 2 - w / 2, -h - 6],
        left: [-w - 6, sz * 0.15 - h / 2],
        right: [sz + 6, sz * 0.15 - h / 2],
      }
      const order = ['above', inward, inward === 'left' ? 'right' : 'left']
      const obstacles = textObstacles(heroEl)
      const minTop = navBottom() + 4
      const viewWidth = document.documentElement.clientWidth
      for (const name of order) {
        const [x, y] = spots[name]
        const l = left + x
        const t = top + y
        const rr = l + w
        const b = t + h
        if (l < 8 || rr > viewWidth - 8 || t < minTop || b > window.innerHeight - 4) continue
        if (obstacles.some((o) => o.left < rr + 3 && o.right > l - 3 && o.top < b + 3 && o.bottom > t - 3)) continue
        return { x, y, name }
      }
      return null
    }

    // Puts the invite pill around it where it covers no text. False when there's no such place.
    function placeInvite(text: string) {
      const el = inviteRef.current
      if (!el) return false
      el.textContent = text
      el.style.left = '0px'
      el.style.top = '0px'
      const w = el.offsetWidth
      const h = el.offsetHeight
      if (!w || !h) return false
      const box = robot.getBoundingClientRect()
      const spot = inviteSpotAround(box.left, box.top, box.width, w, h, s.x)
      if (!spot) return false
      el.style.left = `${Math.round(spot.x)}px`
      el.style.top = `${Math.round(spot.y)}px`
      el.dataset.place = spot.name
      return true
    }

    // A place where the words would fit: along its own spot first (its two ends and middle), then
    // the other spots, nearest first. The pill was measured by placeInvite just before.
    function findInviteSpot() {
      const el = inviteRef.current
      if (!el || !s.perch) return null
      const w = el.offsetWidth
      const h = el.offsetHeight
      const hero = heroEl.getBoundingClientRect()
      const others = perches()
        .filter((p) => p !== s.perch)
        .sort((a, b) => Math.abs(spanOf(a, heroEl).top - s.y) - Math.abs(spanOf(b, heroEl).top - s.y))
        // The title has the most room above it: try it first.
        .sort((a, b) => Number(b.matches(TITLE_PERCH)) - Number(a.matches(TITLE_PERCH)))
      for (const perch of [s.perch, ...others]) {
        const span = spanOf(perch, heroEl)
        const sz = perch === s.perch ? size() : sizeFor(perch)
        const right = Math.max(span.left, span.right)
        for (const x of [span.left, (span.left + right) / 2, right]) {
          const left = hero.left + x - sz / 2
          const top = hero.top + span.top - sz
          if (inviteSpotAround(left, top, sz, w, h, x)) return { perch, x }
        }
      }
      return null
    }

    function hideInvite() {
      inviteRef.current?.classList.remove('is-on')
      s.inviteUntil = 0
      s.wordsAt = 0
      s.gestureForInvite = false
      s.wordsAfterLanding = false
      s.wordsAfterWalk = false
    }

    // A sentence about the spot it stands on, if it has some (not the same one twice in a row).
    function perchLine() {
      const lines = s.perch ? PERCH_LINES.find(([sel]) => s.perch!.matches(sel))?.[1] : undefined
      // It just hinted at this spot: clicked now, it keeps its promise and talks about it.
      const promised = s.promise && s.promise.perch === s.perch && performance.now() < s.promise.until
      s.promise = null
      if (!lines || (!promised && Math.random() >= PERCH_LINE_CHANCE)) return null
      const fresh = lines.filter((l) => l !== s.perchLine)
      s.perchLine = pick(fresh.length ? fresh : lines)
      return s.perchLine
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

    if (reduceMotion && nameEl) {
      // Animations off: it just stands on your name.
      const span = spanOf(nameEl, heroEl)
      s.perch = nameEl
      fitTo(nameEl)
      s.x = (span.left + span.right) / 2
      s.y = span.top
      setMode('idle')
      place()
      // It stands still, so there's no gesture and no moving to a roomier spot: at most one
      // invite, only if the words fit where it stands.
      if (maxInvites > 0) {
        stillInviteTimer = window.setTimeout(function tryInvite() {
          const now = performance.now()
          if (inviteAllowed(now)) sayInvite(now, false)
          else if (!s.tapped) stillInviteTimer = window.setTimeout(tryInvite, INVITE_RETRY_MS)
        }, INVITE_GAPS[s.invites])
      }
    } else {
      setMode('boot', BOOT_MS)
      place()
      frame = requestAnimationFrame(tick)
    }

    function onPointerMove(event: PointerEvent) {
      s.lastPointer = performance.now()
      const r = heroEl.getBoundingClientRect()
      const inside = event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom
      // Only a mouse counts as a cursor near it: a finger's last touch would leave it dancing
      // (see wantDance in tick) without anything to say.
      s.pointer = inside && event.pointerType === 'mouse' ? { x: event.clientX - r.left, y: event.clientY - r.top } : null
      // Its eyes follow the mouse (in its own direction: the drawing is mirrored when it faces left).
      if (s.pointer && event.pointerType === 'mouse') {
        const sz = size()
        const lookX = clamp((s.pointer.x - s.x) / 160, -1, 1) * s.dir
        const lookY = clamp((s.pointer.y - (s.y - sz * 0.6)) / 160, -1, 1)
        robot.style.setProperty('--robot-look-x', lookX.toFixed(2))
        robot.style.setProperty('--robot-look-y', lookY.toFixed(2))
      } else {
        robot.style.setProperty('--robot-look-x', '0')
        robot.style.setProperty('--robot-look-y', '0')
      }
      // Waking up from standby: a quick scan to look around.
      if (s.mode === 'standby') setMode('scan', 600)
    }

    // A click right next to it (not on it) counts as a click on it. With a finger, a tap
    // that close is a tap that just missed it (it's small and moving): it counts as a tap on it.
    function onPointerDown(event: PointerEvent) {
      s.lastPointer = performance.now()
      const target = event.target instanceof Element ? event.target : null
      if (target?.closest('.hero-actions a')) s.engaged = true // going for the main content
      if (event.pointerType !== 'mouse') {
        s.lastTouch = performance.now()
        const onIt = !!target && robot.contains(target) && !target.closest('.robot__bubble')
        // Touch, bubble open: a tap anywhere else (the bubble too) closes it.
        // A tap on the robot goes on below: it dances and says its next sentence.
        if (s.talking && !onIt) {
          if (inTouchGrace()) return
          quiet()
          s.noTalkUntil = performance.now() + 450
          return
        }
        if (onIt) {
          // A finger on it: it dances and says something at the same moment, like hovering it
          // with a mouse. (It used to wait a moment to rule out a scroll, but the slightest finger
          // movement cancelled the joke, leaving a dance with no words.)
          s.danceUntil = performance.now() + TOUCH_DANCE_MS
          s.fingerDown = true
          s.pressTalkAt = performance.now()
          s.touchAt = performance.now()
          talk()
          return
        }
        // A near miss is a tap on it (it's small, and moves): a dance and a sentence too.
        const r = heroEl.getBoundingClientRect()
        if (Math.hypot(event.clientX - r.left - s.x, event.clientY - r.top - (s.y - size() / 2)) < NEAR_TAP) {
          s.danceUntil = performance.now() + TOUCH_DANCE_MS
          s.touchAt = performance.now()
          talk()
        }
        return
      }
      if (target && robot.contains(target)) return
      const r = heroEl.getBoundingClientRect()
      const distance = Math.hypot(event.clientX - r.left - s.x, event.clientY - r.top - (s.y - size() / 2))
      // Mouse: a click elsewhere closes its bubble too (not a stray one right after a touch).
      if (s.talking) {
        if (inTouchGrace()) return
        quiet()
        return
      }
      // A click that just missed it counts as a click on it (it never runs away from the mouse).
      if (distance < NEAR_TAP) talk()
    }

    // Its own click (mouse, keyboard, or the end of a tap).
    function click() {
      // The press already opened it: this click is the same tap, not a second one.
      if (performance.now() - s.pressTalkAt < PRESS_CLICK_GUARD_MS) return
      talk()
    }

    function talk() {
      if (s.mode === 'leave' || performance.now() < s.noTalkUntil) return
      // Tapped while booting up or flying: it answers once it has landed.
      if (s.mode === 'boot' || s.mode === 'jet') {
        s.talkAfterLanding = true
        return
      }
      s.talking = true
      // Clicked: no more invites. At most one reminder, once it's been a while since.
      s.tapped = true
      rememberRobotMet()
      hideInvite()
      window.clearTimeout(stillInviteTimer)
      s.nextInvite = performance.now() + REMINDER_AFTER_MS
      s.lastPointer = performance.now()
      // It stops while it talks, so its bubble stays put.
      if (['walk', 'standby', 'turn', 'wave', 'hop'].includes(s.mode)) setMode('idle')
      s.thenWalk = false
      setLine(perchLine() ?? nextLine())
      // The bubble opens toward the middle of the hero.
      setSide(s.x > heroEl.clientWidth / 2 ? 'right' : 'left')
      s.talkScrollY = window.scrollY
      window.clearTimeout(talkTimer)
      // It closes by itself after READ_MS (3s), with a mouse as on touch screens, even while the
      // mouse is still on it. It doesn't open again until the mouse leaves and comes back.
      // A finger still pressing it: the 3s start when it lifts (onPointerUp), as after a click.
      if (!s.fingerDown) talkTimer = window.setTimeout(quiet, READ_MS)
    }

    // The finger that opened a joke lifts (or the browser takes over the press, e.g. a long press):
    // now the joke's 3 seconds start. Before, they counted from the touch, so after holding the
    // robot to watch it dance, the joke vanished as soon as the finger came off.
    function onPointerUp(event: PointerEvent) {
      if (event.pointerType === 'mouse' || !s.fingerDown) return
      s.fingerDown = false
      // The click that follows this release is the same tap: it mustn't open another joke.
      s.pressTalkAt = performance.now()
      s.touchAt = performance.now()
      if (s.talking) {
        window.clearTimeout(talkTimer)
        talkTimer = window.setTimeout(quiet, READ_MS)
      }
    }

    // True for a moment after a finger opened a joke or lifted from it (TOUCH_GRACE_MS).
    function inTouchGrace() {
      return performance.now() - s.touchAt < TOUCH_GRACE_MS
    }

    // Closes its speech bubble (it goes back to what it was doing a moment later).
    function quiet() {
      window.clearTimeout(talkTimer)
      if (!s.talking) return
      s.talking = false
      setLine(null)
      s.until = performance.now() + 800
    }

    // Scrolling the page closes the bubble (a few pixels of jitter don't).
    function onScroll() {
      s.scrolledAt = performance.now()
      if (!s.talking) return
      // Right after a touch: a phone can nudge the page a little around a tap. Measure from here.
      if (inTouchGrace()) {
        s.talkScrollY = window.scrollY
        return
      }
      if (Math.abs(window.scrollY - s.talkScrollY) > SCROLL_CLOSE_PX) quiet()
    }

    // Hovering the buttons or social icons: it hops (now and then, not every time).
    function onPointerOver(event: PointerEvent) {
      if (event.pointerType !== 'mouse' || reduceMotion) return
      const target = event.target instanceof Element ? event.target : null
      if (!target?.closest('.hero-actions a')) return
      const now = performance.now()
      if (now - s.lastHoverHop < HOVER_HOP_GAP_MS || s.talking || now < s.inviteUntil) return
      if (s.wordsAt || s.wordsAfterWalk || s.wordsAfterLanding) return // on its way to an invite
      if (s.mode !== 'idle' && s.mode !== 'walk') return
      s.lastHoverHop = now
      gesture('hop')
    }

    // Saves battery: its loop stops while the hero is off screen or the tab is hidden.
    function pause() {
      paused = true
      cancelAnimationFrame(frame)
      frame = 0
    }
    function resume() {
      if (!paused || reduceMotion || s.mode === 'leave') return
      paused = false
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }

    // How much of the hero is on screen. A hero taller than the screen counts as fully in view
    // when it fills the screen. Coming back to it after being away: it waves hello.
    const io = new IntersectionObserver(
      ([entry]) => {
        const shown = entry.intersectionRect.height
        const visible = entry.isIntersecting ? shown / Math.min(entry.boundingClientRect.height, window.innerHeight) : 0
        const was = s.heroVisible
        s.heroVisible = visible
        // Scrolled away from the hero (on to the content): no more invites this visit.
        if (visible < 0.3 && was >= HERO_IN_VIEW) s.engaged = true
        if (visible >= HERO_IN_VIEW && was < HERO_IN_VIEW) {
          s.visibleSince = performance.now()
          if (was < 0.3 && !reduceMotion) s.greet = true
        }
        if (visible === 0) pause()
        else if (document.visibilityState === 'visible') resume()
      },
      { threshold: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1] },
    )
    io.observe(heroEl)

    function onVisibility() {
      if (document.visibilityState === 'hidden') pause()
      else if (s.heroVisible > 0) resume()
    }

    // The mouse on it: it dances (see tick).
    function onRobotEnter(event: PointerEvent) {
      if (event.pointerType !== 'mouse') return
      s.onRobot = true
      s.hoverTalked = false
      // A joke right away (talk() waits for landing if it's flying).
      if (!s.talking) {
        s.hoverTalked = true
        talk()
      }
    }
    function onRobotLeave(event: PointerEvent) {
      if (event.pointerType === 'mouse') s.onRobot = false
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    heroEl.addEventListener('pointerover', onPointerOver)
    robot.addEventListener('pointerenter', onRobotEnter)
    robot.addEventListener('pointerleave', onRobotLeave)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    window.addEventListener('pointercancel', onPointerUp, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })

    brain.current = {
      talk: click,
    }

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(talkTimer)
      window.clearTimeout(stillInviteTimer)
      io.disconnect()
      heroEl.removeEventListener('pointerover', onPointerOver)
      robot.removeEventListener('pointerenter', onRobotEnter)
      robot.removeEventListener('pointerleave', onRobotLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      window.clearTimeout(inviteOffTimer)
      window.removeEventListener('scroll', onScroll)
      brain.current = null
    }
  }, [])

  return (
    <div ref={rootRef} className="robot">
      {/* What it says. The bubble closes by itself (after 3s, scroll, pointer away, tap elsewhere),
          so it needs no buttons. */}
      {line && (
        <div className="robot__bubble" data-side={side}>
          <p role="status">{line}</p>
        </div>
      )}
      <span ref={markRef} className="robot__mark" aria-hidden="true" />
      {/* Its invite ("Good evening 👋" and friends): a small call above or beside it (see sayInvite). */}
      <span ref={inviteRef} className="robot__invite" aria-hidden="true" />
      <button
        type="button"
        className="robot__hit"
        aria-label="Tiny robot. Click or hover to hear what it says."
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
