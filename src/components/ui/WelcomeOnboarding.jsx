import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ArrowRight, BookOpen, CalendarCheck, Check, X } from 'lucide-react'

const steps = [
  { title: 'Welcome to Univo.', description: 'Your personal campus command centre is ready. Plan your semester, keep your notes close, and stay on top of what matters.', icon: BookOpen, label: 'Your workspace' },
  { title: 'Plan the semester clearly.', description: 'Use your dashboard to check today’s schedule, track attendance, manage assignments, and see the work that needs your attention.', icon: CalendarCheck, label: 'Plan and track' },
  { title: 'Make it yours.', description: 'Explore Notes Hub, customise your dashboard layout, choose an accent theme, and connect with your campus community.', icon: Check, label: 'Ready when you are' },
]

export default function WelcomeOnboarding({ onComplete }) {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const current = steps[step]
  const Icon = current.icon
  const finish = () => { localStorage.removeItem(`univoPreference:${user?.email || 'guest'}:pendingOnboarding`); onComplete?.() }
  return <div className="welcomeOverlay" role="dialog" aria-modal="true" aria-labelledby="welcome-title"><div className="welcomeCard"><button type="button" className="welcomeClose" onClick={finish} aria-label="Close welcome tour"><X size={18} /></button><div className="welcomeVisual"><div className="welcomeOrb"><Icon size={30} /></div><div className="welcomeGlow" /></div><div className="welcomeBody"><span className="welcomeEyebrow">{current.label}</span><h2 id="welcome-title">{current.title}</h2><p>{current.description}</p><div className="welcomeProgress">{steps.map((item, index) => <span key={item.title} className={index === step ? 'active' : index < step ? 'done' : ''} />)}</div><div className="welcomeActions"><button type="button" className="welcomeSkip" onClick={finish}>Skip tour</button>{step < steps.length - 1 ? <button type="button" className="welcomeNext" onClick={() => setStep((value) => value + 1)}>Next <ArrowRight size={16} /></button> : <button type="button" className="welcomeNext" onClick={finish}>Open my workspace <ArrowRight size={16} /></button>}</div></div></div></div>
}
