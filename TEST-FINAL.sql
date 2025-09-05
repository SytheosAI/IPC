-- FINAL TEST - WITH ALL REQUIRED FIELDS

-- 1. Test creating a VBA project
INSERT INTO vba_projects (
    name,
    project_name, 
    project_number,
    address,
    city,
    state,
    contractor,
    owner,
    status,
    organization_id,
    created_by
)
VALUES (
    'Test VBA Project - ' || NOW()::text,
    'Beta Testing VBA Project',
    'VBA-2025-001',
    '123 Test Street',
    'Naples',
    'FL',
    'Test Contractor Inc',
    'Beta Testing Owner',
    'active',
    '11111111-1111-1111-1111-111111111111'::uuid,
    auth.uid()
)
RETURNING id, name, project_name, organization_id;

-- 2. Create test projects with project_name (which is required)
INSERT INTO projects (name, project_name, description, status, organization_id, created_by)
SELECT 
    'Project ' || generate_series,
    'Project Name ' || generate_series, -- project_name is required
    'Testing persistence #' || generate_series,
    'active',
    '11111111-1111-1111-1111-111111111111'::uuid,
    auth.uid()
FROM generate_series(1, 3);

-- 3. Create test field reports
INSERT INTO field_reports (title, content, organization_id, created_by)
SELECT 
    'Field Report ' || generate_series,
    'Test content for report #' || generate_series,
    '11111111-1111-1111-1111-111111111111'::uuid,
    auth.uid()
FROM generate_series(1, 3);

-- 4. Create test submittals
INSERT INTO submittals (title, description, status, organization_id, created_by)
SELECT 
    'Submittal ' || generate_series,
    'Test submittal #' || generate_series,
    'pending',
    '11111111-1111-1111-1111-111111111111'::uuid,
    auth.uid()
FROM generate_series(1, 3);

-- 5. Create test contacts
INSERT INTO contacts (name, email, company, organization_id, created_by)
VALUES 
    ('John Doe', 'john@example.com', 'ABC Construction', '11111111-1111-1111-1111-111111111111'::uuid, auth.uid()),
    ('Jane Smith', 'jane@example.com', 'XYZ Engineering', '11111111-1111-1111-1111-111111111111'::uuid, auth.uid()),
    ('Bob Johnson', 'bob@example.com', 'Test Corp', '11111111-1111-1111-1111-111111111111'::uuid, auth.uid());

-- 6. FINAL VERIFICATION - All data should persist
SELECT 
    table_name,
    record_count,
    CASE 
        WHEN record_count > 0 THEN '✅ Data persisting'
        ELSE '❌ No data'
    END as status
FROM (
    SELECT 'VBA Projects' as table_name, COUNT(*) as record_count
    FROM vba_projects
    WHERE organization_id = '11111111-1111-1111-1111-111111111111'::uuid
    UNION ALL
    SELECT 'Projects', COUNT(*)
    FROM projects
    WHERE organization_id = '11111111-1111-1111-1111-111111111111'::uuid
    UNION ALL
    SELECT 'Field Reports', COUNT(*)
    FROM field_reports
    WHERE organization_id = '11111111-1111-1111-1111-111111111111'::uuid
    UNION ALL
    SELECT 'Submittals', COUNT(*)
    FROM submittals
    WHERE organization_id = '11111111-1111-1111-1111-111111111111'::uuid
    UNION ALL
    SELECT 'Contacts', COUNT(*)
    FROM contacts
    WHERE organization_id = '11111111-1111-1111-1111-111111111111'::uuid
) counts
ORDER BY table_name;

-- 7. Show recent records from each table
SELECT 'Recent VBA Projects:' as section;
SELECT id, name, project_name, status, created_at
FROM vba_projects
ORDER BY created_at DESC
LIMIT 3;

SELECT 'Recent Projects:' as section;
SELECT id, name, project_name, status, created_at
FROM projects
ORDER BY created_at DESC
LIMIT 3;