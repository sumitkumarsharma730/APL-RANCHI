import { useState, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

/**
 * API service for connecting to the backend
 * Properly handles errors, timeouts, and response validation
 */
export const api = {
  /**
   * Make a fetch request with error handling
   */
  async request(endpoint, options = {}) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      clearTimeout(timeout)

      let data
      try {
        data = await response.json()
      } catch {
        throw new ApiError('Invalid JSON response from server', response.status, 'PARSE_ERROR')
      }

      if (!response.ok) {
        const errorMessage = data?.error?.message || `HTTP ${response.status}: ${response.statusText}`
        throw new ApiError(errorMessage, response.status, data?.error?.code || 'REQUEST_FAILED')
      }

      if (!data.success) {
        throw new ApiError(data?.error?.message || 'Request failed', response.status, data?.error?.code)
      }

      return data

    } catch (error) {
      clearTimeout(timeout)

      if (error.name === 'AbortError') {
        throw new ApiError('Request timed out', 408, 'TIMEOUT')
      }

      if (error instanceof ApiError) {
        throw error
      }

      throw new ApiError(error.message || 'Network error', 0, 'NETWORK_ERROR')
    }
  },

  async healthCheck() {
    return this.request('/game/health')
  },

  async startGame() {
    return this.request('/game/start', { method: 'POST' })
  },

  async submitAnswer(sessionId, questionId, answer) {
    return this.request(`/game/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ questionId, answer })
    })
  },

  async submitFeedback(sessionId, correct) {
    return this.request(`/game/${sessionId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ correct })
    })
  },

  async getGameState(sessionId) {
    return this.request(`/game/${sessionId}`, { method: 'GET' })
  },

  async restartGame(sessionId) {
    return this.request(`/game/${sessionId}/restart`, { method: 'POST' })
  }
}

/**
 * Hook for managing game session
 */
export function useGameSession() {
  const [state, setState] = useState({
    sessionId: null,
    currentQuestion: null,
    questionNumber: 0,
    confidence: 0,
    remainingCandidates: 0,
    askedQuestions: [],
    status: 'idle',
    guess: null,
    error: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const clearError = useCallback(() => {
    setError(null)
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const startGame = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    clearError()

    try {
      const result = await api.startGame()

      setState({
        sessionId: result.sessionId,
        currentQuestion: result.question,
        questionNumber: result.questionNumber || 1,
        confidence: result.confidence || 0,
        remainingCandidates: result.remainingCandidates || 0,
        askedQuestions: [],
        status: 'playing',
        guess: null,
        error: null
      })

      return result

    } catch (err) {
      const errorMsg = err.message || 'Failed to start game. Please try again.'
      setError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [clearError])

  const submitAnswer = useCallback(async (answer) => {
    if (!state.sessionId) {
      const err = new Error('No active game session')
      setError(err.message)
      throw err
    }

    if (!state.currentQuestion) {
      const err = new Error('No question to answer')
      setError(err.message)
      throw err
    }

    setIsLoading(true)
    setError(null)

    try {
      const questionId = state.currentQuestion.id !== undefined
        ? state.currentQuestion.id
        : state.currentQuestion.text

      const result = await api.submitAnswer(state.sessionId, questionId, answer)

      if (result.status === 'guess') {
        setState(prev => ({
          ...prev,
          questionNumber: result.questionNumber,
          confidence: result.confidence,
          status: 'guessing',
          guess: result.player,
          error: null
        }))
      } else if (result.status === 'continue') {
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
      const errorMsg = err.message || 'Failed to submit answer. Please try again.'
      setError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [state.sessionId, state.currentQuestion])

  const submitFeedback = useCallback(async (isCorrect) => {
    if (!state.sessionId) {
      const err = new Error('No active game session')
      setError(err.message)
      throw err
    }

    setIsLoading(true)

    try {
      const result = await api.submitFeedback(state.sessionId, isCorrect)

      setState(prev => ({
        ...prev,
        status: isCorrect ? 'complete' : 'feedback'
      }))

      return result

    } catch (err) {
      const errorMsg = err.message || 'Failed to submit feedback.'
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [state.sessionId])

  const resetGame = useCallback(async () => {
    setState({
      sessionId: null,
      currentQuestion: null,
      questionNumber: 0,
      confidence: 0,
      remainingCandidates: 0,
      askedQuestions: [],
      status: 'idle',
      guess: null,
      error: null
    })
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