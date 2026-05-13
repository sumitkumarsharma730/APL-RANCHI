import { useState, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

/**
 * API service for connecting to the backend
 */
export const api = {
  /**
   * Start a new game
   */
  async startGame() {
    const response = await fetch(`${API_BASE}/game/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await response.json()
    return data
  },

  /**
   * Submit answer to current question
   */
  async submitAnswer(sessionId, questionId, answer) {
    const response = await fetch(`${API_BASE}/game/${sessionId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, answer })
    })
    const data = await response.json()
    return data
  },

  /**
   * Submit feedback on AI guess
   */
  async submitFeedback(sessionId, correct) {
    const response = await fetch(`${API_BASE}/game/${sessionId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correct })
    })
    const data = await response.json()
    return data
  },

  /**
   * Get current game state
   */
  async getGameState(sessionId) {
    const response = await fetch(`${API_BASE}/game/${sessionId}`, {
      method: 'GET'
    })
    const data = await response.json()
    return data
  },

  /**
   * Restart game
   */
  async restartGame(sessionId) {
    const response = await fetch(`${API_BASE}/game/${sessionId}/restart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await response.json()
    return data
  },

  /**
   * Health check
   */
  async healthCheck() {
    const response = await fetch(`${API_BASE}/game/health`, {
      method: 'GET'
    })
    return response.json()
  }
}

/**
 * Hook for managing game session
 * Connects frontend to the backend API
 */
export function useGameSession() {
  const [state, setState] = useState({
    sessionId: null,
    currentQuestion: null,
    questionNumber: 0,
    confidence: 0,
    remainingCandidates: 0,
    askedQuestions: [],
    status: 'playing',
    guess: null,
    error: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Start a new game session
   */
  const startGame = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await api.startGame()

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to start game')
      }

      setState({
        sessionId: result.sessionId,
        currentQuestion: result.question,
        questionNumber: result.questionNumber,
        confidence: result.confidence,
        remainingCandidates: result.remainingCandidates,
        askedQuestions: [],
        status: 'playing',
        guess: null,
        error: null
      })

      return result

    } catch (err) {
      setError(err.message || 'Failed to start game. Please try again.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Submit an answer to the current question
   */
  const submitAnswer = useCallback(async (answer) => {
    if (!state.sessionId || !state.currentQuestion) {
      setError('No active game session')
      return
    }

    setIsLoading(true)

    try {
      const result = await api.submitAnswer(
        state.sessionId,
        state.currentQuestion.id,
        answer
      )

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to submit answer')
      }

      // Update state based on result
      if (result.status === 'guess') {
        // AI made a guess!
        setState(prev => ({
          ...prev,
          questionNumber: result.questionNumber,
          confidence: result.confidence,
          status: 'guessing',
          guess: result.player,
          error: null
        }))
      } else if (result.status === 'continue') {
        // Continue asking questions
        setState(prev => ({
          ...prev,
          currentQuestion: result.question,
          questionNumber: result.questionNumber,
          confidence: result.confidence,
          remainingCandidates: result.remainingCandidates,
          askedQuestions: [...prev.askedQuestions, prev.currentQuestion],
          error: null
        }))
      } else if (result.status === 'complete') {
        // Out of questions, best guess made
        setState(prev => ({
          ...prev,
          status: 'guessing',
          guess: result.player,
          confidence: result.confidence,
          error: null
        }))
      }

      return result

    } catch (err) {
      setError(err.message || 'Failed to submit answer. Please try again.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [state.sessionId, state.currentQuestion])

  /**
   * Submit feedback (correct/incorrect guess)
   */
  const submitFeedback = useCallback(async (isCorrect) => {
    if (!state.sessionId) {
      setError('No active game session')
      return
    }

    setIsLoading(true)

    try {
      const result = await api.submitFeedback(state.sessionId, isCorrect)

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to submit feedback')
      }

      setState(prev => ({
        ...prev,
        status: isCorrect ? 'complete' : 'feedback',
      }))

      return result

    } catch (err) {
      setError(err.message || 'Failed to submit feedback.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [state.sessionId])

  /**
   * Reset the game (start fresh)
   */
  const resetGame = useCallback(async () => {
    if (state.sessionId) {
      try {
        await api.restartGame(state.sessionId)
      } catch (err) {
        // If restart fails, just start a new game
      }
    }

    // Start new game
    await startGame()
  }, [state.sessionId, startGame])

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    state,
    isLoading,
    error,
    startGame,
    submitAnswer,
    submitFeedback,
    resetGame,
    clearError
  }
}