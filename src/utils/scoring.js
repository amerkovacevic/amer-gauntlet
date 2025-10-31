export function getScoreBreakdown({
  completed,
  skips,
  fails,
  totalTime,
}) {
  const completionBonus = completed * 200;
  const cleanClears = Math.max(0, completed - fails);
  const accuracyBonus = cleanClears * 50;
  const skipPenalty = skips * 75;
  const failPenalty = fails * 125;
  const seconds = Math.max(0, Math.floor(totalTime));
  const timePenalty = Math.floor(seconds * 0.5);
  const rawTotal = completionBonus + accuracyBonus - skipPenalty - failPenalty - timePenalty;
  return {
    completionBonus,
    accuracyBonus,
    skipPenalty,
    failPenalty,
    timePenalty,
    rawTotal,
    total: Math.max(0, rawTotal),
  };
}

export function calculateScore(values) {
  return getScoreBreakdown(values).total;
}

export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
