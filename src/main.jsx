import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ChevronDown, Eye, EyeOff, Menu, Minus, Plus, X } from 'lucide-react'
import './styles.css'

const videoUrl = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260803_192301_9231ed6b-c55c-4a48-909c-4ebe11cf2e11.mp4'
const links = ['Features', 'For Students', 'For Universities', 'Pricing', 'FAQ']

async function readApiResponse(response, fallbackMessage) {
  const body = await response.text()
  let result = {}
  if (body.trim()) {
    try { result = JSON.parse(body) } catch { /* The server returned a non-JSON response. */ }
  }
  if (!response.ok) {
    const isLocalApiUnavailable = window.location.hostname === 'localhost' && !body.trim()
    throw new Error(result.error || (isLocalApiUnavailable ? 'Local API routes are not running. Start the app with “npm run dev:vercel”.' : fallbackMessage))
  }
  return result
}

function Logo() { return <a className="logo" href="#top" aria-label="Return to Univo home" onClick={(e) => { e.preventDefault(); window.scrollTo({ top:0, behavior:'smooth' }) }}><svg className="logoMark" viewBox="0 0 40 32" aria-hidden="true"><path className="capTop" d="M2 11.5 20 3l18 8.5L20 20 2 11.5Z" /><path className="capBase" d="M9 15.5v6.2c0 3.3 4.9 6.3 11 6.3s11-3 11-6.3v-6.2l-11 5.2-11-5.2Z" /><path className="capLine" d="M35 13v8" /><circle className="capDot" cx="35" cy="23" r="1.8" /></svg><span>Univo</span></a> }
function CTA({ className='', onClick }) { return <button type="button" className={`cta ${className}`} onClick={onClick}>Sign up</button> }

const faqs = [
  ['What can I plan with Univo?', 'You can organize university research, applications, entrance exams, deadlines, and the next steps in your college journey.'],
  ['Can I compare different universities?', 'Yes. Univo helps you shortlist and compare universities and courses so your options are easier to understand.'],
  ['Is Univo useful if I am still exploring?', 'Absolutely. Start with your interests and goals, then use Univo to turn early research into a clear plan.'],
  ['Can I track application deadlines?', 'Yes. Keep important dates, requirements, and tasks together so nothing important slips through the cracks.'],
  ['Is Univo free to get started?', 'You can create an account and begin organizing your college plans right away.'],
]

function FAQSection() { const [active, setActive] = useState(null); return <section className="faqSection" id="faq"><div className="faqIntro"><span className="eyebrow">Frequently asked questions</span><h2>Everything you need to know.</h2><p>Clear answers for a clearer college journey.</p></div><div className="faqList">{faqs.map(([question, answer], index) => <div className={`faqItem ${active === index ? 'active' : ''}`} key={question}><button className="faqQuestion" onClick={() => setActive(active === index ? null : index)}><span className="faqIndex">{String(index + 1).padStart(2, '0')}</span><span>{question}</span>{active === index ? <Minus size={20} /> : <Plus size={20} />}</button>{active === index && <div className="faqAnswer"><p>{answer}</p></div>}</div>)}</div></section> }

