// Who you are, in a few words. Used by the hero at the top of the home page.
// Keep everything short: visitors scan, they don't read.

export const profile = {
  name: 'Ali Chahine',
  role: 'Software Engineer',
  tagline: 'I build end-to-end software solutions.',
  location: 'Beirut, Lebanon',
  availability: 'Open to full-time roles & freelance projects', // set to '' to hide it
  // Your photo in /public, e.g. '/photo.jpg'. Until you add one, your initials are shown.
  photo: '/photo.jpg',
}

// The kinds of work you do. Pressing any number in About opens a panel with these.
// "proof" is where you did it, so each role is backed by real work.
export const roles = [
  {
    name: 'Backend',
    summary: 'Databases, APIs, Security and deployment, Cloud',
    proof: 'boxMind AI · ~3 years',
    stack: ['Python', 'FastAPI', 'MySQL', 'Docker'],
  },
  {
    name: 'Full-Stack',
    summary: 'Web apps from the database to the screen',
    proof: 'Mobile Arts · Cinetwork project',
    stack: ['React', 'Angular', 'ASP.NET Core', 'Node'],
  },
  {
    name: 'Mobile',
    summary: 'Cross-platform apps shipped to the stores',
    proof: 'Mobile Arts · Cinetwork app on Google Play & App Store',
    stack: ['React Native', 'Xamarin'],
  },
  {
    name: 'AI',
    summary: 'LLM, RAG and agent features inside real products',
    proof: 'boxMind AI',
    stack: ['LLMs', 'RAG', 'Prompt Engineering', 'Milvus'],
  },
]

// The small numbers in the About section.
export const stats = [
  { value: '3+', label: 'years experience' },
  { value: '2', label: 'companies' },
  { value: String(roles.length), label: 'roles' },
]
