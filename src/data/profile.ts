// Who you are, in a few words. Used by the hero at the top of the home page.
// Keep everything short: visitors scan, they don't read.

export const profile = {
  name: 'Ali Chahine',
  role: 'Software Engineer',
  location: 'Beirut, Lebanon',
  availability: 'Open for opportunities', // set to '' to hide it
  // Your photo in /public, e.g. '/photo.jpg'. Until you add one, your initials are shown.
  // Now your 3D avatar, already on a transparent background, so it suits light AND dark mode.
  photo: '/avatar.png',
  // The same picture with its background removed (transparent), shown in dark mode, because a
  // white background looks like a grey block on the dark page. It also cuts your silhouette out
  // of the welcome drawing, so the drawing stays behind you. '' = use "photo" in both.
  photoDark: '/avatar.png',
  // Typed out one by one under your name, like code being written. Keep each one short.
  building: [
    'secure APIs & databases',
    'cross-platform mobile apps',         // Focus on business/internal use
    'LLM & RAG features',
    'web apps, end to end'
  ]}

// The small numbers in the About section.
export const stats = [
  { value: '3+', label: 'years experience' },
  { value: '2', label: 'companies' },
  { value: '4', label: 'roles' },
]
