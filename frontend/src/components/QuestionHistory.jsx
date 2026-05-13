import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

/**
 * Shows question history as a timeline of answered questions
 */
export default function QuestionHistory({ currentQuestion }) {
  // In a real app, this would come from game state
  const questions = Array.from({ length: Math.min(currentQuestion - 1, 5) }, (_, i) => ({
    number: i + 1,
  }))

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm text-white/60 mb-4">Question History</h3>

      {questions.length === 0 ? (
        <p className="text-sm text-white/30 italic">No questions answered yet</p>
      ) : (
        <div className="space-y-3">
          {questions.map((q, index) => (
            <motion.div
              key={q.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              {/* Timeline dot */}
              <div className="relative flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-ipl-gold flex items-center justify-center">
                  <Check className="w-3 h-3 text-ipl-dark" />
                </div>
                {index < questions.length - 1 && (
                  <div className="w-0.5 h-8 bg-ipl-border mt-1" />
                )}
              </div>

              {/* Question number */}
              <span className="text-sm text-white/60">Q{q.number}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}