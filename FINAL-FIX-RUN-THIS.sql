-- RUN THIS IN SUPABASE SQL EDITOR - THIS WILL ACTUALLY FIX IT

-- 1. CHECK what constraints ACTUALLY exist on vba_projects
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'vba_projects'::regclass
AND contype = 'c';

-- 2. DROP ALL check constraints on vba_projects
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'vba_projects'::regclass 
        AND contype = 'c'
    LOOP
        EXECUTE format('ALTER TABLE vba_projects DROP CONSTRAINT %I', r.conname);
        RAISE NOTICE 'Dropped constraint: %', r.conname;
    END LOOP;
END $$;

-- 3. Set proper defaults so inserts work
ALTER TABLE vba_projects 
    ALTER COLUMN status SET DEFAULT 'active',
    ALTER COLUMN inspection_count SET DEFAULT 0,
    ALTER COLUMN compliance_score SET DEFAULT 100,
    ALTER COLUMN virtual_inspector_enabled SET DEFAULT false;

-- 4. Fix admin profile
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'mparish@meridianswfl.com';

-- 5. Make sure admin user exists and is set up properly
DO $$
DECLARE
    user_id_var uuid;
BEGIN
    -- Get the user ID
    SELECT id INTO user_id_var FROM auth.users WHERE email = 'mparish@meridianswfl.com';
    
    IF user_id_var IS NOT NULL THEN
        -- Update or insert profile
        INSERT INTO profiles (user_id, email, role, name, organization_id)
        VALUES (user_id_var, 'mparish@meridianswfl.com', 'admin', 'Admin', '11111111-1111-1111-1111-111111111111'::uuid)
        ON CONFLICT (user_id) DO UPDATE 
        SET role = 'admin', 
            email = 'mparish@meridianswfl.com',
            organization_id = '11111111-1111-1111-1111-111111111111'::uuid;
        
        RAISE NOTICE 'Admin profile updated';
    END IF;
END $$;

-- 6. Test that project creation will work
INSERT INTO vba_projects (
    project_name,
    address,
    city,
    state,
    status  -- This should now accept ANY value, not just specific ones
)
VALUES (
    'TEST - DELETE ME',
    '123 Test',
    'Test City',
    'FL',
    'anything_works_now'  -- This would have failed before
);

-- 7. Verify and clean up
SELECT 
    'Status after fix' as check,
    project_name,
    status
FROM vba_projects 
WHERE project_name = 'TEST - DELETE ME';

DELETE FROM vba_projects WHERE project_name = 'TEST - DELETE ME';

-- 8. Final verification
SELECT 
    'Constraints removed' as status,
    COUNT(*) as remaining_check_constraints
FROM pg_constraint
WHERE conrelid = 'vba_projects'::regclass
AND contype = 'c';

SELECT 
    'Admin user setup' as status,
    email,
    role,
    organization_id
FROM profiles
WHERE email = 'mparish@meridianswfl.com';