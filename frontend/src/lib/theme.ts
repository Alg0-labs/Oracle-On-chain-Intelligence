import { useState, useEffect } from 'react'

export type Theme = 'dark' | 'light'

const KEY = 'oracle-theme'

function getInitial(): Theme {
  const stored = localStorage.getItem(KEY) as Theme | null
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitial)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(KEY, theme)
  }, [theme])

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return { theme, toggle }
}

// Call once at boot so the correct data-theme is set before first paint
export function initTheme() {
  const stored = localStorage.getItem(KEY) as Theme | null
  const theme =
    stored === 'dark' || stored === 'light'
      ? stored
      : window.matchMedia?.('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark'
  document.documentElement.setAttribute('data-theme', theme)
}
