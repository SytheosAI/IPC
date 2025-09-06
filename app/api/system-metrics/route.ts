import { NextRequest, NextResponse } from 'next/server';
import os from 'os';

// Aggressive caching for instant metrics response
const metricsCache = new Map();
const METRICS_CACHE_TTL = 15000; // 15 seconds

export async function GET() {
  try {
    // Serve from cache for lightning-fast response
    const now = Date.now();
    const cached = metricsCache.get('system-metrics');
    if (cached && (now - cached.timestamp) < METRICS_CACHE_TTL) {
      return new Response(JSON.stringify(cached.data), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=15, stale-while-revalidate=30',
        },
      });
    }
    // Get memory info
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = (usedMem / totalMem) * 100;
    
    // Get CPU info
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach((cpu) => {
      for (const type in cpu.times) {
        totalTick += (cpu.times as any)[type];
      }
      totalIdle += cpu.times.idle;
    });
    
    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const cpuUsage = Math.max(0, 100 - (idle / total) * 100);
    
    // Get actual disk usage - for now we'll use 0 until real disk monitoring is implemented
    const diskUsage = 0; // TODO: Implement actual disk usage monitoring
    
    // Get actual network activity - for now we'll use 0 until real network monitoring is implemented  
    const networkActivity = 0; // TODO: Implement actual network monitoring
    
    // Calculate health score
    const healthScore = Math.round((
      Math.max(0, 100 - cpuUsage) + 
      Math.max(0, 100 - memoryUsage) + 
      Math.max(0, 100 - diskUsage)
    ) / 3);
    
    const systemInfo = {
      platform: os.platform(),
      architecture: os.arch(),
      hostname: os.hostname(),
      uptime: os.uptime(),
      loadAverage: os.loadavg(),
      cpuCount: cpus.length,
      cpuModel: cpus[0]?.model || 'Unknown'
    };
    
    const metrics = {
      timestamp: new Date().toISOString(),
      cpuUsage: Math.min(100, Math.max(0, cpuUsage)),
      memoryUsage,
      diskUsage,
      networkActivity,
      healthScore,
      totalMemory: totalMem,
      freeMemory: freeMem,
      usedMemory: usedMem,
      systemInfo,
      // Real security metrics - will be 0 until actual monitoring is implemented
      securityAlerts: 0, // TODO: Implement actual security alert monitoring
      activeConnections: 0, // TODO: Implement actual connection monitoring  
      blockedThreats: 0, // TODO: Implement actual threat monitoring
    };
    
    // Cache metrics for next request
    metricsCache.set('system-metrics', {
      data: metrics,
      timestamp: now
    });

    return new Response(JSON.stringify(metrics), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=15, stale-while-revalidate=30',
      },
    });
    
  } catch (error) {
    console.error('Error getting system metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get system metrics' },
      { status: 500 }
    );
  }
}