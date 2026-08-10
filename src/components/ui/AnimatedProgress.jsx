import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function AnimatedProgress({ value, className = '', height = 8, delay = 0 }) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 300 + delay * 100)
    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <div className={`overflow-hidden rounded-full bg-white/10 ${className}`} style={{ height }}>
      <motion.div
        className="h-full rounded-full univo-gradient-bg"
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}
