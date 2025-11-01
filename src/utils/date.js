const TIME_ZONE = 'America/Chicago';

function getTimeZoneDateParts(date) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const result = {};

  for (const part of parts) {
    if (part.type !== 'literal') {
      result[part.type] = part.value;
    }
  }

  return result;
}

export function getTodayId() {
  const { year, month, day } = getTimeZoneDateParts(new Date());
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
