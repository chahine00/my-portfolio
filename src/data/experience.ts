// Your work history, newest first. Shown in the Experience section.
// Keep it short: max 3 points per role, each one line.

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
          'First employee: designed the database, architecture & folder structure',
          'Set the backend principles and security layer (JWT, RBAC)',
          'Shipped LLM features with prompt engineering, with the AI team',
        ],
      },
    ],
    tech: ['Python', 'FastAPI', 'Flask', 'MySQL', 'AWS', 'LLMs', 'Prompt Engineering'],
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
