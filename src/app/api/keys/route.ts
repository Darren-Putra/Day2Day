import { NextRequest } from 'next/server';
import { authenticateRequest, generateApiKey, devApiKeyStore } from '@/lib/api/auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/api/response';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseReady } from '@/lib/schedule/service';
import { ApiKeyItem } from '@/types/schedule';

// Dev fallback store for API keys
const devKeyStore: Map<string, (ApiKeyItem & { key_hash: string })[]> = new Map();

function getSupabaseDbClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return createSupabaseClient(supabaseUrl, serviceRoleKey || anonKey);
}

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return apiError(ErrorCodes.UNAUTHORIZED, 'Authentication required.', 401);
  }

  if (!isSupabaseReady()) {
    const list = devKeyStore.get(auth.userId) || [];
    return apiSuccess({
      keys: list.map(({ key_hash, ...rest }) => rest),
    });
  }

  const client = getSupabaseDbClient();
  const { data, error } = await client
    .from('api_keys')
    .select('id, user_id, name, key_prefix, last_used_at, created_at, revoked_at')
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: false });

  if (error) {
    return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 'Failed to list API keys.', 500);
  }

  return apiSuccess({ keys: data });
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return apiError(ErrorCodes.UNAUTHORIZED, 'Authentication required.', 401);
  }

  let body: { name?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = { name: 'Default API Key' };
  }

  const name = body.name?.trim() || 'My API Key';
  const { key, hash, prefix } = generateApiKey();

  const newKeyRecord: ApiKeyItem & { key_hash: string } = {
    id: crypto.randomUUID(),
    user_id: auth.userId,
    name,
    key_prefix: prefix,
    key_hash: hash,
    last_used_at: null,
    created_at: new Date().toISOString(),
    revoked_at: null,
  };

  if (!isSupabaseReady()) {
    const list = devKeyStore.get(auth.userId) || [];
    list.unshift(newKeyRecord);
    devKeyStore.set(auth.userId, list);

    // Also register in devApiKeyStore for incoming Bearer token lookup
    devApiKeyStore.set(hash, {
      id: newKeyRecord.id,
      userId: auth.userId,
      hash,
      prefix,
      name,
      lastUsedAt: null,
      revokedAt: null,
      createdAt: newKeyRecord.created_at,
    });

    return apiSuccess(
      {
        message: 'API Key generated successfully. Copy it now, it will not be shown again.',
        key, // Plaintext returned ONLY ONCE upon creation!
        apiKey: {
          id: newKeyRecord.id,
          name: newKeyRecord.name,
          key_prefix: newKeyRecord.key_prefix,
          created_at: newKeyRecord.created_at,
        },
      },
      201
    );
  }

  const client = getSupabaseDbClient();
  const { data, error } = await client
    .from('api_keys')
    .insert({
      id: newKeyRecord.id,
      user_id: auth.userId,
      name,
      key_hash: hash,
      key_prefix: prefix,
    })
    .select('id, name, key_prefix, created_at')
    .single();

  if (error || !data) {
    console.error('API key creation error:', error);
    return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 'Failed to create API key.', 500);
  }

  return apiSuccess(
    {
      message: 'API Key generated successfully. Copy it now, it will not be shown again.',
      key, // Plaintext returned ONLY ONCE!
      apiKey: data,
    },
    201
  );
}
