// "The Mindset" on the /background page: one short statement as the title, a line on what it
// means, and three "how I work" cards. It's about the founder, so it lives here, not on the home page.

import GradientText from '../../components/GradientText.tsx'
import { mindset } from '../../data/founder.ts'

function Mindset() {
  return (
    <section id="mindset" className="section">
      {/* One headline only: the small label names the section, the statement IS the title.
          The second half of the statement is in the accent gradient. */}
      <p className="eyebrow">{mindset.eyebrow}</p>
      <h2 className="mindset__title">
        {mindset.title}{' '}
        <span>
          <GradientText text={mindset.titleAccent} />
        </span>
      </h2>
      <p className="mindset__lead">{mindset.lead}</p>

      {/* Three cards side by side: a title and one line each. */}
      <ul className="mindset__list">
        {mindset.principles.map((item) => (
          <li key={item.title} className="mindset__item">
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Mindset
