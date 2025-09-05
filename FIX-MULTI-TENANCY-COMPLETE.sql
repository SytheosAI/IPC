-- =====================================================
-- COMPLETE MULTI-TENANCY FIX FOR IPC APPLICATION
-- This script implements proper multi-tenancy with organization isolation
-- Run this in Supabase SQL Editor
-- =====================================================

-- PART 1: CREATE ORGANIZATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  -- Company Information
  legal_name TEXT,
  tax_id TEXT,
  license_number TEXT,
  founded_year TEXT,
  company_type TEXT,
  
  -- Contact Information
  main_phone TEXT,
  main_email TEXT,
  support_email TEXT,
  website TEXT,
  
  -- Address Information
  street_address TEXT,
  suite TEXT,
  city TEXT,
  state TEXT DEFAULT 'FL',
  zip_code TEXT,
  country TEXT DEFAULT 'United States',
  
  -- Business Details
  number_of_employees TEXT,
  annual_revenue TEXT,
  primary_industry TEXT,
  
  -- Settings
  timezone TEXT DEFAULT 'America/New_York',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  currency TEXT DEFAULT 'USD',
  language TEXT DEFAULT 'English',
  
  -- Metadata
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PART 2: ADD ORGANIZATION CONTEXT TO PROFILES
-- =====================================================
DO $$ 
BEGIN
  -- Add organization_id to profiles if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- PART 3: ADD ORGANIZATION CONTEXT TO ALL MAIN TABLES
-- =====================================================
DO $$ 
BEGIN
  -- Add organization_id to projects
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' 
    AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE projects 
    ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  -- Add organization_id to vba_projects
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vba_projects' 
    AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE vba_projects 
    ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  -- Add organization_id to field_reports
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'field_reports' 
    AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE field_reports 
    ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  -- Add organization_id to documents
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' 
    AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE documents 
    ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  -- Add organization_id to inspections
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inspections' 
    AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE inspections 
    ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- PART 4: CREATE DEFAULT ORGANIZATION FOR BETA TESTING
-- =====================================================
INSERT INTO organizations (
  name,
  slug,
  legal_name,
  main_email,
  main_phone,
  city,
  state
) VALUES (
  'IPC Beta Organization',
  'ipc-beta',
  'Intelligent Plan Check Beta, LLC',
  'beta@ipcsolutions.com',
  '(239) 555-0100',
  'Fort Myers',
  'FL'
) ON CONFLICT (slug) DO NOTHING;

-- PART 5: MIGRATE EXISTING DATA TO DEFAULT ORGANIZATION
-- =====================================================
DO $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Get the default organization ID
  SELECT id INTO default_org_id 
  FROM organizations 
  WHERE slug = 'ipc-beta' 
  LIMIT 1;

  -- Update all profiles without organization
  UPDATE profiles 
  SET organization_id = default_org_id 
  WHERE organization_id IS NULL;

  -- Update all projects without organization
  UPDATE projects 
  SET organization_id = default_org_id 
  WHERE organization_id IS NULL;

  -- Update all vba_projects without organization
  UPDATE vba_projects 
  SET organization_id = default_org_id 
  WHERE organization_id IS NULL;

  -- Update all field_reports without organization
  UPDATE field_reports 
  SET organization_id = default_org_id 
  WHERE organization_id IS NULL;

  -- Update all documents without organization
  UPDATE documents 
  SET organization_id = default_org_id 
  WHERE organization_id IS NULL;

  -- Update all inspections without organization
  UPDATE inspections 
  SET organization_id = default_org_id 
  WHERE organization_id IS NULL;
END $$;

-- PART 6: CREATE HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Function to get user's organization_id
CREATE OR REPLACE FUNCTION auth.user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id 
  FROM profiles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to check if user belongs to organization
