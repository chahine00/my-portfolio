// Remembers whether the visitor sent the rubber duck home (RubberDuck.tsx), and lets the footer
// bring it back. Only for this page load: a reload (on phones and computers) brings the duck back.

import { useSyncExternalStore } from 'react'

const CHANGE_EVENT = 'duck:change'

// Kept in memory only, so it resets whenever the page is reloaded.
let home = false

export function isDuckHome() {
  return home
}

// The page reacts after `delayMs` (time for the goodbye animation).
export function setDuckHome(value: boolean, delayMs = 0) {
  window.setTimeout(() => {
    home = value
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, delayMs)
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => window.removeEventListener(CHANGE_EVENT, onChange)
}

// True while the duck is at home (hidden). Components using this re-draw when it changes.
export function useDuckHome() {
  return useSyncExternalStore(subscribe, isDuckHome, () => false)
}

// The duck only shows up once the visitor has discovered the welcome drawing behind the profile
// photo (hover it, touch it on a phone, or use "back to top"): when the "<Welcome />" bubble has
// typed its word, the duck pops out of the bubble (Hero.tsx calls releaseDuck). Per page load.
let released = false
let origin: DOMRect | null = null // where it pops out: the welcome bubble, on screen

export function releaseDuck(from: DOMRect) {
  if (released) return
  released = true
  origin = from
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function isDuckReleased() {
  return released
}

// Where it pops out from (read once by the duck when it appears).
export function duckOrigin() {
  return origin
}

export function useDuckReleased() {
  return useSyncExternalStore(subscribe, isDuckReleased, () => false)
}

// Calm or exploring: a new visit starts calm; a click on the duck lets it explore, for this visit.
const EXPLORE_KEY = 'duck-explore'

export function isDuckExploring() {
  try {
    return sessionStorage.getItem(EXPLORE_KEY) === '1'
  } catch {
    return false
  }
}

export function setDuckExploring() {
  try {
    sessionStorage.setItem(EXPLORE_KEY, '1')
  } catch {
    // storage blocked: it explores until the page is reloaded
  }
}
