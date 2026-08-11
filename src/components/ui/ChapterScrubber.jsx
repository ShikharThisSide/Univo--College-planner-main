import { useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'

const publicChapters = [
  { id: 'top', title: 'Home', meta: '01', target: '#top' },
  { id: 'features', title: 'Two paths, one platform', meta: '02', target: '#features' },
  { id: 'faq', title: 'Frequently asked questions', meta: '03', target: '#faq' },
  { id: 'pricing', title: 'Simple, transparent plans', meta: '04', target: '/pricing' },
]

const dashboardChapters = [
  { id: 'dashboard', title: 'Dashboard overview', meta: '01', target: '' },
  { id: 'attendance', title: 'Attendance', meta: '02', target: 'attendance' },
  { id: 'assignments', title: 'Assignments', meta: '03', target: 'assignments' },
  { id: 'notes', title: 'Notes Hub', meta: '04', target: 'notes' },
]

const featuresChapters = [
  { id: 'features-top', title: 'Features overview', meta: '01', target: '#features-top' },
  { id: 'features-tools', title: 'Campus tools', meta: '02', target: '#features-tools' },
]

function ChapterTick({ index, pointer, active, chapter, onHover, onSelect }) {
  const width = useTransform(pointer, (value) => {
    const distance = Math.abs(index - value)
    return distance < 3 ? 14 + (1 - distance / 3) * 34 : 14
  })
  return (
    <button type="button" className="chapterTickButton" aria-label={chapter.title} onMouseEnter={() => onHover(index)} onFocus={() => onHover(index)} onClick={onSelect}>
      <motion.span className={`chapterTick ${active ? 'active' : ''}`} style={{ width }} />
      {active && <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="chapterPreview"><small>{chapter.meta}</small><strong>{chapter.title}</strong></motion.span>}
    </button>
  )
}

export default function ChapterScrubber() {
  const location = useLocation()
  const navigate = useNavigate()
  const [active, setActive] = useState(-1)
  const pointer = useMotionValue(-1)
  const springPointer = useSpring(pointer, { stiffness: 700, damping: 52 })
  const chapters = location.pathname === '/features'
    ? featuresChapters
    : location.pathname.startsWith('/dashboard') ? dashboardChapters : publicChapters

  const select = (chapter) => {
    if (chapter.target.startsWith('#')) {
      document.querySelector(chapter.target)?.scrollIntoView({ behavior: 'smooth' })
    } else if (chapter.target.startsWith('/')) {
      navigate(chapter.target)
    } else if (location.pathname.startsWith('/dashboard')) {
      navigate(`${location.pathname.split('/').slice(0, 3).join('/')}/${chapter.target}`.replace(/\/$/, ''))
    }
  }

  return (
    <div className="chapterScrubber" onMouseLeave={() => { pointer.set(-1); setActive(-1) }}>
      {chapters.map((chapter, index) => {
        return (
          <ChapterTick
            key={chapter.id}
            index={index} pointer={springPointer} active={active === index} chapter={chapter}
            onHover={(next) => { pointer.set(next); setActive(next) }} onSelect={() => select(chapter)}
          />
        )
      })}
    </div>
  )
}
