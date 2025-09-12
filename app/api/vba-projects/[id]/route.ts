import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    // Use service role key to bypass RLS for testing
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false
      }
    });
    
    const projectId = params.id;
    
    // Delete from vba_projects table
    const { error: vbaError } = await supabase
      .from('vba_projects')
      .delete()
      .eq('id', projectId);
    
    if (vbaError) {
      console.error('VBA Project deletion error:', vbaError);
      return NextResponse.json(
        { error: vbaError.message },
        { status: 400 }
      );
    }
    
    // Also delete from main projects table if it exists
    const { error: projectError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    
    // Don't fail if project doesn't exist in main table
    if (projectError && projectError.code !== 'PGRST116') {
      console.error('Main project deletion error:', projectError);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}