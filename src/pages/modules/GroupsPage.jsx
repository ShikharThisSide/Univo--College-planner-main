import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Rocket,
  Target,
  Award,
  CheckCircle2,
  Lock,
  ArrowRight,
  Check,
  ShieldCheck
} from 'lucide-react'
import PageTransition from '../../components/ui/PageTransition'
import GlassCard from '../../components/ui/GlassCard'
import { useAuth } from '../../context/AuthContext'
import { DEMO_USERS } from '../../lib/constants'
import { readSocial, sendGroupInvite, writeSocial } from '../../lib/social'
import UnivoGlobe from '../../components/ui/UnivoGlobe'

const RECOMMENDED_CAMPUS_GROUPS = [
  {
    id: 'rec-ds-squad',
    name: 'CS301 Data Structures & Algorithms Squad',
    description: 'Weekly problem solving, LeetCode prep, code reviews, and lab exam revision.',
    category: 'Study Group',
    iconTag: '📚',
    gradient: 'from-emerald-500 to-teal-600',
    creatorEmail: 'prof.kumar@xyzuniversity.edu',
    members: ['Dr. Raj Kumar', 'Priya Mehta', 'Aarav Sharma', 'Neha Kapoor', 'Siddharth V.', 'Ananya R.'],
    sharedNotesCount: 12,
    isRecommended: true
  },
  {
    id: 'rec-hackathon-team',
    name: 'Univo Hackathon 2026 Build Team',
    description: 'Building AI applications, full-stack prototypes, and competing in inter-college hackathons.',
    category: 'Project Team',
    iconTag: '🚀',
    gradient: 'from-purple-500 to-indigo-600',
    creatorEmail: 'priya@xyzuniversity.edu',
    members: ['Priya Mehta', 'Aarav Sharma', 'Rohan Gupta', 'Kavya S.'],
    sharedNotesCount: 8,
    isRecommended: true
  },
  {
    id: 'rec-exam-prep',
    name: 'Mid-Term Exam Crunch Room',
    description: 'Late night group study, past paper solving, and quick formula revision sessions.',
    category: 'Exam Prep',
    iconTag: '🎯',
    gradient: 'from-amber-500 to-orange-600',
    creatorEmail: 'aarav@personal.com',
    members: ['Aarav Sharma', 'Priya Mehta', 'Vikram S.', 'Isha P.', 'Dr. Raj Kumar'],
    sharedNotesCount: 19,
    isRecommended: true
  },
  {
    id: 'rec-dev-guild',
    name: 'Univo Open Source & Web Guild',
    description: 'Web development workshops, Git collaboration, open source projects, and tech talks.',
    category: 'Campus Club',
    iconTag: '🎉',
    gradient: 'from-blue-500 to-cyan-600',
    creatorEmail: 'admin@xyzuniversity.edu',
    members: ['Neha Kapoor', 'Aarav Sharma', 'Priya Mehta', 'Dr. Raj Kumar', 'Tanya M.'],
    sharedNotesCount: 15,
    isRecommended: true
  }
]

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
  const navigate = useNavigate()
  const key = `groups:${user?.email || 'guest'}`

  // State
  const [userGroups, setUserGroups] = useState(() => readSocial(key))
  const [activeTab, setActiveTab] = useState('all') // 'all', 'my_groups', 'discover', 'study', 'project'
  const [groupSearch, setGroupSearch] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [inviteModalGroup, setInviteModalGroup] = useState(null)
  const [vaultModalGroup, setVaultModalGroup] = useState(null)

  // Form State
  const [form, setForm] = useState({ name: '', description: '', category: 'Study Group' })
  const [selectedInvites, setSelectedInvites] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [existingGroupSearch, setExistingGroupSearch] = useState('')
  const [existingSelectedInvites, setExistingSelectedInvites] = useState([])

  const people = useMemo(() => readPeople(user), [user])

  // Sync state
  useEffect(() => {
    const refresh = () => setUserGroups(readSocial(key))
    window.addEventListener('univo-social-updated', refresh)
    return () => window.removeEventListener('univo-social-updated', refresh)
  }, [key])

  // Combine user groups & recommended groups
  const allDisplayGroups = useMemo(() => {
    const joinedIds = new Set(userGroups.map((g) => g.id))
    const availableRecs = RECOMMENDED_CAMPUS_GROUPS.filter((r) => !joinedIds.has(r.id))
    return [...userGroups, ...availableRecs]
  }, [userGroups])

  // Filter groups
  const filteredGroups = useMemo(() => {
    return allDisplayGroups.filter((group) => {
      const isJoined = userGroups.some((g) => g.id === group.id)
      if (activeTab === 'my_groups' && !isJoined) return false
      if (activeTab === 'discover' && isJoined) return false
      if (activeTab === 'study' && group.category !== 'Study Group') return false
      if (activeTab === 'project' && group.category !== 'Project Team') return false
      if (activeTab === 'exam' && group.category !== 'Exam Prep') return false

      if (groupSearch.trim()) {
        const q = groupSearch.toLowerCase()
        const matchName = group.name.toLowerCase().includes(q)
        const matchDesc = (group.description || '').toLowerCase().includes(q)
        const matchCategory = (group.category || '').toLowerCase().includes(q)
        return matchName || matchDesc || matchCategory
      }
      return true
    })
  }, [allDisplayGroups, userGroups, activeTab, groupSearch])

  // Handlers
  const handleJoinGroup = (recGroup) => {
    const myName = user?.name || user?.email?.split('@')[0] || 'You'
    const updatedGroup = {
      ...recGroup,
      members: Array.from(new Set([...recGroup.members, myName])),
      isJoined: true
    }
    const next = [...userGroups, updatedGroup]
    setUserGroups(next)
    writeSocial(key, next)
  }

  const handleCreateGroup = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return

    const myName = user?.name || user?.email?.split('@')[0] || 'You'
    const newGroup = {
      id: `group-${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim() || 'Custom study squad space on Univo.',
      category: form.category || 'Study Group',
      iconTag: form.category === 'Project Team' ? '🚀' : form.category === 'Exam Prep' ? '🎯' : '📚',
      members: [myName],
      creatorEmail: user?.email,
      pendingInvites: selectedInvites.map((p) => ({ email: p.email, name: p.name })),
      createdAt: Date.now()
    }

    const next = [...userGroups, newGroup]
    setUserGroups(next)
    writeSocial(key, next)

    selectedInvites.forEach((person) => {
      sendGroupInvite(newGroup, user, person.email, person.name)
    })

    setForm({ name: '', description: '', category: 'Study Group' })
    setSelectedInvites([])
    setSearchQuery('')
    setOpenCreate(false)
  }

  const handleLeaveOrDelete = (groupId) => {
    const next = userGroups.filter((g) => g.id !== groupId)
    setUserGroups(next)
    writeSocial(key, next)
  }

  const sendMoreInvites = (e) => {
    e.preventDefault()
    if (!inviteModalGroup || !existingSelectedInvites.length) return

    existingSelectedInvites.forEach((person) => {
      sendGroupInvite(inviteModalGroup, user, person.email, person.name)
    })

    setUserGroups(readSocial(key))
    setInviteModalGroup(null)
    setExistingSelectedInvites([])
    setExistingGroupSearch('')
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

  return (
    <PageTransition>
      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="settingsEyebrow text-[var(--accent-solid)] font-bold">UNIVO COMMUNITY</p>
          <h1 className="font-display text-4xl font-bold tracking-tight mt-1 text-[var(--accent-solid)]">
            Groups & Study Squads
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Collaborative spaces for classmates, lab teams, hackathons, and exam preparation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpenCreate(true)}
          className="px-4 py-2.5 rounded-xl univo-gradient-bg text-black text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all hover:scale-105 shadow-lg shrink-0"
        >
          <Plus size={16} /> Create New Group
        </button>
      </div>

      {/* DOPE INTERACTIVE HERO BANNER */}
      <GlassCard className="mb-8 !p-0 overflow-hidden relative" delay={0.1}>
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-solid)]/15 border border-[var(--accent-solid)]/30 text-[var(--accent-solid)] text-xs font-bold">
              <Sparkles size={14} /> CAMPUS COLLABORATION HUB
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] leading-tight">
              Build your campus circle.
            </h2>

            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Connect with classmates, share course lecture notes, coordinate lab assignments, and study together in real-time.
            </p>

            {/* LIVE STATS BADGES */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)] font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Users size={14} className="text-[var(--accent-solid)]" /> {userGroups.length} Joined Squads
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)] font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <BookOpen size={14} className="text-emerald-400" /> 54 Shared Files
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)] font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-cyan-400" /> End-to-End Encrypted
              </span>
            </div>
          </div>

          <div className="w-full md:w-64 h-48 md:h-56 relative shrink-0">
            <UnivoGlobe />
          </div>
        </div>
      </GlassCard>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Squads' },
            { id: 'my_groups', label: `My Squads (${userGroups.length})` },
            { id: 'discover', label: 'Discover Campus' },
            { id: 'study', label: 'Study 📚' },
            { id: 'project', label: 'Projects 🚀' },
            { id: 'exam', label: 'Exam Prep 🎯' }
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                  isActive
                    ? 'bg-[var(--accent-muted)] border-[var(--accent-solid)]/40 text-[var(--accent-solid)] shadow-sm scale-105'
                    : 'bg-[var(--surface-control)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search squads by name or tag..."
            value={groupSearch}
            onChange={(e) => setGroupSearch(e.target.value)}
            className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-[var(--text-subtle)] pointer-events-none" />
        </div>
      </div>

      {/* GROUPS GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4 mb-10">
        <AnimatePresence mode="popLayout">
          {filteredGroups.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full p-10 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl glass-card space-y-3"
            >
              <Users size={36} className="mx-auto text-[var(--text-subtle)]" />
              <p className="text-base font-bold text-[var(--text-primary)]">No groups found</p>
              <p className="text-xs text-[var(--text-subtle)] max-w-sm mx-auto">
                {groupSearch ? 'No groups matched your search term.' : 'Click "+ Create New Group" to start your first campus study squad.'}
              </p>
              <button
                type="button"
                onClick={() => setOpenCreate(true)}
                className="px-4 py-2.5 rounded-xl univo-gradient-bg text-black text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer mt-2"
              >
                <Plus size={16} /> Create Group
              </button>
            </motion.div>
          ) : (
            filteredGroups.map((group) => {
              const isJoined = userGroups.some((g) => g.id === group.id)
              const pendingList = group.pendingInvites || []

              return (
                <motion.div
                  key={group.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 rounded-2xl glass-card border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all flex flex-col justify-between gap-4 relative group"
                >
                  <div className="space-y-3">
                    {/* TOP BAR: GRADIENT ICON & CATEGORY BADGE */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl univo-gradient-bg grid place-items-center text-black shadow-md font-bold text-xl shrink-0">
                          {group.iconTag || '👥'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display font-bold text-base text-[var(--text-primary)] leading-snug">
                              {group.name}
                            </h3>
                          </div>
                          <span className="text-[11px] text-[var(--text-subtle)] block">
                            Created by {group.creatorEmail === user?.email ? 'You' : group.members[0] || 'Campus member'}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-[var(--accent-solid)]/15 border border-[var(--accent-solid)]/30 text-[var(--accent-solid)] text-[10px] font-bold uppercase tracking-wider shrink-0">
                        {group.category || 'Study Group'}
                      </span>
                    </div>

                    {/* DESCRIPTION */}
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {group.description || 'Dedicated collaboration room for course notes and study prep.'}
                    </p>

                    {/* MEMBER AVATAR STACK & STATS */}
                    <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2 overflow-hidden">
                          {group.members.slice(0, 4).map((mName, i) => (
                            <span
                              key={i}
                              className="inline-block w-7 h-7 rounded-full univo-gradient-bg text-black font-bold text-[10px] grid place-items-center ring-2 ring-black"
                              title={mName}
                            >
                              {mName.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-[var(--text-muted)] font-semibold font-mono pl-1">
                          {group.members.length} member{group.members.length === 1 ? '' : 's'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setVaultModalGroup(group)}
                        className="text-xs text-[var(--accent-solid)] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <FolderKanban size={13} /> Shared Vault
                      </button>
                    </div>

                    {/* PENDING INVITES LIST */}
                    {pendingList.length > 0 && (
                      <div className="pt-2 border-t border-[var(--border-subtle)]">
                        <span className="text-[11px] text-amber-400 font-medium block mb-1">
                          Pending Invites ({pendingList.length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {pendingList.map((p, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300">
                              {typeof p === 'string' ? p : p.name || p.email}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ACTION FOOTER */}
                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                    {isJoined ? (
                      <>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate('/dashboard/me/messenger')}
                            className="px-3 py-1.5 rounded-xl bg-[var(--surface-control)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs font-semibold flex items-center gap-1.5 text-[var(--text-primary)] cursor-pointer transition-all"
                          >
                            <MessageCircle size={14} className="text-[var(--accent-solid)]" /> Chat Channel
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setInviteModalGroup(group)
                              setExistingSelectedInvites([])
                              setExistingGroupSearch('')
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[var(--surface-control)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs font-semibold flex items-center gap-1 text-[var(--text-primary)] cursor-pointer transition-all"
                          >
                            <UserPlus size={14} className="text-[var(--accent-solid)]" /> Invite
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleLeaveOrDelete(group.id)}
                          className="text-xs text-[var(--text-subtle)] hover:text-red-400 cursor-pointer p-1 transition-colors"
                          title="Leave Group"
                        >
                          Leave
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleJoinGroup(group)}
                        className="w-full py-2.5 rounded-xl univo-gradient-bg text-black text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.01] transition-all"
                      >
                        <CheckCircle2 size={15} /> Join Squad
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>

      {/* CREATE GROUP MODAL */}
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

            <button type="button" className="absolute top-5 right-5 text-[var(--text-subtle)] hover:text-[var(--text-primary)] cursor-pointer p-1 rounded-lg hover:bg-white/10" onClick={() => setOpenCreate(false)} aria-label="Close">
              <X size={18} />
            </button>

            <div>
              <p className="settingsEyebrow text-[var(--accent-solid)] font-bold">NEW SQUAD</p>
              <h2 className="text-2xl font-bold font-display text-[var(--text-primary)] mt-0.5">Create a Study Group</h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">Set up a collaborative space and send instant request notifications to classmates.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Group Name</label>
                <input
                  autoFocus
                  required
                  placeholder="e.g. Data Structures Prep, Hackathon 2026 Squad..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] focus-within:border-[var(--accent-solid)] rounded-xl px-3.5 py-2.5 text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[var(--surface-modal)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)] cursor-pointer font-semibold"
                  >
                    <option value="Study Group" className="bg-[var(--surface-modal)] text-[var(--text-primary)]">Study Group 📚</option>
                    <option value="Project Team" className="bg-[var(--surface-modal)] text-[var(--text-primary)]">Project Team 🚀</option>
                    <option value="Exam Prep" className="bg-[var(--surface-modal)] text-[var(--text-primary)]">Exam Prep 🎯</option>
                    <option value="Campus Club" className="bg-[var(--surface-modal)] text-[var(--text-primary)]">Campus Club 🎉</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Visibility</label>
                  <div className="px-3 py-2.5 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)] font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Lock size={13} className="text-[var(--accent-solid)]" /> Private Squad
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Description (optional)</label>
                <textarea
                  placeholder="What is this group focused on?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] focus-within:border-[var(--accent-solid)] rounded-xl px-3.5 py-2 text-[var(--text-primary)] focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                  <UserPlus size={14} className="text-[var(--accent-solid)]" /> Invite Classmates
                </label>
                {selectedInvites.length > 0 && (
                  <span className="text-[11px] text-[var(--accent-solid)] font-bold">{selectedInvites.length} selected</span>
                )}
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-2.5 pointer-events-none text-[var(--text-subtle)]" />
                <input
                  type="text"
                  placeholder="Search classmates by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
                />
              </div>

              {selectedInvites.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedInvites.map((p) => (
                    <span key={p.email} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--accent-muted)] border border-[var(--accent-solid)]/40 text-xs font-bold text-[var(--accent-solid)]">
                      {p.name}
                      <button type="button" onClick={() => toggleCreateInvite(p)} className="hover:text-red-400 ml-1 cursor-pointer">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {people.map((person) => {
                  const isSelected = selectedInvites.some((p) => p.email === person.email)
                  return (
                    <button
                      type="button"
                      key={person.email}
                      onClick={() => toggleCreateInvite(person)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected ? 'bg-[var(--accent-muted)] border border-[var(--accent-solid)]/40' : 'bg-[var(--surface-control)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">{person.name}</p>
                        <p className="text-[10px] text-[var(--text-subtle)] font-mono">{person.email}</p>
                      </div>
                      {isSelected ? <Check size={14} className="text-[var(--accent-solid)]" /> : <Plus size={14} className="text-[var(--text-subtle)]" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <button type="submit" className="w-full univo-gradient-bg text-black font-extrabold rounded-2xl py-3.5 text-xs flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-lg hover:scale-[1.02] transition-all">
              <Plus size={16} /> Create Group & Send Invites
            </button>
          </motion.form>
        </div>
      )}

      {/* INVITE MODAL FOR EXISTING GROUP */}
      {inviteModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md" onMouseDown={(e) => e.target === e.currentTarget && setInviteModalGroup(null)}>
          <motion.form
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="glass-panel w-full max-w-lg rounded-3xl p-7 relative space-y-4 bg-[var(--surface-modal)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onSubmit={sendMoreInvites}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 univo-gradient-bg" />

            <button type="button" className="absolute top-5 right-5 text-[var(--text-subtle)] hover:text-[var(--text-primary)] cursor-pointer p-1 rounded-lg hover:bg-white/10" onClick={() => setInviteModalGroup(null)} aria-label="Close">
              <X size={18} />
            </button>

            <div>
              <p className="settingsEyebrow text-[var(--accent-solid)] font-bold">INVITATION REQUEST</p>
              <h2 className="text-xl font-bold font-display text-[var(--text-primary)] mt-1">Invite to "{inviteModalGroup.name}"</h2>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-[var(--text-subtle)]" />
              <input
                type="text"
                placeholder="Search classmates by name or email..."
                value={existingGroupSearch}
                onChange={(e) => setExistingGroupSearch(e.target.value)}
                className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {people.map((person) => {
                const isMember = inviteModalGroup.members.includes(person.name)
                const isPending = (inviteModalGroup.pendingInvites || []).some((p) => (typeof p === 'string' ? p === person.email : p.email === person.email))
                const isSelected = existingSelectedInvites.some((p) => p.email === person.email)

                return (
                  <button
                    type="button"
                    key={person.email}
                    disabled={isMember || isPending}
                    onClick={() => toggleExistingInvite(person)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                      isMember || isPending
                        ? 'opacity-50 cursor-not-allowed bg-[var(--surface-control)]'
                        : isSelected
                        ? 'bg-[var(--accent-muted)] border border-[var(--accent-solid)]/40'
                        : 'bg-[var(--surface-control)] hover:bg-[var(--surface-hover)] cursor-pointer'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">{person.name}</p>
                      <p className="text-[10px] text-[var(--text-subtle)] font-mono">{person.email}</p>
                    </div>
                    {isMember ? (
                      <span className="text-[10px] text-[var(--text-subtle)] font-semibold">Member</span>
                    ) : isPending ? (
                      <span className="text-[10px] text-amber-400 font-bold">Invited</span>
                    ) : isSelected ? (
                      <Check size={14} className="text-[var(--accent-solid)]" />
                    ) : (
                      <Plus size={14} className="text-[var(--text-subtle)]" />
                    )}
                  </button>
                )
              })}
            </div>

            <button
              type="submit"
              disabled={!existingSelectedInvites.length}
              className="w-full univo-gradient-bg text-black font-extrabold rounded-2xl py-3.5 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={15} /> Send Group Invites ({existingSelectedInvites.length})
            </button>
          </motion.form>
        </div>
      )}

      {/* SHARED VAULT MODAL */}
      {vaultModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md" onMouseDown={(e) => e.target === e.currentTarget && setVaultModalGroup(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="glass-panel w-full max-w-lg rounded-3xl p-7 relative space-y-4 bg-[var(--surface-modal)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 univo-gradient-bg" />

            <button type="button" className="absolute top-5 right-5 text-[var(--text-subtle)] hover:text-[var(--text-primary)] cursor-pointer p-1" onClick={() => setVaultModalGroup(null)} aria-label="Close">
              <X size={18} />
            </button>

            <div>
              <p className="settingsEyebrow text-[var(--accent-solid)] font-bold">GROUP RESOURCE VAULT</p>
              <h2 className="text-xl font-bold font-display text-[var(--text-primary)] mt-1">{vaultModalGroup.name} Vault</h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">Shared course notes, lab code, and exam revision guides.</p>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {[
                { title: 'Data Structures Lab 3 - Solution Walkthrough.pdf', size: '2.4 MB', date: 'Today' },
                { title: 'Semester 4 Mid-Term Past Year Papers & Answer Key.zip', size: '14.8 MB', date: 'Yesterday' },
                { title: 'Operating Systems System Calls Reference Sheet.docx', size: '840 KB', date: '3 days ago' }
              ].map((doc, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <BookOpen size={16} className="text-[var(--accent-solid)] shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-[var(--text-primary)] truncate">{doc.title}</p>
                      <p className="text-[10px] text-[var(--text-subtle)] font-mono">{doc.size} &middot; Shared {doc.date}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[var(--accent-solid)] cursor-pointer hover:underline shrink-0">Download</span>
                </div>
              ))}
            </div>

            <button type="button" onClick={() => setVaultModalGroup(null)} className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer">
              Close Vault
            </button>
          </motion.div>
        </div>
      )}
    </PageTransition>
  )
}
