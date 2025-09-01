-- COMPLETE SUPABASE AUTH FIX
-- Run this ENTIRE script in Supabase SQL Editor

-- Step 1: Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 2: Check if auth schema exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
        RAISE EXCEPTION 'Auth schema does not exist. Please enable Authentication in Supabase Dashboard.';
    END IF;
END $$;

-- Step 3: Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'inspector',
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  company TEXT,
  license_number TEXT,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Step 5: Disable RLS temporarily to ensure we can create data
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 6: Drop any existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation on signup" ON profiles;

-- Step 7: Create trigger function for auto-creating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, role, title)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    CASE 
      WHEN new.email = 'mparish@meridianswfl.com' THEN 'admin'
      ELSE 'inspector'
    END,
    CASE 
      WHEN new.email = 'mparish@meridianswfl.com' THEN 'Administrator'
      ELSE 'Inspector'
    END
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    role = CASE 
      WHEN EXCLUDED.email = 'mparish@meridianswfl.com' THEN 'admin'
      ELSE profiles.role
    END,
    title = CASE 
      WHEN EXCLUDED.email = 'mparish@meridianswfl.com' THEN 'Administrator'
      ELSE profiles.title
    END,
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 9: Check if email auth is enabled
DO $$
DECLARE
  auth_enabled boolean;
BEGIN
  -- Check if there are any auth providers configured
  SELECT EXISTS(
    SELECT 1 FROM auth.identities LIMIT 1
  ) INTO auth_enabled;
  
  IF NOT auth_enabled THEN
    RAISE NOTICE 'Warning: No auth identities found. Make sure email auth is enabled in Supabase Dashboard.';
  END IF;
END $$;

-- Step 10: Create or update admin profile for existing user
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Try to find the admin user
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
      role = 'admin',
      title = 'Administrator',
      updated_at = NOW();
    
    RAISE NOTICE 'Admin profile created/updated successfully.';
  ELSE
    RAISE NOTICE 'Admin user not found. Please create user via Supabase Dashboard first.';
  END IF;
END $$;

-- Step 11: Create basic RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read all profiles
CREATE POLICY "Allow authenticated users to read profiles" ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow profile creation for new users
CREATE POLICY "Allow profile creation on signup" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Step 12: Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO anon;
GRANT ALL ON profiles TO service_role;

-- Step 13: Verify setup
SELECT 
  'Auth Configuration Check' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'mparish@meridianswfl.com') 
    THEN 'Admin user exists in auth.users' 
    ELSE 'Admin user NOT found - Create via Dashboard' 
  END as status
UNION ALL
SELECT 
  'Profile Check' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles WHERE email = 'mparish@meridianswfl.com') 
    THEN 'Admin profile exists' 
    ELSE 'Admin profile NOT found' 
  END as status
UNION ALL
SELECT 
  'RLS Status' as check_type,
  CASE 
    WHEN (SELECT relrowsecurity FROM pg_class WHERE oid = 'profiles'::regclass) 
    THEN 'RLS is ENABLED' 
    ELSE 'RLS is DISABLED' 
  END as status
UNION ALL
SELECT 
  'Email Auth' as check_type,
  'Please verify in Dashboard > Authentication > Providers > Email is enabled' as status;

-- Step 14: Show current admin user details if exists
SELECT 
  u.id as user_id,
  u.email,
  u.created_at as user_created,
  u.confirmed_at as email_confirmed,
  p.role,
  p.title,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'mparish@meridianswfl.com';

-- IMPORTANT NOTES:
-- 1. If you see "Admin user NOT found", go to Supabase Dashboard:
--    - Authentication > Users > Add User > Create new user
--    - Email: mparish@meridianswfl.com
--    - Password: Meridian
--    - Check "Auto Confirm Email"
-- 
-- 2. After creating the user, run this SQL script again to create the profile
-- 
-- 3. Make sure Email Auth is enabled:
--    - Go to Authentication > Providers
--    - Enable Email if not already enabled