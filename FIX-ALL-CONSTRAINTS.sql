-- FIX ALL CONSTRAINTS BLOCKING INSERTS

-- 1. Show all check constraints on vba_projects
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'vba_projects'::regclass
AND contype = 'c';

-- 2. Drop the status check constraint
ALTER TABLE vba_projects DROP CONSTRAINT IF EXISTS vba_projects_status_check;

-- 3. Show current status column default
SELECT 
    column_name,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'vba_projects' 
AND column_name = 'status';

-- 4. Fix the status column default to something valid
ALTER TABLE vba_projects ALTER COLUMN status SET DEFAULT 'active';

-- 5. Test insert with absolute minimum fields
INSERT INTO vba_projects (
    project_name,
    address,
    city,
    state
)
VALUES (
    'Constraint Test',
    '456 Main',
    'Naples', 
    'FL'
);

-- 6. Check what got inserted
SELECT 
    id,
    project_name,
    status,
    organization_id
FROM vba_projects
WHERE project_name = 'Constraint Test';

-- 7. Clean up
DELETE FROM vba_projects WHERE project_name = 'Constraint Test';

-- 8. Final check - what constraints remain?
SELECT 
    'Remaining constraints on vba_projects:' as info,
    conname as constraint_name,
    contype as type
FROM pg_constraint
WHERE conrelid = 'vba_projects'::regclass
ORDER BY contype;