-- DEEP CHECK OF AUTH SYSTEM
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

-- 3. Check for circular dependencies
WITH RECURSIVE dep_tree AS (
    SELECT 
        ev_class::regclass::text as table_name,
        conname as constraint_name,
        1 as level
    FROM pg_constraint
    WHERE connamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
    AND contype = 'f'
    
    UNION ALL
    
    SELECT 
        ev_class::regclass::text,
        c.conname,
        dt.level + 1
    FROM pg_constraint c
    JOIN dep_tree dt ON dt.table_name = c.conrelid::regclass::text
    WHERE c.connamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
    AND c.contype = 'f'
    AND dt.level < 5
)
SELECT 
    'Circular deps' as check_type,
    CASE 
        WHEN MAX(level) > 3 THEN '⚠️ Possible circular reference'
        ELSE '✅ No circular refs'
    END as status
FROM dep_tree;

-- 4. Check auth.users structure
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

-- 5. Check if there are any infinite loops in views
SELECT 
    viewname,
    definition
FROM pg_views
WHERE schemaname = 'auth'
LIMIT 5;

-- 6. Check for problematic indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'auth'
AND indexdef LIKE '%WHERE%'
LIMIT 10;

-- 7. Try a direct query bypassing all functions
SELECT 
    'Direct query test' as test,
    CASE 
        WHEN id IS NOT NULL THEN '✅ Can query user directly'
        ELSE '❌ Cannot query user'
    END as result
FROM auth.users
WHERE email = 'mparish@meridianswfl.com'
LIMIT 1;

-- 8. Check if auth session functions are the issue
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
END $$;

-- 9. Final check - is it the JWT verification that's broken?
SELECT 
    'JWT Extensions' as check,
    string_agg(extname, ', ') as installed_extensions
FROM pg_extension
WHERE extname LIKE '%jwt%' OR extname LIKE '%jose%' OR extname LIKE '%crypto%';