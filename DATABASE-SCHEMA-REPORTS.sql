-- Enhanced VBA Projects table
-- This likely already exists but may need some fields added
DO $$
BEGIN
    -- Check if vba_projects table exists, if not create it
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'vba_projects') THEN
        CREATE TABLE vba_projects (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            project_name TEXT NOT NULL,
            project_number TEXT,
            address TEXT NOT NULL,
            city TEXT,
            state TEXT DEFAULT 'FL',
            owner TEXT,
            contractor TEXT,
            project_type TEXT,
            status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed', 'passed')),
            start_date DATE,
            completion_date DATE,
            inspector_name TEXT,
            selected_inspections TEXT[],
            job_number TEXT,
            permit_number TEXT,
            contract_number TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    ELSE
        -- Add any missing columns to existing table
        ALTER TABLE vba_projects
        ADD COLUMN IF NOT EXISTS job_number TEXT,
        ADD COLUMN IF NOT EXISTS permit_number TEXT,
        ADD COLUMN IF NOT EXISTS contract_number TEXT;
    END IF;
END $$;

-- Project Information table - stores extended project details for reports
CREATE TABLE IF NOT EXISTS project_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES vba_projects(id) ON DELETE CASCADE,

    -- Basic Information
    reference TEXT DEFAULT '',
    attention TEXT DEFAULT '',
    company_logo TEXT, -- base64 or URL
    license_number TEXT DEFAULT '',
    company_name TEXT DEFAULT '',
    digital_signature TEXT, -- base64 signature image

    -- Site Superintendent
    site_superintendent TEXT DEFAULT '',
    superintendent_phone TEXT DEFAULT '',
    superintendent_email TEXT DEFAULT '',

    -- Consultant
    consultant TEXT DEFAULT '',
    consultant_company TEXT DEFAULT '',
    consultant_phone TEXT DEFAULT '',
    consultant_email TEXT DEFAULT '',

    -- Inspector
    inspector TEXT DEFAULT '',
    inspector_company TEXT DEFAULT '',
    inspector_phone TEXT DEFAULT '',
    inspector_email TEXT DEFAULT '',
    inspector_license TEXT DEFAULT '',

    -- Project Details
    project_type TEXT DEFAULT '',
    project_size TEXT DEFAULT '',
    project_value TEXT DEFAULT '',
    building_height TEXT DEFAULT '',
    number_of_units TEXT DEFAULT '',
    square_footage TEXT DEFAULT '',
    scope_of_work TEXT DEFAULT '',

    -- Engineering specific fields
    engineering_seal TEXT, -- base64 seal image
    engineering_standards TEXT[], -- array of standards
    peer_review_required BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(project_id) -- One project info per project
);

-- Inspection Reports table - stores all types of reports
CREATE TABLE IF NOT EXISTS inspection_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES vba_projects(id) ON DELETE CASCADE,

    -- Report metadata
    report_type TEXT NOT NULL CHECK (report_type IN ('inspection', 'compliance', 'safety_incident', 'material_defect', 'engineering')),
    report_title TEXT NOT NULL,
    report_sequence TEXT NOT NULL,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    inspection_type TEXT, -- for inspection reports

    -- Basic content (all reports)
    observations TEXT DEFAULT '',
    recommendations TEXT DEFAULT '',
    weather TEXT,
    work_zone TEXT,
    work_performed TEXT,

    -- Compliance Report specific fields
    compliance_standard TEXT,
    compliance_status TEXT CHECK (compliance_status IN ('compliant', 'non_compliant', 'partial', 'pending')),
    violations TEXT[], -- array of violations
    corrective_actions TEXT,
    next_review_date DATE,

    -- Safety/Incident Report specific fields
    incident_type TEXT,
    incident_date DATE,
    incident_time TIME,
    injured_party TEXT,
    witness_names TEXT[], -- array of witness names
    incident_description TEXT,
    immediate_actions TEXT,
    root_cause TEXT,
    preventive_measures TEXT,
    reported_to_osha BOOLEAN DEFAULT FALSE,
    severity TEXT CHECK (severity IN ('minor', 'moderate', 'severe', 'fatal')),

    -- Material/Installation Defect Report specific fields
    material_type TEXT,
    manufacturer TEXT,
    batch_lot_number TEXT,
    defect_type TEXT,
    defect_description TEXT,
    affected_quantity TEXT,
    discovery_date DATE,
    supplier_notified BOOLEAN DEFAULT FALSE,
    replacement_required BOOLEAN DEFAULT FALSE,
    cost_impact TEXT,

    -- Engineering Report specific fields
    engineering_report_type TEXT CHECK (engineering_report_type IN ('structural', 'design', 'analysis', 'inspection', 'assessment')),
    engineering_standards TEXT[], -- array of standards used
    calculations_attached BOOLEAN DEFAULT FALSE,
    drawings_attached BOOLEAN DEFAULT FALSE,
    professional_opinion TEXT,
    engineering_recommendations TEXT,
    limitations_assumptions TEXT,
    seal_date DATE,

    -- Report status and metadata
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'final')),
    generated_by TEXT NOT NULL,
    file_url TEXT, -- URL to generated PDF

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspection Photos table - enhanced to support all report types
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inspection_photos') THEN
        CREATE TABLE inspection_photos (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id UUID NOT NULL REFERENCES vba_projects(id) ON DELETE CASCADE,
            inspection_type TEXT,
            category TEXT, -- can be inspection type or report type
            name TEXT NOT NULL,
            caption TEXT,
            url TEXT, -- external URL
            data TEXT, -- base64 image data
            file_size INTEGER,
            mime_type TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    ELSE
        -- Add any missing columns
        ALTER TABLE inspection_photos
        ADD COLUMN IF NOT EXISTS file_size INTEGER,
        ADD COLUMN IF NOT EXISTS mime_type TEXT;
    END IF;
END $$;

-- Activity Logs table - enhanced for report tracking
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activity_logs') THEN
        CREATE TABLE activity_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id TEXT,
            action TEXT NOT NULL,
            entity_type TEXT,
            entity_id TEXT,
            metadata JSONB,
            ip_address INET,
            user_agent TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_information_project_id ON project_information(project_id);
CREATE INDEX IF NOT EXISTS idx_inspection_reports_project_id ON inspection_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_inspection_reports_type ON inspection_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_inspection_reports_date ON inspection_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_inspection_photos_project_id ON inspection_photos(project_id);
CREATE INDEX IF NOT EXISTS idx_inspection_photos_category ON inspection_photos(category);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE project_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your auth system)
CREATE POLICY IF NOT EXISTS "project_information_all" ON project_information FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "inspection_reports_all" ON inspection_reports FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "inspection_photos_all" ON inspection_photos FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "activity_logs_all" ON activity_logs FOR ALL USING (true);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_vba_projects_updated_at ON vba_projects;
CREATE TRIGGER update_vba_projects_updated_at
    BEFORE UPDATE ON vba_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_information_updated_at ON project_information;
CREATE TRIGGER update_project_information_updated_at
    BEFORE UPDATE ON project_information
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inspection_reports_updated_at ON inspection_reports;
CREATE TRIGGER update_inspection_reports_updated_at
    BEFORE UPDATE ON inspection_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- INSERT INTO vba_projects (project_name, address, contractor, status)
-- VALUES ('Test Project', '123 Main St, Fort Myers, FL', 'Test Contractor', 'in_progress')
-- ON CONFLICT DO NOTHING;