import { motion } from 'framer-motion'
import { Trophy, RotateCcw } from 'lucide-react'

/**
 * Final guess screen when AI reaches 80%+ confidence
 */
export default function FinalGuess({ guess, confidence, onFeedback, onRestart, isLoading }) {
  const percentage = Math.round(confidence * 100)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full"
      >
        {/* Success header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-ipl-gold to-ipl-orange mb-4"
          >
            <Trophy className="w-8 h-8 text-ipl-dark" />
          </motion.div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">
            I think I've got it!
          </h2>
          <p className="text-white/60">
            With {percentage}% confidence...
          </p>
        </motion.div>

        {/* Player card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative mb-8"
        >
          {/* Glow effect */}
          <div className="absolute -inset-2 bg-gradient-to-r from-ipl-gold/50 via-ipl-orange/50 to-ipl-gold/50 rounded-3xl blur-xl opacity-50" />

          {/* Card */}
          <div className="relative glass-card p-8 rounded-3xl text-center">
            {/* Avatar placeholder */}
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-ipl-gold to-ipl-orange p-1">
              <div className="w-full h-full rounded-full bg-ipl-dark flex items-center justify-center">
                <span className="text-5xl font-bold text-ipl-gold">
                  {guess?.name?.charAt(0) || '?'}
                </span>
              </div>
            </div>

            {/* Name */}
            <h3 className="text-3xl font-display font-bold gradient-text mb-2">
              {guess?.name || 'Unknown Player'}
            </h3>

            {/* Role */}
            <p className="text-lg text-white/70 mb-1">
              {guess?.role || 'Player'}
            </p>

            {/* Team */}
            <p className="text-sm text-white/50">
              {guess?.team || 'IPL'}
            </p>

            {/* Confidence badge */}
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
              <span className="text-green-400 font-bold">{percentage}%</span>
              <span className="text-green-400/70 text-sm">confidence</span>
            </div>
          </div>
        </motion.div>

        {/* Feedback buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <p className="text-white/60 mb-6">Was I correct?</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFeedback(true)}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-green-500 hover:bg-green-400 text-white font-semibold shadow-lg shadow-green-500/30 disabled:opacity-50"
            >
              <span>Yes, that's right!</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFeedback(false)}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-red-500 hover:bg-red-400 text-white font-semibold shadow-lg shadow-red-500/30 disabled:opacity-50"
            >
              <span>No, wrong guess</span>
            </motion.button>
          </div>

          {/* Play again */}
          <button
            onClick={onRestart}
            className="mt-6 text-white/40 hover:text-white/70 transition-colors flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start a new game</span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}