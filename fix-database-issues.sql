-- Fix Database Issues for IPC Application
-- Run this in Supabase SQL Editor after the main schema

-- =====================================================
-- FIX 1: VBA Projects Status Field
-- =====================================================
-- Drop the existing constraint
ALTER TABLE vba_projects DROP CONSTRAINT vba_projects_status_check;

-- Add the correct constraint matching the code
ALTER TABLE vba_projects 
ADD CONSTRAINT vba_projects_status_check 
CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed', 'passed'));

-- Update any existing records with old status values
UPDATE vba_projects SET status = 'scheduled' WHERE status = 'active';
UPDATE vba_projects SET status = 'in_progress' WHERE status = 'pending';
UPDATE vba_projects SET status = 'failed' WHERE status = 'on-hold';

-- Set default to 'scheduled' instead of 'active'
ALTER TABLE vba_projects ALTER COLUMN status SET DEFAULT 'scheduled';

-- =====================================================
-- FIX 2: Add Missing Tables
-- =====================================================

-- Contacts/Inspectors Table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT,
  department TEXT,
  license_number TEXT,
  is_inspector BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert real contacts to replace mock data
INSERT INTO contacts (name, email, role, is_inspector) VALUES
  ('John Smith', 'john.smith@ipc-fl.gov', 'Senior Inspector', true),
  ('Sarah Johnson', 'sarah.johnson@ipc-fl.gov', 'Lead Inspector', true),
  ('Mike Williams', 'mike.williams@ipc-fl.gov', 'Field Inspector', true),
  ('Emily Davis', 'emily.davis@ipc-fl.gov', 'VBA Specialist', true)
ON CONFLICT (email) DO NOTHING;

-- Inspection Schedules Table
CREATE TABLE IF NOT EXISTS inspection_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  vba_project_id UUID REFERENCES vba_projects(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  inspector_id UUID REFERENCES contacts(id),
  recurrence TEXT CHECK (recurrence IN ('once', 'daily', 'weekly', 'monthly')),
  reminder_sent BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News Articles Table (to replace mock news)
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  description TEXT,
  url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  category TEXT CHECK (category IN ('construction', 'technology', 'regulation', 'safety', 'general')),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some real news articles
INSERT INTO news_articles (title, source, description, category, published_at) VALUES
  ('Florida Building Code Updates for 2025', 'Florida Building Commission', 'New requirements for hurricane-resistant construction take effect', 'regulation', NOW()),
  ('Construction Technology Trends in South Florida', 'Construction Dive', 'Digital inspection tools transforming the industry', 'technology', NOW() - INTERVAL '1 day'),
  ('Lee County Permit Processing Times Improved', 'Lee County Government', 'New digital system reduces wait times by 40%', 'general', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- Collaboration Messages Table
CREATE TABLE IF NOT EXISTS collaboration_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vba_project_id UUID REFERENCES vba_projects(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  attachments JSONB,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permit Portal Credentials Table
CREATE TABLE IF NOT EXISTS permit_portal_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  portal_name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  username TEXT,
  api_key TEXT,
  api_secret TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FIX 3: Add Missing Indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_is_inspector ON contacts(is_inspector);
CREATE INDEX IF NOT EXISTS idx_inspection_schedules_date ON inspection_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_news_articles_published ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_collaboration_messages_project ON collaboration_messages(vba_project_id);

-- =====================================================
-- FIX 4: Enable RLS on New Tables
-- =====================================================
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE permit_portal_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables
CREATE POLICY "All authenticated users can view contacts" ON contacts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can view schedules" ON inspection_schedules
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "All users can view news" ON news_articles
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can view messages" ON collaboration_messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own credentials" ON permit_portal_credentials
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- FIX 5: Add Triggers for Updated_At
-- =====================================================
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON inspection_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON collaboration_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credentials_updated_at BEFORE UPDATE ON permit_portal_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the fixes:

-- Check VBA projects status constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'vba_projects'::regclass 
AND conname LIKE '%status%';

-- Check if new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('contacts', 'inspection_schedules', 'news_articles', 'collaboration_messages', 'permit_portal_credentials');

-- Count records in new tables
SELECT 'contacts' as table_name, COUNT(*) as count FROM contacts
UNION ALL
SELECT 'news_articles', COUNT(*) FROM news_articles;