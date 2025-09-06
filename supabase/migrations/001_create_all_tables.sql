-- Create all necessary tables for IPC application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users/Profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  title TEXT,
  phone TEXT,
  company TEXT,
  department TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Organizations table
CREATE TABLE public.organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  license_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  project_type TEXT,
  status TEXT DEFAULT 'active',
  priority TEXT DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  budget DECIMAL,
  organization_id UUID REFERENCES public.organizations(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submittals table
CREATE TABLE public.submittals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  submittal_number TEXT UNIQUE NOT NULL,
  project_name TEXT NOT NULL,
  project_address TEXT,
  applicant TEXT,
  contractor TEXT,
  type TEXT,
  category TEXT CHECK (category IN ('commercial', 'residential', 'industrial')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'revisions_required')),
  jurisdiction TEXT,
  reviewer TEXT,
  completeness INTEGER DEFAULT 0,
  document_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  project_id UUID REFERENCES public.projects(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VBA Projects table
CREATE TABLE public.vba_projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  permit_number TEXT,
  project_type TEXT,
  inspection_phase TEXT,
  status TEXT DEFAULT 'pending',
  inspector_id UUID REFERENCES public.profiles(id),
  scheduled_date DATE,
  completed_date DATE,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field Reports table
CREATE TABLE public.field_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_number TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES public.projects(id),
  location TEXT,
  report_type TEXT,
  weather_conditions TEXT,
  temperature TEXT,
  date_conducted DATE,
  inspector_name TEXT,
  observations TEXT,
  issues_found TEXT,
  recommendations TEXT,
  photos_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT,
  category TEXT,
  tags TEXT[],
  project_id UUID REFERENCES public.projects(id),
  submittal_id UUID REFERENCES public.submittals(id),
  field_report_id UUID REFERENCES public.field_reports(id),
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members table
CREATE TABLE public.team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  role TEXT,
  permissions TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspection Checklists table
CREATE TABLE public.inspection_checklists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vba_project_id UUID REFERENCES public.vba_projects(id),
  name TEXT NOT NULL,
  category TEXT,
  items JSONB,
  completed_items JSONB,
  overall_status TEXT DEFAULT 'pending',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Logs table
CREATE TABLE public.activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Events table
CREATE TABLE public.security_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  user_id UUID REFERENCES public.profiles(id),
  ip_address INET,
  user_agent TEXT,
  additional_data JSONB,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Settings table
CREATE TABLE public.system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_projects_created_by ON public.projects(created_by);
CREATE INDEX idx_projects_organization_id ON public.projects(organization_id);
CREATE INDEX idx_submittals_project_id ON public.submittals(project_id);
CREATE INDEX idx_submittals_created_by ON public.submittals(created_by);
CREATE INDEX idx_field_reports_project_id ON public.field_reports(project_id);
CREATE INDEX idx_documents_project_id ON public.documents(project_id);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);
CREATE INDEX idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submittals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vba_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view projects they have access to" ON public.projects
  FOR SELECT USING (
    auth.uid() = created_by OR 
    auth.uid() IN (SELECT user_id FROM public.team_members WHERE organization_id = projects.organization_id)
  );

CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update projects they created or have access to" ON public.projects
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.uid() IN (SELECT user_id FROM public.team_members WHERE organization_id = projects.organization_id)
  );

-- Similar policies for other tables...
CREATE POLICY "Users can view their submittals" ON public.submittals
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create submittals" ON public.submittals
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their field reports" ON public.field_reports
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create field reports" ON public.field_reports
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their documents" ON public.documents
  FOR SELECT USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can upload documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_submittals_updated_at BEFORE UPDATE ON public.submittals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vba_projects_updated_at BEFORE UPDATE ON public.vba_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_field_reports_updated_at BEFORE UPDATE ON public.field_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inspection_checklists_updated_at BEFORE UPDATE ON public.inspection_checklists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();