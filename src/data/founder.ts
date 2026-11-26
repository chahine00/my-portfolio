// The founder's page (/background): the mindset and the core stack (Mindset.tsx, Skills.tsx).
// Also read by the build (scripts/prerender.ts), which writes this text into the page's HTML for
// search engines, so both always say the same thing.

export const mindset = {
  eyebrow: 'The Mindset',
  title: 'Think bigger.',
  titleAccent: 'Adapt faster.', // in the accent gradient
  lead: 'In the AI era, writing code keeps getting easier. I believe what makes the difference now is how you think: seeing the bigger picture, knowing how all the pieces fit together, and adapting quickly as things change.',
  // How you work, in three short points. Keep each one to a title and one line.
  principles: [
    {
      title: 'Backend at my core',
      text: 'Strong foundations in backend engineering, from APIs and databases to system architecture.',
    },
    {
      title: 'Adaptable by nature',
      text: 'Now that AI is everywhere, building and achieving matter more than being labeled by a single tool or framework.',
    },
    {
      title: 'Beyond the code',
      text: 'With degrees in both computer science and business management, I focus on why a feature matters, not just how to build it.',
    },
  ],
}

// A SHORT core stack, not everything you've ever used: about 4 groups, 15–20 skills, the most
// important first. The projects are where you prove them.
export const coreStack = [
  {
    category: 'Backend',
    skills: ['Python', 'FastAPI', 'Flask', 'REST APIs', 'JWT / OAuth2', 'Node.js', 'C# / ASP.NET Core'],
  },
  {
    category: 'AI Integration',
    skills: ['LLMs', 'RAG Pipelines', 'Milvus', 'Prompt Engineering', 'AI Agents'],
  },
  {
    category: 'Data & Cloud',
    skills: ['SQL (MySQL)', 'Docker', 'AWS', 'Nginx', 'CI/CD'],
  },
  {
    category: 'Mobile & Frontend',
    skills: ['React Native', 'React'],
  },
]

// What colleagues and clients say. The section only appears once there's at least one quote, so
// nothing shows until you add real ones (never invent them). Example:
// { quote: 'Ali turned our idea into a live app…', name: 'Jane Doe', role: 'Founder, Example Co.' }
export const testimonials: { quote: string; name: string; role: string }[] = []
