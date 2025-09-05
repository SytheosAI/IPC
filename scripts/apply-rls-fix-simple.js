const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Get Supabase credentials
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Clean URL
supabaseUrl = supabaseUrl
  .replace(/https:\/\/https:\/\//g, 'https://')
  .replace(/https:\/\/https\/\//g, 'https://')
  .replace(/https\/\//g, 'https://');

if (!supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}`;
}

console.log('Using Supabase URL:', supabaseUrl);

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applySimpleRLSFix() {
  console.log('=== Applying Simple VBA RLS Fix ===\n');
  
  try {
    // Step 1: Check current table status
    console.log('Step 1: Checking vba_projects table...');
    const { data: projects, error: checkError } = await supabase
      .from('vba_projects')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Error accessing vba_projects:', checkError.message);
    } else {
      console.log('✓ Table accessible via service role');
    }
    
    // Step 2: Test authenticated user creation
    console.log('\nStep 2: Testing project creation with service role...');
    
    const testProject = {
      project_name: `Service Role Test ${Date.now()}`,
      address: '456 Admin Street',
      status: 'scheduled',
      project_number: `SVC-${Date.now()}`,
      created_by: null  // Service role doesn't have a user ID
    };
    
    const { data: created, error: createError } = await supabase
      .from('vba_projects')
      .insert(testProject)
      .select()
      .single();
    
    if (createError) {
      console.error('✗ Failed to create project:', createError.message);
      console.error('Error code:', createError.code);
      console.error('Error details:', createError.details);
    } else {
      console.log('✓ Successfully created project:', created.project_name);
      console.log('  Project ID:', created.id);
      
      // Clean up
      const { error: deleteError } = await supabase
        .from('vba_projects')
        .delete()
        .eq('id', created.id);
      
      if (deleteError) {
        console.error('Could not clean up test project:', deleteError.message);
      } else {
        console.log('✓ Cleaned up test project');
      }
    }
    
    // Step 3: Provide SQL commands for manual execution
    console.log('\n=== Manual SQL Fix ===');
    console.log('If the app still has issues, run these SQL commands in Supabase SQL Editor:\n');
    
    const sqlCommands = `
-- 1. Enable RLS on the table
ALTER TABLE vba_projects ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies
DROP POLICY IF EXISTS "vba_projects_select" ON vba_projects;
DROP POLICY IF EXISTS "vba_projects_insert" ON vba_projects;
DROP POLICY IF EXISTS "vba_projects_update" ON vba_projects;
DROP POLICY IF EXISTS "vba_projects_delete" ON vba_projects;

-- 3. Create simple permissive policies for authenticated users
CREATE POLICY "vba_projects_select"
ON vba_projects FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "vba_projects_insert"
ON vba_projects FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "vba_projects_update"
ON vba_projects FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "vba_projects_delete"
ON vba_projects FOR DELETE
TO authenticated
USING (true);

-- 4. Test the policies
SELECT * FROM vba_projects LIMIT 1;
    `;
    
    console.log(sqlCommands);
    
    console.log('\n=== Instructions ===');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the SQL commands above');
    console.log('4. Execute the commands');
    console.log('5. Test creating a VBA project through the app');
    
    console.log('\n=== Alternative: Disable RLS Temporarily ===');
    console.log('If you need to disable RLS for testing:');
    console.log('ALTER TABLE vba_projects DISABLE ROW LEVEL SECURITY;');
    console.log('\nRemember to re-enable it later with proper policies!');
    
  } catch (error) {
    console.error('\nUnexpected error:', error);
  }
}

// Run the simple fix
applySimpleRLSFix().catch(console.error);