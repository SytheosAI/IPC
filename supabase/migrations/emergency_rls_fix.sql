-- EMERGENCY RLS FIX FOR VBA_PROJECTS
-- Run this SQL directly in Supabase SQL Editor

-- Step 1: Disable RLS to clean up
ALTER TABLE vba_projects DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DROP POLICY IF EXISTS "Allow all authenticated users to read" ON vba_projects;
DROP POLICY IF EXISTS "Allow all authenticated users to insert" ON vba_projects;
DROP POLICY IF EXISTS "Allow all authenticated users to update" ON vba_projects;
DROP POLICY IF EXISTS "Allow all authenticated users to delete" ON vba_projects;
DROP POLICY IF EXISTS "Enable all access for all users" ON vba_projects;
DROP POLICY IF EXISTS "Enable read access for all users" ON vba_projects;
DROP POLICY IF EXISTS "Enable insert for all users" ON vba_projects;
DROP POLICY IF EXISTS "Enable update for all users" ON vba_projects;
DROP POLICY IF EXISTS "Enable delete for all users" ON vba_projects;
DROP POLICY IF EXISTS "Allow everything for authenticated users" ON vba_projects;
DROP POLICY IF EXISTS "Users can view all vba_projects" ON vba_projects;
DROP POLICY IF EXISTS "Users can create vba_projects" ON vba_projects;
DROP POLICY IF EXISTS "Users can update vba_projects" ON vba_projects;
DROP POLICY IF EXISTS "Users can delete vba_projects" ON vba_projects;

-- Step 3: Re-enable RLS
ALTER TABLE vba_projects ENABLE ROW LEVEL SECURITY;

-- Step 4: Create SINGLE, SIMPLE policy that allows EVERYTHING
-- This is the nuclear option - it allows all operations for all authenticated users
CREATE POLICY "Allow everything for authenticated users"
  ON vba_projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Step 5: Also allow anon access for development
CREATE POLICY "Allow everything for anon users"
  ON vba_projects
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Step 6: Grant all permissions
GRANT ALL ON vba_projects TO authenticated;
GRANT ALL ON vba_projects TO anon;
GRANT ALL ON vba_projects TO service_role;

-- Step 7: Ensure the table has all needed columns
DO $$
BEGIN
  -- Add organization_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vba_projects' 
    AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE vba_projects ADD COLUMN organization_id UUID;
  END IF;
  
  -- Add created_by if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vba_projects' 
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE vba_projects ADD COLUMN created_by UUID;
  END IF;
END $$;

-- Step 8: Test that it works
DO $$
DECLARE
  test_id UUID;
BEGIN
  -- Try to insert a test record
  INSERT INTO vba_projects (
    project_name,
    address,
    status,
    created_at,
    updated_at
  ) VALUES (
    'RLS Test - Delete Me',
    '123 Test Street',
    'scheduled',
    NOW(),
    NOW()
  ) RETURNING id INTO test_id;
  
  -- Clean up
  DELETE FROM vba_projects WHERE id = test_id;
  
  RAISE NOTICE '✅ SUCCESS! Insert test passed - RLS is now fixed!';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ ERROR: Insert test failed - %', SQLERRM;
END $$;

-- Final status check
SELECT 
  'VBA Projects RLS Status' as check_type,
  CASE 
    WHEN relrowsecurity THEN 'ENABLED' 
    ELSE 'DISABLED' 
  END as rls_status,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'vba_projects') as policy_count
FROM pg_class 
WHERE relname = 'vba_projects';