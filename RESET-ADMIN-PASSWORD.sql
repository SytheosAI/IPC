-- RESET ADMIN PASSWORD
-- This will force-reset the admin password to 'Meridian'

-- Step 1: Update the password
UPDATE auth.users
SET 
  encrypted_password = crypt('Meridian', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  banned_until = NULL,
  deleted_at = NULL,
  updated_at = NOW()
WHERE email = 'mparish@meridianswfl.com';

-- Step 2: Verify the update
SELECT 
  id,
  email,
  email_confirmed_at,
  CASE 
    WHEN encrypted_password = crypt('Meridian', encrypted_password)
    THEN '✅ Password set to: Meridian'
    ELSE '❌ Password update failed'
  END as password_status,
  banned_until,
  deleted_at
FROM auth.users
WHERE email = 'mparish@meridianswfl.com';

-- Step 3: Ensure profile exists
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
ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin',
  title = 'Administrator',
  updated_at = NOW();

-- Step 4: Show final status
SELECT 
  u.id,
  u.email,
  p.role,
  p.title,
  CASE 
    WHEN u.encrypted_password = crypt('Meridian', u.encrypted_password)
    THEN '✅ Ready to login with password: Meridian'
    ELSE '❌ Password issue - check auth settings'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'mparish@meridianswfl.com';