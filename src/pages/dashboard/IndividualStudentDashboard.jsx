import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame,
  Coffee,
  Clock,
  ArrowRight,
  Zap,
  BookOpen,
  MessageSquare,
  Plus,
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Circle,
  FileText,
  Sparkles,
  StickyNote,
  CheckSquare,
  Trash2,
  Calendar,
  AlertCircle,
  Check,
  Target,
  Percent,
  PenTool,
  Bookmark,
  Wallet,
  CreditCard,
  MapPin,
  User,
  ShieldCheck
} from 'lucide-react'
import PageTransition from '../../components/ui/PageTransition'
import GlassCard from '../../components/ui/GlassCard'
import AttendanceRing from '../../components/ui/AttendanceRing'
import AnimatedProgress from '../../components/ui/AnimatedProgress'
import { SkeletonDashboard } from '../../components/ui/Skeleton'
import { individualStudentData } from '../../lib/mockData'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getTimeGreeting } from '../../lib/timeGreeting'

const MOTIVATIONAL_QUOTES = [
  "Small daily habits build extraordinary semesters. Keep pushing! 🚀",
  "Focus on progress, not perfection. You're doing great! 🔥",
  "Consistency is the secret code to mastering your degree. 💻",
  "Organized mind, seamless semester. Stay in your flow! ✨",
  "One task at a time. You've got this! 🎯"
]

