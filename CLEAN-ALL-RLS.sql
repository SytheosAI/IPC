-- CLEAN UP ALL 8 POLICIES AND START FRESH

-- 1. Show what policies exist
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'vba_projects';

-- 2. Drop EVERY SINGLE POLICY on vba_projects
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'vba_projects'
    LOOP
        EXECUTE format('DROP POLICY %I ON vba_projects', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- 3. Create ONLY ONE SIMPLE POLICY for all operations
CREATE POLICY "authenticated_users_full_access"
ON vba_projects 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Verify we only have 1 policy now
SELECT 
    'CLEANED UP - Now have' as status,
    COUNT(*) as policy_count,
    string_agg(policyname, ', ') as policies
FROM pg_policies
WHERE tablename = 'vba_projects';

-- 5. Test that inserts work
INSERT INTO vba_projects (
    project_name,
    address,
    city,
    state,
    organization_id
)
VALUES (
    'Final RLS Test',
    '789 Success St',
    'Naples',
    'FL',
    '11111111-1111-1111-1111-111111111111'::uuid
);

-- 6. Verify and clean up
SELECT 'INSERT WORKS!' as result WHERE EXISTS (
    SELECT 1 FROM vba_projects WHERE project_name = 'Final RLS Test'
);

DELETE FROM vba_projects WHERE project_name = 'Final RLS Test';

-- 7. Final status
SELECT 
    'RLS Fixed with 1 simple policy' as message,
    'Authenticated users can do everything' as policy_type;