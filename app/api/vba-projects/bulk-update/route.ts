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
    
    const { ids, updates } = await request.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty IDs array' },
        { status: 400 }
      );
    }
    
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Invalid updates object' },
        { status: 400 }
      );
    }
    
    // Add updated_at timestamp
    const finalUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // Bulk update VBA projects
    const { data, error } = await supabase
      .from('vba_projects')
      .update(finalUpdates)
      .in('id', ids)
      .select();
    
    if (error) {
      console.error('Bulk update error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    // Log bulk operation activity
    try {
      await supabase
        .from('activity_logs')
        .insert([{
          action: 'bulk_update_vba_projects',
          user_id: 'system', // Replace with actual user ID when auth is enabled
          metadata: {
            project_ids: ids,
            updates: finalUpdates,
            count: ids.length
          }
        }]);
    } catch (logError) {
      console.error('Activity log error:', logError);
      // Don't fail the main operation if logging fails
    }
    
    return NextResponse.json({ 
      success: true, 
      updated: data?.length || 0,
      data 
    });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}