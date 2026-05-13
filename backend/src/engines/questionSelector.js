/**
 * QUESTION SELECTOR
 *
 * This module selects the optimal question to ask next.
 *
 * The selection is based on INFORMATION GAIN - we want to ask
 * questions that reduce uncertainty the most with each answer.
 *
 * Key concepts:
 * - Information Gain = reduction in entropy
 * - Entropy measures uncertainty
 * - A 50/50 split maximizes information gain
 * - We consider only unasked questions
 * - We score questions based on their expected information gain
 */

import { calculateSplitQuality, calculateExpectedInfoGain, calculateBalanceRatio } from './entropyCalculator.js';

/**
 * Score a question based on how well it splits the current candidates
 *
 * Higher score = better question = more information gain
 *
 * @param {Array} candidates - Current candidate players
 * @param {object} question - Question object with attribute
 * @returns {object} - { score, yesCount, noCount, analysis }
 */
export function scoreQuestion(candidates, question) {
  const attribute = question.attribute;

  // Count how many candidates match this attribute
  let yesCount = 0;
  let noCount = 0;

  candidates.forEach(player => {
    if (player.attributes && player.attributes[attribute] === true) {
      yesCount++;
    } else {
      noCount++;
    }
  });

  // Calculate various metrics
  const splitQuality = calculateSplitQuality(yesCount, noCount);
  const balance = calculateBalanceRatio(yesCount, noCount);
  const expectedGain = calculateExpectedInfoGain(yesCount, noCount);

  // Combined score (weighted combination of metrics)
  // We prioritize:
  // 1. Balance (close to 50/50) - most important for information gain
  // 2. Minimum bucket size (don't want to eliminate too many at once)
  // 3. Expected information gain

  const total = yesCount + noCount;
  const minBucket = Math.min(yesCount, noCount);
  const minBucketRatio = total > 0 ? minBucket / total : 0;

  // Score: balance weighted heavily + min bucket ratio + expected gain
  const score = (balance * 0.5) + (minBucketRatio * 0.3) + (expectedGain * 0.2);

  return {
    score,
    yesCount,
    noCount,
    total,
    splitQuality,
    balance,
    expectedGain,
    yesPercent: total > 0 ? Math.round((yesCount / total) * 100) : 0,
    noPercent: total > 0 ? Math.round((noCount / total) * 100) : 0
  };
}

/**
 * Select the best question from all available questions
 *
 * This is the core decision function. It evaluates all unasked questions
 * and selects the one with the highest information gain potential.
 *
 * @param {Array} candidates - Current candidate players
 * @param {Array} questions - All available questions
 * @param {Array} askedQuestionIds - IDs of already asked questions
 * @returns {object|null} - Best question or null if none available
 */
export function selectBestQuestion(candidates, questions, askedQuestionIds) {
  if (candidates.length === 0) {
    return null; // No candidates to evaluate
  }

  const askedSet = new Set(askedQuestionIds || []);
  const unaskedQuestions = questions.filter(q => !askedSet.has(q.id));

  if (unaskedQuestions.length === 0) {
    return null; // All questions have been asked
  }

  // Score each unasked question
  const scoredQuestions = unaskedQuestions.map(question => ({
    question,
    scoring: scoreQuestion(candidates, question)
  }));

  // Sort by score (highest first)
  scoredQuestions.sort((a, b) => b.scoring.score - a.scoring.score);

  // Return the best question (or null if list is empty)
  if (scoredQuestions.length === 0) {
    return null;
  }

  const best = scoredQuestions[0];

  return {
    ...best.question,
    scoringData: best.scoring
  };
}

/**
 * Check if we should make a guess instead of asking more questions
 *
 * We make a guess when:
 * 1. One candidate has very high probability (>= 80%)
 * 2. OR we have very few candidates left (<= 5)
 * 3. OR probability ratio is very high (one candidate dominates)
 *
 * @param {object} probabilities - Current player probabilities
 * @param {Array} candidates - Current candidate players
 * @param {number} questionsAsked - Number of questions asked so far
 * @param {number} maxQuestions - Maximum questions before forced guess
 * @returns {object} - { shouldGuess, reason }
 */
