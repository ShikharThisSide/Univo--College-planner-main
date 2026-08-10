import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Palette, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeSwitcher({ externalOpen, onExternalClose }) {
  const { accent, setAccent, mode, toggleMode, palettes } = useTheme()
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen ?? internalOpen
  const setOpen = onExternalClose ? (v) => (v ? setInternalOpen(true) : onExternalClose()) : setInternalOpen

  return (
    <div className="relative">
      {!externalOpen && (
        <button
          type="button"
          onClick={() => setInternalOpen(!internalOpen)}
          className="p-2.5 rounded-xl glass-panel hover:bg-white/8 transition-colors"
          aria-label="Theme settings"
        >
          <Palette size={18} className="text-white/70" />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="absolute right-0 top-full mt-2 w-72 z-50 glass-panel rounded-2xl p-4 shadow-2xl"
            >
              <p className="text-xs uppercase tracking-wider text-white/40 mb-3 font-semibold">Accent palette</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {palettes.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setAccent(p.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-left text-xs ${
                      accent === p.id ? 'border-white/30 bg-white/8' : 'border-white/8 hover:border-white/15'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full shrink-0"
                      style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
                    />
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="border-t border-white/8 pt-3">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/6 text-sm"
                >
                  <span>{mode === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                  {mode === 'dark' ? <Sun size={16} className="text-white/50" /> : <Moon size={16} className="text-white/50" />}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
