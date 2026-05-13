/**
 * UTILITY HELPERS
 *
 * Common utility functions used across the backend.
 */

/**
 * Delay execution for a specified time
 * Useful for simulating network latency or creating dramatic effects
 *
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise}
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate answer format
 *
 * @param {string} answer - Answer to validate
 * @returns {boolean}
 */
export function isValidAnswer(answer) {
  const validAnswers = ['yes', 'no', 'maybe', 'dont_know'];
  return validAnswers.includes(answer);
}

/**
 * Normalize answer (handle variations like 'y', 'yeah', 'n', 'no')
 *
 * @param {string} answer - Raw answer
 * @returns {string} - Normalized answer
 */
export function normalizeAnswer(answer) {
  const normalized = answer.toLowerCase().trim();

  // Yes variations
  if (['yes', 'y', 'yeah', 'yep', 'ya', 'sure', 'correct', 'true', '1'].includes(normalized)) {
    return 'yes';
  }

  // No variations
  if (['no', 'n', 'nope', 'nah', 'false', 'incorrect', '0'].includes(normalized)) {
    return 'no';
  }

  // Maybe variations
  if (['maybe', 'm', 'perhaps', 'possibly', 'might', 'could', 'not_sure', 'unsure'].includes(normalized)) {
    return 'maybe';
  }

  // Don't know variations
  if (['dont_know', "don't know", 'dk', 'unknown', 'dunno', 'na', 'not sure', 'idk'].includes(normalized)) {
    return 'dont_know';
  }

  return 'dont_know'; // Default to don't know for unknown inputs
}

/**
 * Create a standardized success response
 *
 * @param {object} data - Response data
 * @returns {object}
 */
export function successResponse(data) {
  return {
    success: true,
    timestamp: new Date().toISOString(),
    ...data
  };
}

/**
 * Create a standardized error response
 *
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @returns {object}
 */
export function errorResponse(message, code = 'ERROR') {
  return {
    success: false,
    timestamp: new Date().toISOString(),
    error: {
      message,
      code
    }
  };
}

/**
 * Sanitize player data for API response
 * Removes internal fields and ensures clean output
 *
 * @param {object} player - Player object
 * @returns {object}
 */
export function sanitizePlayer(player) {
  return {
    id: player.id,
    name: player.name,
    known_names: player.known_names || [],
    role: player.role,
    team: player.teams?.[0] || 'Unknown',
    teams: player.teams || [],
    nationality: player.nationality,
    active: player.active
  };
}

/**
 * Sanitize question data for API response
 *
 * @param {object} question - Question object
 * @returns {object}
 */
export function sanitizeQuestion(question) {
  return {
    id: question.id,
    question: question.question,
    category: question.category
  };
}

/**
 * Parse session ID from various formats
 *
 * @param {string} sessionId - Session ID (may include 'session_' prefix)
 * @returns {string} - Clean session ID
 */
export function parseSessionId(sessionId) {
  if (!sessionId) return null;

  // Remove 'session_' prefix if present
  if (sessionId.startsWith('session_')) {
    return sessionId;
  }

  return sessionId;
}

/**
 * Generate a random ID
 *
 * @param {number} length - Length of ID
 * @returns {string}
 */
export function generateId(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Check if running in development mode
 *
 * @returns {boolean}
 */
export function isDevelopment() {
  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;
}

/**
 * Format date for logging
 *
 * @returns {string}
 */
export function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Log with timestamp
 *
 * @param {string} message - Log message
 * @param {string} level - Log level
 */
export function log(level, message) {
  const timestamp = getTimestamp();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
}

/**
 * Log request information
 *
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @param {object} data - Additional data
 */
export function logRequest(method, path, data = {}) {
  log('info', `${method} ${path}`, data);
}

/**
 * Sleep for a number of milliseconds (synchronous)
 *
 * @param {number} ms - Milliseconds
 */
export function sleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}