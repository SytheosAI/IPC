// TEMPORARY BYPASS LOGIN - Since Supabase Auth is broken
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Hardcoded check since Supabase is broken
    if (email === 'mparish@meridianswfl.com' && password === 'Meridian') {
      // Create a fake session
      const fakeSession = {
        user: {
          id: 'bypass-admin-id',
          email: 'mparish@meridianswfl.com',
          role: 'admin',
          name: 'Admin'
        },
        access_token: 'bypass-token-' + Date.now(),
        expires_at: Date.now() + (60 * 60 * 1000) // 1 hour
      };
      
      // Set cookie
      const cookieStore = await cookies();
      cookieStore.set('bypass-session', JSON.stringify(fakeSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 // 1 hour
      });
      
      return NextResponse.json({ 
        success: true, 
        user: fakeSession.user,
        message: 'Logged in with bypass (Supabase is broken)' 
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Invalid credentials' 
    }, { status: 401 });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Bypass login error',
      error: String(error)
    }, { status: 500 });
  }
}