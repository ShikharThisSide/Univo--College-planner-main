import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Coffee, Clock, ArrowRight, Zap, BookOpen, MessageSquare } from 'lucide-react'
import confetti from 'canvas-confetti'
import PageTransition from '../../components/ui/PageTransition'
import GlassCard from '../../components/ui/GlassCard'
import AttendanceRing from '../../components/ui/AttendanceRing'
import AnimatedProgress from '../../components/ui/AnimatedProgress'
import { SkeletonDashboard } from '../../components/ui/Skeleton'
import { individualStudentData } from '../../lib/mockData'
import { useAuth } from '../../context/AuthContext'

function PriorityBadge({ priority }) {
  const colors = { high: 'text-red-400 bg-red-400/10', medium: 'text-amber-400 bg-amber-400/10', low: 'text-emerald-400 bg-emerald-400/10' }
  return <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${colors[priority]}`}>{priority}</span>
}

export default function IndividualStudentDashboard() {
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const data = {
    ...individualStudentData,
    name: user?.name?.split(' ')[0] || individualStudentData.name,
  }

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(timer)
  }, [])

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
          className="font-display text-4xl md:text-5xl font-bold tracking-tight"
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

      {/* Bunk counter — front and center */}
      <GlassCard className="mb-6 !p-0 overflow-hidden" delay={0.1}>
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
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Today's schedule */}
        <GlassCard className="lg:col-span-2" delay={0.15}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[var(--accent-solid)]" />
              <h2 className="font-display font-semibold">Today's schedule</h2>
            </div>
            <span className="text-xs text-white/35">{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="space-y-3">
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
          <div className="grid grid-cols-2 gap-4">
            {data.attendance.map((a, i) => (
              <AttendanceRing key={a.subject} percent={a.percent} label={a.subject} delay={i} size={76} />
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignments */}
        <GlassCard delay={0.25}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold">Assignments</h2>
            <button type="button" className="text-xs text-[var(--accent-solid)] flex items-center gap-1 hover:opacity-80">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
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
            {data.notes.map((note) => (
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
            {data.forumActivity.map((thread) => (
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
    </PageTransition>
  )
}
