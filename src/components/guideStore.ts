// Whether the avatar guide (AvatarGuide.tsx) is turned off.
//
// - The small × on the guide's bubble (shown on hover, or after a first tap on phones) sends it away for
//   that section only.
// - Closing it with the × CLOSE_LIMIT times turns it off completely, until the page is reloaded.
//   It's kept in memory only, so a reload (or a new visit) starts with the guide again.

import { useSyncExternalStore } from 'react'

const CHANGE_EVENT = 'guide:change'
const CLOSE_LIMIT = 2

let off = false
let closes = 0

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => window.removeEventListener(CHANGE_EVENT, onChange)
}

export const isGuideOff = () => off

// True once the guide is turned off. Components using this re-draw when it changes.
export function useGuideOff() {
  return useSyncExternalStore(subscribe, () => off, () => false)
}

// The guide was closed with its ×.
export function guideClosed() {
  closes += 1
  if (closes >= CLOSE_LIMIT && !off) {
    off = true
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }
}
