// The "About Me" section: one short statement as the title, a line on what it means, three "how I work" cards under it,
// and the small numbers underneath. Edit the text below to introduce yourself.
// The numbers come from "stats" in src/data/profile.ts.

import { stats } from '../../data/profile.ts'
import GradientText from '../../components/GradientText.tsx'

// How you work, in three short points. Keep each one to a title and one line.
const principles = [
  {
    title: 'Backend at my core',
    text: 'Strong foundations in backend engineering, from APIs and databases to system architecture.',
  },
  {
    title: 'Adaptable by nature',
    text: 'Always exploring new languages, frameworks, and tools. I believe the ability to learn and adapt matters more than mastering a single stack.',
  },
  {
    title: 'Beyond the code',
    text: 'With degrees in both computer science and business management, I focus on why a feature matters, not just how to build it.',
  },
]

function About() {
  return (
    <section id="about" className="section">
      {/* One headline only: the small label names the section, the statement IS the title.
          The second half of the statement is in the accent gradient. */}
      <p className="eyebrow">
        About <span className="mindset__dot">·</span> The Mindset
      </p>
      <h2 className="mindset__title">
        Think bigger.{' '}
        <span>
          <GradientText text="Adapt faster." />
        </span>
      </h2>
      {/* A short personal intro: the point behind the statement. */}
      <p className="mindset__lead">
        In the AI Era, writing code keeps getting easier. I believe what makes the difference now is how you think:
        seeing the bigger picture and knowing how all the pieces fit together.
      </p>

      {/* Three cards side by side: a title and one line each. */}
      <ul className="mindset__list">
        {principles.map((item) => (
          <li key={item.title} className="mindset__item">
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </li>
        ))}
      </ul>

      <ul className="stats">
        {stats.map((stat) => (
          <li key={stat.label} className="stats__item">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default About
