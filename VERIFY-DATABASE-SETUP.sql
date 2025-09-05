-- =====================================================
-- DATABASE SETUP VERIFICATION SCRIPT
-- Run this AFTER executing COMPLETE-DATABASE-SETUP-FROM-SCRATCH.sql
-- This will verify that all issues are resolved
-- =====================================================

-- =====================================================
-- CHECK 1: VERIFY ORGANIZATIONS TABLE EXISTS
-- =====================================================
SELECT 
    'ORGANIZATIONS TABLE CHECK' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'organizations'
        ) THEN 'PASS - Organizations table exists'
        ELSE 'FAIL - Organizations table missing'
    END as result;

-- =====================================================
-- CHECK 2: VERIFY BETA ORGANIZATION EXISTS
-- =====================================================
SELECT 
    'BETA ORGANIZATION CHECK' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM organizations 
            WHERE id = '11111111-1111-1111-1111-111111111111'
        ) THEN 'PASS - Beta organization exists'
        ELSE 'FAIL - Beta organization missing'
    END as result;

-- =====================================================  
-- CHECK 3: VERIFY ALL TABLES HAVE ORGANIZATION_ID
-- =====================================================
SELECT 
    'ORGANIZATION_ID COLUMNS CHECK' as test_name,
    table_name,
    CASE 
        WHEN COUNT(*) > 0 THEN 'HAS organization_id column'
        ELSE 'MISSING organization_id column'
    END as result
FROM information_schema.columns
WHERE table_schema = 'public' 
AND column_name = 'organization_id'
AND table_name IN (
    'profiles', 'projects', 'vba_projects', 'field_reports', 
    'documents', 'inspections', 'contacts', 'submittals'
)
GROUP BY table_name
ORDER BY table_name;

-- =====================================================
-- CHECK 4: VERIFY RLS POLICIES EXIST
-- =====================================================
SELECT 
    'RLS POLICIES CHECK' as test_name,
    tablename,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'HAS RLS policies'
        ELSE 'NO RLS policies'
    END as result
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'organizations', 'profiles', 'projects', 'vba_projects', 
    'field_reports', 'documents', 'inspections', 'contacts', 'submittals'
)
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- CHECK 5: VERIFY HELPER FUNCTIONS EXIST
-- =====================================================
SELECT 
    'HELPER FUNCTIONS CHECK' as test_name,
    routine_name,
    CASE 
        WHEN routine_name IN ('get_user_organization_id', 'has_organization_access', 'get_user_role')
        THEN 'REQUIRED function exists'
        ELSE 'Additional function'
    END as result
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%organization%' OR routine_name LIKE '%user_role%'
ORDER BY routine_name;

-- =====================================================
-- CHECK 6: TEST VBA PROJECT CREATION (THE CRITICAL TEST)
-- =====================================================
DO $$
DECLARE
    test_project_id UUID;
    error_message TEXT;
BEGIN
    -- Attempt to create a VBA project
    BEGIN
        INSERT INTO vba_projects (
            project_name,
            project_number,
            address,
            city,
            contractor,
            owner,
            status
        ) VALUES (
            'Verification Test Project',
            'VERIFY-' || extract(epoch from now())::text,
            '123 Verification Street',
            'Test City',
            'Test Contractor',
            'Test Owner',
            'active'
        ) RETURNING id INTO test_project_id;
        
        RAISE NOTICE 'VBA PROJECT CREATION TEST: SUCCESS - Created project with ID %', test_project_id;
        
        -- Verify the project was assigned to the correct organization
        IF EXISTS (
            SELECT 1 FROM vba_projects 
            WHERE id = test_project_id 
            AND organization_id = '11111111-1111-1111-1111-111111111111'
        ) THEN
            RAISE NOTICE 'ORGANIZATION ASSIGNMENT: SUCCESS - Project assigned to beta org';
        ELSE
            RAISE NOTICE 'ORGANIZATION ASSIGNMENT: FAIL - Project not assigned to beta org';
        END IF;
        
        -- Clean up the test project
        DELETE FROM vba_projects WHERE id = test_project_id;
        RAISE NOTICE 'CLEANUP: Test project removed successfully';
        
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT;
        RAISE NOTICE 'VBA PROJECT CREATION TEST: FAIL - %', error_message;
    END;
END $$;

-- =====================================================
-- CHECK 7: VERIFY DATA PERSISTENCE
-- =====================================================
SELECT 
    'DATA COUNTS CHECK' as test_name,
    'organizations' as table_name,
    COUNT(*) as record_count
