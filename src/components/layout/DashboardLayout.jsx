import { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Search, UserCircle, Bell, LayoutDashboard, RotateCcw, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { NAV_BY_ROLE } from '../../lib/constants'
import { getRoleLabel } from '../../lib/rbac'
import MagneticSidebar from './MagneticSidebar'
import { sendProductUpdateEmail, updateUserLastActive } from '../../lib/social'
import NotificationBell from '../ui/NotificationBell'
import CommandPalette, { useCommandPalette } from '../ui/CommandPalette'
import DashboardDock from '../ui/DashboardDock'
import AnimatedLoadingSkeleton from '../ui/AnimatedLoadingSkeleton'
import WelcomeOnboarding from '../ui/WelcomeOnboarding'
import LiveMessageToast from '../ui/LiveMessageToast'
import { fetchCloudUserData, pushUserDataToCloud, restoreUserDataToDevice } from '../../lib/cloudSync'

export default function DashboardLayout() {
  const { user, logout, updateProfile } = useAuth()
  const preferenceKey = (key) => `univoPreference:${user?.email || 'guest'}:${key}`
  const navigate = useNavigate()
  const { open: cmdOpen, setOpen: setCmdOpen } = useCommandPalette()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem(preferenceKey('sidebarCollapsed')) !== 'false')
  const [compactCards, setCompactCards] = useState(() => localStorage.getItem(preferenceKey('compactCards')) === 'true')
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem(preferenceKey('notifications')) !== 'false')
  const [autoHideSidebar, setAutoHideSidebar] = useState(() => localStorage.getItem(preferenceKey('autoHideSidebar')) === 'true')
  const [autoHideDock, setAutoHideDock] = useState(() => localStorage.getItem(preferenceKey('autoHideDock')) === 'true')
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [welcomeOpen, setWelcomeOpen] = useState(() => localStorage.getItem(preferenceKey('pendingOnboarding')) === 'true')
  const [profileName, setProfileName] = useState('')
  const [profileAvatar, setProfileAvatar] = useState('')
  const [profileEditing, setProfileEditing] = useState(false)
  const [profileImage, setProfileImage] = useState('')
  const [avatarUploadOpen, setAvatarUploadOpen] = useState(false)
  const [pendingProfileImage, setPendingProfileImage] = useState('')
  const [avatarZoom, setAvatarZoom] = useState(1)
  const [avatarOffset, setAvatarOffset] = useState({ x: 0, y: 0 })
  const [avatarDragging, setAvatarDragging] = useState(false)
  const avatarDrag = useRef(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 650)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (!user?.email) return
    updateUserLastActive(user.email)
    const interval = setInterval(() => updateUserLastActive(user.email), 15000)
    return () => clearInterval(interval)
  }, [user?.email])

  // Keep an open session current when the same account changes on another device.
  useEffect(() => {
    if (!user?.email) return
    let active = true
    const refreshFromCloud = async () => {
      const cloudData = await fetchCloudUserData(user.email)
      if (active && cloudData) restoreUserDataToDevice(cloudData)
    }
    refreshFromCloud()
    const interval = setInterval(refreshFromCloud, 5000)
    return () => { active = false; clearInterval(interval) }
  }, [user?.email])

  // Automatic Background Cloud Autosave Engine
  useEffect(() => {
    if (!user?.email) return

    const triggerAutosave = () => {
      pushUserDataToCloud(user.email)
    }

    triggerAutosave()

    window.addEventListener('univo-tasks-updated', triggerAutosave)
    window.addEventListener('univo-timetable-updated', triggerAutosave)
    window.addEventListener('univo-expenses-updated', triggerAutosave)
    window.addEventListener('univo-social-updated', triggerAutosave)
    window.addEventListener('univo-dm-sent', triggerAutosave)
    window.addEventListener('storage', triggerAutosave)

    const interval = setInterval(triggerAutosave, 30000)

    return () => {
      window.removeEventListener('univo-tasks-updated', triggerAutosave)
      window.removeEventListener('univo-timetable-updated', triggerAutosave)
      window.removeEventListener('univo-expenses-updated', triggerAutosave)
      window.removeEventListener('univo-social-updated', triggerAutosave)
      window.removeEventListener('univo-dm-sent', triggerAutosave)
      window.removeEventListener('storage', triggerAutosave)
      clearInterval(interval)
    }
  }, [user?.email])

  const navItems = NAV_BY_ROLE[user?.role] || []

  const handleLogout = () => {
    localStorage.removeItem('univoUser')
    localStorage.removeItem('univoActiveUser')
    window.location.replace('/')
  }

  const openSettings = () => setSettingsOpen(true)
  const updatePreference = (key, value) => localStorage.setItem(preferenceKey(key), String(value))
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
  const cropProfileImage = (source, zoom, offset) => new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const outputSize = 512
      const scale = Math.max(outputSize / image.naturalWidth, outputSize / image.naturalHeight)
      const cropSize = Math.min(image.naturalWidth, image.naturalHeight) / zoom
      const centerX = image.naturalWidth / 2 - offset.x / (scale * zoom)
      const centerY = image.naturalHeight / 2 - offset.y / (scale * zoom)
      const maxX = image.naturalWidth - cropSize
      const maxY = image.naturalHeight - cropSize
      const sourceX = Math.min(maxX, Math.max(0, centerX - cropSize / 2))
      const sourceY = Math.min(maxY, Math.max(0, centerY - cropSize / 2))
      const canvas = document.createElement('canvas')
      canvas.width = outputSize; canvas.height = outputSize
      const context = canvas.getContext('2d')
      context.drawImage(image, sourceX, sourceY, cropSize, cropSize, 0, 0, outputSize, outputSize)
      resolve(canvas.toDataURL('image/jpeg', .92))
    }
    image.onerror = reject
    image.src = source
  })
  const confirmProfileImage = async () => {
    if (!pendingProfileImage) return
    const cropped = await cropProfileImage(pendingProfileImage, avatarZoom, avatarOffset)
    setProfileImage(cropped)
    updateProfile({ avatarImage: cropped })
    setPendingProfileImage(''); setAvatarZoom(1); setAvatarOffset({ x: 0, y: 0 }); setAvatarUploadOpen(false)
  }
  const removeProfileImage = () => { setProfileImage(''); updateProfile({ avatarImage: '' }); setPendingProfileImage(''); setAvatarZoom(1); setAvatarOffset({ x: 0, y: 0 }); setAvatarUploadOpen(false) }
  const handleAvatarWheel = (event) => { event.preventDefault(); setAvatarZoom((value) => Math.min(3, Math.max(1, +(value - event.deltaY * .001).toFixed(2)))) }
  const handleAvatarPointerDown = (event) => { event.currentTarget.setPointerCapture(event.pointerId); setAvatarDragging(true); avatarDrag.current = { x: event.clientX, y: event.clientY, offset: avatarOffset } }
  const handleAvatarPointerMove = (event) => {
    if (!avatarDrag.current) return
    const limit = Math.max(0, event.currentTarget.clientWidth * (avatarZoom - 1) / 2)
    const x = avatarDrag.current.offset.x + event.clientX - avatarDrag.current.x
    const y = avatarDrag.current.offset.y + event.clientY - avatarDrag.current.y
    setAvatarOffset({ x: Math.max(-limit, Math.min(limit, x)), y: Math.max(-limit, Math.min(limit, y)) })
  }
  const stopAvatarDrag = () => { avatarDrag.current = null; setAvatarDragging(false) }

  const sidebarIsCollapsed = false

  return (
    <div className={`dashboard-shell min-h-screen noise-bg ${compactCards ? 'dashboard-compact' : ''}`}>
      {isLoading && <AnimatedLoadingSkeleton label="Loading your campus workspace…" />}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] pointer-events-none univo-gradient-bg" style={{ transform: 'translate(30%, -40%)' }} />

      <MagneticSidebar items={navItems} collapsed={sidebarIsCollapsed} autoHide={autoHideSidebar} onHoverChange={setSidebarHovered} onSettings={openSettings} user={user} onLogout={handleLogout} />

      <div className={`${sidebarIsCollapsed ? 'pl-[72px]' : 'pl-[280px]'} min-h-screen flex flex-col transition-[padding] duration-300`}>
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

          </div>
        </header>

        <main className="flex-1 px-8 pt-6 pb-32">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onThemeOpen={() => setThemeOpen(true)} />
      <DashboardDock items={navItems} onSearch={() => setCmdOpen(true)} onSettings={openSettings} autoHide={autoHideDock} />
      <LiveMessageToast />
      {welcomeOpen && <WelcomeOnboarding onComplete={() => setWelcomeOpen(false)} />}
      {settingsOpen && <div className="settingsOverlay" role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false) }}>
        <div className="settingsModal">
          <div className="settingsHeader"><div><p className="settingsEyebrow">PERSONAL WORKSPACE</p><h2 id="settings-title">Settings</h2><p>Shape your Univo workspace around the way you work.</p></div><button type="button" className="settingsClose" onClick={() => setSettingsOpen(false)} aria-label="Close settings"><X size={18} /></button></div>
          <section className="settingsSection"><div className="settingsSectionTitle"><UserCircle size={17} /><div><strong>Profile</strong><span>Your account details</span></div></div>{!profileEditing && <div className="settingsProfileCard"><span className="settingsAvatar">{profileImage ? <img src={profileImage} alt="Profile" /> : profileAvatar || initials}</span><div className="settingsProfileIdentity"><strong>{user?.name}</strong><span>{user?.email}</span></div><span className="settingsRole">{getRoleLabel(user?.role)}</span><button type="button" className="settingsProfileEdit" onClick={() => setProfileEditing(true)}>Edit profile</button></div>}{profileEditing && <form className="profileEditView" onSubmit={saveProfile}><div className="profileEditAvatar">{profileImage ? <img src={profileImage} alt="Profile" /> : <span>{profileAvatar || initials}</span>}</div><h3>{profileName || user?.name}</h3><p>{getRoleLabel(user?.role)}</p><label>Full name<input value={profileName} onChange={(event) => setProfileName(event.target.value)} /></label><div className="settingsPhotoField"><span>Profile picture</span><button type="button" className="settingsPhotoPicker" onClick={() => { setPendingProfileImage(profileImage); setAvatarUploadOpen(true) }}>{profileImage ? <img src={profileImage} alt="Selected profile" /> : <span className="settingsAvatar settingsAvatarSmall">{profileAvatar || initials}</span>}<b>{profileImage ? 'Change picture' : 'Upload picture'}</b></button><small>PNG, JPG or WEBP · up to 5 MB</small></div><label>Avatar initials<input value={profileAvatar} maxLength={3} onChange={(event) => setProfileAvatar(event.target.value.toUpperCase())} /></label><div className="profileEditActions"><button type="button" className="settingsProfileEdit" onClick={() => setProfileEditing(false)}>Cancel</button><button type="submit" className="settingsProfileSave">Save changes</button></div></form>}</section>
          {avatarUploadOpen && <div className="avatarUploadOverlay" role="dialog" aria-modal="true" aria-labelledby="avatar-upload-title"><div className="avatarUploadDialog"><div className="avatarUploadHeader"><h3 id="avatar-upload-title">Upload Image</h3><button type="button" onClick={() => setAvatarUploadOpen(false)} aria-label="Close upload dialog"><X size={18} /></button></div><div className="avatarUploadBody"><label className="avatarFileInput">Choose File<input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleProfileImage} /><span>{pendingProfileImage ? 'Image selected' : 'No file chosen'}</span></label>{pendingProfileImage && <><div className={`avatarUploadPreview ${avatarDragging ? 'is-dragging' : ''}`} onWheel={handleAvatarWheel} onPointerDown={handleAvatarPointerDown} onPointerMove={handleAvatarPointerMove} onPointerUp={stopAvatarDrag} onPointerCancel={stopAvatarDrag}><img src={pendingProfileImage} alt="Profile preview" style={{ transform: `translate3d(${avatarOffset.x}px, ${avatarOffset.y}px, 0) scale(${avatarZoom})` }} /><div className="avatarCropGrid" aria-hidden="true"><i /><i /><i /><i /></div></div><p className="avatarCropHint">Scroll or use your trackpad to zoom · drag the image to reposition</p></>}</div><div className="avatarUploadFooter"><button type="button" className="avatarUploadCancel" onClick={() => setAvatarUploadOpen(false)}>Cancel</button><button type="button" className="avatarUploadRemove" onClick={removeProfileImage} disabled={!profileImage}>Remove photo</button><button type="button" className="avatarUploadUpdate" onClick={confirmProfileImage} disabled={!pendingProfileImage}>Update</button></div></div></div>}
          <section className="settingsSection"><div className="settingsSectionTitle"><LayoutDashboard size={17} /><div><strong>Workspace</strong><span>Control your dashboard experience</span></div></div><label className="settingsToggle"><span><b>Compact cards</b><small>Use tighter spacing on dashboard widgets.</small></span><input type="checkbox" checked={compactCards} onChange={(event) => { setCompactCards(event.target.checked); updatePreference('univoCompactCards', event.target.checked) }} /><i /></label><label className="settingsToggle"><span><b>Automatically hide and show the Dock</b><small>Reveal quick navigation when you hover near the bottom.</small></span><input type="checkbox" checked={autoHideDock} onChange={(event) => { setAutoHideDock(event.target.checked); updatePreference('autoHideDock', event.target.checked) }} /><i /></label></section>
          <section className="settingsSection"><div className="settingsSectionTitle"><Bell size={17} /><div><strong>Notifications</strong><span>Choose how much activity you see</span></div></div><label className="settingsToggle"><span><b>In-app notifications</b><small>Show reminders and updates in your dashboard.</small></span><input type="checkbox" checked={notificationsEnabled} onChange={(event) => { setNotificationsEnabled(event.target.checked); updatePreference('univoNotifications', event.target.checked) }} /><i /></label><label className="settingsToggle"><span><b>Email Product Release Updates</b><small>Receive email notifications when new platform features drop.</small></span><input type="checkbox" defaultChecked={true} onChange={(event) => { if (event.target.checked) { sendProductUpdateEmail({ email: user?.email || 'student@univo.edu', name: user?.name }) } }} /><i /></label></section>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border-subtle)] gap-3">
            <button type="button" className="settingsReset !mt-0" onClick={() => { localStorage.removeItem('univoDashboardWidgetOrder'); localStorage.removeItem('univoDashboardWidgetLayoutVersion'); window.location.reload() }}><RotateCcw size={14} /> Reset dashboard layout</button>
            <button type="button" onClick={handleLogout} className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"><LogOut size={14} /> Log out</button>
          </div>
        </div>
      </div>}
    </div>
  )
}
