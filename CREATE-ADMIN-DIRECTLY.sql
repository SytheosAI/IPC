-- CREATE ADMIN USER DIRECTLY VIA SQL
-- Use this if Dashboard won't let you create users

-- This requires service_role access
-- You may need to run this from Supabase Dashboard SQL Editor with service role

-- Create the admin user directly
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES (
  gen_random_uuid(),
  'mparish@meridianswfl.com',
  crypt('Meridian', gen_salt('bf')), -- Password: Meridian
  NOW(), -- Auto-confirm email
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Admin"}',
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
)
ON CONFLICT (email) DO UPDATE
SET 
  encrypted_password = crypt('Meridian', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW();

-- Get the user ID
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email = 'mparish@meridianswfl.com';

-- Create the profile
INSERT INTO profiles (
  user_id,
  email,
  name,
  role,
  title
)
SELECT 
  id,
  'mparish@meridianswfl.com',
  'Admin',
  'admin',
  'Administrator'
FROM auth.users 
WHERE email = 'mparish@meridianswfl.com'
ON CONFLICT (user_id) DO UPDATE
SET 
  role = 'admin',
  title = 'Administrator';

-- Verify it worked
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  p.title
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'mparish@meridianswfl.com';