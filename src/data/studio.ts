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
  title: 'Small studio.',
  titleAccent: 'Serious engineering.', // in the accent gradient
  // One short paragraph: what Axihex does, for whom. The details are on the Studio page (/studio).
  text: 'Axihex is a founder-led software studio. We explore ideas, develop products of our own, and engineer web, mobile, backend, AI and cloud software for clients.',
  // The pillars, capabilities and the rest of the identity live in src/data/identity.ts.
  pillarsTitle: 'Five pillars.',
  pillarsAccent: 'One studio.',
  // The one line about who is behind it, with a quiet link to the founder's page (/background).
  founderNote: 'Born from a passion for creating digital things.',
  founderLink: 'Meet the founder',
}
