export default function NovaBurst({ size = 40, className = '', animate = false }) {
  return (
    <svg
      className={`${animate ? 'nova-animate' : ''} ${className}`}
      width={size}
      height={size * 0.8}
      viewBox="0 0 40 32"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="novaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent-from, #8b5cf6)" />
          <stop offset="100%" stopColor="var(--accent-to, #f97316)" />
        </linearGradient>
      </defs>
      <path fill="url(#novaGrad)" d="M2 11.5 20 3l18 8.5L20 20 2 11.5Z" opacity="0.95" />
      <path fill="url(#novaGrad)" d="M9 15.5v6.2c0 3.3 4.9 6.3 11 6.3s11-3 11-6.3v-6.2l-11 5.2-11-5.2Z" opacity="0.75" />
      <path fill="none" stroke="url(#novaGrad)" strokeWidth="2" strokeLinecap="round" d="M35 13v8" />
      <circle fill="url(#novaGrad)" cx="35" cy="23" r="1.8" />
    </svg>
  )
}
