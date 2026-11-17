// Where the rubber duck is (RubberDuck.tsx), shared with the hero (Hero.tsx) and the footer.
// Everything is kept in memory only, so a reload (on phones and computers) starts over.
//
// The duck's steps:
// 1. At home on the "<Welcome />" box: it pops up there once the welcome drawing behind the
//    profile photo has typed its word, and walks a little along the box. It doesn't leave by itself.
// 2. Hovered or clicked there: it hops out onto your name, then explores the whole website.
// Its "×" sends it back home to the welcome box (step 1). The footer can also call it back out.

import { useSyncExternalStore } from 'react'

const CHANGE_EVENT = 'duck:change'

let home = true // on the welcome box (step 1); false once it's out on the page
let wasOut = false // it has been out at least once (then the footer offers to bring it back)
let origin: DOMRect | null = null // where it comes out from (the duck on the welcome box)

function changed() {
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => window.removeEventListener(CHANGE_EVENT, onChange)
}

export function isDuckHome() {
  return home
}

// True while the duck is at home on the welcome box. Components using this re-draw when it changes.
export function useDuckHome() {
  return useSyncExternalStore(subscribe, isDuckHome, () => true)
}

// True when the footer should offer "Bring the duck back": it was out, and got sent home.
export function useDuckSentHome() {
  return useSyncExternalStore(subscribe, () => home && wasOut, () => false)
}

// Sends it home (its "×"). The page reacts after `delayMs` (time for the goodbye animation).
export function sendDuckHome(delayMs = 0) {
  window.setTimeout(() => {
    home = true
    changed()
  }, delayMs)
}

// Hovered or clicked on the welcome box (or called back from the footer): it comes out.
// `from` is where it's sitting, so it appears right there; without it, it drops in from the top.
export function callDuckOut(from: DOMRect | null) {
  home = false
  wasOut = true
  origin = from
  exploring = true // out of the box, it's free to explore the whole website right away
  changed()
}

// Where it comes out from (read once by the duck when it appears).
export function duckOrigin() {
  return origin
}

// Exploring the whole website (true as soon as it's out of the box). RubberDuck.tsx still has a
// calm, hero-only mode for when this is false; it isn't used at the moment.
let exploring = false

export function isDuckExploring() {
  return exploring
}

export function setDuckExploring() {
  exploring = true
}
