import { createClient } from '@supabase/supabase-js';
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
    '/_next',
    '/favicon.ico',
    '/manifest.json',
  ];

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // For public routes, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  try {
    // Get the access token from cookies
    const accessToken = request.cookies.get('sb-access-token')?.value;
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;

    // If no tokens, redirect to login
    if (!accessToken && !refreshToken) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Create Supabase client with the tokens
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables in middleware');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Try to get the user with the access token
    if (accessToken) {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      
      if (user && !error) {
        // User is authenticated, allow access
        
        // If authenticated user tries to access login, redirect to dashboard
        if (pathname === '/login') {
          return NextResponse.redirect(new URL('/', request.url));
        }

        // Mobile detection and routing
        const userAgent = request.headers.get('user-agent') || '';
        const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);

        if (isMobile) {
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

        return NextResponse.next();
      }
    }

    // If we have a refresh token but no valid access token, try to refresh
    if (refreshToken) {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (data.session && !error) {
        // Set new tokens in cookies
        const response = NextResponse.next();
        
        response.cookies.set('sb-access-token', data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });

        if (data.session.refresh_token) {
          response.cookies.set('sb-refresh-token', data.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
          });
        }

        return response;
      }
    }

    // If we can't authenticate, redirect to login
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);

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