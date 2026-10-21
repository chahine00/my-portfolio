// "Services" are files that talk to the outside world (like a server).
// Keeping this code here means the components stay simple and only care about the UI.

// The shape of the data the contact form sends.
export interface ContactMessage {
  name: string
  email: string
  message: string
}

// Vite reads variables that start with VITE_ from a file called ".env".
// Example .env line:  VITE_API_URL=https://my-server.com
// "??" means: if the left side is null/undefined, use the right side instead ('').
const API_URL = import.meta.env.VITE_API_URL ?? ''

// "async" means this function does something that takes time (a network request).
// It returns a Promise. "Promise<void>" means "it finishes later and gives back nothing".
export async function sendContactMessage(data: ContactMessage): Promise<void> {
  // If no server is set up yet, just print the message in the browser console
  // (open DevTools → Console to see it) so the form still works while learning.
  if (!API_URL) {
    console.info('Contact message (no VITE_API_URL set):', data)
    return
  }

  // fetch() sends a request to a server. "await" waits until the answer comes back.
  // `${API_URL}/contact` is a template string: it puts API_URL inside the text.
  const response = await fetch(`${API_URL}/contact`, {
    method: 'POST', // POST = we are SENDING data
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data), // turn the object into a JSON text string
  })

  // response.ok is true for success codes (200–299).
  // Throwing an error here makes the "catch" block in Contact.tsx run.
  if (!response.ok) {
    throw new Error(`Failed to send message (${response.status})`)
  }
}
