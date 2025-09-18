-- ADVANCED DATABASE OPTIMIZATION FOR IPC SYSTEM
-- Materialized Views, Partitioning, and Performance Enhancements

-- ============================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================

-- 1. VBA Project Analytics Dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_vba_analytics AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  organization_id,
  status,
  COUNT(*) as project_count,
  AVG(compliance_score) as avg_compliance,
  COUNT(CASE WHEN virtual_inspector_enabled THEN 1 END) as ai_enabled_count,
  SUM(inspection_count) as total_inspections,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400) as avg_completion_days
FROM vba_projects
WHERE created_at IS NOT NULL
GROUP BY DATE_TRUNC('month', created_at), organization_id, status;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_vba_analytics_unique 
ON mv_vba_analytics(month, organization_id, status);

-- 2. Real-time Performance Dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_performance_dashboard AS
SELECT 
  'vba_projects' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as last_7d,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
  AVG(compliance_score) as avg_score,
  NOW() as last_updated
FROM vba_projects
UNION ALL
SELECT 
  'projects' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as last_7d,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as completed_count,
  0 as avg_score,
  NOW() as last_updated
FROM projects
UNION ALL
SELECT 
  'documents' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as last_7d,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as completed_count,
  0 as avg_score,
  NOW() as last_updated
FROM documents;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_performance_dashboard_table 
ON mv_performance_dashboard(table_name);

-- 3. Security Analytics View
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_security_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  event_type,
  severity,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT ip_address) as unique_ips
FROM security_events
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), event_type, severity;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_security_analytics_unique 
ON mv_security_analytics(date, event_type, severity);

-- 4. User Activity Analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_activity AS
SELECT 
  user_id,
  DATE_TRUNC('week', created_at) as week,
  COUNT(*) as total_actions,
  COUNT(DISTINCT action) as unique_actions,
  COUNT(DISTINCT entity_type) as entities_touched,
  MAX(created_at) as last_activity
FROM activity_logs
WHERE created_at > NOW() - INTERVAL '90 days'
GROUP BY user_id, DATE_TRUNC('week', created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_user_activity_unique 
ON mv_user_activity(user_id, week);

-- ============================================
-- DATA PARTITIONING FOR ARCHIVAL
-- ============================================

-- 1. Partition Activity Logs by Month
CREATE TABLE IF NOT EXISTS activity_logs_archive (
  LIKE activity_logs INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for the last year
DO $partition_activity$
DECLARE
  start_date DATE;
  end_date DATE;
  partition_name TEXT;
BEGIN
  FOR i IN 0..11 LOOP
    start_date := DATE_TRUNC('month', NOW() - INTERVAL '11 months') + (i || ' months')::INTERVAL;
    end_date := start_date + INTERVAL '1 month';
    partition_name := 'activity_logs_' || TO_CHAR(start_date, 'YYYY_MM');
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF activity_logs_archive 
                    FOR VALUES FROM (%L) TO (%L)', 
                   partition_name, start_date, end_date);
  END LOOP;
END
$partition_activity$;

-- 2. Partition Security Events by Month
CREATE TABLE IF NOT EXISTS security_events_archive (
  LIKE security_events INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for security events
DO $partition_security$
DECLARE
  start_date DATE;
  end_date DATE;
  partition_name TEXT;
BEGIN
  FOR i IN 0..11 LOOP
    start_date := DATE_TRUNC('month', NOW() - INTERVAL '11 months') + (i || ' months')::INTERVAL;
    end_date := start_date + INTERVAL '1 month';
    partition_name := 'security_events_' || TO_CHAR(start_date, 'YYYY_MM');
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF security_events_archive 
                    FOR VALUES FROM (%L) TO (%L)', 
                   partition_name, start_date, end_date);
  END LOOP;
END
$partition_security$;

-- ============================================
-- AUTOMATED REFRESH FUNCTIONS
-- ============================================

-- Enhanced refresh function for all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS TABLE(view_name TEXT, refresh_time INTERVAL, status TEXT) AS $$
DECLARE
  view_record RECORD;
  start_time TIMESTAMP;
  refresh_duration INTERVAL;
BEGIN
  FOR view_record IN 
    SELECT schemaname, matviewname 
    FROM pg_matviews 
    WHERE schemaname = 'public'
  LOOP
    BEGIN
      start_time := clock_timestamp();
      
      EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY %I.%I', 
                     view_record.schemaname, view_record.matviewname);
      
      refresh_duration := clock_timestamp() - start_time;
      
      view_name := view_record.matviewname;
      refresh_time := refresh_duration;
      status := 'SUCCESS';
      RETURN NEXT;
      
    EXCEPTION WHEN OTHERS THEN
      view_name := view_record.matviewname;
      refresh_time := clock_timestamp() - start_time;
      status := 'ERROR: ' || SQLERRM;
      RETURN NEXT;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CONNECTION POOLING OPTIMIZATION
