import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Download,
  ExternalLink,
  FilePenLine,
  FilePlus2,
  FileText,
  FolderOpen,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import PageTransition from '../../components/ui/PageTransition'
import GlassCard from '../../components/ui/GlassCard'
import { downloadPdf } from '../../lib/pdfExport'
import { useAuth } from '../../context/AuthContext'

const STARTER_SUBJECTS = [
  { id: 'data-structures', name: 'Data Structures', accent: 'from-violet-500/35 to-indigo-500/10', files: [{ id: 'ds-1', title: 'Trees and Graphs Revision', fileName: 'trees-and-graphs.pdf', size: '1.2 MB', updated: 'Today', kind: 'upload' }] },
  { id: 'operating-systems', name: 'Operating Systems', accent: 'from-orange-500/35 to-amber-500/10', files: [{ id: 'os-1', title: 'Deadlocks and Scheduling', fileName: 'deadlocks.pdf', size: '860 KB', updated: 'Yesterday', kind: 'upload' }] },
  { id: 'dbms', name: 'DBMS', accent: 'from-teal-500/35 to-cyan-500/10', files: [] },
]

const ACCENTS = ['from-violet-500/35 to-indigo-500/10', 'from-orange-500/35 to-amber-500/10', 'from-teal-500/35 to-cyan-500/10', 'from-rose-500/35 to-pink-500/10', 'from-sky-500/35 to-blue-500/10']

function humanFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function NotesHubPage() {
  const { user } = useAuth()
  const notesStorageKey = `univoNotesHub:${user?.id || user?.email || 'guest'}`
  const fileInput = useRef(null)
  const [subjects, setSubjects] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`univoNotesHub:${user?.id || user?.email || 'guest'}`) || 'null')
      return Array.isArray(saved) ? saved : []
    } catch { return [] }
  })
  const [activeSubjectId, setActiveSubjectId] = useState(null)
  const [subjectDialog, setSubjectDialog] = useState(false)
  const [subjectName, setSubjectName] = useState('')
  const [editingSubjectId, setEditingSubjectId] = useState(null)
  const [editor, setEditor] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    try { localStorage.setItem(notesStorageKey, JSON.stringify(subjects)) } catch { /* Keep editing usable if storage is unavailable. */ }
  }, [notesStorageKey, subjects])

  const activeSubject = useMemo(() => subjects.find((subject) => subject.id === activeSubjectId) || null, [activeSubjectId, subjects])

  const showNotice = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3500)
  }

  const saveSubject = (event) => {
    event.preventDefault()
    const cleanedName = subjectName.trim()
    if (!cleanedName) return

    if (editingSubjectId) {
      setSubjects((current) => current.map((subject) => (subject.id === editingSubjectId ? { ...subject, name: cleanedName } : subject)))
      showNotice('Subject folder renamed.')
    } else {
      const id = `${cleanedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`
      setSubjects((current) => [...current, { id, name: cleanedName, accent: ACCENTS[current.length % ACCENTS.length], files: [] }])
      setActiveSubjectId(id)
      showNotice('New subject folder created.')
    }
    setSubjectDialog(false)
    setSubjectName('')
    setEditingSubjectId(null)
  }

  const uploadFiles = async (event) => {
    if (!activeSubjectId) return
    const selectedFiles = Array.from(event.target.files || [])
    const pdfs = selectedFiles.filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))
    if (!pdfs.length) {
      showNotice('Please choose one or more PDF files.')
      event.target.value = ''
      return
    }

    const newFiles = await Promise.all(pdfs.map(async (file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      title: file.name.replace(/\.pdf$/i, ''),
      fileName: file.name,
      size: humanFileSize(file.size),
      updated: 'Just now',
      kind: 'upload',
      url: await new Promise((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsDataURL(file) }),
    })))
    setSubjects((current) => current.map((subject) => (subject.id === activeSubjectId ? { ...subject, files: [...subject.files, ...newFiles] } : subject)))
    showNotice(`${newFiles.length} PDF${newFiles.length === 1 ? '' : 's'} added to ${activeSubject?.name}.`)
    event.target.value = ''
  }

  const saveEditor = (event) => {
    event.preventDefault()
    if (!editor?.title.trim() || !activeSubjectId) return
    const now = 'Just now'
    setSubjects((current) => current.map((subject) => {
      if (subject.id !== activeSubjectId) return subject
      const file = {
        id: editor.id || `note-${Date.now()}`,
        title: editor.title.trim(),
        fileName: `${editor.title.trim().replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '').toLowerCase() || 'note'}.pdf`,
        size: 'Editable',
        updated: now,
        kind: 'editable',
        content: editor.content,
      }
      return { ...subject, files: editor.id ? subject.files.map((item) => (item.id === editor.id ? file : item)) : [...subject.files, file] }
    }))
    setEditor(null)
    showNotice(editor.id ? 'Editable PDF updated.' : 'Editable PDF added to the folder.')
  }

  const openFile = (file) => {
    if (!file.url) {
      showNotice(file.kind === 'editable' ? 'Open this editable PDF from the editor and export a fresh copy.' : 'This starter file has no local PDF attached yet.')
      return
    }
    window.open(file.url, '_blank', 'noopener,noreferrer')
  }

  const exportEditableFile = (file) => {
    downloadPdf({
      filename: file.fileName,
      title: file.title,
      subtitle: `${activeSubject?.name || 'Notes Hub'} | Exported from Univo Notes Hub`,
      lines: (file.content || 'No content added yet.').split(/\r?\n/),
    })
    showNotice('Editable PDF exported.')
  }

  const removeSubject = () => {
    if (!activeSubject || !window.confirm(`Remove the ${activeSubject.name} subject folder and its ${activeSubject.files.length} PDF${activeSubject.files.length === 1 ? '' : 's'}? This cannot be undone.`)) return
    setSubjects((current) => current.filter((subject) => subject.id !== activeSubject.id))
    setActiveSubjectId(null)
    showNotice(`${activeSubject.name} subject folder removed.`)
  }

  const removeFile = (file) => {
    if (!activeSubject || !window.confirm(`Remove “${file.title}” from ${activeSubject.name}? This cannot be undone.`)) return
    setSubjects((current) => current.map((subject) => (
      subject.id === activeSubject.id
        ? { ...subject, files: subject.files.filter((item) => item.id !== file.id) }
        : subject
    )))
    showNotice(`“${file.title}” removed.`)
  }

  return (
    <PageTransition>
      <section className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-[var(--accent-solid)]"><BookOpen size={17} /><span className="font-semibold">Notes Hub</span></div>
          <h1 className="dashboard-light-accent-heading font-display text-3xl font-bold tracking-tight md:text-4xl">Your subject folders, all in one place.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Create a subject, upload its PDFs, or make an editable PDF note that you can revise and export anytime.</p>
        </div>
        <button type="button" onClick={() => { setEditingSubjectId(null); setSubjectName(''); setSubjectDialog(true) }} className="inline-flex items-center justify-center gap-2 rounded-xl univo-gradient-bg px-4 py-3 text-sm font-bold text-[#172019] hover:opacity-90"><Plus size={17} /> Add subject</button>
      </section>

      {notice && <div role="status" className="mb-5 flex items-center gap-2 rounded-xl border border-[var(--accent-solid)]/25 bg-[var(--accent-muted)] px-4 py-3 text-sm text-white/85"><Check size={16} className="text-[var(--accent-solid)]" /> {notice}</div>}

      {!activeSubject ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject, index) => (
            <GlassCard key={subject.id} delay={index * 0.04} onClick={() => setActiveSubjectId(subject.id)} className="group relative min-h-[190px] overflow-hidden !p-0">
              <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${subject.accent}`} />
              <div className="relative flex h-full flex-col p-5">
                <div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl border border-white/12 bg-[#172126]/60 shadow-lg"><FolderOpen size={20} className="text-[var(--accent-solid)]" /></span><ChevronRight size={18} className="text-white/35 transition-transform group-hover:translate-x-1 group-hover:text-white/75" /></div>
                <div className="mt-auto"><h2 className="font-display text-lg font-semibold">{subject.name}</h2><p className="mt-1 text-xs text-white/45">{subject.files.length} PDF{subject.files.length === 1 ? '' : 's'} in this folder</p></div>
              </div>
            </GlassCard>
          ))}
          <button type="button" onClick={() => { setEditingSubjectId(null); setSubjectName(''); setSubjectDialog(true) }} className="min-h-[190px] rounded-2xl border border-dashed border-white/16 p-5 text-left text-white/45 transition-colors hover:border-[var(--accent-solid)]/50 hover:bg-white/[0.025] hover:text-white/70"><span className="mb-6 grid h-11 w-11 place-items-center rounded-xl bg-white/5"><Plus size={20} /></span><p className="font-display font-semibold">Add a new subject</p><p className="mt-1 text-xs leading-5 text-white/35">Make a folder for another class.</p></button>
        </div>
      ) : (
        <section>
          <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-white/8 bg-white/[0.025] p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3"><button type="button" onClick={() => setActiveSubjectId(null)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/65 hover:bg-white/10" aria-label="Back to subject folders"><ArrowLeft size={18} /></button><div><div className="flex items-center gap-2"><h2 className="font-display text-xl font-bold">{activeSubject.name}</h2><button type="button" onClick={() => { setEditingSubjectId(activeSubject.id); setSubjectName(activeSubject.name); setSubjectDialog(true) }} className="cursor-pointer text-white/35 hover:text-[var(--accent-solid)]" aria-label="Rename subject"><Pencil size={14} /></button><button type="button" onClick={removeSubject} className="cursor-pointer text-white/35 hover:text-rose-300" aria-label={`Remove ${activeSubject.name} subject`}><Trash2 size={15} /></button></div><p className="mt-1 text-xs text-white/40">{activeSubject.files.length} PDF{activeSubject.files.length === 1 ? '' : 's'} in this folder</p></div></div>
            <div className="flex flex-wrap gap-2"><button type="button" onClick={() => fileInput.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-white/80 hover:bg-white/10"><Upload size={15} /> Upload PDFs</button><button type="button" onClick={() => setEditor({ title: '', content: '' })} className="inline-flex items-center gap-2 rounded-xl univo-gradient-bg px-3.5 py-2.5 text-xs font-bold text-[#172019] hover:opacity-90"><FilePlus2 size={15} /> Create editable PDF</button><input ref={fileInput} onChange={uploadFiles} type="file" accept="application/pdf,.pdf" multiple className="hidden" /></div>
          </div>

          {activeSubject.files.length ? <div className="grid gap-3 lg:grid-cols-2">
            {activeSubject.files.map((file, index) => (
              <GlassCard key={file.id} hover={false} delay={index * 0.03} className="flex !p-4">
                <div className={`mr-4 grid h-12 w-12 shrink-0 place-items-center rounded-xl ${file.kind === 'editable' ? 'bg-[var(--accent-muted)] text-[var(--accent-solid)]' : 'bg-rose-400/10 text-rose-300'}`}>{file.kind === 'editable' ? <FilePenLine size={20} /> : <FileText size={20} />}</div>
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate text-sm font-semibold">{file.title}</h3><p className="mt-1 truncate text-xs text-white/40">{file.fileName}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${file.kind === 'editable' ? 'bg-[var(--accent-muted)] text-[var(--accent-solid)]' : 'bg-white/6 text-white/45'}`}>{file.kind === 'editable' ? 'EDITABLE' : 'PDF'}</span></div><div className="mt-4 flex items-center justify-between gap-2"><span className="text-[11px] text-white/35">{file.size} · {file.updated}</span><div className="flex gap-1.5">{file.kind === 'editable' ? <><button type="button" onClick={() => setEditor(file)} className="cursor-pointer rounded-lg bg-white/6 px-2.5 py-1.5 text-xs font-bold text-white/70 hover:bg-white/12">Edit</button><button type="button" onClick={() => exportEditableFile(file)} className="grid h-7 w-7 cursor-pointer place-items-center rounded-lg bg-white/6 text-white/60 hover:bg-white/12" aria-label={`Download ${file.title}`}><Download size={14} /></button></> : <button type="button" onClick={() => openFile(file)} className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-white/6 px-2.5 py-1.5 text-xs font-bold text-white/70 hover:bg-white/12">Open <ExternalLink size={12} /></button>}<button type="button" onClick={() => removeFile(file)} className="grid h-7 w-7 cursor-pointer place-items-center rounded-lg bg-white/6 text-white/55 hover:bg-rose-400/15 hover:text-rose-300" aria-label={`Remove ${file.title}`}><Trash2 size={14} /></button></div></div></div>
              </GlassCard>
            ))}
          </div> : <GlassCard hover={false} className="flex min-h-[260px] flex-col items-center justify-center text-center"><div className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent-solid)]"><FileText size={21} /></div><h3 className="mt-4 font-display font-semibold">This folder is ready for notes.</h3><p className="mt-2 max-w-sm text-sm leading-6 text-white/45">Upload one or more PDFs, or create an editable PDF note from scratch.</p></GlassCard>}
        </section>
      )}

      {subjectDialog && <div className="fixed inset-0 z-[60] grid place-items-center bg-[#091014]/70 p-4 backdrop-blur-sm"><form onSubmit={saveSubject} className="w-full max-w-md rounded-2xl border border-white/12 bg-[#182327] p-5 shadow-2xl"><div className="flex items-center justify-between"><h2 className="font-display text-lg font-bold">{editingSubjectId ? 'Rename subject' : 'Add a subject'}</h2><button type="button" onClick={() => { setSubjectDialog(false); setEditingSubjectId(null) }} className="grid h-8 w-8 place-items-center rounded-lg text-white/45 hover:bg-white/7 hover:text-white" aria-label="Close"><X size={17} /></button></div><label className="mt-5 block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">Subject name</span><input autoFocus value={subjectName} onChange={(event) => setSubjectName(event.target.value)} placeholder="e.g. Computer Networks" className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm outline-none placeholder:text-white/25 focus:border-[var(--accent-solid)]/60" /></label><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => { setSubjectDialog(false); setEditingSubjectId(null) }} className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/50 hover:bg-white/6 hover:text-white">Cancel</button><button type="submit" className="rounded-xl univo-gradient-bg px-3.5 py-2.5 text-sm font-bold text-[#172019]">{editingSubjectId ? 'Save name' : 'Create folder'}</button></div></form></div>}

      {editor && <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#091014]/70 p-4 backdrop-blur-sm"><form onSubmit={saveEditor} className="mx-auto my-6 w-full max-w-3xl rounded-2xl border border-white/12 bg-[#182327] p-5 shadow-2xl md:p-6"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-solid)]">Editable PDF</p><h2 className="mt-1 font-display text-xl font-bold">Write now, export when ready.</h2></div><button type="button" onClick={() => setEditor(null)} className="grid h-9 w-9 place-items-center rounded-lg text-white/45 hover:bg-white/7 hover:text-white" aria-label="Close editor"><X size={18} /></button></div><label className="mt-6 block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">Document title</span><input autoFocus value={editor.title} onChange={(event) => setEditor((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. Unit 3 revision" className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm outline-none placeholder:text-white/25 focus:border-[var(--accent-solid)]/60" /></label><label className="mt-4 block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">Notes</span><textarea value={editor.content || ''} onChange={(event) => setEditor((current) => ({ ...current, content: event.target.value }))} placeholder="Write your notes here. You can come back and edit this anytime before exporting a PDF." className="min-h-72 w-full resize-y rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm leading-6 outline-none placeholder:text-white/25 focus:border-[var(--accent-solid)]/60" /></label><div className="mt-5 flex flex-wrap justify-end gap-2"><button type="button" onClick={() => setEditor(null)} className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/50 hover:bg-white/6 hover:text-white">Cancel</button><button type="submit" className="inline-flex items-center gap-2 rounded-xl univo-gradient-bg px-3.5 py-2.5 text-sm font-bold text-[#172019]"><Check size={16} /> Save editable PDF</button></div></form></div>}
    </PageTransition>
  )
}
