import { useMemo, useState } from 'react'
import { Check, MessageCircle, Search, UserPlus, Users, X } from 'lucide-react'
import { motion } from 'framer-motion'
import PageTransition from '../../components/ui/PageTransition'
import GlassCard from '../../components/ui/GlassCard'
import { useAuth } from '../../context/AuthContext'
import { DEMO_USERS } from '../../lib/constants'
import { addFriend, areFriends, readSocial, requestFriend } from '../../lib/social'

function readPeople(currentUser) {
  let accounts = {}
  try { accounts = JSON.parse(localStorage.getItem('univoAccounts') || '{}') || {} } catch { accounts = {} }
  const people = Object.entries(accounts).map(([email, account]) => ({ id: email, email, name: account.name || email.split('@')[0].replace(/[._]/g, ' '), role: account.role || 'student_individual', username: account.username, avatar: account.avatar, avatarImage: account.avatarImage }))
  Object.values(DEMO_USERS).forEach((person) => people.push({ ...person, id: `demo-${person.role}` }))
  return people.filter((person, index, list) => person.email !== currentUser?.email && list.findIndex((item) => item.email === person.email) === index)
}

function PersonAvatar({ person, index = 0, large = false }) {
  return <span className={`${large ? 'messengerLargeAvatar' : `messengerPersonAvatar messengerAvatar-${index % 4}`}`}>{person.avatarImage ? <img src={person.avatarImage} alt={person.name} /> : person.avatar || person.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>
}

export default function MessengerPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [sent, setSent] = useState([])
  const [friends] = useState(() => readSocial(`friends:${user?.email}`))
  const people = useMemo(() => readPeople(user), [user])
  const friendPeople = people.filter((person) => friends.includes(person.email))
  const results = people.filter((person) => `${person.name} ${person.email} ${person.username || ''}`.toLowerCase().includes(query.trim().toLowerCase()))
  const openProfile = (person) => setSelected(person)
  const sendRequest = () => { if (!areFriends(user, selected) && !sent.includes(selected.email)) { requestFriend(user, selected); setSent((value) => [...value, selected.email]) } }
  return <PageTransition><div className="messengerPage"><div className="messengerHero"><p className="settingsEyebrow">UNIVO MESSENGER</p><h1>Find your people.</h1><p>Search classmates, friends, and study partners by name or username.</p><div className="messengerSearch"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by username or name…" aria-label="Search people" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}</div></div>
    <section className="messengerResults"><p className="messengerResultCount flex items-center gap-2"><Users size={15} /> My friends</p>{friendPeople.length ? <div className="messengerPeopleGrid">{friendPeople.map((person, index) => <button type="button" className="messengerPersonCard text-left" key={person.email} onClick={() => openProfile(person)}><PersonAvatar person={person} index={index} /><span className="messengerPersonCopy"><strong>{person.name}</strong><small>@{person.username || person.email.split('@')[0]}</small></span><Check size={17} /></button>)}</div> : <GlassCard><div className="messengerEmpty"><Users size={24} /><strong>No friends yet</strong><span>Search for someone above and send them a friend request.</span></div></GlassCard>}</section>
    {query ? <div className="messengerResults"><p className="messengerResultCount">{results.length} {results.length === 1 ? 'person' : 'people'} found</p>{results.length ? <div className="messengerPeopleGrid">{results.map((person, index) => <motion.button type="button" key={person.id} className="messengerPersonCard" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05 }} onClick={() => openProfile(person)}><PersonAvatar person={person} index={index} /><span className="messengerPersonCopy"><strong>{person.name}</strong><small>@{person.username || person.email.split('@')[0]}</small><em>{person.role.replaceAll('_', ' ')}</em></span>{areFriends(user, person) ? <Check size={17} /> : sent.includes(person.email) ? <span className="text-xs text-white/40">Sent</span> : <UserPlus size={17} />}</motion.button>)}</div> : <GlassCard><div className="messengerEmpty"><Search size={24} /><strong>No people found</strong><span>Try searching with another name or username.</span></div></GlassCard>}</div> : <GlassCard className="messengerEmptyCard"><div className="messengerEmpty"><MessageCircle size={28} /><strong>Search for a friend to start chatting</strong><span>Type a username above and their profile will appear here.</span></div></GlassCard>}
    {selected && <div className="messengerProfileOverlay" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}><motion.div className="messengerProfileModal" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}><button type="button" className="messengerProfileClose" onClick={() => setSelected(null)} aria-label="Close profile"><X size={18} /></button><PersonAvatar person={selected} large /><p className="settingsEyebrow">UNIVO MEMBER</p><h2>{selected.name}</h2><p className="messengerProfileHandle">@{selected.username || selected.email.split('@')[0]}</p><p className="messengerProfileRole">{selected.role.replaceAll('_', ' ')}</p><button type="button" className="messengerStartButton" onClick={() => { sendRequest(); setSelected(null) }}><UserPlus size={16} /> {areFriends(user, selected) ? 'Already friends' : sent.includes(selected.email) ? 'Request sent' : 'Add friend'}</button></motion.div></div>}</div></PageTransition>
}
