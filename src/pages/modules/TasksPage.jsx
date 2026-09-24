import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Tag,
  AlertCircle,
  Trash2,
  X,
  Search,
  Filter,
  Check,
  Sparkles,
  Kanban,
  ListFilter
} from 'lucide-react'
import PageTransition from '../../components/ui/PageTransition'
import GlassCard from '../../components/ui/GlassCard'
import AnimatedProgress from '../../components/ui/AnimatedProgress'
import { useAuth } from '../../context/AuthContext'
import { pushUserDataToCloud } from '../../lib/cloudSync'

export default function TasksPage() {
  const { user } = useAuth()
  const storageKey = user?.email || 'guest'

  // Tasks state synced with localStorage
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(`univoAssignments:${storageKey}`)
      if (saved !== null) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
      return []
    } catch { return [] }
  })

  // Modal & Form state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    subject: '',
    due: 'Tomorrow',
    priority: 'medium',
    status: 'pending'
  })

  // Filter & View State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [showCompleted, setShowCompleted] = useState(false)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'kanban'

  // Real-time sync listener
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(`univoAssignments:${storageKey}`)
        if (saved !== null) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) setTasks(parsed)
        }
      } catch {}
    }
    window.addEventListener('univo-tasks-updated', handleSync)
    return () => window.removeEventListener('univo-tasks-updated', handleSync)
  }, [storageKey])

  // Helper to persist & broadcast tasks
  const updateTasks = (nextTasks) => {
    setTasks(nextTasks)
    localStorage.setItem(`univoAssignments:${storageKey}`, JSON.stringify(nextTasks))
    window.dispatchEvent(new Event('univo-tasks-updated'))
    if (user?.email) pushUserDataToCloud(user.email)
  }

  // Action Handlers
  const handleToggleComplete = (id) => {
    const next = tasks.map((t) => {
      if (t.id !== id) return t
      const isCompleted = t.status === 'completed'
      return { ...t, status: isCompleted ? 'pending' : 'completed' }
    })
    updateTasks(next)
  }

  const handleDeleteTask = (id) => {
    const next = tasks.filter((t) => t.id !== id)
    updateTasks(next)
  }

  const handleAddTask = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const newEntry = {
      id: `task-${Date.now()}`,
      title: form.title.trim(),
      subject: form.subject.trim() || 'General',
      due: form.due || 'Tomorrow',
      priority: form.priority || 'medium',
      status: form.status || 'pending',
      createdAt: Date.now()
    }
    const next = [newEntry, ...tasks]
    updateTasks(next)
    setForm({ title: '', subject: '', due: 'Tomorrow', priority: 'medium', status: 'pending' })
    setAddModalOpen(false)
  }

  // Calculated Stats
  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.status === 'completed').length
    const pending = total - completed
    const highPriority = tasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, pending, highPriority, pct }
  }, [tasks])

  // Filtered List
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch = !searchQuery.trim() || t.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) || t.subject.toLowerCase().includes(searchQuery.trim().toLowerCase())
      const matchPriority = selectedPriority === 'all' || t.priority === selectedPriority
      const matchStatus = showCompleted ? true : t.status !== 'completed'
      return matchSearch && matchPriority && matchStatus
    })
  }, [tasks, searchQuery, selectedPriority, showCompleted])

  return (
    <PageTransition>
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="settingsEyebrow text-[var(--accent-solid)] font-bold">TASK MANAGER</p>
          <h1 className="font-display text-4xl font-bold tracking-tight mt-1 text-[var(--accent-solid)]">
            Tasks & Assignments
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Organize lab work, homework, projects, and personal deadlines with smooth completion exit animations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="p-1 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)] flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'list' ? 'univo-gradient-bg text-black' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ListFilter size={14} /> List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'kanban' ? 'univo-gradient-bg text-black' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Kanban size={14} /> Board
            </button>
          </div>

          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl univo-gradient-bg text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 shrink-0"
          >
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* METRICS & PROGRESS HERO */}
      <GlassCard className="mb-6 !p-0 overflow-hidden" delay={0.1}>
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
                <ClipboardList size={16} className="text-[var(--accent-solid)]" /> Overall Task Completion
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-display text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
                  {stats.pct}%
                </span>
                <span className="text-sm font-semibold text-[var(--text-muted)]">
                  ({stats.completed} of {stats.total} completed)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                stats.highPriority > 0
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              }`}>
                {stats.highPriority > 0 ? (
                  <>
                    <AlertCircle size={15} /> {stats.highPriority} High Priority Pending
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} /> All Priorities On Track
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-[var(--text-muted)]">
              <span>Semester Task Completion</span>
              <span>Target 100%</span>
            </div>
            <AnimatedProgress value={stats.pct} height={8} delay={0.2} />
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[var(--border-subtle)]">
            <div className="p-3 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)]">
              <span className="text-[11px] text-[var(--text-subtle)] block">Total Tasks</span>
              <span className="font-display text-lg font-bold text-[var(--text-primary)]">{stats.total}</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)]">
              <span className="text-[11px] text-[var(--text-subtle)] block">Pending</span>
              <span className="font-display text-lg font-bold text-amber-400">{stats.pending}</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)]">
              <span className="text-[11px] text-[var(--text-subtle)] block">Completed</span>
              <span className="font-display text-lg font-bold text-emerald-400">{stats.completed}</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)]">
              <span className="text-[11px] text-[var(--text-subtle)] block">High Priority Urgent</span>
              <span className="font-display text-lg font-bold text-red-400">{stats.highPriority}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* FILTER & CONTROL BAR */}
      <GlassCard className="mb-6" delay={0.2}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 md:w-64 flex items-center">
              <input
                type="text"
                placeholder="Search tasks or subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl pl-3.5 pr-9 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
              />
              <Search size={14} className="absolute right-3 pointer-events-none text-[var(--text-subtle)]" />
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1 bg-[var(--surface-control)] p-1 rounded-xl border border-[var(--border-subtle)] text-xs">
              {['all', 'high', 'medium', 'low'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPriority(p)}
                  className={`px-2.5 py-1 rounded-lg font-semibold uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
                    selectedPriority === p
                      ? 'bg-[var(--accent-muted)] border border-[var(--accent-solid)]/30 text-[var(--accent-solid)] font-extrabold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer self-end md:self-auto"
          >
            {showCompleted ? 'Hide Completed' : `Show Completed (${stats.completed})`}
          </button>
        </div>
      </GlassCard>

      {/* LIST VIEW WITH DOPE ANIMATE PRESENCE EXIT ANIMATION */}
      {viewMode === 'list' ? (
        <div className="space-y-2.5 mb-12">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-10 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl glass-card space-y-3"
              >
                <CheckCircle2 size={36} className="mx-auto text-emerald-400 animate-pulse" />
                <div>
                  <p className="text-base font-bold text-[var(--text-primary)]">
                    {stats.completed > 0 && !showCompleted ? 'All active tasks completed.' : 'No tasks found'}
                  </p>
                  <p className="text-xs text-[var(--text-subtle)] mt-1 max-w-sm mx-auto">
                    {stats.completed > 0 && !showCompleted
                      ? 'Great work! Toggle "Show Completed" above to view completed tasks or add a new task.'
                      : 'Click "+ Add Task" to log your lab assignments, homework, and study deadlines.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl univo-gradient-bg text-black text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all"
                >
                  <Plus size={16} /> Add Task
                </button>
              </motion.div>
            ) : (
              filteredTasks.map((task) => {
                const isCompleted = task.status === 'completed'

                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0, transition: { duration: 0.35 } }}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 glass-card ${
                      isCompleted
                        ? 'bg-emerald-500/10 border-emerald-500/25 opacity-70'
                        : 'bg-[var(--surface-control)] border-[var(--border-subtle)] hover:border-[var(--accent-solid)]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Interactive Checkbox Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(task.id)}
                        className={`p-1 rounded-lg transition-transform active:scale-90 cursor-pointer ${
                          isCompleted ? 'text-emerald-400' : 'text-[var(--text-subtle)] hover:text-[var(--accent-solid)]'
                        }`}
                        aria-label={isCompleted ? 'Mark pending' : 'Mark completed'}
                      >
                        {isCompleted ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold truncate ${
                          isCompleted ? 'line-through text-[var(--text-subtle)]' : 'text-[var(--text-primary)]'
                        }`}>
                          {task.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-subtle)] mt-1">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-medium">
                            {task.subject}
                          </span>
                          <span>&middot;</span>
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <Clock size={12} /> {task.due}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Priority Tag */}
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        task.priority === 'high'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : task.priority === 'medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {task.priority}
                      </span>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-[var(--text-subtle)] hover:text-red-400 p-1 cursor-pointer transition-colors"
                        aria-label={`Delete ${task.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { id: 'pending', label: 'Pending ⏳', color: 'text-amber-400 border-amber-500/30' },
            { id: 'in_progress', label: 'In Progress ⚡', color: 'text-cyan-400 border-cyan-500/30' },
            { id: 'completed', label: 'Completed', color: 'text-emerald-400 border-emerald-500/30' }
          ].map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id)

            return (
              <GlassCard key={col.id} className="space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)] mb-3">
                    <h3 className={`font-display font-bold text-sm ${col.color}`}>{col.label}</h3>
                    <span className="text-xs text-[var(--text-subtle)] font-mono">({colTasks.length})</span>
                  </div>

                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {colTasks.length === 0 ? (
                        <p className="text-xs text-[var(--text-subtle)] italic p-3 text-center border border-dashed border-[var(--border-subtle)] rounded-xl">
                          No tasks in {col.id.replace('_', ' ')}
                        </p>
                      ) : (
                        colTasks.map((t) => (
                          <motion.div
                            key={t.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="p-3 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)] space-y-2 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-[var(--text-primary)]">{t.title}</p>
                              <button type="button" onClick={() => handleDeleteTask(t.id)} className="text-[var(--text-subtle)] hover:text-red-400 p-0.5">
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-[var(--text-subtle)]">
                              <span className="font-mono">{t.subject}</span>
                              <button
                                type="button"
                                onClick={() => handleToggleComplete(t.id)}
                                className="text-[var(--accent-solid)] font-bold hover:underline cursor-pointer"
                              >
                                {t.status === 'completed' ? 'Reopen' : 'Complete ✓'}
                              </button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}

      {/* ADD TASK MODAL — Simple Single Field Title Form */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setAddModalOpen(false)}>
          <form className="glass-panel w-full max-w-md rounded-2xl p-6 relative space-y-4 bg-[var(--surface-modal)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-2xl" onSubmit={handleAddTask}>
            <button type="button" className="absolute top-4 right-4 text-[var(--text-subtle)] hover:text-[var(--text-primary)] cursor-pointer" onClick={() => setAddModalOpen(false)} aria-label="Close">
              <X size={18} />
            </button>
            <p className="settingsEyebrow text-[var(--accent-solid)] font-bold">TASK LOG</p>
            <h2 className="text-xl font-bold font-display text-[var(--text-primary)]">Add Task</h2>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Finish Data Structures Lab 3, Buy notebooks, Submit OS Assignment..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-[var(--text-secondary)]">Priority Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'high', label: '🔴 High', color: 'bg-red-500/20 border-red-500/50 text-red-400' },
                    { id: 'medium', label: '🟡 Medium', color: 'bg-amber-500/20 border-amber-500/50 text-amber-400' },
                    { id: 'low', label: '🟢 Low', color: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setForm({ ...form, priority: p.id })}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        form.priority === p.id
                          ? `${p.color} ring-2 ring-[var(--accent-solid)]/30 scale-105 shadow-sm`
                          : 'bg-[var(--surface-control)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" className="w-full univo-gradient-bg text-black font-semibold rounded-xl py-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2">
              <Plus size={16} /> Save Task
            </button>
          </form>
        </div>
      )}
    </PageTransition>
  )
}