function TermsModal({ onClose }) { return <div className="termsOverlay" onClick={onClose}><article className="termsModal" role="dialog" aria-modal="true" aria-labelledby="termsTitle" onClick={(e) => e.stopPropagation()}><button className="modalClose" onClick={onClose} aria-label="Close terms">×</button><span className="eyebrow">Univo legal</span><h2 id="termsTitle">Terms of Service</h2><p className="termsUpdated">Last updated: August 2026</p><div className="termsBody"><h3>Using Univo</h3><p>Univo helps students organize university research, applications, deadlines, and planning tasks. Use the service responsibly and provide accurate information.</p><h3>Your account</h3><p>You are responsible for keeping your login details secure and for activity on your account. Do not share your password or use another person’s account.</p><h3>Your plans and content</h3><p>You keep ownership of the information you add to Univo. We use it only to provide and improve your planning experience.</p><h3>Acceptable use</h3><p>Do not misuse, disrupt, reverse-engineer, or attempt to gain unauthorized access to Univo or another user’s information.</p><h3>Contact</h3><p>Questions about these terms? Contact us at <a href="mailto:hello@univo.app">hello@univo.app</a>.</p></div><button className="termsClose" onClick={onClose}>I understand</button></article></div> }
function AboutModal({ onClose }) { return <div className="termsOverlay" onClick={onClose}><article className="termsModal aboutModal" role="dialog" aria-modal="true" aria-labelledby="aboutTitle" onClick={(e) => e.stopPropagation()}><button className="modalClose" onClick={onClose} aria-label="Close about Univo">×</button><span className="eyebrow">The Univo story</span><h2 id="aboutTitle">College planning should feel clear, not chaotic.</h2><div className="termsBody"><p className="aboutLead">Univo started from a simple frustration: students are expected to make life-changing choices while their research, deadlines, and next steps are scattered everywhere.</p><div className="aboutHighlights"><div><span>01</span><strong>Explore with intent</strong><p>Discover courses and universities that fit your ambitions—not just the loudest options.</p></div><div><span>02</span><strong>Organize the details</strong><p>Keep requirements, entrance exams, applications, and deadlines in one calm workspace.</p></div><div><span>03</span><strong>Decide with confidence</strong><p>Turn research into a practical next step and move forward without the last-minute scramble.</p></div></div><h3>Built around students</h3><p>Univo is designed for the real college journey: uncertain beginnings, changing priorities, and many small decisions that add up to a future.</p><h3>Early, focused, and honest</h3><p>We are building with students who want more confidence and less stress. No noise—just thoughtful tools for a clearer path forward.</p></div><button className="termsClose" onClick={onClose}>Back to Univo</button></article></div> }

