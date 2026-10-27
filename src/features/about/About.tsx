// The "About Me" section. Edit the text below to introduce yourself.
// The numbers come from "stats" in src/data/profile.ts.

import { stats } from '../../data/profile.ts'

function About() {
  return (
    <section id="about" className="section">
      {/* A small label above the heading: the navbar says "About", the title says "The Mindset". */}
      <p className="eyebrow">About</p>
      <h1>The Mindset</h1>
      <p>
        In the AI era, technology changes fast, but engineering fundamentals stay the same. My core is backend systems, APIs, and AI integrations, but I pick up whatever stack or tools a project demands to ship fast and keep moving forward. With degrees in both computer science and business management, I focus on why a feature matters, not just how to build it.
      </p>

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