CREATE OR REPLACE FUNCTION auth.has_organization_access(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE user_id = auth.uid() 
    AND organization_id = org_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to get user's role
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT role 
  FROM profiles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PART 7: DROP ALL EXISTING RLS POLICIES
-- =====================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Drop all policies on all tables
  FOR r IN (
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'projects', 'vba_projects', 'field_reports', 'documents', 'inspections', 'organizations')
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
      r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- PART 8: CREATE NEW MULTI-TENANCY RLS POLICIES
-- =====================================================

-- Organizations table policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT
  USING (auth.has_organization_access(id));

CREATE POLICY "Only admins can update organization" ON organizations
  FOR UPDATE
  USING (
    auth.has_organization_access(id) 
    AND auth.user_role() = 'admin'
  );

-- Profiles table policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view profiles in their organization" ON profiles
  FOR SELECT
  USING (
    organization_id = auth.user_organization_id()
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Projects table policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view projects in their organization" ON projects
  FOR SELECT
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Users can create projects in their organization" ON projects
  FOR INSERT
  WITH CHECK (organization_id = auth.user_organization_id());

CREATE POLICY "Users can update projects in their organization" ON projects
  FOR UPDATE
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Admins can delete projects in their organization" ON projects
  FOR DELETE
  USING (
    organization_id = auth.user_organization_id()
    AND auth.user_role() = 'admin'
  );

-- VBA Projects table policies - SIMPLIFIED TO FIX YOUR ISSUE
ALTER TABLE vba_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view VBA projects in their organization" ON vba_projects
  FOR SELECT
  USING (organization_id = auth.user_organization_id());

-- IMPORTANT: Allow ALL authenticated users to create VBA projects for now
-- This fixes your immediate issue
CREATE POLICY "Authenticated users can create VBA projects" ON vba_projects
  FOR INSERT
  WITH CHECK (
    organization_id = auth.user_organization_id()
    OR organization_id IS NULL -- Allow NULL during transition
  );

CREATE POLICY "Users can update VBA projects in their organization" ON vba_projects
  FOR UPDATE
  USING (
    organization_id = auth.user_organization_id()
    OR organization_id IS NULL -- Allow NULL during transition
  );

CREATE POLICY "Admins can delete VBA projects" ON vba_projects
  FOR DELETE
  USING (
    (organization_id = auth.user_organization_id() OR organization_id IS NULL)
    AND auth.user_role() = 'admin'
  );

-- Field Reports table policies
ALTER TABLE field_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view field reports in their organization" ON field_reports
  FOR SELECT
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Users can create field reports in their organization" ON field_reports
  FOR INSERT
  WITH CHECK (organization_id = auth.user_organization_id());

CREATE POLICY "Users can update field reports in their organization" ON field_reports
  FOR UPDATE
  USING (organization_id = auth.user_organization_id());

-- Documents table policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents in their organization" ON documents
  FOR SELECT
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Users can create documents in their organization" ON documents
  FOR INSERT
  WITH CHECK (organization_id = auth.user_organization_id());

CREATE POLICY "Users can update documents in their organization" ON documents
  FOR UPDATE
  USING (organization_id = auth.user_organization_id());

-- Inspections table policies
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view inspections in their organization" ON inspections
  FOR SELECT
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Users can create inspections in their organization" ON inspections
  FOR INSERT
  WITH CHECK (organization_id = auth.user_organization_id());

CREATE POLICY "Users can update inspections in their organization" ON inspections
  FOR UPDATE
  USING (organization_id = auth.user_organization_id());

-- PART 9: CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_organization ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_vba_projects_organization ON vba_projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_field_reports_organization ON field_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_organization ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_inspections_organization ON inspections(organization_id);

-- PART 10: GRANT NECESSARY PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION auth.user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.has_organization_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION auth.user_role() TO authenticated;

-- PART 11: VERIFY THE SETUP
-- =====================================================
DO $$
DECLARE
  org_count INTEGER;
  profile_count INTEGER;
  project_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO org_count FROM organizations;
  SELECT COUNT(*) INTO profile_count FROM profiles WHERE organization_id IS NOT NULL;
  SELECT COUNT(*) INTO project_count FROM projects WHERE organization_id IS NOT NULL;
  
  RAISE NOTICE 'Organizations: %', org_count;
  RAISE NOTICE 'Profiles with organization: %', profile_count;
  RAISE NOTICE 'Projects with organization: %', project_count;
END $$;

-- Final status
SELECT 
  'MULTI-TENANCY IMPLEMENTED' as status,
  'All tables now have organization context' as description,
  'RLS policies simplified to prevent conflicts' as rls_status,
  'VBA projects can now be created by all authenticated users' as immediate_fix;