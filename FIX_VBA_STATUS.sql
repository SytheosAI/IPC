-- Fix VBA Projects Status Constraint
-- This fixes the status check constraint that's causing the error

-- First, drop the existing constraint
ALTER TABLE vba_projects 
DROP CONSTRAINT IF EXISTS vba_projects_status_check;

-- Add the correct constraint with proper values
ALTER TABLE vba_projects 
ADD CONSTRAINT vba_projects_status_check 
CHECK (status IN ('active', 'pending', 'completed', 'on-hold'));

-- Verify the current data matches the constraint
UPDATE vba_projects 
SET status = 'active' 
WHERE status NOT IN ('active', 'pending', 'completed', 'on-hold');

-- Optional: View what values are currently in the table
SELECT DISTINCT status FROM vba_projects;