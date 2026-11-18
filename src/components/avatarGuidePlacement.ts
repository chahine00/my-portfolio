// Where the avatar guide (AvatarGuide.tsx) comes out in a section, without covering anything.
//
// Each section can choose its own spot in src/data/guide.ts: which post (card) it's next to,
// whether it peeks over that post's top edge or stands beside it, and where along it. That spot
// is tried first; if it would cover any text, picture, button or card (for example on a phone,
// where the layout is different), the spots closest to it are tried, and then, as a fallback,
// the free space above the section's heading.
//
// The avatar rises from behind an "edge": the top of a post (it peeks over it), or the line of
// a post's bottom, next to it (it stands beside it). Its bubble goes on its left, right, or above.
//
// Positions come from the page layout (offsetTop/offsetLeft), not from what's on screen, so a
// card lifting on hover (or a reveal animation) never moves the avatar: it's the same spot every
// time, whatever the mouse does.

import type { GuideTip } from '../data/guide.ts'

export type Side = 'left' | 'right' | 'above'

export interface Placement {
  anchor: HTMLElement // the post (or heading) it's attached to
  edge: 'top' | 'bottom' // it rises from that element's top edge, or from the line of its bottom
  dx: number // the avatar's left, from the anchor's left
  rise: number // how much of it comes out (its full height, or a bit less)
  side: Side // where the bubble is
  bubbleWidth: number // the bubble's max width (narrower → more lines, so it fits on phones)
  reach: number // how far above the edge the avatar and bubble go, together
  // In the bottom-left corner of the screen instead of on a post (see dockSpot): for when you're
  // deep in a section and no post has free space next to it on screen.
  dock?: boolean
}

interface Box {
  l: number
  t: number
  r: number
  b: number
}

const STEP = 24 // how far apart the spots tried along an edge are
const GAP = 4 // the empty space kept around texts and cards
const MARGIN = 8 // the space kept from the screen's left and right edges
const HAND = 0.25 // the waving hand sticks out on the left by this much of the avatar's width
const BESIDE_GAP = 16 // between a post and the avatar standing beside it
const DOCK_CLEAR = 10 // the space kept between the corner spot's bubble and the back-to-top button
const DOCK_MIN_BUBBLE = 150 // narrower than this beside the avatar → the bubble goes above it instead
const PHONE_MAX = 720 // up to this width, a tip's "phone" spot is used (same breakpoint as --guide-w in global.css)

// Same numbers as the bubble's position in global.css ("avatar guide").
const BUBBLE_GAP = 8 // between the avatar (or its hand) and the bubble
const BUBBLE_LIFT = 0.25 // the bubble's bottom, as a share of how much the avatar came out
const BUBBLE_ABOVE = 10 // between the avatar's head and the bubble when it's above

// The bubble widths tried, widest first (fewer lines). Narrower ones fit in tighter spots.
const BUBBLE_WIDTHS = [300, 260, 230, 200, 180]

const overlaps = (a: Box, b: Box) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b

// The avatar's size, from the CSS variables on :root (it's smaller on phones).
export function guideSize() {
  const style = getComputedStyle(document.documentElement)
  return {
    width: parseFloat(style.getPropertyValue('--guide-w')) || 104,
    height: parseFloat(style.getPropertyValue('--guide-h')) || 150,
  }
}

// An element's box on the page from the layout only: hover lifts and other transforms don't
// change it.
export function pageBox(el: HTMLElement): Box {
  let l = 0
  let t = 0
  for (let e: HTMLElement | null = el; e; e = e.offsetParent as HTMLElement | null) {
    l += e.offsetLeft
    t += e.offsetTop
  }
  return { l, t, r: l + el.offsetWidth, b: t + el.offsetHeight }
}

// Where the spot's edge is on the page.
export function edgeOf(spot: Placement) {
  const box = pageBox(spot.anchor)
  return { x: box.l, y: spot.edge === 'top' ? box.t : box.b }
}

