import { ScheduleItem, ScheduleOccurrence, DayOfWeek } from '@/types/schedule';
import {
  calculateDurationMinutes,
  getDayOfWeekName,
  DEFAULT_TIMEZONE,
} from './date-utils';

/**
 * Calculates day difference between two YYYY-MM-DD dates (d2 - d1)
 */
export function getDaysDifference(d1: string, d2: string): number {
  const [y1, m1, day1] = d1.split('-').map(Number);
  const [y2, m2, day2] = d2.split('-').map(Number);
  const date1 = Date.UTC(y1, m1 - 1, day1);
  const date2 = Date.UTC(y2, m2 - 1, day2);
  return Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
}

/**
 * Checks whether a schedule item occurs on a specific target date
 */
export function doesScheduleOccurOnDate(
  schedule: ScheduleItem,
  targetDate: string,
  timeZone: string = DEFAULT_TIMEZONE
): boolean {
  const { start_date, repeat_type, repeat_config } = schedule;

  // Schedule cannot occur before its start date
  if (targetDate < start_date) {
    return false;
  }

  // Check until date if set
  if (repeat_config?.until && targetDate > repeat_config.until) {
    return false;
  }

  const interval = Math.max(1, repeat_config?.interval ?? 1);

  switch (repeat_type) {
    case 'none': {
      return targetDate === start_date;
    }

    case 'daily': {
      const diffDays = getDaysDifference(start_date, targetDate);
      return diffDays >= 0 && diffDays % interval === 0;
    }

    case 'weekly': {
      const targetDayOfWeek = getDayOfWeekName(targetDate, timeZone);
      const configuredDays =
        repeat_config?.days && repeat_config.days.length > 0
          ? repeat_config.days
          : [getDayOfWeekName(start_date, timeZone)];

      if (!configuredDays.includes(targetDayOfWeek)) {
        return false;
      }

      if (interval === 1) {
        return true;
      }

      // Calculate weeks difference from the start of the week containing start_date
      const diffDays = getDaysDifference(start_date, targetDate);
      const diffWeeks = Math.floor(diffDays / 7);
      return diffWeeks >= 0 && diffWeeks % interval === 0;
    }

    case 'monthly': {
      const [startY, startM, startD] = start_date.split('-').map(Number);
      const [targetY, targetM, targetD] = targetDate.split('-').map(Number);

      // Must be same day of month
      if (startD !== targetD) {
        return false;
      }

      const diffMonths = (targetY - startY) * 12 + (targetM - startM);
      return diffMonths >= 0 && diffMonths % interval === 0;
    }

    case 'yearly': {
      const [startY, startM, startD] = start_date.split('-').map(Number);
      const [targetY, targetM, targetD] = targetDate.split('-').map(Number);

      if (startM !== targetM || startD !== targetD) {
        return false;
      }

      const diffYears = targetY - startY;
      return diffYears >= 0 && diffYears % interval === 0;
    }

    case 'custom': {
      // Custom can support specific days of week or intervals
      if (repeat_config?.days && repeat_config.days.length > 0) {
        const targetDay = getDayOfWeekName(targetDate, timeZone);
        if (!repeat_config.days.includes(targetDay)) return false;
      }
      const diffDays = getDaysDifference(start_date, targetDate);
      return diffDays >= 0 && diffDays % interval === 0;
    }

    default:
      return false;
  }
}

/**
 * Filter schedules that apply to a target date and map them to occurrences
 */
export function getOccurrencesForDate(
  schedules: ScheduleItem[],
  targetDate: string,
  timeZone: string = DEFAULT_TIMEZONE
): ScheduleOccurrence[] {
  const occurrences: ScheduleOccurrence[] = [];

  for (const schedule of schedules) {
    if (doesScheduleOccurOnDate(schedule, targetDate, timeZone)) {
      const duration = calculateDurationMinutes(schedule.start_time, schedule.end_time);
      occurrences.push({
        id: schedule.id,
        title: schedule.title,
        category: schedule.category,
        start: schedule.start_time.slice(0, 5),
        end: schedule.end_time.slice(0, 5),
        duration_minutes: duration,
        date: targetDate,
        repeat_type: schedule.repeat_type,
        timezone: schedule.timezone,
      });
    }
  }

  // Sort occurrences by start time ascending
  return occurrences.sort((a, b) => a.start.localeCompare(b.start));
}