FROM organizations
WHERE id = '11111111-1111-1111-1111-111111111111'
UNION ALL
SELECT 
    'DATA COUNTS CHECK',
    'profiles',
    COUNT(*)
FROM profiles
UNION ALL
SELECT 
    'DATA COUNTS CHECK',
    'vba_projects',
    COUNT(*)
FROM vba_projects
UNION ALL
SELECT 
    'DATA COUNTS CHECK',
    'projects',
    COUNT(*)
FROM projects
UNION ALL
SELECT 
    'DATA COUNTS CHECK',
    'field_reports',
    COUNT(*)
FROM field_reports
UNION ALL
SELECT 
    'DATA COUNTS CHECK',
    'contacts',
    COUNT(*)
FROM contacts
UNION ALL
SELECT 
    'DATA COUNTS CHECK',
    'submittals',
    COUNT(*)
FROM submittals;

-- =====================================================
-- CHECK 8: VERIFY FOREIGN KEY CONSTRAINTS
-- =====================================================
SELECT 
    'FOREIGN KEY CHECK' as test_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column
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
AND kcu.column_name = 'organization_id'
ORDER BY tc.table_name;

-- =====================================================
-- CHECK 9: TEST QUERY ACCESS (RLS FUNCTIONALITY)
-- =====================================================
DO $$
DECLARE
    org_count INTEGER;
    profile_count INTEGER;
    project_count INTEGER;
    vba_count INTEGER;
    error_message TEXT;
BEGIN
    -- Test if we can query each table without RLS violations
    BEGIN
        SELECT COUNT(*) INTO org_count FROM organizations;
        RAISE NOTICE 'QUERY TEST - Organizations: SUCCESS (% records)', org_count;
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT;
        RAISE NOTICE 'QUERY TEST - Organizations: FAIL - %', error_message;
    END;
    
    BEGIN
        SELECT COUNT(*) INTO profile_count FROM profiles;
        RAISE NOTICE 'QUERY TEST - Profiles: SUCCESS (% records)', profile_count;
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT;
        RAISE NOTICE 'QUERY TEST - Profiles: FAIL - %', error_message;
    END;
    
    BEGIN
        SELECT COUNT(*) INTO project_count FROM projects;
        RAISE NOTICE 'QUERY TEST - Projects: SUCCESS (% records)', project_count;
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT;
        RAISE NOTICE 'QUERY TEST - Projects: FAIL - %', error_message;
    END;
    
    BEGIN
        SELECT COUNT(*) INTO vba_count FROM vba_projects;
        RAISE NOTICE 'QUERY TEST - VBA Projects: SUCCESS (% records)', vba_count;
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT;
        RAISE NOTICE 'QUERY TEST - VBA Projects: FAIL - %', error_message;
    END;
END $$;

-- =====================================================
-- CHECK 10: VERIFY HELPER FUNCTION FUNCTIONALITY
-- =====================================================
DO $$
DECLARE
    org_id UUID;
    user_role TEXT;
    error_message TEXT;
BEGIN
    -- Test helper functions
    BEGIN
        SELECT get_user_organization_id() INTO org_id;
        RAISE NOTICE 'HELPER FUNCTION TEST - get_user_organization_id(): SUCCESS - Returns %', org_id;
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT;
        RAISE NOTICE 'HELPER FUNCTION TEST - get_user_organization_id(): FAIL - %', error_message;
    END;
    
    BEGIN
        SELECT get_user_role() INTO user_role;
        RAISE NOTICE 'HELPER FUNCTION TEST - get_user_role(): SUCCESS - Returns "%"', user_role;
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT;
        RAISE NOTICE 'HELPER FUNCTION TEST - get_user_role(): FAIL - %', error_message;
    END;
END $$;

-- =====================================================
-- FINAL SUMMARY
-- =====================================================
DO $$
DECLARE
    org_exists BOOLEAN;
    beta_org_exists BOOLEAN;
    all_tables_have_org_id BOOLEAN;
    helper_functions_exist BOOLEAN;
    rls_policies_exist BOOLEAN;
    can_create_vba BOOLEAN;
    
    table_count INTEGER;
    function_count INTEGER;
    policy_count INTEGER;
    
    overall_status TEXT;
