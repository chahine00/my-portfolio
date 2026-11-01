// The "About Me" section: one short statement as the title, a line on what it means, three "how I work" cards under it,
// and the small numbers underneath. Edit the text below to introduce yourself.
// The numbers come from "stats" in src/data/profile.ts.

import { stats } from '../../data/profile.ts'

// How you work, in three short points. Keep each one to a title and one line.
const principles = [
  {
    title: 'Solid foundations',
    text: 'The base and the logic: problem solving, data and system design. The core of every backend and AI project, and it outlasts every tool.',
  },
  {
    title: 'Built to adapt',
    text: 'New stack, new tool, new AI model? I learn it fast and put it to work, so projects keep moving forward.',
  },
  {
    title: 'Why before how',
    text: 'AI can handle the how. My background in computer science and business keeps me focused on why a feature matters.',
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
        In the AI Era, tools change fast. <span>The foundations don't.</span>
      </h2>
      {/* One personal line: the point behind the statement, not a list of skills. */}
      <p className="mindset__lead">
        I've learned that once you understand how things really work, every new tool is easy to pick up.
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
