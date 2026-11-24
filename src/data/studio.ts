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
  text: 'Axihex brings engineering, experimentation, and product thinking together to turn ideas into useful technology.',
  // The studio's principles, in order. Keep each note to a few words.
  principles: [
    { word: 'Explore', note: 'Ideas worth solving', icon: 'compass' as IconName },
    { word: 'Build', note: 'Software that works', icon: 'layers' as IconName },
    { word: 'Share', note: 'Knowledge & tools', icon: 'share' as IconName },
  ],
  behindTitle: 'Behind Axihex',
  behind: [
    'Axihex is a software studio rooted in real engineering experience: robust backends, practical AI, mobile apps people use every day, and the cloud that keeps it all running.',
    "From enterprise systems to real-world applications, that experience shapes how we approach ideas, build products, and explore what's next.",
  ],
  // The founder card under it (no name here: the home page stays about Axihex).
  founderCard: {
    title: 'Meet the founder.',
    text: 'Software engineer with experience across backend systems, AI integration, mobile development, and cloud infrastructure.',
    link: 'Experience & CV',
  },
}
