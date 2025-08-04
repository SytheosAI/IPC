import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || ''
  const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent)
  const pathname = request.nextUrl.pathname

  // Mobile access restrictions
  if (isMobile) {
    // Allowed mobile paths
    const allowedMobilePaths = [
      '/mobile',
      '/vba',
      '/settings',
      '/api', // Allow API access for data sync
      '/_next', // Allow Next.js assets
      '/favicon.ico',
      '/manifest.json',
    ]

    // Check if current path is allowed for mobile
    const isAllowedPath = allowedMobilePaths.some(path => 
      pathname.startsWith(path)
    )

    // If mobile user trying to access restricted page, redirect to mobile landing
    if (!isAllowedPath && pathname !== '/') {
      return NextResponse.redirect(new URL('/mobile', request.url))
    }

    // If mobile user accessing root, redirect to mobile landing
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/mobile', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}