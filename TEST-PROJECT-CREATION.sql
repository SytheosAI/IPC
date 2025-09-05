-- TEST THAT EVERYTHING WORKS

-- 1. Check all tables exist with organization_id
SELECT 
    table_name,
    EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = t.table_name 
        AND column_name = 'organization_id'
    ) as has_org_id
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'projects', 'vba_projects', 'field_reports', 'submittals', 'contacts', 'documents', 'inspections', 'organization_settings')
ORDER BY table_name;

-- 2. Test creating a VBA project (this was failing before)
INSERT INTO vba_projects (name, description, status, organization_id, created_by)
VALUES (
    'Test VBA Project ' || NOW()::text,
    'Testing that projects persist',
    'active',
    '11111111-1111-1111-1111-111111111111'::uuid,
    auth.uid()
);

-- 3. Test creating a regular project
INSERT INTO projects (name, description, status, project_number, organization_id, created_by)
VALUES (
    'Test Project ' || NOW()::text,
    'Testing multi-tenancy',
    'active',
    'TEST-001',
    '11111111-1111-1111-1111-111111111111'::uuid,
    auth.uid()
);

-- 4. Test creating a field report
INSERT INTO field_reports (title, content, organization_id, created_by)
VALUES (
    'Test Field Report',
    'Testing that field reports persist',
    '11111111-1111-1111-1111-111111111111'::uuid,
    auth.uid()
);

-- 5. Test creating a contact
INSERT INTO contacts (name, email, phone, company, organization_id, created_by)
VALUES (
    'Test Contact',
    'test@example.com',
    '555-0123',
    'Test Company',
    '11111111-1111-1111-1111-111111111111'::uuid,
    auth.uid()
);

-- 6. Verify all data was created
SELECT 
    'VBA Projects' as table_name,
    COUNT(*) as count
FROM vba_projects
WHERE organization_id = '11111111-1111-1111-1111-111111111111'::uuid
UNION ALL
SELECT 
    'Projects',
    COUNT(*)
FROM projects
WHERE organization_id = '11111111-1111-1111-1111-111111111111'::uuid
UNION ALL
SELECT 
    'Field Reports',
    COUNT(*)
FROM field_reports
WHERE organization_id = '11111111-1111-1111-1111-111111111111'::uuid
UNION ALL
SELECT 
    'Contacts',
    COUNT(*)
FROM contacts
WHERE organization_id = '11111111-1111-1111-1111-111111111111'::uuid
ORDER BY table_name;

-- 7. Show recent VBA projects to confirm they persist
SELECT 
    id,
    name,
    created_at,
    organization_id
FROM vba_projects
ORDER BY created_at DESC
LIMIT 5;