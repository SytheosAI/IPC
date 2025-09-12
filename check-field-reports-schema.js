const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFieldReportsSchema() {
  console.log('Checking field_reports table schema...\n');
  
  // Try to insert a minimal record to see what columns exist
  const testData = {
    report_number: 'TEST-' + Date.now(),
    project_name: 'Test Project',
    report_date: new Date().toISOString().split('T')[0],
    organization_id: '11111111-1111-1111-1111-111111111111'
  };
  
  const { data, error } = await supabase
    .from('field_reports')
    .insert([testData])
    .select()
    .single();
  
  if (error) {
    console.log('Error inserting test record:', error.message);
    console.log('Error hint:', error.hint);
    console.log('Error details:', error.details);
  } else {
    console.log('Successfully inserted test record!');
    console.log('Record structure:', JSON.stringify(data, null, 2));
    
    // Delete the test record
    await supabase
      .from('field_reports')
      .delete()
      .eq('id', data.id);
    console.log('Test record deleted.');
  }
  
  // Try to get an existing record to see the structure
  const { data: existingRecords, error: fetchError } = await supabase
    .from('field_reports')
    .select('*')
    .limit(1);
  
  if (!fetchError && existingRecords && existingRecords.length > 0) {
    console.log('\nExample existing record structure:');
    console.log('Columns:', Object.keys(existingRecords[0]));
  }
}

checkFieldReportsSchema().catch(console.error);