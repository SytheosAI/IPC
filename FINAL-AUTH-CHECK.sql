-- FINAL AUTH CHECK AND FIX
-- Run this to see exactly what's wrong

-- 1. Check if auth schema exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth')
    THEN '✅ Auth schema exists'
    ELSE '❌ Auth schema missing - Enable in Dashboard'
  END as auth_status;

-- 2. Check if user exists at all
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ User found in auth.users'
    ELSE '❌ User NOT in auth.users - Need to create'
  END as user_status,
  COUNT(*) as user_count
FROM auth.users 
WHERE email = 'mparish@meridianswfl.com';

-- 3. Show user details if exists
SELECT 
  id,
  email,
  CASE 
    WHEN encrypted_password IS NOT NULL THEN '✅ Has password'
    ELSE '❌ No password set'
  END as password_status,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmed'
    ELSE '❌ Email not confirmed'
  END as email_status,
  CASE 
    WHEN banned_until IS NOT NULL THEN '❌ USER IS BANNED!'
    ELSE '✅ Not banned'
  END as ban_status,
  created_at,
  updated_at
FROM auth.users 
WHERE email = 'mparish@meridianswfl.com';

-- 4. IF USER DOESN'T EXIST, CREATE IT
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mparish@meridianswfl.com') THEN
    RAISE NOTICE '';
    RAISE NOTICE '==================================';
    RAISE NOTICE 'USER DOES NOT EXIST';
    RAISE NOTICE '==================================';
    RAISE NOTICE 'You need to create the user manually:';
    RAISE NOTICE '1. Go to Supabase Dashboard';
    RAISE NOTICE '2. Authentication > Users';
    RAISE NOTICE '3. Click "Add User" > "Create new user"';
    RAISE NOTICE '4. Email: mparish@meridianswfl.com';
    RAISE NOTICE '5. Password: Meridian';
    RAISE NOTICE '6. Check "Auto Confirm Email"';
    RAISE NOTICE '==================================';
  ELSE
    -- User exists, update password
    UPDATE auth.users
    SET 
      encrypted_password = crypt('Meridian', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      banned_until = NULL,
      updated_at = NOW()
    WHERE email = 'mparish@meridianswfl.com';
    
    RAISE NOTICE '✅ Password updated to: Meridian';
  END IF;
END $$;

-- 5. Check profile
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Profile exists'
    ELSE '❌ Profile missing'
  END as profile_status,
  COUNT(*) as profile_count
FROM profiles 
WHERE email = 'mparish@meridianswfl.com';

-- 6. Ensure profile exists if user exists
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

-- 7. Check RLS status on key tables
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '⚠️ RLS Enabled'
    ELSE '✅ RLS Disabled'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'projects', 'field_reports')
ORDER BY tablename;

-- 8. Final verification
SELECT 
  '===================================' as line
UNION ALL
SELECT 'FINAL STATUS:' as line
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'mparish@meridianswfl.com')
    THEN '✅ Admin user exists - Password: Meridian'
    ELSE '❌ Admin user missing - Create manually in Dashboard'
  END as line
UNION ALL
SELECT '===================================' as line;