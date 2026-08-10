import { motion } from 'framer-motion'

export default function GlassCard({ children, className = '', hover = true, onClick, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hover ? { y: -3 } : undefined}
      onClick={onClick}
      className={`glass-card rounded-2xl p-5 transition-all duration-300 cursor-default ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}
