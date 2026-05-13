/**
 * REASONING ENGINE
 *
 * This is the main orchestration engine that coordinates all other components.
 * It manages the game loop and orchestrates:
 * - Probability initialization
 * - Question selection
 * - Probability updates
 * - Confidence calculation
 * - Final guess determination
 */

import { initializeProbabilities, updateAllProbabilities, normalizeProbabilities,
         calculateConfidence, getTopCandidates, getProbabilitySummary } from './probabilityEngine.js';
import { selectBestQuestion, shouldMakeGuess, getQuestionSuggestions, analyzeQuestions } from './questionSelector.js';

/**
 * Configuration for the reasoning engine
 */
const CONFIG = {
  CONFIDENCE_THRESHOLD: 0.80,     // 80% confidence to make a guess
  MAX_QUESTIONS: 12,              // Maximum questions before forced guess
  MIN_CANDIDATES_FOR_GUESS: 3,    // Make guess if only this many left
  EFFECTIVE_CANDIDATE_THRESHOLD: 1.5 // If effective candidates <= this, make guess
};

/**
 * Create a new game state
 *
 * @param {Array} players - All available players
 * @param {Array} questions - All available questions
 * @returns {object} - Initial game state
 */
export function createGameState(players, questions) {
  const probabilities = initializeProbabilities(players);
  const firstQuestion = selectBestQuestion(players, questions, []);

  return {
    players,
    questions,
    candidates: players.map(p => p.id), // Start with all players
    probabilities,
    askedQuestions: [],
    currentQuestion: firstQuestion,
    questionCount: 0,
    status: 'playing', // 'playing', 'guessing', 'complete', 'failed'
    guess: null,
    guessConfidence: 0
  };
}

/**
 * Process an answer to the current question
 *
 * This is the main game loop function. It:
 * 1. Updates probabilities based on the answer
 * 2. Filters candidates
 * 3. Checks if we should make a guess
 * 4. Selects the next question if needed
 *
 * @param {object} gameState - Current game state
 * @param {string} answer - Answer: 'yes', 'no', 'maybe', 'dont_know'
 * @returns {object} - Updated game state and response data
 */
export function processAnswer(gameState, answer) {
  const { players, questions, candidates, probabilities, askedQuestions, questionCount } = gameState;

  // Get current candidates as player objects
  const currentCandidates = players.filter(p => candidates.includes(p.id));

  // Update probabilities based on answer
  const updatedProbabilities = updateAllProbabilities(
    probabilities,
    players,
    gameState.currentQuestion.id,
    answer,
    questions
  );

  // Normalize probabilities
  const normalizedProbabilities = normalizeProbabilities(updatedProbabilities);

  // Update asked questions list
  const newAskedQuestions = [...askedQuestions, gameState.currentQuestion.id];
  const newQuestionCount = questionCount + 1;

  // Calculate confidence
  const confidence = calculateConfidence(normalizedProbabilities);

  // Get top candidate
  const topCandidates = getTopCandidates(normalizedProbabilities, 1);
  const topCandidateId = topCandidates.length > 0 ? topCandidates[0].playerId : null;
  const topPlayer = topCandidateId ? players.find(p => p.id === topCandidateId) : null;

  // Check if we should make a guess
  const candidatesAfterFilter = players.filter(p => {
    const prob = normalizedProbabilities[p.id];
    return prob > 0.001; // Filter out near-zero probability players
  });

  const guessCheck = shouldMakeGuess(
    normalizedProbabilities,
    candidatesAfterFilter,
    newQuestionCount,
    CONFIG.MAX_QUESTIONS
  );

  // Prepare response
  let response = {
    questionNumber: newQuestionCount,
    confidence: confidence,
    remainingCandidates: candidatesAfterFilter.length,
    probabilities: normalizedProbabilities,
    topCandidate: topPlayer ? {
      id: topPlayer.id,
      name: topPlayer.name,
      probability: Math.round(normalizedProbabilities[topPlayer.id] * 100) / 100
    } : null
  };

  // Determine next state
  if (guessCheck.shouldGuess) {
    // Make a guess!
    const guessPlayer = topPlayer;

    return {
      gameState: {
        ...gameState,
        probabilities: normalizedProbabilities,
        askedQuestions: newAskedQuestions,
        questionCount: newQuestionCount,
        status: 'guessing',
        guess: guessPlayer,
        guessConfidence: confidence
      },
      response: {
        ...response,
        status: 'guess',
        player: guessPlayer ? {
          id: guessPlayer.id,
          name: guessPlayer.name,
          role: guessPlayer.role,
          team: guessPlayer.teams?.[0] || 'Unknown'
        } : null,
        confidence: Math.round(confidence * 100) / 100,
        guessMade: true,
        reason: guessCheck.reason
      }
    };
  }

  // Select next question
  const nextQuestion = selectBestQuestion(candidatesAfterFilter, questions, newAskedQuestions);

  if (!nextQuestion) {
    // No more questions available - make best guess
    return {
      gameState: {
        ...gameState,
        probabilities: normalizedProbabilities,
        askedQuestions: newAskedQuestions,
        questionCount: newQuestionCount,
        status: 'complete',
        guess: topPlayer,
        guessConfidence: confidence
      },
      response: {
        ...response,
        status: 'complete',
        player: topPlayer ? {
          id: topPlayer.id,
          name: topPlayer.name,
          role: topPlayer.role,
          team: topPlayer.teams?.[0] || 'Unknown'
        } : null,
        confidence: Math.round(confidence * 100) / 100,
        message: 'Out of questions! Best guess:'
      }
    };
  }

  // Continue playing
  return {
    gameState: {
      ...gameState,
      probabilities: normalizedProbabilities,
      askedQuestions: newAskedQuestions,
      questionCount: newQuestionCount,
      currentQuestion: nextQuestion
    },
    response: {
      ...response,
      status: 'continue',
      question: {
        id: nextQuestion.id,
        text: nextQuestion.question,
        category: nextQuestion.category
      },
      questionScoring: nextQuestion.scoringData
    }
  };
}

