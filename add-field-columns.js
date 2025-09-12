const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addMissingColumns() {
  console.log('Note: Supabase JS client cannot execute ALTER TABLE directly.');
  console.log('Please run the following SQL in your Supabase SQL Editor:\n');
  console.log('----------------------------------------');
  console.log(`ALTER TABLE field_reports 
ADD COLUMN IF NOT EXISTS materials_used TEXT,
ADD COLUMN IF NOT EXISTS subcontractors TEXT,
ADD COLUMN IF NOT EXISTS delays TEXT,
ADD COLUMN IF NOT EXISTS safety_incidents TEXT,
ADD COLUMN IF NOT EXISTS quality_issues TEXT,
ADD COLUMN IF NOT EXISTS weather_conditions TEXT,
ADD COLUMN IF NOT EXISTS weather_temperature INTEGER;`);
  console.log('----------------------------------------\n');
  console.log('To access the SQL Editor:');
  console.log('1. Go to https://supabase.com/dashboard/project/rxkakjowitqnbbjezedu/sql/new');
  console.log('2. Paste the SQL above');
  console.log('3. Click "Run" button');
  console.log('\nOnce done, the field report form will work with all fields.');
}

addMissingColumns().catch(console.error);