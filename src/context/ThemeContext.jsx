import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ACCENT_PALETTES } from '../lib/constants'

const ThemeContext = createContext(null)

const DEFAULT_ACCENT = 'forest-lime'
const DEFAULT_MODE = 'dark'

function readPreference(key, fallback, allowedValues) {
  try {
    const value = localStorage.getItem(key)
    return allowedValues.includes(value) ? value : fallback
  } catch {
    return fallback
  }
}

export function ThemeProvider({ children }) {
  const accentIds = ACCENT_PALETTES.map((palette) => palette.id)
  const [accent, setAccentState] = useState(() => readPreference('univoAccent', DEFAULT_ACCENT, accentIds))
  const [mode, setModeState] = useState(() => readPreference('univoMode', DEFAULT_MODE, ['dark', 'light']))

  const setAccent = (nextAccent) => {
    if (accentIds.includes(nextAccent)) setAccentState(nextAccent)
  }

  const setMode = (nextMode) => {
    if (nextMode === 'dark' || nextMode === 'light') setModeState(nextMode)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent)
    document.documentElement.setAttribute('data-theme', mode)
    try {
      localStorage.setItem('univoAccent', accent)
      localStorage.setItem('univoMode', mode)
    } catch {
      // The theme still works when browser storage is unavailable.
    }
  }, [accent, mode])

  const toggleMode = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'))

  const value = useMemo(
    () => ({ accent, setAccent, mode, setMode, toggleMode, palettes: ACCENT_PALETTES }),
    [accent, mode]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
