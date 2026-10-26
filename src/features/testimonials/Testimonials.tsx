// The "Testimonials" section: short quotes from people you worked with.
// It shows NOTHING until you add quotes in src/data/testimonials.ts.

import { testimonials } from '../../data/testimonials.ts'

function Testimonials() {
  // Returning null means "draw nothing".
  if (testimonials.length === 0) return null

  return (
    <section id="testimonials" className="section">
      <h1>What people say</h1>
      <div className="grid">
        {testimonials.map((item) => (
          <figure className="card quote" key={item.name}>
            <blockquote>“{item.quote}”</blockquote>
            <figcaption>
              <strong>{item.name}</strong>
              <span>{item.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

export default Testimonials