function LoginModal({ onClose, initialEmail = '', onAuthenticated }) {
  const [email, setEmail] = useState(initialEmail)
  const [passwordStep, setPasswordStep] = useState(false)
  const [createStep, setCreateStep] = useState(false)
  const [otpStep, setOtpStep] = useState(false)
  const [newUser, setNewUser] = useState(false)
  const [loginMode, setLoginMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [createPassword, setCreatePassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [otp, setOtp] = useState('')
  const [verificationToken, setVerificationToken] = useState('')
  const [otpError, setOtpError] = useState('')
  const [sendingOtp, setSendingOtp] = useState(false)
  const [loginPassword, setLoginPassword] = useState('')
  const checkEmail = (e) => {
    e.preventDefault()
    const normalized = email.trim().toLowerCase()
    if (!normalized) return
    setEmail(normalized)
    if (loginMode) setPasswordStep(true)
    else setCreateStep(true)
    setPasswordError('')
  }
  const createAccount = async () => {
    const normalized = email.trim().toLowerCase()
    if (createPassword.length < 8) return setPasswordError('Use at least 8 characters.')
    if (!/[A-Z]/.test(createPassword) || !/[a-z]/.test(createPassword) || !/\d/.test(createPassword)) return setPasswordError('Use uppercase, lowercase, and a number.')
    setSendingOtp(true)
    setPasswordError('')
    try {
      const response = await fetch('/api/send-otp', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:normalized }) })
      const result = await readApiResponse(response, 'Unable to send the verification code. Please try again.')
      setVerificationToken(result.verificationToken || '')
      setCreateStep(false)
      setOtpStep(true)
    } catch (error) { setPasswordError(error.message) } finally { setSendingOtp(false) }
  }
  const verifyAccount = async (e) => {
    e.preventDefault()
    setOtpError('')
    try {
      const response = await fetch('/api/verify-otp', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email, code:otp, verificationToken }) })
      await readApiResponse(response, 'Invalid verification code.')
      const normalized = email.trim().toLowerCase()
      const users = JSON.parse(localStorage.getItem('univoUsers') || '[]')
      localStorage.setItem('univoUsers', JSON.stringify([...users.filter((user) => (typeof user === 'string' ? user : user.email) !== normalized), { email:normalized, password:createPassword }]))
      setOtpStep(false)
      onAuthenticated(normalized)
    } catch (error) { setOtpError(error.message) }
  }
  const login = (e) => { e.preventDefault(); const user = JSON.parse(localStorage.getItem('univoUsers') || '[]').find((item) => item.email === email && item.password === loginPassword); if (user) onAuthenticated(email); else setPasswordError('Incorrect password. Please try again.') }
  return <div className="loginOverlay" onClick={onClose}><div className="loginModal" role="dialog" aria-modal="true" aria-labelledby="loginTitle" onClick={(e) => e.stopPropagation()}><button className="modalClose" onClick={onClose} aria-label="Close signup">×</button><div className="modalLogo"><svg className="logoMark" viewBox="0 0 40 32" aria-hidden="true"><path className="capTop" d="M2 11.5 20 3l18 8.5L20 20 2 11.5Z" /><path className="capBase" d="M9 15.5v6.2c0 3.3 4.9 6.3 11 6.3s11-3 11-6.3v-6.2l-11 5.2-11-5.2Z" /><path className="capLine" d="M35 13v8" /><circle className="capDot" cx="35" cy="23" r="1.8" /></svg></div><span className="eyebrow">{otpStep ? 'Verify your email' : createStep ? 'Create your account' : passwordStep ? 'Welcome back' : loginMode ? 'Log in to Univo' : 'Sign up for Univo'}</span><h2 id="loginTitle">{otpStep ? 'Enter your 6-digit code.' : createStep ? 'Secure your account.' : passwordStep ? 'Enter your password.' : loginMode ? 'Welcome back.' : 'Start your journey.'}</h2><p className="modalSubtext">{otpStep ? `We sent a verification code to ${email}.` : createStep ? `Create a strong password for ${email || 'your new account'}.` : newUser ? 'We couldn’t find an account with this email.' : passwordStep ? `Enter the password for ${email}.` : 'Create your Univo account to start planning your college journey.'}</p>{newUser && !createStep && !otpStep ? <div className="accountPrompt"><strong>Create your Univo account</strong><span>It looks like you’re new here. Create an account to start planning your college journey.</span><button className="loginSubmit" onClick={() => { setCreateStep(true); setPasswordError('') }}>Create account</button><button className="forgotButton" onClick={() => setNewUser(false)}>Use another email</button></div> : <form className="loginForm" onSubmit={otpStep ? verifyAccount : createStep ? (e) => { e.preventDefault(); createAccount() } : passwordStep ? login : checkEmail}>{!passwordStep && !createStep && !otpStep && <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" aria-label="Email address" required />}{createStep && <><div className="passwordField"><input type={showPassword ? 'text' : 'password'} value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} placeholder="Create password" aria-label="Create password" autoFocus required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div><span className="passwordHint">At least 8 characters, including uppercase, lowercase, and a number.</span>{passwordError && <span className="passwordError">{passwordError}</span>}</>}{otpStep && <><input className="otpInput" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="000000" aria-label="6-digit verification code" autoFocus required />{otpError && <span className="passwordError">{otpError}</span>}</>}{passwordStep && <div className="passwordField"><input type={showPassword ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" aria-label="Password" autoFocus required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>}<button className="loginSubmit" disabled={sendingOtp}>{sendingOtp ? 'Sending code…' : otpStep ? 'Verify email' : createStep ? 'Create account' : passwordStep ? 'Log in' : 'Continue'}</button></form>}{otpStep && <div className="createAccountLink"><button onClick={() => { setOtpStep(false); setCreateStep(true); setOtpError('') }}>Use a different email</button></div>}{!passwordStep && !newUser && !createStep && !otpStep && <div className="createAccountLink">Already have an account? <button onClick={() => { setLoginMode(true); setNewUser(false); setPasswordError('') }}>Use another email</button></div>}{passwordStep && <><button className="forgotButton">Forgot password?</button><div className="createAccountLink">New here? <button onClick={() => { setPasswordStep(false); setNewUser(true) }}>Create an account</button></div></>}</div></div>
}

