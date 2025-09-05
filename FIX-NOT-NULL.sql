-- FIX NOT NULL CONSTRAINTS ONE BY ONE

-- 1. Show what's still NOT NULL
SELECT 
    column_name,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'vba_projects'
AND is_nullable = 'NO'
ORDER BY column_name;

-- 2. Drop NOT NULL constraints individually
ALTER TABLE vba_projects ALTER COLUMN project_number DROP NOT NULL;
ALTER TABLE vba_projects ALTER COLUMN project_id DROP NOT NULL;
ALTER TABLE vba_projects ALTER COLUMN contractor DROP NOT NULL;
ALTER TABLE vba_projects ALTER COLUMN owner DROP NOT NULL;
ALTER TABLE vba_projects ALTER COLUMN start_date DROP NOT NULL;
ALTER TABLE vba_projects ALTER COLUMN completion_date DROP NOT NULL;
ALTER TABLE vba_projects ALTER COLUMN inspection_count DROP NOT NULL;
ALTER TABLE vba_projects ALTER COLUMN last_inspection_date DROP NOT NULL;
ALTER TABLE vba_projects ALTER COLUMN compliance_score DROP NOT NULL;
ALTER TABLE vba_projects ALTER COLUMN virtual_inspector_enabled DROP NOT NULL;
ALTER TABLE vba_projects ALTER COLUMN notes DROP NOT NULL;
ALTER TABLE vba_projects ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE vba_projects ALTER COLUMN name DROP NOT NULL;
ALTER TABLE vba_projects ALTER COLUMN description DROP NOT NULL;

-- 3. Set sensible defaults for commonly used fields
ALTER TABLE vba_projects ALTER COLUMN status SET DEFAULT 'active';
ALTER TABLE vba_projects ALTER COLUMN inspection_count SET DEFAULT 0;
ALTER TABLE vba_projects ALTER COLUMN compliance_score SET DEFAULT 100;
ALTER TABLE vba_projects ALTER COLUMN virtual_inspector_enabled SET DEFAULT false;
ALTER TABLE vba_projects ALTER COLUMN organization_id SET DEFAULT '11111111-1111-1111-1111-111111111111'::uuid;

-- 4. Verify what's left as NOT NULL (should only be essential fields)
SELECT 
    'Still required:' as status,
    string_agg(column_name, ', ') as required_fields
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'vba_projects'
AND is_nullable = 'NO';

-- 5. Test minimal insert
INSERT INTO vba_projects (
    project_name,
    address,
    city,
    state
)
VALUES (
    'Final Test',
    '789 Oak St',
    'Naples',
    'FL'
);

-- 6. Verify success
SELECT 
    'INSERT SUCCESS' as result,
    id,
    project_name,
    project_number,
    status
FROM vba_projects
WHERE project_name = 'Final Test';

-- 7. Clean up
DELETE FROM vba_projects WHERE project_name = 'Final Test';