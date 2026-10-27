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
          'Take on client projects end to end: backend APIs, databases, web and mobile apps, and cloud deployment',
          'Latest: Cinetwork, live on Google Play, the App Store and the web; I also helped set its pricing',
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
          "First hire and the team's backend developer, building AI products for education, banking and healthcare",
          "Built the databases and secure APIs (JWT, roles, data isolation) that bring the AI team's work to the frontend",
          'Integrated LLM calls and RAG with Milvus, with hands-on prompt engineering',
          'Handled QA and Docker deployment on AWS, and helped shape product and business ideas',
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
        points: ['Built features with ASP.NET Core & Angular and moved legacy systems to .NET Core', 'Built AWS Lambda services'],
      },
      {
        title: 'Mobile Developer & Intern',
        period: 'Jul 2022 – Nov 2022',
        points: ['Built React Native & Xamarin apps', 'Published apps on Google Play'],
      },
    ],
    tech: ['C#', 'ASP.NET Core', 'Node.js', 'Angular', 'React Native', 'AWS Lambda'],
  },
]
