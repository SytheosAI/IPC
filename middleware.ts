import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/auth/callback',
    '/reset-password',
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/manifest.json',
  ];

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Get session
  const { data: { session } } = await supabase.auth.getSession();

  // If no session and trying to access protected route, redirect to login
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If session exists and trying to access login, redirect to dashboard
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Mobile detection and routing
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);

  if (isMobile && session) {
    // Allowed mobile paths for authenticated users
    const allowedMobilePaths = [
      '/mobile',
      '/vba',
      '/settings',
      '/api',
      '/_next',
      '/favicon.ico',
      '/manifest.json',
      '/login',
      '/auth',
    ];

    const isAllowedPath = allowedMobilePaths.some(path => 
      pathname.startsWith(path)
    );

    // If mobile user trying to access restricted page, redirect to mobile landing
    if (!isAllowedPath && pathname !== '/') {
      return NextResponse.redirect(new URL('/mobile', request.url));
    }

    // If mobile user accessing root, redirect to mobile landing
    if (pathname === '/' && !pathname.startsWith('/mobile')) {
      return NextResponse.redirect(new URL('/mobile', request.url));
    }
  }

  // Admin route protection
  const adminRoutes = ['/architecture-analysis', '/security'];
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  if (isAdminRoute && session) {
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, title')
      .eq('user_id', session.user.id)
      .single();

    const isAdmin = profile?.role === 'admin' || 
                   profile?.title?.toLowerCase() === 'administrator' ||
                   session.user.email === 'mparish@meridianswfl.com';

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};