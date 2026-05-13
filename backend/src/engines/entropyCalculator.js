/**
 * ENTROPY CALCULATOR
 *
 * This module calculates Shannon entropy for candidate distributions.
 *
 * Entropy measures uncertainty - higher entropy = more uncertainty.
 * When asking a question, we want to maximize information gain,
 * which means reducing entropy as much as possible.
 *
 * A perfect 50/50 split has maximum entropy (1 bit).
 * A 100/0 split has zero entropy (no uncertainty).
 */

/**
 * Calculate Shannon entropy for a given distribution
 *
 * Formula: H = -Σ p(x) * log2(p(x))
 *
 * @param {number} count - Number of items in the subset
 * @param {number} total - Total number of items
 * @returns {number} - Entropy value in bits (0 to 1)
 */
export function calculateEntropy(count, total) {
  // Edge case: no items or all items
  if (count === 0 || count === total) {
    return 0;
  }

  const p = count / total;
  const q = 1 - p;

  // Calculate entropy using Shannon formula
  const entropy = -(p * Math.log2(p) + q * Math.log2(q));

  return entropy;
}

/**
 * Calculate weighted entropy after a question split
 *
 * This is the key metric for question selection.
 * We calculate the weighted average entropy of the two branches
 * (yes and no answers) after applying a question.
 *
 * Lower weighted entropy = better question = higher information gain
 *
 * @param {number} yesCount - Candidates with attribute = true
 * @param {number} noCount - Candidates with attribute = false
 * @returns {number} - Weighted entropy (lower is better)
 */
export function calculateWeightedEntropy(yesCount, noCount) {
  const total = yesCount + noCount;

  if (total === 0) {
    return 1; // Maximum entropy for empty set
  }

  // Entropy of each branch (0 for pure branches)
  const yesEntropy = calculateEntropy(yesCount, total);
  const noEntropy = calculateEntropy(noCount, total);

  // Weighted average based on branch sizes
  const yesWeight = yesCount / total;
  const noWeight = noCount / total;

  const weightedEntropy = (yesWeight * yesEntropy) + (noWeight * noEntropy);

  return weightedEntropy;
}

/**
 * Calculate information gain from a question
 *
 * Information Gain = Initial Entropy - Weighted Entropy After Question
 *
 * Higher information gain = better question
 *
 * @param {number} initialCandidates - Number of candidates before question
 * @param {number} yesCount - Candidates where answer would be 'yes'
 * @param {number} noCount - Candidates where answer would be 'no'
 * @returns {number} - Information gain in bits
 */
export function calculateInformationGain(initialCandidates, yesCount, noCount) {
  if (initialCandidates === 0) {
    return 0;
  }

  // Calculate initial entropy (uniform distribution)
  const initialEntropy = calculateEntropy(1, initialCandidates); // Uniform = max entropy

  // Calculate weighted entropy after this question
  const weightedEntropy = calculateWeightedEntropy(yesCount, noCount);

  // Information gain is the reduction in entropy
  const infoGain = initialEntropy - weightedEntropy;

  return Math.max(0, infoGain);
}

/**
 * Calculate the split quality score for a question
 *
 * A perfect split is 50/50 (50% yes, 50% no).
 * We measure how close a split is to perfect.
 *
 * Score ranges from 0 to 1:
 * - 1 = perfect 50/50 split
 * - 0 = completely lopsided (all yes or all no)
 *
 * @param {number} yesCount - Candidates with attribute = true
 * @param {number} noCount - Candidates with attribute = false
 * @returns {number} - Split quality score (0 to 1)
 */
export function calculateSplitQuality(yesCount, noCount) {
  const total = yesCount + noCount;

  if (total === 0) {
    return 0;
  }

  const pYes = yesCount / total;
  const pNo = noCount / total;

  // Minimum proportion determines split quality
  // Perfect split (50/50) -> min(0.5, 0.5) = 0.5
  // Lopsided (90/10) -> min(0.9, 0.1) = 0.1
  // All yes (100/0) -> min(1, 0) = 0

  const minProportion = Math.min(pYes, pNo);

  // Scale to 0-1 where 0.5 is perfect (since min of perfect split is 0.5)
  const score = minProportion * 2;

  return score;
}

/**
 * Calculate expected information gain for a question
 *
 * This considers both the split quality AND the probability
 * of getting each answer.
 *
 * @param {number} yesCount - Candidates with attribute = true
 * @param {number} noCount - Candidates with attribute = false
 * @returns {number} - Expected information gain
 */
export function calculateExpectedInfoGain(yesCount, noCount) {
  const total = yesCount + noCount;

  if (total === 0) {
    return 0;
  }

  const pYes = yesCount / total;
  const pNo = noCount / total;

  // Calculate information gain for each possible answer
  const yesEntropy = calculateEntropy(yesCount, total);
  const noEntropy = calculateEntropy(noCount, total);

  // Expected information gain considers probability of each answer
  const expectedGain = (pYes * yesEntropy) + (pNo * noEntropy);

  return expectedGain;
}

/**
 * Calculate the balance ratio of a split
 *
 * Returns how balanced a split is:
 * - 1.0 = perfectly balanced (50/50)
 * - 0.0 = completely unbalanced (100/0 or 0/100)
 *
 * @param {number} yesCount - Candidates with attribute = true
 * @param {number} noCount - Candidates with attribute = false
 * @returns {number} - Balance ratio (0 to 1)
 */
export function calculateBalanceRatio(yesCount, noCount) {
  if (yesCount === 0 && noCount === 0) {
    return 0;
  }

  if (yesCount === 0 || noCount === 0) {
    return 0;
  }

  const total = yesCount + noCount;
  const pYes = yesCount / total;
  const pNo = noCount / total;

  // Use the minimum proportion as the balance indicator
  const balance = Math.min(pYes, pNo) * 2; // Scale to 0-1

  return balance;
}

/**
 * Get the optimal split ratio for a question
 *
 * An ideal question splits candidates close to 50/50.
 * This function helps determine if a question is "good enough"
 * to ask right now.
 *
 * @param {number} yesCount - Candidates with attribute = true
 * @param {number} noCount - Candidates with attribute = false
 * @returns {object} - { ratio, isOptimal, quality }
 */
export function getSplitAnalysis(yesCount, noCount) {
  const total = yesCount + noCount;

  if (total === 0) {
    return { ratio: 0, isOptimal: false, quality: 'none' };
  }

  const pYes = yesCount / total;
  const pNo = noCount / total;

  const ratio = pYes / pNo;
  const balance = calculateBalanceRatio(yesCount, noCount);

  let isOptimal = false;
  let quality = 'poor';

  // Define quality thresholds
  if (balance >= 0.8) {
    quality = 'excellent';
    isOptimal = true;
  } else if (balance >= 0.6) {
    quality = 'good';
  } else if (balance >= 0.4) {
    quality = 'fair';
  } else if (balance >= 0.2) {
    quality = 'poor';
  }

  return {
    ratio,
    isOptimal,
    quality,
    balance,
    yesPercent: Math.round(pYes * 100),
    noPercent: Math.round(pNo * 100)
  };
}