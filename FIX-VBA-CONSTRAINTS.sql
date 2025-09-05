-- THE REAL PROBLEM: NOT NULL CONSTRAINTS, NOT RLS

-- 1. Check all NOT NULL constraints on vba_projects
SELECT 
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'vba_projects'
AND is_nullable = 'NO'
ORDER BY ordinal_position;

-- 2. Make nullable the columns that shouldn't be required
ALTER TABLE vba_projects 
    ALTER COLUMN project_number DROP NOT NULL,
    ALTER COLUMN project_id DROP NOT NULL,
    ALTER COLUMN contractor DROP NOT NULL,
    ALTER COLUMN owner DROP NOT NULL,
    ALTER COLUMN start_date DROP NOT NULL,
    ALTER COLUMN completion_date DROP NOT NULL,
    ALTER COLUMN notes DROP NOT NULL,
    ALTER COLUMN name DROP NOT NULL,
    ALTER COLUMN description DROP NOT NULL;

-- 3. Keep these as NOT NULL (actually required)
-- project_name, address, city, state should stay required

-- 4. Test insert with minimal fields
INSERT INTO vba_projects (
    project_name,
    address,
    city,
    state,
    organization_id
)
VALUES (
    'Minimal Test Project',
    '123 Test Ave',
    'Naples',
    'FL',
    '11111111-1111-1111-1111-111111111111'::uuid
);

-- 5. Verify it worked
SELECT 
    'SUCCESS!' as status,
    id,
    project_name
FROM vba_projects
WHERE project_name = 'Minimal Test Project';

-- 6. Clean up
DELETE FROM vba_projects WHERE project_name = 'Minimal Test Project';

-- 7. Show final constraint status
SELECT 
    'FIXED: These fields are now optional' as status,
    string_agg(column_name, ', ') as nullable_columns
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'vba_projects'
AND is_nullable = 'YES';