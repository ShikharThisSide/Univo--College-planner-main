import { Link } from 'react-router-dom'
import NovaBurst from './NovaBurst'

export default function Logo({ to = '/', className = '', showText = true, size = 32 }) {
  const content = (
    <>
      <NovaBurst size={size} />
      {showText && <span className="font-display font-semibold text-lg tracking-tight">Univo</span>}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={`inline-flex items-center gap-2.5 text-white no-underline cursor-pointer ${className}`} aria-label="Home — Univo" title="Home">
        {content}
      </Link>
    )
  }

  return <div className={`inline-flex items-center gap-2.5 ${className}`}>{content}</div>
}
