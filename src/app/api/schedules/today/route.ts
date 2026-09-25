import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/api/auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api/response';
import { getScheduleOccurrencesForDate } from '@/lib/schedule/service';
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

  // Determine today in Asia/Makassar
  const today = getTodayInTimezone(timeZone);

  const occurrences = await getScheduleOccurrencesForDate(
    auth.userId,
    today,
    timeZone
  );

  return apiSuccess({
    date: today,
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
