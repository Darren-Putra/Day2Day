import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/api/auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api/response';
import { PatchScheduleSchema } from '@/lib/schedule/validation';
import { updateScheduleItem, deleteScheduleItem } from '@/lib/schedule/service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return apiError(
      ErrorCodes.UNAUTHORIZED,
      'Authentication required. Provide a valid Supabase session or Bearer API key.',
      401
    );
  }

  const { id } = await params;
  if (!id) {
    return apiError(ErrorCodes.BAD_REQUEST, 'Missing schedule ID parameter.', 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(ErrorCodes.BAD_REQUEST, 'Invalid JSON body.', 400);
  }

  const parseResult = PatchScheduleSchema.safeParse(body);
  if (!parseResult.success) {
    return apiError(
      ErrorCodes.VALIDATION_ERROR,
      'Invalid patch data.',
      422,
      parseResult.error.format()
    );
  }

  const result = await updateScheduleItem(auth.userId, id, parseResult.data);

  if (result.notFound) {
    return apiError(ErrorCodes.NOT_FOUND, 'Schedule not found or unauthorized.', 404);
  }

  if (result.conflict) {
    return apiError(ErrorCodes.SCHEDULE_CONFLICT, result.conflict, 409);
  }

  if (!result.schedule) {
    return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 'Failed to update schedule.', 500);
  }

  return apiSuccess(result.schedule);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return apiError(
      ErrorCodes.UNAUTHORIZED,
      'Authentication required. Provide a valid Supabase session or Bearer API key.',
      401
    );
  }

  const { id } = await params;
  if (!id) {
    return apiError(ErrorCodes.BAD_REQUEST, 'Missing schedule ID parameter.', 400);
  }

  const result = await deleteScheduleItem(auth.userId, id);

  if (result.notFound) {
    return apiError(ErrorCodes.NOT_FOUND, 'Schedule not found or unauthorized.', 404);
  }

  if (!result.success) {
    return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 'Failed to delete schedule.', 500);
  }

  return apiSuccess({
    success: true,
    message: 'Schedule deleted successfully.',
  });
}
