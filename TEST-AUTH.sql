-- TEST AUTHENTICATION SETUP
-- Run this to diagnose the 500 error

-- 1. Check if auth schema and tables exist
SELECT 
  'Auth Schema' as check,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth')
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END as status;

-- 2. Check if user exists
SELECT 
  'Admin User' as check,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'mparish@meridianswfl.com')
    THEN '✅ Exists'
    ELSE '❌ Not Found'
  END as status;

-- 3. Check user details
SELECT 
  id,
  email,
  encrypted_password IS NOT NULL as has_password,
  email_confirmed_at IS NOT NULL as email_confirmed,
  created_at,
  banned_until,
  deleted_at
FROM auth.users 
WHERE email = 'mparish@meridianswfl.com';

-- 4. Check if auth.users table has required columns
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth' 
  AND table_name = 'users'
  AND column_name IN ('id', 'email', 'encrypted_password', 'email_confirmed_at')
ORDER BY ordinal_position;

-- 5. Test password encryption
SELECT 
  'Password Encryption' as check,
  CASE 
    WHEN crypt('Meridian', gen_salt('bf')) IS NOT NULL
    THEN '✅ Working'
    ELSE '❌ Failed'
  END as status;

-- 6. Check for any auth triggers that might be failing
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass;

-- 7. Try to manually verify the password
SELECT 
  email,
  CASE 
    WHEN encrypted_password = crypt('Meridian', encrypted_password)
    THEN '✅ Password matches'
    ELSE '❌ Password does not match'
  END as password_check
FROM auth.users
WHERE email = 'mparish@meridianswfl.com';

-- 8. Check auth configuration
SELECT 
  'Auth Config' as check,
  'Check Dashboard > Authentication > Settings > Ensure email auth is enabled' as action;