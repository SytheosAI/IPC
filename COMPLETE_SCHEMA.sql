-- =====================================================
-- COMPLETE SCHEMA FOR IPC APPLICATION
-- This file contains ALL missing tables identified from gap analysis
-- Run this AFTER the main supabase-schema.sql
-- =====================================================

-- =====================================================
-- SUBMITTALS (Missing from current schema)
-- =====================================================
CREATE TABLE submittals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submittal_number TEXT UNIQUE NOT NULL,
  project_name TEXT NOT NULL,
  project_address TEXT NOT NULL,
  applicant TEXT NOT NULL,
  contractor TEXT,
  type TEXT NOT NULL, -- Building, Electrical, Plumbing, Mechanical, etc.
  category TEXT CHECK (category IN ('commercial', 'residential', 'industrial')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'revisions_required')),
  date_submitted DATE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewer TEXT,
  reviewer_id UUID REFERENCES profiles(id),
  jurisdiction TEXT NOT NULL,
  jurisdiction_id TEXT, -- External tracking number from jurisdiction
  tracking_number TEXT, -- External tracking number
  completeness INTEGER DEFAULT 0,
  documents_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submittal Documents
CREATE TABLE submittal_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submittal_id UUID REFERENCES submittals(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT,
  file_url TEXT,
  file_size TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submittal Comments
CREATE TABLE submittal_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submittal_id UUID REFERENCES submittals(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  comment_type TEXT CHECK (comment_type IN ('review', 'revision', 'approval', 'rejection', 'general')),
  created_by UUID REFERENCES profiles(id),
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORGANIZATION (Missing from current schema)
-- =====================================================
CREATE TABLE organization (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Company Information
  company_name TEXT NOT NULL,
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
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'United States',
  
  -- Business Details
  number_of_employees TEXT,
  annual_revenue TEXT,
  primary_industry TEXT,
  secondary_industries TEXT[],
  certifications TEXT[],
  
  -- Billing Information
  billing_address TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_zip TEXT,
  payment_method TEXT,
  billing_email TEXT,
  
  -- System Settings
  timezone TEXT DEFAULT 'America/New_York',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  currency TEXT DEFAULT 'USD',
  language TEXT DEFAULT 'English',
  
  -- Metadata
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization Compliance & Certifications
CREATE TABLE organization_compliance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  certification_name TEXT NOT NULL,
  certification_number TEXT,
  issuing_body TEXT,
  issue_date DATE,
  expiry_date DATE,
  status TEXT CHECK (status IN ('active', 'expired', 'pending_renewal')),
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MEMBERS / TEAM (Enhanced from profiles)
-- =====================================================
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company TEXT,
  role TEXT NOT NULL,
  folder TEXT CHECK (folder IN ('team', 'residents', 'contractors', 'design')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  department TEXT,
  title TEXT,
  joined_date DATE DEFAULT CURRENT_DATE,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  avatar_url TEXT,
  permissions JSONB DEFAULT '{}',
  emergency_contact TEXT,
  emergency_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Member Messages/Communications
CREATE TABLE member_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_member_id UUID REFERENCES members(id),
  to_member_id UUID REFERENCES members(id),
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  starred BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROJECT CONTROL CENTER ADDITIONS
-- =====================================================

-- Project Contacts (for control center)
CREATE TABLE project_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Folders (for control center document organization)
CREATE TABLE project_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  folder_name TEXT NOT NULL,
  folder_type TEXT CHECK (folder_type IN ('plans', 'specs', 'contacts', 'permits', 'inspections', 'field')),
  parent_folder_id UUID REFERENCES project_folders(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Files (enhanced document management)
CREATE TABLE project_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES project_folders(id),
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size TEXT,
  file_url TEXT,
  version INTEGER DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_by_name TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Metrics (for control center dashboard)
CREATE TABLE project_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  permit_submittal_date DATE,
  permit_approval_date DATE,
  review_status TEXT,
  open_comments INTEGER DEFAULT 0,
  total_inspections INTEGER DEFAULT 0,
  passed_inspections INTEGER DEFAULT 0,
  failed_inspections INTEGER DEFAULT 0,
  pending_inspections INTEGER DEFAULT 0,
  next_inspection_date DATE,
  completion_percentage INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INSPECTION SCHEDULES (for VBA)
-- =====================================================
CREATE TABLE inspection_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vba_project_id UUID REFERENCES vba_projects(id) ON DELETE CASCADE,
  inspection_type TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  inspector_id UUID REFERENCES profiles(id),
  inspector_name TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  duration_hours DECIMAL(3,1),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- VBA CONTACTS (for VBA projects)
-- =====================================================
CREATE TABLE vba_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vba_project_id UUID REFERENCES vba_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  phone TEXT,
  email TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- JURISDICTION API CONFIGURATIONS
-- =====================================================
CREATE TABLE jurisdiction_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jurisdiction_name TEXT UNIQUE NOT NULL,
  api_url TEXT,
  webhook_url TEXT,
  api_key_encrypted TEXT, -- Store encrypted
  auth_type TEXT CHECK (auth_type IN ('api_key', 'oauth', 'basic', 'none')),
  supported_methods TEXT[],
  requires_manual_submission BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ADDITIONAL INDEXES
-- =====================================================
CREATE INDEX idx_submittals_status ON submittals(status);
CREATE INDEX idx_submittals_jurisdiction ON submittals(jurisdiction);
CREATE INDEX idx_submittals_submittal_number ON submittals(submittal_number);
CREATE INDEX idx_members_folder ON members(folder);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_project_contacts_project_id ON project_contacts(project_id);
CREATE INDEX idx_project_files_project_id ON project_files(project_id);
CREATE INDEX idx_project_files_folder_id ON project_files(folder_id);
CREATE INDEX idx_inspection_schedules_date ON inspection_schedules(scheduled_date);
CREATE INDEX idx_inspection_schedules_vba_project ON inspection_schedules(vba_project_id);

-- =====================================================
-- ROW LEVEL SECURITY FOR NEW TABLES
-- =====================================================
ALTER TABLE submittals ENABLE ROW LEVEL SECURITY;
ALTER TABLE submittal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE submittal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE vba_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE jurisdiction_configs ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies for new tables
CREATE POLICY "All authenticated users can view submittals" ON submittals
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can create submittals" ON submittals
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can view organization" ON organization
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can update organization" ON organization
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  ));

CREATE POLICY "All authenticated users can view members" ON members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own messages" ON member_messages
  FOR SELECT USING (
    from_member_id IN (SELECT id FROM members WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
    OR 
    to_member_id IN (SELECT id FROM members WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  );

-- =====================================================
-- TRIGGERS FOR NEW TABLES
-- =====================================================
CREATE TRIGGER update_submittals_updated_at BEFORE UPDATE ON submittals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_updated_at BEFORE UPDATE ON organization
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_metrics_updated_at BEFORE UPDATE ON project_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspection_schedules_updated_at BEFORE UPDATE ON inspection_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jurisdiction_configs_updated_at BEFORE UPDATE ON jurisdiction_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA INSERTION (Optional - for testing)
-- =====================================================

-- Insert default organization record
INSERT INTO organization (
  company_name,
  legal_name,
  main_email,
  main_phone,
  city,
  state
) VALUES (
  'IPC Solutions',
  'Intelligent Plan Check Solutions, Inc.',
  'info@ipcsolutions.com',
  '(239) 555-0100',
  'Fort Myers',
  'FL'
) ON CONFLICT DO NOTHING;