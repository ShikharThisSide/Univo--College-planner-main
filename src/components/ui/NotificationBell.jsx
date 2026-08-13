import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Check, X } from 'lucide-react'
import { notifications } from '../../lib/mockData'
import { addFriend, readSocial, writeSocial } from '../../lib/social'
import { useAuth } from '../../context/AuthContext'

export default function NotificationBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [requests, setRequests] = useState(() => readSocial(`requests:${user?.email}`))
  const refresh = () => setRequests(readSocial(`requests:${user?.email}`))
  const unreadCount = notifications.filter((n) => n.unread).length + requests.filter((item) => item.status === 'pending').length
  const respond = (request, accepted) => {
    const next = requests.map((item) => item.id === request.id ? { ...item, status: accepted ? 'accepted' : 'rejected' } : item)
    writeSocial(`requests:${user.email}`, next); setRequests(next)
    if (accepted) {
      const sender = { email: request.fromEmail, name: request.fromName, avatar: request.fromAvatar }
      addFriend(user, sender)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="group relative p-2.5 rounded-xl glass-panel cursor-pointer hover:bg-white/8 hover:border-[var(--accent-solid)]/35 transition-all"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-white/70 transition-colors group-hover:text-[var(--accent-solid)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full univo-gradient-bg text-[10px] font-bold flex items-center justify-center badge-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 z-50 glass-panel rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">{unreadCount} new</span>
                )}
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {requests.filter((item) => item.status === 'pending').map((request) => { const senderName = request.fromName?.trim() || request.fromEmail?.split('@')[0] || 'Someone'; return <li key={request.id} className="px-4 py-3 border-b border-white/5"><p className="text-sm font-medium">{senderName} sent you a friend request</p><div className="flex gap-2 mt-3"><button type="button" onClick={() => respond(request, true)} className="flex-1 rounded-lg bg-[var(--accent-solid)] text-black text-xs font-semibold py-2"><Check size={14} className="inline mr-1" />Allow</button><button type="button" onClick={() => respond(request, false)} className="flex-1 rounded-lg bg-white/10 text-xs font-semibold py-2"><X size={14} className="inline mr-1" />Reject</button></div></li> })}
                {notifications.map((n, i) => (
                  <motion.li
                    key={n.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`px-4 py-3 border-b border-white/5 hover:bg-white/4 cursor-pointer ${n.unread ? 'bg-white/3' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      {n.unread && <span className="w-1.5 h-1.5 rounded-full univo-gradient-bg mt-1.5 shrink-0 badge-pulse" />}
                      <div className={n.unread ? '' : 'ml-3.5'}>
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-white/45 mt-0.5">{n.body}</p>
                        <p className="text-[10px] text-white/30 mt-1">{n.time}</p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
