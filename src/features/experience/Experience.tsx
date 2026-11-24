// The "Experience" section on the /background page: your jobs on a timeline, newest first.
// The data comes from src/data/experience.ts.
// Each job appears as you scroll down to it.

import { experience } from '../../data/experience.ts'
import { stats } from '../../data/profile.ts'
import TimelineDot from '../../components/TimelineDot.tsx'
import { useReveal } from '../../utils/useReveal.ts'
import SectionTitle from '../../components/SectionTitle.tsx'
import { asset } from '../../utils/asset.ts'
import type { Job } from '../../data/experience.ts'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// "Jul 2023" → months since year 0 (for subtracting); "present" → this month. Null when there's
// no month (a period written with years only, like "2025 – present": too vague to count).
function monthIndex(part: string) {
  const text = part.trim()
  if (/present/i.test(text)) {
    const now = new Date()
    return now.getFullYear() * 12 + now.getMonth()
  }
  const match = text.match(/^([A-Z][a-z]{2}) (\d{4})$/)
  if (!match || !MONTHS.includes(match[1])) return null
  return Number(match[2]) * 12 + MONTHS.indexOf(match[1])
}

// How long someone was at a company, from the first role's start to the latest role's end,
// counting both months, like LinkedIn: "2 yrs 9 mos", "10 mos". Empty when it can't tell.
function duration(job: Job) {
  const start = monthIndex(job.roles[job.roles.length - 1].period.split('–')[0])
  const end = monthIndex(job.roles[0].period.split('–').pop() ?? '')
  if (start === null || end === null || end < start) return ''
  const months = end - start + 1
  const years = Math.floor(months / 12)
  const rest = months % 12
  const y = years ? `${years} yr${years > 1 ? 's' : ''}` : ''
  const m = rest ? `${rest} mo${rest > 1 ? 's' : ''}` : ''
  return [y, m].filter(Boolean).join(' ')
}

// The company's initials, for the badge when there's no logo: "boxMind AI" → "BA".
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

function Experience() {
  // Each job appears as you scroll to it (see src/utils/useReveal.ts).
  const listRef = useReveal<HTMLOListElement>()

  return (
    <section id="experience" className="section">
      <SectionTitle label="Experience" title="Work" accent="history" />

      <ul className="stats">
        {stats.map((stat) => (
          <li key={stat.label} className="stats__item">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </li>
        ))}
      </ul>

      <ol className="timeline timeline--reveal" ref={listRef}>
        {experience.map((job) => (
          <li className="timeline__item" key={job.company}>
            <TimelineDot label={job.company} />
            <article className="card job">
              {/* The company: its logo (or initials), its name, and how long in total. */}
              <header className="job__head">
                {job.logo ? (
                  <img className="job__logo" src={asset(job.logo)} alt="" width={40} height={40} />
                ) : (
                  <span className="job__logo job__logo--initials" aria-hidden="true">
                    {initials(job.company)}
                  </span>
                )}
                <h3>
                  {job.url ? (
                    <a className="job__company" href={job.url} target="_blank" rel="noreferrer">
                      {job.company}
                    </a>
                  ) : (
                    job.company
                  )}
                </h3>
                {duration(job) && <span className="job__duration">{duration(job)}</span>}
              </header>

              {/* One block per role, so growth at the same company is visible. */}
              {job.roles.map((role) => (
                <div className="job__role" key={role.title}>
                  <div className="job__role-head">
                    <strong>{role.title}</strong>
                    <span>{role.period}</span>
                  </div>
                  <ul className="check-list">
                    {role.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}

              {job.tech && (
                <ul className="tags">
                  {job.tech.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
              )}
            </article>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default Experience
