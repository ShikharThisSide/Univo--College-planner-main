import { useMemo, useRef, useState } from 'react'
import {
  CalendarCheck,
  Check,
  Download,
  Pencil,
  Search,
  Upload,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react'
import PageTransition from '../../components/ui/PageTransition'
import GlassCard from '../../components/ui/GlassCard'
import { downloadPdf } from '../../lib/pdfExport'

const INITIAL_STUDENTS = [
  ['Aarav Sharma', '2024CSE001'],
  ['Ananya Rao', '2024CSE002'],
  ['Dev Malhotra', '2024CSE003'],
  ['Ishita Verma', '2024CSE004'],
  ['Kabir Khan', '2024CSE005'],
  ['Meera Iyer', '2024CSE006'],
  ['Rohan Kapoor', '2024CSE007'],
  ['Sneha Patel', '2024CSE008'],
].map(([name, enrollment], index) => ({ id: `${enrollment}-${index}`, name, enrollment, status: 'present' }))

function formatDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getRosterFromText(text) {
  const rows = text
    .split(/\r?\n/)
    .map((line) => line.split(',').map((column) => column.trim().replace(/^"|"$/g, '')))
    .filter((row) => row.some(Boolean))

  if (!rows.length) return []
  const header = rows[0].map((value) => value.toLowerCase())
  const hasHeader = header.some((value) => value.includes('name')) || header.some((value) => value.includes('enrol') || value.includes('roll'))
  const nameIndex = header.findIndex((value) => value.includes('name'))
  const enrollmentIndex = header.findIndex((value) => value.includes('enrol') || value.includes('roll'))
  const dataRows = hasHeader ? rows.slice(1) : rows

  return dataRows
    .map((row, index) => ({
      id: `${row[enrollmentIndex >= 0 ? enrollmentIndex : 1] || index}-${index}-${Date.now()}`,
      name: row[nameIndex >= 0 ? nameIndex : 0] || '',
      enrollment: row[enrollmentIndex >= 0 ? enrollmentIndex : 1] || '',
      status: 'present',
    }))
    .filter((student) => student.name && student.enrollment)
}

export default function ClassRepresentativePage() {
  const rosterInput = useRef(null)
  const [className, setClassName] = useState('Data Structures')
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [students, setStudents] = useState(INITIAL_STUDENTS)
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [savedAt, setSavedAt] = useState(null)

  const visibleStudents = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return students
    return students.filter((student) => `${student.name} ${student.enrollment}`.toLowerCase().includes(normalized))
  }, [query, students])

  const presentCount = students.filter((student) => student.status === 'present').length
  const absentCount = students.length - presentCount

  const showNotice = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3500)
  }

  const updateStatus = (id, status) => {
    setStudents((current) => current.map((student) => (student.id === id ? { ...student, status } : student)))
  }

  const setAllStatus = (status) => {
    setStudents((current) => current.map((student) => ({ ...student, status })))
  }

  const importRoster = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const importedStudents = getRosterFromText(await file.text())
      if (!importedStudents.length) {
        showNotice('Could not find names and enrollment numbers in that file.')
      } else {
        setStudents(importedStudents)
        showNotice(`${importedStudents.length} students imported. Everyone starts as present.`)
      }
    } catch {
      showNotice('The roster could not be read. Upload a CSV or TXT file.')
    }
    event.target.value = ''
  }

  const exportAttendance = () => {
    const fileName = `${className.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'class'}-attendance-${sessionDate}`
    downloadPdf({
      filename: fileName,
      title: 'Class Representative Attendance Register',
      subtitle: `${className} | ${formatDate(sessionDate)} | Present: ${presentCount} | Absent: ${absentCount}`,
      lines: [
        'Class attendance report',
        '',
        'No.   Student name                         Enrollment          Status',
        '--------------------------------------------------------------------------',
        ...students.map((student, index) => `${String(index + 1).padEnd(5)} ${student.name.padEnd(36)} ${student.enrollment.padEnd(20)} ${student.status.toUpperCase()}`),
        '',
        `Total students: ${students.length}`,
        `Present: ${presentCount}`,
        `Absent: ${absentCount}`,
      ],
    })
    showNotice('Attendance PDF generated and downloaded.')
  }

  return (
    <PageTransition>
      <section className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-[var(--accent-solid)]">
            <CalendarCheck size={17} />
            <span className="font-semibold">Class Representative</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Take attendance without the paper trail.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Import your class roster, mark each student present or absent, and export a clean record for the session.</p>
        </div>
        <button type="button" onClick={exportAttendance} className="inline-flex items-center justify-center gap-2 rounded-xl univo-gradient-bg px-4 py-3 text-sm font-bold text-[#172019] shadow-lg shadow-black/15 hover:opacity-90">
          <Download size={16} /> Generate PDF
        </button>
      </section>

      {notice && <div role="status" className="mb-5 flex items-center gap-2 rounded-xl border border-[var(--accent-solid)]/25 bg-[var(--accent-muted)] px-4 py-3 text-sm text-white/85"><Check size={16} className="text-[var(--accent-solid)]" /> {notice}</div>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">
        <GlassCard hover={false} className="!p-0 overflow-hidden">
          <div className="border-b border-white/8 p-5 md:p-6">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_190px]">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/45"><Pencil size={13} /> Subject / class name</span>
                <input value={className} onChange={(event) => setClassName(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm font-medium outline-none placeholder:text-white/25 focus:border-[var(--accent-solid)]/60" placeholder="e.g. Data Structures" />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/45">Attendance date</span>
                <input type="date" value={sessionDate} onChange={(event) => setSessionDate(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm outline-none focus:border-[var(--accent-solid)]/60 [color-scheme:dark]" />
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => rosterInput.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"><Upload size={15} /> Upload roster</button>
                <input ref={rosterInput} type="file" accept=".csv,.txt,text/csv,text/plain" className="hidden" onChange={importRoster} />
                <button type="button" onClick={() => setAllStatus('present')} className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-400/15"><UserCheck size={15} /> Mark all present</button>
                <button type="button" onClick={() => setAllStatus('absent')} className="inline-flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-400/15"><UserX size={15} /> Mark all absent</button>
              </div>
              <button type="button" onClick={() => { setSavedAt(new Date()); showNotice('Attendance register saved for this browser session.') }} className="text-left text-xs font-semibold text-[var(--accent-solid)] hover:opacity-80">Save register</button>
            </div>
            <p className="mt-3 text-xs text-white/35">Roster files need two columns: <span className="text-white/55">name, enrollment</span>. CSV and TXT are supported.</p>
          </div>

          <div className="flex flex-col gap-4 border-b border-white/8 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="relative w-full md:max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-xl border border-white/8 bg-white/4 py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-white/25 focus:border-[var(--accent-solid)]/50" placeholder="Search name or enrollment" />
            </div>
            <span className="text-xs text-white/40">Showing {visibleStudents.length} of {students.length} students</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-white/[0.025] text-[10px] uppercase tracking-wider text-white/40">
                <tr><th className="px-6 py-3 font-semibold">#</th><th className="px-4 py-3 font-semibold">Student</th><th className="px-4 py-3 font-semibold">Enrollment no.</th><th className="px-6 py-3 text-right font-semibold">Attendance</th></tr>
              </thead>
              <tbody>
                {visibleStudents.map((student, index) => (
                  <tr key={student.id} className="border-t border-white/6 text-sm hover:bg-white/[0.025]">
                    <td className="px-6 py-3.5 text-white/35">{String(index + 1).padStart(2, '0')}</td>
                    <td className="px-4 py-3.5 font-medium">{student.name}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-white/45">{student.enrollment}</td>
                    <td className="px-6 py-3.5"><div className="flex justify-end gap-2"><button type="button" onClick={() => updateStatus(student.id, 'present')} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${student.status === 'present' ? 'bg-emerald-400 text-[#14221a]' : 'bg-white/5 text-white/45 hover:bg-white/10'}`}>Present</button><button type="button" onClick={() => updateStatus(student.id, 'absent')} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${student.status === 'absent' ? 'bg-rose-400 text-[#301719]' : 'bg-white/5 text-white/45 hover:bg-white/10'}`}>Absent</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard hover={false} className="!p-5">
            <div className="mb-4 flex items-center gap-2"><Users size={17} className="text-[var(--accent-solid)]" /><h2 className="font-display font-semibold">Session summary</h2></div>
            <p className="text-sm font-medium">{className || 'Untitled class'}</p>
            <p className="mt-1 text-xs text-white/40">{formatDate(sessionDate)}</p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-white/7 bg-white/4 px-2 py-3"><p className="font-display text-xl font-bold">{students.length}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-white/35">Total</p></div>
              <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/8 px-2 py-3"><p className="font-display text-xl font-bold text-emerald-300">{presentCount}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-white/35">Present</p></div>
              <div className="rounded-xl border border-rose-400/15 bg-rose-400/8 px-2 py-3"><p className="font-display text-xl font-bold text-rose-300">{absentCount}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-white/35">Absent</p></div>
            </div>
          </GlassCard>
          <GlassCard hover={false} className="!p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/35">Status</p>
            <p className="mt-2 text-sm text-white/70">{savedAt ? `Saved at ${savedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 'Changes are ready to save.'}</p>
            <p className="mt-3 text-xs leading-5 text-white/35">Generate a PDF whenever you need a shareable present-and-absent report.</p>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  )
}
