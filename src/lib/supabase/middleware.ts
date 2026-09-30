import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  // If using placeholder URL (not configured yet), allow dev preview with warning/mock
  const isSupabaseConfigured =
    supabaseUrl &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseUrl.includes('placeholder');

  if (!isSupabaseConfigured) {
    // Return early to allow developer to run the project without immediate crash
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Avoid using supabase.auth.getSession() in middleware as it is insecure.
  // Use supabase.auth.getUser() instead.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Determine the correct base URL
  let baseUrl = request.nextUrl.origin;
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  if (envUrl && envUrl !== 'http://localhost:3000') {
    baseUrl = envUrl;
  } else {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') ?? (request.nextUrl.protocol.replace(':', ''));
    
    if (forwardedHost) {
      baseUrl = `${protocol}://${forwardedHost}`;
    } else if (host) {
      baseUrl = `${protocol}://${host}`;
    }
  }

  // Protected application routes
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/schedule') ||
    pathname.startsWith('/assignments') ||
    pathname.startsWith('/settings');

  // Auth routes
  const isAuthRoute = pathname.startsWith('/auth/login');

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(`${baseUrl}/auth/login?next=${pathname}`);
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(`${baseUrl}/dashboard`);
  }

  return supabaseResponse;
}
