import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Command } from 'lucide-react'
import { commandPaletteItems } from '../../lib/mockData'

export default function CommandPalette({ open, onClose, onThemeOpen }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const filtered = commandPaletteItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (item) => {
    if (item.action === 'theme') {
      onThemeOpen?.()
      onClose()
      return
    }
    if (item.path) {
      navigate(item.path)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg glass-panel rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8">
              <Search size={18} className="text-white/40 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to module, search notes, message someone…"
                className="flex-1 bg-transparent border-0 outline-none text-sm text-white placeholder:text-white/35"
              />
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-white/8 text-[10px] text-white/40 font-mono">
                <Command size={10} />K
              </kbd>
            </div>
            <ul className="max-h-72 overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-white/40">No results found</li>
              ) : (
                filtered.map((item, i) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-white/6 transition-colors ${i === 0 ? 'bg-white/4' : ''}`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] uppercase tracking-wider text-white/30">{item.category}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return { open, setOpen }
}
