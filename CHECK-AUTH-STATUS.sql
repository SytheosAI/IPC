-- CHECK SUPABASE AUTH STATUS
-- Run this to diagnose auth issues

-- 1. Check if auth schema exists
SELECT 
  'Auth Schema' as component,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') 
    THEN '✓ Exists' 
    ELSE '✗ Missing - Enable Auth in Dashboard' 
  END as status;

-- 2. Check auth tables
SELECT 
  'Auth Tables' as component,
  string_agg(table_name, ', ') as tables
FROM information_schema.tables 
WHERE table_schema = 'auth';

-- 3. Check if email provider is configured
SELECT 
  'Email Provider' as component,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM auth.identities WHERE provider = 'email' LIMIT 1
    ) 
    THEN '✓ Has email users' 
    ELSE '⚠ No email users yet' 
  END as status;

-- 4. Check existing users
SELECT 
  'Total Users' as component,
  COUNT(*)::text as status
FROM auth.users;

-- 5. List all users (if any)
SELECT 
  id,
  email,
  created_at,
  confirmed_at,
  CASE 
    WHEN confirmed_at IS NOT NULL THEN '✓ Confirmed' 
    ELSE '✗ Not Confirmed' 
  END as email_status
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 6. Check profiles table
SELECT 
  'Profiles Table' as component,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'profiles'
    ) 
    THEN '✓ Exists' 
    ELSE '✗ Missing' 
  END as status;

-- 7. Check RLS status on profiles
SELECT 
  'Profiles RLS' as component,
  CASE 
    WHEN relrowsecurity 
    THEN '✓ Enabled' 
    ELSE '✗ Disabled' 
  END as status
FROM pg_class 
WHERE oid = 'public.profiles'::regclass;

-- 8. Check auth config
SELECT 
  'Auth Config' as component,
  'Check Dashboard > Authentication > Settings' as status;

-- 9. Check if triggers exist
SELECT 
  'User Creation Trigger' as component,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'on_auth_user_created'
    ) 
    THEN '✓ Exists' 
    ELSE '✗ Missing' 
  END as status;