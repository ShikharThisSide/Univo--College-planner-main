import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ChevronDown, Eye, EyeOff, Menu, X } from 'lucide-react'
import './styles.css'

const videoUrl = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260803_192301_9231ed6b-c55c-4a48-909c-4ebe11cf2e11.mp4'
const links = ['Features', 'For Students', 'For Universities', 'Pricing']

function Logo() { return <a className="logo" href="#top" aria-label="Return to Univo home" onClick={(e) => { e.preventDefault(); window.scrollTo({ top:0, behavior:'smooth' }) }}><svg className="logoMark" viewBox="0 0 40 32" aria-hidden="true"><path className="capTop" d="M2 11.5 20 3l18 8.5L20 20 2 11.5Z" /><path className="capBase" d="M9 15.5v6.2c0 3.3 4.9 6.3 11 6.3s11-3 11-6.3v-6.2l-11 5.2-11-5.2Z" /><path className="capLine" d="M35 13v8" /><circle className="capDot" cx="35" cy="23" r="1.8" /></svg><span>Univo</span></a> }
function CTA({ className='', onClick }) { return <button type="button" className={`cta ${className}`} onClick={onClick}>Login</button> }

function LoginModal({ onClose, initialEmail = '' }) {
  const [email, setEmail] = useState(initialEmail)
  const [passwordStep, setPasswordStep] = useState(false)
  const [newUser, setNewUser] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const checkEmail = (e) => {
    e.preventDefault()
    const normalized = email.trim().toLowerCase()
    if (!normalized) return
    const users = JSON.parse(localStorage.getItem('univoUsers') || '[]')
    if (users.includes(normalized)) setPasswordStep(true)
    else setNewUser(true)
  }
  const createAccount = () => {
    const normalized = email.trim().toLowerCase()
    const users = JSON.parse(localStorage.getItem('univoUsers') || '[]')
    localStorage.setItem('univoUsers', JSON.stringify([...new Set([...users, normalized])]))
    setNewUser(false)
    setPasswordStep(true)
  }
  return <div className="loginOverlay" onClick={onClose}><div className="loginModal" role="dialog" aria-modal="true" aria-labelledby="loginTitle" onClick={(e) => e.stopPropagation()}><button className="modalClose" onClick={onClose} aria-label="Close login">×</button><div className="modalLogo"><svg className="logoMark" viewBox="0 0 40 32" aria-hidden="true"><path className="capTop" d="M2 11.5 20 3l18 8.5L20 20 2 11.5Z" /><path className="capBase" d="M9 15.5v6.2c0 3.3 4.9 6.3 11 6.3s11-3 11-6.3v-6.2l-11 5.2-11-5.2Z" /><path className="capLine" d="M35 13v8" /><circle className="capDot" cx="35" cy="23" r="1.8" /></svg></div><span className="eyebrow">{passwordStep ? 'Welcome back' : 'Let’s get you started'}</span><h2 id="loginTitle">{passwordStep ? 'Enter your password.' : 'Continue your journey.'}</h2><p className="modalSubtext">{newUser ? 'We couldn’t find an account with this email.' : passwordStep ? `Enter the password for ${email}.` : 'Use your email to log in or create your Univo account.'}</p>{newUser ? <div className="accountPrompt"><strong>Create your Univo account</strong><span>It looks like you’re new here. Create an account to start planning your college journey.</span><button className="loginSubmit" onClick={createAccount}>Create account</button><button className="forgotButton" onClick={() => setNewUser(false)}>Use another email</button></div> : <form className="loginForm" onSubmit={passwordStep ? (e) => e.preventDefault() : checkEmail}>{!passwordStep && <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" aria-label="Email address" required />}{passwordStep && <div className="passwordField"><input type={showPassword ? 'text' : 'password'} placeholder="Password" aria-label="Password" autoFocus required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>}<button className="loginSubmit">{passwordStep ? 'Log in' : 'Continue'}</button></form>}{!passwordStep && !newUser && <div className="createAccountLink">New here? <button onClick={() => setNewUser(true)}>Create an account</button></div>}{passwordStep && <button className="forgotButton">Forgot password?</button>}</div></div>
}

function App() {
  const [open, setOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [heroEmail, setHeroEmail] = useState('')
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [open])
  return <>
  <section className="hero" id="top">
    <video className="video" autoPlay loop muted playsInline src={videoUrl} />
    <div className="content">
      <nav className="nav"><Logo /><div className="desktopNav"><div className="navPill">{links.map((link) => <a key={link} href="#" className="navLink">{link}{link === 'For Universities' && <ChevronDown size={14} />}</a>)}</div></div><button className="menuButton" onClick={() => setOpen(!open)} aria-label="Toggle menu"><Menu className={open ? 'icon hiddenIcon' : 'icon'} size={22} /><X className={open ? 'icon' : 'icon hiddenIcon'} size={22} /></button></nav>
      <div className={`backdrop ${open ? 'shown' : ''}`} onClick={() => setOpen(false)} /><aside className={`drawer ${open ? 'open' : ''}`}><div className="drawerLinks">{links.map((link, i) => <a href="#" key={link} style={{transitionDelay: open ? `${(i+1)*60}ms` : '0ms'}}>{link}{link === 'For Universities' && <ChevronDown size={18} />}</a>)}</div><CTA className="drawerCta" onClick={() => { setOpen(false); setLoginOpen(true) }} /></aside>
      <main className="main"><div className="copy"><h1>Plan your college journey with confidence</h1><form className="emailForm" onSubmit={(e) => e.preventDefault()}><input type="email" value={heroEmail} onChange={(e) => setHeroEmail(e.target.value)} placeholder="Enter your email" aria-label="Email address" /><CTA onClick={() => setLoginOpen(true)} /></form></div><div className="cards"><div className="card stats"><div className="statNumber">50+</div><p>Students use Univo to stay on top of applications, deadlines, and campus plans.</p></div><div className="card testimonial"><div className="company"><span className="companyMark">U</span><span>Univo Students</span></div><p className="quote">"Univo turned my scattered college plans into one clear path. I always know what to work on next."</p><div className="person"><img src="https://i.pravatar.cc/72?img=12" alt="Siddharth Agarwal" /><div><strong>Siddharth Agarwal</strong><span>Second-year student</span></div></div></div></div></main>
    </div>
  </section>
  <section className="infoSection featuresSection"><div className="sectionIntro"><span className="eyebrow">Everything in one place</span><h2>Make every college decision feel simpler.</h2><p>Univo brings your plans, deadlines, and next steps together so you can focus on building your future.</p></div><div className="featureGrid"><article><span className="featureNumber">01</span><h3>Plan your path</h3><p>Compare courses, shortlist universities, and create a plan that fits your goals.</p></article><article><span className="featureNumber">02</span><h3>Stay ahead</h3><p>Track applications, entrance exams, and important deadlines without the last-minute rush.</p></article><article><span className="featureNumber">03</span><h3>Know your next step</h3><p>Get a clear view of what to do next, from research to enrollment and beyond.</p></article></div></section>
  <section className="infoSection processSection"><div className="processCopy"><span className="eyebrow">Your journey, organized</span><h2>From “where do I start?” to “I’m ready.”</h2><p>Whether you are exploring options or preparing to apply, Univo helps turn an overwhelming process into steady progress.</p><button className="darkButton">Explore Univo</button></div><div className="steps"><div><span>1</span><p><strong>Discover</strong><br />Find courses and universities that match your ambitions.</p></div><div><span>2</span><p><strong>Organize</strong><br />Keep requirements, tasks, and dates together in one workspace.</p></div><div><span>3</span><p><strong>Move forward</strong><br />Take confident action with a plan made for you.</p></div></div></section>
  <footer className="footer"><div className="logo"><svg className="logoMark" viewBox="0 0 40 32" aria-hidden="true"><path className="capTop" d="M2 11.5 20 3l18 8.5L20 20 2 11.5Z" /><path className="capBase" d="M9 15.5v6.2c0 3.3 4.9 6.3 11 6.3s11-3 11-6.3v-6.2l-11 5.2-11-5.2Z" /><path className="capLine" d="M35 13v8" /><circle className="capDot" cx="35" cy="23" r="1.8" /></svg><span>Univo</span></div><span>Plan boldly. Move forward.</span></footer>
  {loginOpen && <LoginModal initialEmail={heroEmail} onClose={() => setLoginOpen(false)} />}
  </>
}
createRoot(document.getElementById('root')).render(<App />)
