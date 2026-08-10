import { useNavigate } from 'react-router-dom'
import { Search, Settings } from 'lucide-react'
import * as Icons from 'lucide-react'

function DockIcon({ item, onClick }) {
  const Icon = Icons[item.icon] || Icons.Circle
  return (
    <button type="button" className="dashboardDockIcon group" onClick={onClick} aria-label={item.label}>
      <Icon size={18} strokeWidth={2} />
      <span className="dashboardDockTooltip">{item.label}</span>
    </button>
  )
}

export default function DashboardDock({ items = [], onSearch, onSettings }) {
  const navigate = useNavigate()
  const visibleItems = items.slice(0, 5)
  return (
    <nav className="dashboardDock" aria-label="Quick navigation">
      <div className="dashboardDockInner">
        {visibleItems.map((item) => <DockIcon key={item.id} item={item} onClick={() => navigate(item.path)} />)}
        <span className="dashboardDockDivider" />
        <button type="button" className="dashboardDockIcon group" onClick={onSearch} aria-label="Search">
          <Search size={18} /><span className="dashboardDockTooltip">Search</span>
        </button>
        <button type="button" className="dashboardDockIcon group" onClick={onSettings} aria-label="Settings">
          <Settings size={18} /><span className="dashboardDockTooltip">Settings</span>
        </button>
      </div>
    </nav>
  )
}
