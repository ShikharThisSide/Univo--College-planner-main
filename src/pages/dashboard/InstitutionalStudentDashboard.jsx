import { Calendar, ClipboardList, Building2, Coffee } from 'lucide-react'
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
        <p className="text-sm text-white/45">{getTimeGreeting()}, {data.name}</p>
        <h1 className="font-display text-4xl font-bold tracking-tight mt-1">
          {data.university}
        </h1>
        <p className="text-white/45 text-sm mt-2 flex items-center gap-2">
          <Building2 size={14} /> {data.department} · Semester {data.semester}
        </p>
      </div>

      <GlassCard className="mb-6" delay={0.05}>
        <div className="flex items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Coffee size={16} className="text-[var(--accent-solid)]" />
              <span className="text-xs uppercase tracking-wider text-white/40">Bunk budget</span>
            </div>
            <p className="font-display text-4xl font-bold univo-gradient-text">{data.bunkableClasses}</p>
            <p className="text-xs text-white/40 mt-1">Teacher-tracked attendance</p>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4 ml-auto max-w-xs">
            <div className="text-center p-3 rounded-xl bg-white/4">
              <p className="font-display text-xl font-bold">{data.pendingAssignments}</p>
              <p className="text-[10px] text-white/40 uppercase">Pending</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/4">
              <p className="font-display text-xl font-bold">{data.gradedAssignments}</p>
              <p className="text-[10px] text-white/40 uppercase">Graded</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard delay={0.1}>
          <h2 className="font-display font-semibold mb-5 flex items-center gap-2">
            <Calendar size={16} className="text-[var(--accent-solid)]" /> Today's timetable
          </h2>
          <p className="text-xs text-white/35 mb-4">Pre-populated by your department</p>
          {data.todaySchedule.map((slot) => (
            <div key={slot.time} className="flex items-center gap-4 p-3.5 rounded-xl border border-white/6 mb-2 hover:bg-white/3 transition-colors">
              <span className="text-sm font-mono text-white/45">{slot.time}</span>
              <div>
                <p className="text-sm font-medium">{slot.subject}</p>
                <p className="text-xs text-white/40">{slot.room} · {slot.teacher}</p>
              </div>
            </div>
          ))}
        </GlassCard>

        <GlassCard delay={0.15}>
          <h2 className="font-display font-semibold mb-5 flex items-center gap-2">
            <ClipboardList size={16} className="text-[var(--accent-solid)]" /> Attendance (verified)
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {data.attendance.map((a, i) => (
              <AttendanceRing key={a.subject} percent={a.percent} label={a.subject} delay={i} size={72} />
            ))}
          </div>
          <p className="text-xs text-white/35 mt-4 text-center">Marked by your teachers — not self-reported</p>
        </GlassCard>
      </div>
    </PageTransition>
  )
}
