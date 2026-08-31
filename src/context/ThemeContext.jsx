import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ACCENT_PALETTES } from '../lib/constants'
import { useAuth } from './AuthContext'

const ThemeContext = createContext(null)

const DEFAULT_ACCENT = 'deep-teal'
const DEFAULT_MODE = 'light'

function readPreference(key, fallback, allowedValues) {
  try {
    const value = localStorage.getItem(key)
    return allowedValues.includes(value) ? value : fallback
  } catch {
    return fallback
  }
}

export function ThemeProvider({ children }) {
  const { user } = useAuth()
  const storageKey = (key) => `univoPreference:${user?.email || 'guest'}:${key}`
  const accentIds = ACCENT_PALETTES.map((palette) => palette.id)
  const [accent, setAccentState] = useState(() => readPreference(storageKey('accent'), DEFAULT_ACCENT, accentIds))
  const [mode, setModeState] = useState(() => readPreference(storageKey('mode'), DEFAULT_MODE, ['dark', 'light']))

  useEffect(() => {
    setAccentState(readPreference(storageKey('accent'), DEFAULT_ACCENT, accentIds))
    setModeState(readPreference(storageKey('mode'), DEFAULT_MODE, ['dark', 'light']))
  }, [user?.email])

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
      localStorage.setItem(storageKey('accent'), accent)
      localStorage.setItem(storageKey('mode'), mode)
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