function PriorityBadge({ priority }) {
  const colors = {
    high: 'text-red-400 bg-red-500/15 border-red-500/30',
    medium: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    low: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
  }
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border ${colors[priority] || colors.medium}`}>
      {priority}
    </span>
  )
}

export default function IndividualStudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const storageKey = user?.email || 'guest'

  const [loading, setLoading] = useState(true)
  const [useDemoData] = useState(false)

  // Modals & Drawers
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const [focusModalOpen, setFocusModalOpen] = useState(false)
  const [quickNoteOpen, setQuickNoteOpen] = useState(false)
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false)
  const [showCompletedTasks, setShowCompletedTasks] = useState(false)

  // Schedules state
  const [schedule, setSchedule] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`univoSchedule:${storageKey}`) || '[]')
    } catch { return [] }
  })
  const [scheduleForm, setScheduleForm] = useState({ time: '09:00 AM - 10:30 AM', subject: '', room: '' })

  // Custom Quick Sticky Notes state
  const [notesList, setNotesList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`univoDashboardNotes:${storageKey}`) || '[]')
    } catch { return [] }
  })
  const [newNoteInput, setNewNoteInput] = useState('')

  // User tasks state
  const [userTasks, setUserTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`univoAssignments:${storageKey}`) || '[]')
    } catch { return [] }
  })
  const [taskForm, setTaskForm] = useState({ title: '', subject: 'General', due: 'Today', priority: 'medium' })

  // Attendance state — Default to [] (0 subjects)
  const [attendanceData, setAttendanceData] = useState(() => {
    try {
      const saved = localStorage.getItem(`univoAttendance:${storageKey}`)
      if (saved !== null) {
        const parsed = JSON.parse(saved)
        const isLegacyDemo = Array.isArray(parsed) && parsed.some((s) => s.subject === 'Data Structures' || s.subject === 'Data Structures & Algorithms')
        if (!isLegacyDemo && Array.isArray(parsed)) return parsed
      }
      return []
    } catch {
      return []
    }
  })
  const [newSubjectForm, setNewSubjectForm] = useState({ subject: '', attended: 15, total: 18 })

  // Expense Tracker Preview State & Sync
  const [dashboardExpenses, setDashboardExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem(`univoExpenses:${storageKey}`)
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  const [dashboardMonthlyBudget] = useState(() => {
    try {
      const saved = localStorage.getItem(`univoMonthlyBudget:${storageKey}`)
      return saved ? parseInt(saved, 10) : 6000
    } catch { return 6000 }
  })

  // Sync Expenses
  useEffect(() => {
    const handleSyncExpenses = () => {
      try {
        const saved = localStorage.getItem(`univoExpenses:${storageKey}`)
        if (saved !== null) setDashboardExpenses(JSON.parse(saved))
      } catch {}
    }
    window.addEventListener('univo-expenses-updated', handleSyncExpenses)
    return () => window.removeEventListener('univo-expenses-updated', handleSyncExpenses)
  }, [storageKey])

  // Sync Timetable Schedule
  useEffect(() => {
    const handleSyncSchedule = () => {
      try {
        const saved = localStorage.getItem(`univoSchedule:${storageKey}`)
        if (saved !== null) setSchedule(JSON.parse(saved))
      } catch {}
    }
    window.addEventListener('univo-schedule-updated', handleSyncSchedule)
    return () => window.removeEventListener('univo-schedule-updated', handleSyncSchedule)
  }, [storageKey])

  const totalExpenseSpent = useMemo(() => {
    const currentMonthKey = new Date().toISOString().slice(0, 7)
    return dashboardExpenses
      .filter((e) => !e.date || e.date.startsWith(currentMonthKey))
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  }, [dashboardExpenses])

  const expenseSpentPct = useMemo(() => {
    if (dashboardMonthlyBudget <= 0) return 0
    return Math.min(100, Math.round((totalExpenseSpent / dashboardMonthlyBudget) * 100))
  }, [totalExpenseSpent, dashboardMonthlyBudget])

  // Focus Timer State
  const [timerSeconds, setTimerSeconds] = useState(25 * 60)
  const [timerActive, setTimerActive] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(() => {
    try { return parseInt(localStorage.getItem(`univoFocusSessions:${storageKey}`) || '0', 10) } catch { return 0 }
  })

  const quote = useMemo(() => MOTIVATIONAL_QUOTES[Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % MOTIVATIONAL_QUOTES.length], [])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  // Timer Interval Effect
  useEffect(() => {
    let interval = null
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000)
    } else if (timerSeconds === 0 && timerActive) {
      setTimerActive(false)
      setTimerSeconds(25 * 60)
      const next = completedSessions + 1
      setCompletedSessions(next)
      localStorage.setItem(`univoFocusSessions:${storageKey}`, `${next}`)
      alert('🎉 Great job! You completed a 25-minute focus session!')
    }
    return () => clearInterval(interval)
  }, [timerActive, timerSeconds, completedSessions, storageKey])

  // Tasks Filter
  const activePendingTasks = useMemo(() => userTasks.filter((t) => t.status !== 'completed'), [userTasks])
  const completedTasks = useMemo(() => userTasks.filter((t) => t.status === 'completed'), [userTasks])
  const displayTasks = showCompletedTasks ? userTasks : activePendingTasks

  // Handlers
  const saveSchedule = (e) => {
    e.preventDefault()
    if (!scheduleForm.subject.trim()) return
    const newSlot = {
      id: `${Date.now()}`,
      time: scheduleForm.time || '09:00 AM - 10:30 AM',
      subject: scheduleForm.subject.trim(),
      room: scheduleForm.room.trim() || 'Room 101',
      status: 'upcoming'
    }
    const next = [...schedule, newSlot]
    setSchedule(next)
    localStorage.setItem(`univoSchedule:${storageKey}`, JSON.stringify(next))
    setScheduleForm({ time: '09:00 AM - 10:30 AM', subject: '', room: '' })
    setScheduleOpen(false)
  }

  const toggleClassDone = (slotId) => {
    const next = schedule.map((item) => item.id === slotId ? { ...item, completed: !item.completed } : item)
    setSchedule(next)
    localStorage.setItem(`univoSchedule:${storageKey}`, JSON.stringify(next))
  }

  const saveTask = (e) => {
    e.preventDefault()
    if (!taskForm.title.trim()) return
    const newTask = {
      id: `${Date.now()}`,
      title: taskForm.title.trim(),
      subject: 'General',
      due: 'Today',
      priority: 'medium',
      status: 'pending'
    }
    const next = [newTask, ...userTasks]
    setUserTasks(next)
    localStorage.setItem(`univoAssignments:${storageKey}`, JSON.stringify(next))
    setTaskForm({ title: '', subject: 'General', due: 'Today', priority: 'medium' })
    setTaskOpen(false)
  }

  const toggleTaskDone = (id) => {
    const next = userTasks.map((t) => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t)
    setUserTasks(next)
    localStorage.setItem(`univoAssignments:${storageKey}`, JSON.stringify(next))
  }

  const saveQuickNoteModal = (e) => {
    e.preventDefault()
    if (!newNoteInput.trim()) return
    const next = [{ id: `${Date.now()}`, text: newNoteInput.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...notesList]
    setNotesList(next)
    localStorage.setItem(`univoDashboardNotes:${storageKey}`, JSON.stringify(next))
    setNewNoteInput('')
    setQuickNoteOpen(false)
  }

  const deleteNote = (id) => {
    const next = notesList.filter((n) => n.id !== id)
    setNotesList(next)
    localStorage.setItem(`univoDashboardNotes:${storageKey}`, JSON.stringify(next))
  }

  const saveNewSubject = (e) => {
    e.preventDefault()
    if (!newSubjectForm.subject.trim()) return
    const newEntry = {
      subject: newSubjectForm.subject.trim(),
      attended: Number(newSubjectForm.attended) || 0,
      total: Math.max(Number(newSubjectForm.attended) || 0, Number(newSubjectForm.total) || 1)
    }
    const next = [...attendanceData, newEntry]
    setAttendanceData(next)
    localStorage.setItem(`univoAttendance:${storageKey}`, JSON.stringify(next))
    window.dispatchEvent(new Event('univo-attendance-updated'))
    setNewSubjectForm({ subject: '', attended: 15, total: 18 })
    setAttendanceModalOpen(false)
  }

  const adjustAttendance = (idx, deltaAttended, deltaTotal) => {
    const next = [...attendanceData]
    const item = { ...next[idx] }
    item.attended = Math.max(0, item.attended + deltaAttended)
    item.total = Math.max(item.attended, item.total + deltaTotal)
    next[idx] = item
    setAttendanceData(next)
    localStorage.setItem(`univoAttendance:${storageKey}`, JSON.stringify(next))
    window.dispatchEvent(new Event('univo-attendance-updated'))
  }

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (loading) return <SkeletonDashboard />

  return (
    <PageTransition>
      {/* HERO BANNER & GREETING */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-extrabold text-[var(--accent-solid)] uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={14} /> {getTimeGreeting()}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="dashboard-user-name font-display text-4xl md:text-5xl font-extrabold tracking-tight mt-1">
            <span className="univo-gradient-text text-[var(--accent-solid)]">{user?.name?.split(' ')[0] || 'Shikhar'}</span> <span className="inline-block animate-[wave_2s_ease-in-out_infinite]">👋</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-[var(--text-muted)] text-xs md:text-sm mt-1 flex items-center gap-2">
            <span>{quote}</span>
          </motion.p>
        </div>

        {/* QUICK ACTION BAR */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFocusModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-[var(--surface-control)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
          >
            <Zap size={15} className="text-amber-400" /> Focus Mode ({completedSessions} done)
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard/me/timetable')}
            className="px-3.5 py-2.5 rounded-xl bg-[var(--surface-control)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
          >
            <Clock size={15} className="text-[var(--accent-solid)]" /> Timetable
          </button>
          
          <button
            type="button"
            onClick={() => setScheduleOpen(true)}
            className="px-3.5 py-2.5 rounded-xl univo-gradient-bg text-black text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 shadow-md"
          >
            <Plus size={15} /> Add Schedule
          </button>

          <button
            type="button"
            onClick={() => setTaskOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-[var(--surface-control)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
          >
            <Plus size={15} /> Add Task
          </button>

          <button
            type="button"
            onClick={() => setQuickNoteOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-[var(--surface-control)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
          >
            <PenTool size={14} className="text-emerald-400" /> Quick Note
          </button>
        </motion.div>
      </div>

      {/* TOP ROW 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* WIDGET 1: TODAY'S SCHEDULE */}
        <GlassCard className="lg:col-span-2" delay={0.15}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[var(--accent-solid)]" />
              <h2 className="font-display font-bold text-lg text-[var(--text-primary)]">Today's Schedule</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-[var(--text-subtle)]">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <button
                type="button"
                onClick={() => setScheduleOpen(true)}
                className="univo-gradient-bg text-black px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 cursor-pointer shadow-sm hover:scale-105 transition-all"
              >
                <Plus size={13} /> Class
              </button>
            </div>
          </div>

          <div className="space-y-2.5 min-h-[140px]">
            {schedule.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl space-y-2.5 bg-[var(--surface-control)]">
                <Calendar size={32} className="mx-auto text-[var(--accent-solid)]" />
                <p className="text-sm font-bold text-[var(--text-primary)]">No classes scheduled for today</p>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">Add your daily lectures or labs to track room locations and attendance check-offs.</p>
                <button
                  type="button"
                  onClick={() => setScheduleOpen(true)}
                  className="px-4 py-2 rounded-xl univo-gradient-bg text-black text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 transition-all mt-1"
                >
                  <Plus size={14} /> Add Today's Class
                </button>
              </div>
            ) : (
              schedule.map((slot, i) => (
                <motion.div
                  key={slot.id || slot.time + i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                    slot.completed
                      ? 'bg-[var(--surface-control)] border-[var(--border-subtle)] opacity-60'
                      : 'bg-[var(--surface-control)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => slot.id && toggleClassDone(slot.id)}
                    className="text-[var(--text-subtle)] hover:text-[var(--accent-solid)] cursor-pointer shrink-0"
                  >
                    {slot.completed ? <CheckCircle2 size={18} className="text-[var(--accent-solid)]" /> : <Circle size={18} />}
                  </button>

                  <span className="text-xs font-mono font-bold text-[var(--accent-solid)] px-2.5 py-1 rounded-lg bg-[var(--accent-solid)]/10 shrink-0">
                    {slot.time}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate text-[var(--text-primary)] ${slot.completed ? 'line-through text-[var(--text-subtle)]' : ''}`}>
                      {slot.subject}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-0.5">
                      <span className="flex items-center gap-1"><MapPin size={12} className="text-[var(--accent-solid)]" /> {slot.room || 'Classroom'}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </GlassCard>

        {/* WIDGET 2: ATTENDANCE TRACKER */}
        <GlassCard delay={0.2}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Percent size={18} className="text-[var(--accent-solid)]" />
              <h2 className="font-display font-bold text-lg text-[var(--text-primary)]">Attendance Tracker</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard/me/attendance-tracker')}
              className="text-xs text-[var(--accent-solid)] hover:underline font-bold cursor-pointer"
            >
              Open Tracker &rarr;
            </button>
          </div>

          <div className="space-y-3 min-h-[140px] max-h-[320px] overflow-y-auto pr-1">
            {attendanceData.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl space-y-2 bg-[var(--surface-control)]">
                <Percent size={32} className="mx-auto text-[var(--accent-solid)]" />
                <p className="text-sm font-bold text-[var(--text-primary)]">No subjects tracked yet</p>
                <p className="text-xs text-[var(--text-muted)]">Track your subjects to get smart 75% bunk advisor recommendations.</p>
                <button
                  type="button"
                  onClick={() => setAttendanceModalOpen(true)}
                  className="px-4 py-2 rounded-xl univo-gradient-bg text-black text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 transition-all mt-1"
                >
                  <Plus size={14} /> Add First Subject
                </button>
              </div>
            ) : (
              attendanceData.map((item, idx) => {
                const pct = item.total > 0 ? Math.round((item.attended / item.total) * 100) : 0
                const isSafe = pct >= 75
                return (
                  <div key={item.subject + idx} className="p-3.5 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)] space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[var(--text-primary)] truncate max-w-[140px]">{item.subject}</span>
                      <span className={`font-mono px-2 py-0.5 rounded-md ${isSafe ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
                        {pct}% ({item.attended}/{item.total})
                      </span>
                    </div>

                    <AnimatedProgress value={pct} height={6} delay={idx * 0.1} />

                    <div className="flex items-center justify-between text-[11px] text-[var(--text-subtle)] pt-1">
                      <span>Simulate:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => adjustAttendance(idx, 1, 1)}
                          className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 font-bold cursor-pointer transition-colors"
                        >
                          + Attend
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustAttendance(idx, 0, 1)}
                          className="px-2 py-0.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 font-bold cursor-pointer transition-colors"
                        >
                          + Bunk
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </GlassCard>
      </div>

      {/* SECONDARY ROW: 3-COLUMN WIDGET GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">

        {/* WIDGET 3: TASKS TO COMPLETE */}
        <GlassCard delay={0.25}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <CheckSquare size={18} className="text-[var(--accent-solid)]" />
              <h2 className="font-display font-bold text-lg text-[var(--text-primary)]">Tasks to complete</h2>
            </div>

            <div className="flex items-center gap-2">
              {completedTasks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                  className="text-[11px] text-[var(--text-subtle)] hover:text-[var(--text-primary)] font-semibold transition-colors cursor-pointer"
                >
                  {showCompletedTasks ? 'Hide Done' : `Done (${completedTasks.length})`}
                </button>
              )}

              <button
                type="button"
                onClick={() => setTaskOpen(true)}
                className="univo-gradient-bg text-black px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 cursor-pointer shadow-sm hover:scale-105 transition-all"
              >
                <Plus size={13} /> Task
              </button>
            </div>
          </div>

          <div className="space-y-2.5 min-h-[140px]">
            <AnimatePresence mode="popLayout">
              {displayTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl space-y-2 bg-[var(--surface-control)]"
                >
                  <CheckCircle2 size={28} className="mx-auto text-emerald-400" />
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    {completedTasks.length > 0 ? 'All tasks completed! 🎉' : 'No pending tasks right now.'}
                  </p>
                  <button type="button" onClick={() => setTaskOpen(true)} className="text-xs text-[var(--accent-solid)] font-bold underline cursor-pointer">
                    + Add a new task
                  </button>
                </motion.div>
              ) : (
                displayTasks.map((t) => (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -10 }}
                    className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      t.status === 'completed'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                        : 'bg-[var(--surface-control)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => t.id && toggleTaskDone(t.id)}
                        className="mt-0.5 text-[var(--text-subtle)] hover:text-[var(--accent-solid)] cursor-pointer group shrink-0"
                      >
                        {t.status === 'completed' ? (
                          <CheckCircle2 size={18} className="text-emerald-400" />
                        ) : (
                          <div className="w-4 h-4 rounded border border-[var(--border-strong)] group-hover:border-[var(--accent-solid)] flex items-center justify-center transition-colors">
                            <Check size={12} className="opacity-0 group-hover:opacity-100 text-[var(--accent-solid)]" />
                          </div>
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold truncate text-[var(--text-primary)] ${t.status === 'completed' ? 'line-through text-[var(--text-subtle)]' : ''}`}>
                          {t.title}
                        </p>
                        <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">{t.subject} &middot; Due {t.due}</p>
                      </div>
                    </div>
                    <PriorityBadge priority={t.priority || 'medium'} />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </GlassCard>

        {/* WIDGET 4: EXPENSE TRACKER PREVIEW */}
        <GlassCard delay={0.28}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-[var(--accent-solid)]" />
              <h2 className="font-display font-bold text-lg text-[var(--text-primary)]">Expense Tracker</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard/me/expenses')}
              className="text-xs text-[var(--accent-solid)] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Open Tracker &rarr;
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)] space-y-2 mb-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[var(--text-muted)]">Monthly Spending</span>
              <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                totalExpenseSpent > dashboardMonthlyBudget
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                ₹{totalExpenseSpent.toLocaleString('en-IN')} / ₹{dashboardMonthlyBudget.toLocaleString('en-IN')}
              </span>
            </div>
            <AnimatedProgress value={expenseSpentPct} height={6} delay={0.2} />
            <div className="flex justify-between items-center text-[10px] text-[var(--text-subtle)] pt-0.5 font-mono">
              <span>{expenseSpentPct}% budget used</span>
              <span>
                {dashboardMonthlyBudget - totalExpenseSpent < 0
                  ? `Over by ₹${Math.abs(dashboardMonthlyBudget - totalExpenseSpent).toLocaleString('en-IN')}`
                  : `₹${(dashboardMonthlyBudget - totalExpenseSpent).toLocaleString('en-IN')} remaining`}
              </span>
            </div>
          </div>

          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {dashboardExpenses.length === 0 ? (
              <div className="p-4 text-center border border-dashed border-[var(--border-subtle)] rounded-xl space-y-1 bg-[var(--surface-control)]">
                <p className="text-xs font-bold text-[var(--text-primary)]">No expenses recorded</p>
                <p className="text-[11px] text-[var(--text-muted)]">Track your hostel rent, mess, & daily spending.</p>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/me/expenses')}
                  className="text-xs text-[var(--accent-solid)] font-extrabold underline cursor-pointer mt-1 inline-block"
                >
                  + Log First Expense
                </button>
              </div>
            ) : (
              dashboardExpenses.slice(0, 3).map((item) => (
                <div key={item.id} className="p-2.5 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)] flex items-center justify-between gap-2 text-xs">
                  <div className="truncate min-w-0">
                    <p className="font-bold text-[var(--text-primary)] truncate">{item.title}</p>
                    <p className="text-[10px] text-[var(--text-subtle)] capitalize">{item.category} &middot; {item.paymentMethod}</p>
                  </div>
                  <span className="font-bold text-[var(--text-primary)] font-mono shrink-0">-₹{Number(item.amount).toLocaleString('en-IN')}</span>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* WIDGET 5: DASHBOARD SCRATCHPAD */}
        <GlassCard delay={0.3}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <StickyNote size={18} className="text-[var(--accent-solid)]" />
              <h2 className="font-display font-bold text-lg text-[var(--text-primary)]">Dashboard Scratchpad</h2>
            </div>
            <button type="button" onClick={() => setQuickNoteOpen(true)} className="text-xs text-[var(--accent-solid)] font-bold hover:underline cursor-pointer">
              + New Note
            </button>
          </div>

          <form onSubmit={saveQuickNoteModal} className="flex items-center gap-2 mb-3">
            <input
              type="text"
              placeholder="Drop a quick thought or reminder..."
              value={newNoteInput}
              onChange={(e) => setNewNoteInput(e.target.value)}
              className="flex-1 bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
            />
            <button type="submit" className="univo-gradient-bg text-black px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer shadow-sm hover:scale-105 transition-all">
              Add
            </button>
          </form>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {notesList.length === 0 ? (
              <p className="text-xs text-center py-6 text-[var(--text-subtle)] italic">No quick notes added. Type a quick reminder above!</p>
            ) : (
              notesList.map((n) => (
                <div key={n.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--accent-muted)] border border-[var(--accent-solid)]/25 text-xs transition-all">
                  <span className="font-bold text-[var(--text-primary)]">{n.text}</span>
                  <div className="flex items-center gap-2.5 shrink-0 ml-2">
                    <span className="text-[10px] text-[var(--text-subtle)] font-mono">{n.time}</span>
                    <button type="button" onClick={() => deleteNote(n.id)} className="text-[var(--text-subtle)] hover:text-red-400 cursor-pointer p-0.5" aria-label="Delete note">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

      </div>

      {/* MODALS */}
      {/* ADD SCHEDULE MODAL */}
      {scheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md" onMouseDown={(e) => e.target === e.currentTarget && setScheduleOpen(false)}>
          <motion.form
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="glass-panel w-full max-w-md rounded-3xl p-7 relative space-y-4 bg-[var(--surface-modal)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-2xl overflow-hidden"
            onSubmit={saveSchedule}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 univo-gradient-bg" />

            <button type="button" className="absolute top-5 right-5 text-[var(--text-subtle)] hover:text-[var(--text-primary)] cursor-pointer p-1" onClick={() => setScheduleOpen(false)} aria-label="Close">
              <X size={18} />
            </button>

            <div>
              <p className="settingsEyebrow text-[var(--accent-solid)] font-bold">TIMETABLE</p>
              <h2 className="text-xl font-bold font-display text-[var(--text-primary)] mt-0.5">Add Today's Class</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Time Slot</label>
                <input
                  type="text"
                  placeholder="e.g. 09:00 AM - 10:30 AM"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                  required
                  className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems, Data Structures..."
                  value={scheduleForm.subject}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, subject: e.target.value })}
                  required
                  className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Room / Lab Location</label>
                <input
                  type="text"
                  placeholder="e.g. Hall 102, CS Lab 3..."
                  value={scheduleForm.room}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
                  className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
                />
              </div>
            </div>

            <button type="submit" className="w-full univo-gradient-bg text-black font-extrabold rounded-2xl py-3.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2 shadow-lg hover:scale-[1.02] transition-all">
              <Plus size={16} /> Add to Schedule
            </button>
          </motion.form>
        </div>
      )}

      {/* ADD TASK MODAL */}
      {taskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md" onMouseDown={(e) => e.target === e.currentTarget && setTaskOpen(false)}>
          <motion.form
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="glass-panel w-full max-w-md rounded-3xl p-7 relative space-y-4 bg-[var(--surface-modal)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-2xl overflow-hidden"
            onSubmit={saveTask}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 univo-gradient-bg" />

            <button type="button" className="absolute top-5 right-5 text-[var(--text-subtle)] hover:text-[var(--text-primary)] cursor-pointer p-1" onClick={() => setTaskOpen(false)} aria-label="Close">
              <X size={18} />
            </button>
            <p className="settingsEyebrow text-[var(--accent-solid)] font-bold">TASKS TO COMPLETE</p>
            <h2 className="text-xl font-bold font-display text-[var(--text-primary)]">Add Task</h2>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Finish Data Structures Lab 3, Buy notebooks, Submit OS Assignment..."
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                  autoFocus
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
                      onClick={() => setTaskForm({ ...taskForm, priority: p.id })}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        taskForm.priority === p.id
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

            <button type="submit" className="w-full univo-gradient-bg text-black font-extrabold rounded-2xl py-3.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2 shadow-lg hover:scale-[1.02] transition-all">
              <Plus size={16} /> Save Task
            </button>
          </motion.form>
        </div>
      )}

      {/* FOCUS MODE MODAL */}
      {focusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md" onMouseDown={(e) => e.target === e.currentTarget && setFocusModalOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="glass-panel w-full max-w-md rounded-3xl p-7 relative space-y-5 bg-[var(--surface-modal)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-2xl overflow-hidden text-center"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 univo-gradient-bg" />

            <button type="button" className="absolute top-5 right-5 text-[var(--text-subtle)] hover:text-[var(--text-primary)] cursor-pointer p-1" onClick={() => setFocusModalOpen(false)} aria-label="Close">
              <X size={18} />
            </button>

            <div>
              <p className="settingsEyebrow text-[var(--accent-solid)] font-bold uppercase tracking-wider">POMODORO FOCUS TIMER</p>
              <h2 className="text-2xl font-bold font-display text-[var(--text-primary)] mt-1">Deep Work Session</h2>
            </div>

            <div className="py-6 rounded-2xl bg-[var(--surface-control)] border border-[var(--border-subtle)]">
              <div className="font-mono text-5xl md:text-6xl font-extrabold text-[var(--accent-solid)] tracking-tight">
                {formatTimer(timerSeconds)}
              </div>
              <p className="text-xs text-[var(--text-subtle)] mt-2 font-semibold">25-minute uninterrupted study block</p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setTimerActive(!timerActive)}
                className="px-6 py-3.5 rounded-2xl univo-gradient-bg text-black font-extrabold text-sm flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-all"
              >
                {timerActive ? <Pause size={18} /> : <Play size={18} />}
                {timerActive ? 'Pause Session' : 'Start Focus Session'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTimerActive(false)
                  setTimerSeconds(25 * 60)
                }}
                className="p-3.5 rounded-2xl bg-[var(--surface-control)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-[var(--text-primary)] cursor-pointer transition-all"
                title="Reset Timer"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ADD ATTENDANCE SUBJECT MODAL */}
      {attendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md" onMouseDown={(e) => e.target === e.currentTarget && setAttendanceModalOpen(false)}>
          <motion.form
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="glass-panel w-full max-w-md rounded-3xl p-7 relative space-y-4 bg-[var(--surface-modal)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-2xl overflow-hidden"
            onSubmit={saveNewSubject}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 univo-gradient-bg" />

            <button type="button" className="absolute top-5 right-5 text-[var(--text-subtle)] hover:text-[var(--text-primary)] cursor-pointer p-1" onClick={() => setAttendanceModalOpen(false)} aria-label="Close">
              <X size={18} />
            </button>

            <div>
              <p className="settingsEyebrow text-[var(--accent-solid)] font-bold">ATTENDANCE TRACKER</p>
              <h2 className="text-xl font-bold font-display text-[var(--text-primary)] mt-0.5">Track New Subject</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems, Computer Networks..."
                  value={newSubjectForm.subject}
                  onChange={(e) => setNewSubjectForm({ ...newSubjectForm, subject: e.target.value })}
                  className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Classes Attended</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newSubjectForm.attended}
                    onChange={(e) => setNewSubjectForm({ ...newSubjectForm, attended: e.target.value })}
                    className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Total Conducted</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newSubjectForm.total}
                    onChange={(e) => setNewSubjectForm({ ...newSubjectForm, total: e.target.value })}
                    className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)] font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full univo-gradient-bg text-black font-extrabold rounded-2xl py-3.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2 shadow-lg hover:scale-[1.02] transition-all">
              <Plus size={16} /> Track Subject
            </button>
          </motion.form>
        </div>
      )}
    </PageTransition>
  )
}
