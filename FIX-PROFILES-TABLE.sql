-- FIX PROFILES TABLE CONSTRAINTS
-- Run this FIRST to fix the ON CONFLICT error

-- Step 1: Add unique constraints to profiles table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_key;

-- Add unique constraint on user_id
ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);

-- Add unique constraint on email (if not already exists)
ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- Step 2: Now try to create/update the admin profile
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Find the admin user if exists
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'mparish@meridianswfl.com'
  LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    -- User exists, create/update profile
    INSERT INTO profiles (
      user_id,
      email,
      name,
      role,
      title,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      'mparish@meridianswfl.com',
      'Admin',
      'admin',
      'Administrator',
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      email = 'mparish@meridianswfl.com',
      role = 'admin',
      title = 'Administrator',
      updated_at = NOW();
    
    RAISE NOTICE 'Admin profile created/updated successfully.';
  ELSE
    RAISE NOTICE 'Admin user not found in auth.users.';
    RAISE NOTICE 'Please create the user first:';
    RAISE NOTICE '1. Go to Authentication > Users in Supabase Dashboard';
    RAISE NOTICE '2. Click "Add User" > "Create new user"';
    RAISE NOTICE '3. Email: mparish@meridianswfl.com';
    RAISE NOTICE '4. Password: Meridian';
    RAISE NOTICE '5. Check "Auto Confirm Email"';
  END IF;
END $$;

-- Step 3: Check if admin exists
SELECT 
  'Admin User in Auth' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'mparish@meridianswfl.com') 
    THEN '✓ Exists' 
    ELSE '✗ Not Found - Create in Dashboard' 
  END as status
UNION ALL
SELECT 
  'Admin Profile' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles WHERE email = 'mparish@meridianswfl.com') 
    THEN '✓ Exists' 
    ELSE '✗ Not Found' 
  END as status;

-- Step 4: Show the admin details if exists
SELECT 
  u.id as user_id,
  u.email,
  u.email_confirmed_at,
  p.role,
  p.title
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'mparish@meridianswfl.com';