-- IPC DATABASE PERFORMANCE OPTIMIZATION
-- Run this script to add critical indexes for improved query performance

-- ============================================
-- VBA PROJECTS INDEXES
-- ============================================

-- Composite index for common status and date queries
CREATE INDEX IF NOT EXISTS idx_vba_projects_status_date 
ON vba_projects(status, start_date DESC);

-- Index for organization-based queries
CREATE INDEX IF NOT EXISTS idx_vba_projects_org_status 
ON vba_projects(organization_id, status);

-- Index for project number lookups
CREATE INDEX IF NOT EXISTS idx_vba_projects_number 
ON vba_projects(project_number);

-- Index for compliance score filtering
CREATE INDEX IF NOT EXISTS idx_vba_projects_compliance 
ON vba_projects(compliance_score DESC) 
WHERE compliance_score IS NOT NULL;

-- Full-text search index for project names and addresses
CREATE INDEX IF NOT EXISTS idx_vba_projects_search 
ON vba_projects USING gin(
  to_tsvector('english', 
    COALESCE(project_name, '') || ' ' || 
    COALESCE(address, '') || ' ' || 
    COALESCE(city, '')
  )
);

-- ============================================
-- PROJECTS TABLE INDEXES
-- ============================================

-- Composite index for status filtering with dates
CREATE INDEX IF NOT EXISTS idx_projects_status_updated 
ON projects(status, updated_at DESC);

-- Index for permit number lookups
CREATE INDEX IF NOT EXISTS idx_projects_permit 
ON projects(permit_number);

-- Organization and status composite
CREATE INDEX IF NOT EXISTS idx_projects_org_status 
ON projects(organization_id, status, created_at DESC);

-- ============================================
-- INSPECTIONS TABLE INDEXES (if table exists)
-- ============================================

-- Only create indexes if inspections table exists with proper columns
-- Index for inspection scheduling queries
-- CREATE INDEX IF NOT EXISTS idx_inspections_scheduled 
-- ON inspections(inspection_date, status) 
-- WHERE status IN ('scheduled', 'in_progress');

-- Index for inspector assignments  
-- CREATE INDEX IF NOT EXISTS idx_inspections_inspector 
-- ON inspections(inspector_id, inspection_date);

-- Index for VBA project relationship
-- CREATE INDEX IF NOT EXISTS idx_inspections_vba_project 
-- ON inspections(vba_project_id, inspection_date DESC);

-- ============================================
-- DOCUMENTS TABLE INDEXES
-- ============================================

-- Index for project document queries
CREATE INDEX IF NOT EXISTS idx_documents_project 
ON documents(project_id, created_at DESC);

-- Category-based filtering
CREATE INDEX IF NOT EXISTS idx_documents_category 
ON documents(category, status);

-- Full-text search for document names
CREATE INDEX IF NOT EXISTS idx_documents_search 
ON documents USING gin(to_tsvector('english', name));

-- ============================================
-- FIELD REPORTS INDEXES
-- ============================================

-- Index for report type and date queries
CREATE INDEX IF NOT EXISTS idx_field_reports_type_date 
ON field_reports(report_type, report_date DESC);

-- Index for reporter queries
CREATE INDEX IF NOT EXISTS idx_field_reports_reporter 
ON field_reports(reporter_id, report_date DESC);

-- Priority-based filtering
CREATE INDEX IF NOT EXISTS idx_field_reports_priority 
ON field_reports(priority, status) 
WHERE priority IN ('high', 'critical');

-- ============================================
-- ACTIVITY LOGS INDEXES
-- ============================================

-- Index for user activity queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_user 
ON activity_logs(user_id, created_at DESC);

-- Entity-based activity tracking
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity 
ON activity_logs(entity_type, entity_id, created_at DESC);

-- ============================================
-- SECURITY EVENTS INDEXES
-- ============================================

-- Index for severity-based queries
CREATE INDEX IF NOT EXISTS idx_security_events_severity 
ON security_events(severity, created_at DESC);

-- Index for event type filtering
CREATE INDEX IF NOT EXISTS idx_security_events_type 
ON security_events(event_type, created_at DESC);

-- ============================================
-- NOTIFICATION EMAILS INDEXES
-- ============================================

-- Index for active notifications
CREATE INDEX IF NOT EXISTS idx_notification_emails_active 
ON notification_emails(active, notification_type) 
WHERE active = true;

-- ============================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================

-- Daily inspection analytics (commented out until inspections table structure is finalized)
-- CREATE MATERIALIZED VIEW IF NOT EXISTS mv_inspection_analytics AS
-- SELECT 
--   DATE(inspection_date) as date,
--   COUNT(*) as total_inspections,
--   COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
--   COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
--   COUNT(CASE WHEN status = 'passed' THEN 1 END) as passed,
--   AVG(compliance_score) as avg_compliance_score,
--   COUNT(DISTINCT inspector_id) as unique_inspectors
-- FROM inspections
-- WHERE inspection_date IS NOT NULL
-- GROUP BY DATE(inspection_date);

-- Create index on materialized view
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_inspection_analytics_date 
-- ON mv_inspection_analytics(date DESC);

-- Project status summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_project_status_summary AS
SELECT 
  organization_id,
  status,
  COUNT(*) as count,
  MAX(updated_at) as last_updated
FROM projects
GROUP BY organization_id, status;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_mv_project_status_org 
ON mv_project_status_summary(organization_id, status);

-- ============================================
-- REFRESH MATERIALIZED VIEWS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  -- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inspection_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_project_status_summary;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- AUTOMATED REFRESH SCHEDULING (Optional)
-- ============================================
-- Manual refresh command (run as needed):
-- SELECT refresh_materialized_views();

-- ============================================
-- QUERY PERFORMANCE ANALYSIS
-- ============================================

-- Check index usage statistics
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Identify missing indexes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1
ORDER BY n_distinct DESC;

-- ============================================
-- VACUUM AND ANALYZE
-- ============================================

-- Update statistics for query planner
ANALYZE vba_projects;
ANALYZE projects;
ANALYZE inspections;
ANALYZE documents;
ANALYZE field_reports;
ANALYZE activity_logs;

-- Vacuum to reclaim storage
VACUUM (VERBOSE, ANALYZE) vba_projects;
VACUUM (VERBOSE, ANALYZE) projects;
VACUUM (VERBOSE, ANALYZE) inspections;

-- Database performance optimization complete!
-- Indexes created for improved query performance
-- Materialized views created for analytics  
-- Statistics updated for query planner