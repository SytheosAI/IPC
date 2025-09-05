-- CLEAN UP TEST DATA - CHECK COLUMNS FIRST

-- 1. Delete test VBA projects
DELETE FROM vba_projects 
WHERE project_name LIKE 'Test%' 
   OR project_name LIKE 'VBA Test%'
   OR project_name LIKE 'Beta Testing%'
   OR name LIKE 'Test VBA%';

-- 2. Delete test projects
DELETE FROM projects 
WHERE project_name LIKE 'Test Project%';

-- 3. Delete test field reports (check what columns exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'field_reports' AND column_name = 'title') THEN
        DELETE FROM field_reports WHERE title LIKE '%Test%' OR title LIKE '%Field Report%';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'field_reports' AND column_name = 'content') THEN
        DELETE FROM field_reports WHERE content LIKE '%Test%';
    END IF;
END $$;

-- 4. Delete test submittals
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'submittals' AND column_name = 'title') THEN
        DELETE FROM submittals WHERE title LIKE '%Test%' OR title LIKE '%Submittal%';
    END IF;
END $$;

-- 5. Delete test contacts
DELETE FROM contacts 
WHERE email IN ('john@example.com', 'jane@example.com', 'bob@example.com', 'test@example.com')
   OR name IN ('Test Contact', 'John Doe', 'Jane Smith', 'Bob Johnson');

-- 6. Show what's left
SELECT 'VBA Projects: ' || COUNT(*)::text as remaining FROM vba_projects;
SELECT 'Projects: ' || COUNT(*)::text as remaining FROM projects;
SELECT 'Field Reports: ' || COUNT(*)::text as remaining FROM field_reports;
SELECT 'Submittals: ' || COUNT(*)::text as remaining FROM submittals;
SELECT 'Contacts: ' || COUNT(*)::text as remaining FROM contacts;