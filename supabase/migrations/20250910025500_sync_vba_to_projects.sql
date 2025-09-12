-- First, drop the foreign key constraint temporarily
ALTER TABLE field_reports 
DROP CONSTRAINT IF EXISTS field_reports_project_id_fkey;

-- Insert all VBA projects into the main projects table if they don't exist
INSERT INTO projects (
    id,
    project_name,
    project_number,
    permit_number,
    address,
    city,
    state,
    status,
    created_at,
    updated_at,
    organization_id
)
SELECT 
    vp.id,
    vp.project_name,
    vp.project_number,
    COALESCE(vp.permit_number, vp.project_number), -- Use permit_number if exists, else project_number
    vp.address,
    vp.city,
    vp.state,
    CASE 
        WHEN vp.status = 'scheduled' THEN 'active'
        WHEN vp.status = 'in_progress' THEN 'active'
        WHEN vp.status = 'completed' THEN 'completed'
        ELSE 'pending'
    END as status,
    vp.created_at,
    vp.updated_at,
    vp.organization_id
FROM vba_projects vp
WHERE NOT EXISTS (
    SELECT 1 FROM projects p WHERE p.id = vp.id
);

-- Re-add the foreign key constraint
ALTER TABLE field_reports
ADD CONSTRAINT field_reports_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;