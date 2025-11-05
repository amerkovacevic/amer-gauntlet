import { format, toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'America/Chicago'; // Central US Time

/**
 * Generate today's date ID (YYYY-MM-DD) in Central US time
 */
export function getTodayId() {
  const now = new Date();
  const zonedDate = toZonedTime(now, TIMEZONE);
  return format(zonedDate, 'yyyy-MM-dd', { timeZone: TIMEZONE });
}

/**
 * Format date for display
 */
export function formatDate(dateId) {
  const [year, month, day] = dateId.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Format duration in seconds to MM:SS or SS format
 */
export function formatDuration(seconds) {
  if (typeof seconds !== 'number' || isNaN(seconds)) return '0s';
  const s = Math.floor(seconds % 60);
  const m = Math.floor(seconds / 60);
  if (m > 0) {
    return `${m}m ${s}s`;
  }
  return `${s}s`;
}
