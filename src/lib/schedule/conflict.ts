import { ScheduleItem, ConflictResult } from '@/types/schedule';
import { parseTimeToMinutes, DEFAULT_TIMEZONE, addDaysToDate } from './date-utils';
import { doesScheduleOccurOnDate } from './recurrence';

/**
 * Checks whether two time intervals [start1, end1] and [start2, end2] overlap
 * Condition: max(start1, start2) < min(end1, end2)
 */
export function doTimeIntervalsOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = parseTimeToMinutes(start1);
  const e1 = parseTimeToMinutes(end1);
  const s2 = parseTimeToMinutes(start2);
  const e2 = parseTimeToMinutes(end2);

  return Math.max(s1, s2) < Math.min(e1, e2);
}

export interface CandidateSchedule {
  id?: string;
  title: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string; // HH:mm
  repeat_type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  repeat_config?: {
    interval?: number;
    days?: ('SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY')[];
    until?: string | null;
  } | null;
  timezone?: string;
}

/**
 * Checks if a candidate schedule conflicts with any existing schedules
 */
export function checkScheduleConflict(
  candidate: CandidateSchedule,
  existingSchedules: ScheduleItem[],
  excludeScheduleId?: string,
  timeZone: string = DEFAULT_TIMEZONE
): ConflictResult {
  // Convert candidate to a pseudo-ScheduleItem for recurrence check
  const candidateItem: ScheduleItem = {
    id: candidate.id || 'candidate',
    user_id: '',
    title: candidate.title,
    category: 'IMPORTANT_URGENT',
    start_date: candidate.date,
    start_time: candidate.start,
    end_time: candidate.end,
    repeat_type: candidate.repeat_type,
    repeat_config: candidate.repeat_config || null,
    timezone: candidate.timezone || timeZone,
    created_at: '',
    updated_at: '',
  };

  const filteredExisting = existingSchedules.filter(
    (item) => item.id !== excludeScheduleId
  );

  // If candidate is a single date ('none')
  if (candidate.repeat_type === 'none') {
    const targetDate = candidate.date;

    for (const item of filteredExisting) {
      if (doesScheduleOccurOnDate(item, targetDate, timeZone)) {
        if (
          doTimeIntervalsOverlap(
            candidate.start,
            candidate.end,
            item.start_time,
            item.end_time
          )
        ) {
          return {
            hasConflict: true,
            conflictingItem: {
              id: item.id,
              title: item.title,
              start: item.start_time.slice(0, 5),
              end: item.end_time.slice(0, 5),
            },
          };
        }
      }
    }

    return { hasConflict: false };
  }

  // If candidate is recurring, check overlapping days in a sample projection window (up to 90 days or recurrence cycle)
  let currentDate = candidate.date;
  const maxDaysToCheck = 90;

  for (let i = 0; i < maxDaysToCheck; i++) {
    if (doesScheduleOccurOnDate(candidateItem, currentDate, timeZone)) {
      for (const item of filteredExisting) {
        if (doesScheduleOccurOnDate(item, currentDate, timeZone)) {
          if (
            doTimeIntervalsOverlap(
              candidate.start,
              candidate.end,
              item.start_time,
              item.end_time
            )
          ) {
            return {
              hasConflict: true,
              conflictingItem: {
                id: item.id,
                title: item.title,
                start: item.start_time.slice(0, 5),
                end: item.end_time.slice(0, 5),
              },
            };
          }
        }
      }
    }

    currentDate = addDaysToDate(currentDate, 1);
    if (candidate.repeat_config?.until && currentDate > candidate.repeat_config.until) {
      break;
    }
  }

  return { hasConflict: false };
}
