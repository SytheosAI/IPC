import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ArchitecturalAnalyzer } from '@/lib/architecture-analyzer/core';
import { FeedbackLoopManager } from '@/lib/architecture-analyzer/feedback-loop';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { analysisType = 'full', options = {} } = await request.json();

    // Get Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Configure analysis
    const config = {
      projectPath: process.cwd(),
      analysisType,
      mlModelVersion: 'v2.1.4',
      includePatterns: options.includePatterns || [],
      excludePatterns: options.excludePatterns || ['node_modules', '.git', '.next', 'dist', 'build'],
      deepScan: options.deepScan || false
    };

    // Initialize analyzer
    const analyzer = new ArchitecturalAnalyzer(supabaseUrl, supabaseKey, config);

    // Start analysis in background
    analyzer.startAnalysis().catch(error => {
      console.error('Analysis failed:', error);
    });

    // Return immediately with run ID
    const runNumber = `RUN-${Date.now()}`;
    const { data: runData, error: runError } = await supabase
      .from('architecture_analysis_runs')
      .insert({
        run_number: runNumber,
        analysis_type: analysisType,
        status: 'initiated',
        ml_model_version: config.mlModelVersion,
        initiated_by: user.id
      })
      .select()
      .single();

    if (runError) {
      throw runError;
    }

    return NextResponse.json({
      success: true,
      runId: runData.id,
      runNumber: runNumber,
      message: 'Analysis started successfully'
    });

  } catch (error) {
    console.error('Failed to start analysis:', error);
    return NextResponse.json(
      { error: 'Failed to start analysis' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get run ID from query params
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('runId');

    if (!runId) {
      // Return list of recent runs
      const { data: runs, error } = await supabase
        .from('architecture_analysis_runs')
        .select('*')
        .order('start_time', { ascending: false })
        .limit(10);

      if (error) throw error;

      return NextResponse.json({ runs });
    }

    // Get specific run details
    const { data: run, error: runError } = await supabase
      .from('architecture_analysis_runs')
      .select(`
        *,
        issues:architecture_issues(count),
        opportunities:optimization_opportunities(count),
        upgrades:component_upgrades(count)
      `)
      .eq('id', runId)
      .single();

    if (runError) throw runError;

    return NextResponse.json({ run });

  } catch (error) {
    console.error('Failed to get analysis status:', error);
    return NextResponse.json(
      { error: 'Failed to get analysis status' },
      { status: 500 }
    );
  }
}