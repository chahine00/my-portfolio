// This is the ENTRY POINT of the app — the first file that runs.
// index.html loads this file, and this file puts React on the page.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './styles/global.css' // Importing a CSS file applies its styles to the whole app.
import App from './app/App.tsx'

// Find the empty <div id="root"></div> inside index.html.
const rootElement = document.getElementById('root')

// getElementById can return null if the element doesn't exist,
// so TypeScript makes us handle that case before using it.
if (rootElement === null) {
  throw new Error('Could not find the #root element in index.html')
}

// Tell React to draw our <App /> component inside that div.
// <StrictMode> is a helper that warns you about common mistakes while developing.
// <BrowserRouter> lets the app have several pages (like /blog) using the URL.
// basename is the sub-folder the site lives in on GitHub Pages (see vite.config.ts).
createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
