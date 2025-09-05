-- ADD ORGANIZATION_ID TO ALL EXISTING TABLES FIRST

-- Add to projects if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS organization_id UUID DEFAULT '11111111-1111-1111-1111-111111111111'::uuid;
        UPDATE projects SET organization_id = '11111111-1111-1111-1111-111111111111'::uuid WHERE organization_id IS NULL;
        ALTER TABLE projects DROP CONSTRAINT IF EXISTS fk_projects_organization;
        ALTER TABLE projects ADD CONSTRAINT fk_projects_organization FOREIGN KEY (organization_id) REFERENCES organizations(id);
    END IF;
END $$;

-- Add to field_reports if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'field_reports') THEN
        ALTER TABLE field_reports ADD COLUMN IF NOT EXISTS organization_id UUID DEFAULT '11111111-1111-1111-1111-111111111111'::uuid;
        UPDATE field_reports SET organization_id = '11111111-1111-1111-1111-111111111111'::uuid WHERE organization_id IS NULL;
        ALTER TABLE field_reports DROP CONSTRAINT IF EXISTS fk_field_reports_organization;
        ALTER TABLE field_reports ADD CONSTRAINT fk_field_reports_organization FOREIGN KEY (organization_id) REFERENCES organizations(id);
    END IF;
END $$;

-- Add to submittals if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'submittals') THEN
        ALTER TABLE submittals ADD COLUMN IF NOT EXISTS organization_id UUID DEFAULT '11111111-1111-1111-1111-111111111111'::uuid;
        UPDATE submittals SET organization_id = '11111111-1111-1111-1111-111111111111'::uuid WHERE organization_id IS NULL;
        ALTER TABLE submittals DROP CONSTRAINT IF EXISTS fk_submittals_organization;
        ALTER TABLE submittals ADD CONSTRAINT fk_submittals_organization FOREIGN KEY (organization_id) REFERENCES organizations(id);
    END IF;
END $$;

-- Add to contacts if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts') THEN
        ALTER TABLE contacts ADD COLUMN IF NOT EXISTS organization_id UUID DEFAULT '11111111-1111-1111-1111-111111111111'::uuid;
        UPDATE contacts SET organization_id = '11111111-1111-1111-1111-111111111111'::uuid WHERE organization_id IS NULL;
        ALTER TABLE contacts DROP CONSTRAINT IF EXISTS fk_contacts_organization;
        ALTER TABLE contacts ADD CONSTRAINT fk_contacts_organization FOREIGN KEY (organization_id) REFERENCES organizations(id);
    END IF;
END $$;

-- Add to documents if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
        ALTER TABLE documents ADD COLUMN IF NOT EXISTS organization_id UUID DEFAULT '11111111-1111-1111-1111-111111111111'::uuid;
        UPDATE documents SET organization_id = '11111111-1111-1111-1111-111111111111'::uuid WHERE organization_id IS NULL;
        ALTER TABLE documents DROP CONSTRAINT IF EXISTS fk_documents_organization;
        ALTER TABLE documents ADD CONSTRAINT fk_documents_organization FOREIGN KEY (organization_id) REFERENCES organizations(id);
    END IF;
END $$;

-- Add to inspections if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inspections') THEN
        ALTER TABLE inspections ADD COLUMN IF NOT EXISTS organization_id UUID DEFAULT '11111111-1111-1111-1111-111111111111'::uuid;
        UPDATE inspections SET organization_id = '11111111-1111-1111-1111-111111111111'::uuid WHERE organization_id IS NULL;
        ALTER TABLE inspections DROP CONSTRAINT IF EXISTS fk_inspections_organization;
        ALTER TABLE inspections ADD CONSTRAINT fk_inspections_organization FOREIGN KEY (organization_id) REFERENCES organizations(id);
    END IF;
END $$;

-- Now run CREATE-ALL-TABLES.sql AFTER this