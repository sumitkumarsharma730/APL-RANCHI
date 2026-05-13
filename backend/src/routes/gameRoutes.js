/**
 * GAME ROUTES
 *
 * API endpoints for the AI Akinator game.
 *
 * Endpoints:
 * - GET /api/game/health - Health check
 * - GET /api/game/stats - Server stats
 * - POST /api/game/start - Start new game
 * - POST /api/game/:sessionId/answer - Submit answer
 * - POST /api/game/:sessionId/feedback - Submit feedback
 * - GET /api/game/:sessionId - Get game state
 * - GET /api/game/:sessionId/history - Question history
 * - POST /api/game/:sessionId/restart - Restart game
 */

import express from 'express';
import { createSession, getSession, updateSession, getSessionCount } from '../sessions/sessions.js';
import { startGame, processAnswer, getGameStatus } from '../engines/reasoningEngine.js';
import { loadPlayers, loadQuestions } from '../data/loader.js';
import { normalizeAnswer, successResponse, errorResponse, log, delay } from '../utils/helpers.js';

const router = express.Router();

// Data caching
let playersCache = null;
let questionsCache = null;

function getPlayers() {
  if (!playersCache) playersCache = loadPlayers();
  return playersCache;
}

function getQuestions() {
  if (!questionsCache) questionsCache = loadQuestions();
  return questionsCache;
}

// ============ HEALTH & STATS ============

router.get('/health', (req, res) => {
  res.json(successResponse({
    status: 'healthy',
    uptime: process.uptime(),
    players: getPlayers().length,
    questions: getQuestions().length
  }));
});

router.get('/stats', (req, res) => {
  res.json(successResponse({
    activeSessions: getSessionCount(),
    playersLoaded: getPlayers().length,
    questionsLoaded: getQuestions().length
  }));
});

// ============ GAME ENDPOINTS ============

router.post('/start', async (req, res) => {
  try {
    const players = getPlayers();
    const questions = getQuestions();

    const { sessionId, gameState, response } = startGame(players, questions);
    createSession(sessionId, gameState);

    log('info', `New game started: ${sessionId}`);

    res.json(successResponse({
      sessionId,
      ...response
    }));

  } catch (error) {
    log('error', `Error starting game: ${error.message}`);
    res.status(500).json(errorResponse('Failed to start game', 'START_ERROR'));
  }
});

router.post('/:sessionId/answer', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, answer: rawAnswer } = req.body;

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json(errorResponse('Session not found', 'SESSION_NOT_FOUND'));
    }

    if (!questionId) {
      return res.status(400).json(errorResponse('Question ID required', 'MISSING_QUESTION_ID'));
    }

    const answer = normalizeAnswer(rawAnswer);
    await delay(300 + Math.random() * 500);

    const { gameState, response } = processAnswer(session.gameState, answer);
    updateSession(sessionId, gameState);

    log('info', `Answer: ${sessionId}, Q${response.questionNumber}, ${answer}, conf: ${Math.round(response.confidence * 100)}%`);

    res.json(successResponse(response));

  } catch (error) {
    log('error', `Error processing answer: ${error.message}`);
    res.status(500).json(errorResponse('Failed to process answer', 'ANSWER_ERROR'));
  }
});

router.post('/:sessionId/feedback', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { correct, correctPlayerName } = req.body;

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json(errorResponse('Session not found', 'SESSION_NOT_FOUND'));
    }

    session.metadata.feedbackGiven = true;
    session.metadata.lastGuessCorrect = correct;

    log('info', `Feedback: ${sessionId}, correct: ${correct}`);

    res.json(successResponse({
      message: correct ? 'Great! I guessed correctly!' : 'Thanks for the feedback!',
      correct
    }));

  } catch (error) {
    log('error', `Error recording feedback: ${error.message}`);
    res.status(500).json(errorResponse('Failed to record feedback', 'FEEDBACK_ERROR'));
  }
});

router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json(errorResponse('Session not found', 'SESSION_NOT_FOUND'));
    }

    const status = getGameStatus(session.gameState);

    res.json(successResponse({
      sessionId,
      ...status
    }));

  } catch (error) {
    log('error', `Error getting game state: ${error.message}`);
    res.status(500).json(errorResponse('Failed to get game state', 'STATE_ERROR'));
  }
});

router.get('/:sessionId/history', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json(errorResponse('Session not found', 'SESSION_NOT_FOUND'));
    }

    const history = session.gameState.askedQuestions.map(qId => {
      const question = getQuestions().find(q => q.id === qId);
      return question ? { id: question.id, question: question.question, category: question.category } : null;
    }).filter(Boolean);

    res.json(successResponse({ questions: history, totalQuestions: history.length }));

  } catch (error) {
    log('error', `Error getting history: ${error.message}`);
    res.status(500).json(errorResponse('Failed to get history', 'HISTORY_ERROR'));
  }
});

router.post('/:sessionId/restart', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json(errorResponse('Session not found', 'SESSION_NOT_FOUND'));
    }

    const { gameState, response } = startGame(getPlayers(), getQuestions());
    updateSession(sessionId, gameState);

    log('info', `Game restarted: ${sessionId}`);

    res.json(successResponse({ sessionId, ...response }));

  } catch (error) {
    log('error', `Error restarting game: ${error.message}`);
    res.status(500).json(errorResponse('Failed to restart game', 'RESTART_ERROR'));
  }
});

export default router;