function Dashboard({ email, onLogout }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [name, setName] = useState(() => localStorage.getItem(`univoProfile:${email}`) || '')
  const initials = (name || email.split('@')[0]).slice(0, 2).toUpperCase()
  const saveProfile = (e) => { e.preventDefault(); localStorage.setItem(`univoProfile:${email}`, name.trim()); setProfileOpen(false) }
  return <main className="dashboard"><header className="dashboardNav"><a className="logo" href="#dashboard"><svg className="logoMark" viewBox="0 0 40 32" aria-hidden="true"><path className="capTop" d="M2 11.5 20 3l18 8.5L20 20 2 11.5Z" /><path className="capBase" d="M9 15.5v6.2c0 3.3 4.9 6.3 11 6.3s11-3 11-6.3v-6.2l-11 5.2-11-5.2Z" /><path className="capLine" d="M35 13v8" /><circle className="capDot" cx="35" cy="23" r="1.8" /></svg><span>Univo</span></a><div className="dashboardActions"><button className="profileTrigger" onClick={() => setProfileOpen(!profileOpen)}><i>{initials}</i><span>{name || email}</span></button><button onClick={onLogout}>Log out</button></div></header><section className="dashboardHero"><span className="eyebrow">Your workspace</span><h1>Make your next move<br /><em>feel clear.</em></h1><p>Welcome back. Keep your college plans, deadlines, and decisions moving forward.</p></section><section className="dashboardGrid"><article className="dashboardCard dashboardFocus"><span className="cardLabel">Next up</span><h2>Build your college shortlist.</h2><p>Start with the courses and universities that match where you want to go.</p><button className="dashboardButton">Start planning <span>→</span></button></article><article className="dashboardCard"><span className="cardLabel">Your progress</span><strong className="progressValue">0%</strong><p>Your journey is just getting started.</p><div className="progressTrack"><i /></div></article><article className="dashboardCard"><span className="cardLabel">Quick actions</span><button className="quickAction">＋ Add a university</button><button className="quickAction">＋ Track a deadline</button><button className="quickAction">＋ Create a task</button></article></section>{profileOpen && <div className="profileOverlay" onClick={() => setProfileOpen(false)}><form className="profilePanel" onSubmit={saveProfile} onClick={(e) => e.stopPropagation()}><button type="button" className="profileClose" onClick={() => setProfileOpen(false)}>×</button><span className="eyebrow">Your account</span><div className="profileAvatar">{initials}</div><h2>Profile</h2><p className="profileEmail">{email}</p><label>Display name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></label><button className="profileSave">Save profile</button></form></div>}</main>
}

