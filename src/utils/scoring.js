export function calculateScoreBreakdown({
  completed,
  skips,
  fails,
  totalTime,
}) {
  const safeCompleted = Math.max(0, completed);
  const safeSkips = Math.max(0, skips);
  const safeFails = Math.max(0, fails);
  const safeTime = Math.max(0, totalTime);

  const completionBonus = safeCompleted * 200;
  const accuracyBonus = Math.max(0, safeCompleted - safeFails) * 50;
  const skipPenalty = safeSkips * 75;
  const failPenalty = safeFails * 125;
  const timePenalty = Math.round(safeTime * 50) / 100;

  const rawTotal = completionBonus + accuracyBonus - skipPenalty - failPenalty - timePenalty;
  const total = Math.max(0, Math.round(rawTotal * 100) / 100);

  return {
    completionBonus,
    accuracyBonus,
    skipPenalty,
    failPenalty,
    timePenalty,
    total,
  };
}

export function calculateScore(stats) {
  return calculateScoreBreakdown(stats).total;
}

export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
