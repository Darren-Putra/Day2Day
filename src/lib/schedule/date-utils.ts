import { DayOfWeek } from '@/types/schedule';

export const DEFAULT_TIMEZONE = 'Asia/Makassar';

/**
 * Get current date string (YYYY-MM-DD) in a specific timezone
 */
export function getTodayInTimezone(timeZone: string = DEFAULT_TIMEZONE): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now); // en-CA gives YYYY-MM-DD
}

/**
 * Convert HH:mm or HH:mm:ss to total minutes from midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.slice(0, 5).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Convert total minutes from midnight to HH:mm string format
 */
export function minutesToTime(minutes: number): string {
  const bounded = Math.max(0, Math.min(1440, Math.floor(minutes)));
  const h = Math.floor(bounded / 60);
  const m = bounded % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Calculate duration in minutes between start and end time
 */
export function calculateDurationMinutes(startTime: string, endTime: string): number {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  return Math.max(0, end - start);
}

/**
 * Format minutes into human-readable duration, e.g. "2h 30m", "45m", "1h"
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Get the day of week enum for a given YYYY-MM-DD date in timezone
 */
export function getDayOfWeekName(dateStr: string, timeZone: string = DEFAULT_TIMEZONE): DayOfWeek {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Create a UTC date at noon to avoid boundary shifts
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
  });
  
  const weekday = formatter.format(date).toUpperCase();
  return weekday as DayOfWeek;
}

/**
 * Format date for friendly display: e.g. "Saturday, 26 September 2026"
 */
export function formatDisplayDate(dateStr: string, timeZone: string = DEFAULT_TIMEZONE): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Add or subtract days from YYYY-MM-DD
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
  const y = date.getUTCFullYear();
  const m = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const d = date.getUTCDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}
