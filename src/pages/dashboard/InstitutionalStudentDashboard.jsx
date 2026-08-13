import { Calendar, ClipboardList, Building2, Coffee, Sparkles } from 'lucide-react'
import PageTransition from '../../components/ui/PageTransition'
import GlassCard from '../../components/ui/GlassCard'
import AttendanceRing from '../../components/ui/AttendanceRing'
import { institutionalStudentData } from '../../lib/mockData'
import { getTimeGreeting } from '../../lib/timeGreeting'

export default function InstitutionalStudentDashboard() {
  const data = institutionalStudentData

  return (
    <PageTransition>
      <div className="mb-8">
        <p className="text-xs font-extrabold text-[var(--accent-solid)] uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles size={14} /> {getTimeGreeting()}
        </p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight mt-1 text-[var(--text-primary)]">
          {data.university}
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1.5 flex items-center gap-2 font-medium">
          <Building2 size={15} className="text-[var(--accent-solid)]" /> {data.department} &middot; Semester {data.semester}
        </p>
      </div>

      <GlassCard className="mb-6" delay={0.05}>
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Coffee size={16} className="text-[var(--accent-solid)]" />
              <span className="text-xs uppercase tracking-wider text-[var(--text-subtle)] font-bold">Bunk budget</span>
            </div>
            <p className="font-display text-4xl font-extrabold univo-gradient-text">{data.bunkableClasses}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">Teacher-tracked attendance allowance</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="text-center p-3.5 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)] flex-1 sm:w-28">
              <p className="font-display text-2xl font-bold text-[var(--text-primary)]">{data.pendingAssignments}</p>
              <p className="text-[10px] text-[var(--text-subtle)] uppercase font-bold tracking-wider">Pending</p>
            </div>
            <div className="text-center p-3.5 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)] flex-1 sm:w-28">
              <p className="font-display text-2xl font-bold text-[var(--text-primary)]">{data.gradedAssignments}</p>
              <p className="text-[10px] text-[var(--text-subtle)] uppercase font-bold tracking-wider">Graded</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard delay={0.1}>
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--border-subtle)]">
            <h2 className="font-display font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
              <Calendar size={18} className="text-[var(--accent-solid)]" /> Today's Timetable
            </h2>
            <span className="text-xs text-[var(--text-subtle)] font-mono">Pre-populated by department</span>
          </div>

          <div className="space-y-2.5">
            {data.todaySchedule.map((slot) => (
              <div key={slot.time} className="flex items-center gap-4 p-3.5 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all">
                <span className="text-xs font-mono font-bold text-[var(--accent-solid)] px-2.5 py-1 rounded-lg bg-[var(--accent-solid)]/10 shrink-0">{slot.time}</span>
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{slot.subject}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{slot.room} &middot; {slot.teacher}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.15}>
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--border-subtle)]">
            <h2 className="font-display font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
              <ClipboardList size={18} className="text-[var(--accent-solid)]" /> Attendance (Verified)
            </h2>
            <span className="text-xs text-[var(--text-subtle)] font-mono">Faculty verified</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {data.attendance.map((a, i) => (
              <AttendanceRing key={a.subject} percent={a.percent} label={a.subject} delay={i} size={72} />
            ))}
          </div>
          <p className="text-xs text-[var(--text-subtle)] mt-5 text-center font-medium">Marked by your teachers — official institutional records</p>
        </GlassCard>
      </div>
    </PageTransition>
  )
}
