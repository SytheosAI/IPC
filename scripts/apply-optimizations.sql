-- IPC Database Performance Optimizations
-- Applied directly via service role

-- VBA Projects indexes
CREATE INDEX IF NOT EXISTS idx_vba_projects_status_date ON vba_projects(status, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_vba_projects_org_status ON vba_projects(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_vba_projects_number ON vba_projects(project_number);
CREATE INDEX IF NOT EXISTS idx_vba_projects_compliance ON vba_projects(compliance_score DESC) WHERE compliance_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vba_projects_search ON vba_projects USING gin(to_tsvector('english', COALESCE(project_name, '') || ' ' || COALESCE(address, '') || ' ' || COALESCE(city, '')));

-- Projects indexes  
CREATE INDEX IF NOT EXISTS idx_projects_status_updated ON projects(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_permit ON projects(permit_number);
CREATE INDEX IF NOT EXISTS idx_projects_org_status ON projects(organization_id, status, created_at DESC);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category, status);
CREATE INDEX IF NOT EXISTS idx_documents_search ON documents USING gin(to_tsvector('english', name));

-- Field reports indexes
CREATE INDEX IF NOT EXISTS idx_field_reports_type_date ON field_reports(report_type, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_field_reports_reporter ON field_reports(reporter_id, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_field_reports_priority ON field_reports(priority, status) WHERE priority IN ('high', 'critical');

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id, created_at DESC);

-- Security events indexes
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type, created_at DESC);

-- Notification emails indexes
CREATE INDEX IF NOT EXISTS idx_notification_emails_active ON notification_emails(active, notification_type) WHERE active = true;

-- Project status summary materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_project_status_summary AS
SELECT 
  organization_id,
  status,
  COUNT(*) as count,
  MAX(updated_at) as last_updated
FROM projects
GROUP BY organization_id, status;

CREATE INDEX IF NOT EXISTS idx_mv_project_status_org ON mv_project_status_summary(organization_id, status);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_project_status_summary;
END;
$$ LANGUAGE plpgsql;

-- Update statistics
ANALYZE vba_projects;
ANALYZE projects;
ANALYZE documents;
ANALYZE field_reports;
ANALYZE activity_logs;

-- Vacuum for performance
VACUUM (VERBOSE, ANALYZE) vba_projects;
VACUUM (VERBOSE, ANALYZE) projects;