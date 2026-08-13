import { useMemo, useState } from 'react'
import { MessageCircle, Search, UserPlus, X } from 'lucide-react'
import { motion } from 'framer-motion'
import PageTransition from '../../components/ui/PageTransition'
import GlassCard from '../../components/ui/GlassCard'
import { useAuth } from '../../context/AuthContext'
import { DEMO_USERS } from '../../lib/constants'

function readPeople(currentUser) {
  const people = Object.entries(JSON.parse(localStorage.getItem('univoAccounts') || '{}')).map(([email, account]) => ({
    id: email,
    email,
    name: account.name || email.split('@')[0].replace(/[._]/g, ' '),
    role: account.role || 'student_individual',
    avatar: account.avatar,
    avatarImage: account.avatarImage,
  }))
  Object.values(DEMO_USERS).forEach((person) => people.push({ ...person, id: `demo-${person.role}` }))
  return people.filter((person, index, list) => person.email !== currentUser?.email && list.findIndex((item) => item.email === person.email) === index)
}

export default function MessengerPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const people = useMemo(() => readPeople(user), [user])
  const results = people.filter((person) => `${person.name} ${person.email} ${person.username || ''}`.toLowerCase().includes(query.trim().toLowerCase()))

  return <PageTransition><div className="messengerPage"><div className="messengerHero"><p className="settingsEyebrow">UNIVO MESSENGER</p><h1>Find your people.</h1><p>Search classmates, friends, and study partners by name or username.</p><div className="messengerSearch"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by username or name…" aria-label="Search people" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}</div></div>{query ? <div className="messengerResults"><p className="messengerResultCount">{results.length} {results.length === 1 ? 'person' : 'people'} found</p>{results.length ? <div className="messengerPeopleGrid">{results.map((person, index) => <motion.button type="button" key={person.id} className="messengerPersonCard" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05 }} onClick={() => setSelected(person)}><span className={`messengerPersonAvatar messengerAvatar-${index % 4}`}>{person.avatarImage ? <img src={person.avatarImage} alt="" /> : person.avatar || person.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><span className="messengerPersonCopy"><strong>{person.name}</strong><small>@{person.username || person.email.split('@')[0]}</small><em>{person.role.replaceAll('_', ' ')}</em></span><UserPlus size={17} /></motion.button>)}</div> : <GlassCard><div className="messengerEmpty"><Search size={24} /><strong>No people found</strong><span>Try searching with another name or username.</span></div></GlassCard>}</div> : <GlassCard className="messengerEmptyCard"><div className="messengerEmpty"><MessageCircle size={28} /><strong>Search for a friend to start chatting</strong><span>Type a username above and their profile will appear here.</span></div></GlassCard>}{selected && <div className="messengerProfileOverlay" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}><motion.div className="messengerProfileModal" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}><button type="button" className="messengerProfileClose" onClick={() => setSelected(null)} aria-label="Close profile"><X size={18} /></button><span className="messengerLargeAvatar">{selected.avatarImage ? <img src={selected.avatarImage} alt={selected.name} /> : selected.avatar || selected.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><p className="settingsEyebrow">UNIVO MEMBER</p><h2>{selected.name}</h2><p className="messengerProfileHandle">@{selected.username || selected.email.split('@')[0]}</p><p className="messengerProfileRole">{selected.role.replaceAll('_', ' ')}</p><button type="button" className="messengerStartButton" onClick={() => setSelected(null)}><MessageCircle size={16} /> Start conversation</button></motion.div></div>}</div></PageTransition>
}
