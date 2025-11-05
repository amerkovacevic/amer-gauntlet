/**
 * Calculate score breakdown
 */
export function calculateScore(completed, skips, fails, totalTime) {
  const completionBonus = completed * 100;
  const accuracyBonus = Math.max(0, completed - fails) * 50;
  const skipPenalty = skips * -25;
  const failPenalty = fails * -50;
  const timePenalty = Math.max(0, Math.round((totalTime - 60) * -2)); // Penalty after 60 seconds
  
  const total = completionBonus + accuracyBonus + skipPenalty + failPenalty + timePenalty;
  
  return {
    completionBonus,
    accuracyBonus,
    skipPenalty,
    failPenalty,
    timePenalty,
    total: Math.max(0, total), // Never negative
  };
}

/**
 * Format score for display
 */
export function formatScore(score) {
  return score.toLocaleString();
}
