import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  X,
  MapPin,
  User,
  BookOpen,
  Printer,
  Sparkles
} from 'lucide-react'
import PageTransition from '../../components/ui/PageTransition'
import GlassCard from '../../components/ui/GlassCard'
import { useAuth } from '../../context/AuthContext'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const EMPTY_TIMETABLE = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: []
}

export default function TimetablePage() {
  const { user } = useAuth()
  const storageKey = user?.email || 'guest'

  // Current Day of Week Index (Default to current day if Mon-Sat, else Monday)
  const currentDayName = useMemo(() => {
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    return DAYS.includes(day) ? day : 'Monday'
  }, [])

  const [selectedDay, setSelectedDay] = useState(currentDayName)

  // Timetable State initialized from localStorage — Default is EMPTY (0 classes)
  const [timetable, setTimetable] = useState(() => {
    try {
      const saved = localStorage.getItem(`univoFullTimetable:${storageKey}`)
      if (saved !== null) {
        const parsed = JSON.parse(saved)
        const isLegacyDemo = parsed?.Monday?.length === 3 && parsed?.Monday[0]?.subject === 'Data Structures & Algorithms'
        if (!isLegacyDemo && typeof parsed === 'object') return parsed
      }
      return EMPTY_TIMETABLE
    } catch { return EMPTY_TIMETABLE }
  })

  // Modal & Form State
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [form, setForm] = useState({
    subject: '',
    time: '09:00 AM - 10:30 AM',
    room: '',
    professor: '',
    type: 'Lecture',
    day: selectedDay
  })

  // Sanitize legacy demo timetable on mount & listen to updates
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(`univoFullTimetable:${storageKey}`)
        if (saved !== null) {
          const parsed = JSON.parse(saved)
          const isLegacyDemo = parsed?.Monday?.length === 3 && parsed?.Monday[0]?.subject === 'Data Structures & Algorithms'
          if (isLegacyDemo) {
            localStorage.setItem(`univoFullTimetable:${storageKey}`, JSON.stringify(EMPTY_TIMETABLE))
            setTimetable(EMPTY_TIMETABLE)
          } else if (typeof parsed === 'object') {
            setTimetable(parsed)
          }
        }
      } catch {}
    }

    handleSync()
    window.addEventListener('univo-timetable-updated', handleSync)
    return () => window.removeEventListener('univo-timetable-updated', handleSync)
  }, [storageKey])

  // Helper to persist & sync schedule with dashboard
  const updateTimetableState = (nextTable) => {
    setTimetable(nextTable)
    localStorage.setItem(`univoFullTimetable:${storageKey}`, JSON.stringify(nextTable))

    // Sync today's schedule for dashboard widget
    const todayClasses = nextTable[currentDayName] || []
    const dashboardScheduleFormat = todayClasses.map((c) => ({
      id: c.id,
      title: c.subject,
      time: c.time.split('-')[0]?.trim() || c.time,
      location: c.room,
      type: c.type
    }))
    localStorage.setItem(`univoSchedule:${storageKey}`, JSON.stringify(dashboardScheduleFormat))

    window.dispatchEvent(new Event('univo-timetable-updated'))
    window.dispatchEvent(new Event('univo-schedule-updated'))
  }

  // Handlers
  const handleAddClass = (e) => {
    e.preventDefault()
    if (!form.subject.trim() || !form.time.trim()) return

    const newClass = {
      id: `tt-${Date.now()}`,
      subject: form.subject.trim(),
      time: form.time.trim(),
      room: form.room.trim() || 'Room 101',
      professor: form.professor.trim() || 'Faculty',
      type: form.type || 'Lecture'
    }

    const targetDay = form.day || selectedDay
    const dayClasses = timetable[targetDay] || []
    const nextTable = {
      ...timetable,
      [targetDay]: [...dayClasses, newClass]
    }

    updateTimetableState(nextTable)
    setForm({ subject: '', time: '09:00 AM - 10:30 AM', room: '', professor: '', type: 'Lecture', day: selectedDay })
    setAddModalOpen(false)
  }

  const handleDeleteClass = (day, id) => {
    const dayClasses = timetable[day] || []
    const nextTable = {
      ...timetable,
      [day]: dayClasses.filter((c) => c.id !== id)
    }
    updateTimetableState(nextTable)
  }

  const handleClearAll = () => {
    updateTimetableState(EMPTY_TIMETABLE)
  }

  const daySchedule = timetable[selectedDay] || []

  return (
    <PageTransition>
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="settingsEyebrow text-[var(--accent-solid)] font-bold">COLLEGE ACADEMICS</p>
          <h1 className="font-display text-4xl font-bold tracking-tight mt-1 text-[var(--accent-solid)]">
            College Timetable
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Weekly class schedule, lecture halls, lab sessions, and professor details.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {daySchedule.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3.5 py-2.5 rounded-xl bg-[var(--surface-control)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all text-[var(--text-primary)]"
            >
              Clear Schedule
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-xl bg-[var(--surface-control)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all text-[var(--text-primary)]"
          >
            <Printer size={15} /> Print / Export
          </button>

          <button
            type="button"
            onClick={() => {
              setForm({ subject: '', time: '09:00 AM - 10:30 AM', room: '', professor: '', type: 'Lecture', day: selectedDay })
              setAddModalOpen(true)
            }}
            className="px-4 py-2.5 rounded-xl univo-gradient-bg text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
          >
            <Plus size={16} /> Add Class Slot
          </button>
        </div>
      </div>

      {/* DAY SELECTOR TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {DAYS.map((day) => {
          const isSelected = selectedDay === day
          const isToday = day === currentDayName
          const count = (timetable[day] || []).length

          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                isSelected
                  ? 'relative z-10 bg-[var(--accent-muted)] border-[var(--accent-solid)]/40 text-[var(--accent-solid)] font-extrabold shadow-sm'
                  : 'bg-[var(--surface-control)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-[var(--accent-solid)]/20 text-[var(--accent-solid)]">
                  Today
                </span>
              )}
              <span className={`font-mono text-[10px] ${isSelected ? 'text-[var(--accent-solid)] font-bold' : 'text-[var(--text-subtle)]'}`}>
                ({count})
              </span>
            </button>
          )
        })}
      </div>

      {/* SCHEDULE CARDS DISPLAY */}
      <GlassCard delay={0.15}>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[var(--accent-solid)]" />
            <h2 className="font-display font-semibold text-lg text-[var(--text-primary)]">
              {selectedDay}'s Classes & Lectures
            </h2>
          </div>
          <span className="text-xs text-[var(--text-subtle)] font-mono">{daySchedule.length} session(s) scheduled</span>
        </div>

        <div className="space-y-3 min-h-[220px]">
          <AnimatePresence mode="popLayout">
            {daySchedule.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-10 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl space-y-2"
              >
                <Clock size={32} className="mx-auto text-[var(--text-subtle)]" />
                <p className="text-sm font-semibold text-[var(--text-secondary)]">No classes scheduled for {selectedDay}</p>
                <p className="text-xs text-[var(--text-subtle)]">Click "+ Add Class Slot" to add your lecture or lab schedule for {selectedDay}.</p>
                <button
                  type="button"
                  onClick={() => {
                    setForm({ subject: '', time: '09:00 AM - 10:30 AM', room: '', professor: '', type: 'Lecture', day: selectedDay })
                    setAddModalOpen(true)
                  }}
                  className="px-4 py-2 rounded-xl univo-gradient-bg text-black text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer mt-2"
                >
                  <Plus size={14} /> Add Class Slot
                </button>
              </motion.div>
            ) : (
              daySchedule.map((cls, idx) => (
                <motion.div
                  key={cls.id || idx}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all text-[var(--text-primary)]"
                >
                  <div className="flex items-start md:items-center gap-4 min-w-0 flex-1">
                    <div className="p-3 rounded-xl bg-[var(--accent-solid)]/15 border border-[var(--accent-solid)]/30 text-[var(--accent-solid)] shrink-0 font-mono text-xs font-bold flex items-center gap-1.5">
                      <Clock size={15} />
                      <span>{cls.time}</span>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-base text-[var(--text-primary)] truncate">{cls.subject}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          cls.type === 'Lab'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : cls.type === 'Seminar'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {cls.type || 'Lecture'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-[var(--accent-solid)]" /> {cls.room}
                        </span>
                        <span>&middot;</span>
                        <span className="flex items-center gap-1">
                          <User size={13} className="text-[var(--text-secondary)]" /> {cls.professor}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteClass(selectedDay, cls.id)}
                    className="text-[var(--text-subtle)] hover:text-red-400 p-1 cursor-pointer transition-colors self-end md:self-center"
                    aria-label="Delete class"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </GlassCard>

      {/* ADD CLASS MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setAddModalOpen(false)}>
          <form className="glass-panel w-full max-w-md rounded-2xl p-6 relative space-y-4 bg-[var(--surface-modal)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-2xl" onSubmit={handleAddClass}>
            <button type="button" className="absolute top-4 right-4 text-[var(--text-subtle)] hover:text-[var(--text-primary)] cursor-pointer" onClick={() => setAddModalOpen(false)} aria-label="Close">
              <X size={18} />
            </button>
            <p className="settingsEyebrow text-[var(--accent-solid)] font-bold">TIMETABLE EDITOR</p>
            <h2 className="text-xl font-bold font-display text-[var(--text-primary)]">Add Class Slot</h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Day of Week</label>
                <select
                  value={form.day}
                  onChange={(e) => setForm({ ...form, day: e.target.value })}
                  className="w-full bg-[var(--surface-modal)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)] cursor-pointer font-bold"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d} className="bg-[var(--surface-modal)] text-[var(--text-primary)]">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures & Algorithms, Operating Systems..."
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Time Slot</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09:00 AM - 10:30 AM"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Session Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-[var(--surface-modal)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)] cursor-pointer"
                  >
                    <option value="Lecture" className="bg-[var(--surface-modal)] text-[var(--text-primary)]">Lecture</option>
                    <option value="Lab" className="bg-[var(--surface-modal)] text-[var(--text-primary)]">Lab Session</option>
                    <option value="Seminar" className="bg-[var(--surface-modal)] text-[var(--text-primary)]">Seminar / Talk</option>
                    <option value="Project" className="bg-[var(--surface-modal)] text-[var(--text-primary)]">Project Work</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Hall / Room</label>
                  <input
                    type="text"
                    placeholder="e.g. Hall 102, CS Lab 3..."
                    value={form.room}
                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                    className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Professor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. K. Verma"
                    value={form.professor}
                    onChange={(e) => setForm({ ...form, professor: e.target.value })}
                    className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full univo-gradient-bg text-black font-semibold rounded-xl py-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2">
              <Plus size={16} /> Save Class Session
            </button>
          </form>
        </div>
      )}
    </PageTransition>
  )
}
