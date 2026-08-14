import { FolderOpen } from 'lucide-react'

export default function EmptyState({ icon: Icon = FolderOpen, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--surface-subtle)]">
      <div className="w-12 h-12 rounded-2xl bg-[var(--accent-muted)] border border-[var(--accent-solid)]/30 flex items-center justify-center text-[var(--accent-solid)] mb-3 shadow-xs">
        <Icon size={24} />
      </div>
      <h3 className="font-display text-base font-bold univo-text-primary mb-1">{title}</h3>
      {description && <p className="univo-text-muted text-xs max-w-sm mb-5 leading-relaxed">{description}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-4 py-2 rounded-xl univo-gradient-bg text-black text-xs font-extrabold shadow-sm hover:scale-102 active:scale-98 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
