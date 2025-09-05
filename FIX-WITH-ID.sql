-- FIX WITH PROPER ID FIELDS

-- First, delete any existing admin
DELETE FROM public.profiles WHERE email = 'mparish@meridianswfl.com';
DELETE FROM auth.identities WHERE email = 'mparish@meridianswfl.com';
DELETE FROM auth.users WHERE email = 'mparish@meridianswfl.com';

-- Fix the trigger first
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
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
  ON CONFLICT (email) DO UPDATE
  SET 
    user_id = EXCLUDED.user_id,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    title = EXCLUDED.title,
    updated_at = NOW();
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin with ALL required fields
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'mparish@meridianswfl.com',
    crypt('Meridian', gen_salt('bf')),
    NOW(),
    '{"name":"Admin","role":"admin"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Verify it worked
SELECT 
    id,
    email,
    email_confirmed_at,
    encrypted_password = crypt('Meridian', encrypted_password) as password_works
FROM auth.users 
WHERE email = 'mparish@meridianswfl.com';