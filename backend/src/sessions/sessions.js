/**
 * SESSION MANAGER
 *
 * Manages in-memory game sessions.
 * Each session holds the game state for one player.
 *
 * For a hackathon MVP, we use in-memory storage.
 * For production, you'd use Redis or a database.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * In-memory session storage
 * Map of sessionId -> gameState
 */
const sessions = new Map();

// Session timeout (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

/**
 * Create a new game session
 *
 * @param {string} sessionId - Session ID to use
 * @param {object} gameState - Initial game state
 * @returns {string} - Session ID
 */
export function createSession(sessionId, gameState = {}) {
  const session = {
    id: sessionId,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    gameState,
    metadata: {
      questionCount: 0,
      feedbackGiven: false
    }
  };

  sessions.set(sessionId, session);
  scheduleSessionCleanup(sessionId);

  return sessionId;
}

/**
 * Get a session by ID
 *
 * @param {string} sessionId - Session ID
 * @returns {object|null} - Session object or null if not found
 */
export function getSession(sessionId) {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  // Update last activity
  session.lastActivity = Date.now();

  return session;
}

/**
 * Update a session's game state
 *
 * @param {string} sessionId - Session ID
 * @param {object} gameState - New game state
 * @returns {boolean} - Success status
 */
export function updateSession(sessionId, gameState) {
  const session = sessions.get(sessionId);

  if (!session) {
    return false;
  }

  session.gameState = gameState;
  session.lastActivity = Date.now();

  return true;
}

/**
 * Delete a session
 *
 * @param {string} sessionId - Session ID
 * @returns {boolean} - Success status
 */
export function deleteSession(sessionId) {
  return sessions.delete(sessionId);
}

/**
 * Check if a session exists
 *
 * @param {string} sessionId - Session ID
 * @returns {boolean}
 */
export function sessionExists(sessionId) {
  return sessions.has(sessionId);
}

/**
 * Get all active sessions
 *
 * @returns {Array} - Array of session objects
 */
export function getAllSessions() {
  return Array.from(sessions.values()).map(session => ({
    id: session.id,
    createdAt: session.createdAt,
    lastActivity: session.lastActivity,
    questionCount: session.metadata.questionCount,
    status: session.gameState.status
  }));
}

/**
 * Get session count
 *
 * @returns {number}
 */
export function getSessionCount() {
  return sessions.size;
}

/**
 * Schedule session cleanup after timeout
 *
 * @param {string} sessionId - Session ID
 */
function scheduleSessionCleanup(sessionId) {
  setTimeout(() => {
    const session = sessions.get(sessionId);

    if (session && Date.now() - session.lastActivity > SESSION_TIMEOUT) {
      sessions.delete(sessionId);
      console.log(`Session ${sessionId} timed out and was removed`);
    }
  }, SESSION_TIMEOUT);
}

/**
 * Clean up expired sessions manually
 *
 * @returns {number} - Number of sessions cleaned up
 */
export function cleanupExpiredSessions() {
  const now = Date.now();
  let cleaned = 0;

  for (const [sessionId, session] of sessions) {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      sessions.delete(sessionId);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Update session metadata
 *
 * @param {string} sessionId - Session ID
 * @param {object} metadata - Metadata to update
 */
export function updateSessionMetadata(sessionId, metadata) {
  const session = sessions.get(sessionId);

  if (session) {
    session.metadata = { ...session.metadata, ...metadata };
  }
}

/**
 * Get session age in milliseconds
 *
 * @param {string} sessionId - Session ID
 * @returns {number} - Age in ms or -1 if not found
 */
export function getSessionAge(sessionId) {
  const session = sessions.get(sessionId);

  if (!session) {
    return -1;
  }

  return Date.now() - session.createdAt;
}

/**
 * Reset a session to start fresh
 *
 * @param {string} sessionId - Session ID
 * @param {function} startGameFn - Function to create new game state
 * @returns {object|null} - New game state or null if session not found
 */
export function resetSession(sessionId, startGameFn) {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  const newGameState = startGameFn();
  session.gameState = newGameState;
  session.lastActivity = Date.now();
  session.metadata = {
    questionCount: 0,
    feedbackGiven: false
  };

  return newGameState;
}