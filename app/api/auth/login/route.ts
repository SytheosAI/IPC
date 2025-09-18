import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logAuthenticationAttempt } from '@/lib/auth-security-integration';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Get client IP and user agent for security monitoring
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      // Log failed login attempt for security monitoring
      await logAuthenticationAttempt(email, false, ip, userAgent);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    if (data.session) {
      // Log successful login attempt for security monitoring
      await logAuthenticationAttempt(email, true, ip, userAgent);
      
      // Create response with cookies
      const response = NextResponse.json({ success: true, user: data.user });
      
      // Set the access token cookie
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      
      // Set the refresh token cookie if available
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
    
    return NextResponse.json({ error: 'No session created' }, { status: 500 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}