import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ACCENT_PALETTES } from '../lib/constants'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [accent, setAccent] = useState(() => localStorage.getItem('univoAccent') || 'nova-purple')
  const [mode, setMode] = useState(() => localStorage.getItem('univoMode') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent)
    document.documentElement.setAttribute('data-theme', mode)
    localStorage.setItem('univoAccent', accent)
    localStorage.setItem('univoMode', mode)
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
