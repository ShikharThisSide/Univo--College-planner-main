import { Building2, Users, GraduationCap, Activity, AlertCircle, TrendingUp } from 'lucide-react'
import PageTransition from '../../components/ui/PageTransition'
import GlassCard from '../../components/ui/GlassCard'
import AnimatedProgress from '../../components/ui/AnimatedProgress'
import { adminData } from '../../lib/mockData'
import { getTimeGreeting } from '../../lib/timeGreeting'

function StatCard({ icon: Icon, label, value, sub, delay = 0 }) {
  return (
    <GlassCard delay={delay} className="relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full univo-gradient-bg opacity-10 blur-xl" />
      <Icon size={18} className="text-[var(--accent-solid)] mb-3" />
      <p className="font-display text-3xl font-bold">{value}</p>
      <p className="text-sm text-white/50 mt-1">{label}</p>
      {sub && <p className="text-xs text-white/30 mt-2">{sub}</p>}
    </GlassCard>
  )
}

export default function AdminDashboard() {
  const data = adminData

  return (
    <PageTransition>
      <div className="mb-8">
        <p className="text-sm text-white/45">{getTimeGreeting()}</p>
        <h1 className="font-display text-4xl font-bold tracking-tight mt-1">
          {data.university} <span className="text-white/30 text-2xl">Command Center</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Total students" value={data.stats.totalStudents.toLocaleString()} delay={0.05} />
        <StatCard icon={GraduationCap} label="Teachers" value={data.stats.totalTeachers} delay={0.1} />
        <StatCard icon={Building2} label="Departments" value={data.stats.departments} delay={0.15} />
        <StatCard icon={Activity} label="Active today" value={data.stats.activeToday.toLocaleString()} sub={`${data.stats.engagement}% engagement`} delay={0.2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2" delay={0.25}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold flex items-center gap-2">
              <TrendingUp size={16} className="text-[var(--accent-solid)]" /> Department performance
            </h2>
          </div>
          <div className="space-y-4">
            {data.departmentStats.map((dept, i) => (
              <div key={dept.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium">{dept.name}</span>
                  <span className="text-xs text-white/40">{dept.students} students · {dept.teachers} teachers</span>
                </div>
                <AnimatedProgress value={dept.engagement} height={6} delay={i * 0.1} />
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard delay={0.3} className="border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-amber-400" />
              <span className="text-sm font-semibold">Pending approvals</span>
            </div>
            <p className="font-display text-4xl font-bold text-amber-400">{data.stats.pendingApprovals}</p>
            <p className="text-xs text-white/40 mt-1">Students awaiting admin approval</p>
          </GlassCard>

          <GlassCard delay={0.35}>
            <h2 className="font-display font-semibold mb-4">Recent notices</h2>
            {data.recentNotices.map((n) => (
              <div key={n.id} className="py-3 border-b border-white/6 last:border-0">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-white/35 mt-1">{n.date} · {n.views} views</p>
              </div>
            ))}
          </GlassCard>

          <GlassCard delay={0.4}>
            <p className="text-sm text-white/50">Moderation queue</p>
            <p className="font-display text-2xl font-bold mt-1">{data.moderationQueue} items</p>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  )
}
