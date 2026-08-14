import { Link } from 'react-router-dom'

export default function Logo({ to = '/', className = '', showText = true }) {
  const content = (
    <>
      {showText && <span className="font-display font-extrabold text-xl tracking-tight univo-gradient-text text-[var(--accent-solid)]">Univo</span>}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={`inline-flex items-center gap-2 no-underline cursor-pointer ${className}`} aria-label="Home — Univo" title="Home">
        {content}
      </Link>
    )
  }

  return <div className={`inline-flex items-center gap-2 ${className}`}>{content}</div>
}
