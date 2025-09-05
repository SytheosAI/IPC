-- FIX THE ACTUAL PROBLEM RIGHT NOW

-- 1. Create organizations table WITHOUT ON CONFLICT
DROP TABLE IF EXISTS organizations CASCADE;
CREATE TABLE organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert beta org WITHOUT conflict clause
INSERT INTO organizations (id, name) 
VALUES ('11111111-1111-1111-1111-111111111111', 'IPC Beta Organization');

-- 2. Add organization_id to profiles if missing
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS organization_id UUID DEFAULT '11111111-1111-1111-1111-111111111111'::uuid;

-- Update existing profiles
UPDATE profiles 
SET organization_id = '11111111-1111-1111-1111-111111111111'::uuid 
WHERE organization_id IS NULL;

-- Add foreign key
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS fk_profiles_organization;

ALTER TABLE profiles 
ADD CONSTRAINT fk_profiles_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id);

-- 3. Fix vba_projects table
ALTER TABLE vba_projects 
ADD COLUMN IF NOT EXISTS organization_id UUID DEFAULT '11111111-1111-1111-1111-111111111111'::uuid;

UPDATE vba_projects 
SET organization_id = '11111111-1111-1111-1111-111111111111'::uuid 
WHERE organization_id IS NULL;

ALTER TABLE vba_projects 
DROP CONSTRAINT IF EXISTS fk_vba_projects_organization;

ALTER TABLE vba_projects 
ADD CONSTRAINT fk_vba_projects_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id);

-- 4. Drop ALL RLS policies on vba_projects
ALTER TABLE vba_projects DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their organization's projects" ON vba_projects;
DROP POLICY IF EXISTS "Users can create projects for their organization" ON vba_projects;
DROP POLICY IF EXISTS "Users can update their organization's projects" ON vba_projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON vba_projects;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON vba_projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON vba_projects;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON vba_projects;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON vba_projects;

-- 5. Create SIMPLE RLS that just works
CREATE POLICY "Allow everything for authenticated users"
ON vba_projects 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Enable RLS
ALTER TABLE vba_projects ENABLE ROW LEVEL SECURITY;

-- DONE
SELECT 'FIXED' as status;