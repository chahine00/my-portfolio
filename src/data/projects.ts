// This file holds only DATA (no components), which is why it ends in .ts and not .tsx.
// .tsx is only needed when a file contains JSX.
//
// Each project shows up twice:
//   1. a short CARD on the home page (cover photo, problem, result, tech)
//   2. its own PAGE at /projects/<slug> with everything else (a "case study")
// Only the fields WITHOUT a ? are required. Leave out anything you don't have:
// the page simply skips that part.
//
// Photos go in public/projects/<slug>/, e.g. public/projects/my-app/1.png.

// An "interface" is a TypeScript feature that describes the SHAPE of an object:
// which properties it has, and what type each one is.
// If you forget a property or use the wrong type, TypeScript shows an error.
export interface Project {
  slug: string // the page's address: 'my-app' → /projects/my-app (lowercase, dashes, no spaces)
  title: string
  context?: string // what kind of project: 'Company project', 'Freelance', 'Personal project'…
  role?: string // your role, e.g. 'Backend & AI engineer' or 'Solo developer'
  period?: string // when, e.g. 'Jan – Jun 2025' or '2024 – present'
  team?: string // e.g. 'Team of 4' or 'Solo'
  status?: string // e.g. 'Live', 'In production', 'Completed', 'In progress'

  // --- Shown on the card AND the page ---
  problem: string // one or two sentences: why did this project exist?
  result?: string // the outcome, ideally with a number
  tech: string[] // the 4–6 main technologies. string[] means "an array of strings"
  images?: string[] // photos/screenshots. The FIRST one is the cover on the card.

  // --- Shown only on the project's page ---
  overview?: string // the longer story. Leave an empty line between paragraphs.
  built?: string[] // what YOU did: short points starting with a verb (Designed, Built, Cut…)
  features?: string[] // the main things the product can do
  metrics?: { value: string; label: string }[] // big numbers, e.g. { value: '2s', label: 'response time' }
  challenges?: { challenge: string; solution: string }[] // hard problems and how you solved them
  learnings?: string[] // what you learned or would do differently
  note?: string // e.g. 'The code is private because this was a company project.'

  githubUrl?: string // the ? means this property is OPTIONAL (you can leave it out)
  liveUrl?: string
}

// "Project[]" means "an array of Project objects".
// To show a new project on the website, just add a new object to this list.
// Order matters: put your strongest project first. 3 strong projects beat 10 average ones.
export const projects: Project[] = [
  {
    slug: 'portfolio-website',
    title: 'Portfolio Website',
    context: 'Personal project',
    role: 'Solo developer',
    period: '2026',
    team: 'Solo',
    status: 'Live',
    problem:
      'I needed one place to show my work, share news and let recruiters reach me without depending on other platforms.',
    tech: ['React', 'TypeScript', 'Vite', 'React Router'],
    images: [
      '/projects/portfolio-website/1.png',
      '/projects/portfolio-website/2.png',
      '/projects/portfolio-website/3.png',
    ],
    overview: `A fast, single-page portfolio that scrolls smoothly between sections, with separate pages for updates and for each project.

All the content lives in small data files, so adding a project, a post or a contact is a matter of editing a list, not touching the layout.`,
    built: [
      'Built a one-page React + TypeScript site with smooth section navigation and separate pages',
      'Designed a posts system and project case studies with photo galleries and a full-screen viewer',
      'Added light/dark themes, a downloadable CV and accessible, keyboard-friendly navigation',
    ],
    features: [
      'One-page layout with a sticky navbar and back-to-top button',
      'Updates timeline with a "new post" indicator',
      'Project case-study pages with photo galleries',
      'Automatic light and dark mode',
    ],
    challenges: [
      {
        challenge: 'Keeping the one-page scrolling while also having separate pages.',
        solution:
          'Used React Router for the pages and made the section links point to "/#section", so they work from any page and still scroll smoothly on the home page.',
      },
    ],
    githubUrl: 'https://github.com/',
  },
  {
    // TEMPLATE — replace this with a real project. Delete any field you don't have.
    // The example text shows the STYLE to aim for; don't keep the example numbers.
    slug: 'example-ai-assistant',
    title: 'Example: AI Document Assistant',
    context: 'Company project',
    role: 'Backend & AI engineer',
    period: 'Jan – Jun 2025',
    team: 'Team of 4',
    status: 'In production',
    problem:
      'What problem did it solve, and for whom? e.g. "The support team spent hours searching internal documents."',
    result: 'The outcome with a number, e.g. "Saved the team ~15 hours a week."',
    tech: ['Python', 'FastAPI', 'LangChain', 'Milvus', 'AWS'],
    images: ['/projects/example-ai-assistant/1.svg', '/projects/example-ai-assistant/2.svg'],
    overview: `Tell the story in 2–3 short paragraphs: the situation, what you decided to build, and how it's used today.

Screenshots, architecture diagrams and photos of the team or demo day all make good images.`,
    built: [
      'What you built, e.g. "Designed a RAG pipeline with LangChain and Milvus over 10k documents"',
      'A hard part you solved, e.g. "Cut response time from 8s to 2s by caching embeddings"',
      'How it ran, e.g. "Deployed on AWS Lambda behind API Gateway with CI/CD"',
    ],
    features: ['Ask questions in plain language', 'Answers cite their source documents', 'Admin panel to upload new documents'],
    metrics: [
      { value: '10k+', label: 'documents indexed' },
      { value: '8s → 2s', label: 'response time' },
      { value: '15h', label: 'saved per week' },
    ],
    challenges: [
      {
        challenge: 'A real problem you hit, e.g. "Answers were slow on large documents."',
        solution: 'How you solved it, e.g. "Split documents into smaller chunks and cached embeddings."',
      },
    ],
    learnings: ['Something you learned, e.g. "Measure first: the slow part was not where we expected."'],
    note: 'The code is private because this was a company project.',
  },
]
