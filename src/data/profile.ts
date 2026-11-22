// Who you are, in a few words. Used by the hero at the top of the home page.
// Keep everything short: visitors scan, they don't read.

export const profile = {
  name: 'Ali Chahine',
  // The studio this site belongs to: shown in the navbar, the tab title and the footer.
  brand: 'Axihex',
  site: 'https://axihex.com',
  role: 'Software Engineer · Building Axihex',
  // One or two sentences under your name in the hero.
  intro: "I'm Ali Chahine, the software engineer behind Axihex. I design and build thoughtful digital solutions, from idea to implementation.",
  location: 'Beirut, Lebanon',
  availability: 'Open to opportunities & software projects', // set to '' to hide it
  // Your picture in /public: the 3D avatar, on a transparent background so it suits light AND
  // dark mode. WebP (77 KB instead of the 670 KB PNG it was made from), so it loads fast. Its
  // outline also cuts your silhouette out of the welcome drawing, so the drawing stays behind you.
  photo: '/avatar.webp',
  // Typed out one by one under your name, like code being written. Keep each one short.
  building: [
    'secure APIs & databases',
    'cross-platform mobile apps',         // Focus on business/internal use
    'LLM & RAG features',
    'web apps, end to end'
  ],
  // The night desk (RobotLab.tsx): shown in the hero instead of the avatar every other time a
  // visitor comes back to the top. Set to false to always show the avatar.
  lab: true,
}

// The small numbers in the About section.
export const stats = [
  { value: '3+', label: 'years experience' },
  { value: '2', label: 'companies' },
  { value: '4', label: 'roles' },
]
