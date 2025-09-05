-- DEEP CHECK OF AUTH SYSTEM (FIXED)
-- Since we have 17 auth tables, let's see what's broken

-- 1. List all auth tables
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('users', 'identities', 'sessions', 'refresh_tokens', 'instances')
        THEN '✅ Core table'
        ELSE '📦 Extra table'
    END as table_type
FROM information_schema.tables
WHERE table_schema = 'auth'
ORDER BY table_name;

-- 2. Check if core auth functions exist
SELECT 
    proname as function_name,
    pronargs as arg_count,
    CASE 
        WHEN prosrc IS NOT NULL THEN '✅ Has code'
        ELSE '❌ No code'
    END as status
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
AND proname IN ('authenticate', 'jwt', 'uid', 'role', 'email')
ORDER BY proname;

-- 3. Check auth.users structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'auth' 
AND table_name = 'users'
AND column_name IN ('id', 'email', 'encrypted_password', 'email_confirmed_at', 'role')
ORDER BY ordinal_position;

-- 4. Try a direct query bypassing all functions
SELECT 
    'Direct query test' as test,
    CASE 
        WHEN id IS NOT NULL THEN '✅ Can query user directly'
        ELSE '❌ Cannot query user'
    END as result
FROM auth.users
WHERE email = 'mparish@meridianswfl.com'
LIMIT 1;

-- 5. Check if auth session functions are the issue
DO $$
DECLARE
    test_result TEXT;
BEGIN
    -- Try to call auth.uid() which might be failing
    BEGIN
        PERFORM auth.uid();
        test_result := '✅ auth.uid() works';
    EXCEPTION WHEN OTHERS THEN
        test_result := '❌ auth.uid() fails: ' || SQLERRM;
    END;
    RAISE NOTICE '%', test_result;
    
    -- Try to call auth.role()
    BEGIN
        PERFORM auth.role();
        test_result := '✅ auth.role() works';
    EXCEPTION WHEN OTHERS THEN
        test_result := '❌ auth.role() fails: ' || SQLERRM;
    END;
    RAISE NOTICE '%', test_result;
    
    -- Try to call auth.email()
    BEGIN
        PERFORM auth.email();
        test_result := '✅ auth.email() works';
    EXCEPTION WHEN OTHERS THEN
        test_result := '❌ auth.email() fails: ' || SQLERRM;
    END;
    RAISE NOTICE '%', test_result;
END $$;

-- 6. Check JWT extensions
SELECT 
    'JWT Extensions' as check,
    string_agg(extname, ', ') as installed_extensions
FROM pg_extension
WHERE extname LIKE '%jwt%' OR extname LIKE '%jose%' OR extname LIKE '%crypto%' OR extname = 'pgcrypto';

-- 7. Check if password verification works
SELECT 
    email,
    CASE 
        WHEN encrypted_password = crypt('Meridian', encrypted_password)
        THEN '✅ Password verification works'
        ELSE '❌ Password verification fails'
    END as password_check
FROM auth.users
WHERE email = 'mparish@meridianswfl.com';

-- 8. Check for any auth policies (shouldn't be any on auth schema)
SELECT 
    tablename,
    policyname,
    '⚠️ Policy on auth table!' as warning
FROM pg_policies
WHERE schemaname = 'auth';

-- 9. Check auth constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    conrelid::regclass as table_name
FROM pg_constraint
WHERE connamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
AND contype IN ('c', 't')  -- Check and trigger constraints
LIMIT 10;

-- 10. Final summary
SELECT 
    'Auth System Status' as component,
    '17 tables exist, checking function failures above' as status;