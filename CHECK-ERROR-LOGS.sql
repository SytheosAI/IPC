-- CHECK POSTGRES ERROR LOGS DIRECTLY

-- Check recent errors in Postgres logs
SELECT 
    *
FROM pg_stat_activity
WHERE state != 'idle'
AND query LIKE '%auth%'
ORDER BY query_start DESC
LIMIT 10;

-- Check for any blocked queries
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    query,
    state,
    wait_event_type,
    wait_event
FROM pg_stat_activity
WHERE wait_event IS NOT NULL;

-- Check auth schema status
SELECT 
    nspname as schema_name,
    nspowner::regrole as owner
FROM pg_namespace
WHERE nspname = 'auth';

-- Check if auth extension is properly installed
SELECT 
    extname,
    extversion
FROM pg_extension
WHERE extname LIKE '%auth%' OR extname LIKE '%jwt%' OR extname LIKE '%pgjwt%';

-- Check for any errors in auth functions
SELECT 
    proname as function_name,
    prosrc as source_code
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
AND proname = 'authenticate'
LIMIT 1;

-- Try to manually authenticate to see the exact error
DO $$
DECLARE
    result RECORD;
BEGIN
    -- Try to manually verify password
    SELECT 
        email,
        CASE 
            WHEN encrypted_password = crypt('Meridian', encrypted_password)
            THEN 'Password matches'
            ELSE 'Password does not match'
        END as check_result
    INTO result
    FROM auth.users
    WHERE email = 'mparish@meridianswfl.com';
    
    RAISE NOTICE 'Manual auth check: %', result.check_result;
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during manual auth: %', SQLERRM;
END $$;

-- Check system catalog for corruption
SELECT 
    'Auth tables check' as check_type,
    COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'auth';