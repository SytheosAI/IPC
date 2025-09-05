-- CHECK WHAT TABLES AND RLS POLICIES EXIST

-- 1. List all public tables
SELECT 
    tablename,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity as has_rls
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Check RLS policies on all tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Check vba_projects table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'vba_projects'
ORDER BY ordinal_position;

-- 4. Check what data exists in key tables
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL
SELECT 'vba_projects', COUNT(*) FROM vba_projects
UNION ALL
SELECT 'field_reports', COUNT(*) FROM field_reports
UNION ALL
SELECT 'submittals', COUNT(*) FROM submittals
UNION ALL
SELECT 'contacts', COUNT(*) FROM contacts
UNION ALL
SELECT 'organizations', COUNT(*) FROM organizations
ORDER BY table_name;

-- 5. Check current user and their profile
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_email,
    auth.role() as current_role;

-- 6. Check if user has a profile
SELECT 
    user_id,
    email,
    role,
    organization_id
FROM profiles
WHERE user_id = auth.uid();

-- 7. Specific check on vba_projects RLS
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'vba_projects';

-- 8. Check if organizations table exists and has data
SELECT 
    EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'organizations'
    ) as organizations_table_exists;

-- 9. Check foreign key relationships
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 10. Check if multi-tenancy columns exist
SELECT 
    table_name,
    column_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND column_name IN ('organization_id', 'tenant_id', 'company_id')
ORDER BY table_name, column_name;