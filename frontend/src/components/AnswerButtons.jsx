import { motion } from 'framer-motion'
import { ThumbsUp, ThumbsDown, HelpCircle, CircleDot } from 'lucide-react'

/**
 * Answer buttons for question responses
 * Supports: Yes, No, Maybe, Don't Know
 */
export default function AnswerButtons({ onAnswer, isLoading }) {
  const answers = [
    {
      id: 'yes',
      label: 'Yes',
      icon: ThumbsUp,
      gradient: 'from-green-500 to-emerald-600',
      hoverGradient: 'hover:from-green-400 hover:to-emerald-500',
      shadowColor: 'shadow-green-500/30',
    },
    {
      id: 'no',
      label: 'No',
      icon: ThumbsDown,
      gradient: 'from-red-500 to-rose-600',
      hoverGradient: 'hover:from-red-400 hover:to-rose-500',
      shadowColor: 'shadow-red-500/30',
    },
    {
      id: 'maybe',
      label: 'Maybe',
      icon: CircleDot,
      gradient: 'from-amber-500 to-yellow-600',
      hoverGradient: 'hover:from-amber-400 hover:to-yellow-500',
      shadowColor: 'shadow-amber-500/30',
    },
    {
      id: 'dont_know',
      label: "Don't Know",
      icon: HelpCircle,
      gradient: 'from-gray-600 to-gray-700',
      hoverGradient: 'hover:from-gray-500 hover:to-gray-600',
      shadowColor: 'shadow-gray-500/30',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {answers.map((answer, index) => (
        <motion.button
          key={answer.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAnswer(answer.id)}
          disabled={isLoading}
          className={`
            relative group flex flex-col items-center gap-3 p-6 rounded-2xl
            bg-gradient-to-b ${answer.gradient} ${answer.hoverGradient}
            ${answer.shadowColor} shadow-lg
            transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed
            overflow-hidden
          `}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Icon */}
          <answer.icon className="w-8 h-8 text-white relative z-10" />

          {/* Label */}
          <span className="text-lg font-semibold text-white relative z-10">
            {answer.label}
          </span>

          {/* Keyboard hint */}
          <span className="absolute bottom-2 text-xs text-white/40 font-mono">
            {['Y', 'N', 'M', 'D'][index]}
          </span>
        </motion.button>
      ))}
    </div>
  )
}