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
  Bookmark
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
    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold border ${colors[priority] || colors.medium}`}>
      {priority}
    </span>
  )
}

export default function IndividualStudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const storageKey = user?.email || 'guest'

  const [loading, setLoading] = useState(true)
  const [useDemoData, setUseDemoData] = useState(() => {
    try { return localStorage.getItem(`univoUseDemoData:${storageKey}`) === 'true' } catch { return false }
  })

  // Modals & Drawers
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const [focusModalOpen, setFocusModalOpen] = useState(false)
  const [quickNoteOpen, setQuickNoteOpen] = useState(false)
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [showCompletedTasks, setShowCompletedTasks] = useState(false)

  // Schedules state
  const [schedule, setSchedule] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`univoSchedule:${storageKey}`) || '[]')
    } catch { return [] }
  })
  const [scheduleForm, setScheduleForm] = useState({ time: '09:00', subject: '', room: '' })

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
  const [taskForm, setTaskForm] = useState({ title: '', subject: '', due: 'Tomorrow', priority: 'medium' })

  // Attendance state — Default to [] when no subjects are saved
  const [attendanceData, setAttendanceData] = useState(() => {
    try {
      const saved = localStorage.getItem(`univoAttendance:${storageKey}`)
      if (saved !== null) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
      return []
    } catch {
      return []
    }
  })
  const [newSubjectForm, setNewSubjectForm] = useState({ subject: '', attended: 15, total: 18 })

  // Target Goal / Exam state
  const [targetGoal, setTargetGoal] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`univoTargetGoal:${storageKey}`) || 'null')
    } catch { return null }
  })
  const [goalForm, setGoalForm] = useState({ title: '', date: '' })

  // Focus Timer State
  const [timerSeconds, setTimerSeconds] = useState(25 * 60)
  const [timerActive, setTimerActive] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(() => {
    try { return parseInt(localStorage.getItem(`univoFocusSessions:${storageKey}`) || '0', 10) } catch { return 0 }
  })

  // Daily Quote index
  const quote = useMemo(() => MOTIVATIONAL_QUOTES[Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % MOTIVATIONAL_QUOTES.length], [])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700)
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

  // Target Days Left Calculation
  const daysLeft = useMemo(() => {
    if (!targetGoal || !targetGoal.date) return null
    const diff = new Date(targetGoal.date).getTime() - new Date().setHours(0,0,0,0)
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }, [targetGoal])

  // Combined Data source (Demo or User created)
  const isDemoActive = useDemoData || user?.id?.startsWith('demo-')
  const displaySchedule = useMemo(() => {
    if (schedule.length > 0) return schedule
    if (isDemoActive) return individualStudentData.todaySchedule
    return []
  }, [schedule, isDemoActive])

  const allTasks = useMemo(() => {
    if (userTasks.length > 0) return userTasks
    if (isDemoActive) return individualStudentData.assignments
    return []
  }, [userTasks, isDemoActive])

  // Filter tasks to display
  const activePendingTasks = useMemo(() => allTasks.filter((t) => t.status !== 'completed'), [allTasks])
  const completedTasks = useMemo(() => allTasks.filter((t) => t.status === 'completed'), [allTasks])
  const displayTasks = showCompletedTasks ? allTasks : activePendingTasks

  // Save Schedule Handler
  const saveSchedule = (e) => {
    e.preventDefault()
    if (!scheduleForm.subject.trim()) return
    const newSlot = {
      id: `${Date.now()}`,
      time: scheduleForm.time || '10:00 AM',
      subject: scheduleForm.subject.trim(),
      room: scheduleForm.room.trim() || 'Room 101',
      status: 'upcoming'
    }
    const next = [...schedule, newSlot].sort((a, b) => a.time.localeCompare(b.time))
    setSchedule(next)
    localStorage.setItem(`univoSchedule:${storageKey}`, JSON.stringify(next))
    setScheduleForm({ time: '09:00', subject: '', room: '' })
    setScheduleOpen(false)
  }

  // Toggle Schedule Class Completed
  const toggleClassDone = (slotId) => {
    const next = schedule.map((item) => item.id === slotId ? { ...item, completed: !item.completed } : item)
    setSchedule(next)
    localStorage.setItem(`univoSchedule:${storageKey}`, JSON.stringify(next))
  }

  // Save Task Handler
  const saveTask = (e) => {
    e.preventDefault()
    if (!taskForm.title.trim()) return
    const newTask = {
      id: `${Date.now()}`,
      title: taskForm.title.trim(),
      subject: taskForm.subject.trim() || 'General',
      due: taskForm.due || 'Tomorrow',
      priority: taskForm.priority,
      status: 'pending'
    }
    const next = [newTask, ...userTasks]
    setUserTasks(next)
    localStorage.setItem(`univoAssignments:${storageKey}`, JSON.stringify(next))
    setTaskForm({ title: '', subject: '', due: 'Tomorrow', priority: 'medium' })
    setTaskOpen(false)
  }

  // Toggle Task Completion
  const toggleTaskDone = (id) => {
    const next = userTasks.map((t) => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t)
    setUserTasks(next)
    localStorage.setItem(`univoAssignments:${storageKey}`, JSON.stringify(next))
  }

  // Save Quick Note
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

  // Add New Attendance Subject
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

  // Sync attendance with external updates
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(`univoAttendance:${storageKey}`) || 'null')
        if (saved && Array.isArray(saved)) setAttendanceData(saved)
      } catch {}
    }
    window.addEventListener('univo-attendance-updated', handleSync)
    return () => window.removeEventListener('univo-attendance-updated', handleSync)
  }, [storageKey])

  // Save Target Goal
  const saveGoal = (e) => {
    e.preventDefault()
    if (!goalForm.title.trim() || !goalForm.date) return
    const newGoal = { title: goalForm.title.trim(), date: goalForm.date }
    setTargetGoal(newGoal)
    localStorage.setItem(`univoTargetGoal:${storageKey}`, JSON.stringify(newGoal))
    setGoalModalOpen(false)
  }

  const clearGoal = () => {
    setTargetGoal(null)
    localStorage.removeItem(`univoTargetGoal:${storageKey}`)
  }

  // Simulate Attendance Change
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

  // Format Timer
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (loading) return <SkeletonDashboard />

  return (
    <PageTransition>
      {/* HERO BANNER & GREETING */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-semibold text-white/50 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={14} className="text-[var(--accent-solid)]" /> {getTimeGreeting()}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="dashboard-user-name font-display text-4xl md:text-5xl font-bold tracking-tight mt-1">
            {user?.name?.split(' ')[0] || 'Shikhar'} <span className="inline-block animate-[wave_2s_ease-in-out_infinite]">👋</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-white/55 text-xs md:text-sm mt-1.5 flex items-center gap-2">
            <span>{quote}</span>
          </motion.p>
        </div>

        {/* QUICK ACTION BAR */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap items-center gap-2">
          {/* Option 1: Focus Mode */}
          <button
            type="button"
            onClick={() => setFocusModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
          >
            <Zap size={15} className="text-amber-400" /> Focus Mode ({completedSessions} done)
          </button>
          
          {/* Option 2: Add Schedule */}
          <button
            type="button"
            onClick={() => setScheduleOpen(true)}
            className="px-3.5 py-2 rounded-xl univo-gradient-bg text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
          >
            <Plus size={15} /> Add Schedule
          </button>

          {/* Option 3: Add Task */}
          <button
            type="button"
            onClick={() => setTaskOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
          >
            <Plus size={15} /> Add Task
          </button>

          {/* Option 4: Quick Note */}
          <button
            type="button"
            onClick={() => setQuickNoteOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
          >
            <PenTool size={14} className="text-emerald-400" /> Quick Note
          </button>

          {/* Option 5: Track Subject */}
          <button
            type="button"
            onClick={() => setAttendanceModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
          >
            <Percent size={14} className="text-cyan-400" /> Track Subject
          </button>

          {/* Option 6: Target Goal / Exam Countdown */}
          <button
            type="button"
            onClick={() => setGoalModalOpen(true)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 ${
              targetGoal ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-white/5 border-white/10 text-white/80'
            }`}
          >
            <Target size={14} className={targetGoal ? 'text-purple-400' : 'text-purple-300'} />
            {targetGoal ? `${targetGoal.title} (${daysLeft < 0 ? 'Passed' : daysLeft === 0 ? 'Today!' : `${daysLeft}d left`})` : 'Target Goal'}
          </button>

        </motion.div>
      </div>

      {/* MAIN WIDGET GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* TODAY'S SCHEDULE TIMELINE */}
        <GlassCard className="lg:col-span-2" delay={0.15}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[var(--accent-solid)]" />
              <h2 className="font-display font-semibold text-lg">Today's Schedule</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">{new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              <button type="button" onClick={() => setScheduleOpen(true)} className="univo-gradient-bg text-black px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer">
                <Plus size={13} /> Class
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {displaySchedule.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-white/15 rounded-2xl space-y-3">
                <Calendar size={28} className="mx-auto text-white/30" />
                <p className="text-sm font-semibold text-white/70">No classes scheduled for today</p>
                <p className="text-xs text-white/40 max-w-xs mx-auto">Add your daily classes to track timetable, room numbers, and check-offs.</p>
                <button type="button" onClick={() => setScheduleOpen(true)} className="px-4 py-2 rounded-xl univo-gradient-bg text-black text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer">
                  <Plus size={14} /> Build Timetable
                </button>
              </div>
            ) : (
              displaySchedule.map((slot, i) => (
                <motion.div
                  key={slot.id || slot.time + i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                    slot.completed ? 'bg-white/2 border-white/5 opacity-60' : 'bg-white/5 border-white/10 hover:border-[var(--accent-solid)]/40 hover:bg-white/8'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => slot.id && toggleClassDone(slot.id)}
                    className="text-white/40 hover:text-[var(--accent-solid)] cursor-pointer"
                  >
                    {slot.completed ? <CheckCircle2 size={18} className="text-[var(--accent-solid)]" /> : <Circle size={18} />}
                  </button>

                  <span className="text-xs font-mono font-medium text-white/50 w-16 shrink-0">{slot.time}</span>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${slot.completed ? 'line-through text-white/50' : 'text-white'}`}>
                      {slot.subject}
                    </p>
                    <p className="text-xs text-white/40">{slot.room || 'Classroom'}</p>
                  </div>

                  {slot.status === 'current' && (
                    <span className="px-2 py-0.5 rounded-full univo-gradient-bg text-[10px] font-bold text-black uppercase tracking-wider">
                      Now
                    </span>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </GlassCard>

        {/* ATTENDANCE TRACKER & SIMULATOR */}
        <GlassCard delay={0.2}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-semibold text-lg">Attendance Tracker</h2>
              <button type="button" onClick={() => setAttendanceModalOpen(true)} className="text-xs text-[var(--accent-solid)] hover:underline cursor-pointer">
                + Add
              </button>
            </div>
            <span className="text-[11px] text-[var(--accent-solid)] font-semibold font-mono">Target &ge; 75%</span>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {attendanceData.map((item, idx) => {
              const pct = item.total > 0 ? Math.round((item.attended / item.total) * 100) : 0
              const isSafe = pct >= 75
              return (
                <div key={item.subject + idx} className="p-3 rounded-xl bg-white/5 border border-white/8 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-white truncate max-w-[140px]">{item.subject}</span>
                    <span className={`font-mono px-2 py-0.5 rounded-md ${isSafe ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                      {pct}% ({item.attended}/{item.total})
                    </span>
                  </div>

                  <AnimatedProgress value={pct} height={5} delay={idx * 0.1} />

                  <div className="flex items-center justify-between text-[11px] text-white/40 pt-1">
                    <span>Simulate:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => adjustAttendance(idx, 1, 1)}
                        className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-semibold cursor-pointer"
                        title="Attended class (+1)"
                      >
                        + Attend
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustAttendance(idx, 0, 1)}
                        className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-semibold cursor-pointer"
                        title="Skipped class (+1 total)"
                      >
                        + Bunk
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>
      </div>

      {/* SECONDARY ROW: TASKS TO COMPLETE & QUICK SCRATCHPAD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">

        {/* TASKS TO COMPLETE WIDGET */}
        <GlassCard delay={0.25}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare size={18} className="text-[var(--accent-solid)]" />
              <h2 className="font-display font-semibold text-lg">Tasks to complete</h2>
            </div>

            <div className="flex items-center gap-2">
              {completedTasks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                  className="text-[11px] text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  {showCompletedTasks ? 'Hide Done' : `Show Done (${completedTasks.length})`}
                </button>
              )}

              <button
                type="button"
                onClick={() => setTaskOpen(true)}
                className="univo-gradient-bg text-black px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} /> Add Task
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
                  className="p-6 text-center border border-dashed border-white/15 rounded-xl space-y-2"
                >
                  <CheckCircle2 size={24} className="mx-auto text-emerald-400" />
                  <p className="text-xs font-semibold text-white/70">
                    {completedTasks.length > 0 ? 'All tasks completed! Great work 🎉' : 'No tasks to complete right now.'}
                  </p>
                  <button type="button" onClick={() => setTaskOpen(true)} className="text-xs text-[var(--accent-solid)] underline cursor-pointer">
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
                    exit={{ opacity: 0, scale: 0.92, y: -10, transition: { duration: 0.3 } }}
                    className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      t.status === 'completed'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                        : 'bg-white/5 border-white/10 hover:border-[var(--accent-solid)]/40 hover:bg-white/8'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => t.id && toggleTaskDone(t.id)}
                        className="mt-0.5 text-white/40 hover:text-[var(--accent-solid)] cursor-pointer group"
                        title="Click to mark done and fade out"
                      >
                        {t.status === 'completed' ? (
                          <CheckCircle2 size={18} className="text-emerald-400" />
                        ) : (
                          <div className="w-4 h-4 rounded border border-white/30 group-hover:border-[var(--accent-solid)] flex items-center justify-center transition-colors">
                            <Check size={12} className="opacity-0 group-hover:opacity-100 text-[var(--accent-solid)]" />
                          </div>
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold truncate ${t.status === 'completed' ? 'line-through text-white/40' : 'text-white'}`}>
                          {t.title}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">{t.subject} &middot; Due {t.due}</p>
                      </div>
                    </div>
                    <PriorityBadge priority={t.priority || 'medium'} />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </GlassCard>

        {/* INSTANT DASHBOARD SCRATCHPAD & QUICK TODO */}
        <GlassCard delay={0.3}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <StickyNote size={18} className="text-[var(--accent-solid)]" />
              <h2 className="font-display font-semibold text-lg text-[var(--text-primary)]">Dashboard Scratchpad</h2>
            </div>
            <button type="button" onClick={() => setQuickNoteOpen(true)} className="text-[11px] text-[var(--accent-solid)] font-semibold hover:underline cursor-pointer">
              + New Note
            </button>
          </div>

          {/* ADD SCRATCHPAD NOTE FORM */}
          <form onSubmit={saveQuickNoteModal} className="flex items-center gap-2 mb-3">
            <input
              type="text"
              placeholder="Drop a quick thought or reminder..."
              value={newNoteInput}
              onChange={(e) => setNewNoteInput(e.target.value)}
              className="flex-1 bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
            />
            <button type="submit" className="univo-gradient-bg text-black px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer">
              Add
            </button>
          </form>

          {/* NOTES LIST */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {notesList.length === 0 ? (
              <p className="text-xs text-center py-4 text-[var(--text-subtle)] italic">No quick notes added. Type a quick reminder above!</p>
            ) : (
              notesList.map((n) => (
                <div key={n.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--accent-muted)] border border-[var(--accent-solid)]/25 text-xs transition-all">
                  <span className="font-medium text-[var(--text-primary)]">{n.text}</span>
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

      {/* ADD SCHEDULE MODAL */}
      {scheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setScheduleOpen(false)}>
          <form className="glass-panel w-full max-w-md rounded-2xl p-6 relative space-y-4" onSubmit={saveSchedule}>
            <button type="button" className="absolute top-4 right-4 text-white/40 hover:text-white cursor-pointer" onClick={() => setScheduleOpen(false)} aria-label="Close">
              <X size={18} />
            </button>
            <p className="settingsEyebrow">TIMETABLE</p>
            <h2 className="text-xl font-bold font-display">Add a Class</h2>

            <div className="space-y-3 text-xs">
              <label className="block font-semibold text-white/70">Time</label>
              <input
                type="time"
                value={scheduleForm.time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-solid)]"
              />

              <label className="block font-semibold text-white/70">Subject Name</label>
              <input
                type="text"
                placeholder="e.g. Operating Systems, Data Structures..."
                value={scheduleForm.subject}
                onChange={(e) => setScheduleForm({ ...scheduleForm, subject: e.target.value })}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-solid)]"
              />

              <label className="block font-semibold text-white/70">Room / Lab</label>
              <input
                type="text"
                placeholder="e.g. Lab 204, LH-3"
                value={scheduleForm.room}
                onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-solid)]"
              />
            </div>

            <button type="submit" className="w-full univo-gradient-bg text-black font-semibold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2">
              <Plus size={15} /> Add to Schedule
            </button>
          </form>
        </div>
      )}

      {/* ADD TASK MODAL */}
      {taskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setTaskOpen(false)}>
          <form className="glass-panel w-full max-w-md rounded-2xl p-6 relative space-y-4" onSubmit={saveTask}>
            <button type="button" className="absolute top-4 right-4 text-white/40 hover:text-white cursor-pointer" onClick={() => setTaskOpen(false)} aria-label="Close">
              <X size={18} />
            </button>
            <p className="settingsEyebrow">TASKS TO COMPLETE</p>
            <h2 className="text-xl font-bold font-display">Add Task</h2>

            <div className="space-y-3 text-xs">
              <label className="block font-semibold text-white/70">Task Title</label>
              <input
                type="text"
                placeholder="e.g. Finish Data Structures Lab 3, Submit Assignment..."
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-solid)]"
              />

              <label className="block font-semibold text-white/70">Category / Subject</label>
              <input
                type="text"
                placeholder="e.g. Database Management, Personal, Exam Prep"
                value={taskForm.subject}
                onChange={(e) => setTaskForm({ ...taskForm, subject: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-solid)]"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-white/70 mb-1">Due Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Tomorrow, Friday 5 PM"
                    value={taskForm.due}
                    onChange={(e) => setTaskForm({ ...taskForm, due: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-solid)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/70 mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full bg-[var(--surface-modal)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)] cursor-pointer"
                  >
                    <option value="low" className="bg-[var(--surface-modal)] text-[var(--text-primary)]">Low</option>
                    <option value="medium" className="bg-[var(--surface-modal)] text-[var(--text-primary)]">Medium</option>
                    <option value="high" className="bg-[var(--surface-modal)] text-[var(--text-primary)]">High</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full univo-gradient-bg text-black font-semibold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2">
              <Plus size={15} /> Save Task
            </button>
          </form>
        </div>
      )}

      {/* QUICK NOTE MODAL */}
      {quickNoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setQuickNoteOpen(false)}>
          <form className="glass-panel w-full max-w-md rounded-2xl p-6 relative space-y-4" onSubmit={saveQuickNoteModal}>
            <button type="button" className="absolute top-4 right-4 text-white/40 hover:text-white cursor-pointer" onClick={() => setQuickNoteOpen(false)} aria-label="Close">
              <X size={18} />
            </button>
            <p className="settingsEyebrow">QUICK NOTE</p>
            <h2 className="text-xl font-bold font-display">Add Scratchpad Note</h2>

            <div className="space-y-3 text-xs">
              <label className="block font-semibold text-white/70">Note / Thought</label>
              <textarea
                autoFocus
                required
                rows={4}
                placeholder="Type your quick study note, reminder, or snippet..."
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--accent-solid)] resize-none"
              />
            </div>

            <button type="submit" className="w-full univo-gradient-bg text-black font-semibold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2">
              <PenTool size={15} /> Save to Scratchpad
            </button>
          </form>
        </div>
      )}

      {/* ATTENDANCE SUBJECT MODAL */}
      {attendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setAttendanceModalOpen(false)}>
          <form className="glass-panel w-full max-w-md rounded-2xl p-6 relative space-y-4" onSubmit={saveNewSubject}>
            <button type="button" className="absolute top-4 right-4 text-white/40 hover:text-white cursor-pointer" onClick={() => setAttendanceModalOpen(false)} aria-label="Close">
              <X size={18} />
            </button>
            <p className="settingsEyebrow">ATTENDANCE TRACKER</p>
            <h2 className="text-xl font-bold font-display">Track New Subject</h2>

            <div className="space-y-3 text-xs">
              <label className="block font-semibold text-white/70">Subject Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Artificial Intelligence, Web Dev..."
                value={newSubjectForm.subject}
                onChange={(e) => setNewSubjectForm({ ...newSubjectForm, subject: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-solid)]"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-white/70 mb-1">Attended Classes</label>
                  <input
                    type="number"
                    min="0"
                    value={newSubjectForm.attended}
                    onChange={(e) => setNewSubjectForm({ ...newSubjectForm, attended: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-solid)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/70 mb-1">Total Classes</label>
                  <input
                    type="number"
                    min="1"
                    value={newSubjectForm.total}
                    onChange={(e) => setNewSubjectForm({ ...newSubjectForm, total: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-solid)]"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full univo-gradient-bg text-black font-semibold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2">
              <Percent size={15} /> Add Subject Tracker
            </button>
          </form>
        </div>
      )}

      {/* TARGET GOAL / EXAM COUNTDOWN MODAL */}
      {goalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setGoalModalOpen(false)}>
          <form className="glass-panel w-full max-w-md rounded-2xl p-6 relative space-y-4" onSubmit={saveGoal}>
            <button type="button" className="absolute top-4 right-4 text-white/40 hover:text-white cursor-pointer" onClick={() => setGoalModalOpen(false)} aria-label="Close">
              <X size={18} />
            </button>
            <p className="settingsEyebrow">TARGET MILESTONE</p>
            <h2 className="text-xl font-bold font-display">Target Goal / Exam Countdown</h2>

            <div className="space-y-3 text-xs">
              <label className="block font-semibold text-white/70">Goal / Exam Name</label>
              <input
                type="text"
                required
                placeholder="e.g. DBMS Midterm Exam, Major Project Presentation..."
                value={goalForm.title}
                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-solid)]"
              />

              <label className="block font-semibold text-white/70">Target Date</label>
              <input
                type="date"
                required
                value={goalForm.date}
                onChange={(e) => setGoalForm({ ...goalForm, date: e.target.value })}
                className="w-full bg-[var(--surface-modal)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)] cursor-pointer"
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button type="submit" className="flex-1 univo-gradient-bg text-black font-semibold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                <Target size={15} /> Set Target Goal
              </button>
              {targetGoal && (
                <button type="button" onClick={clearGoal} className="px-3 py-2.5 rounded-xl bg-red-500/20 text-red-300 text-xs font-semibold cursor-pointer">
                  Remove
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* INTERACTIVE POMODORO FOCUS MODAL */}
      {focusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" onMouseDown={(e) => e.target === e.currentTarget && setFocusModalOpen(false)}>
          <div className="glass-panel w-full max-w-sm rounded-3xl p-6 text-center relative space-y-6">
            <button type="button" className="absolute top-4 right-4 text-white/40 hover:text-white cursor-pointer" onClick={() => setFocusModalOpen(false)} aria-label="Close">
              <X size={18} />
            </button>

            <div>
              <p className="settingsEyebrow flex items-center justify-center gap-1">
                <Zap size={13} className="text-amber-400" /> FOCUS POMODORO
              </p>
              <h2 className="text-2xl font-bold font-display mt-1">Study Sprint</h2>
              <p className="text-xs text-white/40 mt-1">Eliminate distractions for 25 minutes.</p>
            </div>

            <div className="py-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
              <p className="font-mono text-5xl font-bold text-[var(--accent-solid)] tracking-wider">
                {formatTimer(timerSeconds)}
              </p>
              <p className="text-[11px] text-white/40 mt-2">
                {timerActive ? '🔥 In the zone... Keep pushing!' : 'Ready to lock in?'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setTimerActive(!timerActive)}
                className="flex-1 univo-gradient-bg text-black py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-all"
              >
                {timerActive ? <Pause size={16} /> : <Play size={16} />}
                {timerActive ? 'Pause' : 'Start Focus'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTimerActive(false)
                  setTimerSeconds(25 * 60)
                }}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white/70 cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <p className="text-[11px] text-white/35">
              Completed today: <span className="font-bold text-white/70">{completedSessions} sessions</span>
            </p>
          </div>
        </div>
      )}
    </PageTransition>
  )
}
