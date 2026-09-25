import { ScheduleOccurrence, FreeTimeSlot, DailySummary } from '@/types/schedule';
import { parseTimeToMinutes, minutesToTime } from './date-utils';

/**
 * Calculates all free time slots in a 24-hour day (00:00 - 24:00)
 */
export function calculateFreeTimeSlots(
  occurrences: ScheduleOccurrence[],
  date: string
): { date: string; free_time: FreeTimeSlot[] } {
  // Sort activities by start time
  const sorted = [...occurrences].sort(
    (a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start)
  );

  const freeSlots: FreeTimeSlot[] = [];
  let currentMinute = 0; // 00:00

  for (const item of sorted) {
    const startMin = parseTimeToMinutes(item.start);
    const endMin = parseTimeToMinutes(item.end);

    if (startMin > currentMinute) {
      const duration = startMin - currentMinute;
      if (duration > 0) {
        freeSlots.push({
          start: minutesToTime(currentMinute),
          end: minutesToTime(startMin),
          duration_minutes: duration,
        });
      }
    }

    if (endMin > currentMinute) {
      currentMinute = endMin;
    }
  }

  // Remainder until midnight (1440 minutes)
  if (currentMinute < 1440) {
    const duration = 1440 - currentMinute;
    freeSlots.push({
      start: minutesToTime(currentMinute),
      end: '24:00',
      duration_minutes: duration,
    });
  }

  return {
    date,
    free_time: freeSlots,
  };
}

/**
 * Calculates daily statistics and percentages for a 24-hour day
 */
export function calculateDailySummary(
  occurrences: ScheduleOccurrence[],
  date: string
): DailySummary {
  const TOTAL_MINUTES = 1440; // 24 hours * 60 minutes

  let scheduledMinutes = 0;
  for (const item of occurrences) {
    scheduledMinutes += item.duration_minutes;
  }

  // Ensure scheduled does not exceed 1440
  const boundedScheduled = Math.min(TOTAL_MINUTES, scheduledMinutes);
  const freeMinutes = Math.max(0, TOTAL_MINUTES - boundedScheduled);

  const scheduledPercentage = Number(
    ((boundedScheduled / TOTAL_MINUTES) * 100).toFixed(2)
  );
  const freePercentage = Number(
    ((freeMinutes / TOTAL_MINUTES) * 100).toFixed(2)
  );

  return {
    date,
    total_minutes: TOTAL_MINUTES,
    scheduled_minutes: boundedScheduled,
    free_minutes: freeMinutes,
    scheduled_percentage: scheduledPercentage,
    free_percentage: freePercentage,
    activity_count: occurrences.length,
  };
}
