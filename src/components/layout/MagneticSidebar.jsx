import { NavLink, useLocation } from 'react-router-dom'
import { motion, LayoutGroup } from 'framer-motion'
import * as Icons from 'lucide-react'
import Logo from '../brand/Logo'

function NavIcon({ name, size = 18 }) {
  const Icon = Icons[name]
  return Icon ? <Icon size={size} /> : null
}

export default function MagneticSidebar({ items, collapsed = false, autoHide = false, onHoverChange, onSettings, user, onLogout }) {
  const location = useLocation()

  return (
    <aside
      onMouseEnter={() => autoHide && onHoverChange?.(true)}
      onMouseLeave={() => autoHide && onHoverChange?.(false)}
      className={`dashboard-sidebar fixed left-0 top-0 h-full z-30 flex flex-col glass-panel border-r border-white/8 ${collapsed ? 'w-[72px]' : 'w-[280px]'}`}
    >
      <div className={`p-4 ${collapsed ? 'px-4' : 'px-5'}`}>
        <Logo to="/" showText={!collapsed} size={collapsed ? 28 : 32} />
        <p className="dashboard-sidebar-workspace">UNIVO WORKSPACE</p>
      </div>

      <LayoutGroup id="sidebar-nav">
        <nav className="relative flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isHome = item.path === items[0]?.path
            const isItemActive = isHome
              ? location.pathname === item.path
              : location.pathname === item.path || (location.pathname + '/').startsWith(item.path + '/')

            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={isHome}
                className={({ isActive }) =>
                  `relative flex min-h-[48px] items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? collapsed
                        ? 'text-[var(--accent-solid)] font-bold'
                        : 'text-[var(--accent-solid)] font-bold bg-transparent'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                  } ${collapsed ? 'justify-center' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                {/* Left accent indicator bar ONLY for expanded view */}
                {!collapsed && isItemActive && (
                  <motion.div
                    layoutId="sidebar-active-bar"
                    className="absolute left-0 top-2.5 bottom-2.5 w-[3.5px] rounded-r-full univo-gradient-bg pointer-events-none z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}

                {/* Highlight background pill ONLY for collapsed / auto-hide sidebar view */}
                {collapsed && isItemActive && (
                  <motion.div
                    layoutId="sidebar-active-pill-collapsed"
                    className="absolute inset-0 rounded-xl univo-gradient-bg opacity-20 pointer-events-none z-0"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}

                <span className="relative z-10 shrink-0">
                  <NavIcon name={item.icon} size={collapsed ? 22 : 18} />
                </span>
                <span className="dashboard-sidebar-label relative z-10">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </LayoutGroup>

      <div className="dashboard-sidebar-bottom">
        <button type="button" onClick={onSettings} className={`dashboard-sidebar-action ${collapsed ? 'justify-center' : ''}`} title="Settings">
          <Icons.Settings size={18} />
          <span className="dashboard-sidebar-label">Settings</span>
        </button>
        <div className={`dashboard-sidebar-account ${collapsed ? 'justify-center' : ''}`}>
          <span className="dashboard-sidebar-avatar">
            {user?.avatarImage ? <img src={user.avatarImage} alt="Profile" /> : user?.avatar || user?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '?'}
          </span>
          <div className="dashboard-sidebar-account-copy">
            <strong>{user?.name || 'Univo student'}</strong>
            <small>{user?.email || 'Personal account'}</small>
          </div>
          <button type="button" onClick={onLogout} className="dashboard-sidebar-logout" aria-label="Sign out">
            <Icons.LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
