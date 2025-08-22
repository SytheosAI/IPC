-- =====================================================
-- FIX DATABASE SETUP - Handle existing tables gracefully
-- =====================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CREATE TABLES ONLY IF THEY DON'T EXIST
-- =====================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
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

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  permit_number TEXT UNIQUE NOT NULL,
  project_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT DEFAULT 'FL',
  zip_code TEXT,
  applicant TEXT,
  applicant_email TEXT,
  applicant_phone TEXT,
  project_type TEXT,
  status TEXT DEFAULT 'intake',
  submitted_date DATE DEFAULT CURRENT_DATE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_issues INTEGER DEFAULT 0,
  total_conditions INTEGER DEFAULT 0,
  total_notes INTEGER DEFAULT 0,
  assigned_to UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VBA Projects table
CREATE TABLE IF NOT EXISTS vba_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_number TEXT,
  project_name TEXT NOT NULL,
  address TEXT NOT NULL,
  inspection_type TEXT,
  status TEXT DEFAULT 'scheduled',
  scheduled_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  inspector TEXT,
  completion_rate INTEGER DEFAULT 0,
  compliance_score INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  virtual_inspector_enabled BOOLEAN DEFAULT false,
  gps_location JSONB,
  photo_count INTEGER DEFAULT 0,
  violations INTEGER DEFAULT 0,
  ai_confidence INTEGER,
  selected_inspections TEXT[],
  owner TEXT,
  contractor TEXT,
  project_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field Reports table
CREATE TABLE IF NOT EXISTS field_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_number TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id),
  project_name TEXT NOT NULL,
  project_address TEXT NOT NULL,
  report_type TEXT NOT NULL,
  report_date DATE NOT NULL,
  report_time TIME,
  reported_by TEXT NOT NULL,
  reporter_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'draft',
  priority TEXT DEFAULT 'medium',
  weather_temperature INTEGER,
  weather_conditions TEXT,
  weather_wind_speed INTEGER,
  signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_size INTEGER,
  file_type TEXT,
  category TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  tags TEXT[],
  version INTEGER DEFAULT 1,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspections table
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vba_project_id UUID REFERENCES vba_projects(id),
  inspection_type TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  inspector_id UUID REFERENCES profiles(id),
  inspector_name TEXT,
  status TEXT DEFAULT 'scheduled',
  compliance_score INTEGER,
  notes TEXT,
  violations_found INTEGER DEFAULT 0,
  photos TEXT[],
  weather_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field Report Work Completed table
CREATE TABLE IF NOT EXISTS field_report_work_completed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES field_reports(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field Report Issues table
CREATE TABLE IF NOT EXISTS field_report_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES field_reports(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field Report Safety Observations table
CREATE TABLE IF NOT EXISTS field_report_safety_observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES field_reports(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  hazard_level TEXT DEFAULT 'low',
  action_taken TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field Report Personnel table
CREATE TABLE IF NOT EXISTS field_report_personnel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES field_reports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  trade TEXT,
  hours_worked DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field Report Photos table
CREATE TABLE IF NOT EXISTS field_report_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES field_reports(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspection Photos table
CREATE TABLE IF NOT EXISTS inspection_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  violation_related BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Emails table
CREATE TABLE IF NOT EXISTS notification_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  name TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL,
  profile JSONB,
  notifications JSONB,
  security JSONB,
  theme JSONB,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ADD MISSING COLUMNS TO EXISTING TABLES (SAFE)
-- =====================================================

-- Add columns to vba_projects if they don't exist
DO $$ 
BEGIN
  -- Add job_number if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vba_projects' AND column_name = 'job_number') THEN
    ALTER TABLE vba_projects ADD COLUMN job_number TEXT;
  END IF;
  
  -- Add selected_inspections if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vba_projects' AND column_name = 'selected_inspections') THEN
    ALTER TABLE vba_projects ADD COLUMN selected_inspections TEXT[];
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error adding columns to vba_projects: %', SQLERRM;
END $$;

-- =====================================================
-- DISABLE RLS FOR DEVELOPMENT (TEMPORARY)
-- =====================================================

-- Disable RLS on all tables for development
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
  LOOP
    EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
    RAISE NOTICE 'Disabled RLS on table: %', r.tablename;
  END LOOP;
END $$;

-- =====================================================
-- CREATE BASIC POLICIES (FOR WHEN RLS IS ENABLED)
-- =====================================================

-- Allow all operations for authenticated users (development only)
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY['projects', 'vba_projects', 'field_reports', 'documents', 'inspections', 'activity_logs', 'user_settings', 'notification_emails'];
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    -- Drop existing policies
    EXECUTE format('DROP POLICY IF EXISTS "Enable all for authenticated" ON %I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Enable read for anon" ON %I', tbl);
    
    -- Create new policies (when RLS is enabled)
    -- These won't be active until RLS is enabled
    EXECUTE format('CREATE POLICY "Enable all for authenticated" ON %I FOR ALL USING (true)', tbl);
    EXECUTE format('CREATE POLICY "Enable read for anon" ON %I FOR SELECT USING (true)', tbl);
    
    RAISE NOTICE 'Created policies for table: %', tbl;
  END LOOP;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating policies: %', SQLERRM;
END $$;

-- =====================================================
-- VERIFY SETUP
-- =====================================================

-- List all tables
SELECT 'Tables created:' as status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Show table counts
SELECT 'Table row counts:' as status;
SELECT 
  'projects' as table_name, COUNT(*) as row_count FROM projects
UNION ALL
SELECT 
  'vba_projects' as table_name, COUNT(*) as row_count FROM vba_projects
UNION ALL
SELECT 
  'field_reports' as table_name, COUNT(*) as row_count FROM field_reports
UNION ALL
SELECT 
  'documents' as table_name, COUNT(*) as row_count FROM documents
UNION ALL
SELECT 
  'inspections' as table_name, COUNT(*) as row_count FROM inspections;

-- Success message
SELECT 'Database setup completed successfully!' as message;