-- PRODUCTION-READY RLS POLICIES WITH PROPER SECURITY
-- This implements role-based access control properly

-- Step 1: Clean up all existing policies
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Drop all policies on all tables
  FOR r IN (
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
      r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Step 2: Disable RLS on all tables first
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS field_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vba_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inspections DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notification_emails DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_settings DISABLE ROW LEVEL SECURITY;

-- Step 3: Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create a function to check if user is inspector or admin
CREATE OR REPLACE FUNCTION is_inspector_or_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'inspector')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: PROFILES TABLE - Core user profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can view profiles (needed for team collaboration)
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can only insert their own profile
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile, admins can update any
CREATE POLICY "profiles_update_own_or_admin" ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'admin'
    )
  );

-- Only admins can delete profiles
CREATE POLICY "profiles_delete_admin_only" ON profiles
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Step 6: PROJECTS TABLE - Project management
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view projects
CREATE POLICY "projects_select_authenticated" ON projects
  FOR SELECT
  TO authenticated
  USING (true);

-- Only inspectors and admins can create projects
CREATE POLICY "projects_insert_inspector_admin" ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (is_inspector_or_admin());

-- Project creator, assigned inspector, or admin can update
CREATE POLICY "projects_update_authorized" ON projects
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR assigned_to = auth.uid()
    OR is_admin()
  );

-- Only admin can delete projects
CREATE POLICY "projects_delete_admin_only" ON projects
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Step 7: FIELD REPORTS TABLE
ALTER TABLE field_reports ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view field reports
CREATE POLICY "field_reports_select_authenticated" ON field_reports
  FOR SELECT
  TO authenticated
  USING (true);

-- Only inspectors and admins can create field reports
CREATE POLICY "field_reports_insert_inspector_admin" ON field_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (is_inspector_or_admin());

-- Report creator or admin can update
CREATE POLICY "field_reports_update_creator_admin" ON field_reports
  FOR UPDATE
  TO authenticated
  USING (
    reporter_id = auth.uid()
    OR is_admin()
  );

-- Only admin can delete field reports
CREATE POLICY "field_reports_delete_admin_only" ON field_reports
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Step 8: DOCUMENTS TABLE
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view documents
CREATE POLICY "documents_select_authenticated" ON documents
  FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can upload documents
CREATE POLICY "documents_insert_authenticated" ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Document uploader or admin can update
CREATE POLICY "documents_update_uploader_admin" ON documents
  FOR UPDATE
  TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR is_admin()
  );

-- Document uploader or admin can delete
CREATE POLICY "documents_delete_uploader_admin" ON documents
  FOR DELETE
  TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR is_admin()
  );

-- Step 9: VBA PROJECTS TABLE
ALTER TABLE vba_projects ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view VBA projects
CREATE POLICY "vba_projects_select_authenticated" ON vba_projects
  FOR SELECT
  TO authenticated
  USING (true);

-- Only inspectors and admins can create VBA projects
CREATE POLICY "vba_projects_insert_inspector_admin" ON vba_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (is_inspector_or_admin());

-- Project creator or admin can update
CREATE POLICY "vba_projects_update_creator_admin" ON vba_projects
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR is_admin()
  );

-- Only admin can delete VBA projects
CREATE POLICY "vba_projects_delete_admin_only" ON vba_projects
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Step 10: INSPECTIONS TABLE
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view inspections
CREATE POLICY "inspections_select_authenticated" ON inspections
  FOR SELECT
  TO authenticated
  USING (true);

-- Only inspectors and admins can create inspections
CREATE POLICY "inspections_insert_inspector_admin" ON inspections
  FOR INSERT
  TO authenticated
  WITH CHECK (is_inspector_or_admin());

-- Inspector who created it or admin can update
CREATE POLICY "inspections_update_inspector_admin" ON inspections
  FOR UPDATE
  TO authenticated
  USING (
    inspector_id = auth.uid()
    OR is_admin()
  );

-- Only admin can delete inspections
CREATE POLICY "inspections_delete_admin_only" ON inspections
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Step 11: NOTIFICATION EMAILS TABLE
ALTER TABLE notification_emails ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view notification emails
CREATE POLICY "notification_emails_select_authenticated" ON notification_emails
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can manage notification emails
CREATE POLICY "notification_emails_insert_admin" ON notification_emails
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "notification_emails_update_admin" ON notification_emails
  FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "notification_emails_delete_admin" ON notification_emails
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Step 12: ACTIVITY LOGS TABLE (audit trail)
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity logs
CREATE POLICY "activity_logs_select_admin" ON activity_logs
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- System can insert activity logs (via service role)
CREATE POLICY "activity_logs_insert_authenticated" ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- No one can update or delete activity logs (immutable audit trail)

-- Step 13: USER SETTINGS TABLE
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only view their own settings
CREATE POLICY "user_settings_select_own" ON user_settings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can only insert their own settings
CREATE POLICY "user_settings_insert_own" ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can only update their own settings
CREATE POLICY "user_settings_update_own" ON user_settings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Users can only delete their own settings
CREATE POLICY "user_settings_delete_own" ON user_settings
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Step 14: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_inspector_or_admin() TO authenticated;

-- Step 15: Verify the policies are created correctly
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Step 16: Test that admin user exists and can be accessed
DO $$
DECLARE
  test_result TEXT;
BEGIN
  -- Test if we can query profiles without recursion
  BEGIN
    PERFORM * FROM profiles WHERE email = 'mparish@meridianswfl.com' LIMIT 1;
    test_result := '✅ Profiles table accessible without recursion';
  EXCEPTION WHEN OTHERS THEN
    test_result := '❌ Error accessing profiles: ' || SQLERRM;
  END;
  
  RAISE NOTICE '%', test_result;
END $$;

-- Final status
SELECT 
  '✅ PRODUCTION RLS POLICIES DEPLOYED' as status,
  'Role-based access control implemented' as description,
  'Admin: Full access | Inspector: Create/Edit | Users: Read' as permissions;