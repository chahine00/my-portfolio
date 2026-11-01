// Your work history, newest first. Shown in the Experience section.
// Keep it short: max 4 points per role, each one line. The details live on the project pages.

export interface Role {
  title: string
  period: string
  points: string[]
}

export interface Job {
  company: string
  url?: string // company page, linked from the name
  roles: Role[] // several roles at one company show your growth there
  tech?: string[]
}

export const experience: Job[] = [
  {
    company: 'Freelance',
    roles: [
      {
        title: 'Full-Stack Developer (Backend, Web & Mobile)',
        period: '2025 – present',
        points: [
          'I take client ideas from zero to live: API, database, web, mobile and cloud',
          'Latest: Cinetwork, live on Google Play, the App Store and the web. I even helped price it',
        ],
      },
    ],
    tech: ['Flask', 'MySQL', 'AWS', 'Nginx', 'React Native', 'AdMob'],
  },
  {
    company: 'boxMind AI',
    url: 'https://www.linkedin.com/company/boxmindai/',
    roles: [
      {
        title: 'Backend Developer',
        period: 'Jul 2023 – Mar 2026',
        points: [
          "First hire. I built the backend that turned the AI team's models into real products",
          'Secure APIs and databases for clients in education, banking and healthcare',
          'LLM and RAG features with Milvus, shipped with Docker on AWS',
        ],
      },
    ],
    tech: ['Python', 'FastAPI', 'MySQL', 'Milvus', 'LLMs & RAG', 'Docker', 'AWS'],
  },
  {
    company: 'Mobile Arts',
    url: 'https://www.linkedin.com/company/mobile-arts/',
    roles: [
      {
        title: 'Junior Full-Stack Developer',
        period: 'Nov 2022 – Apr 2023',
        points: ['Moved legacy systems to .NET Core and built new features with Angular', 'Built serverless services on AWS Lambda'],
      },
      {
        title: 'Mobile Developer & Intern',
        period: 'Jul 2022 – Nov 2022',
        points: ['Where it started: React Native and Xamarin apps, published on Google Play'],
      },
    ],
    tech: ['C#', 'ASP.NET Core', 'Node.js', 'Angular', 'React Native', 'AWS Lambda'],
  },
]
