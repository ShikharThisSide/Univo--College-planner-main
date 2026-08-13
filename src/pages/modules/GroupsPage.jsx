import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, Plus, Search, UserPlus, Users, X, Send } from 'lucide-react'
import PageTransition from '../../components/ui/PageTransition'
import GlassCard from '../../components/ui/GlassCard'
import { useAuth } from '../../context/AuthContext'
import { DEMO_USERS } from '../../lib/constants'
import { readSocial, sendGroupInvite, writeSocial } from '../../lib/social'
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
  const key = `groups:${user?.email || 'guest'}`
  const [groups, setGroups] = useState(() => readSocial(key))
  const [openCreate, setOpenCreate] = useState(false)
  const [inviteModalGroup, setInviteModalGroup] = useState(null)
  
  // Group creation form state
  const [form, setForm] = useState({ name: '', description: '' })
  const [selectedInvites, setSelectedInvites] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Invite modal state for existing groups
  const [existingGroupSearch, setExistingGroupSearch] = useState('')
  const [existingSelectedInvites, setExistingSelectedInvites] = useState([])

  const people = useMemo(() => readPeople(user), [user])
  const empty = useMemo(() => !groups.length, [groups])

  useEffect(() => {
    const refresh = () => setGroups(readSocial(key))
    window.addEventListener('univo-social-updated', refresh)
    return () => window.removeEventListener('univo-social-updated', refresh)
  }, [key])

  const filteredPeopleForCreate = useMemo(() => {
    if (!searchQuery.trim()) return people
    const q = searchQuery.toLowerCase()
    return people.filter((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
  }, [people, searchQuery])

  const filteredPeopleForExisting = useMemo(() => {
    if (!existingGroupSearch.trim()) return people
    const q = existingGroupSearch.toLowerCase()
    return people.filter((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
  }, [people, existingGroupSearch])

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

  const create = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return

    const newGroup = {
      id: `${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim(),
      members: [user?.name || user?.email?.split('@')[0] || 'You'],
      creatorEmail: user?.email,
      pendingInvites: selectedInvites.map((p) => ({ email: p.email, name: p.name })),
      createdAt: Date.now()
    }

    const next = [...groups, newGroup]
    setGroups(next)
    writeSocial(key, next)

    // Dispatch invitations to all selected people
    selectedInvites.forEach((person) => {
      sendGroupInvite(newGroup, user, person.email, person.name)
    })

    setForm({ name: '', description: '' })
    setSelectedInvites([])
    setSearchQuery('')
    setOpenCreate(false)
  }

  const sendMoreInvites = (e) => {
    e.preventDefault()
    if (!inviteModalGroup || !existingSelectedInvites.length) return

    existingSelectedInvites.forEach((person) => {
      sendGroupInvite(inviteModalGroup, user, person.email, person.name)
    })

    // Refresh groups state
    setGroups(readSocial(key))
    setInviteModalGroup(null)
    setExistingSelectedInvites([])
    setExistingGroupSearch('')
  }

  const remove = (id) => {
    const next = groups.filter((g) => g.id !== id)
    setGroups(next)
    writeSocial(key, next)
  }

  return (
    <PageTransition>
      <div className="mb-8">
        <p className="settingsEyebrow">UNIVO COMMUNITY</p>
        <h1 className="font-display text-4xl font-bold tracking-tight mt-2 text-[var(--accent-solid)]">Your groups.</h1>
        <p className="text-white/45 text-sm mt-2">Create focused spaces for classmates, projects, and study partners.</p>
      </div>

      <section className="groupsFeature">
        <div className="groupsFeatureCopy">
          <p className="settingsEyebrow">YOUR CAMPUS, YOUR CIRCLE</p>
          <h2>Build with your people.</h2>
          <p>Bring classmates, friends, and project partners together in focused spaces made for collaboration.</p>
          <button type="button" onClick={() => setOpenCreate(true)} className="groupsFeatureButton cursor-pointer">
            Create a group <ArrowRight size={16} />
          </button>
        </div>
        <div className="groupsGlobe">
          <UnivoGlobe />
        </div>
      </section>

      <div className="flex justify-end mb-5">
        <button type="button" onClick={() => setOpenCreate(true)} className="univo-gradient-bg rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2 cursor-pointer text-black">
          <Plus size={16} /> Create group
        </button>
      </div>

      {empty ? (
        <GlassCard>
          <div className="messengerEmpty">
            <Users size={28} />
            <strong>No groups yet</strong>
            <span>Create your first group to start collaborating.</span>
          </div>
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {groups.map((group) => {
            const pendingList = group.pendingInvites || []
            return (
              <GlassCard key={group.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 rounded-xl univo-gradient-bg grid place-items-center text-black">
                        <Users size={18} />
                      </span>
                      <div>
                        <h2 className="font-display font-semibold text-base">{group.name}</h2>
                        <span className="text-[11px] text-white/40 block">Created by {group.creatorEmail === user?.email ? 'You' : group.members[0] || 'Community member'}</span>
                      </div>
                    </div>

                    <p className="text-sm text-white/55 mt-3">{group.description || 'No description added.'}</p>

                    <div className="mt-4 pt-3 border-t border-white/8 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white/70">
                          {group.members.length} active member{group.members.length === 1 ? '' : 's'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setInviteModalGroup(group)
                            setExistingSelectedInvites([])
                            setExistingGroupSearch('')
                          }}
                          className="text-xs text-[var(--accent-solid)] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <UserPlus size={13} /> Send invite
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {group.members.map((m, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-white/10 text-[11px] font-medium text-white/80">
                            {m}
                          </span>
                        ))}
                      </div>

                      {pendingList.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/5">
                          <span className="text-[11px] text-amber-400/90 font-medium block mb-1">
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
                  </div>

                  <button type="button" onClick={() => remove(group.id)} className="text-white/35 hover:text-red-400 cursor-pointer p-1" aria-label={`Delete ${group.name}`}>
                    <X size={16} />
                  </button>
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      {openCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setOpenCreate(false)}>
          <form className="glass-panel w-full max-w-lg rounded-2xl p-6 relative space-y-4 max-h-[90vh] overflow-y-auto" onSubmit={create}>
            <button type="button" className="absolute top-4 right-4 text-white/40 hover:text-white cursor-pointer" onClick={() => setOpenCreate(false)} aria-label="Close">
              <X size={18} />
            </button>
            
            <div>
              <p className="settingsEyebrow">NEW GROUP</p>
              <h2 className="text-xl font-bold font-display mt-1">Create a group</h2>
              <p className="text-xs text-white/45 mt-1">Setup your space and invite classmates via notification requests.</p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-white/70">Group Name</label>
              <input
                autoFocus
                required
                placeholder="e.g. B.Tech Budies, OS Study Circle..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent-solid)]"
              />

              <label className="block text-xs font-semibold text-white/70">Description (optional)</label>
              <textarea
                placeholder="What is this group about?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent-solid)] resize-none"
              />
            </div>

            <div className="pt-2 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                  <UserPlus size={14} className="text-[var(--accent-solid)]" /> Invite People (Send Requests)
                </label>
                {selectedInvites.length > 0 && (
                  <span className="text-[11px] text-[var(--accent-solid)] font-semibold">{selectedInvites.length} selected</span>
                )}
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-white/40" />
                <input
                  type="text"
                  placeholder="Search people by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[var(--accent-solid)]"
                />
              </div>

              {selectedInvites.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedInvites.map((p) => (
                    <span key={p.email} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--accent-solid)]/20 border border-[var(--accent-solid)]/40 text-xs font-medium text-white">
                      {p.name}
                      <button type="button" onClick={() => toggleCreateInvite(p)} className="hover:text-red-300 ml-1">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {filteredPeopleForCreate.map((person) => {
                  const isSelected = selectedInvites.some((p) => p.email === person.email)
                  return (
                    <button
                      type="button"
                      key={person.email}
                      onClick={() => toggleCreateInvite(person)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                        isSelected ? 'bg-[var(--accent-solid)]/15 border border-[var(--accent-solid)]/30' : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-semibold text-white">{person.name}</p>
                        <p className="text-[10px] text-white/40">{person.email}</p>
                      </div>
                      {isSelected ? <Check size={14} className="text-[var(--accent-solid)]" /> : <Plus size={14} className="text-white/40" />}
                    </button>
                  )
                })}
              </div>

              <p className="text-[11px] text-white/40 italic">
                Note: Invited members will receive a request notification in their bell menu to Accept or Reject.
              </p>
            </div>

            <button type="submit" className="w-full univo-gradient-bg text-black font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-2 cursor-pointer mt-2">
              <Plus size={16} /> Create group & Send invites
            </button>
          </form>
        </div>
      )}

      {/* SEND INVITES TO EXISTING GROUP MODAL */}
      {inviteModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setInviteModalGroup(null)}>
          <form className="glass-panel w-full max-w-lg rounded-2xl p-6 relative space-y-4 max-h-[90vh] overflow-y-auto" onSubmit={sendMoreInvites}>
            <button type="button" className="absolute top-4 right-4 text-white/40 hover:text-white cursor-pointer" onClick={() => setInviteModalGroup(null)} aria-label="Close">
              <X size={18} />
            </button>

            <div>
              <p className="settingsEyebrow">GROUP INVITATIONS</p>
              <h2 className="text-xl font-bold font-display mt-1">Invite to "{inviteModalGroup.name}"</h2>
              <p className="text-xs text-white/45 mt-1">Search classmates to send them a group invitation request.</p>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-white/40" />
              <input
                type="text"
                placeholder="Search people by name or email..."
                value={existingGroupSearch}
                onChange={(e) => setExistingGroupSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[var(--accent-solid)]"
              />
            </div>

            {existingSelectedInvites.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {existingSelectedInvites.map((p) => (
                  <span key={p.email} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--accent-solid)]/20 border border-[var(--accent-solid)]/40 text-xs font-medium text-white">
                    {p.name}
                    <button type="button" onClick={() => toggleExistingInvite(p)} className="hover:text-red-300 ml-1">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
              {filteredPeopleForExisting.map((person) => {
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
                        ? 'opacity-50 cursor-not-allowed bg-white/5'
                        : isSelected
                        ? 'bg-[var(--accent-solid)]/15 border border-[var(--accent-solid)]/30'
                        : 'bg-white/5 hover:bg-white/10 cursor-pointer'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{person.name}</p>
                      <p className="text-[10px] text-white/40">{person.email}</p>
                    </div>
                    {isMember ? (
                      <span className="text-[10px] text-white/40">Member</span>
                    ) : isPending ? (
                      <span className="text-[10px] text-amber-400">Invited</span>
                    ) : isSelected ? (
                      <Check size={14} className="text-[var(--accent-solid)]" />
                    ) : (
                      <Plus size={14} className="text-white/40" />
                    )}
                  </button>
                )
              })}
            </div>

            <button
              type="submit"
              disabled={!existingSelectedInvites.length}
              className="w-full univo-gradient-bg text-black font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={16} /> Send Invites ({existingSelectedInvites.length})
            </button>
          </form>
        </div>
      )}
    </PageTransition>
  )
}
