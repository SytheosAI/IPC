-- =========================================
-- DATABASE OPTIMIZATION SQL COMMANDS
-- =========================================
-- These commands need to be executed manually in Supabase SQL Editor
-- Go to: https://app.supabase.com/project/rxkakjowitqnbbjezedu/sql
-- Copy and paste each section as needed

-- =========================================
-- 1. MATERIALIZED VIEWS FOR ANALYTICS
-- =========================================

-- VBA Analytics View
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_vba_analytics AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  organization_id,
  status,
  COUNT(*) as project_count,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400)::INT as avg_duration_days,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
  SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count
FROM vba_projects
GROUP BY DATE_TRUNC('month', created_at), organization_id, status
WITH DATA;

-- Create index for faster queries
CREATE INDEX idx_mv_vba_analytics_month ON mv_vba_analytics(month);
CREATE INDEX idx_mv_vba_analytics_org ON mv_vba_analytics(organization_id);

-- Project Performance View
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_project_performance AS
SELECT 
  p.id,
  p.project_name as name,
  p.status,
  p.project_type,
  p.category,
  COUNT(DISTINCT i.id) as inspection_count,
  AVG(CASE WHEN i.status = 'passed' THEN 1 ELSE 0 END) * 100 as pass_rate,
  MAX(i.scheduled_date) as last_inspection_date,
  EXTRACT(EPOCH FROM (NOW() - p.created_at))/86400 as project_age_days
FROM projects p
LEFT JOIN inspections i ON p.id = i.project_id
GROUP BY p.id, p.project_name, p.status, p.project_type, p.category
WITH DATA;

-- Create indexes
CREATE INDEX idx_mv_project_perf_status ON mv_project_performance(status);
CREATE INDEX idx_mv_project_perf_type ON mv_project_performance(project_type);

-- User Activity Summary View
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_activity_summary AS
SELECT 
  user_id,
  DATE_TRUNC('day', created_at) as activity_date,
  COUNT(*) as action_count,
  COUNT(DISTINCT action) as unique_actions,
  COUNT(DISTINCT entity_id) as entities_accessed,
  MAX(created_at) as last_activity
FROM activity_logs
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY user_id, DATE_TRUNC('day', created_at)
WITH DATA;

-- Create indexes
CREATE INDEX idx_mv_user_activity_user ON mv_user_activity_summary(user_id);
CREATE INDEX idx_mv_user_activity_date ON mv_user_activity_summary(activity_date);

-- =========================================
-- 2. REFRESH MATERIALIZED VIEWS FUNCTION
-- =========================================

CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  -- Refresh all materialized views
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_vba_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_project_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_activity_summary;
  
  -- Log the refresh
  INSERT INTO activity_logs (user_id, action, entity_type, metadata)
  VALUES ('system', 'refresh_materialized_views', 'system', 
    jsonb_build_object(
      'timestamp', NOW(),
      'views_refreshed', ARRAY['mv_vba_analytics', 'mv_project_performance', 'mv_user_activity_summary']
    )
  );
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- 3. AUTOMATED REFRESH SCHEDULE
-- =========================================

-- Create a scheduled job to refresh views daily at 2 AM
-- Note: This requires pg_cron extension which may need to be enabled in Supabase
-- Go to Database > Extensions and enable pg_cron if not already enabled

-- First enable the extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the refresh job
SELECT cron.schedule(
  'refresh-materialized-views',
  '0 2 * * *', -- Daily at 2 AM
  'SELECT refresh_materialized_views();'
);

-- =========================================
-- 4. DATA PARTITIONING FOR ACTIVITY LOGS
-- =========================================

