-- Fix Admin Role for mparish@meridianswfl.com
-- This ensures the admin user has proper access to Architecture Analysis

-- =====================================================
-- 1. Update existing profile for admin user
-- =====================================================
UPDATE profiles 
SET 
    role = 'admin',
    title = 'Administrator'
WHERE email = 'mparish@meridianswfl.com';

-- =====================================================
-- 2. Check if the update was successful
-- =====================================================
SELECT 
    email,
    name,
    role,
    title,
    user_id
FROM profiles 
WHERE email = 'mparish@meridianswfl.com';

-- =====================================================
-- 3. If no profile exists, create one
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE email = 'mparish@meridianswfl.com'
    ) THEN
        -- Get the user_id from auth.users
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
            id as user_id,
            email,
            COALESCE(raw_user_meta_data->>'name', 'Admin'),
            'admin',
            'Administrator',
            NOW(),
            NOW()
        FROM auth.users
        WHERE email = 'mparish@meridianswfl.com'
        ON CONFLICT (email) DO UPDATE
        SET 
            role = 'admin',
            title = 'Administrator',
            updated_at = NOW();
    END IF;
END $$;

-- =====================================================
-- 4. Update the trigger to ensure proper role assignment
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
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    title = EXCLUDED.title,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. Verify the results
-- =====================================================
-- This will show all profiles and their roles/titles
SELECT 
    email,
    name,
    role,
    title,
    created_at
FROM profiles
ORDER BY created_at DESC;