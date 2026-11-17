// Where the tiny robot is (HeroRobot.tsx), shared with the hero (Hero.tsx).
// Everything is kept in memory only, so a reload starts over.
//
// The robot's steps:
// 1. At home on the "<Welcome />" box of the drawing behind the profile photo: it pops up there
//    once the box has typed its word, and patrols along it. It doesn't leave by itself.
// 2. Clicked (or tapped) there: it boots up and flies out into the hero, and stays in the hero.
// Its "×" beams it back home to the welcome box (step 1).

import { useSyncExternalStore } from 'react'

const CHANGE_EVENT = 'robot:change'

let home = true // on the welcome box (step 1); false while it's out in the hero
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

// Clicked on the welcome box: it comes out. `from` is where it's standing, so it starts right there.
export function callRobotOut(from: DOMRect | null) {
  home = false
  origin = from
  changed()
}

// Beams it back home (its "×"), once its goodbye animation is over.
export function sendRobotHome() {
  home = true
  changed()
}

// Where it comes out from (read once by the robot when it appears).
export function robotOrigin() {
  return origin
}
