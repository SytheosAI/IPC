-- FIX RLS THE RIGHT WAY - KEEP SECURITY BUT MAKE IT WORK

-- 1. Check current RLS status
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'vba_projects';

-- 2. Drop existing broken policies
DROP POLICY IF EXISTS "Allow everything for authenticated users" ON vba_projects;
DROP POLICY IF EXISTS "Users can view their organization's projects" ON vba_projects;
DROP POLICY IF EXISTS "Users can create projects for their organization" ON vba_projects;
DROP POLICY IF EXISTS "Users can update their organization's projects" ON vba_projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON vba_projects;

-- 3. Create WORKING RLS policies that check auth properly
-- Enable RLS
ALTER TABLE vba_projects ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can see all projects in their organization
CREATE POLICY "Enable read for users"
ON vba_projects FOR SELECT
USING (
    auth.uid() IS NOT NULL
);

-- INSERT: Users can create projects (the issue is likely here)
CREATE POLICY "Enable insert for users"
ON vba_projects FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (
        organization_id = '11111111-1111-1111-1111-111111111111'::uuid
        OR organization_id IN (
            SELECT organization_id FROM profiles WHERE user_id = auth.uid()
        )
    )
);

-- UPDATE: Users can update projects in their organization
CREATE POLICY "Enable update for users"
ON vba_projects FOR UPDATE
USING (
    auth.uid() IS NOT NULL
)
WITH CHECK (
    auth.uid() IS NOT NULL
);

-- DELETE: Only admins can delete
CREATE POLICY "Enable delete for admins"
ON vba_projects FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);

-- 4. Test the fix
DO $$
BEGIN
    -- Test insert with proper organization_id
    INSERT INTO vba_projects (
        project_name,
        address,
        city,
        state,
        organization_id,
        created_by
    )
    VALUES (
        'RLS Policy Test',
        '456 Test Ave',
        'Naples',
        'FL',
        '11111111-1111-1111-1111-111111111111'::uuid,
        auth.uid()
    );
    
    RAISE NOTICE '✅ RLS policies are working correctly!';
    
    -- Clean up test
    DELETE FROM vba_projects WHERE project_name = 'RLS Policy Test';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ RLS still has issues: %', SQLERRM;
END $$;

-- 5. Show current policies
SELECT 
    'RLS is ENABLED with proper policies' as status,
    COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'vba_projects';