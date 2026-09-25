import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import {
  ScheduleItem,
  ScheduleOccurrence,
  DailySummary,
  FreeTimeSlot,
  RepeatConfig,
} from '@/types/schedule';
import {
  CreateScheduleInput,
  PatchScheduleInput,
} from './validation';
import { doesScheduleOccurOnDate, getOccurrencesForDate } from './recurrence';
import { checkScheduleConflict } from './conflict';
import { calculateFreeTimeSlots, calculateDailySummary } from './free-time';
import { DEFAULT_TIMEZONE, getTodayInTimezone, addDaysToDate } from './date-utils';

// In-memory fallback store for local development when Supabase credentials are placeholders
const devStore: Map<string, ScheduleItem[]> = new Map();

// Helper to determine if Supabase is properly configured with real credentials
export function isSupabaseReady(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('placeholder') &&
    !url.includes('your-project-id') &&
    !key.includes('your-anon-key')
  );
}

// Get Supabase DB client for a specific user
function getSupabaseDbClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (serviceRoleKey) {
    return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey);
  }
  return createSupabaseClient<Database>(supabaseUrl, anonKey);
}

/**
 * Fetch all raw schedules for a given user
 */
export async function getAllUserSchedules(userId: string): Promise<ScheduleItem[]> {
  if (!isSupabaseReady()) {
    return devStore.get(userId) || [];
  }

  const client = getSupabaseDbClient();
  const { data, error } = await client
    .from('schedules')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching schedules from Supabase:', error);
    return devStore.get(userId) || [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    category: row.category,
    start_date: row.start_date,
    start_time: row.start_time,
    end_time: row.end_time,
    repeat_type: row.repeat_type,
    repeat_config: row.repeat_config as RepeatConfig | null,
    timezone: row.timezone,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

/**
 * Get schedule occurrences for a specific date
 */
export async function getScheduleOccurrencesForDate(
  userId: string,
  date: string,
  timeZone: string = DEFAULT_TIMEZONE
): Promise<ScheduleOccurrence[]> {
  const allSchedules = await getAllUserSchedules(userId);
  return getOccurrencesForDate(allSchedules, date, timeZone);
}

/**
 * Get schedule occurrences for a date range [from, to]
 */
export async function getScheduleOccurrencesForRange(
  userId: string,
  fromDate: string,
  toDate: string,
  timeZone: string = DEFAULT_TIMEZONE
): Promise<{ date: string; occurrences: ScheduleOccurrence[] }[]> {
  const allSchedules = await getAllUserSchedules(userId);
  const results: { date: string; occurrences: ScheduleOccurrence[] }[] = [];

  let currentDate = fromDate;
  while (currentDate <= toDate) {
    const occurrences = getOccurrencesForDate(allSchedules, currentDate, timeZone);
    results.push({ date: currentDate, occurrences });
    currentDate = addDaysToDate(currentDate, 1);
  }

  return results;
}

/**
 * Create a new schedule item with conflict checking
 */
export async function createScheduleItem(
  userId: string,
  input: CreateScheduleInput
): Promise<{ schedule?: ScheduleItem; conflict?: string; error?: string }> {
  const allSchedules = await getAllUserSchedules(userId);

  // Perform Conflict Detection
  const conflict = checkScheduleConflict(
    {
      title: input.title,
      date: input.date,
      start: input.start.slice(0, 5),
      end: input.end.slice(0, 5),
      repeat_type: input.repeat.type,
      repeat_config: {
        interval: input.repeat.interval ?? 1,
        days: input.repeat.days,
        until: input.repeat.until ?? null,
      },
      timezone: input.timezone || DEFAULT_TIMEZONE,
    },
    allSchedules,
    undefined,
    input.timezone || DEFAULT_TIMEZONE
  );

  if (conflict.hasConflict && conflict.conflictingItem) {
    return {
      conflict: `This activity overlaps with: ${conflict.conflictingItem.title} (${conflict.conflictingItem.start}–${conflict.conflictingItem.end})`,
    };
  }

  const newSchedule: ScheduleItem = {
    id: crypto.randomUUID(),
    user_id: userId,
    title: input.title,
    category: input.category,
    start_date: input.date,
    start_time: input.start.slice(0, 5),
    end_time: input.end.slice(0, 5),
    repeat_type: input.repeat.type,
    repeat_config: {
      interval: input.repeat.interval ?? 1,
      days: input.repeat.days || [],
      until: input.repeat.until || null,
    },
    timezone: input.timezone || DEFAULT_TIMEZONE,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseReady()) {
    const list = devStore.get(userId) || [];
    list.push(newSchedule);
    devStore.set(userId, list);
    return { schedule: newSchedule };
  }

  const client = getSupabaseDbClient();
  const { data, error } = await client
    .from('schedules')
    .insert({
      id: newSchedule.id,
      user_id: userId,
      title: newSchedule.title,
      category: newSchedule.category,
      start_date: newSchedule.start_date,
      start_time: newSchedule.start_time,
      end_time: newSchedule.end_time,
      repeat_type: newSchedule.repeat_type,
      repeat_config: newSchedule.repeat_config,
      timezone: newSchedule.timezone,
    })
    .select('*')
    .single();

  if (error || !data) {
    console.error('Supabase insert error:', error);
    // fallback to memory
    const list = devStore.get(userId) || [];
    list.push(newSchedule);
    devStore.set(userId, list);
    return { schedule: newSchedule };
  }

  return {
    schedule: {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      category: data.category,
      start_date: data.start_date,
      start_time: data.start_time,
      end_time: data.end_time,
      repeat_type: data.repeat_type,
      repeat_config: data.repeat_config as RepeatConfig | null,
      timezone: data.timezone,
      created_at: data.created_at,
      updated_at: data.updated_at,
    },
  };
}

/**
 * Update an existing schedule item with conflict checking
 */
export async function updateScheduleItem(
  userId: string,
  scheduleId: string,
  input: PatchScheduleInput
): Promise<{ schedule?: ScheduleItem; conflict?: string; notFound?: boolean; error?: string }> {
  const allSchedules = await getAllUserSchedules(userId);
  const existingIndex = allSchedules.findIndex(
    (s) => s.id === scheduleId && s.user_id === userId
  );

  if (existingIndex === -1 && !isSupabaseReady()) {
    return { notFound: true };
  }

  const existing = allSchedules[existingIndex];

  // Merge updated values
  const updatedDate = input.date || existing?.start_date || getTodayInTimezone();
  const updatedStart = (input.start || existing?.start_time || '08:00').slice(0, 5);
  const updatedEnd = (input.end || existing?.end_time || '09:00').slice(0, 5);
  const updatedRepeatType = input.repeat?.type || existing?.repeat_type || 'none';
  const updatedRepeatConfig = input.repeat
    ? {
        interval: input.repeat.interval ?? 1,
        days: input.repeat.days || [],
        until: input.repeat.until || null,
      }
    : existing?.repeat_config || null;

  // Conflict detection excluding current item
  const conflict = checkScheduleConflict(
    {
      id: scheduleId,
      title: input.title || existing?.title || 'Activity',
      date: updatedDate,
      start: updatedStart,
      end: updatedEnd,
      repeat_type: updatedRepeatType,
      repeat_config: updatedRepeatConfig,
      timezone: input.timezone || existing?.timezone || DEFAULT_TIMEZONE,
    },
    allSchedules,
    scheduleId,
    input.timezone || existing?.timezone || DEFAULT_TIMEZONE
  );

  if (conflict.hasConflict && conflict.conflictingItem) {
    return {
      conflict: `This activity overlaps with: ${conflict.conflictingItem.title} (${conflict.conflictingItem.start}–${conflict.conflictingItem.end})`,
    };
  }

  if (!isSupabaseReady()) {
    if (existing) {
      existing.title = input.title ?? existing.title;
      existing.category = input.category ?? existing.category;
      existing.start_date = updatedDate;
      existing.start_time = updatedStart;
      existing.end_time = updatedEnd;
      existing.repeat_type = updatedRepeatType;
      existing.repeat_config = updatedRepeatConfig;
      existing.updated_at = new Date().toISOString();
      return { schedule: existing };
    }
    return { notFound: true };
  }

  const client = getSupabaseDbClient();
  const updatePayload: Database['public']['Tables']['schedules']['Update'] = {
    updated_at: new Date().toISOString(),
  };
  if (input.title) updatePayload.title = input.title;
  if (input.category) updatePayload.category = input.category;
  if (input.date) updatePayload.start_date = input.date;
  if (input.start) updatePayload.start_time = input.start.slice(0, 5);
  if (input.end) updatePayload.end_time = input.end.slice(0, 5);
  if (input.repeat) {
    updatePayload.repeat_type = input.repeat.type;
    updatePayload.repeat_config = updatedRepeatConfig;
  }
  if (input.timezone) updatePayload.timezone = input.timezone;

  const { data, error } = await client
    .from('schedules')
    .update(updatePayload)
    .eq('id', scheduleId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error || !data) {
    return { notFound: true };
  }

  return {
    schedule: {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      category: data.category,
      start_date: data.start_date,
      start_time: data.start_time,
      end_time: data.end_time,
      repeat_type: data.repeat_type,
      repeat_config: data.repeat_config as RepeatConfig | null,
      timezone: data.timezone,
      created_at: data.created_at,
      updated_at: data.updated_at,
    },
  };
}

/**
 * Delete a schedule item
 */
export async function deleteScheduleItem(
  userId: string,
  scheduleId: string
): Promise<{ success: boolean; notFound?: boolean }> {
  if (!isSupabaseReady()) {
    const list = devStore.get(userId) || [];
    const idx = list.findIndex((s) => s.id === scheduleId);
    if (idx !== -1) {
      list.splice(idx, 1);
      devStore.set(userId, list);
      return { success: true };
    }
    return { success: false, notFound: true };
  }

  const client = getSupabaseDbClient();
  const { error, count } = await client
    .from('schedules')
    .delete()
    .eq('id', scheduleId)
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase delete error:', error);
    return { success: false };
  }

  return { success: true };
}
