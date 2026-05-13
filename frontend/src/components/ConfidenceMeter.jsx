import { motion } from 'framer-motion'

/**
 * Visual confidence meter showing AI certainty
 */
export default function ConfidenceMeter({ confidence }) {
  const percentage = Math.round(confidence * 100)
  const isHighConfidence = percentage >= 80

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-white/60">AI Confidence</span>
        <motion.span
          key={percentage}
          initial={{ scale: 1.2, color: '#D4AF37' }}
          animate={{ scale: 1, color: isHighConfidence ? '#22c55e' : '#D4AF37' }}
          className="text-xl font-bold"
        >
          {percentage}%
        </motion.span>
      </div>

      {/* Progress bar */}
      <div className="relative h-4 bg-ipl-border rounded-full overflow-hidden">
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-ipl-gold to-ipl-orange"
          style={{ width: `${percentage}%` }}
          layoutId="confidence-bar"
        />

        {/* Animated shine */}
        <motion.div
          animate={{
            x: ['0%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{ width: '50%' }}
        />
      </div>

      {/* Threshold markers */}
      <div className="flex justify-between mt-2 text-xs text-white/30">
        <span>0%</span>
        <span className="text-ipl-gold">50%</span>
        <span className="text-green-400">80%</span>
        <span>100%</span>
      </div>

      {/* Status text */}
      <div className="mt-4 text-center">
        {percentage >= 80 ? (
          <span className="text-green-400 text-sm font-medium">Ready to guess!</span>
        ) : percentage >= 50 ? (
          <span className="text-ipl-gold text-sm font-medium">Gaining confidence...</span>
        ) : (
          <span className="text-white/40 text-sm">Narrowing down candidates...</span>
        )}
      </div>
    </div>
  )
}