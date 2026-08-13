import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Check, Trash2, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { addFriend, readSocial, writeSocial } from '../../lib/social'

const PRODUCT_UPDATES = [{ id: 'groups-launch-2026-08', title: 'Groups are now available', body: 'Create private study and project groups from the new Groups section.', createdAt: new Date('2026-08-13T00:00:00+05:30').getTime(), kind: 'update' }]

function formatNotificationTime(timestamp) {
  if (!timestamp) return ''
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(timestamp)
}

export default function NotificationBell() {
  const { user } = useAuth()
  const storageKey = user?.email || 'guest'
  const [open, setOpen] = useState(false)
  const [requests, setRequests] = useState(() => readSocial(`requests:${storageKey}`))
  const [dismissed, setDismissed] = useState(() => readSocial(`dismissed-notifications:${storageKey}`))
  const account = (() => { try { return JSON.parse(localStorage.getItem('univoAccounts') || '{}')[storageKey] } catch { return null } })()
  useEffect(() => {
    const refresh = () => setRequests(readSocial(`requests:${storageKey}`))
    window.addEventListener('univo-social-updated', refresh)
    return () => window.removeEventListener('univo-social-updated', refresh)
  }, [storageKey])
  const updateNotifications = useMemo(() => PRODUCT_UPDATES.filter((item) => !dismissed.includes(item.id)), [dismissed])
  const welcome = account?.createdAt && !dismissed.includes(`welcome-${storageKey}`) ? [{ id: `welcome-${storageKey}`, title: `Welcome ${account.name || user?.name || ''} to UNIVO`, body: 'Explore the features, connect with your people, and enjoy your time here.', createdAt: account.createdAt, kind: 'welcome' }] : []
  const pendingRequests = requests.filter((item) => item.status === 'pending').map((item) => ({ id: `request-${item.id}`, requestId: item.id, title: `${item.fromName?.trim() || item.fromEmail?.split('@')[0] || 'Someone'} sent you a friend request`, body: 'Accept or reject this request.', createdAt: item.createdAt, kind: 'request', request: item }))
  const items = [...pendingRequests, ...welcome, ...updateNotifications]
  const unreadCount = items.length
  const dismiss = (id) => { const next = [...dismissed, id]; setDismissed(next); writeSocial(`dismissed-notifications:${storageKey}`, next) }
  const respond = (item, accepted) => {
    const next = requests.map((request) => request.id === item.requestId ? { ...request, status: accepted ? 'accepted' : 'rejected' } : request)
    setRequests(next); writeSocial(`requests:${storageKey}`, next)
    if (accepted) addFriend(user, { email: item.request.fromEmail, name: item.request.fromName, avatar: item.request.fromAvatar })
  }
  const deleteAll = () => { const nextRequests = requests.map((item) => item.status === 'pending' ? { ...item, status: 'dismissed' } : item); const nextDismissed = [...dismissed, ...welcome.map((item) => item.id), ...updateNotifications.map((item) => item.id)]; setRequests(nextRequests); writeSocial(`requests:${storageKey}`, nextRequests); setDismissed(nextDismissed); writeSocial(`dismissed-notifications:${storageKey}`, nextDismissed) }
  return <div className="relative"><button type="button" onClick={() => setOpen(!open)} className="group relative p-2.5 rounded-xl glass-panel cursor-pointer hover:bg-white/8 hover:border-[var(--accent-solid)]/35 transition-all" aria-label="Notifications"><Bell size={18} className="text-white/70 transition-colors group-hover:text-[var(--accent-solid)]" />{unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full univo-gradient-bg text-[10px] font-bold flex items-center justify-center badge-pulse">{unreadCount}</span>}</button><AnimatePresence>{open && <><div className="fixed inset-0 z-40" onClick={() => setOpen(false)} /><motion.div initial={{ opacity: 0, y: 8, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .96 }} className="absolute right-0 top-full mt-2 w-80 z-50 glass-panel rounded-2xl overflow-hidden shadow-2xl"><div className="px-4 py-3 border-b border-white/8 flex items-center justify-between"><span className="text-sm font-semibold">Notifications</span>{items.length > 0 && <button type="button" onClick={deleteAll} className="text-[11px] text-white/45 hover:text-red-400 flex items-center gap-1"><Trash2 size={12} /> Delete all</button>}</div><ul className="max-h-96 overflow-y-auto">{items.map((item) => <li key={item.id} className="px-4 py-3 border-b border-white/5"><div className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full univo-gradient-bg mt-1.5 shrink-0" /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{item.title}</p><p className="text-xs text-white/45 mt-0.5">{item.body}</p><p className="text-[10px] text-white/30 mt-1">{formatNotificationTime(item.createdAt)}</p>{item.kind === 'request' && <div className="flex gap-2 mt-3"><button type="button" onClick={() => respond(item, true)} className="flex-1 rounded-lg bg-[var(--accent-solid)] text-black text-xs font-semibold py-2"><Check size={13} className="inline mr-1" />Allow</button><button type="button" onClick={() => respond(item, false)} className="flex-1 rounded-lg bg-white/10 text-xs font-semibold py-2"><X size={13} className="inline mr-1" />Reject</button></div>}</div><button type="button" onClick={() => item.kind === 'request' ? respond(item, false) : dismiss(item.id)} className="text-white/30 hover:text-red-400" aria-label="Delete notification"><X size={14} /></button></div></li>)}{items.length === 0 && <li className="px-4 py-10 text-center text-sm text-white/40">No notifications</li>}</ul></motion.div></>}</AnimatePresence></div>
}
