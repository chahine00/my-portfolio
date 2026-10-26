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
        Real growth comes down to speed and flexibility. I try not to box myself into a single label - I just adapt quickly and pick up whatever tools I need, because staying relevant in the AI era means constantly moving forward.
      </p>

      <ul className="stats">
        {stats.map((stat) => (
          <li key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default About
