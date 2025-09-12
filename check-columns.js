const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumns() {
  console.log('Checking if columns exist in field_reports table...\n');
  
  // Try to insert a record with all fields
  const testData = {
    report_number: 'TEST-' + Date.now(),
    project_name: 'Test Project',
    project_address: 'Test Address',
    report_date: new Date().toISOString().split('T')[0],
    report_type: 'Daily',
    status: 'draft',
    priority: 'medium',
    reported_by: 'Test User',
    organization_id: '11111111-1111-1111-1111-111111111111',
    work_performed: 'Test work',
    materials_used: 'Test materials',
    subcontractors: 'Test subcontractors',
    delays: 'Test delays',
    safety_incidents: 'Test incidents',
    quality_issues: 'Test quality',
    weather_conditions: 'Sunny',
    weather_temperature: 75
  };
  
  const { data, error } = await supabase
    .from('field_reports')
    .insert([testData])
    .select()
    .single();
  
  if (error) {
    console.log('Error inserting test record:');
    console.log('Message:', error.message);
    
    if (error.message.includes('column')) {
      console.log('\n❌ The columns are NOT in the database.');
      console.log('\nThe migration did not apply successfully.');
      console.log('\nPlease run this SQL directly in Supabase dashboard:');
      console.log('https://supabase.com/dashboard/project/rxkakjowitqnbbjezedu/sql/new');
      console.log('\n----------------------------------------');
      console.log(`ALTER TABLE field_reports 
ADD COLUMN IF NOT EXISTS materials_used TEXT,
ADD COLUMN IF NOT EXISTS subcontractors TEXT,
ADD COLUMN IF NOT EXISTS delays TEXT,
ADD COLUMN IF NOT EXISTS safety_incidents TEXT,
ADD COLUMN IF NOT EXISTS quality_issues TEXT,
ADD COLUMN IF NOT EXISTS weather_conditions TEXT,
ADD COLUMN IF NOT EXISTS weather_temperature INTEGER;`);
      console.log('----------------------------------------');
    }
  } else {
    console.log('✅ All columns exist! Test record created successfully.');
    console.log('Cleaning up test record...');
    
    // Delete the test record
    await supabase
      .from('field_reports')
      .delete()
      .eq('id', data.id);
    
    console.log('Test record deleted.');
    console.log('\n✅ Your field reports form should work now!');
  }
}

checkColumns().catch(console.error);