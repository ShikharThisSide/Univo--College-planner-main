import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Plus,
  Search,
  UserPlus,
  X,
  Send,
  MessageCircle,
  FolderKanban,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Lock,
  FileText,
  Paperclip,
  Check,
  Clock,
  ShieldCheck,
  Crown,
  FileUp,
  Download
} from 'lucide-react'
import PageTransition from '../../components/ui/PageTransition'
import GlassCard from '../../components/ui/GlassCard'
import { useAuth } from '../../context/AuthContext'
import { DEMO_USERS } from '../../lib/constants'
import {
  readSocial,
  writeSocial,
  readGlobalGroups,
  saveGlobalGroup,
  requestToJoinGroup,
  cancelJoinRequest,
  respondToJoinRequest,
  readGroupMessages,
  sendGroupMessage,
  sendGroupInvite
} from '../../lib/social'
import UnivoGlobe from '../../components/ui/UnivoGlobe'

function readPeople(currentUser) {
  let accounts = {}
  try { accounts = JSON.parse(localStorage.getItem('univoAccounts') || '{}') || {} } catch { accounts = {} }
  const people = Object.entries(accounts).map(([email, account]) => ({
    email,
    name: account.name || email.split('@')[0].replace(/[._]/g, ' '),
    role: account.role || 'student_individual',
    username: account.username
  }))
  Object.values(DEMO_USERS).forEach((person) => people.push(person))
  return people.filter((person, index, list) => person.email !== currentUser?.email && list.findIndex((item) => item.email === person.email) === index)
}

