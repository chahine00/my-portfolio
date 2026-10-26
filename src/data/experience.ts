// Your work history, newest first. Shown in the Experience section.
// Keep it short: max 3 points per role, each one line.

export interface Role {
  title: string
  period: string
  points: string[]
}

export interface Job {
  company: string
  roles: Role[] // several roles at one company show your growth there
  tech?: string[]
}

export const experience: Job[] = [
  {
    company: 'boxMind AI',
    roles: [
      {
        title: 'Backend Developer',
        period: 'Jul 2023 – Mar 2026',
        points: [
          'Lead backend engineer: owned the full architecture',
          'Shipped LLM features to production with the AI team',
          'Secured APIs (JWT, RBAC) and deployed on AWS',
        ],
      },
    ],
    tech: ['Python', 'FastAPI', 'Flask', 'MySQL', 'AWS', 'LLMs'],
  },
  {
    company: 'Mobile Arts',
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