/**
 * Start a new game session
 *
 * @param {Array} players - All available players
 * @param {Array} questions - All available questions
 * @returns {object} - Initial game state and first question
 */
export function startGame(players, questions) {
  const gameState = createGameState(players, questions);

  return {
    sessionId: generateSessionId(),
    gameState,
    response: {
      status: 'playing',
      question: gameState.currentQuestion ? {
        id: gameState.currentQuestion.id,
        text: gameState.currentQuestion.question,
        category: gameState.currentQuestion.category
      } : null,
      questionNumber: 0,
      confidence: calculateConfidence(gameState.probabilities),
      remainingCandidates: players.length,
      message: 'Game started! Think of any IPL player.'
    }
  };
}

/**
 * Get current game status
 *
 * @param {object} gameState - Current game state
 * @returns {object} - Status information
 */
export function getGameStatus(gameState) {
  const topCandidates = getTopCandidates(gameState.probabilities, 3);
  const topPlayerObjects = topCandidates.map(tc => {
    const player = gameState.players.find(p => p.id === tc.playerId);
    return player ? { name: player.name, probability: tc.probability } : null;
  }).filter(Boolean);

  return {
    status: gameState.status,
    questionCount: gameState.questionCount,
    currentQuestion: gameState.currentQuestion,
    confidence: calculateConfidence(gameState.probabilities),
    remainingCandidates: gameState.candidates.length,
    top3: topPlayerObjects,
    guess: gameState.guess,
    guessConfidence: gameState.guessConfidence
  };
}

/**
 * Generate a unique session ID
 */
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Get analysis of current game state for debugging
 *
 * @param {object} gameState - Current game state
 * @returns {object} - Detailed analysis
 */
export function analyzeGameState(gameState) {
  const analysis = analyzeQuestions(
    gameState.players.filter(p => gameState.candidates.includes(p.id)),
    gameState.questions,
    gameState.askedQuestions
  );

  const probSummary = getProbabilitySummary(
    gameState.probabilities,
    gameState.players
  );

  return {
    questionAnalysis: analysis,
    probabilitySummary: probSummary,
    gameProgress: {
      asked: gameState.askedQuestions.length,
      remaining: gameState.questions.length - gameState.askedQuestions.length,
      confidence: calculateConfidence(gameState.probabilities)
    }
  };
}