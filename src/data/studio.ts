import type { IconName } from '../components/iconNames.ts'

// The proof strip under the home hero's buttons: where the work has actually shipped (The CI
// Network is live on all three; everything runs on AWS). Keep it true: only places it's live.
export const proof: { icon: IconName; label: string }[] = [
  { icon: 'smartphone', label: 'App Store' },
  { icon: 'smartphone', label: 'Google Play' },
  { icon: 'globe', label: 'Web' },
  { icon: 'cloud', label: 'AWS' },
]

// The home page's Studio section (About.tsx). Also read by the build (scripts/prerender.ts), which
// writes this text into the page's HTML for search engines, so both always say the same thing.

export const studio = {
  eyebrow: 'The Studio',
  title: 'Ideas deserve to be',
  titleAccent: 'built.', // in the accent gradient
  text: 'Axihex is an independent, founder-led software studio. It brings engineering, experimentation, and product thinking together to turn ideas into useful technology, for its own products and for clients.',
  // The pillars, capabilities and the rest of the identity live in src/data/identity.ts.
  pillarsTitle: 'Five pillars.',
  pillarsAccent: 'One studio.',
  behindTitle: 'Behind Axihex',
  behind: [
    'Axihex is rooted in real engineering experience: robust backends, practical AI, mobile apps people use every day, and the cloud that keeps it all running.',
    'Founder-led today and open to collaboration: Axihex grows through real work and real relationships, not an artificial impression of size.',
  ],
  // The founder card under it (no name here: the home page stays about Axihex). "availability":
  // running a studio doesn't mean the founder isn't open to a role, so it says so.
  founderCard: {
    title: 'Meet the founder.',
    text: 'The engineering behind the studio: backend systems, AI integration, mobile development, and cloud infrastructure.',
    availability: 'Open to engineering opportunities',
    link: 'Experience & CV',
  },
}
