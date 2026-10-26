// "Services" are files that talk to the outside world (like a server).
// Keeping this code here means the components stay simple and only care about the UI.

// The shape of the data the contact form sends.
export interface ContactMessage {
  name: string
  email: string
  message: string
}

// The site has no server of its own (it's static files on GitHub Pages), so a small
// Google Apps Script web app receives the message and emails it. It runs inside the
// skewnest21@gmail.com Google account, so the email is sent from that Gmail address to
// leb_ach@hotmail.com. No password is needed here: never put an email password in this
// file, because everything in the frontend is public.
// The script's code is in apps-script/contact-form.gs.
const CONTACT_FORM_URL = 'https://script.google.com/macros/s/AKfycbwtBI__Jjb-J8liRn0TnIT6dRYgBTOvKEIdFGrctDyEc6Iwln3wfQIE6oayznHF4pnF/exec'

// "async" means this function does something that takes time (a network request).
// It returns a Promise. "Promise<void>" means "it finishes later and gives back nothing".
export async function sendContactMessage(data: ContactMessage): Promise<void> {
  // fetch() sends a request to a server. "await" waits until the answer comes back.
  // The body is sent as plain text: that's a "simple" request, which Apps Script accepts
  // from another website without extra permission checks (CORS).
  const response = await fetch(CONTACT_FORM_URL, {
    method: 'POST', // POST = we are SENDING data
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(data), // turn the object into a JSON text string
  })

  // The script answers with { success: true } or { success: false, message: "…" }.
  const result: { success?: boolean; message?: string } = await response.json().catch(() => ({}))

  // response.ok is true for success codes (200–299).
  // Throwing an error here makes the "catch" block in Contact.tsx run.
  if (!response.ok || result.success !== true) {
    throw new Error(result.message ?? `Failed to send message (${response.status})`)
  }
}
