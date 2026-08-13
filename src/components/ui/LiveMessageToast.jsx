import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, ArrowRight, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function LiveMessageToast() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const handleLiveMessage = (e) => {
      const msg = e.detail
      if (!msg) return
      // Only show toast if the message is from someone else or explicitly dispatched as an alert
      if (msg.senderEmail !== user?.email) {
        setToast(msg)

        // Auto dismiss after 6 seconds
        const timer = setTimeout(() => {
          setToast((current) => (current?.id === msg.id ? null : current))
        }, 6000)

        return () => clearTimeout(timer)
      }
    }

    window.addEventListener('univo-live-message', handleLiveMessage)
    return () => window.removeEventListener('univo-live-message', handleLiveMessage)
  }, [user?.email])

  if (!toast) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -24, scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="fixed top-6 right-6 z-50 p-4 rounded-2xl glass-panel bg-[var(--surface-modal)] border border-[var(--accent-solid)]/40 shadow-2xl max-w-sm w-full space-y-2.5 text-[var(--text-primary)] cursor-pointer overflow-hidden"
        onClick={() => {
          navigate('/dashboard/me/messenger')
          setToast(null)
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 univo-gradient-bg" />

        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 rounded-xl bg-[var(--accent-muted)] text-[var(--accent-solid)] border border-[var(--accent-solid)]/30 shrink-0">
              <MessageCircle size={17} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold text-[var(--accent-solid)] uppercase tracking-wider">
                New Live Message
              </p>
              <p className="text-sm font-bold truncate mt-0.5">
                <span className="univo-gradient-text text-[var(--accent-solid)] font-extrabold">
                  {toast.senderName || 'Classmate'}
                </span>{' '}
                sent you a message
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setToast(null)
            }}
            className="text-[var(--text-subtle)] hover:text-[var(--text-primary)] p-1 cursor-pointer transition-colors"
            aria-label="Dismiss toast"
          >
            <X size={16} />
          </button>
        </div>

        {/* MESSAGE PREVIEW SNIPPET */}
        <div className="p-2.5 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] font-medium">
          {toast.text ? (
            <p className="truncate">"{toast.text}"</p>
          ) : toast.attachment ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <FileText size={14} /> Attachment: {toast.attachment.name}
            </span>
          ) : (
            <p>New message received in chat</p>
          )}
        </div>

        {/* FOOTER ACTION */}
        <div className="flex items-center justify-between text-[11px] font-bold text-[var(--accent-solid)] pt-0.5">
          <span className="flex items-center gap-1 hover:underline">
            Open Chat & Reply <ArrowRight size={12} />
          </span>
          <span className="text-[10px] text-[var(--text-subtle)] font-mono">
            {toast.timestamp || 'Just now'}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
