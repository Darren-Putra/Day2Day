import { ScheduleCategory } from './schedule';

export type AssignmentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type AssignmentFilterView = 'active' | 'overdue' | 'completed' | 'all';

export interface AssignmentItem {
  id: string;
  user_id: string;
  title: string;
  course_name: string | null;
  due_date: string; // YYYY-MM-DD
  due_time: string; // HH:mm or HH:mm:ss
  estimated_duration_minutes: number;
  category: ScheduleCategory;
  status: AssignmentStatus;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields
  is_overdue?: boolean;
  days_remaining?: number;
}

export interface AssignmentSummaryCounts {
  total: number;
  active: number;
  overdue: number;
  completed: number;
}
