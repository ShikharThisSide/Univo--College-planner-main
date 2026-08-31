import { useState } from 'react'
import { BookHeart, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import PageTransition from '../../components/ui/PageTransition'

const entries = [
  { day: 13, month: 'May', color: 'journal-coral', content: ['Revisited old memories through photos 📷. Felt warm and nostalgic 💭.', 'Sent a few to friends and it sparked smiles 😊.'] },
  { day: 14, month: 'May', color: 'journal-blue', content: ['Went to bed early last night 💤 and woke up refreshed.', 'Energy levels stayed high all day ⚡.'] },
  { day: 15, month: 'May', color: 'journal-lime', content: ['Organized my thoughts in my journal 🖊️.', 'The clarity it brought made me feel peaceful 🕊️.'] },
  { day: 16, month: 'May', color: 'journal-purple', content: ['Started a new book today 📖. The opening chapter is incredibly immersive.', "I can already tell I'll be hooked on this story 🕸️."] },
  { day: 17, month: 'May', color: 'journal-orange', content: ['Went for a long walk in the park 🌳. The weather was perfect for reflection.', 'Met a friendly golden retriever 🐕 that made my day.'] },
]

export default function JournalPage() {
  const [index, setIndex] = useState(2)
  const entry = entries[index]
  return <PageTransition><div className="journalPage"><div className="journalIntro"><div><p className="settingsEyebrow text-[var(--accent-solid)]">PERSONAL REFLECTIONS</p><h1 className="font-display text-4xl font-extrabold">My Journal</h1><p className="text-[var(--text-muted)] mt-2">A colorful space for your thoughts, memories, and little wins.</p></div><div className="journalSpark"><Sparkles size={20} /></div></div><div className={`journalFeatured ${entry.color}`}><div className="journalDate"><span>{entry.month}</span><strong>{entry.day}</strong></div><div className="journalContent"><p className="journalLabel"><BookHeart size={16} /> FEATURED ENTRY</p>{entry.content.map((line) => <p key={line}>{line}</p>)}<span className="journalMood">Feeling reflective ✨</span></div></div><div className="journalNavigation"><button type="button" disabled={index === 0} onClick={() => setIndex(index - 1)}><ChevronLeft size={18} /> Previous</button><div>{entries.map((item, itemIndex) => <button type="button" key={item.day} className={`journalDot ${itemIndex === index ? 'active' : ''} ${item.color}`} onClick={() => setIndex(itemIndex)} aria-label={`View ${item.month} ${item.day}`} />)}</div><button type="button" disabled={index === entries.length - 1} onClick={() => setIndex(index + 1)}>Next <ChevronRight size={18} /></button></div></div></PageTransition>
}
