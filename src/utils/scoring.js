export function calculateScore({
  completed,
  skips,
  fails,
  totalTime,
}) {
  const completionBonus = completed * 200;
  const accuracyBonus = Math.max(0, completed - fails) * 50;
  const skipPenalty = skips * 75;
  const failPenalty = fails * 125;
  const timePenalty = Math.floor(totalTime * 0.5);
  return Math.max(0, completionBonus + accuracyBonus - skipPenalty - failPenalty - timePenalty);
}

export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
