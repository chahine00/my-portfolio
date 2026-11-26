// The "Contact" section: a box per contact (email, phones, LinkedIn…), then a form that sends a message.
// It uses STATE for the form fields and the sending status, so it's a good one to study.

// useState is a React "hook". It lets a component remember values,
// and React re-draws the component whenever one of those values changes.
import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { useLocation } from 'react-router'
import { sendContactMessage } from '../../services/api.ts'
import { topics, type Topic } from '../../data/identity.ts'
import { contacts, type ContactLink } from '../../data/contact.ts'
import { asset } from '../../utils/asset.ts'
import Icon from '../../components/Icon.tsx'
import SectionTitle from '../../components/SectionTitle.tsx'

// A "union type": status can ONLY be one of these four strings.
// TypeScript will show an error if you try to set anything else (like 'done').
type Status = 'idle' | 'sending' | 'sent' | 'error'

// Phone numbers (src/data/contact.ts), each with its copy button and WhatsApp button.
// Set this to false to hide them from the page.
const SHOW_PHONE_NUMBERS = true

const isPhone = (contact: ContactLink) => contact.href.startsWith('tel:')
// The numbers shown in the "Phone numbers" box (none when SHOW_PHONE_NUMBERS is off).
const phones = SHOW_PHONE_NUMBERS ? contacts.filter(isPhone) : []

function Contact() {
  // useState returns two things: [currentValue, functionToChangeIt].
  // The value in useState(...) is the starting value.
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle') // <Status> tells TypeScript which values are allowed
  // What the message is about (a project, a collaboration, a role…): optional. Links like the hero's
  // "Start a project" choose one for the visitor (they pass { topic } in the link's state).
  const { state, key } = useLocation()
  const wantedTopic = (state as { topic?: Topic } | null)?.topic
  const [topic, setTopic] = useState<Topic | null>(wantedTopic ?? null)
  // A new link with a topic (even the same one again, "key" changes) picks it.
  const [seenKey, setSeenKey] = useState(key)
  if (key !== seenKey) {
    setSeenKey(key)
    if (wantedTopic) setTopic(wantedTopic)
  }
  const chosen = topics.find((item) => item.id === topic)
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

  // The "Phone numbers" box: one box for all the numbers, a row per number. Clicking a number copies it;
  // a number that's on WhatsApp also gets the WhatsApp button.
  function renderPhones() {
    return (
      <li key="phones" className="contact-tile contact-tile--phones">
        <span className="contact-tile__icon">
          <Icon name="phone" size={22} />
        </span>
        <div className="contact-phones">
          <strong>Phone numbers</strong>
          <ul className="contact-phones__list">
            {phones.map((phone) => {
              const isCopied = copied === phone.label
              return (
                <li key={phone.label} className="contact-phones__row">
                  <button
                    type="button"
                    className="contact-phones__number"
                    onClick={() => copyNumber(phone.label, phone.value)}
                    aria-label={`Copy ${phone.value}`}
                    title="Click to copy"
                  >
                    {phone.flag && <img src={asset(phone.flag)} alt="" className="contact-flag" loading="lazy" decoding="async" />}
                    {/* The number keeps its space while "Copied!" shows over it, so the WhatsApp icons
                        don't move. role="status" makes screen readers say "Copied!" when it appears. */}
                    <span className="contact-phones__value">
                      <span className={isCopied ? 'is-hidden' : undefined} aria-hidden={isCopied}>
                        {phone.value}
                      </span>
                      <span className="contact-tile__copied" role="status">
                        {isCopied ? 'Copied!' : ''}
                      </span>
                    </span>
                  </button>
                  {phone.whatsapp && (
                    <a
                      href={phone.whatsapp}
                      target="_blank"
                      rel="noreferrer"
                      className="contact-tile__whatsapp"
                      aria-label={`WhatsApp ${phone.value}`}
                      title="Chat on WhatsApp"
                    >
                      {/* Icon only; screen readers get the aria-label above. */}
                      <Icon name="whatsapp" size={14} />
                    </a>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </li>
    )
  }

  // This function runs when the form is submitted (button click or pressing Enter).
  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    // By default the browser reloads the page when a form is submitted.
    // preventDefault() stops that so React can handle it instead.
    event.preventDefault()

    setStatus('sending')

    // try/catch: run the code in "try". If anything throws an error, jump to "catch".
    try {
      // The topic goes first in the message, so the email says what it's about.
      await sendContactMessage({ name, email, message: chosen ? `[${chosen.tag}]\n\n${message}` : message })
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
      {/* One box per contact, read from src/data/contact.ts. Clicking the box opens the contact
          (email, LinkedIn…); on a phone box it copies the number. A number that's on WhatsApp also gets a small
          "WhatsApp" button: only that button opens the chat. Links starting with https open in a new tab. */}
      <SectionTitle label="Contact" title="Let's" accent="talk." />
      {/* Axihex builds and maintains its own apps first, and also welcomes projects and collaborations:
          the intro names both, in that order, like the form's topic choices (src/data/identity.ts). */}
      <p className="contact-intro">
        Using one of our apps and need help, or have feedback? Have a project or a collaboration in mind? Reach out by
        email, on LinkedIn, or with the form.
      </p>

      {/* Two boxes side by side on wide screens, level at the top and the bottom: the ways to reach
          out on the left, the message form on the right. Stacked on phones. */}
      <div className="contact-layout">
        <div className="contact-aside">
          <ul className="contact-tiles">
            {/* The phone numbers share one "Phone numbers" box (renderPhones below), placed where the first number
                is in the list; every other contact gets its own box. */}
            {contacts.map((contact) => {
              if (isPhone(contact)) return contact === phones[0] ? renderPhones() : null
              const icon = contact.icon
              // The inside of the box.
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
                      {contact.flag && <img src={asset(contact.flag)} alt="" className="contact-flag" loading="lazy" decoding="async" />}
                    </strong>
                    <span>{contact.value}</span>
                  </span>
                </>
              )
              return (
                <li key={contact.label} className="contact-tile">
                  <a
                    href={contact.href}
                    className="contact-tile__main"
                    {...(contact.href.startsWith('http') && { target: '_blank', rel: 'noreferrer' })}
                  >
                    {content}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="contact-panel">
          <p className="contact-form-label">Send a message</p>

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
              {/* What it's about: one choice, or none. Choosing the same one again clears it. */}
              <fieldset className="contact-topics">
                <legend>What brings you here?</legend>
                <div className="contact-topics__list">
                  {/* "A role for the founder" only shows when you come from the founder's page (its
                      "Get in touch"): the studio's own pages stay about the studio's work. */}
                  {topics.filter((item) => item.id !== 'role' || wantedTopic === 'role').map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="contact-topic"
                      aria-pressed={topic === item.id}
                      onClick={() => setTopic((current) => (current === item.id ? null : item.id))}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              {/*
              A "CONTROLLED INPUT":
              - value={name} → the input always shows what's stored in state
              - onChange     → every time you type, update the state with the new text
              event.target is the input element, and .value is the text inside it.
            */}
              <label className="contact-field">
                <span>Name</span>
                <input
                  name="name"
                  autoComplete="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>
              <label className="contact-field">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label className="contact-field">
                <span>Message</span>
                <textarea
                  name="message"
                  placeholder={chosen?.placeholder ?? 'Your message'}
                  rows={5}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                />
              </label>

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
        </div>
      </div>
    </section>
  )
}

export default Contact
