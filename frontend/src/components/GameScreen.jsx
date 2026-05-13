import { motion } from 'framer-motion'
import QuestionCard from './QuestionCard'
import AnswerButtons from './AnswerButtons'
import ConfidenceMeter from './ConfidenceMeter'
import CandidateCounter from './CandidateCounter'
import QuestionHistory from './QuestionHistory'
import { Bot, Lightbulb } from 'lucide-react'

/**
 * Main game screen where questions are displayed and answered
 */
export default function GameScreen({
  question,
  questionNumber,
  confidence,
  remainingCandidates,
  onAnswer,
  isLoading,
}) {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* AI Assistant indicator */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 mb-8"
        >
          {/* AI Avatar */}
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ipl-gold to-ipl-orange p-0.5"
            >
              <div className="w-full h-full rounded-xl bg-ipl-dark flex items-center justify-center">
                <Bot className="w-7 h-7 text-ipl-gold" />
              </div>
            </motion.div>
            {/* Status dot */}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-ipl-dark" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">Cricket AI</h2>
            <p className="text-sm text-white/50">Ask me anything about your player</p>
          </div>

          {/* Hint */}
          <div className="ml-auto hidden md:flex items-center gap-2 text-ipl-cyan/70 text-sm">
            <Lightbulb className="w-4 h-4" />
            <span>Think carefully about each answer</span>
          </div>
        </motion.div>

        {/* Main game area */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Question and answers */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question card */}
            <motion.div
              key={question?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <QuestionCard
                question={question?.text || 'Loading question...'}
                questionNumber={questionNumber}
              />
            </motion.div>

            {/* Answer buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AnswerButtons onAnswer={onAnswer} isLoading={isLoading} />
            </motion.div>
          </div>

          {/* Right: Stats panel */}
          <div className="space-y-4">
            {/* Confidence meter */}
            <ConfidenceMeter confidence={confidence} />

            {/* Candidates remaining */}
            <CandidateCounter count={remainingCandidates} />

            {/* Question history */}
            <QuestionHistory currentQuestion={questionNumber} />
          </div>
        </div>
      </div>
    </div>
  )
}