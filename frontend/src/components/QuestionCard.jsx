import { motion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'

/**
 * Question card displaying current AI question
 */
export default function QuestionCard({ question, questionNumber }) {
  return (
    <div className="relative">
      {/* Gradient border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-ipl-gold/50 via-ipl-orange/50 to-ipl-gold/50 rounded-3xl blur-sm opacity-50" />

      {/* Main card */}
      <div className="relative glass-card p-8 rounded-3xl">
        {/* Question number badge */}
        <div className="absolute -top-4 left-6">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-ipl-gold to-ipl-orange">
            <HelpCircle className="w-4 h-4 text-ipl-dark" />
            <span className="text-sm font-bold text-ipl-dark">Question {questionNumber}</span>
          </div>
        </div>

        {/* Question text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center pt-4"
        >
          <p className="text-2xl md:text-3xl font-display font-semibold text-white leading-relaxed">
            {question}
          </p>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-8 rounded-full bg-ipl-gold/20 blur-sm" />
        <div className="absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-8 rounded-full bg-ipl-orange/20 blur-sm" />
      </div>
    </div>
  )
}