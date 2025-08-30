-- Add missing columns to projects table
-- These columns are needed for the project creation form

-- Add applicant column if it doesn't exist
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS applicant TEXT;

-- Add applicant_email column if it doesn't exist
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS applicant_email TEXT;

-- Add applicant_phone column if it doesn't exist
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS applicant_phone TEXT;

-- Add project_type column if it doesn't exist
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS project_type TEXT;

-- Add state column with default value if it doesn't exist
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'FL';

-- Add zip_code column if it doesn't exist
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- Verify the columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
  AND table_schema = 'public'
ORDER BY ordinal_position;