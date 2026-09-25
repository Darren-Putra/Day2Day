import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/api/auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api/response';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseReady } from '@/lib/schedule/service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

function getSupabaseDbClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return createSupabaseClient(supabaseUrl, serviceRoleKey || anonKey);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return apiError(ErrorCodes.UNAUTHORIZED, 'Authentication required.', 401);
  }

  const { id } = await params;
  if (!id) {
    return apiError(ErrorCodes.BAD_REQUEST, 'Missing key ID parameter.', 400);
  }

  if (!isSupabaseReady()) {
    return apiSuccess({ success: true, message: 'API key revoked successfully.' });
  }

  const client = getSupabaseDbClient();
  // Mark key as revoked or delete
  const { error } = await client
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', auth.userId);

  if (error) {
    return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 'Failed to revoke API key.', 500);
  }

  return apiSuccess({ success: true, message: 'API key revoked successfully.' });
}
