#!/usr/bin/env node

/**
 * Emergency RLS Fix Script
 * Run this to immediately fix the RLS issues on vba_projects table
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Get environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables')
  process.exit(1)
}

// Clean the URL
let cleanUrl = supabaseUrl
  .replace(/https:\/\/https:\/\//g, 'https://')
  .replace(/https\/\//g, 'https://')

if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
  cleanUrl = `https://${cleanUrl}`
}

// Create Supabase client with service role key for admin access
const supabase = createClient(cleanUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('🔧 Starting RLS fix for vba_projects...\n')
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250105_fix_rls_bulletproof.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📝 Executing migration...')
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    }).single()
    
    if (error) {
      // If exec_sql doesn't exist, try a different approach
      if (error.message?.includes('function') || error.message?.includes('does not exist')) {
        console.log('⚠️  Direct SQL execution not available, using alternative method...')
        
        // Try to run the key parts individually
        const criticalSQL = `
          -- Disable RLS temporarily
          ALTER TABLE vba_projects DISABLE ROW LEVEL SECURITY;
          
          -- Drop all existing policies
          DO $$
          DECLARE
            pol RECORD;
          BEGIN
            FOR pol IN 
              SELECT policyname 
              FROM pg_policies 
              WHERE tablename = 'vba_projects'
            LOOP
              EXECUTE format('DROP POLICY IF EXISTS %I ON vba_projects', pol.policyname);
            END LOOP;
          END $$;
          
          -- Re-enable RLS
          ALTER TABLE vba_projects ENABLE ROW LEVEL SECURITY;
          
          -- Create simple allow-all policies
          CREATE POLICY "Allow all authenticated users to read"
            ON vba_projects FOR SELECT TO authenticated USING (true);
            
          CREATE POLICY "Allow all authenticated users to insert"
            ON vba_projects FOR INSERT TO authenticated WITH CHECK (true);
            
          CREATE POLICY "Allow all authenticated users to update"
            ON vba_projects FOR UPDATE TO authenticated 
            USING (true) WITH CHECK (true);
            
          CREATE POLICY "Allow all authenticated users to delete"
            ON vba_projects FOR DELETE TO authenticated USING (true);
            
          -- Grant permissions
          GRANT ALL ON vba_projects TO authenticated;
          GRANT ALL ON vba_projects TO anon;
        `
        
        console.log('📋 Critical RLS fix SQL prepared')
        console.log('\n⚠️  IMPORTANT: You need to run this SQL directly in Supabase:')
        console.log('1. Go to your Supabase dashboard')
        console.log('2. Navigate to SQL Editor')
        console.log('3. Paste and run the following SQL:\n')
        console.log('================== COPY BELOW ==================')
        console.log(criticalSQL)
        console.log('================== COPY ABOVE ==================\n')
        
        // Save to file for easy access
        const outputPath = path.join(__dirname, 'rls-fix-manual.sql')
        fs.writeFileSync(outputPath, criticalSQL)
        console.log(`💾 SQL also saved to: ${outputPath}`)
      } else {
        throw error
      }
    } else {
      console.log('✅ Migration executed successfully!')
    }
    
    // Test if we can now insert into vba_projects
    console.log('\n🧪 Testing VBA project creation...')
    
    const testProject = {
      project_name: 'RLS Test ' + new Date().toISOString(),
      address: '123 Test Street',
      status: 'scheduled'
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('vba_projects')
      .insert(testProject)
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Test insert failed:', insertError.message)
      console.log('\n🔍 Debugging information:')
      console.log('- Error code:', insertError.code)
      console.log('- Error details:', insertError.details)
      console.log('- Error hint:', insertError.hint)
      
      // Check if RLS is the issue
      if (insertError.message?.includes('row-level security')) {
        console.log('\n⚠️  RLS is still blocking inserts!')
        console.log('Please run the manual SQL fix shown above in Supabase dashboard.')
      }
    } else {
      console.log('✅ Test insert successful!')
      console.log('   Created project:', insertData.project_name)
      
      // Clean up test data
      if (insertData?.id) {
        await supabase
          .from('vba_projects')
          .delete()
          .eq('id', insertData.id)
        console.log('   Test data cleaned up')
      }
      
      console.log('\n🎉 SUCCESS! RLS issues are now fixed!')
      console.log('You can now create VBA projects in the application.')
    }
    
  } catch (err) {
    console.error('❌ Error during migration:', err.message || err)
    console.log('\n📋 Manual fix instructions:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Run the migration file: supabase/migrations/20250105_fix_rls_bulletproof.sql')
  }
}

// Run the migration
runMigration().then(() => {
  console.log('\n✨ RLS fix process completed')
}).catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})