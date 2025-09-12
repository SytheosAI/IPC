-- Add ALL missing columns to field_reports table
ALTER TABLE field_reports 
ADD COLUMN IF NOT EXISTS work_performed TEXT,
ADD COLUMN IF NOT EXISTS materials_used TEXT,
ADD COLUMN IF NOT EXISTS subcontractors TEXT,
ADD COLUMN IF NOT EXISTS delays TEXT,
ADD COLUMN IF NOT EXISTS safety_incidents TEXT,
ADD COLUMN IF NOT EXISTS quality_issues TEXT,
ADD COLUMN IF NOT EXISTS weather_conditions TEXT,
ADD COLUMN IF NOT EXISTS weather_temperature INTEGER;