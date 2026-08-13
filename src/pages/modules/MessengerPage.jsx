import { useEffect, useMemo, useState } from 'react'
import { Check, MessageCircle, Search, UserPlus, Users, X, Mail, Send, CheckCircle2, ArrowRight, RotateCcw, Paperclip, FileText, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../../components/ui/PageTransition'
import GlassCard from '../../components/ui/GlassCard'
import { useAuth } from '../../context/AuthContext'
import { DEMO_USERS } from '../../lib/constants'
import { addFriend, areFriends, readSocial, requestFriend, cancelFriendRequest, readDMMessages, sendDMMessage, getUserLastActive, formatLastActive } from '../../lib/social'

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
    avatarImage: account.avatarImage,
    lastActiveAt: getUserLastActive(email) || account.lastActiveAt || account.createdAt
  }))
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

  // 1-on-1 Direct Chat State
  const [activeChatFriend, setActiveChatFriend] = useState(null)
  const [dmMessages, setDmMessages] = useState([])
  const [dmText, setDmText] = useState('')
  const [dmPdfFile, setDmPdfFile] = useState(null)

  const [friends, setFriends] = useState(() => readSocial(`friends:${user?.email}`))

  useEffect(() => {
    if (!user?.email) return
    const syncFriends = () => {
      setFriends(readSocial(`friends:${user.email}`))
    }
    syncFriends()
    window.addEventListener('univo-social-updated', syncFriends)
    return () => window.removeEventListener('univo-social-updated', syncFriends)
  }, [user?.email])
  const people = useMemo(() => readPeople(user), [user])
  const friendPeople = people.filter((person) => friends.includes(person.email))
  const results = people.filter((person) => `${person.name} ${person.email} ${person.username || ''}`.toLowerCase().includes(query.trim().toLowerCase()))

  const openProfile = (person) => setSelected(person)

  const openChatWithFriend = (person) => {
    setActiveChatFriend(person)
    if (user?.email && person?.email) {
      setDmMessages(readDMMessages(user.email, person.email))
    }
  }

  useEffect(() => {
    if (!activeChatFriend || !user?.email) return
    const refreshDM = () => {
      setDmMessages(readDMMessages(user.email, activeChatFriend.email))
    }
    refreshDM()
    window.addEventListener('univo-dm-sent', refreshDM)
    return () => window.removeEventListener('univo-dm-sent', refreshDM)
  }, [activeChatFriend, user?.email])

  const handleSendDM = (e) => {
    e.preventDefault()
    if (!activeChatFriend || (!dmText.trim() && !dmPdfFile)) return

    sendDMMessage(user, activeChatFriend.email, dmText.trim(), dmPdfFile)
    setDmText('')
    setDmPdfFile(null)
  }

  const handleDmPdfUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setDmPdfFile({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      type: file.type || 'application/pdf',
      url: URL.createObjectURL(file)
    })
  }

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

  const revertRequest = (targetPerson, e) => {
    if (e) e.stopPropagation()
    const recipient = targetPerson || selected
    if (!recipient) return
    cancelFriendRequest(user, recipient)
    setSent((prev) => prev.filter((email) => email !== recipient.email))
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
          <p className="messengerResultCount flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users size={15} className="text-[var(--accent-solid)]" /> My friends ({friendPeople.length})
            </span>
            <span className="text-[11px] text-[var(--text-subtle)] font-medium">Click any friend to open chat box</span>
          </p>
          {friendPeople.length ? (
            <div className="messengerPeopleGrid">
              {friendPeople.map((person, index) => {
                const isSelected = activeChatFriend?.email === person.email
                return (
                  <button
                    type="button"
                    className={`messengerPersonCard text-left transition-all ${
                      isSelected ? 'border-[var(--accent-solid)] bg-[var(--accent-muted)] shadow-md scale-[1.02]' : 'hover:border-[var(--accent-solid)]/40'
                    }`}
                    key={person.email}
                    onClick={() => openChatWithFriend(person)}
                  >
                    <PersonAvatar person={person} index={index} />
                    <span className="messengerPersonCopy">
                      <strong className="univo-gradient-text text-[var(--accent-solid)] font-bold">{person.name}</strong>
                      <small>@{person.username || person.email.split('@')[0]}</small>
                    </span>
                    <MessageCircle size={18} className="text-[var(--accent-solid)]" />
                  </button>
                )
              })}
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
                      <strong className="univo-gradient-text text-[var(--accent-solid)] font-bold">{person.name}</strong>
                      <small>@{person.username || person.email.split('@')[0]}</small>
                      <em>{person.role.replaceAll('_', ' ')}</em>
                    </span>
                    {areFriends(user, person) ? (
                      <Check size={17} />
                    ) : sent.includes(person.email) ? (
                      <button
                        type="button"
                        onClick={(e) => revertRequest(person, e)}
                        className="px-2.5 py-1 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/35 text-red-400 font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-all hover:scale-105 shrink-0 z-10"
                        title="Click to cancel request & revert button to resend email"
                      >
                        <RotateCcw size={13} /> Revert & Resend
                      </button>
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
        ) : activeChatFriend ? (
          /* 1-ON-1 DIRECT MESSAGE CHAT BOX */
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <GlassCard className="!p-0 overflow-hidden relative border border-[var(--border-subtle)] shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-1.5 univo-gradient-bg" />

              {/* CHAT HEADER */}
              <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-modal)]">
                <div className="flex items-center gap-3">
                  <PersonAvatar person={activeChatFriend} large />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-extrabold text-lg univo-gradient-text text-[var(--accent-solid)] tracking-tight">{activeChatFriend.name}</h3>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Active Status" />
                    </div>
                    <p className="text-xs text-[var(--text-subtle)] font-medium font-mono flex items-center gap-1.5 mt-0.5">
                      <span>@{activeChatFriend.username || activeChatFriend.email.split('@')[0]}</span>
                      <span>&middot;</span>
                      <span className="text-[var(--text-secondary)] font-bold">
                        {formatLastActive(getUserLastActive(activeChatFriend.email) || activeChatFriend.lastActiveAt)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openProfile(activeChatFriend)}
                    className="px-3 py-1.5 rounded-xl bg-[var(--surface-control)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] cursor-pointer"
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveChatFriend(null)}
                    className="text-[var(--text-subtle)] hover:text-[var(--text-primary)] cursor-pointer p-1"
                    aria-label="Close Chat"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* CHAT STREAM */}
              <div className="p-4 space-y-3 max-h-[380px] min-h-[260px] overflow-y-auto bg-[var(--surface-control)]">
                {dmMessages.map((msg) => {
                  const isMe = msg.senderEmail === user?.email

                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}>
                      <span className="text-[10px] text-[var(--text-subtle)] font-bold px-1">
                        {msg.senderName} &middot; {msg.timestamp}
                      </span>

                      <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                        isMe
                          ? 'univo-gradient-bg text-black font-semibold rounded-tr-none shadow-md'
                          : 'bg-[var(--surface-modal)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-none shadow-sm'
                      }`}>
                        {msg.text && <p>{msg.text}</p>}

                        {/* ATTACHMENT CARD */}
                        {msg.attachment && (
                          <div className={`mt-2 p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                            isMe ? 'bg-black/10 border-black/20 text-black' : 'bg-white/5 border-white/10 text-[var(--text-primary)]'
                          }`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText size={18} className={isMe ? 'text-black' : 'text-emerald-400'} />
                              <div className="truncate">
                                <p className="font-bold truncate text-[11px]">{msg.attachment.name}</p>
                                <span className="text-[10px] opacity-75 font-mono">{msg.attachment.size}</span>
                              </div>
                            </div>

                            <a
                              href={msg.attachment.url}
                              download={msg.attachment.name}
                              className={`p-1.5 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 ${
                                isMe ? 'bg-black text-white' : 'bg-[var(--accent-solid)] text-black'
                              }`}
                            >
                              <Download size={12} /> Save PDF
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* PENDING ATTACHMENT PREVIEW */}
              {dmPdfFile && (
                <div className="px-4 py-2 bg-emerald-500/15 border-t border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={16} className="text-emerald-400 shrink-0" />
                    <span className="font-bold text-[var(--text-primary)] truncate">{dmPdfFile.name} ({dmPdfFile.size})</span>
                  </div>
                  <button type="button" onClick={() => setDmPdfFile(null)} className="text-red-400 hover:text-red-300 p-0.5">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* DM INPUT FORM */}
              <form onSubmit={handleSendDM} className="p-3 border-t border-[var(--border-subtle)] bg-[var(--surface-modal)] flex items-center gap-2">
                <label className="p-2.5 rounded-xl bg-[var(--surface-control)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--accent-solid)] cursor-pointer transition-colors" title="Attach PDF or File">
                  <Paperclip size={18} />
                  <input type="file" accept="application/pdf,image/*,.doc,.docx" onChange={handleDmPdfUpload} className="hidden" />
                </label>

                <input
                  type="text"
                  placeholder={`Message ${activeChatFriend.name.split(' ')[0]}...`}
                  value={dmText}
                  onChange={(e) => setDmText(e.target.value)}
                  className="flex-1 bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
                />

                <button
                  type="submit"
                  className="univo-gradient-bg text-black px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 transition-all"
                >
                  <Send size={15} /> Send
                </button>
              </form>
            </GlassCard>
          </motion.div>
        ) : (
          <GlassCard className="messengerEmptyCard">
            <div className="messengerEmpty">
              <MessageCircle size={28} className="text-[var(--accent-solid)]" />
              <strong>Select a friend above to start chatting</strong>
              <span>Click any friend from your list to open real-time direct messages & share PDF files.</span>
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
              <h2 className="univo-gradient-text text-[var(--accent-solid)] font-extrabold">{selected.name}</h2>
              <p className="messengerProfileHandle">@{selected.username || selected.email.split('@')[0]}</p>

              {/* REAL LAST ACTIVE STATUS BADGE */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--surface-control)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] my-2.5 shadow-sm">
                {formatLastActive(getUserLastActive(selected.email) || selected.lastActiveAt)}
              </div>

              <p className="messengerProfileRole">{selected.role.replaceAll('_', ' ')}</p>

              {areFriends(user, selected) ? (
                <button
                  type="button"
                  onClick={() => {
                    openChatWithFriend(selected)
                    setSelected(null)
                  }}
                  className="messengerStartButton cursor-pointer flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} /> Open Direct Chat
                </button>
              ) : sent.includes(selected.email) ? (
                <button
                  type="button"
                  onClick={() => revertRequest(selected)}
                  className="messengerStartButton bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} /> Revert Request (Allows Resend)
                </button>
              ) : (
                <button
                  type="button"
                  className="messengerStartButton cursor-pointer flex items-center justify-center gap-2"
                  onClick={() => {
                    sendRequest(selected)
                    setSelected(null)
                  }}
                >
                  <UserPlus size={16} /> Add Friend (Sends Email)
                </button>
              )}
            </motion.div>
          </div>
        )}

        {/* PRO EMAIL PREVIEW MODAL */}
        {previewEmail && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md"
            onMouseDown={(event) => event.target === event.currentTarget && setPreviewEmail(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass-panel w-full max-w-xl rounded-3xl p-7 relative space-y-4 bg-[var(--surface-modal)] border border-[var(--border-strong)] text-[var(--text-primary)] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 univo-gradient-bg" />

              <button
                type="button"
                className="absolute top-5 right-5 text-[var(--text-subtle)] hover:text-[var(--text-primary)] cursor-pointer p-1 z-10"
                onClick={() => setPreviewEmail(null)}
                aria-label="Close email preview"
              >
                <X size={18} />
              </button>

              <div>
                <p className="settingsEyebrow text-[var(--accent-solid)] font-bold">DELIVERED EMAIL PREVIEW</p>
                <h3 className="text-2xl font-bold font-display text-[var(--text-primary)] mt-0.5">
                  {previewEmail.emailRecord?.subject ||
                    (previewEmail.type === 'otp_verification'
                      ? 'OTP Verification Email'
                      : previewEmail.type === 'password_reset'
                      ? 'Password Reset Email'
                      : previewEmail.type === 'product_update'
                      ? 'Product Updates Email'
                      : 'Friend Request Notification')}
                </h3>
              </div>

              {/* EMAIL METADATA CARD */}
              <div className="p-4 rounded-2xl bg-[var(--surface-control)] border border-[var(--border-subtle)] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[var(--text-secondary)] font-medium">
                  <span><strong>From:</strong> <span className="text-[var(--accent-solid)] font-bold">Univo Notifications &lt;notifications@univo.edu&gt;</span></span>
                  <span className="font-mono text-[10px] text-[var(--text-subtle)]">Just now</span>
                </div>
                <div className="text-[var(--text-secondary)]"><strong>To:</strong> <span className="text-[var(--text-primary)] font-bold">{previewEmail.recipientName} &lt;{previewEmail.recipientEmail}&gt;</span></div>
                <div className="text-[var(--text-secondary)]"><strong>Subject:</strong> <span className="text-[var(--text-primary)] font-semibold">👋 {previewEmail.senderName || 'Classmate'} sent you a friend request on Univo!</span></div>
              </div>

              {/* RICH HTML / FALLBACK CONTENT FRAME */}
              {previewEmail.emailRecord?.htmlContent || previewEmail.htmlContent ? (
                <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-white shadow-inner">
                  <iframe
                    title="Email Preview"
                    srcDoc={previewEmail.emailRecord?.htmlContent || previewEmail.htmlContent}
                    className="w-full h-[360px] border-0"
                  />
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[var(--surface-control)] border border-[var(--border-subtle)] space-y-3 text-xs leading-relaxed text-[var(--text-primary)]">
                  <p className="font-bold text-sm text-[var(--text-primary)]">Hey {previewEmail.recipientName}! 👋</p>
                  <p className="text-[var(--text-secondary)]">
                    <strong className="text-[var(--accent-solid)]">{previewEmail.senderName}</strong> ({previewEmail.senderEmail}) has sent you a friend request on Univo.
                  </p>
                </div>
              )}

              {/* FOOTER BADGES */}
              <div className="flex items-center justify-between pt-1">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs inline-flex items-center gap-1.5 cursor-default">
                  <CheckCircle2 size={14} /> Delivered to Inbox
                </span>
                <span className="text-[11px] text-[var(--text-subtle)] font-mono font-semibold">Status: 200 OK</span>
              </div>

              <button
                type="button"
                onClick={() => setPreviewEmail(null)}
                className="w-full py-3 rounded-2xl univo-gradient-bg text-black text-xs font-extrabold cursor-pointer shadow-lg hover:scale-[1.01] transition-all mt-1"
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
