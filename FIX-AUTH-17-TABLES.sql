-- FIX AUTH SYSTEM - 17 TABLES PROBLEM
-- The issue: Supabase has 17 auth tables when there should only be ~5-6 core tables
-- This is causing the auth system to fail with "Database error querying schema"

-- Step 1: Identify all auth tables and their purposes
SELECT 
    t.table_name,
    obj_description(c.oid) as table_comment,
    pg_size_pretty(pg_relation_size(c.oid)) as size,
    CASE 
        WHEN t.table_name IN ('users', 'identities', 'sessions', 'refresh_tokens', 'instances') THEN '✅ CORE'
        WHEN t.table_name IN ('audit_log_entries', 'schema_migrations', 'flow_state', 'sso_providers', 'sso_domains', 'saml_providers', 'saml_relay_states', 'mfa_amr_claims', 'mfa_factors', 'mfa_challenges', 'one_time_tokens', 'sso_sessions') THEN '📦 OPTIONAL'
        ELSE '❌ UNKNOWN/DUPLICATE'
    END as status
FROM information_schema.tables t
JOIN pg_class c ON c.relname = t.table_name
JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'auth'
WHERE t.table_schema = 'auth'
ORDER BY 
    CASE 
        WHEN t.table_name IN ('users', 'identities', 'sessions', 'refresh_tokens', 'instances') THEN 1
        ELSE 2
    END,
    t.table_name;

-- Step 2: Check for duplicate table definitions or views masquerading as tables
SELECT 
    c.relname as object_name,
    c.relkind as object_type,
    CASE c.relkind
        WHEN 'r' THEN 'table'
        WHEN 'v' THEN 'view'
        WHEN 'm' THEN 'materialized view'
        WHEN 'f' THEN 'foreign table'
        ELSE 'other'
    END as type_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'auth'
ORDER BY c.relname;

-- Step 3: Backup critical data before fixing
CREATE TEMP TABLE temp_admin_user AS
SELECT *
FROM auth.users
WHERE email = 'mparish@meridianswfl.com';

-- Step 4: Drop all non-essential auth tables (CAREFUL!)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- First, drop all foreign key constraints referencing auth tables
    FOR r IN (
        SELECT 
            tc.constraint_name, 
            tc.table_name
        FROM information_schema.table_constraints tc
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'auth'
    )
    LOOP
        EXECUTE format('ALTER TABLE auth.%I DROP CONSTRAINT %I CASCADE', r.table_name, r.constraint_name);
        RAISE NOTICE 'Dropped constraint % on table %', r.constraint_name, r.table_name;
    END LOOP;

    -- Drop non-core tables that might be causing conflicts
    FOR r IN (
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'auth'
        AND table_name NOT IN (
            'users', 
            'identities', 
            'sessions', 
            'refresh_tokens', 
            'instances',
            'audit_log_entries',
            'schema_migrations',
            'flow_state',
            'sso_providers',
            'sso_domains',
            'saml_providers', 
            'saml_relay_states',
            'mfa_amr_claims',
            'mfa_factors',
            'mfa_challenges',
            'one_time_tokens'
        )
    )
    LOOP
        EXECUTE format('DROP TABLE IF EXISTS auth.%I CASCADE', r.table_name);
        RAISE NOTICE 'Dropped table auth.%', r.table_name;
    END LOOP;
END $$;

-- Step 5: Fix auth functions that are failing
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(
        current_setting('request.jwt.claims', true)::json->>'sub',
        (current_setting('request.jwt.claims', true)::jsonb)->>'sub'
    )::uuid;
$$;

CREATE OR REPLACE FUNCTION auth.role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(
        current_setting('request.jwt.claims', true)::json->>'role',
        (current_setting('request.jwt.claims', true)::jsonb)->>'role',
        'anon'
    )::text;
$$;

CREATE OR REPLACE FUNCTION auth.email()
RETURNS text
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(
        current_setting('request.jwt.claims', true)::json->>'email',
        (current_setting('request.jwt.claims', true)::jsonb)->>'email'
    )::text;
$$;

-- Step 6: Recreate admin user with proper structure
DO $$
DECLARE
    admin_id uuid;
BEGIN
    -- Delete existing admin if exists
    DELETE FROM auth.identities WHERE email = 'mparish@meridianswfl.com';
    DELETE FROM auth.users WHERE email = 'mparish@meridianswfl.com';
    
    -- Generate new UUID
    admin_id := gen_random_uuid();
    
    -- Insert into users table
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        role,
        aud,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
    ) VALUES (
        admin_id,
        '00000000-0000-0000-0000-000000000000'::uuid,
        'mparish@meridianswfl.com',
        crypt('Meridian', gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"name":"Admin","role":"admin"}'::jsonb,
        NOW(),
        NOW(),
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        ''
    );
    
    -- Insert into identities
    INSERT INTO auth.identities (
        id,
        user_id,
        provider_id,
        provider,
        identity_data,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        admin_id,
        'mparish@meridianswfl.com',
        'email',
        jsonb_build_object(
            'sub', admin_id::text,
            'email', 'mparish@meridianswfl.com',
            'email_verified', true
        ),
        NOW(),
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Admin user recreated with ID: %', admin_id;
END $$;

-- Step 7: Verify the fix
SELECT 
    'Auth Tables After Cleanup' as check_type,
    COUNT(*) as table_count,
    string_agg(table_name, ', ' ORDER BY table_name) as tables
FROM information_schema.tables
WHERE table_schema = 'auth';

-- Step 8: Test authentication directly
SELECT 
    u.email,
    u.role,
    CASE 
        WHEN u.encrypted_password = crypt('Meridian', u.encrypted_password)
        THEN '✅ Password verification works'
        ELSE '❌ Password verification failed'
    END as auth_check,
    i.provider,
    i.last_sign_in_at
FROM auth.users u
LEFT JOIN auth.identities i ON i.user_id = u.id
WHERE u.email = 'mparish@meridianswfl.com';

-- Step 9: Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT SELECT ON auth.users TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO postgres, authenticated, service_role;

-- Step 10: Final count
SELECT 'FINAL AUTH TABLE COUNT:' as status, COUNT(*) as tables FROM information_schema.tables WHERE table_schema = 'auth';