import NovaBurst from '../brand/NovaBurst'

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-6 opacity-80">
        <svg width="120" height="100" viewBox="0 0 120 100" fill="none" aria-hidden="true">
          <circle cx="60" cy="50" r="38" stroke="url(#emptyGrad)" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.4" />
          <path d="M40 65 Q60 45 80 65" stroke="url(#emptyGrad)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="48" cy="42" r="3" fill="var(--accent-from)" opacity="0.6" />
          <circle cx="72" cy="42" r="3" fill="var(--accent-to)" opacity="0.6" />
          <defs>
            <linearGradient id="emptyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-from)" />
              <stop offset="100%" stopColor="var(--accent-to)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <NovaBurst size={28} animate className="mb-4 opacity-60" />
      <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
      <p className="text-white/50 text-sm max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-5 py-2.5 rounded-full univo-gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
