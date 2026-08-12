import { useEffect, useMemo, useRef, useState } from 'react'
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
  Plus,
  Trash2,
} from 'lucide-react'
import PageTransition from '../../components/ui/PageTransition'
import GlassCard from '../../components/ui/GlassCard'
import { downloadPdf } from '../../lib/pdfExport'
import { useAuth } from '../../context/AuthContext'

const INITIAL_STUDENTS = []
function getStoredRoster(storageKey) {
  try {
    const roster = JSON.parse(localStorage.getItem(storageKey) || '[]')
    return Array.isArray(roster) ? roster : INITIAL_STUDENTS
  } catch {
    return INITIAL_STUDENTS
  }
}

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
  const { user } = useAuth()
  const rosterStorageKey = `univoClassRoster:${user?.id || user?.email || 'guest'}`
  const attendanceMetaKey = `univoAttendanceMeta:${user?.id || user?.email || 'guest'}`
  const storedMeta = (() => { try { return JSON.parse(localStorage.getItem(attendanceMetaKey) || 'null') || {} } catch { return {} } })()
  const [className, setClassName] = useState(storedMeta.className || 'Data Structures')
  const [sessionDate, setSessionDate] = useState(storedMeta.sessionDate || new Date().toISOString().slice(0, 10))
  const [students, setStudents] = useState(() => getStoredRoster(`univoClassRoster:${user?.id || user?.email || 'guest'}`))
  const [editingRoster, setEditingRoster] = useState(false)
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [savedAt, setSavedAt] = useState(null)
  const [showPdfDialog, setShowPdfDialog] = useState(false)
  const [pdfSubject, setPdfSubject] = useState(className)
  const [pdfDate, setPdfDate] = useState(sessionDate)

  useEffect(() => {
    try {
      localStorage.setItem(attendanceMetaKey, JSON.stringify({ className, sessionDate }))
    } catch { /* Keep attendance usable if storage is unavailable. */ }
  }, [className, sessionDate, attendanceMetaKey])

  useEffect(() => {
    try {
      const validStudents = students.filter((student) => student.name.trim() && student.enrollment.trim())
      localStorage.setItem(rosterStorageKey, JSON.stringify(validStudents))
    } catch { /* Keep the roster usable if browser storage is unavailable. */ }
  }, [students, rosterStorageKey])

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

  const updateStudent = (id, field, value) => {
    setStudents((current) => current.map((student) => student.id === id ? { ...student, [field]: value } : student))
  }

  const addStudent = () => {
    setStudents((current) => [...current, { id: `student-${Date.now()}`, name: '', enrollment: '', status: 'present' }])
  }

  const removeStudent = (id) => setStudents((current) => current.filter((student) => student.id !== id))

  const saveRoster = () => {
    const cleanedRoster = students.filter((student) => student.name.trim() && student.enrollment.trim())
    setStudents(cleanedRoster)
    setEditingRoster(false)
    showNotice(`Roster saved with ${cleanedRoster.length} ${cleanedRoster.length === 1 ? 'student' : 'students'}.`)
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
    const subject = pdfSubject.trim()
    if (!subject) return showNotice('Enter a subject or class name before generating the PDF.')
    const fileName = `${subject.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'class'}-attendance-${pdfDate}`
    downloadPdf({
      filename: fileName,
      title: subject,
      subtitle: `${formatDate(pdfDate)} | Present: ${presentCount} | Absent: ${absentCount}`,
      attendance: { total: students.length, present: presentCount, absent: absentCount, rows: students.map((student, index) => ({ ...student, index: index + 1 })) },
    })
    setShowPdfDialog(false)
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
          <h1 className="dashboard-light-accent-heading font-display text-3xl font-bold tracking-tight md:text-4xl">Take attendance without the paper trail.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Import your class roster, mark each student present or absent, and export a clean record for the session.</p>
        </div>
        <button type="button" onClick={() => { setPdfSubject(className); setPdfDate(sessionDate); setShowPdfDialog(true) }} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl univo-gradient-bg px-4 py-3 text-sm font-bold text-[#172019] shadow-lg shadow-black/15 hover:opacity-90">
          <Download size={16} /> Generate PDF
        </button>
      </section>

      {notice && <div role="status" className="mb-5 flex items-center gap-2 rounded-xl border border-[var(--accent-solid)]/25 bg-[var(--accent-muted)] px-4 py-3 text-sm text-white/85"><Check size={16} className="text-[var(--accent-solid)]" /> {notice}</div>}

      {showPdfDialog && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="pdf-dialog-title">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#142126] p-6 shadow-2xl">
            <h2 id="pdf-dialog-title" className="font-display text-xl font-bold">Prepare attendance PDF</h2>
            <p className="mt-2 text-sm text-white/50">Confirm the subject and attendance date before generating your report.</p>
            <div className="mt-5 space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/45">Subject / class name
                <input autoFocus value={pdfSubject} onChange={(event) => setPdfSubject(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-white outline-none focus:border-[var(--accent-solid)]/60" placeholder="e.g. Data Structures" />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/45">Attendance date
                <input type="date" value={pdfDate} onChange={(event) => setPdfDate(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-white outline-none focus:border-[var(--accent-solid)]/60 [color-scheme:dark]" />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowPdfDialog(false)} className="cursor-pointer rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/60 hover:bg-white/5">Cancel</button>
              <button type="button" onClick={exportAttendance} className="cursor-pointer rounded-xl univo-gradient-bg px-4 py-2.5 text-sm font-bold text-[#172019] hover:opacity-90">Confirm & generate</button>
            </div>
          </div>
        </div>
      )}

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
                <button type="button" onClick={() => rosterInput.current?.click()} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"><Upload size={15} /> Upload list</button>
                <input ref={rosterInput} type="file" accept=".csv,.txt,text/csv,text/plain" className="hidden" onChange={importRoster} />
                <button type="button" onClick={() => editingRoster ? saveRoster() : setEditingRoster(true)} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10">{editingRoster ? <Check size={15} /> : <Pencil size={15} />} {editingRoster ? 'Save list' : 'Edit list'}</button>
                {editingRoster && <button type="button" onClick={addStudent} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--accent-solid)]/25 bg-[var(--accent-muted)] px-3 py-2 text-xs font-semibold text-[var(--accent-solid)] hover:opacity-90"><Plus size={15} /> Add person</button>}
                <button type="button" onClick={() => setAllStatus('present')} className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-400/15"><UserCheck size={15} /> Mark all present</button>
                <button type="button" onClick={() => setAllStatus('absent')} className="inline-flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-400/15"><UserX size={15} /> Mark all absent</button>
              </div>
              <button type="button" onClick={() => { setSavedAt(new Date()); showNotice('Attendance register saved for this browser session.') }} className="cursor-pointer text-left text-xs font-semibold text-[var(--accent-solid)] hover:opacity-80">Save register</button>
            </div>
            <p className="mt-3 text-xs text-white/35">{editingRoster ? 'Add or remove people, then save the list. Empty rows are discarded.' : 'Roster files need two columns: '} {!editingRoster && <><span className="text-white/55">name, enrollment</span>. CSV and TXT are supported.</>}</p>
          </div>

          <div className="flex flex-col gap-4 border-b border-white/8 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="rosterSearchControl w-full md:max-w-sm">
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="rosterSearchInput" placeholder="Search name or enrollment" />
              <Search size={16} aria-hidden="true" className="rosterSearchIcon" />
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
                    <td className="px-4 py-3.5 font-medium">{editingRoster ? <input value={student.name} onChange={(event) => updateStudent(student.id, 'name', event.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 outline-none focus:border-[var(--accent-solid)]/60" placeholder="Name" /> : student.name}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-white/45">{editingRoster ? <input value={student.enrollment} onChange={(event) => updateStudent(student.id, 'enrollment', event.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 font-mono outline-none focus:border-[var(--accent-solid)]/60" placeholder="Enrollment" /> : student.enrollment}</td>
                    <td className="px-6 py-3.5"><div className="flex justify-end gap-2"><button type="button" onClick={() => updateStatus(student.id, 'present')} className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${student.status === 'present' ? 'bg-emerald-400 text-[#14221a]' : 'bg-white/5 text-white/45 hover:bg-white/10'}`}>Present</button><button type="button" onClick={() => updateStatus(student.id, 'absent')} className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${student.status === 'absent' ? 'bg-rose-400 text-[#301719]' : 'bg-white/5 text-white/45 hover:bg-white/10'}`}>Absent</button></div></td>
                    {editingRoster && <td className="px-3 py-3.5"><button type="button" onClick={() => removeStudent(student.id)} className="cursor-pointer rounded-lg p-2 text-rose-300 hover:bg-rose-400/10" aria-label={`Remove ${student.name || 'person'}`}><Trash2 size={16} /></button></td>}
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
