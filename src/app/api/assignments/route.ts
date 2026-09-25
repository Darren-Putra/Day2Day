import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/api/auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api/response';
import { CreateAssignmentSchema } from '@/lib/assignment/validation';
import {
  getFilteredAssignments,
  createAssignmentItem,
} from '@/lib/assignment/service';
import { AssignmentFilterView } from '@/types/assignment';

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
  const viewParam = (searchParams.get('view') || 'active') as AssignmentFilterView;
  const courseParam = searchParams.get('course');

  const { assignments, summary } = await getFilteredAssignments(
    auth.userId,
    viewParam,
    courseParam
  );

  return apiSuccess({
    view: viewParam,
    summary,
    count: assignments.length,
    assignments,
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
    return apiError(ErrorCodes.BAD_REQUEST, 'Invalid JSON body.', 400);
  }

  const parseResult = CreateAssignmentSchema.safeParse(body);
  if (!parseResult.success) {
    return apiError(
      ErrorCodes.VALIDATION_ERROR,
      'Invalid assignment input.',
      422,
      parseResult.error.format()
    );
  }

  const result = await createAssignmentItem(auth.userId, parseResult.data);

  if (!result.assignment) {
    return apiError(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Failed to create assignment.',
      500
    );
  }

  return apiSuccess(result.assignment, 201);
}
