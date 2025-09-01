-- Step 1: First create the user in Supabase Dashboard
-- Go to Authentication > Users > Add User > Create new user
-- Email: mparish@meridianswfl.com
-- Password: Meridian
-- Check "Auto Confirm Email"

-- Step 2: Run this query to get the user ID
SELECT id, email FROM auth.users WHERE email = 'mparish@meridianswfl.com';

-- Step 3: Copy the ID from the result above, then run this query
-- Replace the example UUID below with your actual user ID
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

-- Step 4: Verify the admin profile was created
SELECT * FROM profiles WHERE email = 'mparish@meridianswfl.com';