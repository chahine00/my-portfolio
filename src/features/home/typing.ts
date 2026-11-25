// The home hero's typing line: types each phrase, waits, deletes it, then moves to the next one.
import { useEffect, useState } from 'react'
import { profile } from '../../data/profile.ts'

// Types each phrase from profile.building, waits, deletes it, then moves to the next one.
// Returns the text typed so far.
// enabled: false when there's no code line to type (the founder's hero), so nothing runs.
export function useTypingLoop(phrases: string[], enabled = true) {
  // People who turn off animations just see the first phrase, already written.
  const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [text, setText] = useState(reduceMotion ? phrases[0] : '')

  useEffect(() => {
    if (reduceMotion || !enabled) return

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
  }, [phrases, reduceMotion, enabled])

  return text
}

// The longest phrase, used to reserve room for the typing line.
export const longestPhrase = profile.building.reduce((a, b) => (b.length > a.length ? b : a))
