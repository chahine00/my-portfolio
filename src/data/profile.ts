// Who you are, in a few words. Used by the hero at the top of the home page.
// Keep everything short: visitors scan, they don't read.

export const profile = {
  name: 'Ali Chahine',
  // The studio this site belongs to: shown in the navbar, the tab title and the footer.
  brand: 'Axihex',
  site: 'https://axihex.com',
  // The small label above the hero's headline: what Axihex is.
  role: 'Independent software studio',
  // The hero's headline. The words in "headlineAccent" are shown in the accent gradient. What Axihex
  // does, products first; the Axihex engine under it (ideas in, products out) is the "how".
  headline: 'We build',
  headlineAccent: 'what’s next.',
  // The founder line at the bottom of the hero.
  founderTitle: 'Software Engineer',
  location: 'Beirut, Lebanon',
  // The founder's page (/background): a short status line with a pulsing dot, for recruiters and
  // companies. Set to '' to hide it. (The home page has no status line.)
  founderAvailability: 'Open to engineering opportunities',
  // The founder's picture in /public: the 3D avatar, on a transparent background so it suits light
  // AND dark mode. Shown on the founder card (Studio section) and the /background page, not in the
  // hero (the hero shows the Axihex mark). Also the person's image in the structured data.
  photo: '/avatar.webp',
  // Typed out one by one under the home page's headline, like code being written. Keep each one short.
  // It answers the headline ("We build what's next."): the kinds of things Axihex builds, our own
  // products first, ending with the visitor's idea. Not the tech stack (the intro already names it).
  building: [
    'products of our own',
    'mobile apps',
    'online tools',
    'games',
    'AI-powered features',
    'your idea',
  ],
  // The night desk (RobotLab.tsx): shown in the hero instead of the avatar every other time a
  // visitor comes back to the top. Set to false to always show the avatar.
  lab: true,
}

// The small numbers in the Experience section.
export const stats = [
  { value: '3+', label: 'years experience' },
  { value: '2', label: 'companies' },
  { value: '4', label: 'roles' },
]
