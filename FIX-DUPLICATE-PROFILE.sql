-- FIX DUPLICATE PROFILE ISSUE
-- The user was recreated but old profile remains

-- 1. First, delete ALL profiles for this email
DELETE FROM profiles WHERE email = 'mparish@meridianswfl.com';

-- 2. Also delete any orphaned profiles (no matching user)
DELETE FROM profiles 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 3. Now create the profile for the existing user
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
ON CONFLICT (user_id) DO UPDATE SET
    email = 'mparish@meridianswfl.com',
    name = 'Admin',
    role = 'admin',
    title = 'Administrator',
    updated_at = NOW();

-- 4. Ensure password is correct
UPDATE auth.users
SET 
    encrypted_password = crypt('Meridian', gen_salt('bf')),
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'mparish@meridianswfl.com';

-- 5. Verify the fix
SELECT 
    u.id as user_id,
    u.email,
    u.email_confirmed_at,
    p.role,
    p.title,
    CASE 
        WHEN u.encrypted_password = crypt('Meridian', u.encrypted_password)
        THEN '✅ Password: Meridian'
        ELSE '❌ Password mismatch'
    END as password_check
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'mparish@meridianswfl.com';

-- 6. Final status
SELECT 
    '✅ FIXED!' as status,
    'Profile recreated for current user' as action,
    'Try logging in now' as next_step;