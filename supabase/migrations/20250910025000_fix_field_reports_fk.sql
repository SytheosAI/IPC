-- Make project_id nullable and remove the foreign key constraint temporarily
ALTER TABLE field_reports 
DROP CONSTRAINT IF EXISTS field_reports_project_id_fkey;

-- Make project_id nullable if it isn't already
ALTER TABLE field_reports 
ALTER COLUMN project_id DROP NOT NULL;