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
    slug: 'cinetwork',
    title: 'Cinetwork',
    context: 'Client project',
    role: 'Full-stack & mobile developer',
    period: '2025 – present',
    status: 'Live',
    problem:
      'Film students, independent creators and industry experts in Lebanon had no single place to find each other, collaborate on projects and book production services.',
    result:
      'One React Native codebase shipped to Android, iOS and the web, with a sneak-peek launch at the Byblos International Film Festival.',
    tech: ['React Native', 'Flask', 'MySQL', 'AWS', 'Nginx'],
    images: [
      '/projects/cinetwork/1.jpg',
      '/projects/cinetwork/2.jpg',
      '/projects/cinetwork/3.jpg',
      '/projects/cinetwork/4.jpg',
      '/projects/cinetwork/5.jpg',
    ],
    overview: `Cinetwork is a networking platform for the film and cinema community: students, independent filmmakers and experts in film production, post-production, social media and music.

I built it as a cross-platform React Native app. It started mobile-first, then the client asked for a web version too, so I adapted the same codebase to run on the web and deployed it on AWS with a custom domain and HTTPS. The same app is now available on Android, iOS and at thecinetwork.com.

Before its official launch, Cinetwork got an exclusive sneak peek at the Byblos International Film Festival.`,
    built: [
      'Built the app in React Native from one codebase for Android, iOS and the web',
      'Built the backend API in Flask (Python) with a MySQL relational database',
      'Deployed the web app on AWS EC2 behind Nginx, with HTTPS (Let\'s Encrypt) and S3 + CloudFront for assets',
      'Published the app on Google Play and the App Store, handling iOS signing, provisioning and permissions',
    ],
    features: [
      'Student and expert profiles, with guest browsing',
      'Categories for film production, post-production, social media and music',
      'Student hub to collaborate, find a crew and showcase projects',
      'Streaming for student and independent films',
      'PR and video production services with a contact flow',
    ],
    challenges: [
      {
        challenge: 'Turning a mobile-first React Native app into a production web app.',
        solution:
          'Adapted the build for the web and set up EC2, Nginx SPA routing, DNS and SSL. Then I fixed the mixed-content, CORS and API-routing issues between the frontend, the backend and CloudFront.',
      },
      {
        challenge: 'Shipping the same app to the App Store after Android.',
        solution:
          'Learned the iOS pipeline: user-facing permission texts in Info.plist, signing through Apple Developer accounts and provisioning profiles, and builds through App Store Connect.',
      },
    ],
    learnings: [
      'A working app is only half the job. Making it deployed, secure and stable is the other half.',
      'Cross-platform code saves a lot of time, but each platform still has its own rules for permissions, signing and release.',
    ],
    liveUrl: 'https://www.thecinetwork.com',
  },
  {
    slug: 'boxmind-ai-backend',
    title: 'boxMind AI: Backend Platform',
    context: 'Company project',
    role: 'Primary backend engineer',
    period: 'Jul 2023 – Mar 2026',
    status: 'In production',
    problem:
      'boxMind, an early-stage enterprise AI company, needed a secure and scalable backend from day one to take its AI and LLM features into production.',
    result:
      'As the first employee, I built the backend from the ground up. Its database, architecture and project structure became the foundation of the product.',
    tech: ['Python', 'FastAPI', 'Flask', 'MySQL', 'LLMs', 'Prompt Engineering', 'AWS'],
    images: ['/projects/boxmind-ai-backend/1.svg'],
    overview: `boxMind is the AI arm of Allied Engineering Group. It builds privacy-first enterprise AI for sectors like banking, government, telecom and healthcare, where security and reliability are not optional.

I joined as the first employee and the primary backend engineer, working closely with the AI team. I owned the backend end to end: the database design, the system architecture, the project folder structure and the coding principles the team followed, and the security layer.

On the AI side, I integrated LLM-powered features into the backend and worked on prompt engineering, so that the AI team's models could run as reliable product features.`,
    built: [
      'Designed the database from scratch: the MySQL schema, relationships and data models',
      'Architected the backend in Flask and FastAPI, with clear API, business-logic and data layers',
      'Defined the project folder structure, model patterns and coding principles the team built on',
      'Secured the platform with JWT authentication, role-based access control (RBAC) and middleware guards',
      'Integrated LLM features into production with the AI team, and designed and refined the prompts behind them',
      'Optimized MySQL queries, deployed on AWS (Lambda, API Gateway, EC2) and set up logging, monitoring and error handling',
    ],
    metrics: [
      { value: '1st', label: 'employee at the company' },
      { value: '~3 years', label: 'owning the backend' },
    ],
    challenges: [
      {
        challenge: 'Different products needed different access-control models: some had fixed roles, others had custom roles with flexible permissions.',
        solution:
          'Designed purpose-built middleware guards for each case, so access rules stayed in one layer instead of being spread across the endpoints.',
      },
      {
        challenge: 'LLM output is non-deterministic, but product features need predictable results.',
        solution:
          'Used prompt engineering with structured prompts and validated the model output in the backend before it reached users.',
      },
    ],
    learnings: [
      'The first decisions (the schema, the folder structure, the conventions) shape everything a team builds afterwards.',
      'Security belongs in the architecture from day one, not added at the end.',
    ],
    note: 'The code is in a private company repository, so it can\'t be shared.',
  },
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
    githubUrl: 'https://github.com/chahine00/my-portfolio',
  },
]
