// "Services" are files that talk to the outside world (like a server).
// Keeping this code here means the components stay simple and only care about the UI.

// The shape of the data the contact form sends.
export interface ContactMessage {
  name: string
  email: string
  message: string
}

// The site has no server of its own (it's static files on GitHub Pages), so a free service,
// FormSubmit (formsubmit.co), receives the message and forwards it to this inbox by email.
// No password or secret is needed here: never put an email password in this file,
// because everything in the frontend is public.
//
// The first message ever sent triggers an "Activate form" email from FormSubmit to this address:
// click the button in it once, and every message after that is delivered.
// After activating, FormSubmit also gives you a random code you can use instead of the address
// below, so the address doesn't appear in the site's code: 'https://formsubmit.co/ajax/<code>'.
const CONTACT_FORM_URL = 'https://formsubmit.co/ajax/leb_ach@hotmail.com'

// "async" means this function does something that takes time (a network request).
// It returns a Promise. "Promise<void>" means "it finishes later and gives back nothing".
export async function sendContactMessage(data: ContactMessage): Promise<void> {
  // fetch() sends a request to a server. "await" waits until the answer comes back.
  const response = await fetch(CONTACT_FORM_URL, {
    method: 'POST', // POST = we are SENDING data
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      ...data, // name, email, message
      _subject: `Portfolio message from ${data.name}`, // the email's subject line
      _replyto: data.email, // pressing "Reply" in Gmail answers the visitor directly
      _template: 'table', // a neat table layout for the email
    }),
  })

  // FormSubmit answers with { success: "true" } or { success: "false", message: "…" }.
  const result: { success?: string | boolean; message?: string } = await response.json().catch(() => ({}))

  // response.ok is true for success codes (200–299).
  // Throwing an error here makes the "catch" block in Contact.tsx run.
  if (!response.ok || String(result.success) !== 'true') {
    throw new Error(result.message ?? `Failed to send message (${response.status})`)
  }
}
