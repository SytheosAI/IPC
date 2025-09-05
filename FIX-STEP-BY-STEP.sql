-- STEP BY STEP FIX - DO EACH SECTION ONE AT A TIME

-- ========================================
-- SECTION 1: CREATE ORGANIZATIONS TABLE FIRST
-- ========================================
CREATE TABLE IF NOT EXISTS organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default organization for beta testing
INSERT INTO organizations (id, name) 
VALUES ('11111111-1111-1111-1111-111111111111', 'IPC Beta Organization')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- SECTION 2: ADD ORGANIZATION_ID TO PROFILES
-- ========================================
DO $$ 
BEGIN
    -- Check if column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' 
                  AND column_name = 'organization_id') THEN
        ALTER TABLE profiles ADD COLUMN organization_id UUID;
    END IF;
END $$;

-- Set default organization for existing profiles
UPDATE profiles 
SET organization_id = '11111111-1111-1111-1111-111111111111'::uuid 
WHERE organization_id IS NULL;

-- Now add the foreign key
ALTER TABLE profiles 
ADD CONSTRAINT fk_profiles_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id)
ON DELETE CASCADE;

-- ========================================
-- SECTION 3: FIX VBA_PROJECTS TABLE
-- ========================================
-- First check if vba_projects exists
DO $$ 
BEGIN
    -- Add organization_id if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_name = 'vba_projects') THEN
        
        -- Add organization_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'vba_projects' 
                      AND column_name = 'organization_id') THEN
            ALTER TABLE vba_projects ADD COLUMN organization_id UUID;
        END IF;
        
        -- Set default organization for existing projects
        UPDATE vba_projects 
        SET organization_id = '11111111-1111-1111-1111-111111111111'::uuid 
        WHERE organization_id IS NULL;
        
    ELSE
        -- Create the table if it doesn't exist
        CREATE TABLE vba_projects (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'active',
            organization_id UUID NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid,
            created_by UUID REFERENCES auth.users(id),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- Add foreign key constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                  WHERE constraint_name = 'fk_vba_projects_organization') THEN
        ALTER TABLE vba_projects 
        ADD CONSTRAINT fk_vba_projects_organization 
        FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- ========================================
-- SECTION 4: DISABLE OLD RLS AND CREATE NEW
-- ========================================
-- Disable RLS temporarily
ALTER TABLE vba_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on vba_projects
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'vba_projects' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON vba_projects', pol.policyname);
    END LOOP;
END $$;

-- Create simple non-recursive helper function
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT organization_id 
    FROM profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
$$;

-- Create simple RLS policies for vba_projects
CREATE POLICY "Users can view their organization's projects"
ON vba_projects FOR SELECT
USING (
    organization_id = get_user_organization_id()
    OR auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin')
);

CREATE POLICY "Users can create projects for their organization"
ON vba_projects FOR INSERT
WITH CHECK (
    organization_id = get_user_organization_id()
    OR auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin')
);

CREATE POLICY "Users can update their organization's projects"
ON vba_projects FOR UPDATE
USING (
    organization_id = get_user_organization_id()
    OR auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin')
);

CREATE POLICY "Admins can delete projects"
ON vba_projects FOR DELETE
USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin')
);

-- Enable RLS
ALTER TABLE vba_projects ENABLE ROW LEVEL SECURITY;

-- ========================================
-- SECTION 5: CREATE OTHER REQUIRED TABLES
-- ========================================

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    organization_id UUID NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid REFERENCES organizations(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Field Reports table
CREATE TABLE IF NOT EXISTS field_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    project_id UUID REFERENCES projects(id),
    organization_id UUID NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid REFERENCES organizations(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submittals table
CREATE TABLE IF NOT EXISTS submittals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    project_id UUID REFERENCES projects(id),
    organization_id UUID NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid REFERENCES organizations(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts table  
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    organization_id UUID NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid REFERENCES organizations(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Settings table
CREATE TABLE IF NOT EXISTS organization_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id),
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- SECTION 6: CREATE INDEXES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_vba_projects_organization ON vba_projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_organization ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_field_reports_organization ON field_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_submittals_organization ON submittals(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_organization ON contacts(organization_id);

-- ========================================
-- SECTION 7: VERIFY EVERYTHING WORKS
-- ========================================
SELECT 
    'Setup Complete!' as status,
    (SELECT COUNT(*) FROM organizations) as organizations_count,
    (SELECT COUNT(*) FROM information_schema.columns WHERE column_name = 'organization_id') as tables_with_org_id;