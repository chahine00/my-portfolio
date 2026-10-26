// Short quotes from managers, colleagues or clients.
// The Testimonials section stays HIDDEN while this list is empty.
// Ask 2–3 people for one or two sentences (LinkedIn recommendations work great).
//
// Example:
// { quote: 'Ali owned our whole backend and shipped fast.', name: 'Jane Doe', role: 'CTO, boxMind AI' },

export interface Testimonial {
  quote: string
  name: string
  role: string
}

export const testimonials: Testimonial[] = []
