import { useEffect, useState } from 'react'
import { AnimatePresence, LazyMotion, domAnimation, m } from 'motion/react'
import { cn } from '../../lib/utils'

export default function TextLoop({
  staticText = 'Design',
  rotatingTexts = ['Limitless', 'Timeless', 'Flawless'],
  className,
  interval = 3000,
  transition = { duration: 0.8, ease: 'easeInOut' },
  staticTextClassName,
  rotatingTextClassName,
  backgroundClassName,
  cursorClassName,
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (rotatingTexts.length < 2) return undefined
    const timer = setInterval(() => setIndex((previous) => (previous + 1) % rotatingTexts.length), interval)
    return () => clearInterval(timer)
  }, [rotatingTexts.length, interval])

  return (
    <LazyMotion features={domAnimation}>
      <div className={cn('flex flex-row items-center justify-start w-fit tracking-tight', className)}>
        <span className={cn('mr-3 whitespace-nowrap', staticTextClassName)}>{staticText}</span>
        <div className="relative flex items-center">
          <AnimatePresence mode="wait">
            <m.div
              key={rotatingTexts[index]}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={transition}
              className="relative overflow-hidden whitespace-nowrap"
            >
              <div className={cn('absolute inset-0 bg-gradient-to-r from-transparent via-lime-200/10 to-lime-200/25', backgroundClassName)} />
              <span className={cn('relative text-white', rotatingTextClassName)}>{rotatingTexts[index]}</span>
            </m.div>
          </AnimatePresence>
          <m.div
            className={cn('ml-1 w-[3px] bg-lime-400 h-[1em]', cursorClassName)}
            animate={{ opacity: [1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
          />
        </div>
      </div>
    </LazyMotion>
  )
}
