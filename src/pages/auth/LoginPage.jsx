import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import NovaBurst from '../../components/brand/NovaBurst'
import { useAuth } from '../../context/AuthContext'
import { DEMO_USERS } from '../../lib/constants'

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const signupPath = searchParams.get('path') || 'student'
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const isUniversity = signupPath === 'university'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return setError('Enter your email')
    const path = login({ email, password, signupPath })
    navigate(path)
  }

  const handleDemo = (role) => {
    const path = login({ demoRole: role })
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center p-4 noise-bg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] univo-gradient-bg pointer-events-none" style={{ transform: 'translate(30%, -30%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md glass-panel rounded-3xl p-8 relative"
      >
        <Link to="/" className="inline-block mb-6">
          <NovaBurst size={36} animate />
        </Link>

        <span className="text-[10px] uppercase tracking-widest text-[var(--accent-solid)] font-bold">
          {isUniversity ? 'University workspace' : 'Student account'}
        </span>
        <h1 className="font-display text-3xl font-bold mt-2 mb-1">
          {isUniversity ? 'Set up your campus.' : 'Welcome back.'}
        </h1>
        <p className="text-white/45 text-sm mb-6">
          {isUniversity
            ? 'One login for admins, teachers, and students — role-based redirect after auth.'
            : 'Sign in to your personal dashboard, notes hub, and community.'}
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
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" className="w-full py-3.5 rounded-full univo-gradient-bg font-semibold text-sm hover:opacity-90 transition-opacity">
            Continue
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/8">
          <p className="text-[10px] uppercase tracking-wider text-white/30 mb-3 font-semibold">Quick demo — all four roles</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(DEMO_USERS).map(([key, user]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleDemo(key)}
                className="px-3 py-2 rounded-xl border border-white/8 text-xs hover:bg-white/6 hover:border-white/15 transition-all text-left"
              >
                <span className="block font-medium capitalize">{key.replace('_', ' ')}</span>
                <span className="text-white/35 text-[10px]">{user.name}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-white/35 mt-6">
          {isUniversity ? (
            <>Individual student? <Link to="/login?path=student" className="text-[var(--accent-solid)] hover:underline">Sign in here</Link></>
          ) : (
            <>University admin? <Link to="/login?path=university" className="text-[var(--accent-solid)] hover:underline">University login</Link></>
          )}
        </p>
      </motion.div>
    </div>
  )
}
