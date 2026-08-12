import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { DEMO_USERS, ROLES } from '../lib/constants'
import { getDashboardPath, inferRoleFromEmail } from '../lib/rbac'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('univoUser')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = useCallback(({ email, password, name: providedName = '', signupPath = 'student', demoRole = null, roleOverride = null }) => {
    let nextUser

    if (demoRole && DEMO_USERS[demoRole]) {
      nextUser = { ...DEMO_USERS[demoRole], id: `demo-${demoRole}` }
    } else {
      const role = roleOverride || inferRoleFromEmail(email, signupPath)
      const name = providedName.trim() || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      nextUser = {
        id: email,
        email,
        name,
        role,
        universityId: role === ROLES.STUDENT_INDIVIDUAL ? null : 'xyz-univ',
        department: role === ROLES.TEACHER || role === ROLES.STUDENT_INSTITUTIONAL ? 'Computer Science' : undefined,
      }
    }

    localStorage.setItem('univoUser', JSON.stringify(nextUser))
    setUser(nextUser)
    return getDashboardPath(nextUser.role)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('univoUser')
    localStorage.removeItem('univoActiveUser')
    setUser(null)
  }, [])

  const switchDemoRole = useCallback((demoRole) => {
    if (!DEMO_USERS[demoRole]) return
    const nextUser = { ...DEMO_USERS[demoRole], id: `demo-${demoRole}` }
    localStorage.setItem('univoUser', JSON.stringify(nextUser))
    setUser(nextUser)
    return getDashboardPath(nextUser.role)
  }, [])

  const updateProfile = useCallback((changes) => {
    setUser((current) => {
      if (!current) return current
      const nextUser = { ...current, ...changes }
      localStorage.setItem('univoUser', JSON.stringify(nextUser))
      return nextUser
    })
  }, [])

  const value = useMemo(() => ({ user, login, logout, switchDemoRole, updateProfile, isAuthenticated: !!user }), [user, login, logout, switchDemoRole, updateProfile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