-- Create partitioned table for activity logs (for better performance)
-- Note: We need to manually define the structure because LIKE INCLUDING ALL 
-- conflicts with partitioning requirements
CREATE TABLE IF NOT EXISTS activity_logs_partitioned (
  id UUID DEFAULT gen_random_uuid(),
  user_id VARCHAR(255),
  action VARCHAR(255),
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Composite primary key includes partition key
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create indexes on partitioned table
CREATE INDEX IF NOT EXISTS idx_activity_logs_part_user ON activity_logs_partitioned(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_part_action ON activity_logs_partitioned(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_part_entity ON activity_logs_partitioned(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_part_created ON activity_logs_partitioned(created_at DESC);

-- Create monthly partitions for the last 6 months
CREATE TABLE IF NOT EXISTS activity_logs_y2024m07 
  PARTITION OF activity_logs_partitioned 
  FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');

CREATE TABLE IF NOT EXISTS activity_logs_y2024m08 
  PARTITION OF activity_logs_partitioned 
  FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');

CREATE TABLE IF NOT EXISTS activity_logs_y2024m09 
  PARTITION OF activity_logs_partitioned 
  FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');

CREATE TABLE IF NOT EXISTS activity_logs_y2024m10 
  PARTITION OF activity_logs_partitioned 
  FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');

CREATE TABLE IF NOT EXISTS activity_logs_y2024m11 
  PARTITION OF activity_logs_partitioned 
  FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');

CREATE TABLE IF NOT EXISTS activity_logs_y2024m12 
  PARTITION OF activity_logs_partitioned 
  FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

CREATE TABLE IF NOT EXISTS activity_logs_y2025m01 
  PARTITION OF activity_logs_partitioned 
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Create function to automatically create new partitions
CREATE OR REPLACE FUNCTION create_monthly_partitions()
RETURNS void AS $$
DECLARE
  partition_name TEXT;
  start_date DATE;
  end_date DATE;
BEGIN
  -- Create partition for next month if it doesn't exist
  start_date := DATE_TRUNC('month', NOW() + INTERVAL '1 month');
  end_date := start_date + INTERVAL '1 month';
  partition_name := 'activity_logs_y' || TO_CHAR(start_date, 'YYYY') || 'm' || TO_CHAR(start_date, 'MM');
  
  -- Check if partition exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = partition_name
  ) THEN
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF activity_logs_partitioned FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Schedule monthly partition creation
SELECT cron.schedule(
  'create-monthly-partitions',
  '0 0 1 * *', -- First day of each month
  'SELECT create_monthly_partitions();'
);

-- =========================================
-- 4.1 MIGRATE EXISTING DATA TO PARTITIONED TABLE (OPTIONAL)
-- =========================================
-- Only run this if you want to migrate existing activity logs to the partitioned table
-- WARNING: This may take time for large datasets

-- Step 1: Copy existing data to partitioned table
/*
INSERT INTO activity_logs_partitioned (id, user_id, action, entity_type, entity_id, metadata, created_at)
SELECT id, user_id, action, entity_type, entity_id, metadata, created_at
FROM activity_logs
ON CONFLICT (id, created_at) DO NOTHING;
*/

-- Step 2: Rename tables to switch to partitioned version
/*
ALTER TABLE activity_logs RENAME TO activity_logs_old;
ALTER TABLE activity_logs_partitioned RENAME TO activity_logs;
*/

-- Step 3: Create view for backward compatibility (if needed)
/*
CREATE OR REPLACE VIEW activity_logs_view AS
SELECT id, user_id, action, entity_type, entity_id, metadata, created_at
FROM activity_logs
UNION ALL
SELECT id, user_id, action, entity_type, entity_id, metadata, created_at
FROM activity_logs_old
WHERE created_at < '2024-07-01';
*/

-- =========================================
-- 5. CONNECTION POOLING CONFIGURATION
-- =========================================

-- Note: Connection pooling is configured at the Supabase project level
-- Go to Settings > Database to configure:
-- - Pool Size: 25 (recommended for production)
-- - Pool Mode: Transaction
-- - Statement Timeout: 60s
-- - Idle Timeout: 300s

-- =========================================
-- 6. PERFORMANCE INDEXES
-- =========================================

-- Add missing indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vba_projects_status ON vba_projects(status);
CREATE INDEX IF NOT EXISTS idx_vba_projects_org_id ON vba_projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_vba_projects_created ON vba_projects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inspections_project ON inspections(project_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_scheduled ON inspections(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- =========================================
-- 7. VACUUM AND ANALYZE
-- =========================================

-- IMPORTANT: Run these commands SEPARATELY, one at a time
-- VACUUM cannot run inside a transaction block
-- Copy and execute each line individually in the SQL Editor

-- Run VACUUM to reclaim storage and update statistics (EXECUTE SEPARATELY):
-- VACUUM ANALYZE vba_projects;
-- VACUUM ANALYZE projects;
-- VACUUM ANALYZE inspections;
-- VACUUM ANALYZE activity_logs;
-- VACUUM ANALYZE profiles;

-- Alternative: Just run ANALYZE (can run in transaction):
ANALYZE vba_projects;
ANALYZE projects;
ANALYZE inspections;
ANALYZE activity_logs;
ANALYZE profiles;

-- =========================================
-- 8. QUERY PERFORMANCE MONITORING
-- =========================================

-- Enable query performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slow queries (queries taking more than 100ms)
-- Run this query periodically to identify performance issues:
/*
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time,
  stddev_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;
*/

-- =========================================
-- EXECUTION INSTRUCTIONS
-- =========================================
-- 1. Copy each section above
-- 2. Go to https://app.supabase.com/project/rxkakjowitqnbbjezedu/sql
-- 3. Paste and execute each section
-- 4. Monitor the results in the Supabase dashboard
-- 5. The materialized views will significantly improve query performance
-- 6. Partitioning will help with large table management
-- 7. Indexes will speed up common queries

-- Log completion
INSERT INTO activity_logs (user_id, action, entity_type, metadata)
VALUES ('system', 'database_optimization_manual', 'database', 
  jsonb_build_object(
    'timestamp', NOW(),
    'optimizations', ARRAY[
      'materialized_views_created',
      'partitioning_configured', 
      'indexes_added',
      'vacuum_analyzed',
      'pooling_configured'
    ]
  )
);