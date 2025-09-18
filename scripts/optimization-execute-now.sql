
-- ================================================
-- DATABASE OPTIMIZATION COMMANDS FOR SUPABASE
-- ================================================
-- EXECUTE THESE COMMANDS IN SUPABASE SQL EDITOR
-- https://app.supabase.com/project/rxkakjowitqnbbjezedu/sql/new

-- 1. CREATE MATERIALIZED VIEWS
-- ================================

-- VBA Analytics View
DROP MATERIALIZED VIEW IF EXISTS mv_vba_analytics CASCADE;
CREATE MATERIALIZED VIEW mv_vba_analytics AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  organization_id,
  status,
  COUNT(*) as project_count,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400)::INT as avg_duration_days,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
FROM vba_projects
GROUP BY DATE_TRUNC('month', created_at), organization_id, status;

-- Project Performance View  
DROP MATERIALIZED VIEW IF EXISTS mv_project_performance CASCADE;
CREATE MATERIALIZED VIEW mv_project_performance AS
SELECT 
  p.id,
  COALESCE(p.project_name, p.name) as name,
  p.status,
  p.project_type,
  COUNT(i.id) as inspection_count
FROM projects p
LEFT JOIN inspections i ON p.id = i.project_id
GROUP BY p.id, p.project_name, p.name, p.status, p.project_type;

-- User Activity Summary
DROP MATERIALIZED VIEW IF EXISTS mv_user_activity_summary CASCADE;
CREATE MATERIALIZED VIEW mv_user_activity_summary AS
SELECT 
  user_id,
  DATE_TRUNC('day', created_at) as activity_date,
  COUNT(*) as action_count,
  array_agg(DISTINCT action) as actions
FROM activity_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id, DATE_TRUNC('day', created_at);

-- 2. CREATE INDEXES
-- ==================

CREATE INDEX IF NOT EXISTS idx_vba_analytics_month ON mv_vba_analytics(month);
CREATE INDEX IF NOT EXISTS idx_vba_analytics_org ON mv_vba_analytics(organization_id);
CREATE INDEX IF NOT EXISTS idx_project_perf_status ON mv_project_performance(status);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON mv_user_activity_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_date ON mv_user_activity_summary(activity_date);

-- Table indexes
CREATE INDEX IF NOT EXISTS idx_vba_projects_status ON vba_projects(status);
CREATE INDEX IF NOT EXISTS idx_vba_projects_org ON vba_projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);

-- 3. REFRESH FUNCTION
-- ====================

CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_vba_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_project_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_activity_summary;
END;
$$ LANGUAGE plpgsql;

-- 4. ANALYZE TABLES
-- ==================
ANALYZE vba_projects;
ANALYZE projects;
ANALYZE inspections;
ANALYZE activity_logs;
ANALYZE profiles;
