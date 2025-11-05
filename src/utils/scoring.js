/**
 * Calculate score breakdown
 * 
 * Scoring logic:
 * - Base score: 1000 points
 * - Time bonus: Faster times get more points (up to 500 bonus)
 * - Completion bonus: +100 per correct answer
 * - Skip penalty: -50 per skip
 * - Fail penalty: -100 per fail
 */
export function calculateScore(passes, skips, fails, totalTime) {
  const BASE_SCORE = 1000;
  const MAX_TIME_BONUS = 500;
  const COMPLETION_BONUS_PER_PASS = 100;
  const SKIP_PENALTY = 50;
  const FAIL_PENALTY = 100;
  
  // Time bonus: faster = more bonus, max 500 points
  // Ideal time: 60 seconds or less = full bonus
  // 120 seconds = half bonus, 180+ seconds = no bonus
  const idealTime = 60;
  const timeBonus = Math.max(0, Math.min(MAX_TIME_BONUS, MAX_TIME_BONUS * (1 - (totalTime / (idealTime * 3)))));
  
  // Completion bonus
  const completionBonus = passes * COMPLETION_BONUS_PER_PASS;
  
  // Penalties
  const skipPenalty = skips * SKIP_PENALTY;
  const failPenalty = fails * FAIL_PENALTY;
  
  // Total score
  const total = BASE_SCORE + Math.round(timeBonus) + completionBonus - skipPenalty - failPenalty;
  
  return {
    baseScore: BASE_SCORE,
    timeBonus: Math.round(timeBonus),
    completionBonus,
    skipPenalty: -skipPenalty,
    failPenalty: -failPenalty,
    total: Math.max(0, total), // Never negative
  };
}

/**
 * Format score for display
 */
export function formatScore(score) {
  return Math.round(score).toLocaleString();
}
