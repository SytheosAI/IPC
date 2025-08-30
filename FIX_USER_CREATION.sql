-- Fix User Creation Issues in Supabase
-- This script ensures proper setup for user authentication and profiles

-- =====================================================
-- 1. Ensure UUID extension is enabled
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. Drop existing constraints that might cause issues
-- =====================================================
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey CASCADE;

-- =====================================================
-- 3. Recreate profiles table with proper structure
-- =====================================================
-- First check if profiles table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE profiles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID UNIQUE,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            role TEXT DEFAULT 'inspector',
            title TEXT,
            department TEXT,
            phone TEXT,
            avatar_url TEXT,
            company TEXT,
            license_number TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- =====================================================
-- 4. Add missing columns if they don't exist
-- =====================================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS title TEXT;

-- =====================================================
-- 5. Create trigger function for automatic profile creation
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, role, title)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email = 'mparish@meridianswfl.com' THEN 'admin'
      ELSE 'inspector'
    END,
    CASE 
      WHEN NEW.email = 'mparish@meridianswfl.com' THEN 'Administrator'
      ELSE 'Inspector'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. Drop existing trigger if exists and recreate
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 7. Enable Row Level Security
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. Create RLS policies for profiles
-- =====================================================
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Allow authenticated users to view all profiles
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 9. Create updated_at trigger
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. Fix existing orphaned profiles (if any)
-- =====================================================
-- Delete profiles without corresponding auth.users
DELETE FROM profiles 
WHERE user_id IS NOT NULL 
  AND user_id NOT IN (SELECT id FROM auth.users);

-- =====================================================
-- 11. Add foreign key constraint back (optional)
-- =====================================================
-- Only add if you want strict referential integrity
-- This might cause issues if not handled properly
-- ALTER TABLE profiles
-- ADD CONSTRAINT profiles_user_id_fkey 
-- FOREIGN KEY (user_id) 
-- REFERENCES auth.users(id) 
-- ON DELETE CASCADE;

-- =====================================================
-- 12. Grant necessary permissions
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the setup:

-- Check if trigger exists
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check profiles table structure
-- \d profiles

-- Check existing profiles
-- SELECT * FROM profiles;

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';