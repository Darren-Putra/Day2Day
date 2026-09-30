import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  // Determine the correct base URL
  // 1. Use env variable if set and not localhost (useful for production)
  // 2. Use X-Forwarded-Host if behind a proxy
  // 3. Use Host header
  // 4. Fallback to requestUrl.origin
  let baseUrl = requestUrl.origin;
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  if (envUrl && envUrl !== 'http://localhost:3000') {
    baseUrl = envUrl;
  } else {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') ?? (requestUrl.protocol.replace(':', ''));
    
    if (forwardedHost) {
      baseUrl = `${protocol}://${forwardedHost}`;
    } else if (host) {
      baseUrl = `${protocol}://${host}`;
    }
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  // Return the user to an error page with instructions or back to login with error
  return NextResponse.redirect(`${baseUrl}/auth/login?error=auth_callback_failed`);
}
