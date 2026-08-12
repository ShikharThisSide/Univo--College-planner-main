import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Search, ChevronDown, UserCircle, Bell, LayoutDashboard, PanelLeft, RotateCcw, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { NAV_BY_ROLE } from '../../lib/constants'
import { getRoleLabel } from '../../lib/rbac'
import MagneticSidebar from './MagneticSidebar'
import NotificationBell from '../ui/NotificationBell'
import ThemeSwitcher from '../ui/ThemeSwitcher'
import CommandPalette, { useCommandPalette } from '../ui/CommandPalette'
import DashboardDock from '../ui/DashboardDock'
import AnimatedLoadingSkeleton from '../ui/AnimatedLoadingSkeleton'
import WelcomeOnboarding from '../ui/WelcomeOnboarding'
import { useTheme } from '../../context/ThemeContext'

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { open: cmdOpen, setOpen: setCmdOpen } = useCommandPalette()
  const [themeOpen, setThemeOpen] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('univoSidebarCollapsed') === 'true')
  const [compactCards, setCompactCards] = useState(() => localStorage.getItem('univoCompactCards') === 'true')
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem('univoNotifications') !== 'false')
  const [autoHideSidebar, setAutoHideSidebar] = useState(() => localStorage.getItem('univoAutoHideSidebar') === 'true')
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [welcomeOpen, setWelcomeOpen] = useState(() => localStorage.getItem('univoPendingOnboarding') === 'true')
  const { mode, setMode } = useTheme()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 650)
    return () => clearTimeout(timeout)
  }, [])

  const navItems = NAV_BY_ROLE[user?.role] || []

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const openSettings = () => { setDemoOpen(false); setSettingsOpen(true) }
  const updatePreference = (key, value) => localStorage.setItem(key, String(value))

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  const sidebarIsCollapsed = autoHideSidebar ? !sidebarHovered : sidebarCollapsed

  return (
    <div className={`dashboard-shell min-h-screen noise-bg ${compactCards ? 'dashboard-compact' : ''}`}>
      {isLoading && <AnimatedLoadingSkeleton label="Loading your campus workspace…" />}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] pointer-events-none univo-gradient-bg" style={{ transform: 'translate(30%, -40%)' }} />

      <MagneticSidebar items={navItems} collapsed={sidebarIsCollapsed} autoHide={autoHideSidebar} onHoverChange={setSidebarHovered} onSettings={openSettings} user={user} onLogout={handleLogout} />

      <div className={`${sidebarIsCollapsed ? 'pl-[72px]' : 'pl-[240px]'} min-h-screen flex flex-col transition-[padding] duration-300`}>
        <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 glass-panel border-b border-white/8">
            <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="dashboard-search flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all max-w-md w-full"
          >
            <Search size={16} />
            <span className="flex-1 text-left">Search or jump to…</span>
            <kbd className="dashboard-kbd px-1.5 py-0.5 rounded text-[10px] font-mono">⌘K</kbd>
            </button>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <ThemeSwitcher open={themeOpen} onOpenChange={setThemeOpen} />

            <div className="relative ml-2">
              <button
                type="button"
                onClick={() => setDemoOpen(!demoOpen)}
                className="profileDropdownTrigger"
              >
                <div className="text-left hidden sm:block">
                  <p className="dashboard-light-accent-heading text-sm font-medium leading-tight">{user?.name}</p>
                  <p className="dashboard-muted text-[10px]">{user?.email || getRoleLabel(user?.role)}</p>
                </div>
                <span className="profileDropdownAvatar">{initials}</span>
                <ChevronDown size={14} className="text-white/40" />
              </button>

              {demoOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDemoOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 z-50 glass-panel rounded-2xl py-2 shadow-2xl">
                    <button type="button" onClick={openSettings} className="profileMenuItem"><UserCircle size={14} /> Settings <span>⌘</span></button>
                    <button type="button" onClick={() => { setDemoOpen(false); setThemeOpen(true) }} className="profileMenuItem">Theme <span>◐</span></button>
                    <div className="profileMenuDivider" />
                    <button type="button" onClick={handleLogout} className="profileMenuItem profileMenuLogout"><LogOut size={14} /> Sign out</button>
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
      <DashboardDock items={navItems} onSearch={() => setCmdOpen(true)} onSettings={openSettings} />
      {welcomeOpen && <WelcomeOnboarding onComplete={() => setWelcomeOpen(false)} />}
      {settingsOpen && <div className="settingsOverlay" role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false) }}>
        <div className="settingsModal">
          <div className="settingsHeader"><div><p className="settingsEyebrow">PERSONAL WORKSPACE</p><h2 id="settings-title">Settings</h2><p>Shape your Univo workspace around the way you work.</p></div><button type="button" className="settingsClose" onClick={() => setSettingsOpen(false)} aria-label="Close settings"><X size={18} /></button></div>
          <section className="settingsSection"><div className="settingsSectionTitle"><UserCircle size={17} /><div><strong>Profile</strong><span>Your account details</span></div></div><div className="settingsProfileRow"><span className="settingsAvatar">{initials}</span><div><strong>{user?.name}</strong><span>{user?.email}</span></div><span className="settingsRole">{getRoleLabel(user?.role)}</span></div></section>
          <section className="settingsSection"><div className="settingsSectionTitle"><LayoutDashboard size={17} /><div><strong>Workspace</strong><span>Control your dashboard experience</span></div></div><label className="settingsToggle"><span><b>Compact cards</b><small>Use tighter spacing on dashboard widgets.</small></span><input type="checkbox" checked={compactCards} onChange={(event) => { setCompactCards(event.target.checked); updatePreference('univoCompactCards', event.target.checked) }} /><i /></label><label className="settingsToggle"><span><b>Collapsed sidebar</b><small>Keep navigation icons-only until expanded.</small></span><input type="checkbox" checked={sidebarCollapsed} onChange={(event) => { setSidebarCollapsed(event.target.checked); updatePreference('univoSidebarCollapsed', event.target.checked) }} /><i /></label></section>
          <section className="settingsSection"><div className="settingsSectionTitle"><LayoutDashboard size={17} /><div><strong>Workspace</strong><span>Control your dashboard experience</span></div></div><label className="settingsToggle"><span><b>Compact cards</b><small>Use tighter spacing on dashboard widgets.</small></span><input type="checkbox" checked={compactCards} onChange={(event) => { setCompactCards(event.target.checked); updatePreference('univoCompactCards', event.target.checked) }} /><i /></label><label className="settingsToggle"><span><b>Collapsed sidebar</b><small>Keep navigation icons-only by default.</small></span><input type="checkbox" checked={sidebarCollapsed} onChange={(event) => { setSidebarCollapsed(event.target.checked); updatePreference('univoSidebarCollapsed', event.target.checked) }} /><i /></label><label className="settingsToggle"><span><b>Automatically hide and show the Sidebar</b><small>Show the full navigation when you hover over the left edge.</small></span><input type="checkbox" checked={autoHideSidebar} onChange={(event) => { setAutoHideSidebar(event.target.checked); updatePreference('univoAutoHideSidebar', event.target.checked) }} /><i /></label></section>
          <section className="settingsSection"><div className="settingsSectionTitle"><Bell size={17} /><div><strong>Notifications</strong><span>Choose how much activity you see</span></div></div><label className="settingsToggle"><span><b>In-app notifications</b><small>Show reminders and updates in your dashboard.</small></span><input type="checkbox" checked={notificationsEnabled} onChange={(event) => { setNotificationsEnabled(event.target.checked); updatePreference('univoNotifications', event.target.checked) }} /><i /></label></section>
          <section className="settingsSection"><div className="settingsSectionTitle"><PanelLeft size={17} /><div><strong>Appearance</strong><span>Theme and visual preferences</span></div></div><div className="settingsChoiceRow"><button type="button" className={mode === 'light' ? 'settingsChoice active' : 'settingsChoice'} onClick={() => setMode('light')}>Light</button><button type="button" className={mode === 'dark' ? 'settingsChoice active' : 'settingsChoice'} onClick={() => setMode('dark')}>Dark</button></div></section>
          <button type="button" className="settingsReset" onClick={() => { localStorage.removeItem('univoDashboardWidgetOrder'); localStorage.removeItem('univoDashboardWidgetLayoutVersion'); window.location.reload() }}><RotateCcw size={14} /> Reset dashboard layout</button>
        </div>
      </div>}
    </div>
  )
}
