import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false
      }
    });
    
    const { ids } = await request.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty IDs array' },
        { status: 400 }
      );
    }
    
    // First, get the projects that will be deleted for logging
    const { data: projectsToDelete } = await supabase
      .from('vba_projects')
      .select('id, project_name, project_number')
      .in('id', ids);
    
    // Delete from vba_projects table
    const { error: vbaError } = await supabase
      .from('vba_projects')
      .delete()
      .in('id', ids);
    
    if (vbaError) {
      console.error('VBA Projects bulk delete error:', vbaError);
      return NextResponse.json(
        { error: vbaError.message },
        { status: 400 }
      );
    }
    
    // Also delete from main projects table (cascade delete)
    const { error: projectError } = await supabase
      .from('projects')
      .delete()
      .in('id', ids);
    
    // Don't fail if project doesn't exist in main table
    if (projectError && projectError.code !== 'PGRST116') {
      console.error('Main projects bulk delete error:', projectError);
    }
    
    // Log bulk delete activity
    try {
      await supabase
        .from('activity_logs')
        .insert([{
          action: 'bulk_delete_vba_projects',
          user_id: 'system', // Replace with actual user ID when auth is enabled
          metadata: {
            deleted_projects: projectsToDelete,
            count: ids.length
          }
        }]);
    } catch (logError) {
      console.error('Activity log error:', logError);
      // Don't fail the main operation if logging fails
    }
    
    return NextResponse.json({ 
      success: true, 
      deleted: ids.length 
    });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}