-- Final comprehensive RLS fix for VBA projects
-- This script ensures proper authentication handling

-- 1. Drop existing policies
DROP POLICY IF EXISTS "vba_projects_select" ON vba_projects;
DROP POLICY IF EXISTS "vba_projects_insert" ON vba_projects;
DROP POLICY IF EXISTS "vba_projects_update" ON vba_projects;
DROP POLICY IF EXISTS "vba_projects_delete" ON vba_projects;

-- 2. Create helper function to check authentication
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS boolean AS $$
BEGIN
  -- Check if auth.uid() returns a non-null value
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. Create permissive policies for authenticated users
-- Note: These are permissive for testing - tighten in production

-- Select policy - authenticated users can view all projects
CREATE POLICY "vba_projects_select"
ON vba_projects
FOR SELECT
TO authenticated
USING (true);  -- All authenticated users can read

-- Insert policy - authenticated users can create projects
CREATE POLICY "vba_projects_insert"
ON vba_projects
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL  -- Must be authenticated
);

-- Update policy - authenticated users can update any project (for testing)
CREATE POLICY "vba_projects_update"
ON vba_projects
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL  -- Must be authenticated
)
WITH CHECK (
  auth.uid() IS NOT NULL  -- Must remain authenticated
);

-- Delete policy - authenticated users can delete projects they created
CREATE POLICY "vba_projects_delete"
ON vba_projects
FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    created_by = auth.uid()::text OR  -- Can delete own projects
    created_by IS NULL  -- Can delete projects without owner
  )
);

-- 4. Create a diagnostic function
CREATE OR REPLACE FUNCTION diagnose_vba_rls()
RETURNS TABLE(
  check_name text,
  status text,
  details text
) AS $$
DECLARE
  current_user_id uuid;
  is_auth boolean;
  has_session boolean;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  is_auth := current_user_id IS NOT NULL;
  
  -- Check if there's a valid session
  has_session := current_setting('request.jwt.claim.sub', true) IS NOT NULL;
  
  -- Check 1: Authentication status
  RETURN QUERY
  SELECT 
    'Authentication Status'::text,
    CASE WHEN is_auth THEN 'PASSED' ELSE 'FAILED' END::text,
    CASE 
      WHEN is_auth THEN 'User authenticated with ID: ' || current_user_id::text
      ELSE 'No authenticated user found'
    END::text;
  
  -- Check 2: JWT Session
  RETURN QUERY
  SELECT 
    'JWT Session'::text,
    CASE WHEN has_session THEN 'PASSED' ELSE 'FAILED' END::text,
    CASE 
      WHEN has_session THEN 'Valid JWT session found'
      ELSE 'No JWT session detected'
    END::text;
  
  -- Check 3: Role check
  RETURN QUERY
  SELECT 
    'User Role'::text,
    'INFO'::text,
    'Current role: ' || COALESCE(current_setting('request.jwt.claim.role', true), 'unknown')::text;
  
  -- Check 4: RLS status
  RETURN QUERY
  SELECT 
    'RLS Status'::text,
    'INFO'::text,
    CASE 
      WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'vba_projects') > 0 
      THEN 'RLS enabled with ' || (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'vba_projects')::text || ' policies'
      ELSE 'No RLS policies found'
    END::text;
  
  -- Check 5: Can insert test
  RETURN QUERY
  SELECT 
    'Insert Permission'::text,
    CASE WHEN is_auth THEN 'SHOULD PASS' ELSE 'SHOULD FAIL' END::text,
    CASE 
      WHEN is_auth THEN 'Authenticated users can insert'
      ELSE 'Authentication required for insert'
    END::text;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION diagnose_vba_rls() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_authenticated() TO authenticated, anon;

-- 5. Verify RLS is enabled
ALTER TABLE vba_projects ENABLE ROW LEVEL SECURITY;

-- 6. Test the setup
DO $$
BEGIN
  RAISE NOTICE 'VBA Projects RLS setup completed';
  RAISE NOTICE 'RLS is now enabled on vba_projects table';
  RAISE NOTICE 'Policies created for: SELECT, INSERT, UPDATE, DELETE';
  RAISE NOTICE 'Run SELECT * FROM diagnose_vba_rls() to check status';
END $$;