import { motion } from 'framer-motion'

export default function AnimatedLoadingSkeleton({ label = 'Loading your workspace…' }) {
  return <div className="univoLoadingOverlay" role="status" aria-live="polite">
    <motion.div className="univoLoadingCard" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}>
      <div className="univoLoadingOrb"><span /></div>
      <div className="univoLoadingLines"><i /><i /><i /></div>
      <p>{label}</p>
    </motion.div>
  </div>
}
