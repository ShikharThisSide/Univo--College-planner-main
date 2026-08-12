import { Inbox, Clock, Upload, MessageSquare, AlertTriangle } from 'lucide-react'
import PageTransition from '../../components/ui/PageTransition'
import GlassCard from '../../components/ui/GlassCard'
import { teacherData } from '../../lib/mockData'
import { getTimeGreeting } from '../../lib/timeGreeting'

export default function TeacherDashboard() {
  const data = teacherData

  return (
    <PageTransition>
      <div className="mb-8">
        <p className="text-sm text-white/45">{getTimeGreeting()}, {data.name.split(' ').slice(-1)[0]}</p>
        <h1 className="font-display text-4xl font-bold tracking-tight mt-1">
          Your teaching queue
        </h1>
        <p className="text-white/45 text-sm mt-2">{data.department} · {data.gradingQueue.length} submissions waiting</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <GlassCard delay={0.05} className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl univo-gradient-bg flex items-center justify-center">
            <Inbox size={20} />
          </div>
          <div>
            <p className="font-display text-2xl font-bold">{data.gradingQueue.length}</p>
            <p className="text-xs text-white/45">Needs grading</p>
          </div>
        </GlassCard>
        <GlassCard delay={0.1} className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/8 flex items-center justify-center">
            <MessageSquare size={20} className="text-[var(--accent-solid)]" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold">{data.openDoubts}</p>
            <p className="text-xs text-white/45">Open doubts</p>
          </div>
        </GlassCard>
        <GlassCard delay={0.15} className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/8 flex items-center justify-center">
            <Upload size={20} className="text-[var(--accent-solid)]" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold">{data.pendingUploads}</p>
            <p className="text-xs text-white/45">Pending uploads</p>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard delay={0.2}>
          <h2 className="font-display font-semibold mb-5 flex items-center gap-2">
            <Inbox size={16} className="text-[var(--accent-solid)]" /> Grading queue
          </h2>
          <div className="space-y-2">
            {data.gradingQueue.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer hover:bg-white/4 ${
                  item.urgent ? 'border-red-400/20 bg-red-400/5' : 'border-white/6'
                }`}
              >
                <div>
                  <p className="text-sm font-medium">{item.student}</p>
                  <p className="text-xs text-white/40">{item.assignment}</p>
                </div>
                <div className="flex items-center gap-2">
                  {item.urgent && <AlertTriangle size={14} className="text-red-400" />}
                  <span className="text-xs text-white/35">{item.submitted}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.25}>
          <h2 className="font-display font-semibold mb-5 flex items-center gap-2">
            <Clock size={16} className="text-[var(--accent-solid)]" /> Classes today
          </h2>
          {data.classesToday.map((cls) => (
            <div key={cls.time} className="flex items-center gap-4 p-3.5 rounded-xl border border-white/6 mb-2 hover:bg-white/3 transition-colors">
              <span className="text-sm font-mono text-white/45">{cls.time}</span>
              <div>
                <p className="text-sm font-medium">{cls.subject}</p>
                <p className="text-xs text-white/40">{cls.section} · {cls.room}</p>
              </div>
            </div>
          ))}

          <div className="mt-6 pt-4 border-t border-white/8 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-display text-xl font-bold">{data.stats.students}</p>
              <p className="text-[10px] text-white/40 uppercase">Students</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold">{data.stats.avgGrade}%</p>
              <p className="text-[10px] text-white/40 uppercase">Avg grade</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold">{data.stats.attendance}%</p>
              <p className="text-[10px] text-white/40 uppercase">Attendance</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  )
}
