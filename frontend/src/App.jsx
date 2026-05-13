import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LandingPage from './components/LandingPage'
import GameScreen from './components/GameScreen'
import FinalGuess from './components/FinalGuess'
import FeedbackModal from './components/FeedbackModal'
import { useGameSession } from './services/api'
import { Bot, Sparkles } from 'lucide-react'

/**
 * Main App Component
 * Handles routing between landing, game, and result screens
 */
function App() {
  const { state, isLoading, error, startGame, submitAnswer, submitFeedback, resetGame } = useGameSession()
  const [showLanding, setShowLanding] = useState(true)

  /**
   * Handle start button click
   */
  const handleStart = async () => {
    setShowLanding(false)
    await startGame()
  }

  /**
   * Handle answer submission
   */
  const handleAnswer = async (answer) => {
    await submitAnswer(answer)
  }

  /**
   * Handle final guess feedback
   */
  const handleFeedback = async (isCorrect) => {
    await submitFeedback(isCorrect)
  }

  /**
   * Handle game restart
   */
  const handleRestart = () => {
    setShowLanding(true)
    resetGame()
  }

  return (
    <div className="min-h-screen bg-ipl-dark relative overflow-hidden">
      {/* Animated background particles */}
      <BackgroundParticles />

      {/* Main content */}
      <AnimatePresence mode="wait">
        {showLanding ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPage onStart={handleStart} isLoading={isLoading} />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
          >
            {/* Header */}
            <GameHeader
              questionNumber={state.questionNumber}
              confidence={state.confidence}
              onRestart={handleRestart}
            />

            {/* Error banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            {/* Main game content */}
            {state.status === 'guessing' ? (
              <FinalGuess
                guess={state.guess}
                confidence={state.confidence}
                onFeedback={handleFeedback}
                onRestart={handleRestart}
                isLoading={isLoading}
              />
            ) : state.status === 'feedback' ? (
              <FeedbackModal
                onSubmit={(correct) => handleFeedback(correct)}
                onRestart={handleRestart}
                isLoading={isLoading}
              />
            ) : (
              <GameScreen
                question={state.currentQuestion}
                questionNumber={state.questionNumber}
                confidence={state.confidence}
                remainingCandidates={state.remainingCandidates}
                onAnswer={handleAnswer}
                isLoading={isLoading}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && <LoadingOverlay />}
      </AnimatePresence>
    </div>
  )
}

/**
 * Animated background with floating particles
 */
function BackgroundParticles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-ipl-gold/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-ipl-cyan/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ipl-orange/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Floating cricket elements */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-ipl-gold/30 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          }}
          animate={{
            y: [null, -100, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(212, 175, 55, 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}

/**
 * Game header with progress and controls
 */
function GameHeader({ questionNumber, confidence, onRestart }) {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-40 glass px-6 py-4"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ipl-gold to-ipl-orange flex items-center justify-center">
            <Bot className="w-5 h-5 text-ipl-dark" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold gradient-text">AI Akinator</h1>
            <p className="text-xs text-white/50">IPL Edition</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          {/* Question counter */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-ipl-gold" />
            <span className="text-sm text-white/70">Question</span>
            <span className="text-lg font-bold text-white">{questionNumber}</span>
          </div>

          {/* Confidence indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70">Confidence</span>
            <div className="w-24 h-2 bg-ipl-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-ipl-gold to-ipl-orange"
                initial={{ width: 0 }}
                animate={{ width: `${confidence * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-sm font-bold text-ipl-gold">{Math.round(confidence * 100)}%</span>
          </div>

          {/* Restart button */}
          <button
            onClick={onRestart}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            New Game
          </button>
        </div>
      </div>
    </motion.header>
  )
}

/**
 * Loading overlay with AI thinking animation
 */
function LoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-ipl-dark/80 backdrop-blur-sm flex items-center justify-center"
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="flex flex-col items-center gap-4"
      >
        {/* AI thinking animation */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-ipl-gold to-ipl-orange p-1">
            <div className="w-full h-full rounded-full bg-ipl-dark flex items-center justify-center">
              <Bot className="w-10 h-10 text-ipl-gold" />
            </div>
          </div>
          {/* Pulsing rings */}
          <div className="absolute inset-0 rounded-full border-2 border-ipl-gold/50 animate-ping" />
        </div>

        <div className="text-center">
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-lg font-medium text-white/70"
          >
            AI is analyzing...
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default App