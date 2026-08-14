import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function AnimatedProgress({ value = 0, className = '', height = 8, delay = 0, variant = 'accent', statusThresholds = true }) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setWidth(Math.min(100, Math.max(0, value))), 150 + delay * 50)
    return () => clearTimeout(timer)
  }, [value, delay])

  // Status color logic (green >= 75%, amber >= 60%, red < 60%)
  const getFillClass = () => {
    if (variant === 'status' || statusThresholds) {
      if (value >= 75) return 'bg-gradient-to-r from-emerald-500 to-teal-500'
      if (value >= 60) return 'bg-gradient-to-r from-amber-500 to-amber-600'
      return 'bg-gradient-to-r from-red-500 to-rose-600'
    }
    return 'univo-gradient-bg'
  }

  return (
    <div className={`w-full overflow-hidden rounded-full bg-[var(--surface-control)] border border-[var(--border-subtle)]/40 ${className}`} style={{ height }}>
      <motion.div
        className={`h-full rounded-full transition-colors duration-300 ${getFillClass()}`}
        initial={{ width: '0%' }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 0.8, delay: delay * 0.05, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}
