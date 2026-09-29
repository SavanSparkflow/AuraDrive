import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

/**
 * Formats ISO date string into readable format.
 * @param {string|Date} date 
 * @param {boolean} relative 
 * @returns {string}
 */
export function formatDate(date, relative = false) {
  if (!date) return '—';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';

    if (relative) {
      return formatDistanceToNow(d, { addSuffix: true });
    }

    if (isToday(d)) {
      return `Today, ${format(d, 'h:mm a')}`;
    }
    if (isYesterday(d)) {
      return `Yesterday, ${format(d, 'h:mm a')}`;
    }

    return format(d, 'MMM d, yyyy');
  } catch {
    return '—';
  }
}
