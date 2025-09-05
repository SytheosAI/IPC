-- CLEAN UP ALL TEST DATA

-- 1. Delete test VBA projects
DELETE FROM vba_projects 
WHERE project_name LIKE 'Test%' 
   OR project_name LIKE 'VBA Test%'
   OR project_name LIKE 'Beta Testing%'
   OR name LIKE 'Test VBA%';

-- 2. Delete test projects
DELETE FROM projects 
WHERE project_name LIKE 'Test Project%'
   OR name LIKE 'Project %'
   OR description LIKE 'Testing persistence%';

-- 3. Delete test field reports
DELETE FROM field_reports 
WHERE title LIKE 'Test Field Report%'
   OR title LIKE 'Field Report %'
   OR content LIKE 'Test content%';

-- 4. Delete test submittals
DELETE FROM submittals 
WHERE title LIKE 'Test%'
   OR title LIKE 'Submittal %'
   OR description LIKE 'Test submittal%';

-- 5. Delete test contacts
DELETE FROM contacts 
WHERE email IN ('john@example.com', 'jane@example.com', 'bob@example.com', 'test@example.com')
   OR name IN ('Test Contact', 'John Doe', 'Jane Smith', 'Bob Johnson')
   OR company IN ('Test Company', 'ABC Construction', 'XYZ Engineering', 'Test Corp');

-- 6. Verify cleanup
SELECT 
    'Cleanup Complete' as status,
    table_name,
    remaining_count
FROM (
    SELECT 'VBA Projects' as table_name, COUNT(*) as remaining_count FROM vba_projects
    UNION ALL
    SELECT 'Projects', COUNT(*) FROM projects  
    UNION ALL
    SELECT 'Field Reports', COUNT(*) FROM field_reports
    UNION ALL
    SELECT 'Submittals', COUNT(*) FROM submittals
    UNION ALL
    SELECT 'Contacts', COUNT(*) FROM contacts
) counts
ORDER BY table_name;