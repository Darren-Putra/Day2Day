import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'crypto';
import { NextRequest } from 'next/server';
import { isSupabaseReady } from '@/lib/schedule/service';

export interface AuthUser {
  userId: string;
  email?: string;
  authMethod: 'session' | 'api_key';
  apiKeyId?: string;
}

export interface DevKeyRecord {
  id: string;
  userId: string;
  hash: string;
  prefix: string;
  name: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

// Dev in-memory store for API keys when developing without Supabase credentials
export const devApiKeyStore: Map<string, DevKeyRecord> = new Map();

/**
 * Hash an API key with SHA-256 for secure storage and comparison
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Generate a new secure API key and its prefix
 */
export function generateApiKey(): { key: string; hash: string; prefix: string } {
  // Format: d2d_live_<32 random hex characters>
  const randomPart = randomBytes(24).toString('hex');
  const key = `d2d_live_${randomPart}`;
  const prefix = key.slice(0, 14); // e.g. "d2d_live_ab12"
  const hash = hashApiKey(key);
  return { key, hash, prefix };
}

/**
 * Authenticates an incoming request via either:
 * 1. Authorization: Bearer <API_KEY> (from external automation / AI agents)
 * 2. Supabase Auth cookie session or Dev Session cookie (from website user)
 *
 * If NEITHER is present or key is invalid, returns null (triggering 401 Unauthorized).
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization');

  // Case 1: Bearer API Key in Authorization header
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (!token) return null;

    const keyHash = hashApiKey(token);

    // If using dev in-memory store
    if (!isSupabaseReady()) {
      const found = devApiKeyStore.get(keyHash);
      if (found && !found.revokedAt) {
        found.lastUsedAt = new Date().toISOString();
        return {
          userId: found.userId,
          authMethod: 'api_key',
          apiKeyId: found.id,
        };
      }
      return null; // Key not found or revoked
    }

    // If using live Supabase DB
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || (!serviceRoleKey && !anonKey)) {
      return null;
    }

    const adminClient = createSupabaseClient(
      supabaseUrl,
      serviceRoleKey || anonKey!
    );

    const { data: keyRecord, error } = await adminClient
      .from('api_keys')
      .select('id, user_id, revoked_at')
      .eq('key_hash', keyHash)
      .is('revoked_at', null)
      .single();

    if (!error && keyRecord && keyRecord.user_id) {
      adminClient
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', keyRecord.id)
        .then();

      return {
        userId: keyRecord.user_id,
        authMethod: 'api_key',
        apiKeyId: keyRecord.id,
      };
    }

    return null;
  }

  // Case 2: Session Cookie (from website frontend)
  if (isSupabaseReady()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!error && user) {
        return {
          userId: user.id,
          email: user.email,
          authMethod: 'session',
        };
      }
    } catch {
      // Session retrieval error
    }
    return null;
  }

  // In dev mode without Supabase, check for dev session cookie or header
  const devSessionCookie = request.cookies.get('d2d_session')?.value;
  if (devSessionCookie) {
    return {
      userId: devSessionCookie,
      email: 'darren@student.ac.id',
      authMethod: 'session',
    };
  }

  // If no Bearer key and no session cookie, reject as UNAUTHORIZED
  return null;
}
