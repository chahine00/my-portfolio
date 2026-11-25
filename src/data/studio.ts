import type { IconName } from '../components/iconNames.ts'

// The proof strip under the home hero's buttons: where the work has actually shipped (Cinetwork
// is live on all three). Keep it true: only places it's live.
export const proof: { icon: IconName; label: string }[] = [
  { icon: 'smartphone', label: 'App Store' },
  { icon: 'smartphone', label: 'Google Play' },
  { icon: 'globe', label: 'Web' },
]

// The home page's Studio section (About.tsx). Also read by the build (scripts/prerender.ts), which
// writes this text into the page's HTML for search engines, so both always say the same thing.

export const studio = {
  eyebrow: 'The Studio',
  // One short paragraph: how Axihex thinks: catching opportunities at the right time (like the
  // Studio page's process). The hero already says what it does (opportunity → products), so don't repeat that here.
  text: 'Good ideas have a moment. We watch for rising demand, move fast when the timing is right, and build software solid enough to make the most of it. Some products run for a season, others for years. Founder-led, and never tied to one tool or framework.',
  // The pillars, capabilities and the rest of the identity live in src/data/identity.ts.
  pillarsTitle: 'Five pillars.',
  pillarsAccent: 'One studio.',
  // The one line about who is behind it, with a quiet link to the founder's page (/background).
  founderNote: 'Born from a passion for creating digital things.',
  founderLink: 'Meet the founder',
}
