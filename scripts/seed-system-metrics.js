const { createClient } = require('@supabase/supabase-js');
const os = require('os');
const fs = require('fs');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get real system metrics
function getSystemMetrics() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPercent = (usedMem / totalMem) * 100;
  
  // Get CPU usage (approximation)
  const cpus = os.cpus();
  let totalTick = 0;
  let totalIdle = 0;
  
  cpus.forEach(cpu => {
    const times = cpu.times;
    const total = times.user + times.nice + times.sys + times.idle + times.irq;
    totalTick += total;
    totalIdle += times.idle;
  });
  
  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const cpuPercent = 100 - (idle / total) * 100;
  
  // Get disk usage (simplified - would need more complex logic for actual disk usage)
  const diskPercent = Math.random() * 30 + 40; // Simulated between 40-70%
  
  // Network bytes (would need actual network monitoring in production)
  const networkRx = Math.floor(Math.random() * 1000000) + 500000;
  const networkTx = Math.floor(Math.random() * 500000) + 250000;
  
  return {
    cpu_percent: Math.max(0, Math.min(100, cpuPercent)),
    memory_total: totalMem,
    memory_used: usedMem,
    memory_percent: memPercent,
    disk_percent: diskPercent,
    network_rx_bytes: networkRx,
    network_tx_bytes: networkTx,
    timestamp: new Date().toISOString()
  };
}

// Generate security events
function generateSecurityEvents() {
  const events = [];
  const eventTypes = ['login_attempt', 'firewall_block', 'malware_scan', 'intrusion_detection'];
  const severities = ['low', 'medium', 'high'];
  
  // Generate 0-3 events
  const eventCount = Math.floor(Math.random() * 4);
  
  for (let i = 0; i < eventCount; i++) {
    events.push({
      event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      description: `Security event detected - ${eventTypes[Math.floor(Math.random() * eventTypes.length)]}`,
      source_ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      timestamp: new Date().toISOString()
    });
  }
  
  return events;
}

async function seedMetrics() {
  try {
    console.log('🔄 Seeding system metrics...');
    
    // Insert system metrics
    const metrics = getSystemMetrics();
    const { data: metricsData, error: metricsError } = await supabase
      .from('system_metrics')
      .insert([metrics]);
      
    if (metricsError) {
      console.error('Error inserting metrics:', metricsError);
    } else {
      console.log('✅ System metrics inserted:', metrics);
    }
    
    // Insert security events
    const securityEvents = generateSecurityEvents();
    if (securityEvents.length > 0) {
      const { data: eventsData, error: eventsError } = await supabase
        .from('security_events')
        .insert(securityEvents);
        
      if (eventsError) {
        console.error('Error inserting security events:', eventsError);
      } else {
        console.log(`✅ ${securityEvents.length} security events inserted`);
      }
    }
    
    console.log('🎉 Database seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run seeding
seedMetrics();

// Also set up continuous seeding every 30 seconds for live data
setInterval(seedMetrics, 30000);

console.log('📊 Live metrics seeder started - will update every 30 seconds');
console.log('Press Ctrl+C to stop');