// Everything that must stay visible in these parts of the page, as page boxes: each line of
// text, pictures, buttons and fields, and anything drawn as a box (a background or a border).
// Only the part of an element that can be seen counts: a parent with overflow hidden (a card
// with a blurred cover picture, a scan line sliding through it…) cuts off the rest.
function obstacles(roots: Element[]): Box[] {
  const boxes: Box[] = []
  const clips = new Map<Element, DOMRect | null>()
  const clipOf = (el: Element) => {
    if (!clips.has(el)) {
      const style = getComputedStyle(el)
      const clipped = style.overflowX !== 'visible' || style.overflowY !== 'visible'
      clips.set(el, clipped ? el.getBoundingClientRect() : null)
    }
    return clips.get(el)
  }
  const add = (r: DOMRect, el?: Node) => {
    let { left, top, right, bottom } = r
    for (let parent = el?.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
      const clip = clipOf(parent)
      if (!clip) continue
      left = Math.max(left, clip.left)
      top = Math.max(top, clip.top)
      right = Math.min(right, clip.right)
      bottom = Math.min(bottom, clip.bottom)
    }
    if (right - left < 1 || bottom - top < 1) return
    boxes.push({
      l: left + scrollX - GAP,
      t: top + scrollY - GAP,
      r: right + scrollX + GAP,
      b: bottom + scrollY + GAP,
    })
  }
  for (const root of roots) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    const range = document.createRange()
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent?.trim()) continue
      range.selectNodeContents(node)
      for (const rect of range.getClientRects()) add(rect, node)
    }
    for (const el of root.querySelectorAll('*')) {
      if (el.closest('.avatar-guide, .sr-only')) continue
      if (/^(IMG|SVG|VIDEO|CANVAS|PICTURE|IFRAME|INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName.toUpperCase())) {
        add(el.getBoundingClientRect(), el)
        continue
      }
      const style = getComputedStyle(el)
      const painted =
        (style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent') ||
        style.backgroundImage !== 'none' ||
        parseFloat(style.borderTopWidth) > 0 ||
        parseFloat(style.borderBottomWidth) > 0
      if (painted && style.visibility !== 'hidden') add(el.getBoundingClientRect(), el)
    }
  }
  return boxes
}

// The bubble's size for this sentence at each of the widths tried.
const bubbleSizes = new Map<string, { max: number; w: number; h: number }[]>()

function measureBubble(text: string) {
  const known = bubbleSizes.get(text)
  if (known) return known
  const box = document.createElement('div')
  box.className = 'avatar-guide-measure'
  const bubble = document.createElement('div')
  bubble.className = 'avatar-guide__bubble'
  const p = document.createElement('p')
  p.textContent = text
  bubble.append(p)
  box.append(bubble)
  document.body.append(box)
  // offsetWidth/Height ignore the bubble's pop-in scale, so this is its real size.
  const sizes = BUBBLE_WIDTHS.map((max) => {
    bubble.style.maxWidth = `${max}px`
    return { max, w: bubble.offsetWidth, h: bubble.offsetHeight }
  })
  box.remove()
  bubbleSizes.set(text, sizes)
  return sizes
}

// The bubble's page box when the avatar's left is at x and the edge it rises from is at y.
function bubbleBox(side: Side, x: number, y: number, rise: number, width: number, size: { w: number; h: number }): Box {
  if (side === 'above') {
    const b = y - rise - BUBBLE_ABOVE
    return { l: x + width - size.w, t: b - size.h, r: x + width, b }
  }
  const b = y - rise * BUBBLE_LIFT
  if (side === 'left') {
    const r = x - width * HAND - BUBBLE_GAP
    return { l: r - size.w, t: b - size.h, r, b }
  }
  const l = x + width + BUBBLE_GAP
  return { l, t: b - size.h, r: l + size.w, b }
}

// The x positions to try along an edge, from "from" to "to" (the avatar's left), best first:
// starting at the chosen alignment and moving away from it.
function xsAlong(from: number, to: number, align: 'left' | 'center' | 'right') {
  if (to < from) return []
  const start = align === 'left' ? from : align === 'right' ? to : (from + to) / 2
  const xs: number[] = []
  for (let d = 0; start - d >= from || start + d <= to; d += STEP) {
    if (start + d <= to) xs.push(start + d)
    if (d > 0 && start - d >= from) xs.push(start - d)
  }
  return xs.map(Math.round)
}

