-- ADMIN SETUP FOR SUPABASE
-- Email: mparish@meridianswfl.com
-- Password: Meridian

-- STEP 1: First create the user in Supabase Dashboard
-- Go to Authentication > Users > Add User > Create new user
-- Email: mparish@meridianswfl.com
-- Password: Meridian
-- Check "Auto Confirm Email"

-- STEP 2: Run this entire SQL block in Supabase SQL Editor
-- This will automatically create/update the admin profile

INSERT INTO profiles (
  user_id,
  email,
  name,
  role,
  title,
  created_at,
  updated_at
) 
SELECT 
  id,
  'mparish@meridianswfl.com',
  'Admin',
  'admin',
  'Administrator',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'mparish@meridianswfl.com'
ON CONFLICT (user_id) 
DO UPDATE SET
  role = 'admin',
  title = 'Administrator',
  updated_at = NOW();

-- Verify the admin profile was created
SELECT * FROM profiles WHERE email = 'mparish@meridianswfl.com';