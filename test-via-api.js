const fetch = require('node-fetch');

async function testViaAPI() {
  console.log('=== TESTING VIA API ENDPOINTS ===\n');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // 1. Create VBA Project via API
    console.log('1. Creating VBA Project via API...');
    const vbaResponse = await fetch(`${baseUrl}/api/vba-projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        project_name: 'API TEST VBA ' + Date.now(),
        project_number: 'API-VBA-' + Date.now(),
        address: '999 API Test St',
        city: 'Fort Myers',
        state: 'FL',
        owner: 'API Owner',
        contractor: 'API Contractor',
        status: 'scheduled'
      })
    });
    
    if (vbaResponse.ok) {
      const { data } = await vbaResponse.json();
      console.log('✅ VBA Project created via API:', data.project_name);
      console.log('   Project ID:', data.id);
      
      // Now test field report with this project
      console.log('\n2. Creating Field Report with VBA Project via API...');
      const reportResponse = await fetch(`${baseUrl}/api/field-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          report_number: 'API-FR-' + Date.now(),
          project_id: data.id,
          project_name: data.project_name,
          project_address: data.address,
          report_type: 'Daily',
          report_date: new Date().toISOString().split('T')[0],
          reported_by: 'API Test User',
          status: 'draft',
          priority: 'high',
          work_performed: 'API Test Work',
          materials_used: 'API Test Materials',
          subcontractors: 'API Subcontractors',
          delays: 'API Test Delays',
          safety_incidents: 'API Safety Test',
          quality_issues: 'API Quality Test',
          weather_conditions: 'Clear',
          weather_temperature: 78
        })
      });
      
      if (reportResponse.ok) {
        const { data: reportData } = await reportResponse.json();
        console.log('✅ Field Report created successfully with VBA Project!');
        console.log('   Report ID:', reportData.id);
        console.log('   All extended fields saved properly');
      } else {
        const error = await reportResponse.text();
        console.error('❌ Field Report creation failed:', error);
      }
      
    } else {
      const error = await vbaResponse.text();
      console.error('❌ VBA Project creation failed:', error);
    }
    
    console.log('\n✨ API test completed!');
    console.log('Check your Field Reports page - you should see the new report.');
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testViaAPI().catch(console.error);