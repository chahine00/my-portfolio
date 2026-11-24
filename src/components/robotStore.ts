// Where the tiny robot is (HeroRobot.tsx), shared with the hero (Hero.tsx).
// Everything is kept in memory only, so a reload starts over.
//
// The robot's steps:
// 1. At home in the hero's picture (RobotPerch.tsx): on the home page's "status: live" pill or the
//    studio board, on the founder's "<Welcome />" bubble or the night desk. It patrols there with a
//    "click me!" tag.
// 2. A moment later it comes out BY ITSELF: it boots up, flies out into the hero, and plays there
//    (it stays in the hero). Clicking it at home brings it out right away.
// Its "×" beams it back home. Then it was "dismissed": it stays there (patrolling, with a "click me!"
// tag) and only comes out again when clicked or tapped. A reload starts over.

import { useSyncExternalStore } from 'react'

const CHANGE_EVENT = 'robot:change'

let home = true // at home in the picture (step 1); false while it's out in the hero
let dismissed = false // sent home with its "×": it waits for a click instead of coming out by itself
let origin: DOMRect | null = null // where it comes out from (the robot on the welcome box)

function changed() {
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => window.removeEventListener(CHANGE_EVENT, onChange)
}

// True while the robot is at home in the picture. Components using this re-draw when it changes.
export function useRobotHome() {
  return useSyncExternalStore(subscribe, () => home, () => true)
}

// True once its "×" sent it home: it then waits there for a click.
export function useRobotDismissed() {
  return useSyncExternalStore(subscribe, () => dismissed, () => false)
}

export function isRobotDismissed() {
  return dismissed
}

// It comes out (by itself after a moment, or clicked at home). `from` is where it's standing, so
// it starts right there.
export function callRobotOut(from: DOMRect | null) {
  home = false
  dismissed = false
  origin = from
  changed()
}

// Beams it back home (its "×"), once its goodbye animation is over. It won't come out by itself
// again until the page is reloaded; a click at home still brings it out.
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
