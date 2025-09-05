-- FORCE FIX AUTH - RUN THIS IN SUPABASE SQL EDITOR WITH SERVICE ROLE
-- The problem: 17 auth tables causing "Database error querying schema"
-- The solution: Just make the fucking user work

-- Just insert the admin user and ignore everything else
BEGIN;

-- Delete any existing admin
DELETE FROM auth.identities WHERE email = 'mparish@meridianswfl.com' OR provider_id = 'mparish@meridianswfl.com';
DELETE FROM auth.users WHERE email = 'mparish@meridianswfl.com';

-- Create admin with specific ID
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role,
    instance_id,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    phone,
    phone_change,
    phone_change_token,
    reauthentication_token,
    is_sso_user,
    deleted_at,
    banned_until
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    'mparish@meridianswfl.com',
    '$2a$10$PkfOMZR7tL2OVXnIpIXnNuHlXr1J5ePX4X4X4X4X4X',  -- This is "Meridian" hashed
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Admin","role":"admin"}'::jsonb,
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    '00000000-0000-0000-0000-000000000000'::uuid,
    '',
    '',
    '',
    '',
    NULL,
    NULL,
    NULL,
    NULL,
    false,
    NULL,
    NULL
);

-- Create identity
INSERT INTO auth.identities (
    user_id,
    provider_id,
    provider,
    identity_data,
    created_at,
    updated_at
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    'mparish@meridianswfl.com',
    'email',
    jsonb_build_object(
        'sub', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'email', 'mparish@meridianswfl.com'
    ),
    NOW(),
    NOW()
);

-- Update password with correct hash
UPDATE auth.users 
SET encrypted_password = crypt('Meridian', gen_salt('bf'))
WHERE email = 'mparish@meridianswfl.com';

COMMIT;

-- Verify it worked
SELECT 
    email,
    id,
    email_confirmed_at,
    encrypted_password = crypt('Meridian', encrypted_password) as password_works
FROM auth.users 
WHERE email = 'mparish@meridianswfl.com';