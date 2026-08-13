import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import Logo from '../brand/Logo'

function NavIcon({ name, size = 18 }) {
  const Icon = Icons[name]
  return Icon ? <Icon size={size} /> : null
}

export default function MagneticSidebar({ items, collapsed = false, autoHide = false, onHoverChange, onSettings, user, onLogout }) {
  const location = useLocation()
  const navRef = useRef(null)
  const [indicator, setIndicator] = useState({ top: 0, height: 0 })

  const activeIndex = items.findIndex((item) => location.pathname === item.path || (item.path !== items[0]?.path && location.pathname.startsWith(item.path)))

  useEffect(() => {
    if (!navRef.current || activeIndex < 0) return
    const links = navRef.current.querySelectorAll('[data-nav-item]')
    const activeEl = links[activeIndex]
    if (activeEl) {
      setIndicator({ top: activeEl.offsetTop, height: activeEl.offsetHeight })
    }
  }, [activeIndex, location.pathname, collapsed])

  return (
    <aside onMouseEnter={() => autoHide && onHoverChange?.(true)} onMouseLeave={() => autoHide && onHoverChange?.(false)} className={`dashboard-sidebar fixed left-0 top-0 h-full z-30 flex flex-col glass-panel border-r border-white/8 ${collapsed ? 'w-[72px]' : 'w-[280px]'}`}>
      <div className={`p-4 ${collapsed ? 'px-4' : 'px-5'}`}>
        <Logo to="/" showText={!collapsed} size={collapsed ? 28 : 32} />
        <p className="dashboard-sidebar-workspace">UNIVO WORKSPACE</p>
      </div>

      <nav ref={navRef} className="relative flex-1 px-3 py-2 space-y-1">
        {indicator.height > 0 && (
          <motion.div
            className="absolute left-3 right-3 rounded-xl univo-gradient-bg opacity-15"
            animate={{ top: indicator.top, height: indicator.height }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            style={{ position: 'absolute' }}
          />
        )}
        {indicator.height > 0 && (
          <motion.div
            className="absolute left-0 w-[3px] rounded-r-full univo-gradient-bg"
            animate={{ top: indicator.top + 8, height: indicator.height - 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          />
        )}

        {items.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            data-nav-item
            end={item.path === items[0]?.path}
            className={({ isActive }) =>
              `relative flex min-h-[48px] items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors z-10 ${
                isActive ? 'dashboard-nav-active' : 'dashboard-nav-inactive'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <NavIcon name={item.icon} size={collapsed ? 22 : 18} />
            <span className="dashboard-sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="dashboard-sidebar-bottom">
        <button type="button" onClick={onSettings} className={`dashboard-sidebar-action ${collapsed ? 'justify-center' : ''}`} title="Settings">
          <Icons.Settings size={18} /><span className="dashboard-sidebar-label">Settings</span>
        </button>
        <div className={`dashboard-sidebar-account ${collapsed ? 'justify-center' : ''}`}>
          <span className="dashboard-sidebar-avatar">{user?.avatarImage ? <img src={user.avatarImage} alt="Profile" /> : user?.avatar || user?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '?'}</span>
          <div className="dashboard-sidebar-account-copy"><strong>{user?.name || 'Univo student'}</strong><small>{user?.email || 'Personal account'}</small></div>
          <button type="button" onClick={onLogout} className="dashboard-sidebar-logout" aria-label="Sign out"><Icons.LogOut size={14} /></button>
        </div>
      </div>

    </aside>
  )
}
