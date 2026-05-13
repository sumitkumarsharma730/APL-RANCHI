/**
 * PROBABILITY ENGINE
 *
 * This module handles probability updates using Bayesian-style reasoning.
 *
 * Key concepts:
 * - Each player starts with equal probability (1/N)
 * - After each answer, probabilities are updated
 * - "Yes" answers increase probability for players with that attribute
 * - "No" answers decrease probability for players with that attribute
 * - "Maybe" provides a soft update (partial weight)
 * - "Don't Know" provides no change
 */

/**
 * Likelihood multipliers for different answers
 * These determine how much a player's probability changes based on their answer
 */
const ANSWER_WEIGHTS = {
  yes: {
    match: 0.95,      // Player has attribute and answered YES - very likely
    noMatch: 0.05     // Player doesn't have attribute but answered YES - unlikely
  },
  no: {
    match: 0.05,      // Player has attribute but answered NO - unlikely
    noMatch: 0.95     // Player doesn't have attribute and answered NO - likely
  },
  maybe: {
    match: 0.7,       // Player has attribute and answered MAYBE - somewhat likely
    noMatch: 0.3      // Player doesn't have attribute and answered MAYBE - somewhat unlikely
  },
  dont_know: {
    match: 0.9,       // Player has attribute but answered DON'T KNOW - still possible
    noMatch: 0.9      // Player doesn't have attribute and answered DON'T KNOW - still possible
  }
};

/**
 * Initialize probabilities for all players
 * All players start with equal probability
 *
 * @param {Array} players - Array of player objects
 * @returns {object} - Object mapping player IDs to probabilities
 */
export function initializeProbabilities(players) {
  const totalPlayers = players.length;
  const initialProb = 1 / totalPlayers;

  const probabilities = {};

  players.forEach(player => {
    probabilities[player.id] = initialProb;
  });

  return probabilities;
}

/**
 * Update player probabilities based on an answer
 *
 * This uses a simplified Bayesian update:
 * P(player | answer) ∝ P(answer | player) × P(player)
 *
 * The likelihood P(answer | player) depends on:
 * 1. Whether the player has the attribute the question is about
 * 2. What answer the user gave
 *
 * @param {object} probabilities - Current player probabilities
 * @param {object} player - Player object with attributes
 * @param {number} questionId - ID of the question being answered
 * @param {string} answer - Answer: 'yes', 'no', 'maybe', 'dont_know'
 * @param {object} questions - Questions data
 * @returns {number} - Updated probability for this player
 */
export function updatePlayerProbability(probabilities, player, questionId, answer, questions) {
  // Find the question
  const question = questions.find(q => q.id === questionId);
  if (!question) {
    return probabilities[player.id] || 0;
  }

  const attribute = question.attribute;
  const hasAttribute = player.attributes[attribute] === true;

  // Get weights for this answer
  const weights = ANSWER_WEIGHTS[answer] || ANSWER_WEIGHTS.dont_know;

  // Calculate new probability based on whether attribute matches answer
  const likelihood = hasAttribute ? weights.match : weights.noMatch;
  const currentProb = probabilities[player.id] || 0;

  return currentProb * likelihood;
}

/**
 * Update all player probabilities after an answer
 *
 * @param {object} probabilities - Current player probabilities
 * @param {Array} players - Array of player objects
 * @param {number} questionId - ID of the question being answered
 * @param {string} answer - Answer: 'yes', 'no', 'maybe', 'dont_know'
 * @param {object} questions - Questions data
 * @returns {object} - Updated player probabilities (before normalization)
 */
export function updateAllProbabilities(probabilities, players, questionId, answer, questions) {
  const updatedProbabilities = {};

  players.forEach(player => {
    updatedProbabilities[player.id] = updatePlayerProbability(
      probabilities,
      player,
      questionId,
      answer,
      questions
    );
  });

  return updatedProbabilities;
}

/**
 * Normalize probabilities so they sum to 1
 *
 * After updating all probabilities, we need to normalize them
 * so they represent a valid probability distribution.
 *
 * @param {object} probabilities - Unnormalized probabilities
 * @returns {object} - Normalized probabilities
 */
