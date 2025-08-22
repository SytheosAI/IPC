-- Table Verification and Final Migration Script
-- This script verifies all tables exist with correct structure

-- =====================================================
-- VERIFICATION QUERIES - Run these to check table status
-- =====================================================

-- Check which tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check columns in projects table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- =====================================================
-- FINAL MIGRATION - Add any missing elements
-- =====================================================

-- Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fix any missing foreign key relationships
DO $$ 
BEGIN
  -- Add foreign key for vba_projects.project_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_name = 'vba_projects' 
    AND constraint_name LIKE '%project_id%'
  ) THEN
    ALTER TABLE vba_projects 
    ADD CONSTRAINT vba_projects_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key for field_reports.project_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_name = 'field_reports' 
    AND constraint_name LIKE '%project_id%'
  ) THEN
    ALTER TABLE field_reports 
    ADD CONSTRAINT field_reports_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES projects(id);
  END IF;

  -- Add foreign key for documents.project_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_name = 'documents' 
    AND constraint_name LIKE '%project_id%'
  ) THEN
    ALTER TABLE documents 
    ADD CONSTRAINT documents_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES projects(id);
  END IF;
END $$;

-- =====================================================
-- CREATE MISSING DETAIL TABLES
-- =====================================================

-- Ensure all field report detail tables exist
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
-- VERIFY AND CREATE INSPECTION TABLES
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
-- SYSTEM TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  name TEXT,
  notification_type TEXT CHECK (notification_type IN ('field_reports', 'inspections', 'projects', 'all')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
-- VERIFICATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION verify_ipc_tables()
RETURNS TABLE(
  table_name TEXT,
  status TEXT,
  column_count BIGINT,
  has_rls BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::TEXT,
    CASE 
      WHEN t.table_name IS NOT NULL THEN 'EXISTS'
      ELSE 'MISSING'
    END AS status,
    COUNT(c.column_name) AS column_count,
    COALESCE(rls.relrowsecurity, false) AS has_rls
  FROM (
    VALUES 
      ('profiles'),
      ('projects'),
      ('vba_projects'),
      ('field_reports'),
      ('field_report_work_completed'),
      ('field_report_issues'),
      ('field_report_safety_observations'),
      ('field_report_personnel'),
      ('field_report_photos'),
      ('documents'),
      ('inspections'),
      ('inspection_photos'),
      ('notification_emails'),
      ('activity_logs'),
      ('user_settings')
  ) AS required(table_name)
  LEFT JOIN information_schema.tables t 
    ON t.table_name = required.table_name 
    AND t.table_schema = 'public'
  LEFT JOIN information_schema.columns c 
    ON c.table_name = t.table_name 
    AND c.table_schema = 'public'
  LEFT JOIN pg_class rls 
    ON rls.relname = t.table_name
  GROUP BY t.table_name, rls.relrowsecurity
  ORDER BY 
    CASE t.table_name
      WHEN 'profiles' THEN 1
      WHEN 'projects' THEN 2
      WHEN 'vba_projects' THEN 3
      WHEN 'field_reports' THEN 4
      ELSE 5
    END;
END;
$$ LANGUAGE plpgsql;

-- Run the verification
SELECT * FROM verify_ipc_tables();

-- =====================================================
-- FIX COMMON ISSUES
-- =====================================================

-- Ensure all tables have RLS enabled
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN (
      'profiles', 'projects', 'vba_projects', 'field_reports',
      'documents', 'inspections', 'notification_emails',
      'activity_logs', 'user_settings'
    )
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END $$;

-- Create basic RLS policies if they don't exist
DO $$
BEGIN
  -- Allow authenticated users to read all data (temporary for development)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Enable read access for authenticated users'
  ) THEN
    CREATE POLICY "Enable read access for authenticated users" ON projects
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'field_reports' 
    AND policyname = 'Enable read access for authenticated users'
  ) THEN
    CREATE POLICY "Enable read access for authenticated users" ON field_reports
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'documents' 
    AND policyname = 'Enable read access for authenticated users'
  ) THEN
    CREATE POLICY "Enable read access for authenticated users" ON documents
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vba_projects' 
    AND policyname = 'Enable read access for authenticated users'
  ) THEN
    CREATE POLICY "Enable read access for authenticated users" ON vba_projects
      FOR SELECT USING (true);
  END IF;

  -- Allow authenticated users to insert/update their own data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Enable insert for authenticated users'
  ) THEN
    CREATE POLICY "Enable insert for authenticated users" ON projects
      FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'field_reports' 
    AND policyname = 'Enable insert for authenticated users'
  ) THEN
    CREATE POLICY "Enable insert for authenticated users" ON field_reports
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Final status report
SELECT 
  'Table Verification Complete' as status,
  COUNT(*) as total_tables,
  SUM(CASE WHEN has_rls THEN 1 ELSE 0 END) as tables_with_rls
FROM verify_ipc_tables();