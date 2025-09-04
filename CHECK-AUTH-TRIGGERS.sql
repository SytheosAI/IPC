-- CHECK WHAT'S BREAKING AUTH

-- 1. List ALL triggers on auth.users
SELECT 
    tgname as trigger_name,
    tgtype,
    tgenabled,
    proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'auth.users'::regclass
ORDER BY tgname;

-- 2. Drop our custom trigger that might be breaking things
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. Check for any auth schema functions that might be broken
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'auth'
AND p.proname LIKE '%user%'
ORDER BY p.proname;

-- 4. Check if auth schema has any RLS enabled (shouldn't!)
SELECT 
    c.relname as table_name,
    c.relrowsecurity as rls_enabled
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth'
AND c.relkind = 'r'
AND c.relrowsecurity = true;

-- 5. Try a simple auth query to see what breaks
DO $$
DECLARE
    test_result TEXT;
BEGIN
    BEGIN
        -- Try to query auth.users
        PERFORM * FROM auth.users LIMIT 1;
        test_result := '✅ Can query auth.users';
    EXCEPTION WHEN OTHERS THEN
        test_result := '❌ Error querying auth.users: ' || SQLERRM;
    END;
    RAISE NOTICE '%', test_result;
    
    BEGIN
        -- Try to query with email filter
        PERFORM * FROM auth.users WHERE email = 'mparish@meridianswfl.com' LIMIT 1;
        test_result := '✅ Can query specific user';
    EXCEPTION WHEN OTHERS THEN
        test_result := '❌ Error querying specific user: ' || SQLERRM;
    END;
    RAISE NOTICE '%', test_result;
END $$;

-- 6. Check if the issue is with auth.identities
SELECT 
    COUNT(*) as identity_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Has identities'
        ELSE '⚠️ No identities (might be the issue)'
    END as status
FROM auth.identities
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'mparish@meridianswfl.com');

-- 7. Create identity if missing
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    id,
    jsonb_build_object('sub', id::text, 'email', email),
    'email',
    NOW(),
    NOW(),
    NOW()
FROM auth.users
WHERE email = 'mparish@meridianswfl.com'
AND NOT EXISTS (
    SELECT 1 FROM auth.identities 
    WHERE user_id = auth.users.id AND provider = 'email'
);

-- 8. Final check
SELECT 
    'Auth System Check' as check,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM auth.users u
            JOIN auth.identities i ON u.id = i.user_id
            WHERE u.email = 'mparish@meridianswfl.com'
        )
        THEN '✅ User and identity exist'
        ELSE '❌ Missing identity record'
    END as status;