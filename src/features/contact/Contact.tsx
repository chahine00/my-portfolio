// The "Contact" section: a form that sends a message.
// This is the only component that uses STATE, so it's the best one to study.

// useState is a React "hook". It lets a component remember values,
// and React re-draws the component whenever one of those values changes.
import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { sendContactMessage } from '../../services/api.ts'

// A "union type": status can ONLY be one of these four strings.
// TypeScript will show an error if you try to set anything else (like 'done').
type Status = 'idle' | 'sending' | 'sent' | 'error'

function Contact() {
  // useState returns two things: [currentValue, functionToChangeIt].
  // The value in useState(...) is the starting value.
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle') // <Status> tells TypeScript which values are allowed

  // This function runs when the form is submitted (button click or pressing Enter).
  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    // By default the browser reloads the page when a form is submitted.
    // preventDefault() stops that so React can handle it instead.
    event.preventDefault()

    setStatus('sending')

    // try/catch: run the code in "try". If anything throws an error, jump to "catch".
    try {
      await sendContactMessage({ name, email, message })
      setStatus('sent')

      // Clear the form by resetting the state back to empty strings.
      setName('')
      setEmail('')
      setMessage('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="section">
      <h1>Contact</h1>
      <form className="contact-form" onSubmit={handleSubmit}>
        {/*
          A "CONTROLLED INPUT":
          - value={name} → the input always shows what's stored in state
          - onChange     → every time you type, update the state with the new text
          event.target is the input element, and .value is the text inside it.
        */}
        <input
          name="name"
          placeholder="Your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <textarea
          name="message"
          placeholder="Your message"
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
        />

        {/* The button is disabled while sending, so it can't be clicked twice.
            "condition ? A : B" is the ternary operator: if condition is true use A, else B. */}
        <button type="submit" className="button" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>

        {/* Only show these messages when the status matches. */}
        {status === 'sent' && <p>Thanks! Your message was sent.</p>}
        {status === 'error' && <p>Something went wrong. Please try again.</p>}
      </form>
    </section>
  )
}

export default Contact
