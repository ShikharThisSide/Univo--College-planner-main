import { useMemo, useState } from 'react'
import { BookHeart, CalendarDays, Pencil, Save, Sparkles } from 'lucide-react'
import PageTransition from '../../components/ui/PageTransition'

const starterEntries = [
  { day: 13, month: 'May', color: 'journal-coral', content: ['Revisited old memories through photos 📷. Felt warm and nostalgic 💭.', 'Sent a few to friends and it sparked smiles 😊.'] },
  { day: 14, month: 'May', color: 'journal-blue', content: ['Went to bed early last night 💤 and woke up refreshed.', 'Energy levels stayed high all day ⚡.'] },
  { day: 15, month: 'May', color: 'journal-lime', content: ['Organized my thoughts in my journal 🖊️.', 'The clarity it brought made me feel peaceful 🕊️.'] },
  { day: 16, month: 'May', color: 'journal-purple', content: ['Started a new book today 📖. The opening chapter is incredibly immersive.', "I can already tell I'll be hooked on this story 🕸️."] },
  { day: 17, month: 'May', color: 'journal-orange', content: ['Went for a long walk in the park 🌳. The weather was perfect for reflection.', 'Met a friendly golden retriever 🐕 that made my day.'] },
]

export default function JournalPage() {
  const today = useMemo(() => new Date(), [])
  const dateKey = today.toISOString().slice(0, 10)
  const todayEntry = { dateKey, day: today.getDate(), month: today.toLocaleDateString(undefined, { month: 'short' }), color: 'journal-blue', content: [''] }
  const [entries, setEntries] = useState(() => { try { return JSON.parse(localStorage.getItem('univoJournalEntries')) || [...starterEntries, todayEntry] } catch { return [...starterEntries, todayEntry] } })
  const [selectedKey, setSelectedKey] = useState(dateKey)
  const [editing, setEditing] = useState(false)
  const entry = entries.find((item) => item.dateKey === selectedKey) || entries[entries.length - 1]
  const draft = entry.content.join('\n')
  const saveEntry = (event) => { event.preventDefault(); const content = event.currentTarget.elements.content.value.split('\n').map((line) => line.trim()).filter(Boolean); const next = entries.map((item) => item === entry ? { ...item, content } : item); setEntries(next); localStorage.setItem('univoJournalEntries', JSON.stringify(next)); setEditing(false) }
  return <PageTransition><div className="journalPage"><div className="journalIntro"><div><p className="settingsEyebrow text-[var(--accent-solid)]">PERSONAL REFLECTIONS</p><h1 className="font-display text-4xl font-extrabold">My Journal</h1><p className="text-[var(--text-muted)] mt-2">Write something about your day and keep your memories close.</p></div><div className="journalSpark"><Sparkles size={20} /></div></div><form className={`journalFeatured ${entry.color}`} onSubmit={saveEntry}><div className="journalDate"><span>{entry.month}</span><strong>{entry.day}</strong><small>{selectedKey === dateKey ? 'TODAY' : ''}</small></div><div className="journalContent"><p className="journalLabel"><BookHeart size={16} /> {selectedKey === dateKey ? 'TODAY\'S ENTRY' : 'JOURNAL ENTRY'}</p>{editing && selectedKey === dateKey ? <textarea name="content" defaultValue={draft} autoFocus placeholder="How was your day? Write your thoughts here..." className="journalEditor" /> : entry.content.length ? entry.content.map((line) => <p key={line}>{line}</p>) : <p className="journalEmpty">Your page is waiting for your thoughts.</p>}<span className="journalMood">{selectedKey === dateKey ? 'A little space to reflect ✨' : 'Feeling reflective ✨'}</span></div><div className="journalEditAction">{selectedKey === dateKey && (editing ? <button type="submit"><Save size={16} /> Save entry</button> : <button type="button" onClick={() => setEditing(true)}><Pencil size={16} /> Edit today</button>)}</div></form><div className="journalNavigation"><div className="journalEntryPicker">{entries.map((item) => <button type="button" key={item.dateKey || `${item.month}-${item.day}`} className={item === entry ? 'active' : ''} onClick={() => { setSelectedKey(item.dateKey || `${item.month}-${item.day}`); setEditing(false) }}><CalendarDays size={14} /> {item.month} {item.day}</button>)}</div></div></div></PageTransition>
}
