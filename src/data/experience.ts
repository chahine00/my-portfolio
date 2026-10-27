// Your work history, newest first. Shown in the Experience section.
// Keep it short: max 6 points per role, each one line.

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
    company: 'boxMind AI',
    url: 'https://www.linkedin.com/company/boxmindai/',
    roles: [
      {
        title: 'Backend Developer',
        period: 'Jul 2023 – Mar 2026',
        points: [
          'First employee and sole backend engineer of AI products for education, banking and healthcare',
          'Architected the databases and APIs, with roles, permissions and per-user data isolation',
          "Turned the AI team's logic into secure APIs for the frontend team (JWT)",
          'Built chatbots, RAG, AI agents and inference features on Milvus, with prompt engineering',
          'Owned QA, testing and deployment with Docker on AWS, including the web server',
          'Took part in product decisions on new features and growth',
        ],
      },
    ],
    tech: ['Python', 'FastAPI', 'Flask', 'MySQL', 'Milvus', 'LLMs', 'RAG', 'AI Agents', 'Docker', 'AWS'],
  },
  {
    company: 'Mobile Arts',
    url: 'https://www.linkedin.com/company/mobile-arts/',
    roles: [
      {
        title: 'Junior Full-Stack Developer',
        period: 'Nov 2022 – Apr 2023',
        points: ['Built features with ASP.NET Core & Angular', 'Migrated legacy systems to .NET Core', 'Built AWS Lambda services'],
      },
      {
        title: 'Mobile Developer & Intern',
        period: 'Jul 2022 – Nov 2022',
        points: ['Built React Native & Xamarin apps', 'Published apps on Google Play'],
      },
    ],
    tech: ['C#', 'ASP.NET Core', 'Angular', 'React Native', 'AWS Lambda'],
  },
]
