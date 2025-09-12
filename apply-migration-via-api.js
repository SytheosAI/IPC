const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function applyMigration() {
  console.log('Applying migration via Supabase REST API...\n');
  
  // First, let's create a test record to force schema refresh
  const testPayload = {
    report_number: 'SCHEMA-TEST-' + Date.now(),
    project_name: 'Schema Test',
    project_address: 'Test Address',
    report_date: new Date().toISOString().split('T')[0],
    organization_id: '11111111-1111-1111-1111-111111111111',
    materials_used: null,
    subcontractors: null,
    delays: null,
    safety_incidents: null,
    quality_issues: null,
    weather_conditions: null,
    weather_temperature: null
  };

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/field_reports`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testPayload)
    });

    const text = await response.text();
    
    if (!response.ok) {
      console.log('Response status:', response.status);
      console.log('Response:', text);
      
      if (text.includes('column')) {
        console.log('\n❌ Columns do not exist in the database.');
        console.log('\nYou need to run the ALTER TABLE command.');
        console.log('\nSince you mentioned it worked in another terminal,');
        console.log('you likely have access to run SQL directly.');
        console.log('\nTry running this in your terminal where it worked before:');
        console.log('\nnpx supabase db push --db-url "postgres://postgres:[YOUR_PASSWORD]@db.rxkakjowitqnbbjezedu.supabase.co:5432/postgres"');
        console.log('\nOr use the Supabase dashboard SQL editor.');
      }
    } else {
      console.log('✅ Migration appears to be working!');
      const data = JSON.parse(text);
      
      // Clean up test record
      if (data && data[0] && data[0].id) {
        await fetch(`${supabaseUrl}/rest/v1/field_reports?id=eq.${data[0].id}`, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          }
        });
        console.log('Test record cleaned up.');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

applyMigration();