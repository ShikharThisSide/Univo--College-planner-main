import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeSwitcher({ open: controlledOpen, onOpenChange }) {
  const { accent, setAccent, mode, setMode, palettes } = useTheme()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = typeof controlledOpen === 'boolean'
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = (nextOpen) => {
    if (isControlled) onOpenChange?.(nextOpen)
    else setInternalOpen(nextOpen)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="theme-trigger"
        aria-label="Change theme"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              role="dialog"
              aria-label="Theme settings"
              className="theme-popover absolute right-0 top-full mt-2 w-80 z-50 rounded-2xl p-4 shadow-2xl"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Appearance</p>
                  <p className="mt-1 text-xs theme-muted">Choose a mode and accent palette.</p>
                </div>
                <span className="theme-status">{mode === 'dark' ? 'Dark' : 'Light'}</span>
              </div>

              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Colour mode">
                <button
                  type="button"
                  onClick={() => setMode('light')}
                  className={`theme-mode-option ${mode === 'light' ? 'is-selected' : ''}`}
                  aria-pressed={mode === 'light'}
                >
                  <Sun size={16} /> Light
                </button>
                <button
                  type="button"
                  onClick={() => setMode('dark')}
                  className={`theme-mode-option ${mode === 'dark' ? 'is-selected' : ''}`}
                  aria-pressed={mode === 'dark'}
                >
                  <Moon size={16} /> Dark
                </button>
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-wider theme-muted">Accent palette</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {palettes.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setAccent(p.id)}
                    className={`theme-palette-option ${accent === p.id ? 'is-selected' : ''}`}
                    aria-pressed={accent === p.id}
                  >
                    <span
                      className="w-5 h-5 rounded-full shrink-0"
                      style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
                    />
                    <span className="flex-1">{p.label}</span>
                    {accent === p.id && <Check size={14} aria-hidden="true" />}
                  </button>
                ))}
              </div>
              <div className="theme-footer">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="theme-close-button"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
