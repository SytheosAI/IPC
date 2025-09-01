-- CREATE ADMIN USER - FINAL WORKING VERSION
-- This handles all constraint issues

-- Step 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Check if user already exists
DO $$
DECLARE
  existing_user_id UUID;
  new_user_id UUID;
BEGIN
  -- Check if user already exists
  SELECT id INTO existing_user_id 
  FROM auth.users 
  WHERE email = 'mparish@meridianswfl.com'
  LIMIT 1;
  
  IF existing_user_id IS NOT NULL THEN
    RAISE NOTICE 'User already exists with ID: %', existing_user_id;
    
    -- Update password for existing user
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('Meridian', gen_salt('bf')),
      email_confirmed_at = NOW(),
      updated_at = NOW()
    WHERE id = existing_user_id;
    
    -- Create or update profile
    INSERT INTO profiles (
      user_id,
      email,
      name,
      role,
      title,
      created_at,
      updated_at
    ) VALUES (
      existing_user_id,
      'mparish@meridianswfl.com',
      'Admin',
      'admin',
      'Administrator',
      NOW(),
      NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
      role = 'admin',
      title = 'Administrator',
      updated_at = NOW();
    
    RAISE NOTICE 'Admin user updated and profile created/updated!';
  ELSE
    -- User doesn't exist, create new one
    new_user_id := gen_random_uuid();
    
    -- Check if email column has unique constraint
    IF EXISTS (
      SELECT 1 
      FROM pg_constraint 
      WHERE conname = 'users_email_key' 
      AND conrelid = 'auth.users'::regclass
    ) THEN
      -- Has unique constraint, use ON CONFLICT
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
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
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        false,
        NOW(),
        NOW()
      ) ON CONFLICT (email) DO UPDATE SET
        encrypted_password = crypt('Meridian', gen_salt('bf')),
        email_confirmed_at = NOW(),
        updated_at = NOW()
      RETURNING id INTO new_user_id;
    ELSE
      -- No unique constraint, insert directly
      BEGIN
        INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          raw_app_meta_data,
          raw_user_meta_data,
          is_super_admin,
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
          '{"provider": "email", "providers": ["email"]}',
          '{}',
          false,
          NOW(),
          NOW()
        );
      EXCEPTION 
        WHEN unique_violation THEN
          -- User was created by another process, get its ID
          SELECT id INTO new_user_id 
          FROM auth.users 
          WHERE email = 'mparish@meridianswfl.com';
          
          -- Update password
          UPDATE auth.users 
          SET 
            encrypted_password = crypt('Meridian', gen_salt('bf')),
            email_confirmed_at = NOW(),
            updated_at = NOW()
          WHERE id = new_user_id;
      END;
    END IF;
    
    -- Create profile for new user
    IF new_user_id IS NOT NULL THEN
      INSERT INTO profiles (
        user_id,
        email,
        name,
        role,
        title,
        created_at,
        updated_at
      ) VALUES (
        new_user_id,
        'mparish@meridianswfl.com',
        'Admin',
        'admin',
        'Administrator',
        NOW(),
        NOW()
      ) ON CONFLICT (user_id) DO UPDATE SET
        role = 'admin',
        title = 'Administrator',
        updated_at = NOW();
      
      RAISE NOTICE 'Admin user created with ID: %', new_user_id;
      RAISE NOTICE 'Profile created/updated!';
    END IF;
  END IF;
END $$;

-- Step 3: Verify the setup
SELECT 
  'User Status' as check,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'mparish@meridianswfl.com')
    THEN '✅ Admin user exists'
    ELSE '❌ Admin user NOT found'
  END as result
UNION ALL
SELECT 
  'Profile Status' as check,
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles WHERE email = 'mparish@meridianswfl.com' AND role = 'admin')
    THEN '✅ Admin profile exists'
    ELSE '❌ Admin profile NOT found'
  END as result;

-- Step 4: Show admin details
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  u.email_confirmed_at as email_confirmed,
  p.role,
  p.title
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'mparish@meridianswfl.com';

-- Step 5: Success message
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'mparish@meridianswfl.com') THEN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ ADMIN USER SETUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Email: mparish@meridianswfl.com';
    RAISE NOTICE 'Password: Meridian';
    RAISE NOTICE 'URL: http://localhost:3004/login';
    RAISE NOTICE '========================================';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '❌ SETUP FAILED - CHECK AUTH SETTINGS';
    RAISE NOTICE '========================================';
    RAISE NOTICE '1. Go to Authentication > Providers';
    RAISE NOTICE '2. Enable "Email" provider';
    RAISE NOTICE '3. Go to Authentication > Settings';
    RAISE NOTICE '4. Turn OFF "Confirm email"';
    RAISE NOTICE '5. Save and try again';
    RAISE NOTICE '========================================';
  END IF;
END $$;