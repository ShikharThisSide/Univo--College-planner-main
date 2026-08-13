import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Percent,
  Plus,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Trash2,
  X,
  Edit2,
  TrendingUp,
  Award,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react'
import PageTransition from '../../components/ui/PageTransition'
import GlassCard from '../../components/ui/GlassCard'
import AnimatedProgress from '../../components/ui/AnimatedProgress'
import { useAuth } from '../../context/AuthContext'

const INITIAL_SUBJECTS = [
  { subject: 'Data Structures & Algorithms', attended: 31, total: 50 },
  { subject: 'Operating Systems', attended: 14, total: 18 },
  { subject: 'Database Management Systems', attended: 18, total: 20 },
  { subject: 'Computer Networks', attended: 22, total: 25 }
]

export default function AttendanceTrackerPage() {
  const { user } = useAuth()
  const storageKey = user?.email || 'guest'

  const [targetPercentage, setTargetPercentage] = useState(75)

  // Real attendance state loaded from localStorage
  const [subjects, setSubjects] = useState(() => {
    try {
      const saved = localStorage.getItem(`univoAttendance:${storageKey}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      return INITIAL_SUBJECTS
    } catch {
      return INITIAL_SUBJECTS
    }
  })

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [form, setForm] = useState({ subject: '', attended: 15, total: 20 })

  // Listen to sync events from other tabs / components
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(`univoAttendance:${storageKey}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) setSubjects(parsed)
        }
      } catch {}
    }
    window.addEventListener('univo-attendance-updated', handleSync)
    return () => window.removeEventListener('univo-attendance-updated', handleSync)
  }, [storageKey])

  // Helper to persist & broadcast updates
  const updateSubjects = (newSubjects) => {
    setSubjects(newSubjects)
    localStorage.setItem(`univoAttendance:${storageKey}`, JSON.stringify(newSubjects))
    window.dispatchEvent(new Event('univo-attendance-updated'))
  }

  // Calculate Overall Attendance Metrics
  const overallMetrics = useMemo(() => {
    const totalAttended = subjects.reduce((acc, curr) => acc + (Number(curr.attended) || 0), 0)
    const totalConducted = subjects.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0)
    const overallPct = totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 100) : 0
    const subjectsAboveTarget = subjects.filter((s) => s.total > 0 && Math.round((s.attended / s.total) * 100) >= targetPercentage).length

    return {
      totalAttended,
      totalConducted,
      overallPct,
      subjectsAboveTarget,
      totalSubjects: subjects.length
    }
  }, [subjects, targetPercentage])

  // Action handlers
  const handleMarkClass = (index, deltaAttended, deltaTotal) => {
    const next = subjects.map((sub, i) => {
      if (i !== index) return sub
      const newAttended = Math.max(0, sub.attended + deltaAttended)
      const newTotal = Math.max(newAttended, sub.total + deltaTotal)
      return { ...sub, attended: newAttended, total: newTotal }
    })
    updateSubjects(next)
  }

  const handleDeleteSubject = (index) => {
    const next = subjects.filter((_, i) => i !== index)
    updateSubjects(next)
  }

  const handleAddSubject = (e) => {
    e.preventDefault()
    if (!form.subject.trim()) return
    const att = Math.max(0, parseInt(form.attended, 10) || 0)
    const tot = Math.max(att, parseInt(form.total, 10) || 0)
    const next = [...subjects, { subject: form.subject.trim(), attended: att, total: tot }]
    updateSubjects(next)
    setForm({ subject: '', attended: 15, total: 20 })
    setAddModalOpen(false)
  }

  // Calculate Bunk Advisor for a subject
  const getBunkAdvice = (attended, total, targetPct = 75) => {
    if (total === 0) return { type: 'safe', count: 0, message: 'No classes conducted yet' }
    const targetRatio = targetPct / 100
    const currentPct = (attended / total) * 100

    if (currentPct >= targetPct) {
      // How many can bunk: attended / (total + b) >= targetRatio => b <= (attended - targetRatio * total) / targetRatio
      const safeBunks = Math.floor((attended - targetRatio * total) / targetRatio)
      if (safeBunks > 0) {
        return { type: 'safe', count: safeBunks, message: `Can safely bunk ${safeBunks} more ${safeBunks === 1 ? 'class' : 'classes'}` }
      }
      return { type: 'safe', count: 0, message: 'On track! Attend next class to stay safe' }
    } else {
      // How many must attend: (attended + c) / (total + c) >= targetRatio => c >= (targetRatio * total - attended) / (1 - targetRatio)
      const requiredClasses = Math.ceil((targetRatio * total - attended) / (1 - targetRatio))
      return { type: 'critical', count: requiredClasses, message: `Need to attend ${requiredClasses} consecutive ${requiredClasses === 1 ? 'class' : 'classes'}` }
    }
  }

  return (
    <PageTransition>
      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="settingsEyebrow text-[var(--accent-solid)] font-bold">ACADEMIC DASHBOARD</p>
          <h1 className="font-display text-4xl font-bold tracking-tight mt-1 text-[var(--accent-solid)]">
            Attendance Tracker
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Real-time subject attendance logger, 75% target calculator, and smart bunk advisor.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl univo-gradient-bg text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 shrink-0"
        >
          <Plus size={16} /> Track New Subject
        </button>
      </div>

      {/* OVERALL ATTENDANCE HERO SUMMARY */}
      <GlassCard className="mb-6 !p-0 overflow-hidden" delay={0.1}>
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
                <Percent size={16} className="text-[var(--accent-solid)]" /> Overall Semester Attendance
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-display text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
                  {overallMetrics.overallPct}%
                </span>
                <span className="text-sm font-semibold text-[var(--text-muted)]">
                  ({overallMetrics.totalAttended} of {overallMetrics.totalConducted} total classes attended)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                overallMetrics.overallPct >= targetPercentage
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              }`}>
                {overallMetrics.overallPct >= targetPercentage ? (
                  <CheckCircle size={15} />
                ) : (
                  <AlertTriangle size={15} />
                )}
                {overallMetrics.overallPct >= targetPercentage
                  ? `Above ${targetPercentage}% Minimum Target`
                  : `Below ${targetPercentage}% Target Allowance`}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-[var(--text-muted)]">
              <span>Overall Progress</span>
              <span>Minimum Target &ge; {targetPercentage}%</span>
            </div>
            <AnimatedProgress value={overallMetrics.overallPct} height={10} delay={0.2} />
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[var(--border-subtle)]">
            <div className="p-3 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)]">
              <span className="text-[11px] text-[var(--text-subtle)] block">Total Subjects</span>
              <span className="font-display text-lg font-bold text-[var(--text-primary)]">{overallMetrics.totalSubjects} Subjects</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)]">
              <span className="text-[11px] text-[var(--text-subtle)] block">On Track (&ge;{targetPercentage}%)</span>
              <span className="font-display text-lg font-bold text-emerald-400">{overallMetrics.subjectsAboveTarget} Subjects</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)]">
              <span className="text-[11px] text-[var(--text-subtle)] block">Attention Needed</span>
              <span className="font-display text-lg font-bold text-amber-400">{overallMetrics.totalSubjects - overallMetrics.subjectsAboveTarget} Subjects</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)]">
              <span className="text-[11px] text-[var(--text-subtle)] block">Semester Target</span>
              <span className="font-display text-lg font-bold text-[var(--accent-solid)]">{targetPercentage}% Minimum</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* SUBJECT CARDS LIST */}
      <div className="space-y-4 mb-8">
        <h2 className="font-display text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <BookOpen size={20} className="text-[var(--accent-solid)]" /> Enrolled Subjects
        </h2>

        {subjects.length === 0 ? (
          <GlassCard className="text-center p-8 border border-dashed border-[var(--border-subtle)]">
            <Percent size={32} className="mx-auto text-[var(--text-subtle)] mb-2" />
            <p className="text-sm font-semibold text-[var(--text-secondary)]">No subjects tracked yet</p>
            <p className="text-xs text-[var(--text-subtle)] mt-1">Add your real college subjects to start tracking your attendance and safe bunks.</p>
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2 rounded-xl univo-gradient-bg text-black text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer mt-4"
            >
              <Plus size={14} /> Add First Subject
            </button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((sub, idx) => {
              const pct = sub.total > 0 ? Math.round((sub.attended / sub.total) * 100) : 0
              const advice = getBunkAdvice(sub.attended, sub.total, targetPercentage)

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <GlassCard className="h-full flex flex-col justify-between space-y-4">
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="font-display font-bold text-base text-[var(--text-primary)]">{sub.subject}</h3>
                          <span className="text-xs text-[var(--text-subtle)] font-mono">
                            {sub.attended} / {sub.total} classes attended
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono ${
                            pct >= targetPercentage
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : pct >= 65
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {pct}%
                          </span>

                          <button
                            type="button"
                            onClick={() => handleDeleteSubject(idx)}
                            className="text-[var(--text-subtle)] hover:text-red-400 p-1 cursor-pointer"
                            aria-label={`Delete ${sub.subject}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="my-3">
                        <AnimatedProgress value={pct} height={8} delay={0.1 + idx * 0.05} />
                      </div>

                      {/* Smart Bunk Advisor Pill */}
                      <div className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                        advice.type === 'safe'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                      }`}>
                        <Zap size={14} className="shrink-0" />
                        <span>{advice.message}</span>
                      </div>
                    </div>

                    {/* Quick Simulation Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                      <button
                        type="button"
                        onClick={() => handleMarkClass(idx, 1, 1)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      >
                        <Plus size={14} /> + Attend Class
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMarkClass(idx, 0, 1)}
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      >
                        + Bunk Class
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* ADD SUBJECT MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setAddModalOpen(false)}>
          <form className="glass-panel w-full max-w-md rounded-2xl p-6 relative space-y-4 bg-[var(--surface-modal)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-2xl" onSubmit={handleAddSubject}>
            <button type="button" className="absolute top-4 right-4 text-[var(--text-subtle)] hover:text-[var(--text-primary)] cursor-pointer" onClick={() => setAddModalOpen(false)} aria-label="Close">
              <X size={18} />
            </button>
            <p className="settingsEyebrow text-[var(--accent-solid)] font-bold">SUBJECT LOG</p>
            <h2 className="text-xl font-bold font-display text-[var(--text-primary)]">Track New Subject</h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems, Microprocessors, Discrete Math..."
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Attended Classes</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 15"
                    value={form.attended}
                    onChange={(e) => setForm({ ...form, attended: e.target.value })}
                    className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Total Classes Conducted</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 20"
                    value={form.total}
                    onChange={(e) => setForm({ ...form, total: e.target.value })}
                    className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full univo-gradient-bg text-black font-semibold rounded-xl py-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2">
              <Plus size={16} /> Save Subject
            </button>
          </form>
        </div>
      )}
    </PageTransition>
  )
}
