-- TEST WITH ALL REQUIRED FIELDS FILLED

-- 1. Test VBA project creation
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
    'Test VBA ' || NOW()::text,
    'VBA Test Project',
    'VBA-001',
    '123 Test Street',
    'Naples',
    'FL',
    'Test Contractor',
    'Test Owner',
    'active',
    '11111111-1111-1111-1111-111111111111'::uuid,
    auth.uid()
);

-- 2. Test regular project creation - WITH ALL REQUIRED FIELDS
INSERT INTO projects (
    project_name,
    address,
    city,
    state,
    organization_id
)
VALUES (
    'Test Project 1',
    '456 Main St',
    'Naples',
    'FL',
    '11111111-1111-1111-1111-111111111111'::uuid
);

-- 3. Verify data exists
SELECT 'VBA Projects Count: ' || COUNT(*)::text as result FROM vba_projects;
SELECT 'Projects Count: ' || COUNT(*)::text as result FROM projects;

-- 4. Show the data
SELECT id, project_name, address, city, state FROM vba_projects ORDER BY created_at DESC LIMIT 5;
SELECT id, project_name, address, city, state FROM projects ORDER BY created_at DESC LIMIT 5;