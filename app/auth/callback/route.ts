import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  // Handle errors from Supabase
  if (error) {
    console.error('Auth callback error:', error, error_description);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error_description || error)}`);
  }

  if (code) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase environment variables');
        return NextResponse.redirect(`${requestUrl.origin}/login?error=Configuration error`);
      }

      // Create a Supabase client
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Exchange the code for a session
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) {
        console.error('Session exchange error:', sessionError);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(sessionError.message)}`);
      }

      // Set the session cookie
      if (data.session) {
        const cookieStore = cookies();
        
        // Set both access token and refresh token as cookies
        cookieStore.set('sb-access-token', data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });

        cookieStore.set('sb-refresh-token', data.session.refresh_token || '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
        });
      }
    } catch (err) {
      console.error('Unexpected error in auth callback:', err);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=Authentication failed`);
    }
  }

  // Handle password recovery
  if (type === 'recovery') {
    return NextResponse.redirect(`${requestUrl.origin}/reset-password`);
  }

  // Redirect to dashboard after successful authentication
  return NextResponse.redirect(`${requestUrl.origin}/`);
}