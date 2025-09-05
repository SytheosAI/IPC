import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Create authenticated Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      },
      auth: {
        persistSession: false
      }
    });
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      console.error('Profile error:', profileError);
      // Return basic user info if profile doesn't exist
      return NextResponse.json({
        name: user.email?.split('@')[0] || 'User',
        email: user.email || '',
        phone: '',
        title: user.email === 'mparish@meridianswfl.com' ? 'Administrator' : 'Inspector',
        company: '',
        address: '',
        role: user.email === 'mparish@meridianswfl.com' ? 'admin' : 'inspector',
        isAdmin: user.email === 'mparish@meridianswfl.com'
      });
    }
    
    return NextResponse.json({
      name: profile.name || user.email?.split('@')[0] || 'User',
      email: profile.email || user.email || '',
      phone: profile.phone || '',
      title: profile.title || profile.role || (user.email === 'mparish@meridianswfl.com' ? 'Administrator' : 'Inspector'),
      company: profile.company || '',
      address: profile.address || '',
      role: profile.role || (user.email === 'mparish@meridianswfl.com' ? 'admin' : 'inspector'),
      isAdmin: profile.role === 'admin' || user.email === 'mparish@meridianswfl.com'
    });
    
  } catch (error) {
    console.error('User profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}