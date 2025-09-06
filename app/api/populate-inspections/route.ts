import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
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

    // Sample inspection arrays for different project types
    const sampleInspections = [
      ['Foundation Inspection', 'Framing Inspection', 'Electrical Rough-In', 'Plumbing Rough-In', 'Insulation Inspection', 'Drywall Inspection', 'Final Electrical', 'Final Plumbing', 'Final Building'],
      ['Site Survey', 'Foundation Inspection', 'Framing Inspection', 'Electrical Rough-In', 'Plumbing Rough-In', 'HVAC Rough-In', 'Insulation Inspection', 'Final Inspection'],
      ['Demolition Inspection', 'Structural Inspection', 'Electrical Systems', 'Plumbing Systems', 'Fire Safety Systems', 'HVAC Systems', 'Final Inspection']
    ];

    // Update all existing projects with selected_inspections
    const { data: projects, error: fetchError } = await supabase
      .from('vba_projects')
      .select('id');
    
    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    const updates = projects.map((project, index) => ({
      id: project.id,
      selected_inspections: sampleInspections[index % sampleInspections.length]
    }));

    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('vba_projects')
        .update({ selected_inspections: update.selected_inspections })
        .eq('id', update.id);
      
      if (updateError) {
        console.error('Update error for project', update.id, ':', updateError);
      }
    }

    return NextResponse.json({ 
      message: 'Successfully populated selected_inspections for all projects',
      updatedCount: updates.length 
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}