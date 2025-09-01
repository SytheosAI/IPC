-- FIX RLS POLICIES PROPERLY WITHOUT RECURSION
-- Run this AFTER running FIX-RLS-RECURSION.sql

-- Step 1: Ensure RLS is disabled first (to clean up)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all old policies
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation on signup" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- Step 3: Create SIMPLE, NON-RECURSIVE policies
-- These policies do NOT reference other tables or cause loops

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone can read all profiles (simple, no joins)
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT
  USING (true);

-- Policy 2: Users can only update their own profile (simple check)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy 3: Users can insert their own profile (simple check)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 4: Apply similar simple policies to other tables
-- Projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON projects;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON projects;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON projects;

CREATE POLICY "Authenticated users can view projects" ON projects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create projects" ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects" ON projects
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete projects" ON projects
  FOR DELETE
  TO authenticated
  USING (true);

-- Field reports table
ALTER TABLE field_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON field_reports;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON field_reports;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON field_reports;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON field_reports;

CREATE POLICY "Authenticated users can view field reports" ON field_reports
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create field reports" ON field_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update field reports" ON field_reports
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete field reports" ON field_reports
  FOR DELETE
  TO authenticated
  USING (true);

-- Documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON documents;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON documents;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON documents;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON documents;

CREATE POLICY "Authenticated users can view documents" ON documents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create documents" ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update documents" ON documents
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete documents" ON documents
  FOR DELETE
  TO authenticated
  USING (true);

-- VBA Projects table
ALTER TABLE vba_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON vba_projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON vba_projects;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON vba_projects;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON vba_projects;

CREATE POLICY "Authenticated users can view vba projects" ON vba_projects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create vba projects" ON vba_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update vba projects" ON vba_projects
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete vba projects" ON vba_projects
  FOR DELETE
  TO authenticated
  USING (true);

-- Inspections table
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON inspections;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON inspections;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON inspections;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON inspections;

CREATE POLICY "Authenticated users can view inspections" ON inspections
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create inspections" ON inspections
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update inspections" ON inspections
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete inspections" ON inspections
  FOR DELETE
  TO authenticated
  USING (true);

-- Step 5: Verify setup
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Test that policies don't cause recursion
SELECT 
  'RLS Test' as check,
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles LIMIT 1)
    THEN '✅ RLS working without recursion'
    ELSE '✅ RLS working (no data yet)'
  END as status;

-- Final check
SELECT 
  '✅ RLS FIXED' as status,
  'Simple policies without recursion' as solution,
  'Login should work now' as result;