export default function GroupsPage() {
  const { user } = useAuth()
  const myEmail = user?.email || 'guest'
  const myName = user?.name || myEmail.split('@')[0]
  const key = `groups:${myEmail}`

  // State
  const [globalGroups, setGlobalGroups] = useState([])
  const [userGroups, setUserGroups] = useState([])
  const [pendingJoinRequests, setPendingJoinRequests] = useState([])

  const [activeTab, setActiveTab] = useState('all') // 'all', 'my_groups', 'discover'
  const [groupSearch, setGroupSearch] = useState('')

  // Modals
  const [openCreate, setOpenCreate] = useState(false)
  const [inviteModalGroup, setInviteModalGroup] = useState(null)
  const [chatModalGroup, setChatModalGroup] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)

  // Chat Room State
  const [chatMessages, setChatMessages] = useState([])
  const [newMsgText, setNewMsgText] = useState('')
  const [pendingPdfFile, setPendingPdfFile] = useState(null)

  // Form State
  const [form, setForm] = useState({ name: '', description: '', category: 'Study Group' })
  const [selectedInvites, setSelectedInvites] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [existingGroupSearch, setExistingGroupSearch] = useState('')
  const [existingSelectedInvites, setExistingSelectedInvites] = useState([])

  const people = useMemo(() => readPeople(user), [user])

  // Load Real Groups Only (Purges any legacy demo groups from localStorage)
  const loadGroups = () => {
    const globals = readGlobalGroups()
    const demoIds = new Set(['real-ds-squad', 'real-hackathon-team', 'real-exam-prep', 'real-dev-guild'])
    const realOnly = globals.filter(
      (g) =>
        !demoIds.has(g.id) &&
        g.creatorEmail !== 'prof.kumar@xyzuniversity.edu' &&
        g.creatorEmail !== 'priya@xyzuniversity.edu' &&
        g.creatorEmail !== 'aarav@personal.com' &&
        g.creatorEmail !== 'admin@xyzuniversity.edu'
    )

    if (realOnly.length !== globals.length) {
      writeSocial('all_groups', realOnly)
    }

    setGlobalGroups(realOnly)
    setUserGroups(readSocial(key, []).filter((g) => !demoIds.has(g.id)))

    // Read join requests sent to current user as group leader
    const reqs = readSocial(`joinRequests:${myEmail}`, [])
    setPendingJoinRequests(reqs.filter((r) => r.status === 'pending'))
  }

  useEffect(() => {
    loadGroups()
    window.addEventListener('univo-social-updated', loadGroups)
    return () => window.removeEventListener('univo-social-updated', loadGroups)
  }, [myEmail])

  // Load chat messages when chat modal opens
  useEffect(() => {
    if (!chatModalGroup) return
    const refreshChat = () => {
      setChatMessages(readGroupMessages(chatModalGroup.id))
    }
    refreshChat()
    window.addEventListener('univo-group-msg-sent', refreshChat)
    return () => window.removeEventListener('univo-group-msg-sent', refreshChat)
  }, [chatModalGroup])

  // Filter groups
  const filteredGroups = useMemo(() => {
    return globalGroups.filter((group) => {
      const isMember = (group.members || []).includes(myName)
      if (activeTab === 'my_groups' && !isMember) return false
      if (activeTab === 'discover' && isMember) return false

      if (groupSearch.trim()) {
        const q = groupSearch.toLowerCase()
        const matchName = group.name.toLowerCase().includes(q)
        const matchDesc = (group.description || '').toLowerCase().includes(q)
        const matchCat = (group.category || '').toLowerCase().includes(q)
        return matchName || matchDesc || matchCat
      }
      return true
    })
  }, [globalGroups, myName, activeTab, groupSearch])

  // Handlers
  const handleRequestJoin = (group) => {
    requestToJoinGroup(group, { email: myEmail, name: myName })
    loadGroups()
  }

  const handleCancelJoin = (group) => {
    cancelJoinRequest(group.id, myEmail, group.creatorEmail)
    loadGroups()
  }

  const handleLeaderResponse = (req, accept) => {
    respondToJoinRequest(req, accept)
    loadGroups()
  }

  const handleCreateGroup = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return

    const newGroup = {
      id: `group-${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim() || 'Campus study squad on Univo.',
      category: form.category || 'Study Group',
      iconTag: form.category === 'Project Team' ? 'Project' : form.category === 'Exam Prep' ? 'Exam' : 'Study',
      creatorEmail: myEmail,
      members: [myName],
      pendingInvites: selectedInvites.map((p) => ({ email: p.email, name: p.name })),
      createdAt: Date.now()
    }

    saveGlobalGroup(newGroup)
    writeSocial(key, [newGroup, ...userGroups])

    selectedInvites.forEach((person) => {
      sendGroupInvite(newGroup, user, person.email, person.name)
    })

    setForm({ name: '', description: '', category: 'Study Group' })
    setSelectedInvites([])
    setSearchQuery('')
    setOpenCreate(false)
    loadGroups()
  }

  const handleSendChatMessage = (e) => {
    e.preventDefault()
    if (!chatModalGroup || (!newMsgText.trim() && !pendingPdfFile)) return

    sendGroupMessage(chatModalGroup.id, {
      senderName: myName,
      senderEmail: myEmail,
      text: newMsgText.trim(),
      attachment: pendingPdfFile
    })

    setNewMsgText('')
    setPendingPdfFile(null)
  }

  const handlePdfUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPendingPdfFile({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      type: file.type || 'application/pdf',
      url: URL.createObjectURL(file)
    })
  }

  const toggleCreateInvite = (person) => {
    if (selectedInvites.some((p) => p.email === person.email)) {
      setSelectedInvites(selectedInvites.filter((p) => p.email !== person.email))
    } else {
      setSelectedInvites([...selectedInvites, person])
    }
  }

  const toggleExistingInvite = (person) => {
    if (existingSelectedInvites.some((p) => p.email === person.email)) {
      setExistingSelectedInvites(existingSelectedInvites.filter((p) => p.email !== person.email))
    } else {
      setExistingSelectedInvites([...existingSelectedInvites, person])
    }
  }

  const sendMoreInvites = (e) => {
    e.preventDefault()
    if (!inviteModalGroup || !existingSelectedInvites.length) return

    existingSelectedInvites.forEach((person) => {
      sendGroupInvite(inviteModalGroup, user, person.email, person.name)
    })

    setInviteModalGroup(null)
    setExistingSelectedInvites([])
    setExistingGroupSearch('')
    loadGroups()
  }

  return (
    <PageTransition>
      <div className="groupsPage">
      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="settingsEyebrow text-[var(--accent-solid)] font-bold">UNIVO COMMUNITY</p>
          <h1 className="font-display text-4xl font-bold tracking-tight mt-1 text-[var(--accent-solid)]">
            Campus Groups & Study Squads
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Real campus groups, leader-moderated join approvals, shared PDF vaults, and live group chat.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpenCreate(true)}
          className="px-4 py-2.5 rounded-xl univo-gradient-bg text-black text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all hover:scale-105 shadow-lg shrink-0"
        >
          <Plus size={16} /> Create Real Group
        </button>
      </div>

      {/* PENDING JOIN REQUESTS ALERT BANNER FOR GROUP LEADERS */}
      {pendingJoinRequests.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-[var(--accent-muted)] border border-[var(--accent-solid)]/40 space-y-3">
          <div className="flex items-center gap-2">
            <Crown size={18} className="text-[var(--accent-solid)]" />
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              Leader Approvals Needed ({pendingJoinRequests.length} pending join request{pendingJoinRequests.length > 1 ? 's' : ''})
            </h3>
          </div>

          <div className="space-y-2">
            {pendingJoinRequests.map((req) => (
              <div key={req.id} className="p-3 rounded-xl bg-[var(--surface-modal)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{req.requesterName} ({req.requesterEmail})</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Requested to join <strong>"{req.groupName}"</strong></p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleLeaderResponse(req, true)}
                    className="px-3 py-1.5 rounded-xl univo-gradient-bg text-black font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Check size={14} /> Accept Member
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLeaderResponse(req, false)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-[var(--text-secondary)] font-semibold text-xs cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DOPE HERO BANNER */}
      <GlassCard className="mb-6 !p-0 overflow-hidden relative border border-[var(--border-subtle)]" delay={0.1}>
        <div className="absolute top-0 left-0 right-0 h-1.5 univo-gradient-bg" />

        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent-solid)]/15 border border-[var(--accent-solid)]/30 text-[var(--accent-solid)] text-xs font-extrabold uppercase tracking-wider">
              <Sparkles size={14} /> LEADER-APPROVED CAMPUS SQUADS
            </div>

            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-[var(--text-primary)] leading-tight">
              Build your <span className="univo-gradient-text text-[var(--accent-solid)]">campus circle.</span>
            </h2>

            <p className="text-sm text-[var(--text-muted)] leading-relaxed font-medium">
              Join real campus groups, send join requests to group leaders, share course PDFs, and chat with team members in real-time.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-bold text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-[var(--accent-solid)]" /> Leader Verification Required</span>
              <span>&middot;</span>
              <span className="flex items-center gap-1.5"><FileText size={15} className="text-emerald-400" /> PDF Document Vault</span>
              <span>&middot;</span>
              <span className="flex items-center gap-1.5"><MessageCircle size={15} className="text-[var(--accent-solid)]" /> Group Chat</span>
            </div>
          </div>

          <div className="w-full md:w-64 h-48 md:h-56 relative shrink-0">
            <UnivoGlobe />
          </div>
        </div>
      </GlassCard>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: `All Groups (${globalGroups.length})` },
            { id: 'my_groups', label: `My Joined Squads (${userGroups.length})` },
            { id: 'discover', label: 'Discover Public Squads' }
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap border ${
                  isActive
                    ? 'bg-[var(--accent-muted)] border-[var(--accent-solid)]/40 text-[var(--accent-solid)] shadow-md scale-105'
                    : 'bg-[var(--surface-control)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <div className="relative flex items-center w-full">
            <input
              type="text"
              placeholder="Search groups..."
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl pl-4 pr-10 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)] font-medium"
            />
            <Search size={15} className="absolute right-3.5 text-[var(--accent-solid)] pointer-events-none shrink-0" />
          </div>
        </div>
      </div>

      {/* GROUPS LIST */}
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        <AnimatePresence mode="popLayout">
          {filteredGroups.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="col-span-full p-12 text-center border border-dashed border-[var(--accent-solid)]/30 rounded-3xl glass-card space-y-4 bg-[var(--surface-control)] shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 univo-gradient-bg" />

              <div className="w-16 h-16 rounded-2xl univo-gradient-bg grid place-items-center text-black mx-auto shadow-lg">
                <Users size={32} />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-xl font-extrabold font-display text-[var(--text-primary)]">
                  {groupSearch ? 'No matching campus groups found' : 'No campus groups created yet'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                  {groupSearch
                    ? `We couldn't find any squad matching "${groupSearch}". Try another search term or create a new group.`
                    : 'Be the first to launch a real campus squad! Create a group for lab prep, project builds, or exam study rooms.'}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setOpenCreate(true)}
                  className="px-6 py-3 rounded-2xl univo-gradient-bg text-black text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-all"
                >
                  <Plus size={16} /> Create Real Group & Become Leader
                </button>
              </div>
            </motion.div>
          ) : (
            filteredGroups.map((group) => {
              const isLeader = group.creatorEmail === myEmail
              const isMember = (group.members || []).includes(myName)
              
              // Check if join request is pending for leader
              const myRequests = readSocial(`joinRequests:${group.creatorEmail}`, [])
              const isPending = myRequests.some((r) => r.groupId === group.id && r.requesterEmail === myEmail && r.status === 'pending')

              return (
                <motion.div
                  key={group.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 rounded-2xl glass-card border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all flex flex-col justify-between gap-4 text-[var(--text-primary)]"
                  onClick={(e) => { if (e.target.closest('button')) return; setSelectedGroup(group) }}
                >
                  <div className="space-y-3">
                    {/* CARD HEADER */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl univo-gradient-bg grid place-items-center text-black font-bold text-xl shadow-md shrink-0">
                          {group.iconTag || '👥'}
                        </div>
                        <div>
                          <h3 className="font-display font-extrabold text-base leading-snug">
                            <span className="univo-gradient-text text-[var(--accent-solid)]">{group.name}</span>
                          </h3>
                          <span className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1 mt-0.5">
                            {isLeader ? (
                              <span className="text-[var(--accent-solid)] font-bold flex items-center gap-1"><Crown size={13} /> Group Leader (You)</span>
                            ) : (
                              <span className="text-[var(--text-secondary)] font-semibold">Leader: {group.creatorEmail?.split('@')[0]}</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-[var(--accent-solid)]/15 border border-[var(--accent-solid)]/30 text-[var(--accent-solid)] text-[10px] font-extrabold uppercase tracking-wider shrink-0">
                        {group.category || 'Study Group'}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                      {group.description || 'Campus study squad for course collaboration and note sharing.'}
                    </p>

                    {/* MEMBERS STACK */}
                    <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center -space-x-2 overflow-visible">
                          {(group.members || []).slice(0, 4).map((mName, i) => {
                            const initials = mName.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
                            return (
                              <div
                                key={i}
                                className="w-8 h-8 rounded-full univo-gradient-bg text-black font-extrabold text-xs flex items-center justify-center border-2 border-[var(--surface-modal)] shadow-md hover:scale-110 hover:z-20 transition-all cursor-pointer relative group/avatar shrink-0"
                                title={mName}
                              >
                                <img src={mName === myName && user?.avatarImage ? user.avatarImage : `https://i.pravatar.cc/150?u=${encodeURIComponent(mName)}`} alt={mName} className="w-full h-full rounded-full object-cover" />
                                <span className="absolute bottom-full mb-2 hidden group-hover/avatar:block px-2.5 py-1.5 bg-[var(--surface-modal)] border border-[var(--accent-solid)]/40 shadow-2xl z-50 pointer-events-none rounded-xl whitespace-nowrap text-xs font-extrabold text-[var(--text-primary)]">
                                  <span className="text-[var(--accent-solid)] font-bold">{mName}</span>
                                </span>
                              </div>
                            )
                          })}
                        </div>
                        <span className="text-xs text-[var(--text-secondary)] font-bold">
                          {(group.members || []).length} active member{(group.members || []).length === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                    {isMember ? (
                      <div className="flex items-center justify-between w-full gap-2">
                        <button
                          type="button"
                          onClick={() => setChatModalGroup(group)}
                          className="flex-1 py-2.5 rounded-xl univo-gradient-bg text-black text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.01] transition-all"
                        >
                          <MessageCircle size={15} /> Group Chat & PDF Vault
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setInviteModalGroup(group)
                            setExistingSelectedInvites([])
                            setExistingGroupSearch('')
                          }}
                          className="px-3 py-2.5 rounded-xl bg-[var(--surface-control)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] cursor-pointer transition-all"
                        >
                          <UserPlus size={15} className="text-[var(--accent-solid)]" /> Invite
                        </button>
                      </div>
                    ) : isPending ? (
                      <button
                        type="button"
                        onClick={() => handleCancelJoin(group)}
                        className="w-full py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/35 text-red-400 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.01]"
                        title="Click to cancel pending join request and revert button"
                      >
                        <Clock size={15} /> Request Sent (Pending Leader Approval) &middot; Click to Cancel
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRequestJoin(group)}
                        className="w-full py-2.5 rounded-xl bg-[var(--surface-control)] hover:bg-[var(--surface-hover)] border border-[var(--accent-solid)]/40 text-[var(--accent-solid)] font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.01]"
                      >
                        <Send size={14} /> Request to Join Squad (Sends to Leader)
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>

      {/* GROUP OVERVIEW / JOIN MODAL */}
      {selectedGroup && (() => {
        const isMember = (selectedGroup.members || []).includes(myName)
        const myRequests = readSocial(`joinRequests:${selectedGroup.creatorEmail}`, [])
        const isPending = myRequests.some((r) => r.groupId === selectedGroup.id && r.requesterEmail === myEmail && r.status === 'pending')
        return (
          <div className="groupOverviewBackdrop fixed inset-0 z-50 flex items-center justify-center p-4" onMouseDown={(e) => e.target === e.currentTarget && setSelectedGroup(null)}>
            <motion.div initial={{ opacity: 0, scale: .95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="groupOverviewModal w-full max-w-md rounded-3xl p-7 relative shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 univo-gradient-bg" />
              <button type="button" className="absolute top-5 right-5 text-[var(--text-subtle)] hover:text-[var(--text-primary)] cursor-pointer" onClick={() => setSelectedGroup(null)} aria-label="Close"><X size={18} /></button>
              <div className="flex flex-col items-center text-center gap-3 pt-2">
                <div className="w-20 h-20 rounded-3xl univo-gradient-bg grid place-items-center text-black text-3xl shadow-lg">{selectedGroup.iconTag || '👥'}</div>
                <div><p className="settingsEyebrow text-[var(--accent-solid)] font-bold">{selectedGroup.category || 'STUDY GROUP'}</p><h2 className="groupOverviewTitle font-display mt-1">{selectedGroup.name}</h2><p className="text-sm text-[var(--text-muted)] mt-2">{selectedGroup.description}</p></div>
              </div>
              <div className="mt-6 pt-5 border-t border-[var(--border-subtle)]"><div className="flex items-center justify-between mb-3"><h3 className="font-bold text-sm">Members</h3><span className="text-xs text-[var(--text-muted)]">{(selectedGroup.members || []).length} active</span></div><div className="flex flex-wrap gap-3">{(selectedGroup.members || []).map((member, index) => <div key={`${member}-${index}`} className="flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--surface-control)] border border-[var(--border-subtle)]"><img src={member === myName && user?.avatarImage ? user.avatarImage : `https://i.pravatar.cc/150?u=${encodeURIComponent(member)}`} alt={member} className="w-7 h-7 rounded-full object-cover" /><span className="text-xs font-semibold">{member}</span></div>)}</div></div>
              <div className="mt-6">{isMember ? <button type="button" onClick={() => { setSelectedGroup(null); setChatModalGroup(selectedGroup) }} className="w-full py-3 rounded-2xl univo-gradient-bg text-black text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"><MessageCircle size={15} /> Open Group Chat</button> : isPending ? <button type="button" onClick={() => { handleCancelJoin(selectedGroup); setSelectedGroup(null) }} className="w-full py-3 rounded-2xl bg-red-500/15 border border-red-500/35 text-red-400 text-xs font-extrabold cursor-pointer"><Clock size={15} className="inline mr-1" /> Request Sent · Cancel</button> : <button type="button" onClick={() => { handleRequestJoin(selectedGroup); setSelectedGroup(null) }} className="w-full py-3 rounded-2xl univo-gradient-bg text-black text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"><UserPlus size={15} /> Join Group</button>}</div>
            </motion.div>
          </div>
        )
      })()}

      {/* CREATE REAL GROUP MODAL */}
      {openCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md" onMouseDown={(e) => e.target === e.currentTarget && setOpenCreate(false)}>
          <motion.form
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="glass-panel w-full max-w-lg rounded-3xl p-7 relative space-y-4 bg-[var(--surface-modal)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onSubmit={handleCreateGroup}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 univo-gradient-bg" />

            <button type="button" className="absolute top-5 right-5 text-[var(--text-subtle)] hover:text-[var(--text-primary)] cursor-pointer p-1" onClick={() => setOpenCreate(false)} aria-label="Close">
              <X size={18} />
            </button>

            <div>
              <p className="settingsEyebrow text-[var(--accent-solid)] font-bold">GROUP LEADER</p>
              <h2 className="text-2xl font-bold font-display text-[var(--text-primary)] mt-0.5">Create Real Campus Group</h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">You will be designated as the Group Leader with full join request approval rights.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Group Name</label>
                <input
                  autoFocus
                  required
                  placeholder="e.g. B.Tech Computer Networks Team, OS Lab Squad..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-[var(--surface-modal)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)] cursor-pointer font-semibold"
                >
                  <option value="Study Group" className="bg-[var(--surface-modal)] text-[var(--text-primary)]">Study Group</option>
                  <option value="Project Team" className="bg-[var(--surface-modal)] text-[var(--text-primary)]">Project Team</option>
                  <option value="Exam Prep" className="bg-[var(--surface-modal)] text-[var(--text-primary)]">Exam Prep</option>
                  <option value="Campus Club" className="bg-[var(--surface-modal)] text-[var(--text-primary)]">Campus Club</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Description</label>
                <textarea
                  placeholder="What is this group created for?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)] resize-none"
                />
              </div>
            </div>

            <button type="submit" className="w-full univo-gradient-bg text-black font-extrabold rounded-2xl py-3.5 text-xs flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-lg hover:scale-[1.02] transition-all">
              <Plus size={16} /> Launch Group & Become Leader
            </button>
          </motion.form>
        </div>
      )}

      {/* GROUP CHAT & PDF VAULT MODAL FOR MEMBERS */}
      {chatModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onMouseDown={(e) => e.target === e.currentTarget && setChatModalGroup(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="glass-panel w-full max-w-2xl rounded-3xl p-6 relative space-y-4 bg-[var(--surface-modal)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 univo-gradient-bg" />

            {/* CHAT HEADER */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl univo-gradient-bg text-black font-bold text-lg grid place-items-center shrink-0">
                  {chatModalGroup.iconTag || '💬'}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">{chatModalGroup.name} Chat</h3>
                  <span className="text-xs text-[var(--text-secondary)] font-medium">
                    {(chatModalGroup.members || []).length} members in channel &middot; Leader: {chatModalGroup.creatorEmail?.split('@')[0]}
                  </span>
                </div>
              </div>

              <button type="button" onClick={() => setChatModalGroup(null)} className="text-[var(--text-subtle)] hover:text-[var(--text-primary)] cursor-pointer p-1" aria-label="Close chat">
                <X size={18} />
              </button>
            </div>

            {/* CHAT MESSAGE STREAM */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1 min-h-[260px] max-h-[360px] p-2 bg-[var(--surface-control)] rounded-2xl border border-[var(--border-subtle)]">
              {chatMessages.map((msg) => {
                const isMe = msg.senderEmail === myEmail

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}>
                    <span className="text-[10px] text-[var(--text-subtle)] font-bold px-1">
                      {msg.senderName} &middot; {msg.timestamp}
                    </span>

                    <div className={`p-3 rounded-2xl max-w-[85%] text-xs font-sans leading-relaxed ${
                      isMe
                        ? 'univo-gradient-bg text-black font-semibold rounded-tr-none'
                        : 'bg-[var(--surface-modal)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-none'
                    }`}>
                      {msg.text && <p>{msg.text}</p>}

                      {/* ATTACHED PDF CARD */}
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

            {/* PENDING PDF ATTACHMENT PREVIEW CARD */}
            {pendingPdfFile && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={16} className="text-emerald-400 shrink-0" />
                  <span className="font-bold text-[var(--text-primary)] truncate">{pendingPdfFile.name} ({pendingPdfFile.size})</span>
                </div>
                <button type="button" onClick={() => setPendingPdfFile(null)} className="text-red-400 hover:text-red-300 p-0.5">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* CHAT INPUT FORM WITH PDF UPLOAD BUTTON */}
            <form onSubmit={handleSendChatMessage} className="flex items-center gap-2 pt-1">
              <label className="p-2.5 rounded-xl bg-[var(--surface-control)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--accent-solid)] cursor-pointer transition-colors" title="Attach PDF or Document">
                <Paperclip size={18} />
                <input type="file" accept="application/pdf,image/*,.doc,.docx" onChange={handlePdfUpload} className="hidden" />
              </label>

              <input
                type="text"
                placeholder="Type a message or upload PDF notes to your squad..."
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
                className="flex-1 bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
              />

              <button type="submit" className="univo-gradient-bg text-black px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 transition-all">
                <Send size={15} /> Send
              </button>
            </form>
          </motion.div>
        </div>
      )}
      </div>
    </PageTransition>
  )
}
