import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import {
  AssignmentItem,
  AssignmentStatus,
  AssignmentFilterView,
  AssignmentSummaryCounts,
} from '@/types/assignment';
import {
  CreateAssignmentInput,
  PatchAssignmentInput,
} from './validation';
import { isSupabaseReady } from '@/lib/schedule/service';
import { getTodayInTimezone, parseTimeToMinutes, DEFAULT_TIMEZONE } from '@/lib/schedule/date-utils';

// Dev fallback in-memory store
const devAssignmentStore: Map<string, AssignmentItem[]> = new Map();

function getSupabaseDbClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey || anonKey);
}

/**
 * Computes overdue status and days remaining for an assignment in Asia/Makassar
 */
export function computeAssignmentMeta(
  assignment: AssignmentItem,
  todayStr: string = getTodayInTimezone()
): AssignmentItem {
  const isCompleted = assignment.status === 'COMPLETED';

  // Compare due_date with todayStr (YYYY-MM-DD)
  const isDatePast = assignment.due_date < todayStr;
  let isOverdue = false;

  if (!isCompleted) {
    if (isDatePast) {
      isOverdue = true;
    } else if (assignment.due_date === todayStr) {
      // Check if due_time is past current time in Asia/Makassar
      const now = new Date();
      const currentH = parseInt(
        new Intl.DateTimeFormat('en-US', {
          timeZone: DEFAULT_TIMEZONE,
          hour: 'numeric',
          hour12: false,
        }).format(now),
        10
      );
      const currentM = parseInt(
        new Intl.DateTimeFormat('en-US', {
          timeZone: DEFAULT_TIMEZONE,
          minute: 'numeric',
        }).format(now),
        10
      );
      const currentMinutes = currentH * 60 + currentM;
      const dueMinutes = parseTimeToMinutes(assignment.due_time);
      if (dueMinutes < currentMinutes) {
        isOverdue = true;
      }
    }
  }

  // Calculate days remaining
  const [y1, m1, d1] = todayStr.split('-').map(Number);
  const [y2, m2, d2] = assignment.due_date.split('-').map(Number);
  const dateToday = Date.UTC(y1, m1 - 1, d1);
  const dateDue = Date.UTC(y2, m2 - 1, d2);
  const daysDiff = Math.ceil((dateDue - dateToday) / (1000 * 60 * 60 * 24));

  return {
    ...assignment,
    is_overdue: isOverdue,
    days_remaining: daysDiff,
  };
}

/**
 * Fetch all assignments for a user with computed metadata
 */
export async function getAllUserAssignments(userId: string): Promise<AssignmentItem[]> {
  const todayStr = getTodayInTimezone();

  if (!isSupabaseReady()) {
    const list = devAssignmentStore.get(userId) || [];
    return list.map((item) => computeAssignmentMeta(item, todayStr));
  }

  const client = getSupabaseDbClient();
  const { data, error } = await client
    .from('assignments')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true })
    .order('due_time', { ascending: true });

  if (error || !data) {
    console.error('Error fetching assignments:', error);
    const list = devAssignmentStore.get(userId) || [];
    return list.map((item) => computeAssignmentMeta(item, todayStr));
  }

  return data.map((row) =>
    computeAssignmentMeta(
      {
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        course_name: row.course_name,
        due_date: row.due_date,
        due_time: row.due_time.slice(0, 5),
        estimated_duration_minutes: row.estimated_duration_minutes,
        category: row.category,
        status: row.status,
        notes: row.notes,
        completed_at: row.completed_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
      todayStr
    )
  );
}

/**
 * Filter assignments according to requested view ('active', 'overdue', 'completed', 'all')
 */
export async function getFilteredAssignments(
  userId: string,
  view: AssignmentFilterView = 'active',
  courseFilter?: string | null
): Promise<{ assignments: AssignmentItem[]; summary: AssignmentSummaryCounts }> {
  const all = await getAllUserAssignments(userId);

  // Compute summary stats
  const summary: AssignmentSummaryCounts = {
    total: all.length,
    active: 0,
    overdue: 0,
    completed: 0,
  };

  for (const item of all) {
    if (item.status === 'COMPLETED') {
      summary.completed++;
    } else if (item.is_overdue) {
      summary.overdue++;
    } else {
      summary.active++;
    }
  }

  // Filter by view
  let filtered = all;
  if (view === 'active') {
    // Pending or in progress with future/today valid deadline
    filtered = all.filter((a) => a.status !== 'COMPLETED' && !a.is_overdue);
  } else if (view === 'overdue') {
    // Pending or in progress whose deadline has passed
    filtered = all.filter((a) => a.status !== 'COMPLETED' && a.is_overdue);
  } else if (view === 'completed') {
    // Completed history
    filtered = all.filter((a) => a.status === 'COMPLETED');
  }

  // Optional course filter
  if (courseFilter && courseFilter.trim()) {
    filtered = filtered.filter(
      (a) => a.course_name?.toLowerCase() === courseFilter.trim().toLowerCase()
    );
  }

  return {
    assignments: filtered,
    summary,
  };
}

/**
 * Create a new assignment
 */
