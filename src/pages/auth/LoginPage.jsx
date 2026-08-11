import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, GraduationCap, BookOpen, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { AnimatePresence, m } from 'motion/react'
import NovaBurst from '../../components/brand/NovaBurst'
import { useAuth } from '../../context/AuthContext'

function OtpBoxes({ value, onChange }) {
  const inputRefs = useRef([])
  const digits = Array.from({ length: 6 }, (_, index) => value[index] || '')
  const updateDigits = (startIndex, rawValue) => {
    const incoming = rawValue.replace(/\D/g, '').slice(0, 6 - startIndex).split('')
    const nextDigits = Array.from({ length: 6 }, (_, index) => value[index] || '')
    incoming.forEach((digit, offset) => { nextDigits[startIndex + offset] = digit })
    onChange(nextDigits.join(''))
    const nextIndex = Math.min(startIndex + incoming.length, 5)
    requestAnimationFrame(() => inputRefs.current[nextIndex]?.focus())
  }

  return (
    <m.div className="grid grid-cols-6 gap-2" aria-label="Verification code" initial={false} animate={{ x: 0 }}>
      {digits.map((digit, index) => (
        <div key={index} className="relative w-full aspect-square">
          <input
            ref={(element) => { inputRefs.current[index] = element }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => updateDigits(index, e.target.value)}
            onPaste={(e) => { e.preventDefault(); updateDigits(index, e.clipboardData.getData('text')) }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !digits[index] && index > 0) {
                const nextDigits = [...digits]
                nextDigits[index - 1] = ''
                onChange(nextDigits.join(''))
                requestAnimationFrame(() => inputRefs.current[index - 1]?.focus())
              }
            }}
            className="absolute inset-0 z-10 w-full rounded-xl border border-white/10 bg-white/6 text-center text-lg font-semibold text-transparent caret-transparent outline-none focus:border-[var(--accent-solid)] focus:ring-2 focus:ring-[var(--accent-solid)]/20 transition-all"
            aria-label={`Verification digit ${index + 1}`}
          />
          <span className="pointer-events-none absolute inset-0 z-20 grid place-items-center" aria-hidden="true">
            <AnimatePresence initial={false} mode="popLayout">
              {digit && (
                <m.span
                  key={`${index}-${digit}`}
                  initial={{ opacity: 0, scale: 0.8, y: 8, filter: 'blur(5px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.9, y: -5, filter: 'blur(3px)' }}
                  transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                  className="font-mono text-lg font-semibold text-white"
                >
                  {digit}
                </m.span>
              )}
            </AnimatePresence>
          </span>
        </div>
      ))}
    </m.div>
  )
}

