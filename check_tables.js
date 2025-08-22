const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  console.log('Please add:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const requiredTables = [
  'profiles',
  'projects', 
  'vba_projects',
  'field_reports',
  'field_report_work_completed',
  'field_report_issues',
  'field_report_safety_observations',
  'field_report_personnel',
  'field_report_photos',
  'documents',
  'inspections',
  'inspection_photos',
  'notification_emails',
  'activity_logs',
  'user_settings'
];

async function checkTables() {
  console.log('Checking Supabase tables...\n');
  console.log('Required tables:', requiredTables.length);
  console.log('=====================================\n');

  const results = {
    exists: [],
    missing: [],
    errors: []
  };

  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0);
      
      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          results.missing.push(table);
          console.log(`❌ ${table}: MISSING`);
        } else {
          results.errors.push({ table, error: error.message });
          console.log(`⚠️  ${table}: ERROR - ${error.message}`);
        }
      } else {
        results.exists.push(table);
        console.log(`✅ ${table}: EXISTS`);
      }
    } catch (err) {
      results.errors.push({ table, error: err.message });
      console.log(`⚠️  ${table}: ERROR - ${err.message}`);
    }
  }

  console.log('\n=====================================');
  console.log('Summary:');
  console.log(`✅ Existing tables: ${results.exists.length}/${requiredTables.length}`);
  console.log(`❌ Missing tables: ${results.missing.length}/${requiredTables.length}`);
  console.log(`⚠️  Errors: ${results.errors.length}`);

  if (results.missing.length > 0) {
    console.log('\nMissing tables:');
    results.missing.forEach(t => console.log(`  - ${t}`));
    console.log('\nTo create missing tables, run the migration script:');
    console.log('supabase/migrations/20240821_verify_tables.sql');
  }

  if (results.errors.length > 0) {
    console.log('\nTables with errors (may need RLS policies):');
    results.errors.forEach(({ table, error }) => {
      console.log(`  - ${table}: ${error}`);
    });
  }
}

checkTables().catch(console.error);