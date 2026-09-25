import { describe, it, expect } from 'vitest';
import { doesScheduleOccurOnDate, getOccurrencesForDate } from '../recurrence';
import { doTimeIntervalsOverlap, checkScheduleConflict } from '../conflict';
import { calculateFreeTimeSlots, calculateDailySummary } from '../free-time';
import { CreateScheduleSchema } from '../validation';
import { generateApiKey, hashApiKey } from '../../api/auth';
import { ScheduleItem } from '@/types/schedule';

describe('Recurrence Logic', () => {
  const baseSchedule: ScheduleItem = {
    id: 'sched-1',
    user_id: 'user-1',
    title: 'Kuliah Algoritma',
    category: 'IMPORTANT_URGENT',
    start_date: '2026-09-26', // Saturday
    start_time: '08:00',
    end_time: '10:00',
    repeat_type: 'none',
    repeat_config: null,
    timezone: 'Asia/Makassar',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it('correctly handles non-repeating schedules', () => {
    expect(doesScheduleOccurOnDate(baseSchedule, '2026-09-26')).toBe(true);
    expect(doesScheduleOccurOnDate(baseSchedule, '2026-09-27')).toBe(false);
  });

  it('correctly handles daily recurrence', () => {
    const dailySchedule: ScheduleItem = {
      ...baseSchedule,
      repeat_type: 'daily',
      repeat_config: { interval: 2 }, // every 2 days
    };

    expect(doesScheduleOccurOnDate(dailySchedule, '2026-09-26')).toBe(true); // day 0
    expect(doesScheduleOccurOnDate(dailySchedule, '2026-09-27')).toBe(false); // day 1
    expect(doesScheduleOccurOnDate(dailySchedule, '2026-09-28')).toBe(true); // day 2
    expect(doesScheduleOccurOnDate(dailySchedule, '2026-09-25')).toBe(false); // before start
  });

  it('correctly handles weekly recurrence on specific days', () => {
    const weeklySchedule: ScheduleItem = {
      ...baseSchedule,
      start_date: '2026-09-21', // Monday
      repeat_type: 'weekly',
      repeat_config: { interval: 1, days: ['MONDAY', 'WEDNESDAY'] },
    };

    // 2026-09-21 is Monday
    expect(doesScheduleOccurOnDate(weeklySchedule, '2026-09-21')).toBe(true);
    // 2026-09-22 is Tuesday
    expect(doesScheduleOccurOnDate(weeklySchedule, '2026-09-22')).toBe(false);
    // 2026-09-23 is Wednesday
    expect(doesScheduleOccurOnDate(weeklySchedule, '2026-09-23')).toBe(true);
    // 2026-09-28 is next Monday
    expect(doesScheduleOccurOnDate(weeklySchedule, '2026-09-28')).toBe(true);
  });

  it('respects until date in recurrence', () => {
    const limitedSchedule: ScheduleItem = {
      ...baseSchedule,
      repeat_type: 'daily',
      repeat_config: { interval: 1, until: '2026-09-28' },
    };

    expect(doesScheduleOccurOnDate(limitedSchedule, '2026-09-28')).toBe(true);
    expect(doesScheduleOccurOnDate(limitedSchedule, '2026-09-29')).toBe(false);
  });
});

describe('Conflict Detection', () => {
  it('detects simple time interval overlaps', () => {
    // 08:00 - 10:00 vs 09:00 - 11:00 -> overlaps
    expect(doTimeIntervalsOverlap('08:00', '10:00', '09:00', '11:00')).toBe(true);
    // 08:00 - 10:00 vs 10:00 - 12:00 -> adjacent, no overlap
    expect(doTimeIntervalsOverlap('08:00', '10:00', '10:00', '12:00')).toBe(false);
    // 08:00 - 10:00 vs 11:00 - 12:00 -> no overlap
    expect(doTimeIntervalsOverlap('08:00', '10:00', '11:00', '12:00')).toBe(false);
    // 08:00 - 12:00 vs 09:00 - 10:00 -> enclosed overlap
    expect(doTimeIntervalsOverlap('08:00', '12:00', '09:00', '10:00')).toBe(true);
  });

  it('detects schedule conflict with existing items on same date', () => {
    const existing: ScheduleItem[] = [
      {
        id: '1',
        user_id: 'u1',
        title: 'Kuliah Algoritma',
        category: 'IMPORTANT_URGENT',
        start_date: '2026-09-26',
        start_time: '08:00',
        end_time: '10:00',
        repeat_type: 'none',
        repeat_config: null,
        timezone: 'Asia/Makassar',
        created_at: '',
        updated_at: '',
      },
    ];

    const conflict = checkScheduleConflict(
      {
        title: 'Belajar',
        date: '2026-09-26',
        start: '09:00',
        end: '11:00',
        repeat_type: 'none',
      },
      existing
    );

    expect(conflict.hasConflict).toBe(true);
    expect(conflict.conflictingItem?.title).toBe('Kuliah Algoritma');

    const noConflict = checkScheduleConflict(
      {
        title: 'Belajar Sore',
        date: '2026-09-26',
        start: '10:00',
        end: '12:00',
        repeat_type: 'none',
      },
      existing
    );

    expect(noConflict.hasConflict).toBe(false);
  });
});

describe('Free Time and Daily Summary', () => {
  it('calculates 100% free time when there are no activities', () => {
    const { free_time } = calculateFreeTimeSlots([], '2026-09-26');
    expect(free_time).toHaveLength(1);
    expect(free_time[0]).toEqual({
      start: '00:00',
      end: '24:00',
      duration_minutes: 1440,
    });

    const summary = calculateDailySummary([], '2026-09-26');
    expect(summary.scheduled_minutes).toBe(0);
    expect(summary.free_minutes).toBe(1440);
    expect(summary.free_percentage).toBe(100);
    expect(summary.scheduled_percentage).toBe(0);
    expect(summary.activity_count).toBe(0);
  });

  it('calculates free time slots around activities correctly', () => {
    const occurrences = [
      {
        id: '1',
        title: 'Morning study',
        category: 'IMPORTANT_URGENT' as const,
        start: '08:00',
        end: '10:00',
        duration_minutes: 120,
        date: '2026-09-26',
        repeat_type: 'none' as const,
      },
      {
        id: '2',
        title: 'Afternoon session',
        category: 'IMPORTANT_NOT_URGENT' as const,
        start: '14:00',
        end: '16:30',
        duration_minutes: 150,
        date: '2026-09-26',
        repeat_type: 'none' as const,
      },
    ];

    const { free_time } = calculateFreeTimeSlots(occurrences, '2026-09-26');
    expect(free_time).toHaveLength(3);
    expect(free_time[0]).toEqual({ start: '00:00', end: '08:00', duration_minutes: 480 });
    expect(free_time[1]).toEqual({ start: '10:00', end: '14:00', duration_minutes: 240 });
    expect(free_time[2]).toEqual({ start: '16:30', end: '24:00', duration_minutes: 450 });

    const summary = calculateDailySummary(occurrences, '2026-09-26');
    expect(summary.activity_count).toBe(2);
    expect(summary.scheduled_minutes).toBe(270);
    expect(summary.free_minutes).toBe(1170);
    expect(summary.scheduled_percentage).toBe(18.75);
    expect(summary.free_percentage).toBe(81.25);
  });
});

describe('API Key Authentication', () => {
  it('generates secure api keys and computes consistent sha256 hash', () => {
    const { key, hash, prefix } = generateApiKey();
    expect(key).toMatch(/^d2d_live_[a-f0-9]{48}$/);
    expect(prefix).toBe(key.slice(0, 14));
    expect(hashApiKey(key)).toBe(hash);
  });
});

describe('Input Validation', () => {
  it('rejects schedule where end time is before or equal to start time', () => {
    const result = CreateScheduleSchema.safeParse({
      title: 'Bad schedule',
      category: 'IMPORTANT_URGENT',
      date: '2026-09-26',
      start: '10:00',
      end: '09:00',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid schedule input', () => {
    const result = CreateScheduleSchema.safeParse({
      title: 'Valid schedule',
      category: 'IMPORTANT_NOT_URGENT',
      date: '2026-09-26',
      start: '08:00',
      end: '10:00',
      repeat: { type: 'none' },
    });
    expect(result.success).toBe(true);
  });
});
