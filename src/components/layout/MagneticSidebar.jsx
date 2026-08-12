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
    <aside onMouseEnter={() => autoHide && onHoverChange?.(true)} onMouseLeave={() => autoHide && onHoverChange?.(false)} className={`dashboard-sidebar fixed left-0 top-0 h-full z-30 flex flex-col glass-panel border-r border-white/8 ${autoHide ? `dashboard-sidebar-auto ${collapsed ? '' : 'dashboard-sidebar-auto-expanded'}` : collapsed ? 'w-[72px]' : 'w-[240px]'}`}>
      <div className={`p-5 ${collapsed ? 'px-4' : ''}`}>
        <Logo to="/" showText={!collapsed} size={collapsed ? 28 : 32} />
        {!collapsed && <p className="dashboard-sidebar-workspace">PERSONAL CAMPUS WORKSPACE</p>}
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
              `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors z-10 ${
                isActive ? 'dashboard-nav-active' : 'dashboard-nav-inactive'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <NavIcon name={item.icon} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="dashboard-sidebar-bottom">
        <button type="button" onClick={onSettings} className={`dashboard-sidebar-action ${collapsed ? 'justify-center' : ''}`} title="Settings">
          <Icons.Settings size={18} />{!collapsed && <span>Settings</span>}
        </button>
        <div className={`dashboard-sidebar-account ${collapsed ? 'justify-center' : ''}`}>
          <span className="dashboard-sidebar-avatar">{user?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '?'}</span>
          {!collapsed && <div><strong>{user?.name || 'Univo student'}</strong><small>{user?.email || 'Personal account'}</small></div>}
          {!collapsed && <button type="button" onClick={onLogout} className="dashboard-sidebar-logout" aria-label="Sign out"><Icons.LogOut size={14} /></button>}
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 mx-3 mb-4 rounded-xl bg-white/4 border border-white/6">
          <p className="text-[10px] uppercase tracking-wider text-white/35 mb-1">Pro tip</p>
          <p className="text-xs text-white/50 leading-relaxed">Press <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono text-[10px]">⌘K</kbd> to jump anywhere instantly.</p>
        </div>
      )}
    </aside>
  )
}
