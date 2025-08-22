-- Supabase Migration Script for IPC Application
-- This script checks for existing tables before creating them

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'inspector',
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  company TEXT,
  license_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- VBA PROJECTS TABLE (Create if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS vba_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  project_number TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT DEFAULT 'FL',
  contractor TEXT,
  owner TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'completed', 'on-hold')),
  start_date DATE,
  completion_date DATE,
  inspection_count INTEGER DEFAULT 0,
  last_inspection_date DATE,
  compliance_score INTEGER DEFAULT 100,
  virtual_inspector_enabled BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FIELD REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS field_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_number TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id),
  project_name TEXT NOT NULL,
  project_address TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('Safety', 'Progress', 'Quality', 'Incident', 'Daily', 'Weekly', 'Inspection')),
  report_date DATE NOT NULL,
  report_time TIME,
  reported_by TEXT NOT NULL,
  reporter_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  weather_temperature INTEGER,
  weather_conditions TEXT,
  weather_wind_speed INTEGER,
  signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FIELD REPORT DETAILS TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS field_report_work_completed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES field_reports(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS field_report_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES field_reports(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('minor', 'major', 'critical')),
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS field_report_safety_observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES field_reports(id) ON DELETE CASCADE,
  observation TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS field_report_personnel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES field_reports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  hours DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS field_report_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES field_reports(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  category TEXT CHECK (category IN ('before', 'during', 'after', 'issue', 'safety', 'general')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_index INTEGER DEFAULT 0
);

-- =====================================================
-- DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  file_type TEXT,
  category TEXT CHECK (category IN ('Permits', 'Plans', 'Reports', 'Inspections', 'Contracts', 'Correspondence', 'Other')),
  project_name TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_by_name TEXT,
  file_size TEXT,
  file_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'pending_review')),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INSPECTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vba_project_id UUID REFERENCES vba_projects(id) ON DELETE CASCADE,
  inspection_number TEXT UNIQUE NOT NULL,
  inspection_type TEXT NOT NULL,
  inspection_date DATE NOT NULL,
  inspection_time TIME,
  inspector_id UUID REFERENCES profiles(id),
  inspector_name TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed', 'passed')),
  result TEXT CHECK (result IN ('pass', 'fail', 'partial', 'pending')),
  notes TEXT,
  checklist JSONB,
  compliance_score INTEGER,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INSPECTION PHOTOS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inspection_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  vba_project_id UUID REFERENCES vba_projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  category TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_index INTEGER DEFAULT 0
);

-- =====================================================
-- NOTIFICATION EMAILS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  name TEXT,
  notification_type TEXT CHECK (notification_type IN ('field_reports', 'inspections', 'projects', 'all')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ACTIVITY LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'light',
  notifications JSONB DEFAULT '{"email": true, "push": false, "sms": false}',
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'America/New_York',
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES (IF NOT EXISTS)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_permit_number ON projects(permit_number);
CREATE INDEX IF NOT EXISTS idx_field_reports_project_id ON field_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_field_reports_report_date ON field_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_field_reports_status ON field_reports(status);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_inspections_vba_project_id ON inspections(vba_project_id);
CREATE INDEX IF NOT EXISTS idx_inspections_date ON inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (if not already enabled)
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE vba_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE OR REPLACE FUNCTION FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE TRIGGERS (DROP IF EXISTS, THEN CREATE)
-- =====================================================
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vba_projects_updated_at ON vba_projects;
CREATE TRIGGER update_vba_projects_updated_at BEFORE UPDATE ON vba_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_field_reports_updated_at ON field_reports;
CREATE TRIGGER update_field_reports_updated_at BEFORE UPDATE ON field_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inspections_updated_at ON inspections;
CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ADD MISSING COLUMNS TO EXISTING PROJECTS TABLE
-- =====================================================
-- Check if columns exist before adding them
DO $$ 
BEGIN
  -- Add total_issues column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'projects' AND column_name = 'total_issues') THEN
    ALTER TABLE projects ADD COLUMN total_issues INTEGER DEFAULT 0;
  END IF;
  
  -- Add total_conditions column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'projects' AND column_name = 'total_conditions') THEN
    ALTER TABLE projects ADD COLUMN total_conditions INTEGER DEFAULT 0;
  END IF;
  
  -- Add total_notes column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'projects' AND column_name = 'total_notes') THEN
    ALTER TABLE projects ADD COLUMN total_notes INTEGER DEFAULT 0;
  END IF;
  
  -- Add assigned_to column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'projects' AND column_name = 'assigned_to') THEN
    ALTER TABLE projects ADD COLUMN assigned_to UUID REFERENCES profiles(id);
  END IF;
  
  -- Add created_by column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'projects' AND column_name = 'created_by') THEN
    ALTER TABLE projects ADD COLUMN created_by UUID REFERENCES profiles(id);
  END IF;
END $$;

-- =====================================================
-- BASIC RLS POLICIES (Create if not exists)
-- =====================================================
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "All authenticated users can view projects" ON projects;
DROP POLICY IF EXISTS "All authenticated users can view field reports" ON field_reports;
DROP POLICY IF EXISTS "Users can create field reports" ON field_reports;
DROP POLICY IF EXISTS "All authenticated users can view documents" ON documents;

-- Create new policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "All authenticated users can view projects" ON projects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can view field reports" ON field_reports
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create field reports" ON field_reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can view documents" ON documents
  FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;