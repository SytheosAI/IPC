-- VERIFY AND FIX THE ADMIN USER

-- Step 1: Check if user exists and has password
SELECT 
  id,
  email,
  encrypted_password IS NOT NULL as has_password,
  email_confirmed_at IS NOT NULL as email_confirmed,
  created_at,
  updated_at
FROM auth.users 
WHERE email = 'mparish@meridianswfl.com';

-- Step 2: Force update the password to ensure it's correct
UPDATE auth.users
SET 
  encrypted_password = crypt('Meridian', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  updated_at = NOW()
WHERE email = 'mparish@meridianswfl.com';

-- Step 3: Verify the password was set
SELECT 
  CASE 
    WHEN encrypted_password = crypt('Meridian', encrypted_password)
    THEN '✅ Password is set to: Meridian'
    ELSE '❌ Password mismatch'
  END as password_check
FROM auth.users
WHERE email = 'mparish@meridianswfl.com';

-- Step 4: Check if there are any auth functions failing
SELECT 
  proname as function_name,
  pronargs as arg_count
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
AND proname IN ('authenticate', 'signin', 'user_role')
ORDER BY proname;

-- Step 5: Ensure the user has a profile
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
ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin',
  title = 'Administrator';

-- Step 6: Final check
SELECT 
  u.id,
  u.email,
  u.encrypted_password IS NOT NULL as has_password,
  p.role,
  p.title,
  '✅ User should be able to login' as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'mparish@meridianswfl.com';