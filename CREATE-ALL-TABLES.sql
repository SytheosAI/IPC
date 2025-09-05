-- CREATE ALL MISSING TABLES WITH MULTI-TENANCY

-- 1. Projects table (main projects, not VBA)
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    project_number TEXT,
    client_name TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    organization_id UUID NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid REFERENCES organizations(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Field Reports table
CREATE TABLE IF NOT EXISTS field_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    report_date DATE DEFAULT CURRENT_DATE,
    weather TEXT,
    temperature TEXT,
    project_id UUID REFERENCES projects(id),
    inspector_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'draft',
    organization_id UUID NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid REFERENCES organizations(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Submittals table
CREATE TABLE IF NOT EXISTS submittals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submittal_number TEXT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    submitted_date DATE,
    review_date DATE,
    approved_date DATE,
    project_id UUID REFERENCES projects(id),
    reviewer_id UUID REFERENCES auth.users(id),
    organization_id UUID NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid REFERENCES organizations(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Contacts table  
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    mobile TEXT,
    company TEXT,
    title TEXT,
    contact_type TEXT, -- client, contractor, subcontractor, vendor, etc
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    notes TEXT,
    organization_id UUID NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid REFERENCES organizations(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Organization Settings table
CREATE TABLE IF NOT EXISTS organization_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id),
    company_name TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#FFD700',
    secondary_color TEXT DEFAULT '#1F2937',
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Documents table (for file attachments)
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    file_path TEXT,
    file_size INTEGER,
    mime_type TEXT,
    project_id UUID REFERENCES projects(id),
    field_report_id UUID REFERENCES field_reports(id),
    submittal_id UUID REFERENCES submittals(id),
    organization_id UUID NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid REFERENCES organizations(id),
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Inspections table (if not exists)
CREATE TABLE IF NOT EXISTS inspections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inspection_number TEXT,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled',
    scheduled_date DATE,
    completed_date DATE,
    project_id UUID REFERENCES projects(id),
    inspector_id UUID REFERENCES auth.users(id),
    result TEXT, -- pass, fail, partial, etc
    notes TEXT,
    organization_id UUID NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid REFERENCES organizations(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_organization ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_field_reports_organization ON field_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_field_reports_project ON field_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_submittals_organization ON submittals(organization_id);
CREATE INDEX IF NOT EXISTS idx_submittals_project ON submittals(project_id);
CREATE INDEX IF NOT EXISTS idx_contacts_organization ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_organization ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_inspections_organization ON inspections(organization_id);
CREATE INDEX IF NOT EXISTS idx_inspections_project ON inspections(project_id);

-- 9. Create default organization settings
INSERT INTO organization_settings (organization_id, company_name)
VALUES ('11111111-1111-1111-1111-111111111111', 'IPC Beta Organization')
ON CONFLICT (organization_id) DO NOTHING;

-- 10. Simple RLS for all new tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE submittals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

-- Simple policy: authenticated users can do everything
CREATE POLICY "Allow all for authenticated" ON projects FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow all for authenticated" ON field_reports FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow all for authenticated" ON submittals FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow all for authenticated" ON contacts FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow all for authenticated" ON documents FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow all for authenticated" ON inspections FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow all for authenticated" ON organization_settings FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Verify creation
SELECT 
    table_name,
    'Created' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('projects', 'field_reports', 'submittals', 'contacts', 'documents', 'inspections', 'organization_settings')
ORDER BY table_name;