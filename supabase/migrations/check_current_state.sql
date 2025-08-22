-- =====================================================
-- CHECK CURRENT DATABASE STATE
-- Run this script to see what's currently in your database
-- =====================================================

-- 1. List all existing tables
SELECT 
    'EXISTING TABLES' as check_type,
    table_name,
    CASE 
        WHEN table_name IN (
            'profiles', 'projects', 'vba_projects', 'field_reports',
            'field_report_work_completed', 'field_report_issues',
            'field_report_safety_observations', 'field_report_personnel',
            'field_report_photos', 'documents', 'inspections',
            'inspection_photos', 'notification_emails', 'activity_logs',
            'user_settings'
        ) THEN '✓ Required'
        ELSE '⚠ Extra'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check missing required tables
SELECT 
    'MISSING TABLES' as check_type,
    required.table_name,
    '✗ Missing' as status
FROM (
    VALUES 
        ('profiles'),
        ('projects'),
        ('vba_projects'),
        ('field_reports'),
        ('field_report_work_completed'),
        ('field_report_issues'),
        ('field_report_safety_observations'),
        ('field_report_personnel'),
        ('field_report_photos'),
        ('documents'),
        ('inspections'),
        ('inspection_photos'),
        ('notification_emails'),
        ('activity_logs'),
        ('user_settings')
) AS required(table_name)
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name = required.table_name
);

-- 3. Check projects table structure (if it exists)
SELECT 
    'PROJECTS TABLE COLUMNS' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'projects'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check for RLS status
SELECT 
    'RLS STATUS' as check_type,
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✓ Enabled'
        ELSE '✗ Disabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'profiles', 'projects', 'vba_projects', 'field_reports',
    'documents', 'inspections', 'notification_emails',
    'activity_logs', 'user_settings'
);

-- 5. Check existing foreign key constraints
SELECT 
    'FOREIGN KEYS' as check_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;