import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/auth/callback',
    '/reset-password',
    '/api/auth',
    '/api/system-metrics',
    '/api/security-events',
    '/_next',
    '/favicon.ico',
    '/manifest.json',
    '/sw.js',
  ];

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // For public routes, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  try {
    // Simple cookie-based auth check for Edge Runtime compatibility
    const accessToken = request.cookies.get('sb-access-token')?.value;
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;

    // If no tokens, redirect to login
    if (!accessToken && !refreshToken) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // If authenticated user tries to access login, redirect to dashboard
    if (pathname === '/login' && (accessToken || refreshToken)) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Mobile detection and routing
    const userAgent = request.headers.get('user-agent') || '';
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);

    if (isMobile && (accessToken || refreshToken)) {
      // Allowed mobile paths for authenticated users
      const allowedMobilePaths = [
        '/mobile',
        '/vba',
        '/settings',
        '/api',
        '/_next',
        '/auth',
        '/field-reports',
        '/projects',
        '/submittals',
        '/documents',
        '/login',
        '/reset-password'
      ];

      // If mobile user and not on an allowed mobile path, redirect to mobile page
      if (!allowedMobilePaths.some(path => pathname.startsWith(path))) {
        return NextResponse.redirect(new URL('/mobile', request.url));
      }
    }

    // Allow access for authenticated users
    return NextResponse.next();

  } catch (error) {
    console.error('Middleware error:', error);
    // On error, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};