export function shouldMakeGuess(probabilities, candidates, questionsAsked, maxQuestions = 12) {
  // Calculate key metrics
  const topProb = Math.max(...Object.values(probabilities));
  const top2Ratio = getTop2Ratio(probabilities);
  const effectiveCandidates = getEffectiveCandidates(probabilities);

  // Reason 1: Very high confidence
  if (topProb >= 0.80) {
    return {
      shouldGuess: true,
      reason: 'high_confidence',
      confidence: topProb
    };
  }

  // Reason 2: Only one effective candidate left
  if (effectiveCandidates <= 1.5) {
    return {
      shouldGuess: true,
      reason: 'low_candidate_count',
      confidence: topProb
    };
  }

  // Reason 3: Very few candidates remain
  if (candidates.length <= 3) {
    return {
      shouldGuess: true,
      reason: 'few_candidates',
      confidence: topProb
    };
  }

  // Reason 4: Top candidate dominates massively
  if (top2Ratio >= 5 && topProb >= 0.6) {
    return {
      shouldGuess: true,
      reason: 'dominant_candidate',
      confidence: topProb
    };
  }

  // Reason 5: Max questions reached
  if (questionsAsked >= maxQuestions) {
    return {
      shouldGuess: true,
      reason: 'max_questions',
      confidence: topProb
    };
  }

  return {
    shouldGuess: false,
    reason: null,
    confidence: topProb
  };
}

/**
 * Get the ratio between top 2 candidates
 */
function getTop2Ratio(probabilities) {
  const sorted = Object.values(probabilities).sort((a, b) => b - a);
  if (sorted.length < 2) return Infinity;
  return sorted[0] / sorted[1];
}

/**
 * Get effective number of candidates from entropy
 */
function getEffectiveCandidates(probabilities) {
  const probs = Object.values(probabilities).filter(p => p > 0);
  if (probs.length === 0) return 0;

  const entropy = probs.reduce((sum, p) => sum - (p * Math.log2(p)), 0);
  return Math.pow(2, entropy);
}

/**
 * Get question suggestions for different scenarios
 *
 * This provides alternative questions in case we want to
 * add variety or the primary question isn't suitable.
 *
 * @param {Array} candidates - Current candidate players
 * @param {Array} questions - All available questions
 * @param {Array} askedQuestionIds - Already asked question IDs
 * @param {number} count - Number of suggestions to return
 * @returns {Array} - Array of suggested questions with scores
 */
export function getQuestionSuggestions(candidates, questions, askedQuestionIds, count = 3) {
  const scoredQuestions = questions
    .filter(q => !askedQuestionIds.includes(q.id))
    .map(question => ({
      question,
      score: scoreQuestion(candidates, question)
    }))
    .sort((a, b) => b.score.score - a.score.score)
    .slice(0, count);

  return scoredQuestions;
}

/**
 * Analyze which questions would be most effective at this stage
 *
 * @param {Array} candidates - Current candidates
 * @param {Array} questions - All questions
 * @param {Array} askedIds - Already asked question IDs
 * @returns {object} - Analysis results
 */
export function analyzeQuestions(candidates, questions, askedIds) {
  const asked = questions.filter(q => askedIds.includes(q.id));
  const unasked = questions.filter(q => !askedIds.includes(q.id));

  const scored = unasked.map(q => ({
    question: q,
    scoring: scoreQuestion(candidates, q)
  })).sort((a, b) => b.scoring.score - a.scoring.score);

  return {
    totalQuestions: questions.length,
    askedCount: asked.length,
    unaskedCount: unasked.length,
    bestQuestion: scored[0] || null,
    topSuggestions: scored.slice(0, 5),
    averageScore: scored.length > 0
      ? scored.reduce((sum, s) => sum + s.scoring.score, 0) / scored.length
      : 0
  };
}