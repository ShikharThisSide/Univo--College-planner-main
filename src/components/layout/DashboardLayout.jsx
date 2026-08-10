import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Search, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { NAV_BY_ROLE } from '../../lib/constants'
import { getRoleLabel } from '../../lib/rbac'
import MagneticSidebar from './MagneticSidebar'
import NotificationBell from '../ui/NotificationBell'
import ThemeSwitcher from '../ui/ThemeSwitcher'
import CommandPalette, { useCommandPalette } from '../ui/CommandPalette'

export default function DashboardLayout() {
  const { user, logout, switchDemoRole } = useAuth()
  const navigate = useNavigate()
  const { open: cmdOpen, setOpen: setCmdOpen } = useCommandPalette()
  const [themeOpen, setThemeOpen] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)

  const navItems = NAV_BY_ROLE[user?.role] || []

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-[var(--color-base)] text-white noise-bg">
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] pointer-events-none univo-gradient-bg" style={{ transform: 'translate(30%, -40%)' }} />

      <MagneticSidebar items={navItems} />

      <div className="pl-[240px] min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 glass-panel border-b border-white/8">
          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/4 border border-white/8 text-sm text-white/40 hover:text-white/60 hover:border-white/12 transition-all max-w-md w-full"
          >
            <Search size={16} />
            <span className="flex-1 text-left">Search or jump to…</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/8 text-[10px] font-mono">⌘K</kbd>
          </button>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <ThemeSwitcher externalOpen={themeOpen} onExternalClose={() => setThemeOpen(false)} />

            <div className="relative ml-2">
              <button
                type="button"
                onClick={() => setDemoOpen(!demoOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/6 transition-colors"
              >
                <span className="w-8 h-8 rounded-full univo-gradient-bg flex items-center justify-center text-xs font-bold">{initials}</span>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-white/40">{getRoleLabel(user?.role)}</p>
                </div>
                <ChevronDown size={14} className="text-white/40" />
              </button>

              {demoOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDemoOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 z-50 glass-panel rounded-2xl py-2 shadow-2xl">
                    <p className="px-4 py-2 text-[10px] uppercase tracking-wider text-white/35">Switch demo role</p>
                    {['individual', 'institutional', 'teacher', 'admin'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          const path = switchDemoRole(role)
                          setDemoOpen(false)
                          navigate(path)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-white/6 capitalize"
                      >
                        {role.replace('_', ' ')}
                      </button>
                    ))}
                    <div className="border-t border-white/8 mt-1 pt-1">
                      <button type="button" onClick={handleLogout} className="w-full px-4 py-2 text-left text-sm text-red-400/80 hover:bg-white/6 flex items-center gap-2">
                        <LogOut size={14} /> Log out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-6">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onThemeOpen={() => setThemeOpen(true)} />
    </div>
  )
}
