import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { Users } from 'lucide-react'

/**
 * Animated counter showing remaining candidate players
 */
export default function CandidateCounter({ count }) {
  const springValue = useSpring(0, { stiffness: 50, damping: 20 })
  const displayValue = useTransform(springValue, (v) => Math.round(v))

  useEffect(() => {
    springValue.set(count)
  }, [count, springValue])

  return (
    <div className="glass-card p-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Users className="w-5 h-5 text-ipl-cyan" />
        <span className="text-sm text-white/60">Candidates Left</span>
      </div>

      <div className="relative">
        {/* Large number */}
        <motion.span className="text-5xl font-display font-bold gradient-text">
          {displayValue}
        </motion.span>

        {/* Pulse effect when count changes */}
        <motion.div
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 rounded-full bg-ipl-cyan/30 blur-sm"
        />
      </div>

      {/* Visual representation */}
      <div className="mt-4 h-2 bg-ipl-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-ipl-cyan to-ipl-gold"
          initial={{ width: '100%' }}
          animate={{ width: `${(count / 200) * 100}%` }}
          transition={{ type: 'spring', stiffness: 100 }}
        />
      </div>

      <p className="mt-2 text-xs text-white/30">
        of 200+ IPL players
      </p>
    </div>
  )
}