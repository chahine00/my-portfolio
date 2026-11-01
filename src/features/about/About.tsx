// The "About Me" section: one short statement as the title, three "how I work" cards under it,
// and the small numbers underneath. Edit the text below to introduce yourself.
// The numbers come from "stats" in src/data/profile.ts.

import { stats } from '../../data/profile.ts'

// How you work, in three short points. Keep each one to a title and one line.
const principles = [
  {
    title: 'Fundamentals first',
    text: "My core is backend systems, APIs and AI integrations: the parts that stay solid when tools change.",
  },
  {
    title: 'Move at AI speed',
    text: '  I pick up whatever stack or tool a project demands, so it ships fast and keeps moving forward',
  },
  {
    title: 'Why before how',
    text: 'AI can handle the how. With degrees in computer science and business, I start with why a feature matters.',
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
      <h1 className="mindset__title">
        In the AI era, tech changes fast. <span>Engineering fundamentals don't.</span>
      </h1>

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
