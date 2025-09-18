#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://rxkakjowitqnbbjezedu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a2Fram93aXRxbmJiamV6ZWR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDI1MzU1OCwiZXhwIjoyMDY5ODI5NTU4fQ.RugCai5lmT3_eIU55G7XzlqdQDy6dZLk-5JtXeIJmeA';

async function verifyIntegrations() {
  console.log('🔍 COMPREHENSIVE INTEGRATION VERIFICATION');
  console.log('=========================================\n');
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  const test = (name, condition, expected = true) => {
    totalTests++;
    const passed = condition === expected;
    if (passed) {
      passedTests++;
      console.log(`✅ ${name}`);
    } else {
      failedTests++;
      console.log(`❌ ${name} - Expected: ${expected}, Got: ${condition}`);
    }
    return passed;
  };

  // 1. Database Connection Test
  console.log('🔗 Database Connection Tests:');
  try {
    const { data, error } = await supabase.from('activity_logs').select('count', { count: 'exact', head: true });
    test('Supabase connection', !error);
    test('Activity logs table accessible', data !== null);
  } catch (error) {
    test('Database connection', false);
  }

  // 2. File Structure Tests
  console.log('\n📁 File Structure Tests:');
  
  const requiredFiles = [
    // Core components
    { path: 'components/LazyComponents.tsx', name: 'LazyComponents exist' },
    { path: 'components/PerformanceDashboard.tsx', name: 'PerformanceDashboard exists' },
    { path: 'components/OptimizedImage.tsx', name: 'OptimizedImage exists' },
    { path: 'components/TwoFactorAuth.tsx', name: 'TwoFactorAuth exists' },
    
    // Libraries
    { path: 'lib/rate-limiter.ts', name: 'Rate limiter library exists' },
    { path: 'lib/encryption.ts', name: 'Encryption library exists' },
    { path: 'lib/security-monitoring.ts', name: 'Security monitoring library exists' },
    { path: 'lib/2fa-utils.ts', name: '2FA utilities exist' },
    
    // API endpoints
    { path: 'app/api/performance-metrics/route.ts', name: 'Performance metrics API exists' },
    { path: 'app/api/optimize-image/route.ts', name: 'Image optimization API exists' },
    
    // Pages
    { path: 'app/performance/page.tsx', name: 'Performance page exists' },
    
    // Service worker
    { path: 'public/sw.js', name: 'Enhanced service worker exists' },
    
    // Middleware
    { path: 'middleware.ts', name: 'Rate limiting middleware exists' }
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file.path);
    test(file.name, fs.existsSync(filePath));
  }

  // 3. Component Integration Tests
  console.log('\n🧩 Component Integration Tests:');
  
  // Check if LazyComponents are properly exported
  try {
    const lazyComponentsContent = fs.readFileSync(path.join(process.cwd(), 'components/LazyComponents.tsx'), 'utf8');
    test('LazyPerformanceDashboard exported', lazyComponentsContent.includes('LazyPerformanceDashboard'));
    test('PerformanceDashboardWithSuspense exported', lazyComponentsContent.includes('PerformanceDashboardWithSuspense'));
    test('LazySecurityCenter exported', lazyComponentsContent.includes('LazySecurityCenter'));
  } catch (error) {
    test('LazyComponents content readable', false);
  }

  // Check navigation integration
  try {
    const sidebarContent = fs.readFileSync(path.join(process.cwd(), 'app/components/layout/Sidebar.tsx'), 'utf8');
    test('Performance link in navigation', sidebarContent.includes('/performance'));
    test('BarChart3 icon imported', sidebarContent.includes('BarChart3'));
    test('Security Center in navigation', sidebarContent.includes('/security'));
  } catch (error) {
    test('Sidebar navigation readable', false);
  }

  // 4. Service Integration Tests
  console.log('\n⚙️ Service Integration Tests:');
  
  // Test middleware integration
  try {
    const middlewareContent = fs.readFileSync(path.join(process.cwd(), 'middleware.ts'), 'utf8');
    test('Rate limiting imports', middlewareContent.includes('rate-limiter'));
    test('Authentication enabled', !middlewareContent.includes('return NextResponse.next();') || middlewareContent.includes('handleAuth'));
    test('Multiple rate limiters configured', middlewareContent.includes('rateLimiters'));
  } catch (error) {
    test('Middleware integration readable', false);
  }

  // 5. Database Data Verification
  console.log('\n💾 Database Data Verification:');
  
  try {
    // Check for system setup data
    const { data: setupData } = await supabase
      .from('activity_logs')
      .select('action')
      .in('action', [
        'database_optimization_complete',
        'bundle_analysis_complete',
        '2fa_schema_creation',
        'rate_limiting_setup',
        'encryption_system_setup',
        'security_monitoring_setup'
      ]);

    const actions = setupData?.map(d => d.action) || [];
    test('Database optimization logged', actions.includes('database_optimization_complete'));
    test('Bundle analysis logged', actions.includes('bundle_analysis_complete'));
    test('2FA setup logged', actions.includes('2fa_schema_creation'));
    test('Rate limiting setup logged', actions.includes('rate_limiting_setup'));
    test('Encryption setup logged', actions.includes('encryption_system_setup'));
    test('Security monitoring setup logged', actions.includes('security_monitoring_setup'));

  } catch (error) {
    test('Database data verification', false);
  }

  // 6. API Endpoint Tests
  console.log('\n🌐 API Endpoint Tests:');
  
  try {
    // Test if API files are properly structured
    const perfApiContent = fs.readFileSync(path.join(process.cwd(), 'app/api/performance-metrics/route.ts'), 'utf8');
    test('Performance API exports GET', perfApiContent.includes('export async function GET'));
    test('Performance API uses Supabase', perfApiContent.includes('createClient'));
    test('Performance API returns metrics', perfApiContent.includes('databaseStats'));
  } catch (error) {
    test('Performance API structure', false);
  }

  // 7. Security Implementation Tests
  console.log('\n🛡️ Security Implementation Tests:');
  
  try {
    const securityContent = fs.readFileSync(path.join(process.cwd(), 'lib/security-monitoring.ts'), 'utf8');
    test('Security monitor class exists', securityContent.includes('class SecurityMonitor'));
    test('Threat detection implemented', securityContent.includes('detectThreats'));
    test('Automated response implemented', securityContent.includes('executeAutoResponse'));
  } catch (error) {
    test('Security monitoring structure', false);
  }

  // 8. Performance Optimization Tests
  console.log('\n⚡ Performance Optimization Tests:');
  
  try {
    const swContent = fs.readFileSync(path.join(process.cwd(), 'public/sw.js'), 'utf8');
    test('Service worker has caching strategies', swContent.includes('handleApiRequest'));
    test('Service worker has IndexedDB', swContent.includes('indexedDB'));
    test('Service worker has background sync', swContent.includes('sync-offline-actions'));
    test('Service worker version updated', swContent.includes('ipc-v2-enhanced'));
  } catch (error) {
    test('Service worker optimization', false);
  }

  // 9. Integration Completeness Tests
  console.log('\n🔗 Integration Completeness Tests:');
  
  // Check if components use lazy loading
  try {
    const perfPageContent = fs.readFileSync(path.join(process.cwd(), 'app/performance/page.tsx'), 'utf8');
    test('Performance page uses lazy loading', perfPageContent.includes('PerformanceDashboardWithSuspense'));
  } catch (error) {
    test('Performance page integration', false);
  }

  // 10. Live Data Integration Test
  console.log('\n📊 Live Data Integration Test:');
  
  try {
    // Test real-time data access
    const { data: recentLogs } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    test('Recent activity logs accessible', recentLogs && recentLogs.length > 0);
    
    // Test if our systems are generating data
    const systemActions = recentLogs?.filter(log => 
      log.action.includes('optimization') || 
      log.action.includes('setup') || 
      log.action.includes('monitoring')
    ) || [];
    
    test('System integration generating data', systemActions.length > 0);
  } catch (error) {
    test('Live data integration', false);
  }

  // Final Report
  console.log('\n📋 INTEGRATION VERIFICATION SUMMARY');
  console.log('=====================================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (failedTests === 0) {
    console.log('\n🎉 ALL INTEGRATIONS VERIFIED SUCCESSFULLY!');
    console.log('🚀 System is fully operational and connected');
  } else if (failedTests <= 3) {
    console.log('\n⚠️  MINOR INTEGRATION ISSUES DETECTED');
    console.log('🔧 System is mostly operational with minor fixes needed');
  } else {
    console.log('\n🚨 MAJOR INTEGRATION ISSUES DETECTED');
    console.log('🛠️ System requires significant integration work');
  }

  // Log verification results to database
  try {
    await supabase.from('activity_logs').insert({
      user_id: 'system',
      action: 'integration_verification_complete',
      entity_type: 'system_test',
      metadata: {
        total_tests: totalTests,
        passed_tests: passedTests,
        failed_tests: failedTests,
        success_rate: Math.round((passedTests / totalTests) * 100),
        verification_timestamp: new Date().toISOString(),
        system_status: failedTests === 0 ? 'fully_operational' : 
                      failedTests <= 3 ? 'mostly_operational' : 'needs_work'
      }
    });
    console.log('\n💾 Verification results stored in database');
  } catch (error) {
    console.log('\n⚠️ Could not store verification results');
  }

  return {
    totalTests,
    passedTests, 
    failedTests,
    successRate: Math.round((passedTests / totalTests) * 100)
  };
}

// Run verification
if (require.main === module) {
  verifyIntegrations().catch(console.error);
}

module.exports = { verifyIntegrations };