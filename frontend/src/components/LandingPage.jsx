import { motion } from 'framer-motion'
import { Bot, Sparkles, Play, Zap, Target, Brain } from 'lucide-react'

/**
 * Landing Page - First screen users see
 * Features hero animation and start button
 */
export default function LandingPage({ onStart, isLoading }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* Main content */}
      <div className="text-center z-10 max-w-4xl">
        {/* AI Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
        >
          <Brain className="w-4 h-4 text-ipl-cyan" />
          <span className="text-sm text-white/80">Powered by Probabilistic AI</span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight"
        >
          Think of any
          <br />
          <span className="gradient-text">IPL Player</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto"
        >
          Our AI will read your cricket mind and guess who you're thinking about
          in just 8-12 questions.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <FeaturePill icon={<Zap />} text="Adaptive Questions" delay={0} />
          <FeaturePill icon={<Target />} text="80%+ Accuracy" delay={100} />
          <FeaturePill icon={<Sparkles />} text="Smart Deduction" delay={200} />
        </motion.div>

        {/* Start button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={onStart}
            disabled={isLoading}
            className="group relative px-10 py-4 rounded-2xl bg-gradient-to-r from-ipl-gold to-ipl-orange text-ipl-dark font-bold text-lg
                       hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed
                       shadow-lg shadow-ipl-gold/30 hover:shadow-xl hover:shadow-ipl-gold/50"
          >
            <span className="flex items-center gap-3">
              {isLoading ? 'Loading...' : 'Start Game'}
              <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" />
            </span>
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 flex justify-center gap-12 text-white/40"
        >
          <Stat label="Players" value="200+" />
          <Stat label="Questions" value="40+" />
          <Stat label="Accuracy" value="85%" />
        </motion.div>
      </div>

      {/* Floating cricket ball decoration */}
      <FloatingDecoration />
    </div>
  )
}

/**
 * Individual feature pill component
 */
function FeaturePill({ icon, text, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + delay / 1000 }}
      className="flex items-center gap-2 px-4 py-2 rounded-full glass"
    >
      <span className="text-ipl-gold">{icon}</span>
      <span className="text-sm text-white/80">{text}</span>
    </motion.div>
  )
}

/**
 * Stat display component
 */
function Stat({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-ipl-gold">{value}</div>
      <div className="text-sm">{label}</div>
    </div>
  )
}

/**
 * Floating cricket ball decoration
 */
function FloatingDecoration() {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
        rotate: [0, 10, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="absolute bottom-20 right-10 opacity-20"
    >
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="30" r="28" stroke="currentColor" strokeWidth="2" className="text-ipl-gold" />
        <path d="M20 30 Q30 20 40 30 Q30 40 20 30" stroke="currentColor" strokeWidth="1.5" className="text-ipl-gold" fill="none" />
      </svg>
    </motion.div>
  )
}