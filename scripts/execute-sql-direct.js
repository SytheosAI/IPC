#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = 'https://rxkakjowitqnbbjezedu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a2Fram93aXRxbmJiamV6ZWR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDI1MzU1OCwiZXhwIjoyMDY5ODI5NTU4fQ.RugCai5lmT3_eIU55G7XzlqdQDy6dZLk-5JtXeIJmeA';

async function executeSQL() {
  console.log('🚀 Connecting to Supabase with service role...');
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  // Individual SQL statements to execute
  const statements = [
    {
      name: 'VBA Projects Status Index',
      sql: `CREATE INDEX IF NOT EXISTS idx_vba_projects_status_date ON vba_projects(status, start_date DESC);`
    },
    {
      name: 'VBA Projects Organization Index',
      sql: `CREATE INDEX IF NOT EXISTS idx_vba_projects_org_status ON vba_projects(organization_id, status);`
    },
    {
      name: 'VBA Projects Number Index',
      sql: `CREATE INDEX IF NOT EXISTS idx_vba_projects_number ON vba_projects(project_number);`
    },
    {
      name: 'VBA Projects Search Index',
      sql: `CREATE INDEX IF NOT EXISTS idx_vba_projects_search ON vba_projects USING gin(to_tsvector('english', COALESCE(project_name, '') || ' ' || COALESCE(address, '')));`
    },
    {
      name: 'Projects Status Index',
      sql: `CREATE INDEX IF NOT EXISTS idx_projects_status_updated ON projects(status, updated_at DESC);`
    },
    {
      name: 'Projects Permit Index',
      sql: `CREATE INDEX IF NOT EXISTS idx_projects_permit ON projects(permit_number);`
    }
  ];

  let successCount = 0;
  
  for (const statement of statements) {
    try {
      console.log(`⏳ Creating ${statement.name}...`);
      
      // Use the REST API directly
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: statement.sql })
      });

      if (response.ok) {
        console.log(`✅ ${statement.name} created successfully`);
        successCount++;
      } else {
        const error = await response.text();
        console.log(`❌ ${statement.name} failed: ${error}`);
      }
    } catch (err) {
      console.log(`❌ ${statement.name} error: ${err.message}`);
    }
  }

  console.log(`\n🎉 Completed! ${successCount}/${statements.length} indexes created`);
}

executeSQL().catch(console.error);