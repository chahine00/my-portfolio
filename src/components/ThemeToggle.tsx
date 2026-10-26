// A sun/moon button in the navbar that switches between light and dark mode.
// The choice is saved in the browser, so it's remembered next visit.
// (index.html applies the saved choice before the page shows, so there's no flash.)

import { useState } from 'react'
import Icon from './Icon.tsx'

type Theme = 'light' | 'dark'

// The theme on screen right now: the saved choice, or else the computer's setting.
function currentTheme(): Theme {
  const saved = document.documentElement.dataset.theme
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function ThemeToggle() {
  // Passing a function to useState runs it once, on the first render.
  const [theme, setTheme] = useState<Theme>(currentTheme)

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    // data-theme on <html> switches the CSS colors (see the top of global.css).
    document.documentElement.dataset.theme = next
    // localStorage can be blocked (e.g. private mode), so we don't let that break the button.
    try {
      localStorage.setItem('theme', next)
    } catch {
      // ignore: the theme still changes, it just won't be remembered
    }
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
    </button>
  )
}

export default ThemeToggle
