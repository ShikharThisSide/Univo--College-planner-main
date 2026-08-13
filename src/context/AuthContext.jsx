import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import { DEMO_USERS, ROLES } from '../lib/constants'
import { getDashboardPath, inferRoleFromEmail } from '../lib/rbac'
import { fetchCloudUserData, restoreUserDataToDevice, pushUserDataToCloud } from '../lib/cloudSync'

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

  // Silent sync on initial startup
  useEffect(() => {
    if (!user?.email) return
    fetchCloudUserData(user.email).then((cloudData) => {
      if (cloudData) {
        restoreUserDataToDevice(cloudData)
      }
    })
  }, [user?.email])

  const login = useCallback(({ email, password, name: providedName = '', signupPath = 'student', demoRole = null, roleOverride = null }) => {
    let nextUser

    if (demoRole && DEMO_USERS[demoRole]) {
      nextUser = { ...DEMO_USERS[demoRole], id: `demo-${demoRole}` }
    } else {
      const normalizedEmail = email.trim().toLowerCase()
      let existingAccount = null
      try {
        const accounts = JSON.parse(localStorage.getItem('univoAccounts') || '{}') || {}
        existingAccount = accounts[normalizedEmail] || null
      } catch {}

      const role = roleOverride || existingAccount?.role || inferRoleFromEmail(normalizedEmail, signupPath)
      const name = existingAccount?.name || providedName.trim() || normalizedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

      nextUser = {
        id: normalizedEmail,
        email: normalizedEmail,
        name,
        role,
        avatar: existingAccount?.avatar,
        avatarImage: existingAccount?.avatarImage,
        universityId: role === ROLES.STUDENT_INDIVIDUAL ? null : 'xyz-univ',
        department: role === ROLES.TEACHER || role === ROLES.STUDENT_INSTITUTIONAL ? 'Computer Science' : undefined,
      }

      // Save account to univoAccounts registry
      try {
        const accounts = JSON.parse(localStorage.getItem('univoAccounts') || '{}') || {}
        accounts[normalizedEmail] = { ...(accounts[normalizedEmail] || {}), ...nextUser, lastActiveAt: Date.now() }
        localStorage.setItem('univoAccounts', JSON.stringify(accounts))
      } catch {}

      // Trigger background cloud sync
      fetchCloudUserData(normalizedEmail).then((cloudData) => {
        if (cloudData) {
          restoreUserDataToDevice(cloudData)
        }
        pushUserDataToCloud(normalizedEmail)
      })
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

      try {
        const accounts = JSON.parse(localStorage.getItem('univoAccounts') || '{}') || {}
        accounts[nextUser.email] = { ...(accounts[nextUser.email] || {}), ...nextUser, lastActiveAt: Date.now() }
        localStorage.setItem('univoAccounts', JSON.stringify(accounts))
      } catch {}

      pushUserDataToCloud(nextUser.email)
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
