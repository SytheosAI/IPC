import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export async function GET() {
  try {
    // Check database connectivity
    const dbStart = Date.now()
    const { error: dbError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    const dbLatency = Date.now() - dbStart
    
    // Check environment variables
    const hasWeatherApi = !!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
    const hasNewsApi = !!process.env.NEXT_PUBLIC_NEWS_API_KEY
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasGoogleMaps = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    const hasOpenAI = !!process.env.NEXT_PUBLIC_OPENAI_API_KEY
    
    // System health status
    const health = {
      status: dbError ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: !dbError,
        latency: dbLatency,
        status: dbError ? 'down' : dbLatency > 1000 ? 'degraded' : 'operational'
      },
      services: {
        weather: hasWeatherApi ? 'configured' : 'missing',
        news: hasNewsApi ? 'configured' : 'missing',
        supabase: hasSupabase ? 'configured' : 'missing',
        maps: hasGoogleMaps ? 'configured' : 'missing',
        ai: hasOpenAI ? 'configured' : 'missing'
      },
      metrics: {
        responseTime: Date.now() - dbStart,
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    }
    
    return NextResponse.json(health, { 
      status: dbError ? 503 : 200 
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}