-- THE ACTUAL FIX - The trigger is broken
-- The handle_new_user() trigger has ON CONFLICT (user_id) 
-- but profiles table also has unique constraint on email

-- First, delete the duplicate profile
DELETE FROM public.profiles WHERE email = 'mparish@meridianswfl.com';

-- Fix the trigger to handle BOTH conflicts
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
  ON CONFLICT (email) DO UPDATE  -- CHANGED FROM user_id TO email
  SET 
    user_id = EXCLUDED.user_id,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    title = EXCLUDED.title,
    updated_at = NOW();
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now create the admin user
DELETE FROM auth.users WHERE email = 'mparish@meridianswfl.com';

INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    'mparish@meridianswfl.com',
    crypt('Meridian', gen_salt('bf')),
    NOW(),
    '{"name":"Admin","role":"admin"}'::jsonb,
    NOW(),
    NOW()
);

-- Verify
SELECT 'SUCCESS' as status, email FROM auth.users WHERE email = 'mparish@meridianswfl.com';