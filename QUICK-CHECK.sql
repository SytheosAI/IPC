-- QUICK CHECK - Does admin user exist?
SELECT 
  'Admin User Status' as check,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'mparish@meridianswfl.com')
    THEN '✅ USER EXISTS - You can login!'
    ELSE '❌ USER NOT FOUND - Run FIX-AUTH-TRIGGERS.sql first'
  END as result;

-- If user exists, show login info
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'mparish@meridianswfl.com') THEN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ ADMIN USER IS READY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Local URL: http://localhost:3004/login';
    RAISE NOTICE 'Email: mparish@meridianswfl.com';
    RAISE NOTICE 'Password: Meridian';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'For Vercel/Production:';
    RAISE NOTICE '1. Fix env vars in Vercel Dashboard';
    RAISE NOTICE '2. Set NEXT_PUBLIC_SUPABASE_URL to:';
    RAISE NOTICE '   https://rxkakjowitqnbbjezedu.supabase.co';
    RAISE NOTICE '3. Redeploy';
    RAISE NOTICE '========================================';
  END IF;
END $$;