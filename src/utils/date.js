export function getTodayId() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayId(todayId = getTodayId()) {
  const [year, month, day] = todayId.split('-').map(Number);
  const reference = new Date(Date.UTC(year, month - 1, day));
  reference.setUTCDate(reference.getUTCDate() - 1);
  const y = reference.getUTCFullYear();
  const m = String(reference.getUTCMonth() + 1).padStart(2, '0');
  const d = String(reference.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getWeekId(dateId) {
  const [year, month, day] = dateId.split('-').map(Number);
  const reference = new Date(Date.UTC(year, month - 1, day));
  const weekStart = new Date(reference);
  const dayOfWeek = weekStart.getUTCDay();
  const diff = (dayOfWeek + 6) % 7; // Monday start
  weekStart.setUTCDate(reference.getUTCDate() - diff);
  const weekYear = weekStart.getUTCFullYear();
  const weekNumber = Math.floor((weekStart.getUTCDate() - 1) / 7) + 1;
  return `${weekYear}-W${String(weekNumber).padStart(2, '0')}`;
}
