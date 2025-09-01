-- FIX AUTH TRIGGERS AND CONSTRAINTS
-- This removes any blocking triggers and constraints

-- Step 1: Check what triggers exist on auth.users
SELECT 
  tgname as trigger_name,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'auth.users'::regclass;

-- Step 2: Temporarily disable our custom trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Check for any constraints that might be blocking
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'auth.users'::regclass
AND contype != 'p'; -- Exclude primary key

-- Step 4: Clean up orphaned profiles
DELETE FROM profiles 
WHERE user_id NOT IN (SELECT id FROM auth.users)
AND email = 'mparish@meridianswfl.com';

-- Step 5: Try to create user with minimal fields
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Generate new UUID
  new_user_id := gen_random_uuid();
  
  -- Try minimal insert
  BEGIN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated', 
      'mparish@meridianswfl.com',
      crypt('Meridian', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'User created successfully with ID: %', new_user_id;
    
    -- Create profile
    INSERT INTO profiles (
      user_id,
      email,
      name,
      role,
      title
    ) VALUES (
      new_user_id,
      'mparish@meridianswfl.com',
      'Admin',
      'admin',
      'Administrator'
    ) ON CONFLICT (user_id) DO UPDATE SET
      role = 'admin',
      title = 'Administrator';
      
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error creating user: %', SQLERRM;
      RAISE NOTICE 'Error detail: %', SQLSTATE;
  END;
END $$;

-- Step 6: Check if user exists now
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'mparish@meridianswfl.com')
    THEN '✅ Admin user exists in auth.users'
    ELSE '❌ Admin user still NOT in auth.users - Email auth may be disabled'
  END as status;

-- Step 7: If user exists, show details
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.role,
  p.title
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'mparish@meridianswfl.com';

-- Step 8: Re-enable trigger after user creation
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
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();