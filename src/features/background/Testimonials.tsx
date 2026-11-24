// What colleagues and clients say, on the founder's page. It only appears once there's at least
// one quote in src/data/founder.ts (testimonials), so nothing shows until real ones are added.

import { testimonials } from '../../data/founder.ts'
import SectionTitle from '../../components/SectionTitle.tsx'

function Testimonials() {
  if (testimonials.length === 0) return null

  return (
    <section id="testimonials" className="section">
      <SectionTitle label="Kind words" title="What people" accent="say" />
      <ul className="testimonials">
        {testimonials.map((item) => (
          <li key={item.name} className="card testimonial">
            <blockquote>
              <p>“{item.quote}”</p>
            </blockquote>
            <p className="testimonial__by">
              <strong>{item.name}</strong>
              <span>{item.role}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Testimonials
