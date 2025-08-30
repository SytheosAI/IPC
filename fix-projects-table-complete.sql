-- =====================================================
-- FIX PROJECTS TABLE - Add all missing columns
-- Run this in Supabase SQL Editor
-- =====================================================

-- First, let's see what columns currently exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' AND table_schema = 'public';

-- Add all missing columns that the application expects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS permit_number TEXT,
ADD COLUMN IF NOT EXISTS project_name TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'FL',
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS applicant TEXT,
ADD COLUMN IF NOT EXISTS applicant_email TEXT,
ADD COLUMN IF NOT EXISTS applicant_phone TEXT,
ADD COLUMN IF NOT EXISTS project_type TEXT,
ADD COLUMN IF NOT EXISTS submitted_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS total_issues INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_conditions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_notes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS assigned_to UUID,
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update the status column to have proper constraints if needed
DO $$ 
BEGIN
  -- Check if constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'projects_status_check'
  ) THEN
    ALTER TABLE projects 
    ADD CONSTRAINT projects_status_check 
    CHECK (status IN ('intake', 'in_review', 'approved', 'rejected', 'issued'));
  END IF;
END $$;

-- Make permit_number unique if it isn't already
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'projects' 
    AND indexname = 'projects_permit_number_key'
  ) THEN
    ALTER TABLE projects 
    ADD CONSTRAINT projects_permit_number_key UNIQUE (permit_number);
  END IF;
END $$;

-- Verify all columns are now present
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test insert to make sure everything works
-- INSERT INTO projects (
--   permit_number,
--   project_name,
--   address,
--   city,
--   applicant,
--   applicant_email,
--   applicant_phone,
--   project_type,
--   status
-- ) VALUES (
--   'TEST-2024-001',
--   'Test Project',
--   '123 Main St',
--   'Fort Myers',
--   'John Doe',
--   'john@example.com',
--   '555-1234',
--   'commercial',
--   'intake'
-- );

-- If the test insert worked, delete it
-- DELETE FROM projects WHERE permit_number = 'TEST-2024-001';