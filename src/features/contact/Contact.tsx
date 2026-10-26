// The "Contact" section: a form that sends a message.
// It uses STATE for the form fields and the sending status, so it's a good one to study.

// useState is a React "hook". It lets a component remember values,
// and React re-draws the component whenever one of those values changes.
import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { sendContactMessage } from '../../services/api.ts'
import { contacts } from '../../data/contact.ts'
import { asset } from '../../utils/asset.ts'

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
  // Remembers who just wrote, so the thank-you message can use their name after the form is cleared.
  const [sentName, setSentName] = useState('')
  // useRef points at the success box, so we can move the screen (and keyboard focus) to it.
  const successRef = useRef<HTMLDivElement>(null)

  // Once the message is sent, bring the success box into view so nobody misses it.
  useEffect(() => {
    if (status !== 'sent') return
    successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    successRef.current?.focus({ preventScroll: true })
  }, [status])

  // This function runs when the form is submitted (button click or pressing Enter).
  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    // By default the browser reloads the page when a form is submitted.
    // preventDefault() stops that so React can handle it instead.
    event.preventDefault()

    setStatus('sending')

    // try/catch: run the code in "try". If anything throws an error, jump to "catch".
    try {
      await sendContactMessage({ name, email, message })
      setSentName(name.trim())
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

      {/* Direct contact details, read from src/data/contact.ts.
          Links starting with https open in a new tab; tel: and mailto: don't need to. */}
      <ul className="contact-list">
        {contacts.map((contact) => (
          <li key={contact.label}>
            <span className="contact-label">{contact.label}</span>
            <a
              href={contact.href}
              {...(contact.href.startsWith('http') && {
                target: '_blank',
                rel: 'noreferrer',
              })}
            >
              {/* "&&" only renders the flag when the contact has one. */}
              {contact.flag && <img src={asset(contact.flag)} alt="" className="contact-flag" />}
              {contact.value}
            </a>
          </li>
        ))}
      </ul>

      <p>Or send me a message:</p>

      {/* After sending, a clear success box replaces the form. */}
      {status === 'sent' ? (
        // role="status" makes screen readers announce it; tabIndex={-1} lets us focus it from code.
        <div className="form-alert form-alert--success" role="status" ref={successRef} tabIndex={-1}>
          <span className="form-alert__icon" aria-hidden="true">
            ✓
          </span>
          <div>
            <p className="form-alert__title">Message sent!</p>
            <p>Thanks{sentName && `, ${sentName}`}. I've received your message and will get back to you soon.</p>
            <button type="button" className="button button-outline" onClick={() => setStatus('idle')}>
              Send another message
            </button>
          </div>
        </div>
      ) : (
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

          {/* role="alert" makes screen readers read the error out right away. */}
          {status === 'error' && (
            <div className="form-alert form-alert--error" role="alert">
              <span className="form-alert__icon" aria-hidden="true">
                !
              </span>
              <div>
                <p className="form-alert__title">Your message wasn't sent.</p>
                <p>
                  Please try again, or email me directly at <a href={contacts[0].href}>{contacts[0].value}</a>.
                </p>
              </div>
            </div>
          )}
        </form>
      )}
    </section>
  )
}

export default Contact
