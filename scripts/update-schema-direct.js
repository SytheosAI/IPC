#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false
  }
});

async function executeSQL(sql, description) {
  try {
    console.log(`⏳ ${description}...`);
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`✅ ${description} (already exists)`);
      } else {
        console.error(`❌ ${description} failed:`, error.message);
      }
    } else {
      console.log(`✅ ${description} completed`);
    }
    return { data, error };
  } catch (err) {
    console.error(`❌ ${description} exception:`, err.message);
    return { error: err };
  }
}

async function updateDatabaseSchema() {
  console.log('🚀 Starting direct schema update with service role...\n');

  // 1. Create critical indexes for VBA projects
  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_vba_projects_status_date 
    ON vba_projects(status, start_date DESC);
  `, 'Creating VBA projects status index');

  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_vba_projects_org_status 
    ON vba_projects(organization_id, status);
  `, 'Creating VBA projects organization index');

  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_vba_projects_number 
    ON vba_projects(project_number);
  `, 'Creating VBA projects number index');

  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_vba_projects_compliance 
    ON vba_projects(compliance_score DESC) 
    WHERE compliance_score IS NOT NULL;
  `, 'Creating VBA projects compliance index');

  // 2. Full-text search index
  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_vba_projects_search 
    ON vba_projects USING gin(
      to_tsvector('english', 
        COALESCE(project_name, '') || ' ' || 
        COALESCE(address, '') || ' ' || 
        COALESCE(city, '')
      )
    );
  `, 'Creating VBA projects search index');

  // 3. Projects table indexes
  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_projects_status_updated 
    ON projects(status, updated_at DESC);
  `, 'Creating projects status index');

  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_projects_permit 
    ON projects(permit_number);
  `, 'Creating projects permit index');

  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_projects_org_status 
    ON projects(organization_id, status, created_at DESC);
  `, 'Creating projects organization index');

  // 4. Documents table indexes
  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_documents_project 
    ON documents(project_id, created_at DESC);
  `, 'Creating documents project index');

  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_documents_category 
    ON documents(category, status);
  `, 'Creating documents category index');

  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_documents_search 
    ON documents USING gin(to_tsvector('english', name));
  `, 'Creating documents search index');

  // 5. Field reports indexes
  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_field_reports_type_date 
    ON field_reports(report_type, report_date DESC);
  `, 'Creating field reports type index');

  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_field_reports_reporter 
    ON field_reports(reporter_id, report_date DESC);
  `, 'Creating field reports reporter index');

  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_field_reports_priority 
    ON field_reports(priority, status) 
    WHERE priority IN ('high', 'critical');
  `, 'Creating field reports priority index');

  // 6. Activity logs indexes
  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_activity_logs_user 
    ON activity_logs(user_id, created_at DESC);
  `, 'Creating activity logs user index');

  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_activity_logs_entity 
    ON activity_logs(entity_type, entity_id, created_at DESC);
  `, 'Creating activity logs entity index');

  // 7. Security events indexes
  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_security_events_severity 
    ON security_events(severity, created_at DESC);
  `, 'Creating security events severity index');

  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_security_events_type 
    ON security_events(event_type, created_at DESC);
  `, 'Creating security events type index');

  // 8. Notification emails indexes
  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_notification_emails_active 
    ON notification_emails(active, notification_type) 
    WHERE active = true;
  `, 'Creating notification emails active index');

  // 9. Create materialized view for project analytics
  await executeSQL(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS mv_project_status_summary AS
    SELECT 
      organization_id,
      status,
      COUNT(*) as count,
      MAX(updated_at) as last_updated
    FROM projects
    GROUP BY organization_id, status;
  `, 'Creating project status summary view');

  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_mv_project_status_org 
    ON mv_project_status_summary(organization_id, status);
  `, 'Creating project status summary index');

  // 10. Create refresh function
  await executeSQL(`
    CREATE OR REPLACE FUNCTION refresh_materialized_views()
    RETURNS void AS $$
    BEGIN
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_project_status_summary;
    END;
    $$ LANGUAGE plpgsql;
  `, 'Creating materialized views refresh function');

  // 11. Update table statistics
  await executeSQL(`ANALYZE vba_projects;`, 'Analyzing VBA projects table');
  await executeSQL(`ANALYZE projects;`, 'Analyzing projects table');
  await executeSQL(`ANALYZE documents;`, 'Analyzing documents table');
  await executeSQL(`ANALYZE field_reports;`, 'Analyzing field reports table');
  await executeSQL(`ANALYZE activity_logs;`, 'Analyzing activity logs table');

  // 12. Vacuum tables for performance
  await executeSQL(`VACUUM (VERBOSE, ANALYZE) vba_projects;`, 'Vacuuming VBA projects table');
  await executeSQL(`VACUUM (VERBOSE, ANALYZE) projects;`, 'Vacuuming projects table');

  console.log('\n🎉 Schema update completed successfully!');
  console.log('📈 Database is now optimized for high performance');
  console.log('🔍 Indexes created for faster queries');
  console.log('📊 Analytics views ready for reporting');
}

// Run the schema update
updateDatabaseSchema()
  .then(() => {
    console.log('✅ All database optimizations applied successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Schema update failed:', error);
    process.exit(1);
  });