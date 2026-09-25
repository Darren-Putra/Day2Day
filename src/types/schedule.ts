export type ScheduleCategory =
  | 'IMPORTANT_URGENT'
  | 'IMPORTANT_NOT_URGENT'
  | 'NOT_IMPORTANT_URGENT'
  | 'NOT_IMPORTANT_NOT_URGENT';

export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export type DayOfWeek = 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export interface RepeatConfig {
  interval?: number; // e.g., 1
  days?: DayOfWeek[]; // ['MONDAY', 'WEDNESDAY']
  until?: string | null; // YYYY-MM-DD
}

export interface ScheduleItem {
  id: string;
  user_id: string;
  title: string;
  category: ScheduleCategory;
  start_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm or HH:mm:ss
  end_time: string; // HH:mm or HH:mm:ss
  repeat_type: RepeatType;
  repeat_config: RepeatConfig | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleOccurrence {
  id: string;
  title: string;
  category: ScheduleCategory;
  start: string; // HH:mm
  end: string; // HH:mm
  duration_minutes: number;
  date: string; // YYYY-MM-DD
  repeat_type: RepeatType;
  timezone?: string;
}

export interface FreeTimeSlot {
  start: string; // HH:mm
  end: string; // HH:mm
  duration_minutes: number;
}

export interface DailySummary {
  date: string;
  total_minutes: number; // 1440
  scheduled_minutes: number;
  free_minutes: number;
  scheduled_percentage: number;
  free_percentage: number;
  activity_count: number;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictingItem?: {
    id: string;
    title: string;
    start: string;
    end: string;
  };
}

export interface ApiKeyItem {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

export const CATEGORY_DETAILS: Record<
  ScheduleCategory,
  {
    label: string;
    matrixLabel: string;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    badgeBg: string;
  }
> = {
  IMPORTANT_URGENT: {
    label: 'Important & Urgent',
    matrixLabel: 'Q1: Do First',
    color: '#ef4444', // red-500
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-500 dark:text-red-400',
    badgeBg: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
  IMPORTANT_NOT_URGENT: {
    label: 'Important & Not Urgent',
    matrixLabel: 'Q2: Schedule',
    color: '#3b82f6', // blue-500
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-500 dark:text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  NOT_IMPORTANT_URGENT: {
    label: 'Not Important & Urgent',
    matrixLabel: 'Q3: Delegate',
    color: '#f59e0b', // amber-500
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-500 dark:text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  NOT_IMPORTANT_NOT_URGENT: {
    label: 'Not Important & Not Urgent',
    matrixLabel: 'Q4: Eliminate',
    color: '#6b7280', // gray-500
    bgColor: 'rgba(107, 114, 128, 0.1)',
    borderColor: 'border-gray-500/30',
    textColor: 'text-gray-500 dark:text-gray-400',
    badgeBg: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  },
};
