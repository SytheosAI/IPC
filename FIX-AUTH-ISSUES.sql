-- FIX SUPABASE AUTH ISSUES
-- Run this ENTIRE script in Supabase SQL Editor

-- 1. DISABLE RLS on profiles table temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies that might be blocking
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- 3. Create a trigger to automatically create profile on user signup
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
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Fix any missing columns in profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS title TEXT;

-- 6. Now manually insert the admin user into auth.users
-- This uses Supabase's admin functions (requires service role key in SQL Editor)
DO $$
DECLARE
  user_exists boolean;
BEGIN
  -- Check if user already exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'mparish@meridianswfl.com') INTO user_exists;
  
  IF NOT user_exists THEN
    -- User doesn't exist, we need to create it via Supabase Dashboard
    RAISE NOTICE 'User does not exist in auth.users. Please create it via Supabase Dashboard.';
  ELSE
    -- User exists, ensure profile exists
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
    
    RAISE NOTICE 'Admin profile created/updated successfully.';
  END IF;
END $$;

-- 7. Create permissive RLS policies for development
-- WARNING: These are very permissive - tighten for production!
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

-- 8. Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO anon;
GRANT ALL ON profiles TO service_role;

-- 9. Verify the setup
SELECT 
  'Auth Users' as table_name,
  COUNT(*) as count 
FROM auth.users 
WHERE email = 'mparish@meridianswfl.com'
UNION ALL
SELECT 
  'Profiles' as table_name,
  COUNT(*) as count 
FROM profiles 
WHERE email = 'mparish@meridianswfl.com';

-- 10. Show current status
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  p.role,
  p.title,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'mparish@meridianswfl.com';