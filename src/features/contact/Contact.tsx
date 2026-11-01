// The "Contact" section: a box per contact (email, phones, LinkedIn…), then a form that sends a message.
// It uses STATE for the form fields and the sending status, so it's a good one to study.

// useState is a React "hook". It lets a component remember values,
// and React re-draws the component whenever one of those values changes.
import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { sendContactMessage } from '../../services/api.ts'
import { contacts } from '../../data/contact.ts'
import { asset } from '../../utils/asset.ts'
import Icon from '../../components/Icon.tsx'
import SectionTitle from '../../components/SectionTitle.tsx'

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
  // The label of the phone number that was just copied, so its box can say "Copied!" for a moment.
  const [copied, setCopied] = useState('')
  // useRef points at the success box, so we can move the screen (and keyboard focus) to it.
  const successRef = useRef<HTMLDivElement>(null)

  // Once the message is sent, bring the success box into view so nobody misses it.
  useEffect(() => {
    if (status !== 'sent') return
    successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    successRef.current?.focus({ preventScroll: true })
  }, [status])

  // Clicking a phone box copies the number (instead of opening the phone app).
  async function copyNumber(label: string, number: string) {
    try {
      await navigator.clipboard.writeText(number)
      setCopied(label)
      window.setTimeout(() => setCopied((current) => (current === label ? '' : current)), 2000)
    } catch {
      // Some browsers block copying; the number is still on screen to copy by hand.
    }
  }

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
      <SectionTitle label="Contact" title="Let's work" accent="together" />
      {/* One question for every kind of visitor (companies hiring, clients, people saying hi), then the next step. */}
      <p className="contact-intro">
        Hiring for a team, have a project to discuss, or just want to say hi? Send me a message below or{' '}
        <a href={asset('/Ali_Chahine_CV.pdf')} download="Ali_Chahine_CV.pdf">
          download my CV
        </a>
        .
      </p>

      {/* One box per contact, read from src/data/contact.ts. Clicking the box opens the contact
          (email, LinkedIn…); on a phone box it copies the number. A number that's on WhatsApp also gets a round WhatsApp
          button: only that button opens the chat. Links starting with https open in a new tab. */}
      <ul className="contact-tiles">
        {contacts.map((contact) => {
          const icon = contact.icon ?? (contact.href.startsWith('tel:') ? 'phone' : undefined)
          const isCopied = copied === contact.label
          // The inside of the box, the same for a link and for a copy button.
          const content = (
            <>
              {icon && (
                <span className="contact-tile__icon">
                  <Icon name={icon} size={22} />
                </span>
              )}
              <span className="contact-tile__text">
                <strong>
                  {contact.label}
                  {/* "&&" only renders the flag when the contact has one. */}
                  {contact.flag && <img src={asset(contact.flag)} alt="" className="contact-flag" />}
                </strong>
                {/* role="status" makes screen readers say "Copied!" when it appears. */}
                <span className={isCopied ? 'contact-tile__copied' : undefined} role="status">
                  {isCopied ? 'Copied!' : contact.value}
                </span>
              </span>
            </>
          )
          return (
            <li key={contact.label} className="contact-tile">
              {contact.href.startsWith('tel:') ? (
                // Phone numbers: a button that copies the number. title and aria-label say so.
                <button
                  type="button"
                  className="contact-tile__main"
                  onClick={() => copyNumber(contact.label, contact.value)}
                  aria-label={`Copy ${contact.value}`}
                  title="Click to copy"
                >
                  {content}
                </button>
              ) : (
                <a
                  href={contact.href}
                  className="contact-tile__main"
                  {...(contact.href.startsWith('http') && { target: '_blank', rel: 'noreferrer' })}
                >
                  {content}
                </a>
              )}
              {contact.whatsapp && (
                <a
                  href={contact.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-tile__whatsapp"
                  aria-label={`WhatsApp ${contact.value}`}
                  title="Chat on WhatsApp"
                >
                  <Icon name="whatsapp" size={20} />
                </a>
              )}
            </li>
          )
        })}
      </ul>

      <p className="contact-form-label">Or send me a message:</p>

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
