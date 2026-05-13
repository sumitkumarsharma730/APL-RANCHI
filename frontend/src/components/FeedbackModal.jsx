import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Send, RotateCcw } from 'lucide-react'

/**
 * Feedback modal for incorrect guesses
 */
export default function FeedbackModal({ onSubmit, onRestart, isLoading }) {
  const [feedback, setFeedback] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState('')

  const handleSubmit = () => {
    onSubmit(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        {/* Modal card */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-2 bg-gradient-to-r from-red-500/30 to-orange-500/30 rounded-3xl blur-xl opacity-50" />

          <div className="relative glass-card p-8 rounded-3xl">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <X className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                Not quite right!
              </h2>
              <p className="text-white/60">
                Help me learn for next time
              </p>
            </div>

            {/* Feedback options */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Who were you thinking of?
                </label>
                <input
                  type="text"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter player name..."
                  className="w-full px-4 py-3 rounded-xl bg-ipl-border/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-ipl-gold/50 transition-colors"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={onRestart}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>

              <button
                onClick={handleSubmit}
                disabled={!feedback.trim() || isLoading}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-ipl-gold to-ipl-orange text-ipl-dark font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Submitting...' : 'Submit'}
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Educational note */}
        <p className="text-center text-white/30 text-sm mt-6">
          Every guess helps improve the AI's reasoning
        </p>
      </motion.div>
    </div>
  )
}