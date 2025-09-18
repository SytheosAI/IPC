#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function runDatabaseOptimization() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL');
    console.error('   SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('🚀 Starting database optimization...');
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });

  try {
    // Read the SQL optimization file
    const sqlFile = path.join(__dirname, '..', 'DATABASE-PERFORMANCE-OPTIMIZATION.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    console.log('📂 Loaded optimization SQL file');

    // Split SQL into individual statements (basic approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => 
        stmt.length > 0 && 
        !stmt.startsWith('--') && 
        !stmt.match(/^\s*$/)
      );

    console.log(`📊 Found ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim().length === 0) {
        skipCount++;
        continue;
      }

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        });

        if (error) {
          // Some errors are expected (like IF NOT EXISTS conflicts)
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist')) {
            console.log(`⚠️  Skipped (${error.message.substring(0, 50)}...)`);
            skipCount++;
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Exception in statement ${i + 1}:`, err.message);
      }
    }

    console.log('\n🎉 Database optimization completed!');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`⚠️  Skipped: ${skipCount}`);
    console.log(`❌ Failed: ${statements.length - successCount - skipCount}`);

    // Test the optimizations
    console.log('\n🔍 Testing optimizations...');
    
    const { data: indexData } = await supabase
      .from('pg_stat_user_indexes')
      .select('indexname, idx_scan')
      .limit(5);

    if (indexData && indexData.length > 0) {
      console.log('📈 Index usage statistics:');
      indexData.forEach(idx => {
        console.log(`   ${idx.indexname}: ${idx.idx_scan} scans`);
      });
    }

  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    process.exit(1);
  }
}

// Alternative simpler approach - just run individual optimizations
async function runBasicOptimizations() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log('🔧 Running basic optimizations...');

  // Critical indexes only
  const indexes = [
    {
      name: 'VBA Projects Status Index',
      sql: `CREATE INDEX IF NOT EXISTS idx_vba_projects_status_date ON vba_projects(status, start_date DESC);`
    },
    {
      name: 'VBA Projects Organization Index', 
      sql: `CREATE INDEX IF NOT EXISTS idx_vba_projects_org_status ON vba_projects(organization_id, status);`
    },
    {
      name: 'Projects Status Index',
      sql: `CREATE INDEX IF NOT EXISTS idx_projects_status_updated ON projects(status, updated_at DESC);`
    },
    {
      name: 'VBA Projects Search Index',
      sql: `CREATE INDEX IF NOT EXISTS idx_vba_projects_search ON vba_projects USING gin(to_tsvector('english', COALESCE(project_name, '') || ' ' || COALESCE(address, '')));`
    }
  ];

  for (const index of indexes) {
    try {
      console.log(`⏳ Creating ${index.name}...`);
      const { error } = await supabase.rpc('exec_sql', { sql_query: index.sql });
      
      if (error && !error.message.includes('already exists')) {
        console.error(`❌ Failed to create ${index.name}:`, error.message);
      } else {
        console.log(`✅ ${index.name} created successfully`);
      }
    } catch (err) {
      console.error(`❌ Error creating ${index.name}:`, err.message);
    }
  }

  console.log('🎉 Basic optimizations completed!');
}

// Run the optimization
if (require.main === module) {
  runBasicOptimizations()
    .then(() => {
      console.log('✅ All done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { runDatabaseOptimization, runBasicOptimizations };