export async function createAssignmentItem(
  userId: string,
  input: CreateAssignmentInput
): Promise<{ assignment?: AssignmentItem; error?: string }> {
  const newAssignment: AssignmentItem = {
    id: crypto.randomUUID(),
    user_id: userId,
    title: input.title,
    course_name: input.course_name || null,
    due_date: input.due_date,
    due_time: (input.due_time || '23:59').slice(0, 5),
    estimated_duration_minutes: input.estimated_duration_minutes ?? 120,
    category: input.category,
    status: input.status || 'PENDING',
    notes: input.notes || null,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseReady()) {
    const list = devAssignmentStore.get(userId) || [];
    list.push(newAssignment);
    devAssignmentStore.set(userId, list);
    return { assignment: computeAssignmentMeta(newAssignment) };
  }

  const client = getSupabaseDbClient();
  const { data, error } = await client
    .from('assignments')
    .insert({
      id: newAssignment.id,
      user_id: userId,
      title: newAssignment.title,
      course_name: newAssignment.course_name,
      due_date: newAssignment.due_date,
      due_time: newAssignment.due_time,
      estimated_duration_minutes: newAssignment.estimated_duration_minutes,
      category: newAssignment.category,
      status: newAssignment.status,
      notes: newAssignment.notes,
    })
    .select('*')
    .single();

  if (error || !data) {
    console.error('Supabase assignment insert error:', error);
    const list = devAssignmentStore.get(userId) || [];
    list.push(newAssignment);
    devAssignmentStore.set(userId, list);
    return { assignment: computeAssignmentMeta(newAssignment) };
  }

  return {
    assignment: computeAssignmentMeta({
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      course_name: data.course_name,
      due_date: data.due_date,
      due_time: data.due_time.slice(0, 5),
      estimated_duration_minutes: data.estimated_duration_minutes,
      category: data.category,
      status: data.status,
      notes: data.notes,
      completed_at: data.completed_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }),
  };
}

/**
 * Update an existing assignment
 */
export async function updateAssignmentItem(
  userId: string,
  assignmentId: string,
  input: PatchAssignmentInput
): Promise<{ assignment?: AssignmentItem; notFound?: boolean; error?: string }> {
  if (!isSupabaseReady()) {
    const list = devAssignmentStore.get(userId) || [];
    const item = list.find((a) => a.id === assignmentId);
    if (!item) return { notFound: true };

    if (input.title !== undefined) item.title = input.title;
    if (input.course_name !== undefined) item.course_name = input.course_name;
    if (input.due_date !== undefined) item.due_date = input.due_date;
    if (input.due_time !== undefined) item.due_time = input.due_time.slice(0, 5);
    if (input.estimated_duration_minutes !== undefined)
      item.estimated_duration_minutes = input.estimated_duration_minutes;
    if (input.category !== undefined) item.category = input.category;
    if (input.status !== undefined) {
      item.status = input.status;
      if (input.status === 'COMPLETED' && !item.completed_at) {
        item.completed_at = new Date().toISOString();
      } else if (input.status !== 'COMPLETED') {
        item.completed_at = null;
      }
    }
    if (input.notes !== undefined) item.notes = input.notes;
    item.updated_at = new Date().toISOString();

    return { assignment: computeAssignmentMeta(item) };
  }

  const client = getSupabaseDbClient();
  const updatePayload: Database['public']['Tables']['assignments']['Update'] = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) updatePayload.title = input.title;
  if (input.course_name !== undefined) updatePayload.course_name = input.course_name;
  if (input.due_date !== undefined) updatePayload.due_date = input.due_date;
  if (input.due_time !== undefined) updatePayload.due_time = input.due_time.slice(0, 5);
  if (input.estimated_duration_minutes !== undefined)
    updatePayload.estimated_duration_minutes = input.estimated_duration_minutes;
  if (input.category !== undefined) updatePayload.category = input.category;
  if (input.status !== undefined) {
    updatePayload.status = input.status;
    if (input.status === 'COMPLETED') {
      updatePayload.completed_at = new Date().toISOString();
    } else {
      updatePayload.completed_at = null;
    }
  }
  if (input.notes !== undefined) updatePayload.notes = input.notes;
  if (input.completed_at !== undefined) updatePayload.completed_at = input.completed_at;

  const { data, error } = await client
    .from('assignments')
    .update(updatePayload)
    .eq('id', assignmentId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error || !data) {
    return { notFound: true };
  }

  return {
    assignment: computeAssignmentMeta({
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      course_name: data.course_name,
      due_date: data.due_date,
      due_time: data.due_time.slice(0, 5),
      estimated_duration_minutes: data.estimated_duration_minutes,
      category: data.category,
      status: data.status,
      notes: data.notes,
      completed_at: data.completed_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }),
  };
}

/**
 * Delete an assignment
 */
export async function deleteAssignmentItem(
  userId: string,
  assignmentId: string
): Promise<{ success: boolean; notFound?: boolean }> {
  if (!isSupabaseReady()) {
    const list = devAssignmentStore.get(userId) || [];
    const idx = list.findIndex((a) => a.id === assignmentId);
    if (idx !== -1) {
      list.splice(idx, 1);
      devAssignmentStore.set(userId, list);
      return { success: true };
    }
    return { success: false, notFound: true };
  }

  const client = getSupabaseDbClient();
  const { error } = await client
    .from('assignments')
    .delete()
    .eq('id', assignmentId)
    .eq('user_id', userId);

  if (error) {
    return { success: false };
  }
  return { success: true };
}
