-- FORCE CREATE ADMIN USER
-- This bypasses Supabase Dashboard restrictions

-- Step 1: Enable crypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 2: Delete any orphaned profile first
DELETE FROM profiles WHERE email = 'mparish@meridianswfl.com' AND user_id NOT IN (SELECT id FROM auth.users);

-- Step 3: Create the admin user directly in auth.users
-- This uses raw SQL to bypass any Dashboard restrictions
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();
  
  -- Try to insert the user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'mparish@meridianswfl.com',
    crypt('Meridian', gen_salt('bf')),
    NOW(),
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL
  ) ON CONFLICT (email) DO NOTHING;
  
  -- Get the user ID (either new or existing)
  SELECT id INTO new_user_id FROM auth.users WHERE email = 'mparish@meridianswfl.com';
  
  IF new_user_id IS NOT NULL THEN
    -- Create or update the profile
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
    
    RAISE NOTICE 'Admin user and profile created successfully!';
    RAISE NOTICE 'User ID: %', new_user_id;
  ELSE
    RAISE NOTICE 'Failed to create user - check auth configuration';
  END IF;
END $$;

-- Step 4: Verify the user was created
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.email_confirmed_at,
  p.role,
  p.title
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'mparish@meridianswfl.com';

-- Step 5: If user still doesn't exist, check auth configuration
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mparish@meridianswfl.com') THEN
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'USER CREATION FAILED - AUTH MAY BE DISABLED';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Please check in Supabase Dashboard:';
    RAISE NOTICE '1. Go to Authentication > Settings';
    RAISE NOTICE '2. Make sure "Enable Email Provider" is ON';
    RAISE NOTICE '3. Turn OFF "Enable Email Confirmations" for testing';
    RAISE NOTICE '4. Save changes';
    RAISE NOTICE '5. Try running this script again';
  END IF;
END $$;