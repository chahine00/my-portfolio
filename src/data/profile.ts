// Who you are, in a few words. Used by the hero at the top of the home page.
// Keep everything short: visitors scan, they don't read.

export const profile = {
  name: 'Ali Chahine',
  role: 'Software Engineer',
  location: 'Beirut, Lebanon',
  availability: 'Open for opportunities', // set to '' to hide it
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
  // The robot's lab (RobotLab.tsx): shown in the hero instead of the avatar every other time a
  // visitor comes back to the top. Set lines to [] to always show the avatar.
  lab: {
    // Typed in the terminal, one after another. Keep each line under ~26 characters (it's small).
    // A line starting with "✓" turns green once typed.
    lines: ['$ ali --status', '› backend  APIs · DBs', '› mobile   iOS · Android', '› ai       LLM · RAG', '✓ all systems online'],
    // The nodes wired to the robot. Six fit best; keep the names short.
    stack: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker'],
  },
}

// The small numbers in the About section.
export const stats = [
  { value: '3+', label: 'years experience' },
  { value: '2', label: 'companies' },
  { value: '4', label: 'roles' },
]
