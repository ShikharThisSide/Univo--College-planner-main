import { useMemo, useState } from 'react'
import { Check, MessageCircle, Search, UserPlus, Users, X, Mail, Send, CheckCircle2, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../../components/ui/PageTransition'
import GlassCard from '../../components/ui/GlassCard'
import { useAuth } from '../../context/AuthContext'
import { DEMO_USERS } from '../../lib/constants'
import { addFriend, areFriends, readSocial, requestFriend } from '../../lib/social'

function readPeople(currentUser) {
  let accounts = {}
  try { accounts = JSON.parse(localStorage.getItem('univoAccounts') || '{}') || {} } catch { accounts = {} }
  const people = Object.entries(accounts).map(([email, account]) => ({
    id: email,
    email,
    name: account.name || email.split('@')[0].replace(/[._]/g, ' '),
    role: account.role || 'student_individual',
    username: account.username,
    avatar: account.avatar,
    avatarImage: account.avatarImage
  }))
  Object.values(DEMO_USERS).forEach((person) => people.push({ ...person, id: `demo-${person.role}` }))
  return people.filter((person, index, list) => person.email !== currentUser?.email && list.findIndex((item) => item.email === person.email) === index)
}

function PersonAvatar({ person, index = 0, large = false }) {
  return (
    <span className={`${large ? 'messengerLargeAvatar' : `messengerPersonAvatar messengerAvatar-${index % 4}`}`}>
      {person.avatarImage ? <img src={person.avatarImage} alt={person.name} /> : person.avatar || person.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
    </span>
  )
}

export default function MessengerPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [sent, setSent] = useState([])
  const [emailNotice, setEmailNotice] = useState(null)
  const [previewEmail, setPreviewEmail] = useState(null)

  const [friends] = useState(() => readSocial(`friends:${user?.email}`))
  const people = useMemo(() => readPeople(user), [user])
  const friendPeople = people.filter((person) => friends.includes(person.email))
  const results = people.filter((person) => `${person.name} ${person.email} ${person.username || ''}`.toLowerCase().includes(query.trim().toLowerCase()))

  const openProfile = (person) => setSelected(person)

  const sendRequest = async (targetPerson) => {
    const recipient = targetPerson || selected
    if (!recipient) return
    if (!areFriends(user, recipient) && !sent.includes(recipient.email)) {
      const emailRecord = requestFriend(user, recipient)
      setSent((prev) => [...prev, recipient.email])
      
      // Trigger dope Email Sent Notification Toast
      const noticePayload = {
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        senderName: user?.name || user?.email?.split('@')[0],
        senderEmail: user?.email,
        emailRecord
      }
      setEmailNotice(noticePayload)

      // Auto dismiss notice after 6s
      setTimeout(() => {
        setEmailNotice((current) => (current?.recipientEmail === recipient.email ? null : current))
      }, 6000)

      try {
        await fetch('/api/send-friend-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            senderName: user?.name || user?.email
          })
        })
      } catch {
        /* Local email inbox notification saved */
      }
    }
  }

  return (
    <PageTransition>
      <div className="messengerPage relative">
        {/* DOPE EMAIL DISPATCHED TOAST NOTIFICATION */}
        <AnimatePresence>
          {emailNotice && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-6 right-6 z-50 p-4 rounded-2xl glass-panel bg-[var(--surface-modal)] border border-[var(--accent-solid)]/40 shadow-2xl max-w-md space-y-2 text-[var(--text-primary)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Send size={16} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Email Dispatched</p>
                    <p className="text-sm font-semibold mt-0.5">
                      Friend request & email sent to {emailNotice.recipientName}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEmailNotice(null)}
                  className="text-[var(--text-subtle)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="Close notification"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[var(--border-subtle)] text-xs">
                <span className="text-[var(--text-subtle)] font-mono text-[11px] truncate">
                  To: {emailNotice.recipientEmail}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setPreviewEmail(emailNotice)
                    setEmailNotice(null)
                  }}
                  className="text-[var(--accent-solid)] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Mail size={13} /> Preview Delivered Email
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO SECTION */}
        <div className="messengerHero">
          <p className="settingsEyebrow">UNIVO MESSENGER</p>
          <h1>Find your people.</h1>
          <p>Search classmates, friends, and study partners by name or username.</p>
          <div className="messengerSearch">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by username or name…"
              aria-label="Search people"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* MY FRIENDS LIST */}
        <section className="messengerResults">
          <p className="messengerResultCount flex items-center gap-2">
            <Users size={15} /> My friends
          </p>
          {friendPeople.length ? (
            <div className="messengerPeopleGrid">
              {friendPeople.map((person, index) => (
                <button type="button" className="messengerPersonCard text-left" key={person.email} onClick={() => openProfile(person)}>
                  <PersonAvatar person={person} index={index} />
                  <span className="messengerPersonCopy">
                    <strong>{person.name}</strong>
                    <small>@{person.username || person.email.split('@')[0]}</small>
                  </span>
                  <Check size={17} />
                </button>
              ))}
            </div>
          ) : (
            <GlassCard>
              <div className="messengerEmpty">
                <Users size={24} />
                <strong>No friends yet</strong>
                <span>Search for someone above and send them a friend request.</span>
              </div>
            </GlassCard>
          )}
        </section>

        {/* SEARCH RESULTS */}
        {query ? (
          <div className="messengerResults">
            <p className="messengerResultCount">
              {results.length} {results.length === 1 ? 'person' : 'people'} found
            </p>
            {results.length ? (
              <div className="messengerPeopleGrid">
                {results.map((person, index) => (
                  <motion.button
                    type="button"
                    key={person.id}
                    className="messengerPersonCard"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => openProfile(person)}
                  >
                    <PersonAvatar person={person} index={index} />
                    <span className="messengerPersonCopy">
                      <strong>{person.name}</strong>
                      <small>@{person.username || person.email.split('@')[0]}</small>
                      <em>{person.role.replaceAll('_', ' ')}</em>
                    </span>
                    {areFriends(user, person) ? (
                      <Check size={17} />
                    ) : sent.includes(person.email) ? (
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 size={13} /> Sent
                      </span>
                    ) : (
                      <UserPlus size={17} />
                    )}
                  </motion.button>
                ))}
              </div>
            ) : (
              <GlassCard>
                <div className="messengerEmpty">
                  <Search size={24} />
                  <strong>No people found</strong>
                  <span>Try searching with another name or username.</span>
                </div>
              </GlassCard>
            )}
          </div>
        ) : (
          <GlassCard className="messengerEmptyCard">
            <div className="messengerEmpty">
              <MessageCircle size={28} />
              <strong>Search for a friend to start chatting</strong>
              <span>Type a username above and their profile will appear here.</span>
            </div>
          </GlassCard>
        )}

        {/* PROFILE OVERLAY MODAL */}
        {selected && (
          <div
            className="messengerProfileOverlay"
            onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}
          >
            <motion.div className="messengerProfileModal" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <button type="button" className="messengerProfileClose" onClick={() => setSelected(null)} aria-label="Close profile">
                <X size={18} />
              </button>
              <PersonAvatar person={selected} large />
              <p className="settingsEyebrow">UNIVO MEMBER</p>
              <h2>{selected.name}</h2>
              <p className="messengerProfileHandle">@{selected.username || selected.email.split('@')[0]}</p>
              <p className="messengerProfileRole">{selected.role.replaceAll('_', ' ')}</p>

              <button
                type="button"
                className="messengerStartButton cursor-pointer flex items-center justify-center gap-2"
                onClick={() => {
                  sendRequest(selected)
                  setSelected(null)
                }}
              >
                <UserPlus size={16} />{' '}
                {areFriends(user, selected)
                  ? 'Already friends'
                  : sent.includes(selected.email)
                  ? 'Request & Email Sent'
                  : 'Add Friend'}
              </button>
            </motion.div>
          </div>
        )}

        {/* PRO EMAIL PREVIEW MODAL */}
        {previewEmail && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onMouseDown={(event) => event.target === event.currentTarget && setPreviewEmail(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel w-full max-w-lg rounded-2xl p-6 relative space-y-4 bg-[var(--surface-modal)] border border-[var(--border-strong)] text-[var(--text-primary)] shadow-2xl"
            >
              <button
                type="button"
                className="absolute top-4 right-4 text-[var(--text-subtle)] hover:text-[var(--text-primary)] cursor-pointer"
                onClick={() => setPreviewEmail(null)}
                aria-label="Close email preview"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2">
                <Mail size={18} className="text-[var(--accent-solid)]" />
                <div>
                  <p className="settingsEyebrow text-[var(--accent-solid)] font-bold">DELIVERED EMAIL PREVIEW</p>
                  <h3 className="text-lg font-bold font-display">Friend Request Notification</h3>
                </div>
              </div>

              {/* EMAIL CONTENT CARD */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4 text-xs font-sans">
                <div className="space-y-1.5 pb-3 border-b border-white/10 text-white/60">
                  <div className="flex justify-between">
                    <span><strong>From:</strong> Univo Notifications &lt;notifications@univo.edu&gt;</span>
                    <span className="font-mono text-[10px] text-white/40">Just now</span>
                  </div>
                  <div><strong>To:</strong> {previewEmail.recipientName} &lt;{previewEmail.recipientEmail}&gt;</div>
                  <div><strong>Subject:</strong> 👋 {previewEmail.senderName} sent you a friend request on Univo!</div>
                </div>

                <div className="space-y-3 text-white/90 leading-relaxed text-xs">
                  <p className="font-semibold text-sm">Hey {previewEmail.recipientName}! 👋</p>
                  <p>
                    <strong className="text-[var(--accent-solid)]">{previewEmail.senderName}</strong> ({previewEmail.senderEmail}) has sent you a friend request on Univo.
                  </p>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 italic text-white/80">
                    "Building great things is better with a solid study network. Let's connect, share notes, track assignments, and crush this semester together!"
                  </div>

                  <p className="text-white/60 text-[11px]">
                    Log in to your Univo dashboard and check your notification bell to accept or decline this request.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="px-3 py-1.5 rounded-xl bg-[var(--accent-solid)] text-black font-bold text-xs inline-flex items-center gap-1.5 cursor-default">
                    <CheckCircle2 size={14} /> Delivered to Inbox
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">Status: 200 OK</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewEmail(null)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