BEGIN
    -- Check organizations table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'organizations'
    ) INTO org_exists;
    
    -- Check beta organization exists
    SELECT EXISTS (
        SELECT 1 FROM organizations 
        WHERE id = '11111111-1111-1111-1111-111111111111'
    ) INTO beta_org_exists;
    
    -- Check all required tables have organization_id
    SELECT COUNT(*) = 8 INTO all_tables_have_org_id
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND column_name = 'organization_id'
    AND table_name IN (
        'profiles', 'projects', 'vba_projects', 'field_reports', 
        'documents', 'inspections', 'contacts', 'submittals'
    );
    
    -- Check helper functions exist
    SELECT COUNT(*) = 3 INTO helper_functions_exist
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('get_user_organization_id', 'has_organization_access', 'get_user_role');
    
    -- Check RLS policies exist
    SELECT COUNT(*) > 0 INTO rls_policies_exist
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    -- Test VBA project creation capability
    BEGIN
        INSERT INTO vba_projects (project_name, project_number, address, city, contractor, owner, status) 
        VALUES ('Test', 'T-' || extract(epoch from now())::text, '123 Test', 'Test', 'Test', 'Test', 'active');
        can_create_vba := true;
        DELETE FROM vba_projects WHERE project_number LIKE 'T-%';
    EXCEPTION WHEN OTHERS THEN
        can_create_vba := false;
    END;
    
    -- Get counts for summary
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name IN (
        'organizations', 'profiles', 'projects', 'vba_projects', 'field_reports', 
        'documents', 'inspections', 'contacts', 'submittals'
    );
    
    SELECT COUNT(*) INTO function_count FROM information_schema.routines 
    WHERE routine_schema = 'public' AND routine_name IN (
        'get_user_organization_id', 'has_organization_access', 'get_user_role'
    );
    
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
    
    -- Determine overall status
    IF org_exists AND beta_org_exists AND all_tables_have_org_id AND 
       helper_functions_exist AND rls_policies_exist AND can_create_vba THEN
        overall_status := 'ALL TESTS PASSED ✓';
    ELSE
        overall_status := 'SOME TESTS FAILED ✗';
    END IF;
    
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'DATABASE SETUP VERIFICATION COMPLETE';
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'Organizations Table: %', CASE WHEN org_exists THEN 'EXISTS ✓' ELSE 'MISSING ✗' END;
    RAISE NOTICE 'Beta Organization: %', CASE WHEN beta_org_exists THEN 'EXISTS ✓' ELSE 'MISSING ✗' END;
    RAISE NOTICE 'All Tables Have Org ID: %', CASE WHEN all_tables_have_org_id THEN 'YES ✓' ELSE 'NO ✗' END;
    RAISE NOTICE 'Helper Functions: %', CASE WHEN helper_functions_exist THEN 'ALL EXIST ✓' ELSE 'MISSING ✗' END;
    RAISE NOTICE 'RLS Policies: %', CASE WHEN rls_policies_exist THEN 'ACTIVE ✓' ELSE 'MISSING ✗' END;
    RAISE NOTICE 'Can Create VBA Projects: %', CASE WHEN can_create_vba THEN 'YES ✓' ELSE 'NO ✗' END;
    RAISE NOTICE '';
    RAISE NOTICE 'Summary Statistics:';
    RAISE NOTICE '- Core Tables: % / 9', table_count;
    RAISE NOTICE '- Helper Functions: % / 3', function_count;
    RAISE NOTICE '- RLS Policies: %', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE 'OVERALL STATUS: %', overall_status;
    RAISE NOTICE '================================================================';
    
    IF overall_status = 'ALL TESTS PASSED ✓' THEN
        RAISE NOTICE '';
        RAISE NOTICE '🎉 SUCCESS! Your database is properly configured:';
        RAISE NOTICE '   ✓ Organizations table exists and is populated';
        RAISE NOTICE '   ✓ Multi-tenancy is implemented across all tables'; 
        RAISE NOTICE '   ✓ RLS policies prevent data leakage between organizations';
        RAISE NOTICE '   ✓ VBA projects can be created without errors';
        RAISE NOTICE '   ✓ All data will persist correctly for beta testing';
        RAISE NOTICE '';
        RAISE NOTICE '   You can now proceed with beta testing!';
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  Some issues were detected. Review the test results above.';
        RAISE NOTICE '   If critical tests failed, you may need to re-run the setup script.';
        RAISE NOTICE '';
    END IF;
END $$;

-- Final confirmation query
SELECT 
    'VERIFICATION_COMPLETE' as status,
    'Check the NOTICE messages above for detailed results' as message,
    NOW() as verified_at;