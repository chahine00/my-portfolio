// Where the tiny robot is (HeroRobot.tsx), shared with the hero (Hero.tsx).
// Everything is kept in memory only, so a reload starts over.
//
// The robot's steps:
// 1. At home on the "<Welcome />" box of the drawing behind the profile photo: it pops up there
//    once the box has typed its word.
// 2. A moment later it comes out BY ITSELF: it boots up, flies out into the hero, and plays there
//    (it stays in the hero).
// Its "×" beams it back home to the welcome box. Then it was "dismissed": it stays on the box
// (patrolling, with a "click me!" tag) and only comes out again when clicked or tapped there.
// A reload starts over (it comes out by itself again).

import { useSyncExternalStore } from 'react'

const CHANGE_EVENT = 'robot:change'

let home = true // on the welcome box (step 1); false while it's out in the hero
let dismissed = false // sent home with its "×": it waits for a click instead of coming out by itself
let origin: DOMRect | null = null // where it comes out from (the robot on the welcome box)

function changed() {
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => window.removeEventListener(CHANGE_EVENT, onChange)
}

// True while the robot is at home on the welcome box. Components using this re-draw when it changes.
export function useRobotHome() {
  return useSyncExternalStore(subscribe, () => home, () => true)
}

// True once its "×" sent it home: it then waits on the welcome box for a click.
export function useRobotDismissed() {
  return useSyncExternalStore(subscribe, () => dismissed, () => false)
}

export function isRobotDismissed() {
  return dismissed
}

// It comes out (by itself after the welcome, or clicked on the welcome box). `from` is where it's
// standing on the box, so it starts right there.
export function callRobotOut(from: DOMRect | null) {
  home = false
  dismissed = false
  origin = from
  changed()
}

// Beams it back home (its "×"), once its goodbye animation is over. It won't come out by itself
// again until the page is reloaded; a click on the welcome box still brings it out.
export function sendRobotHome() {
  home = true
  dismissed = true
  changed()
}

// Where it comes out from (read once by the robot when it appears).
export function robotOrigin() {
  return origin
}

// A robot was clicked once (hero or footer): remembered while you move around the site, so
// coming back to the home page doesn't start its invites over. In memory only, like the rest of
// this file: a reload starts over, and the robots invite again.
let met = false
export function robotMet() {
  return met
}
export function rememberRobotMet() {
  met = true
}
