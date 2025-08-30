import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { FeedbackLoopManager } from '@/lib/architecture-analyzer/feedback-loop';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse feedback data
    const feedbackData = await request.json();

    // Validate feedback data
    if (!feedbackData.referenceType || !feedbackData.referenceId || !feedbackData.feedbackType || !feedbackData.rating) {
      return NextResponse.json(
        { error: 'Missing required feedback fields' },
        { status: 400 }
      );
    }

    // Get Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Initialize feedback manager
    const feedbackManager = new FeedbackLoopManager(supabaseUrl, supabaseKey);

    // Submit feedback
    await feedbackManager.submitFeedback({
      ...feedbackData,
      userId: user.id
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Failed to submit feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
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

    // Get Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Initialize feedback manager
    const feedbackManager = new FeedbackLoopManager(supabaseUrl, supabaseKey);

    // Get feedback statistics
    const stats = await feedbackManager.getFeedbackStatistics();

    // Get performance metrics
    const performanceMetrics = await feedbackManager.getPerformanceMetrics();

    return NextResponse.json({
      statistics: stats,
      performance: Array.from(performanceMetrics.entries()).map(([key, value]) => ({
        model: key,
        metrics: value
      }))
    });

  } catch (error) {
    console.error('Failed to get feedback statistics:', error);
    return NextResponse.json(
      { error: 'Failed to get feedback statistics' },
      { status: 500 }
    );
  }
}