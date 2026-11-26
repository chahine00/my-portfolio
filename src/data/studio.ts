// The home page's pillars section (About.tsx), right under the hero: just the label and the title,
// so the hero's engine leads straight into the honeycomb (what Axihex is, in words, opens the
// Studio page: studioLead in src/data/identity.ts). Also read by the build
// (scripts/prerender.ts), which writes this text into the page's HTML for search engines, so both
// always say the same thing.
export const studio = {
  eyebrow: 'Inside Axihex',
  // The pillars, capabilities and the rest of the identity live in src/data/identity.ts.
  pillarsTitle: 'Five pillars.',
  pillarsAccent: 'One studio.',
  // The one line about who is behind it, under Selected work (Projects.tsx), with a quiet link to
  // the founder's page (/background).
  founderNote: 'Born from a passion for computers.',
  founderLink: 'Meet the founder',
}
