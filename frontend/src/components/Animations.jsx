import { motion, AnimatePresence } from 'framer-motion'
import { Bot } from 'lucide-react'

/**
 * AI typing indicator with bouncing dots animation
 */
export default function ThinkingIndicator({ message = 'Thinking...' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl glass max-w-xs"
    >
      {/* AI Avatar mini */}
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ipl-gold to-ipl-orange flex items-center justify-center">
        <Bot className="w-4 h-4 text-ipl-dark" />
      </div>

      {/* Message */}
      <span className="text-sm text-white/70">{message}</span>

      {/* Animated dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 bg-ipl-gold rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

/**
 * Success animation for correct guess
 */
export function SuccessAnimation() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: [0, 1.2, 1] }}
      transition={{ duration: 0.5 }}
      className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center"
    >
      <motion.svg
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-10 h-10 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <motion.path
          d="M5 13l4 4L19 7"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        />
      </motion.svg>
    </motion.div>
  )
}

/**
 * Celebration particles
 */
export function CelebrationParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
          }}
          animate={{
            x: (Math.random() - 0.5) * 200,
            y: Math.random() * -300 - 100,
            opacity: 0,
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 1 + Math.random(),
            delay: i * 0.05,
          }}
          className="absolute w-3 h-3 rounded-full"
          style={{
            left: `${50 + (Math.random() - 0.5) * 20}%`,
            top: '50%',
            background: ['#D4AF37', '#F05A28', '#00D4FF', '#22c55e'][i % 4],
          }}
        />
      ))}
    </div>
  )
}