function App() {
  const [open, setOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [activeUser, setActiveUser] = useState(() => localStorage.getItem('univoActiveUser') || '')
  const [heroEmail, setHeroEmail] = useState('')
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [open])
  if (activeUser) return <Dashboard email={activeUser} onLogout={() => { localStorage.removeItem('univoActiveUser'); setActiveUser('') }} />
  return <>
  <section className="hero" id="top">
    <video className="video" autoPlay loop muted playsInline src={videoUrl} />
    <div className="content">
      <nav className="nav"><Logo /><div className="desktopNav"><div className="navPill">{links.map((link) => <a key={link} href={link === 'FAQ' ? '#faq' : '#'} className="navLink">{link}{link === 'For Universities' && <ChevronDown size={14} />}</a>)}</div></div><button className="menuButton" onClick={() => setOpen(!open)} aria-label="Toggle menu"><Menu className={open ? 'icon hiddenIcon' : 'icon'} size={22} /><X className={open ? 'icon' : 'icon hiddenIcon'} size={22} /></button></nav>
      <div className={`backdrop ${open ? 'shown' : ''}`} onClick={() => setOpen(false)} /><aside className={`drawer ${open ? 'open' : ''}`}><div className="drawerLinks">{links.map((link, i) => <a href={link === 'FAQ' ? '#faq' : '#'} key={link} onClick={() => setOpen(false)} style={{transitionDelay: open ? `${(i+1)*60}ms` : '0ms'}}>{link}{link === 'For Universities' && <ChevronDown size={18} />}</a>)}</div><CTA className="drawerCta" onClick={() => { setOpen(false); setLoginOpen(true) }} /></aside>
      <main className="main"><div className="copy"><h1>Plan your college journey with confidence</h1><form className="emailForm" onSubmit={(e) => e.preventDefault()}><input type="email" value={heroEmail} onChange={(e) => setHeroEmail(e.target.value)} placeholder="Enter your email" aria-label="Email address" /><CTA onClick={() => setLoginOpen(true)} /></form></div><div className="cards"><div className="card stats"><div className="statNumber">50+</div><p>Students use Univo to stay on top of applications, deadlines, and campus plans.</p></div><div className="card testimonial"><div className="company"><span className="companyMark">U</span><span>Univo Students</span></div><p className="quote">"Univo turned my scattered college plans into one clear path. I always know what to work on next."</p><div className="person"><img src="https://i.pravatar.cc/72?img=12" alt="Siddharth Agarwal" /><div><strong>Siddharth Agarwal</strong><span>Second-year student</span></div></div></div></div></main>
    </div>
  </section>
  <section className="infoSection featuresSection"><div className="sectionIntro"><span className="eyebrow">Everything in one place</span><h2>Make every college decision feel simpler.</h2><p>Univo brings your plans, deadlines, and next steps together so you can focus on building your future.</p></div><div className="featureGrid"><article><span className="featureNumber">01</span><h3>Plan your path</h3><p>Compare courses, shortlist universities, and create a plan that fits your goals.</p></article><article><span className="featureNumber">02</span><h3>Stay ahead</h3><p>Track applications, entrance exams, and important deadlines without the last-minute rush.</p></article><article><span className="featureNumber">03</span><h3>Know your next step</h3><p>Get a clear view of what to do next, from research to enrollment and beyond.</p></article></div></section>
  <section className="infoSection processSection"><div className="processCopy"><span className="eyebrow">Your journey, organized</span><h2>From “where do I start?” to “I’m ready.”</h2><p>Whether you are exploring options or preparing to apply, Univo helps turn an overwhelming process into steady progress.</p><button className="darkButton">Explore Univo</button></div><div className="steps"><div><span>1</span><p><strong>Discover</strong><br />Find courses and universities that match your ambitions.</p></div><div><span>2</span><p><strong>Organize</strong><br />Keep requirements, tasks, and dates together in one workspace.</p></div><div><span>3</span><p><strong>Move forward</strong><br />Take confident action with a plan made for you.</p></div></div></section>
  <FAQSection />
  <footer className="footer"><div className="footerTop"><div className="footerBrand"><div className="logo"><svg className="logoMark" viewBox="0 0 40 32" aria-hidden="true"><path className="capTop" d="M2 11.5 20 3l18 8.5L20 20 2 11.5Z" /><path className="capBase" d="M9 15.5v6.2c0 3.3 4.9 6.3 11 6.3s11-3 11-6.3v-6.2l-11 5.2-11-5.2Z" /><path className="capLine" d="M35 13v8" /><circle className="capDot" cx="35" cy="23" r="1.8" /></svg><span>Univo</span></div><p>Your clear path through college applications, deadlines, and big decisions.</p><button className="footerLogin" onClick={() => setLoginOpen(true)}>Sign up for Univo</button></div><div className="footerColumn"><span className="footerHeading">Product</span><a href="#top">Home</a><a href="#faq">FAQ</a><a href="#top">Features</a><a href="#top">Pricing</a></div><div className="footerColumn"><span className="footerHeading">For students</span><a href="#top">Plan your path</a><a href="#top">Track deadlines</a><a href="#top">Explore universities</a><a href="#faq">Get help</a></div><div className="footerColumn"><span className="footerHeading">Company</span><button className="footerLinkButton" onClick={() => setAboutOpen(true)}>About Univo</button><button className="footerLinkButton" onClick={() => setTermsOpen(true)}>Terms of Service</button><a href="mailto:hello@univo.app">Contact us</a><a href="#top">Privacy</a></div></div><div className="footerBottom"><span>© 2026 Univo. Built for students.</span><span className="statusPill"><i /> All systems operational</span></div></footer>
  {loginOpen && <LoginModal initialEmail={heroEmail} onClose={() => setLoginOpen(false)} onAuthenticated={(email) => { localStorage.setItem('univoActiveUser', email); setActiveUser(email); setLoginOpen(false) }} />}
  {termsOpen && <TermsModal onClose={() => setTermsOpen(false)} />}
  {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
  </>
}
createRoot(document.getElementById('root')).render(<App />)
