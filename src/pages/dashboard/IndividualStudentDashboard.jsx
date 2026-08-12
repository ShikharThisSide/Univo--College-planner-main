import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Coffee, Clock, ArrowRight, Zap, BookOpen, MessageSquare, Plus, X } from 'lucide-react'
import confetti from 'canvas-confetti'
import PageTransition from '../../components/ui/PageTransition'
import GlassCard from '../../components/ui/GlassCard'
import AttendanceRing from '../../components/ui/AttendanceRing'
import AnimatedProgress from '../../components/ui/AnimatedProgress'
import { SkeletonDashboard } from '../../components/ui/Skeleton'
import { individualStudentData } from '../../lib/mockData'
import { useAuth } from '../../context/AuthContext'

const DASHBOARD_LAYOUT_VERSION = 'bunk-after-details-v1'
const DEFAULT_WIDGET_ORDER = ['schedule', 'details', 'bunk']

function PriorityBadge({ priority }) {
  const colors = { high: 'text-red-400 bg-red-400/10', medium: 'text-amber-400 bg-amber-400/10', low: 'text-emerald-400 bg-emerald-400/10' }
  return <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${colors[priority]}`}>{priority}</span>
}

export default function IndividualStudentDashboard() {
  const [loading, setLoading] = useState(true)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [schedule, setSchedule] = useState(() => { try { return JSON.parse(localStorage.getItem(`univoSchedule:${localStorage.getItem('univoUser') ? JSON.parse(localStorage.getItem('univoUser')).email : 'guest'}`) || '[]') } catch { return [] } })
  const [scheduleForm, setScheduleForm] = useState({ time: '', subject: '', room: '' })
  const [widgetOrder, setWidgetOrder] = useState(() => {
    try {
      if (localStorage.getItem('univoDashboardWidgetLayoutVersion') !== DASHBOARD_LAYOUT_VERSION) {
        localStorage.setItem('univoDashboardWidgetLayoutVersion', DASHBOARD_LAYOUT_VERSION)
        localStorage.setItem('univoDashboardWidgetOrder', JSON.stringify(DEFAULT_WIDGET_ORDER))
        return DEFAULT_WIDGET_ORDER
      }
      const saved = JSON.parse(localStorage.getItem('univoDashboardWidgetOrder') || 'null')
      return Array.isArray(saved) && saved.length === 3 ? saved : DEFAULT_WIDGET_ORDER
    } catch { return DEFAULT_WIDGET_ORDER }
  })
  const [draggingWidget, setDraggingWidget] = useState(null)
  const { user } = useAuth()
  const freshAccount = Boolean(user?.email && localStorage.getItem(`univoFreshAccount:${user.email}`) === 'true')
  const data = {
    ...individualStudentData,
    name: user?.name?.split(' ')[0] || individualStudentData.name,
    ...(freshAccount ? { bunkableClasses: 0, attendance: [], todaySchedule: schedule, assignments: [], notes: [], forumActivity: [], streak: 0, completionRate: 0 } : {}),
  }

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    localStorage.setItem('univoDashboardWidgetOrder', JSON.stringify(widgetOrder))
  }, [widgetOrder])

  const saveSchedule = (event) => {
    event.preventDefault()
    if (!scheduleForm.time || !scheduleForm.subject.trim()) return
    const next = [...schedule, { ...scheduleForm, subject: scheduleForm.subject.trim(), room: scheduleForm.room.trim() || 'Room not set', status: 'upcoming' }].sort((a, b) => a.time.localeCompare(b.time))
    setSchedule(next)
    localStorage.setItem(`univoSchedule:${user.email}`, JSON.stringify(next))
    setScheduleForm({ time: '', subject: '', room: '' })
    setScheduleOpen(false)
  }

  const moveWidget = (targetWidget) => {
    if (!draggingWidget || draggingWidget === targetWidget) return
    setWidgetOrder((current) => {
      const next = [...current]
      const from = next.indexOf(draggingWidget)
      const to = next.indexOf(targetWidget)
      next.splice(from, 1)
      next.splice(to, 0, draggingWidget)
      return next
    })
    setDraggingWidget(null)
  }

  const widgetProps = (id) => ({
    className: `dashboard-widget dashboard-widget-${id} ${draggingWidget === id ? 'is-dragging' : ''}`,
    style: { order: widgetOrder.indexOf(id) },
    draggable: true,
    onDragStart: () => setDraggingWidget(id),
    onDragOver: (event) => event.preventDefault(),
    onDrop: () => moveWidget(id),
    onDragEnd: () => setDraggingWidget(null),
  })

  if (loading) return <SkeletonDashboard />

  return (
    <PageTransition>
      {/* Hero greeting */}
      <div className="mb-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-white/45 mb-1"
        >
          {data.greeting}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="dashboard-user-name font-display text-4xl md:text-5xl font-bold tracking-tight"
        >
          {data.name} <span className="inline-block animate-[wave_2s_ease-in-out_infinite]">👋</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-white/45 mt-2 text-sm"
        >
          You've got {data.assignments.filter((a) => a.status === 'pending').length} assignments pending · {data.streak}-day streak 🔥
        </motion.p>
      </div>

      <div className="dashboard-widget-stack" aria-label="Customisable dashboard widgets">
      {/* Bunk counter — front and center */}
      <div {...widgetProps('bunk')}><GlassCard className="mb-6 !p-0 overflow-hidden" delay={0.1}>
        <div className="flex flex-col md:flex-row items-stretch">
          <div className="flex-1 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-3">
              <Coffee size={18} className="text-[var(--accent-solid)]" />
              <span className="text-xs uppercase tracking-wider text-white/40 font-semibold">Bunk budget</span>
            </div>
            <p className="font-display text-5xl md:text-6xl font-bold univo-gradient-text">{data.bunkableClasses}</p>
            <p className="text-white/50 text-sm mt-2 max-w-xs">classes you can still skip without dropping below 75% attendance. Spend wisely 😏</p>
          </div>
          <div className="flex items-center gap-6 p-6 md:p-8 border-t md:border-t-0 md:border-l border-white/8 bg-white/2">
            <div className="text-center">
              <Flame size={24} className="mx-auto text-orange-400 mb-1" />
              <p className="font-display text-2xl font-bold">{data.streak}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Day streak</p>
            </div>
            <div className="text-center">
              <Zap size={24} className="mx-auto text-[var(--accent-solid)] mb-1" />
              <p className="font-display text-2xl font-bold">{data.completionRate}%</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Completion</p>
            </div>
          </div>
        </div>
      </GlassCard></div>

      <div {...widgetProps('schedule')}><div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Today's schedule */}
        <GlassCard className="lg:col-span-2" delay={0.15}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[var(--accent-solid)]" />
              <h2 className="font-display font-semibold">Today's schedule</h2>
            </div>
            <div className="flex items-center gap-3"><span className="text-xs text-white/35">{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</span><button type="button" onClick={() => setScheduleOpen(true)} className="inline-flex items-center gap-1 rounded-lg univo-gradient-bg px-2.5 py-1.5 text-[11px] font-bold text-[#182027]"><Plus size={13} /> Add schedule</button></div>
          </div>
          <div className="space-y-3">
            {!data.todaySchedule.length && <div className="dashboardEmptyState"><Clock size={22} /><strong>No schedule added yet</strong><span>Add your first class to see today’s plan here.</span><button type="button" onClick={() => setScheduleOpen(true)}>Add your first class <ArrowRight size={13} /></button></div>}
            {data.todaySchedule.map((slot, i) => (
              <motion.div
                key={slot.time}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                  slot.status === 'current'
                    ? 'border-[var(--accent-solid)]/30 bg-[var(--accent-muted)]'
                    : 'border-white/6 hover:border-white/10 hover:bg-white/3'
                }`}
              >
                <span className="text-sm font-mono text-white/45 w-12 shrink-0">{slot.time}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{slot.subject}</p>
                  <p className="text-xs text-white/40">{slot.room}</p>
                </div>
                {slot.status === 'current' && (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full univo-gradient-bg font-semibold shrink-0">Now</span>
                )}
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Attendance rings */}
        <GlassCard delay={0.2}>
          <h2 className="font-display font-semibold mb-5">Attendance</h2>
          <div className="grid grid-cols-2 gap-4">{!data.attendance.length && <div className="dashboardEmptyState col-span-2"><strong>No attendance data yet</strong><span>Attendance will appear after you record your first class.</span></div>}
            {data.attendance.map((a, i) => (
              <AttendanceRing key={a.subject} percent={a.percent} label={a.subject} delay={i} size={76} />
            ))}
          </div>
        </GlassCard>
      </div></div>

      <div {...widgetProps('details')}><div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignments */}
        <GlassCard delay={0.25}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold">Assignments</h2>
            <button type="button" className="text-xs text-[var(--accent-solid)] flex items-center gap-1 hover:opacity-80">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">{!data.assignments.length && <div className="dashboardEmptyState"><strong>No assignments yet</strong><span>Your assignment list will appear here once you add work.</span></div>}
            {data.assignments.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="p-3.5 rounded-xl border border-white/6 hover:border-white/12 hover:bg-white/3 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-medium group-hover:text-white transition-colors">{a.title}</p>
                  <PriorityBadge priority={a.priority} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">{a.subject}</span>
                  <span className="text-xs text-white/35">Due {a.due}</span>
                </div>
                {a.status === 'in_progress' && (
                  <AnimatedProgress value={60} className="mt-2.5" height={4} delay={i} />
                )}
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Notes + Forum */}
        <div className="space-y-6">
          <GlassCard delay={0.3}>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} className="text-[var(--accent-solid)]" />
              <h2 className="font-display font-semibold">Recent notes</h2>
            </div>
            {!data.notes.length && <div className="dashboardEmptyState"><strong>No notes yet</strong><span>Upload or create notes from Notes Hub.</span></div>}{data.notes.map((note) => (
              <div key={note.id} className="flex items-center justify-between py-3 border-b border-white/6 last:border-0 cursor-pointer hover:bg-white/3 -mx-2 px-2 rounded-lg transition-colors">
                <div>
                  <p className="text-sm font-medium">{note.title}</p>
                  <p className="text-xs text-white/40">{note.author} · {note.updated}</p>
                </div>
                <div className="flex gap-1">
                  {note.tags.map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/6 text-white/45">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </GlassCard>

          <GlassCard delay={0.35}>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={16} className="text-[var(--accent-solid)]" />
              <h2 className="font-display font-semibold">Forum activity</h2>
            </div>
            {!data.forumActivity.length && <div className="dashboardEmptyState"><strong>No forum activity yet</strong><span>Join the conversation when you’re ready.</span></div>}{data.forumActivity.map((thread) => (
              <div key={thread.id} className="flex items-center justify-between py-3 border-b border-white/6 last:border-0 cursor-pointer hover:bg-white/3 -mx-2 px-2 rounded-lg transition-colors">
                <p className="text-sm">{thread.title}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-white/35">{thread.replies} replies</span>
                  {thread.unread > 0 && (
                    <span className="w-5 h-5 rounded-full univo-gradient-bg text-[10px] font-bold flex items-center justify-center badge-pulse">
                      {thread.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </GlassCard>
        </div>
      </div></div>
      </div>

      {/* Success moment demo button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center"
      >
        <button
          type="button"
          onClick={() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#8b5cf6', '#f97316', '#14b8a6'] })}
          className="text-xs text-white/30 hover:text-white/50 transition-colors underline underline-offset-4"
        >
          Simulate assignment submitted on time 🎉
        </button>
      </motion.div>
      {scheduleOpen && <div className="scheduleOverlay" role="dialog" aria-modal="true"><form className="scheduleModal" onSubmit={saveSchedule}><button type="button" className="scheduleClose" onClick={() => setScheduleOpen(false)} aria-label="Close"><X size={18} /></button><p className="settingsEyebrow">TODAY’S SCHEDULE</p><h2>Add a class</h2><p>Build your personal Univo timetable.</p><label>Time<input type="time" value={scheduleForm.time} onChange={(event) => setScheduleForm({ ...scheduleForm, time: event.target.value })} required /></label><label>Subject<input placeholder="e.g. Data Structures" value={scheduleForm.subject} onChange={(event) => setScheduleForm({ ...scheduleForm, subject: event.target.value })} required /></label><label>Room<input placeholder="e.g. Lab 204" value={scheduleForm.room} onChange={(event) => setScheduleForm({ ...scheduleForm, room: event.target.value })} /></label><button type="submit" className="scheduleSubmit">Add to schedule</button></form></div>}
    </PageTransition>
  )
}
