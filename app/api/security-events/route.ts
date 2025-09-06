import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import fs from 'fs/promises';

const execAsync = promisify(exec);

// Cache for 30 seconds to dramatically reduce system calls
const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds

export async function GET() {
  try {
    // Check cache first for instant response
    const now = Date.now();
    const cached = cache.get('security-events');
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return new Response(JSON.stringify(cached.data), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
        },
      });
    }
    const securityEvents = [];
    const timestamp = new Date().toISOString();

    // 1. Check active network connections (real system data)
    try {
      const { stdout: netstat } = await execAsync('netstat -an');
      const connections = netstat.split('\n').filter(line => 
        line.includes('ESTABLISHED') || line.includes('LISTENING')
      ).length;
      
      securityEvents.push({
        id: `conn_${Date.now()}`,
        timestamp,
        event_type: 'network_monitoring',
        severity: 'info',
        description: `${connections} active network connections detected`,
        source_ip: '127.0.0.1',
        details: { connection_count: connections }
      });
    } catch (error) {
      console.error('Network monitoring failed:', error);
    }

    // 2. Check running processes (real system data)
    try {
      const { stdout: tasklist } = await execAsync('tasklist /fo csv');
      const processes = tasklist.split('\n').length - 1;
      
      securityEvents.push({
        id: `proc_${Date.now()}`,
        timestamp,
        event_type: 'process_monitoring',
        severity: 'info',
        description: `${processes} processes currently running`,
        source_ip: os.hostname(),
        details: { process_count: processes }
      });
    } catch (error) {
      console.error('Process monitoring failed:', error);
    }

    // 3. Check Windows Event Log for security events (real system data)
    try {
      const { stdout: eventlog } = await execAsync('wevtutil qe Security /c:10 /f:text /rd:true');
      if (eventlog.trim()) {
        securityEvents.push({
          id: `winlog_${Date.now()}`,
          timestamp,
          event_type: 'windows_security',
          severity: 'medium',
          description: 'Windows Security Event Log accessed',
          source_ip: os.hostname(),
          details: { log_entries: eventlog.split('\n').length }
        });
      }
    } catch (error) {
      // Windows Event Log access may require admin privileges
      console.log('Windows Event Log access limited (requires admin)');
    }

    // 4. Check system uptime and load
    const uptime = os.uptime();
    const loadavg = os.loadavg();
    
    if (loadavg[0] > 2) {
      securityEvents.push({
        id: `load_${Date.now()}`,
        timestamp,
        event_type: 'system_performance',
        severity: 'warning',
        description: `High system load detected: ${loadavg[0].toFixed(2)}`,
        source_ip: os.hostname(),
        details: { load_average: loadavg[0] }
      });
    }

    // 5. Check memory usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercent = (usedMem / totalMem) * 100;

    if (memPercent > 85) {
      securityEvents.push({
        id: `mem_${Date.now()}`,
        timestamp,
        event_type: 'resource_monitoring',
        severity: 'critical',
        description: `Critical memory usage: ${memPercent.toFixed(1)}%`,
        source_ip: os.hostname(),
        details: { memory_percent: memPercent }
      });
    }

    // 6. Check for suspicious port activity
    try {
      const { stdout: ports } = await execAsync('netstat -an | findstr LISTENING');
      const openPorts = ports.split('\n').filter(line => line.trim()).length;
      
      if (openPorts > 50) {
        securityEvents.push({
          id: `port_${Date.now()}`,
          timestamp,
          event_type: 'network_security',
          severity: 'medium',
          description: `${openPorts} listening ports detected`,
          source_ip: os.hostname(),
          details: { open_ports: openPorts }
        });
      }
    } catch (error) {
      console.error('Port scanning failed:', error);
    }

    const responseData = {
      events: securityEvents,
      timestamp,
      system_info: {
        hostname: os.hostname(),
        platform: os.platform(),
        uptime: uptime,
        load_average: loadavg
      }
    };

    // Cache the response for next request
    cache.set('security-events', {
      data: responseData,
      timestamp: now
    });

    return new Response(JSON.stringify(responseData), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
      },
    });

  } catch (error) {
    console.error('Error generating security events:', error);
    return NextResponse.json(
      { error: 'Failed to get security events' },
      { status: 500 }
    );
  }
}