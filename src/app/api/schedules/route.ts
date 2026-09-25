import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/api/auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api/response';
import { CreateScheduleSchema } from '@/lib/schedule/validation';
import {
  getScheduleOccurrencesForDate,
  getScheduleOccurrencesForRange,
  createScheduleItem,
} from '@/lib/schedule/service';
import { getTodayInTimezone, DEFAULT_TIMEZONE } from '@/lib/schedule/date-utils';

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return apiError(
      ErrorCodes.UNAUTHORIZED,
      'Authentication required. Provide a valid Supabase session or Bearer API key.',
      401
    );
  }

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const timeZone = searchParams.get('timezone') || DEFAULT_TIMEZONE;

  // Case 1: Date Range query
  if (fromParam && toParam) {
    const rangeResults = await getScheduleOccurrencesForRange(
      auth.userId,
      fromParam,
      toParam,
      timeZone
    );

    return apiSuccess({
      from: fromParam,
      to: toParam,
      timezone: timeZone,
      results: rangeResults,
    });
  }

  // Case 2: Specific date or default to today
  const targetDate = dateParam || getTodayInTimezone(timeZone);
  const occurrences = await getScheduleOccurrencesForDate(
    auth.userId,
    targetDate,
    timeZone
  );

  return apiSuccess({
    date: targetDate,
    timezone: timeZone,
    activities: occurrences.map((occ) => ({
      id: occ.id,
      title: occ.title,
      category: occ.category,
      start: occ.start,
      end: occ.end,
      duration_minutes: occ.duration_minutes,
      repeat_type: occ.repeat_type,
    })),
  });
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return apiError(
      ErrorCodes.UNAUTHORIZED,
      'Authentication required. Provide a valid Supabase session or Bearer API key.',
      401
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(ErrorCodes.BAD_REQUEST, 'Invalid JSON body in request.', 400);
  }

  // Validate Input
  const parseResult = CreateScheduleSchema.safeParse(body);
  if (!parseResult.success) {
    return apiError(
      ErrorCodes.VALIDATION_ERROR,
      'Invalid schedule input.',
      422,
      parseResult.error.format()
    );
  }

  const input = parseResult.data;

  // Create schedule with conflict check
  const result = await createScheduleItem(auth.userId, input);

  if (result.conflict) {
    return apiError(
      ErrorCodes.SCHEDULE_CONFLICT,
      result.conflict,
      409
    );
  }

  if (!result.schedule) {
    return apiError(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Failed to create schedule.',
      500
    );
  }

  return apiSuccess(result.schedule, 201);
}
