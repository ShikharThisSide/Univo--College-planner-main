import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Search, UserCircle, Bell, LayoutDashboard, PanelLeft, RotateCcw, X, Minus, Plus } from 'lucide-react'
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
  const { user, logout, updateProfile } = useAuth()
  const navigate = useNavigate()
  const { open: cmdOpen, setOpen: setCmdOpen } = useCommandPalette()
  const [themeOpen, setThemeOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('univoSidebarCollapsed') === 'true')
  const [compactCards, setCompactCards] = useState(() => localStorage.getItem('univoCompactCards') === 'true')
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem('univoNotifications') !== 'false')
  const [autoHideSidebar, setAutoHideSidebar] = useState(() => localStorage.getItem('univoAutoHideSidebar') === 'true')
  const [autoHideDock, setAutoHideDock] = useState(() => localStorage.getItem('univoAutoHideDock') === 'true')
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [welcomeOpen, setWelcomeOpen] = useState(() => localStorage.getItem('univoPendingOnboarding') === 'true')
  const [profileName, setProfileName] = useState('')
  const [profileAvatar, setProfileAvatar] = useState('')
  const [profileEditing, setProfileEditing] = useState(false)
  const [profileImage, setProfileImage] = useState('')
  const [avatarUploadOpen, setAvatarUploadOpen] = useState(false)
  const [pendingProfileImage, setPendingProfileImage] = useState('')
  const [avatarZoom, setAvatarZoom] = useState(1)
  const { mode, setMode, accent, setAccent, palettes } = useTheme()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 650)
    return () => clearTimeout(timeout)
  }, [])

  const navItems = NAV_BY_ROLE[user?.role] || []

  const handleLogout = () => {
    logout()
    window.location.replace('/')
  }

  const openSettings = () => setSettingsOpen(true)
  const updatePreference = (key, value) => localStorage.setItem(key, String(value))
  const initials = user?.avatar || user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  useEffect(() => {
    if (settingsOpen) {
      setProfileName(user?.name || '')
      setProfileAvatar(user?.avatar || initials)
      setProfileImage(user?.avatarImage || '')
      setProfileEditing(false)
    }
  }, [settingsOpen, user?.name, user?.avatar, user?.avatarImage])
  const saveProfile = (event) => { event.preventDefault(); const name = profileName.trim(); const avatar = profileAvatar.trim().slice(0, 3).toUpperCase(); if (!name) return; updateProfile({ name, avatar, avatarImage: profileImage }); }
  const handleProfileImage = (event) => { const file = event.target.files?.[0]; if (!file || !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return; const reader = new FileReader(); reader.onload = () => setPendingProfileImage(String(reader.result)); reader.readAsDataURL(file); }
  const cropProfileImage = (source, zoom) => new Promise((resolve) => { const image = new Image(); image.onload = () => { const size = Math.min(image.naturalWidth, image.naturalHeight); const cropSize = size / zoom; const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512; const context = canvas.getContext('2d'); context.drawImage(image, (image.naturalWidth - cropSize) / 2, (image.naturalHeight - cropSize) / 2, cropSize, cropSize, 0, 0, 512, 512); resolve(canvas.toDataURL('image/jpeg', .9)) }; image.src = source })
  const confirmProfileImage = async () => { if (!pendingProfileImage) return; setProfileImage(await cropProfileImage(pendingProfileImage, avatarZoom)); setPendingProfileImage(''); setAvatarZoom(1); setAvatarUploadOpen(false) }
  const removeProfileImage = () => { setProfileImage(''); setPendingProfileImage(''); setAvatarZoom(1); setAvatarUploadOpen(false) }

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

          </div>
        </header>

        <main className="flex-1 px-8 py-6">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onThemeOpen={() => setThemeOpen(true)} />
      <DashboardDock items={navItems} onSearch={() => setCmdOpen(true)} onSettings={openSettings} autoHide={autoHideDock} />
      {welcomeOpen && <WelcomeOnboarding onComplete={() => setWelcomeOpen(false)} />}
      {settingsOpen && <div className="settingsOverlay" role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false) }}>
        <div className="settingsModal">
          <div className="settingsHeader"><div><p className="settingsEyebrow">PERSONAL WORKSPACE</p><h2 id="settings-title">Settings</h2><p>Shape your Univo workspace around the way you work.</p></div><button type="button" className="settingsClose" onClick={() => setSettingsOpen(false)} aria-label="Close settings"><X size={18} /></button></div>
          <section className="settingsSection"><div className="settingsSectionTitle"><UserCircle size={17} /><div><strong>Profile</strong><span>Your account details</span></div></div><div className="settingsProfileCard"><span className="settingsAvatar">{profileImage ? <img src={profileImage} alt="Profile" /> : profileAvatar || initials}</span><div className="settingsProfileIdentity"><strong>{user?.name}</strong><span>{user?.email}</span></div><span className="settingsRole">{getRoleLabel(user?.role)}</span><button type="button" className="settingsProfileEdit" onClick={() => setProfileEditing((value) => !value)}>{profileEditing ? 'Close' : 'Edit profile'}</button></div>{profileEditing && <form className="settingsProfileEditor" onSubmit={saveProfile}><label>Full name<input value={profileName} onChange={(event) => setProfileName(event.target.value)} /></label><div className="settingsPhotoField"><span>Profile picture</span><button type="button" className="settingsPhotoPicker" onClick={() => { setPendingProfileImage(profileImage); setAvatarUploadOpen(true) }}>{profileImage ? <img src={profileImage} alt="Selected profile" /> : <span className="settingsAvatar settingsAvatarSmall">{profileAvatar || initials}</span>}<b>{profileImage ? 'Change picture' : 'Upload picture'}</b></button><small>PNG, JPG or WEBP · up to 5 MB</small></div><label>Avatar initials<input value={profileAvatar} maxLength={3} onChange={(event) => setProfileAvatar(event.target.value.toUpperCase())} /></label><button type="submit" className="settingsProfileSave">Save changes</button></form>}</section>
          {avatarUploadOpen && <div className="avatarUploadOverlay" role="dialog" aria-modal="true" aria-labelledby="avatar-upload-title"><div className="avatarUploadDialog"><div className="avatarUploadHeader"><h3 id="avatar-upload-title">Upload Image</h3><button type="button" onClick={() => setAvatarUploadOpen(false)} aria-label="Close upload dialog"><X size={18} /></button></div><div className="avatarUploadBody"><label className="avatarFileInput">Choose File<input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleProfileImage} /><span>{pendingProfileImage ? 'Image selected' : 'No file chosen'}</span></label>{pendingProfileImage && <><div className="avatarUploadPreview"><img src={pendingProfileImage} alt="Profile preview" style={{ transform: `scale(${avatarZoom})` }} /><div className="avatarCropGrid" aria-hidden="true"><i /><i /><i /><i /></div></div><div className="avatarZoomControl"><button type="button" onClick={() => setAvatarZoom((value) => Math.max(1, +(value - .1).toFixed(1)))} aria-label="Zoom out"><Minus size={16} /></button><input type="range" min="1" max="3" step=".1" value={avatarZoom} onChange={(event) => setAvatarZoom(Number(event.target.value))} aria-label="Zoom image" /><button type="button" onClick={() => setAvatarZoom((value) => Math.min(3, +(value + .1).toFixed(1)))} aria-label="Zoom in"><Plus size={16} /></button><span>{Math.round(avatarZoom * 100)}%</span></div></>}</div><div className="avatarUploadFooter"><button type="button" className="avatarUploadCancel" onClick={() => setAvatarUploadOpen(false)}>Cancel</button><button type="button" className="avatarUploadRemove" onClick={removeProfileImage} disabled={!profileImage}>Remove photo</button><button type="button" className="avatarUploadUpdate" onClick={confirmProfileImage} disabled={!pendingProfileImage}>Update</button></div></div></div>}
          <section className="settingsSection"><div className="settingsSectionTitle"><LayoutDashboard size={17} /><div><strong>Workspace</strong><span>Control your dashboard experience</span></div></div><label className="settingsToggle"><span><b>Compact cards</b><small>Use tighter spacing on dashboard widgets.</small></span><input type="checkbox" checked={compactCards} onChange={(event) => { setCompactCards(event.target.checked); updatePreference('univoCompactCards', event.target.checked) }} /><i /></label><label className="settingsToggle"><span><b>Collapsed sidebar</b><small>Keep navigation icons-only by default.</small></span><input type="checkbox" checked={sidebarCollapsed} onChange={(event) => { setSidebarCollapsed(event.target.checked); updatePreference('univoSidebarCollapsed', event.target.checked) }} /><i /></label><label className="settingsToggle"><span><b>Automatically hide and show the Sidebar</b><small>Show the full navigation when you hover over the left edge.</small></span><input type="checkbox" checked={autoHideSidebar} onChange={(event) => { setAutoHideSidebar(event.target.checked); updatePreference('univoAutoHideSidebar', event.target.checked) }} /><i /></label><label className="settingsToggle"><span><b>Automatically hide and show the Dock</b><small>Reveal quick navigation when you hover near the bottom.</small></span><input type="checkbox" checked={autoHideDock} onChange={(event) => { setAutoHideDock(event.target.checked); updatePreference('univoAutoHideDock', event.target.checked) }} /><i /></label></section>
          <section className="settingsSection"><div className="settingsSectionTitle"><Bell size={17} /><div><strong>Notifications</strong><span>Choose how much activity you see</span></div></div><label className="settingsToggle"><span><b>In-app notifications</b><small>Show reminders and updates in your dashboard.</small></span><input type="checkbox" checked={notificationsEnabled} onChange={(event) => { setNotificationsEnabled(event.target.checked); updatePreference('univoNotifications', event.target.checked) }} /><i /></label></section>
          <section className="settingsSection"><div className="settingsSectionTitle"><PanelLeft size={17} /><div><strong>Appearance</strong><span>Choose your mode and Univo theme colour</span></div></div><div className="settingsChoiceRow"><button type="button" className={mode === 'light' ? 'settingsChoice active' : 'settingsChoice'} onClick={() => setMode('light')}>Light</button><button type="button" className={mode === 'dark' ? 'settingsChoice active' : 'settingsChoice'} onClick={() => setMode('dark')}>Dark</button></div><p className="settingsPaletteLabel">Theme colour</p><div className="settingsPaletteGrid">{palettes.map((palette) => <button key={palette.id} type="button" className={`settingsPalette ${accent === palette.id ? 'active' : ''}`} onClick={() => setAccent(palette.id)} aria-label={`Use ${palette.label} theme`} aria-pressed={accent === palette.id}><span style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }} /><b>{palette.label}</b></button>)}</div></section>
          <button type="button" className="settingsReset" onClick={() => { localStorage.removeItem('univoDashboardWidgetOrder'); localStorage.removeItem('univoDashboardWidgetLayoutVersion'); window.location.reload() }}><RotateCcw size={14} /> Reset dashboard layout</button>
        </div>
      </div>}
    </div>
  )
}
