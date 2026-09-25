import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/api/auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api/response';
import { getScheduleOccurrencesForDate } from '@/lib/schedule/service';
import { calculateDailySummary } from '@/lib/schedule/free-time';
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
  const timeZone = searchParams.get('timezone') || DEFAULT_TIMEZONE;
  const dateParam = searchParams.get('date') || getTodayInTimezone(timeZone);

  const occurrences = await getScheduleOccurrencesForDate(
    auth.userId,
    dateParam,
    timeZone
  );

  const summary = calculateDailySummary(occurrences, dateParam);

  return apiSuccess(summary);
}