export default function LoginPage({ embedded = false, initialPath = 'student' } = {}) {
  const [searchParams] = useSearchParams()
  const signupPath = searchParams.get('path') || initialPath || 'student'
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [universityRole, setUniversityRole] = useState(null)
  const [otp, setOtp] = useState('')
  const [enteredOtp, setEnteredOtp] = useState('')
  const [verificationToken, setVerificationToken] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('univoRememberMe') === 'true')

  const isUniversity = signupPath === 'university'
  const loginHref = (path) => embedded ? `/?login=${path}` : `/login?path=${path}`

  useEffect(() => {
    if (mode !== 'login') return
    try {
      const stored = JSON.parse(localStorage.getItem('univoRememberedCredentials') || 'null')
      if (stored) {
        setEmail(stored.email || '')
        setPassword(stored.password || '')
      }
    } catch { /* Ignore malformed remembered credentials. */ }
  }, [mode])

  useEffect(() => {
    const googleEmail = searchParams.get('google_email')
    if (!googleEmail) return
    const path = searchParams.get('path') || signupPath
    const dashboardPath = login({ email: googleEmail, name: searchParams.get('google_name') || '', signupPath: path, roleOverride: universityRole || undefined })
    navigate(dashboardPath, { replace: true })
  }, [login, navigate, searchParams, signupPath])

  const continueWithGoogle = () => {
    window.location.assign(`/api/auth/google?path=${encodeURIComponent(signupPath)}`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return setError('Enter your email')
    const normalizedEmail = email.trim().toLowerCase()
    const accounts = JSON.parse(localStorage.getItem('univoAccounts') || '{}')
    if (mode === 'create' && password.length < 8) return setError('Password must be at least 8 characters')
    if (mode === 'create') {
      if (!fullName.trim()) return setError('Enter your full name')
      if (accounts[normalizedEmail]) return setError('An account already exists for this email')
      if (!verificationToken) {
        try {
          const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: normalizedEmail }),
          })
          const result = await response.json()
          if (!response.ok) return setError(result.error || 'Unable to send verification code')
          setVerificationToken(result.verificationToken)
          return setNotice('Verification code sent. Check your email.')
        } catch {
          return setError('Unable to reach the email verification service. Start the app with “npm run dev:vercel”.')
        }
      }
      if (!enteredOtp.trim()) return setError('Enter the verification code')
      try {
        const response = await fetch('/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, code: enteredOtp, verificationToken }),
        })
        const result = await response.json()
        if (!response.ok) return setError(result.error || 'Invalid verification code')
      } catch {
        return setError('Unable to verify the code. Please try again.')
      }
      accounts[normalizedEmail] = { password, name: fullName.trim(), signupPath, role: universityRole || undefined }
      localStorage.setItem('univoAccounts', JSON.stringify(accounts))
      setNotice('Account created successfully. Signing you in…')
    } else if (mode === 'reset') {
      if (!accounts[normalizedEmail]) return setError('No account found for this email')
      if (!otp) {
        const generatedOtp = String(Math.floor(100000 + Math.random() * 900000))
        setOtp(generatedOtp)
        return setNotice(`Demo OTP: ${generatedOtp}`)
      }
      if (enteredOtp !== otp) return setError('Incorrect OTP')
      if (password.length < 8) return setError('New password must be at least 8 characters')
      accounts[normalizedEmail].password = password
      localStorage.setItem('univoAccounts', JSON.stringify(accounts))
      setNotice('Password updated. Signing you in…')
    } else {
      if (!accounts[normalizedEmail]) return setError('No account found. Please choose “Create one” first.')
      if (accounts[normalizedEmail].password !== password) return setError('Incorrect password')
      if (rememberMe) {
        localStorage.setItem('univoRememberMe', 'true')
        localStorage.setItem('univoRememberedCredentials', JSON.stringify({ email: normalizedEmail, password }))
      } else {
        localStorage.removeItem('univoRememberMe')
        localStorage.removeItem('univoRememberedCredentials')
      }
    }
    const path = login({ email: normalizedEmail, password, name: accounts[normalizedEmail]?.name || fullName, signupPath, roleOverride: accounts[normalizedEmail]?.role || universityRole || undefined })
    navigate(path)
  }

  return (
    <div className={`login-page ${embedded ? 'login-page-embedded' : ''} min-h-screen text-white flex items-center justify-center p-4 noise-bg relative overflow-hidden`}>
      <div className="login-orb login-orb-primary absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-30 blur-[100px] univo-gradient-bg pointer-events-none" style={{ transform: 'translate(30%, -30%)' }} />
      <div className="login-orb login-orb-secondary absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full opacity-25 blur-[110px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="login-card w-full max-w-md glass-panel rounded-3xl p-8 relative"
      >
        <Link to="/" className="login-back mb-5">
          <ArrowLeft size={15} />
          <span>Back to home</span>
        </Link>

        <div className="login-identity mb-6">
          <Link to="/" className="inline-block">
            <NovaBurst size={36} animate />
          </Link>
          <span className="text-[10px] uppercase tracking-widest text-[var(--accent-solid)] font-bold">
            {isUniversity ? 'University workspace' : 'Student account'}
          </span>
        </div>
        {isUniversity && !universityRole ? (
          <div className="profileRoleSelector">
            <h1 className="font-display text-3xl font-bold mt-2 mb-2">Choose your role.</h1>
            <p className="text-white/45 text-sm mb-7">Select how you access your university workspace.</p>
            <div className="profileRoleGrid">
              {[
                { id: 'student_institutional', label: 'Student', icon: GraduationCap, copy: 'Classes, attendance, and campus life.' },
                { id: 'teacher', label: 'Teacher', icon: BookOpen, copy: 'Teach, grade, and manage classes.' },
                { id: 'admin', label: 'Admin', icon: ShieldCheck, copy: 'Manage your university workspace.' },
              ].map(({ id, label, icon: Icon, copy }) => (
                <button key={id} type="button" className="profileRoleCard" onClick={() => setUniversityRole(id)}>
                  <span className="profileRoleIcon"><Icon size={25} /></span>
                  <span><strong>{label}</strong><small>{copy}</small></span>
                </button>
              ))}
            </div>
          </div>
        ) : <>
        <h1 className="font-display text-3xl font-bold mt-2 mb-1">
          {mode === 'create' ? 'Create your account.' : mode === 'reset' ? 'Reset your password.' : isUniversity ? 'Set up your campus.' : 'Welcome back.'}
        </h1>
        <p className="text-white/45 text-sm mb-6">
          {isUniversity
            ? 'One login for admins, teachers, and students — role-based redirect after auth.'
            : mode === 'create' ? 'Create your personal dashboard and start planning your campus life.' : mode === 'reset' ? 'Enter your email and use the OTP to choose a new password.' : 'Sign in to your personal dashboard, notes hub, and community.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'create' && (
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="w-full px-4 py-3.5 rounded-xl bg-white/6 border border-white/10 text-white placeholder:text-white/35 outline-none focus:border-[var(--accent-solid)]/50 transition-colors"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            placeholder="Email address"
            className="w-full px-4 py-3.5 rounded-xl bg-white/6 border border-white/10 text-white placeholder:text-white/35 outline-none focus:border-[var(--accent-solid)]/50 transition-colors"
          />
          {(mode !== 'reset' || otp) && (
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'reset' ? 'New password' : 'Password'}
                className="w-full px-4 py-3.5 pr-12 rounded-xl bg-white/6 border border-white/10 text-white placeholder:text-white/35 outline-none focus:border-[var(--accent-solid)]/50 transition-colors"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}
          {mode === 'login' && (
            <label className="!ml-auto !flex !w-fit !flex-none cursor-pointer items-center justify-end gap-2 text-xs text-white/50">
              <span className="whitespace-nowrap">Remember me on this device</span>
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="!m-0 shrink-0 accent-[var(--accent-solid)]" />
            </label>
          )}
          {mode === 'reset' && otp && (
            <OtpBoxes value={enteredOtp} onChange={setEnteredOtp} />
          )}
          {mode === 'create' && verificationToken && (
            <OtpBoxes value={enteredOtp} onChange={(value) => { setEnteredOtp(value); setError('') }} />
          )}
          {error && <p className="text-red-400 text-xs">{error}</p>}
          {notice && <p className="text-[var(--accent-solid)] text-xs">{notice}</p>}
          <button type="submit" className="w-full py-3.5 rounded-full univo-gradient-bg font-semibold text-sm hover:opacity-90 transition-opacity">
            {mode === 'create' ? 'Create account' : mode === 'reset' ? (otp ? 'Update password' : 'Send OTP') : 'Continue'}
          </button>
          {mode === 'login' && (
            <>
              <div className="flex items-center gap-3 py-1 text-[10px] uppercase tracking-widest text-white/25">
                <span className="h-px flex-1 bg-white/10" />
                <span>or</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <button
                type="button"
                onClick={continueWithGoogle}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-full bg-white text-[#202124] font-semibold text-sm cursor-pointer hover:bg-white/90 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.26Z" />
                  <path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.55 0-4.71-1.72-5.49-4.03H3.27v2.53A9.74 9.74 0 0 0 12 21.5Z" />
                  <path fill="#FBBC05" d="M6.51 13.58A5.86 5.86 0 0 1 6.2 12c0-.55.1-1.08.31-1.58V7.89H3.27A9.5 9.5 0 0 0 2.25 12c0 1.48.35 2.87 1.02 4.11l3.24-2.53Z" />
                  <path fill="#EA4335" d="M12 6.39c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.48 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.73 5.39l3.24 2.53C7.29 8.11 9.45 6.39 12 6.39Z" />
                </svg>
                Continue with Google
              </button>
            </>
          )}
        </form>

        <p className="text-center text-xs text-white/35 mt-6">
          {isUniversity ? (
            <>Individual student? <Link to={loginHref('student')} className="text-[var(--accent-solid)] hover:underline">Sign in here</Link></>
          ) : mode === 'create' ? (
            <>Already have an account? <button type="button" onClick={() => { setMode('login'); setError('') }} className="cursor-pointer text-[var(--accent-solid)] hover:underline">Sign in</button></>
          ) : mode === 'reset' ? (
            <>Remembered your password? <button type="button" onClick={() => { setMode('login'); setOtp(''); setEnteredOtp(''); setError(''); setNotice('') }} className="cursor-pointer text-[var(--accent-solid)] hover:underline">Sign in</button></>
          ) : (
            <>Don&apos;t have an account? <button type="button" onClick={() => { setMode('create'); setError('') }} className="cursor-pointer text-[var(--accent-solid)] hover:underline">Create one</button></>
          )}
        </p>
        </>}
        {mode === 'login' && error === 'Incorrect password' && (
          <button type="button" onClick={() => { setMode('reset'); setError(''); setNotice('') }} className="login-forgot cursor-pointer">Forgot password?</button>
        )}
      </motion.div>
    </div>
  )
}
