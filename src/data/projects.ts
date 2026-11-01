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
// Then run  sh scripts/make-thumbs.sh  to make the small copy used on the card.

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
    slug: 'boxmind-ai-backend',
    title: 'boxMind AI: Enterprise AI Products',
    context: 'Company project',
    role: 'Backend & AI integration',
    period: 'Jul 2023 – Mar 2026',
    team: 'With the AI and frontend teams',
    status: 'In production',
    problem:
      'boxMind, the AI arm of Allied Engineering Group, builds privacy-first AI for banks, government, telecoms, insurers and healthcare. Each product needed a secure backend to take its AI features into production.',
    result:
      "Over almost three years, I built the backend behind many of the company's AI products, turning the AI team's work into secure APIs and live-streamed AI answers for the frontend.",
    tech: ['Python', 'FastAPI', 'Flask', 'Socket.IO', 'MySQL', 'Milvus', 'LLMs & RAG', 'Docker', 'AWS'],
    images: [
      '/projects/boxmind-ai-backend/1.svg',
      '/projects/boxmind-ai-backend/2.jpg',
      '/projects/boxmind-ai-backend/3.jpg',
    ],
    overview: `boxMind is the AI arm of Allied Engineering Group (AEG). It designs and deploys enterprise AI for organizations where data sovereignty, regulatory compliance and reliability are non-negotiable: banks, government entities, telecoms, insurers and healthcare providers across the Middle East and Africa. Its products combine large language models, computer vision and structured-data AI, with role-based access and full audit trails, and are often deployed on the client's own servers.

I joined in the company's early days as its first hire, and for almost three years I was the backend developer working between the AI team and the frontend team. That meant taking care of the database, the APIs, security, testing and deployment.

It wasn't one project but many: AI chatbots and RAG assistants that answer questions over an organization's own documents, AI models for predictions and inference, an AI learning platform for schools (boxMind Academy, which has its own page here), and solutions for banks and hospitals.

My focus was the backend, but working next to the AI team gave me hands-on experience with AI: I connected their work to the products through LLM calls, retrieval-augmented generation (RAG) over Milvus vector databases, background AI workers and data pipelines, and I worked on prompts and AI agents along the way.

To make the AI feel instant, I streamed the LLM's answers to the frontend in real time over Socket.IO, word by word as they were generated, with controls like stopping a generation mid-answer.

The role went beyond code: I was part of the discussions and decisions on which features to build and how to grow the product.`,
    built: [
      'Architected the MySQL database from scratch: schema, relationships, data models and query tuning',
      'Built the APIs in FastAPI and Flask, with clear API, business-logic and data layers, and the folder structure and coding principles behind them',
      'Streamed LLM answers to the frontend in real time with Socket.IO: tokens arrive as they are generated, with events for start, progress, done and errors',
      'Added stream controls such as "stop generation", which cancels the running answer on the server and keeps what was already written',
      "Exposed the AI team's logic to the frontend through secure endpoints, with JWT authentication and middleware guards",
      'Designed strict data isolation: every user\'s data is private to them, with their own vector database for RAG, so documents and answers never mix between users',
      'Designed roles and permissions (RBAC), with private rooms open only to their members',
      "Integrated the AI team's LLM, RAG and inference features into the backend, with retrieval from Milvus vector databases that I managed",
      'Helped write and refine the prompts behind the AI features',
      'Set up background workers and data pipelines for long-running AI jobs',
      'Took care of QA: tested the APIs, tracked down bugs and fixed them before release',
      'Containerized the services with Docker and deployed them on AWS (EC2, Lambda, API Gateway), configured the web server, and set up logging, monitoring and error handling',
    ],
    metrics: [
      { value: '~3 years', label: 'building AI products' },
      { value: 'Real-time', label: 'LLM answers streamed over Socket.IO' },
      { value: '1 per user', label: 'private data and vector database' },
    ],
    challenges: [
      {
        challenge:
          'Users held sensitive data (bank, patient and student records) and uploaded their own documents for the AI to search. None of it could ever leak to another user, not even through an AI answer.',
        solution:
          "Gave every user their own private data and their own vector database, and scoped every query to that user and the rooms they belong to, on top of role permissions. The AI only ever retrieves from the asking user's own data.",
      },
      {
        challenge: 'LLM answers can take many seconds to finish, and waiting for the full answer made the products feel slow.',
        solution:
          'Streamed each answer over Socket.IO as it was generated, with clear start, chunk, done and error events, and a "stop generation" action that cancels the work on the server instead of only hiding it in the browser.',
      },
      {
        challenge: "The AI team's logic had to reach the frontend without exposing the models, prompts or data behind it.",
        solution:
          'Put it behind authenticated endpoints and socket connections that check permissions and validate input, keeping prompts, keys and AI calls on the server.',
      },
      {
        challenge: 'Different products needed different access-control models: some had fixed roles, others had custom roles with flexible permissions.',
        solution:
          'Designed purpose-built middleware guards for each case, so access rules stayed in one layer instead of being spread across the endpoints.',
      },
      {
        challenge: 'LLM output is non-deterministic, but product features need predictable results.',
        solution:
          'Used structured prompts, grounded answers with RAG context, and validated the model output in the backend before it reached users.',
      },
    ],
    learnings: [
      'The first decisions (the schema, the folder structure, the conventions) shape everything a team builds afterwards.',
      'Security belongs in the architecture from day one, not added at the end. With AI, that includes the data the model can retrieve.',
      'Streaming changes how fast an AI product feels, even when the model itself is not faster.',
      'Good AI features depend as much on retrieval, data and prompts as on the model itself.',
      'Being in product decisions makes you build the right things, not only build things right.',
    ],
    note: "The code is in a private company repository, so it can't be shared. The website images are from boxmind.ai.",
    liveUrl: 'https://boxmind.ai/',
  },
  {
    slug: 'cinetwork',
    title: 'Cinetwork',
    context: 'Freelance project',
    role: 'Mobile, web & backend',
    period: '2025 – present',
    team: 'Freelance, with the client',
    status: 'Live',
    problem:
      'End-to-end cross-platform app (React Native, Flask, MySQL, AWS) enabling film community networking.',
    result: 'Monetized with subscriptions & AdMob; featured at the Byblos International Film Festival.',
    tech: ['React Native', 'Flask', 'MySQL', 'AWS', 'Nginx', 'AdMob'],
    images: [
      '/projects/cinetwork/1.jpg',
      '/projects/cinetwork/2.jpg',
      '/projects/cinetwork/3.jpg',
      '/projects/cinetwork/4.jpg',
      '/projects/cinetwork/5.jpg',
    ],
    overview: `Cinetwork is a professional networking platform for filmmakers, audiovisual professionals, students and creatives. In one place, they can build a professional profile, connect with the industry, find jobs and projects, and discover films, talent and services. Its motto: Connect. Create. Work.

I built it as a freelancer, working closely with the client, from the database to the app stores. It started mobile-first, then the client asked for a web version too, so I adapted the same React Native codebase to run on the web. It's now live on Android, iOS and at thecinetwork.com.

Cinetwork is also a business: users can pay for subscriptions inside the app, and AdMob ads earn revenue from the free tier.

Before its official launch, Cinetwork got an exclusive sneak peek at the Byblos International Film Festival.`,
    built: [
      'Built the app in React Native, from one codebase for Android, iOS and the web',
      'Built the backend API in Flask (Python) with a MySQL relational database',
      'Helped set the pricing, then added paid subscriptions with in-app purchases on Google Play and the App Store, unlocking premium features in the backend',
      'Integrated AdMob ads to earn revenue from free users, without getting in the way of the main flows',
      'Deployed the web app on AWS EC2 behind Nginx, with HTTPS (Let\'s Encrypt) and S3 + CloudFront for assets',
      'Published and maintain the app on Google Play and the App Store, handling iOS signing, provisioning and permissions',
    ],
    features: [
      'Professional profiles with CV, portfolio, experience and showreel',
      'Networking with filmmakers, crew, creatives, students and industry professionals',
      'Jobs, projects and opportunities in the audiovisual industry',
      'An availability status, so productions can find available talent',
      'Discovery of student and independent films and emerging filmmakers',
      'A student space with workshops, internships, discounts, facilities and project support',
      'Exclusive offers from businesses that support the industry',
      'Premium subscriptions, with ads on the free tier',
    ],
    challenges: [
      {
        challenge: 'Turning a mobile-first React Native app into a production web app.',
        solution:
          'Adapted the build for the web and set up EC2, Nginx SPA routing, DNS and SSL. Then I fixed the mixed-content, CORS and API-routing issues between the frontend, the backend and CloudFront.',
      },
      {
        challenge: 'Making money from the app without hurting the experience, on two stores with different payment rules.',
        solution:
          'Used each store\'s own in-app subscriptions, kept the subscription status in the backend as the single source of truth, and placed ads only where they don\'t interrupt the core flows.',
      },
      {
        challenge: 'Shipping the same app to the App Store after Android.',
        solution:
          'Learned the iOS pipeline: user-facing permission texts in Info.plist, signing through Apple Developer accounts and provisioning profiles, and builds through App Store Connect.',
      },
    ],
    learnings: [
      'A working app is only half the job. Making it deployed, secure and stable is the other half.',
      'Cross-platform code saves a lot of time, but each platform still has its own rules for permissions, signing, payments and release.',
      'Freelancing teaches you to care about everything: the product, the code, the release and the relationship with the client.',
    ],
    liveUrl: 'https://www.thecinetwork.com',
  },
  {
    slug: 'boxmind-academy',
    title: 'boxMind Academy: AI Learning for Schools',
    context: 'Company project (boxMind AI)',
    role: 'Backend developer & database architect',
    team: 'With the AI, frontend and education teams',
    status: 'Live',
    problem:
      'Schools wanted to teach Generative AI and robotics, and to use AI to make learning itself better. They needed a platform that could run courses for whole schools, guide each student with AI, and handle school contracts and pricing.',
    result:
      'An online learning platform where AI guides students through courses, levels and chapters, used by schools under contract. I built its whole backend and designed its database.',
    tech: ['Python', 'MySQL', 'LLMs', 'Socket.IO', 'Docker', 'AWS'],
    images: [
      '/projects/boxmind-academy/1.jpg',
      '/projects/boxmind-academy/2.jpg',
      '/projects/boxmind-academy/3.jpg',
      '/projects/boxmind-academy/4.jpg',
      '/projects/boxmind-academy/5.jpg',
    ],
    overview: `boxMind Academy is boxMind's online learning platform for schools. It teaches students Generative AI and robotics, and it uses AI to improve the learning experience itself: an AI tutor guides each student through the material, answers their questions on the selected subject, and helps them move forward at their own pace.

The courses are built by boxMind's AI engineers together with experienced educators, and the program is accredited by the USA Accreditation Council and Approval Commission (USAAC). Students progress through levels made for their age, from Adventurer for beginners, to Explorer, to Mastermind for advanced learners, and the curriculum grows with them from the first grades up to 12th grade.

I was the backend developer and database architect of the platform. I designed the database from scratch and built the whole backend behind it: schools and their contracts, pricing, courses, levels, chapters and lessons, students and teachers, progress tracking, and the AI features that create content and guide learning.

It reuses what I built across boxMind's AI products: secure APIs, strict data privacy for every student, and AI answers streamed live to the screen.`,
    built: [
      'Designed the database from scratch: schools, contracts and pricing, courses, levels, chapters and lessons, students, teachers and their progress',
      'Built the whole backend: the APIs, the business logic and the data layer behind every screen of the platform',
      'Modeled school contracts and pricing, so each school gets access to the courses, levels and seats it signed up for',
      'Built the course structure: courses split into levels (Adventurer, Explorer, Mastermind), chapters and content, with the right content for each grade',
      'Integrated AI to help create courses and content, and to guide each student through it as a private tutor',
      'Streamed the AI tutor\'s answers to students in real time, with controls like stopping a generation',
      'Tracked every activity and assessment, so teachers can follow each student\'s progress and step in where needed',
      'Secured the platform with authentication and roles (school admins, teachers, students), keeping each school\'s and each student\'s data private',
    ],
    features: [
      'AI-guided learning: an AI tutor that explains the selected subject and answers each student\'s questions',
      'Generative AI and Robotics programs (Arduino and Scratch), built with educators',
      'Levels for every age: Adventurer, Explorer and Mastermind',
      'Courses organized into levels, chapters and lessons',
      'School accounts with contracts and pricing',
      'Progress tracking on every activity and assessment',
      'USAAC-accredited program with certificates',
    ],
    challenges: [
      {
        challenge:
          'One platform had to serve many schools, each with its own contract, pricing, courses and students, without any school seeing another\'s data.',
        solution:
          'Designed the database around schools from the start: contracts, access and every record are tied to a school, and every query is scoped to it.',
      },
      {
        challenge: 'The content had to fit very different ages, from young beginners to 12th grade.',
        solution:
          'Modeled a flexible structure (course → level → chapter → content), so the education team could add age-appropriate content without changes to the backend.',
      },
      {
        challenge: 'An AI tutor for students has to stay on topic and be safe for young learners.',
        solution:
          'Kept every AI call on the server, with prompts scoped to the selected subject and course content, so the tutor guides learning instead of answering anything.',
      },
    ],
    learnings: [
      'In education, the data model is the product: schools, contracts, levels and chapters decide what every screen can do.',
      'AI in learning works best as a guide that helps students think, not as an answer machine.',
      'Designing for many schools from day one is much easier than splitting a single-school system later.',
    ],
    note: "The code is in a private company repository, so it can't be shared. The images are from boxmindacademy.ai.",
    liveUrl: 'https://boxmindacademy.ai/',
  },
]
