const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkVBAProjects() {
  console.log('Checking VBA projects in database...\n');
  
  // Check vba_projects table
  const { data: vbaProjects, error: vbaError, count } = await supabase
    .from('vba_projects')
    .select('*', { count: 'exact' });
  
  if (vbaError) {
    console.error('Error fetching VBA projects:', vbaError);
  } else {
    console.log(`Found ${count || 0} VBA projects`);
    if (vbaProjects && vbaProjects.length > 0) {
      console.log('\nVBA Projects:');
      vbaProjects.forEach(p => {
        console.log(`- ${p.project_name} (${p.permit_number}) - Status: ${p.status}`);
      });
    }
  }
  
  // Also check if there's any data with RLS bypassed
  const { data: allData, error: allError } = await supabase
    .from('vba_projects')
    .select('id, project_name, permit_number, created_at')
    .limit(5);
    
  if (!allError && allData) {
    console.log('\nRaw data check (first 5 records):');
    console.log(JSON.stringify(allData, null, 2));
  }
}

checkVBAProjects().catch(console.error);