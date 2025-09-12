-- Add missing columns to both tables
-- For vba_projects table - add permit_number if it doesn't exist
ALTER TABLE vba_projects 
ADD COLUMN IF NOT EXISTS permit_number TEXT;

-- For projects table - add project_number if it doesn't exist  
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS project_number TEXT;

-- Update vba_projects to copy project_number to permit_number where permit_number is null
UPDATE vba_projects 
SET permit_number = project_number 
WHERE permit_number IS NULL AND project_number IS NOT NULL;

-- Update projects to copy permit_number to project_number where project_number is null
UPDATE projects
SET project_number = permit_number
WHERE project_number IS NULL AND permit_number IS NOT NULL;