// All the spots in a section where the avatar fits without covering anything, best first.
// If the section's chosen spot (or one near it along the same post) fits, only that one; else
// the space above its heading and first blocks. At most one per edge and height, which is all
// fitsOnScreen needs.
export function findPlacements(section: HTMLElement, tip: GuideTip): Placement[] {
  const { width, height } = guideSize()
  const viewWidth = document.documentElement.clientWidth
  const roots = [section.previousElementSibling, section].filter((el): el is Element => !!el)
  const blocked = obstacles(roots)
  const sizes = measureBubble(tip.text)
  const sectionBox = pageBox(section)
  const sectionStyle = getComputedStyle(section)
  const contentRight = sectionBox.r - parseFloat(sectionStyle.paddingRight)

  // The edges to try, best first.
  const edges: { anchor: HTMLElement; edge: 'top' | 'bottom'; from: number; to: number; align: 'left' | 'center' | 'right'; sides: Side[] }[] = []
  const sides: Side[] = ['left', 'above', 'right']
  // Phones have their own spot when the section sets one (the layout is one column there).
  const spot = tip.phone && window.matchMedia(`(max-width: ${PHONE_MAX}px)`).matches ? tip.phone : tip
  // The chosen post first, then the section's other posts of the same kind after it (the ones
  // further down), so scrolling quickly past the chosen one still finds a post on screen to come
  // out at (a long section like Projects).
  const matches = spot.anchor ? [...section.querySelectorAll<HTMLElement>(spot.anchor)] : []
  const first = spot.index ?? 0
  const chosen = matches[first]
  const posts = chosen ? [chosen, ...matches.slice(first + 1)] : []
  const preferred = spot.bubble ? [spot.bubble, ...sides.filter((s) => s !== spot.bubble)] : sides
  for (const post of posts) {
    const box = pageBox(post)
    if (spot.edge === 'beside') {
      // Standing in the empty space on the post's right, on the line of its bottom.
      const from = box.r + BESIDE_GAP + width * HAND
      edges.push({ anchor: post, edge: 'bottom', from, to: contentRight - width, align: 'left', sides: preferred })
    } else {
      edges.push({ anchor: post, edge: 'top', from: box.l + width * HAND + 12, to: box.r - width - 12, align: spot.align ?? 'right', sides: preferred })
    }
  }
  const postEdges = edges.length
  // The fallback: above the heading and the first few blocks.
  for (const el of [...section.children].slice(0, 4)) {
    if (!(el instanceof HTMLElement) || !el.offsetHeight) continue
    const box = pageBox(el)
    edges.push({ anchor: el, edge: 'top', from: box.l + width * HAND, to: box.r - width - 16, align: 'right', sides })
  }

  const found: Placement[] = []
  for (const [i, { anchor, edge, from, to, align, sides }] of edges.entries()) {
    // The section's chosen posts fit at this screen size: use only those (it waits for one to
    // be on screen), instead of whichever fallback reaches the screen first.
    if (postEdges && i === postEdges && found.length) break
    const box = pageBox(anchor)
    const y = edge === 'top' ? box.t : box.b
    for (const rise of [height, Math.round(height * 0.8)]) {
      search: for (const x of xsAlong(from, to, align)) {
        // The avatar, from its hand to its right side, down to just above the edge.
        const avatar: Box = { l: x - width * HAND, t: y - rise, r: x + width, b: y - 2 * GAP }
        if (avatar.l < scrollX + MARGIN || avatar.r > scrollX + viewWidth - MARGIN) continue
        if (blocked.some((b) => overlaps(avatar, b))) continue
        for (const side of sides) {
          for (const size of sizes) {
            const bubble = bubbleBox(side, x, y, rise, width, size)
            if (bubble.l < scrollX + MARGIN || bubble.r > scrollX + viewWidth - MARGIN) continue
            if (blocked.some((b) => overlaps(bubble, b))) continue
            const reach = y - Math.min(avatar.t, bubble.t)
            found.push({ anchor, edge, dx: x - box.l, rise, side, bubbleWidth: size.max, reach })
            break search
          }
        }
      }
    }
  }
  return found
}

// True when this spot is fully on screen now: everything below the navbar, and the edge it
// rises from no lower than "lowest" (a share of the screen's height).
export function fitsOnScreen(spot: Placement, navBottom: number, lowest: number) {
  const y = edgeOf(spot).y - scrollY
  return y - spot.reach >= navBottom + MARGIN && y <= window.innerHeight * lowest
}

// The corner spot: the avatar rises from the bottom-left corner of the screen. It's used when
// you've scrolled into the middle of a section (you skipped its title) and none of its posts has
// free space on screen, which is common on phones, where the posts are stacked with little room
// between them.
// The bubble goes on its right, but stops before the back-to-top button (bottom right), so the
// two never overlap. If that leaves too little room (a narrow phone), it goes above the avatar.
export function dockSpot(section: HTMLElement): Placement {
  const { width, height } = guideSize()
  const viewWidth = document.documentElement.clientWidth
  // The avatar's left, from the screen's left edge: the waving hand sticks out past it, so that's
  // the hand plus a margin (same as .avatar-guide[data-dock] in global.css).
  const side = width * HAND + MARGIN
  // The button keeps its place while hidden, so its left edge is known either way.
  const button = document.querySelector('.back-to-top')?.getBoundingClientRect()
  const end = Math.min(viewWidth - MARGIN, button && button.width ? button.left - DOCK_CLEAR : Infinity)
  const room = end - (side + width + BUBBLE_GAP)
  if (room >= DOCK_MIN_BUBBLE) {
    const bubbleWidth = Math.min(BUBBLE_WIDTHS[0], Math.floor(room))
    return { anchor: section, edge: 'bottom', dx: 0, rise: height, side: 'right', bubbleWidth, reach: height, dock: true }
  }
  // Above its head, starting at its hand: from near the screen's left edge to the button.
  const bubbleWidth = Math.min(BUBBLE_WIDTHS[0], Math.floor(end - MARGIN))
  return { anchor: section, edge: 'bottom', dx: 0, rise: height, side: 'above', bubbleWidth, reach: height, dock: true }
}
