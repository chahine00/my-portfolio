// A sun/moon button in the navbar that switches between light and dark mode.
// By default the site follows the device (phone or computer) setting, and switches with it.
// A choice made with the button is remembered, but only until the device itself switches mode:
// then the site follows the device again. (index.html applies a saved choice before the page shows,
// so there's no flash.)

import { useEffect, useState } from 'react'
import Icon from './Icon.tsx'

type Theme = 'light' | 'dark'

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)')
const systemTheme = (): Theme => (darkQuery().matches ? 'dark' : 'light')

// The theme on screen right now: the choice made with the button, or else the device's setting.
function currentTheme(): Theme {
  const picked = document.documentElement.dataset.theme
  if (picked === 'light' || picked === 'dark') return picked
  return systemTheme()
}

// Back to following the device: no data-theme on <html>, nothing saved.
// localStorage can be blocked (e.g. private mode), so we never let it break anything.
function followDevice() {
  delete document.documentElement.dataset.theme
  try {
    localStorage.removeItem('theme')
  } catch {
    // ignore
  }
}

function ThemeToggle() {
  // Passing a function to useState runs it once, on the first render.
  const [theme, setTheme] = useState<Theme>(currentTheme)

  // When the device switches mode (e.g. the phone goes dark at night), follow it,
  // even if a choice was made with the button before.
  useEffect(() => {
    const query = darkQuery()
    function handleChange() {
      followDevice()
      setTheme(systemTheme())
    }
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    const system = systemTheme()
    // Picking the device's own mode just means "follow the device" again.
    if (next === system) {
      followDevice()
      return
    }
    // data-theme on <html> switches the CSS colors (see the top of global.css). The device's mode is
    // saved with the choice, so index.html can drop the choice once the device has switched.
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', JSON.stringify({ theme: next, system }))
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
