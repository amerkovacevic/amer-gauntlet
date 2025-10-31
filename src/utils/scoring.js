export function calculateScore({
  completed,
  skips,
  fails,
  totalTime,
}) {
  const base = completed * 120;
  const skipPenalty = skips * 40;
  const failPenalty = fails * 75;
  const timePenalty = Math.floor(totalTime * 0.8);
  return Math.max(0, base - skipPenalty - failPenalty - timePenalty + completed * 25);
}

export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
