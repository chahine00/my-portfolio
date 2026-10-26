// The "Experience" section: your jobs on a timeline, newest first.
// The data comes from src/data/experience.ts.

import { experience } from '../../data/experience.ts'

function Experience() {
  return (
    <section id="experience" className="section">
      <h1>Experience</h1>

      <ol className="timeline">
        {experience.map((job) => (
          <li className="timeline__item" key={job.company}>
            <article className="card job">
              <h3>{job.company}</h3>

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
