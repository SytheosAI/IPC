-- NUCLEAR OPTION: COMPLETE AUTH REBUILD
-- WARNING: This will completely rebuild the auth schema from scratch
-- Use this if FIX-AUTH-17-TABLES.sql doesn't work

-- Step 1: Save any existing user data we want to keep
CREATE TEMP TABLE IF NOT EXISTS temp_users_backup AS
SELECT DISTINCT ON (email)
    email,
    encrypted_password,
    raw_user_meta_data,
    email_confirmed_at
FROM auth.users
WHERE email IS NOT NULL;

-- Step 2: Drop the entire auth schema (NUCLEAR!)
DROP SCHEMA IF EXISTS auth CASCADE;

-- Step 3: Recreate auth schema
CREATE SCHEMA auth;

-- Step 4: Create ONLY the essential auth tables
CREATE TABLE auth.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id uuid,
    email text UNIQUE,
    encrypted_password text,
    email_confirmed_at timestamptz,
    invited_at timestamptz,
    confirmation_token text,
    confirmation_sent_at timestamptz,
    recovery_token text,
    recovery_sent_at timestamptz,
    email_change_token_new text,
    email_change text,
    email_change_sent_at timestamptz,
    last_sign_in_at timestamptz,
    raw_app_meta_data jsonb DEFAULT '{}'::jsonb,
    raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
    is_super_admin boolean DEFAULT false,
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    phone text,
    phone_confirmed_at timestamptz,
    phone_change text,
    phone_change_token text,
    phone_change_sent_at timestamptz,
    confirmed_at timestamptz GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current text,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamptz,
    reauthentication_token text,
    reauthentication_sent_at timestamptz,
    is_sso_user boolean DEFAULT false,
    deleted_at timestamptz,
    role text DEFAULT 'authenticated',
    aud text DEFAULT 'authenticated',
    CONSTRAINT users_email_change_confirm_status_check CHECK ((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2))
);

CREATE TABLE auth.identities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id text NOT NULL,
    provider text NOT NULL,
    identity_data jsonb NOT NULL,
    last_sign_in_at timestamptz,
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    email text GENERATED ALWAYS AS (lower((identity_data->>'email')::text)) STORED,
    CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider)
);

CREATE TABLE auth.sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    factor_id uuid,
    aal text,
    not_after timestamptz,
    refreshed_at timestamptz,
    user_agent text,
    ip inet,
    tag text
);

CREATE TABLE auth.refresh_tokens (
    id bigserial PRIMARY KEY,
    token text UNIQUE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    revoked boolean DEFAULT false,
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    parent text,
    session_id uuid REFERENCES auth.sessions(id) ON DELETE CASCADE
);

CREATE TABLE auth.instances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid uuid,
    raw_base_config text,
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
);

-- Step 5: Create indexes
CREATE INDEX users_instance_id_idx ON auth.users(instance_id);
CREATE INDEX users_email_idx ON auth.users(email);
CREATE INDEX identities_user_id_idx ON auth.identities(user_id);
CREATE INDEX identities_email_idx ON auth.identities(email);
CREATE INDEX sessions_user_id_idx ON auth.sessions(user_id);
CREATE INDEX refresh_tokens_user_id_idx ON auth.refresh_tokens(user_id);
CREATE INDEX refresh_tokens_session_id_idx ON auth.refresh_tokens(session_id);
CREATE INDEX refresh_tokens_token_idx ON auth.refresh_tokens(token);

-- Step 6: Create essential auth functions
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
    SELECT NULLIF(current_setting('request.jwt.claims', true), '')::json->>'sub'::uuid;
$$;

CREATE OR REPLACE FUNCTION auth.role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
    SELECT NULLIF(current_setting('request.jwt.claims', true), '')::json->>'role'::text;
$$;

CREATE OR REPLACE FUNCTION auth.email()
RETURNS text
LANGUAGE sql
STABLE
AS $$
    SELECT NULLIF(current_setting('request.jwt.claims', true), '')::json->>'email'::text;
$$;

-- Step 7: Create the admin user DIRECTLY
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
    aud
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'mparish@meridianswfl.com',
    crypt('Meridian', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Admin","role":"admin"}'::jsonb,
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
);

-- Step 8: Create identity for admin
INSERT INTO auth.identities (
    user_id,
    provider_id,
    provider,
    identity_data,
    last_sign_in_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'mparish@meridianswfl.com'),
    'mparish@meridianswfl.com',
    'email',
    jsonb_build_object(
        'sub', (SELECT id FROM auth.users WHERE email = 'mparish@meridianswfl.com'),
        'email', 'mparish@meridianswfl.com',
        'email_verified', true
    ),
    NOW()
);

-- Step 9: Grant permissions
GRANT USAGE ON SCHEMA auth TO postgres, authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT SELECT ON auth.users TO authenticated, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO postgres, authenticated, anon, service_role;

-- Step 10: Verify the rebuild
SELECT 
    'REBUILD COMPLETE' as status,
    COUNT(*) as auth_tables,
    (SELECT COUNT(*) FROM auth.users WHERE email = 'mparish@meridianswfl.com') as admin_exists,
    (SELECT encrypted_password = crypt('Meridian', encrypted_password) FROM auth.users WHERE email = 'mparish@meridianswfl.com') as password_works
FROM information_schema.tables 
WHERE table_schema = 'auth';

-- Show what we created
SELECT 
    table_name,
    '✅ Created' as status
FROM information_schema.tables
WHERE table_schema = 'auth'
ORDER BY table_name;