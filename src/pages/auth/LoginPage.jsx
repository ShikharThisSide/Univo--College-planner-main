import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import NovaBurst from '../../components/brand/NovaBurst'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage({ embedded = false, initialPath = 'student' } = {}) {
  const [searchParams] = useSearchParams()
  const signupPath = searchParams.get('path') || initialPath || 'student'
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const isUniversity = signupPath === 'university'
  const loginHref = (path) => embedded ? `/?login=${path}` : `/login?path=${path}`

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return setError('Enter your email')
    if (mode === 'create' && password.length < 8) return setError('Password must be at least 8 characters')
    if (mode === 'create' && password !== confirmPassword) return setError('Passwords do not match')
    const path = login({ email, password, signupPath })
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
        <h1 className="font-display text-3xl font-bold mt-2 mb-1">
          {mode === 'create' ? 'Create your account.' : isUniversity ? 'Set up your campus.' : 'Welcome back.'}
        </h1>
        <p className="text-white/45 text-sm mb-6">
          {isUniversity
            ? 'One login for admins, teachers, and students — role-based redirect after auth.'
            : mode === 'create' ? 'Create your personal dashboard and start planning your campus life.' : 'Sign in to your personal dashboard, notes hub, and community.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            placeholder="Email address"
            className="w-full px-4 py-3.5 rounded-xl bg-white/6 border border-white/10 text-white placeholder:text-white/35 outline-none focus:border-[var(--accent-solid)]/50 transition-colors"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3.5 pr-12 rounded-xl bg-white/6 border border-white/10 text-white placeholder:text-white/35 outline-none focus:border-[var(--accent-solid)]/50 transition-colors"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {mode === 'create' && (
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full px-4 py-3.5 rounded-xl bg-white/6 border border-white/10 text-white placeholder:text-white/35 outline-none focus:border-[var(--accent-solid)]/50 transition-colors"
            />
          )}
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" className="w-full py-3.5 rounded-full univo-gradient-bg font-semibold text-sm hover:opacity-90 transition-opacity">
            {mode === 'create' ? 'Create account' : 'Continue'}
          </button>
        </form>

        <p className="text-center text-xs text-white/35 mt-6">
          {isUniversity ? (
            <>Individual student? <Link to={loginHref('student')} className="text-[var(--accent-solid)] hover:underline">Sign in here</Link></>
          ) : mode === 'create' ? (
            <>Already have an account? <button type="button" onClick={() => { setMode('login'); setError('') }} className="cursor-pointer text-[var(--accent-solid)] hover:underline">Sign in</button></>
          ) : (
            <>Don&apos;t have an account? <button type="button" onClick={() => { setMode('create'); setError('') }} className="cursor-pointer text-[var(--accent-solid)] hover:underline">Create one</button></>
          )}
        </p>
      </motion.div>
    </div>
  )
}