export function normalizeProbabilities(probabilities) {
  // Calculate sum of all probabilities
  const sum = Object.values(probabilities).reduce((acc, prob) => acc + prob, 0);

  if (sum === 0) {
    // All probabilities are zero - restore equal distribution
    const count = Object.keys(probabilities).length;
    const equalProb = 1 / count;
    Object.keys(probabilities).forEach(id => {
      probabilities[id] = equalProb;
    });
    return probabilities;
  }

  // Normalize
  const normalized = {};
  Object.entries(probabilities).forEach(([id, prob]) => {
    normalized[id] = prob / sum;
  });

  return normalized;
}

/**
 * Calculate confidence (probability of top candidate)
 *
 * @param {object} probabilities - Player probabilities
 * @returns {number} - Confidence level (0 to 1)
 */
export function calculateConfidence(probabilities) {
  const maxProb = Math.max(...Object.values(probabilities));
  return maxProb;
}

/**
 * Get top candidates sorted by probability
 *
 * @param {object} probabilities - Player probabilities
 * @param {number} limit - Maximum number of candidates to return
 * @returns {Array} - Array of { playerId, probability } sorted by probability
 */
export function getTopCandidates(probabilities, limit = 5) {
  const sorted = Object.entries(probabilities)
    .map(([playerId, probability]) => ({ playerId, probability }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, limit);

  return sorted;
}

/**
 * Get cumulative probability of top N candidates
 *
 * @param {object} probabilities - Player probabilities
 * @param {number} n - Number of top candidates to consider
 * @returns {number} - Cumulative probability
 */
export function getCumulativeProbability(probabilities, n = 2) {
  const topN = getTopCandidates(probabilities, n);
  return topN.reduce((sum, candidate) => sum + candidate.probability, 0);
}

/**
 * Calculate probability ratio between top 2 candidates
 *
 * @param {object} probabilities - Player probabilities
 * @returns {number} - Ratio (top / second)
 */
export function calculateProbabilityRatio(probabilities) {
  const top2 = getTopCandidates(probabilities, 2);

  if (top2.length < 2) {
    return Infinity;
  }

  return top2[0].probability / top2[1].probability;
}

/**
 * Calculate entropy of the current probability distribution
 *
 * Higher entropy = more uncertainty = system needs more questions
 * Lower entropy = more certain = system might be ready to guess
 *
 * @param {object} probabilities - Player probabilities
 * @returns {number} - Entropy in bits
 */
export function calculateProbabilityEntropy(probabilities) {
  const probs = Object.values(probabilities).filter(p => p > 0);

  if (probs.length === 0) {
    return 0;
  }

  const entropy = probs.reduce((sum, p) => {
    return sum - (p * Math.log2(p));
  }, 0);

  return entropy;
}

/**
 * Calculate effective number of candidates
 *
 * This is like the "effective" number of candidates considering
 * probability distribution. If everyone has equal probability,
 * effective count = actual count. If one person dominates,
 * effective count is close to 1.
 *
 * Formula: 2^H where H is entropy
 *
 * @param {object} probabilities - Player probabilities
 * @returns {number} - Effective number of candidates
 */
export function calculateEffectiveCandidates(probabilities) {
  const entropy = calculateProbabilityEntropy(probabilities);
  return Math.pow(2, entropy);
}

/**
 * Get probability summary for debugging/logging
 *
 * @param {object} probabilities - Player probabilities
 * @param {Array} players - Player array for name lookup
 * @returns {object} - Summary object
 */
export function getProbabilitySummary(probabilities, players) {
  const top5 = getTopCandidates(probabilities, 5);
  const playerMap = new Map(players.map(p => [p.id, p]));

  const topPlayers = top5.map(({ playerId, probability }) => ({
    name: playerMap.get(playerId)?.name || playerId,
    probability: Math.round(probability * 1000) / 10
  }));

  return {
    topPlayers,
    confidence: calculateConfidence(probabilities),
    entropy: calculateProbabilityEntropy(probabilities),
    effectiveCandidates: Math.round(calculateEffectiveCandidates(probabilities) * 10) / 10,
    cumulativeTop2: getCumulativeProbability(probabilities, 2)
  };
}