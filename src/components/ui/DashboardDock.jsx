import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Compass, Settings } from 'lucide-react'
import * as Icons from 'lucide-react'

function DockIcon({ item, onClick }) {
  const Icon = Icons[item.icon] || Icons.Circle
  const iconAssets = { 'attendance-tracker': 'attendance.png', attendance: 'representative.png', timetable: 'timetable.png', journal: 'journal.png', groups: 'groups.png', messenger: 'messenger.png', notes: 'notes.png', expenses: 'wallet.png', assignments: 'tasks.png' }
  const asset = iconAssets[item.id]
  return (
    <button type="button" className={`dashboardDockIcon dock-${item.id} group`} onClick={onClick} aria-label={item.label}>
      {asset ? <img src={`/dock-icons/${asset}`} alt="" className="dashboardDockImage" /> : <Icon size={18} strokeWidth={2} />}
      <span className="dashboardDockTooltip">{item.label}</span>
    </button>
  )
}

export default function DashboardDock({ items = [], onSearch, onSettings, autoHide = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [mouseX, setMouseX] = useState(null)
  const visibleItems = items
  const iconSize = 46
  const gap = 8
  const effectWidth = 210
  const scales = useMemo(() => visibleItems.map((_, index) => {
    if (mouseX === null) return 1
    const center = 12 + index * (iconSize + gap) + iconSize / 2
    const distance = Math.abs(mouseX - center)
    return distance > effectWidth / 2 ? 1 : 1 + (1.10 - 1) * (1 + Math.cos(distance / (effectWidth / 2) * Math.PI)) / 2
  }), [mouseX, visibleItems.length])
  const go = (item) => navigate(item.path)
  return (
    <nav className={`dashboardDock ${autoHide ? 'dashboardDockAutoHide' : ''}`} aria-label="Quick navigation" onMouseMove={(event) => { const rect = event.currentTarget.getBoundingClientRect(); setMouseX(event.clientX - rect.left) }} onMouseLeave={() => setMouseX(null)}>
      <div className="dashboardDockInner">
        {visibleItems.map((item, index) => <div key={item.id} className="dashboardDockMagnifiedItem" style={{ width: iconSize, transform: `scale(${scales[index]})` }}><DockIcon item={item} onClick={() => go(item)} /><span className={`dashboardDockActiveDot ${location.pathname === item.path ? 'is-active' : ''}`} /></div>)}
        <span className="dashboardDockDivider" />
        <div className="dashboardDockMagnifiedItem" style={{ width: iconSize, transform: `scale(${mouseX === null ? 1 : 1.05})` }}><button type="button" className="dashboardDockIcon group" onClick={onSearch} aria-label="Search">
          <img src="/dock-icons/search.png" alt="" className="dashboardDockImage" /><span className="dashboardDockTooltip">Search</span>
        </button></div>
        <div className="dashboardDockMagnifiedItem" style={{ width: iconSize, transform: `scale(${mouseX === null ? 1 : 1.05})` }}><button type="button" className="dashboardDockIcon group" onClick={onSettings} aria-label="Settings">
          <Settings size={19} strokeWidth={2.2} /><span className="dashboardDockTooltip">Settings</span>
        </button></div>
      </div>
    </nav>
  )
}