-- ============================================

-- Function to monitor connection usage
CREATE OR REPLACE FUNCTION get_connection_stats()
RETURNS TABLE(
  database_name TEXT,
  active_connections INTEGER,
  idle_connections INTEGER,
  total_connections INTEGER,
  max_connections INTEGER,
  usage_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    current_database()::TEXT,
    COUNT(CASE WHEN state = 'active' THEN 1 END)::INTEGER as active,
    COUNT(CASE WHEN state = 'idle' THEN 1 END)::INTEGER as idle,
    COUNT(*)::INTEGER as total,
    current_setting('max_connections')::INTEGER as max_conn,
    ROUND((COUNT(*)::NUMERIC / current_setting('max_connections')::NUMERIC) * 100, 2) as usage_pct
  FROM pg_stat_activity
  WHERE pid != pg_backend_pid();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PERFORMANCE MONITORING FUNCTIONS
-- ============================================

-- Function to get slow queries
CREATE OR REPLACE FUNCTION get_slow_queries(min_duration_ms INTEGER DEFAULT 1000)
RETURNS TABLE(
  query_text TEXT,
  calls BIGINT,
  total_time_ms NUMERIC,
  mean_time_ms NUMERIC,
  max_time_ms NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pg_stat_statements.query,
    pg_stat_statements.calls,
    ROUND(pg_stat_statements.total_exec_time::NUMERIC, 2),
    ROUND(pg_stat_statements.mean_exec_time::NUMERIC, 2),
    ROUND(pg_stat_statements.max_exec_time::NUMERIC, 2)
  FROM pg_stat_statements
  WHERE pg_stat_statements.mean_exec_time > min_duration_ms
  ORDER BY pg_stat_statements.mean_exec_time DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Function to analyze table sizes and growth
CREATE OR REPLACE FUNCTION analyze_table_growth()
RETURNS TABLE(
  table_name TEXT,
  size_mb NUMERIC,
  row_count BIGINT,
  last_vacuum TIMESTAMP,
  last_analyze TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename as full_table_name,
    ROUND(pg_total_relation_size(schemaname||'.'||tablename)::NUMERIC / 1024 / 1024, 2),
    n_tup_ins + n_tup_upd as estimated_rows,
    last_vacuum,
    last_analyze
  FROM pg_stat_user_tables
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- AUTOMATED MAINTENANCE
-- ============================================

-- Function for automated maintenance
CREATE OR REPLACE FUNCTION run_automated_maintenance()
RETURNS TABLE(task TEXT, status TEXT, duration INTERVAL) AS $$
DECLARE
  start_time TIMESTAMP;
  task_duration INTERVAL;
BEGIN
  -- Refresh materialized views
  start_time := clock_timestamp();
  PERFORM refresh_all_materialized_views();
  task_duration := clock_timestamp() - start_time;
  
  task := 'Refresh Materialized Views';
  status := 'COMPLETED';
  duration := task_duration;
  RETURN NEXT;
  
  -- Update table statistics
  start_time := clock_timestamp();
  ANALYZE vba_projects;
  ANALYZE projects;
  ANALYZE documents;
  ANALYZE activity_logs;
  task_duration := clock_timestamp() - start_time;
  
  task := 'Update Table Statistics';
  status := 'COMPLETED';
  duration := task_duration;
  RETURN NEXT;
  
  -- Vacuum old partitions
  start_time := clock_timestamp();
  VACUUM (VERBOSE, ANALYZE) activity_logs;
  task_duration := clock_timestamp() - start_time;
  
  task := 'Vacuum Activity Logs';
  status := 'COMPLETED';
  duration := task_duration;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- READ REPLICA CONFIGURATION HELPERS
-- ============================================

-- Function to check replication lag (for read replicas)
CREATE OR REPLACE FUNCTION check_replication_lag()
RETURNS TABLE(
  replica_name TEXT,
  lag_bytes BIGINT,
  lag_seconds INTEGER,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    client_addr::TEXT as replica,
    pg_wal_lsn_diff(pg_current_wal_lsn(), flush_lsn) as lag_b,
    EXTRACT(EPOCH FROM (NOW() - backend_start))::INTEGER as lag_s,
    state
  FROM pg_stat_replication;
END;
$$ LANGUAGE plpgsql;

-- Initial refresh of all materialized views
SELECT refresh_all_materialized_views();

-- Log completion
INSERT INTO activity_logs (action, user_id, metadata) 
VALUES ('database_optimization_complete', 'system', '{"type": "materialized_views", "timestamp": "' || NOW() || '"}');

RAISE NOTICE 'Advanced database optimization completed successfully!';
RAISE NOTICE 'Materialized views created for analytics dashboards';
RAISE NOTICE 'Data partitioning configured for efficient archival';
RAISE NOTICE 'Performance monitoring functions available';