# Admin User Setup Guide

## Quick Setup via Supabase Dashboard

### Step 1: Create the User in Supabase Auth

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Click **Add user** → **Create new user**
5. Enter:
   - Email: `mparish@meridianswfl.com`
   - Password: `Meridian`
   - Check "Auto Confirm Email" ✓
6. Click **Create user**

### Step 2: Add Admin Profile (SQL Editor)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy and paste this SQL (replace the UUID):

```sql
-- First, find the user ID
SELECT id FROM auth.users WHERE email = 'mparish@meridianswfl.com';

-- Copy the ID from above, then run this (replace YOUR_USER_ID):
INSERT INTO profiles (
  user_id,
  email,
  name,
  role,
  title,
  created_at,
  updated_at
) VALUES (
  'YOUR_USER_ID', -- Paste the UUID here
  'mparish@meridianswfl.com',
  'Admin',
  'admin',
  'Administrator',
  NOW(),
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
  role = 'admin',
  title = 'Administrator',
  updated_at = NOW();
```

4. Click **Run** to execute

### Step 3: Verify Setup

Run this query to confirm:
```sql
SELECT * FROM profiles WHERE email = 'mparish@meridianswfl.com';
```

You should see the admin profile with role = 'admin'.

## Alternative: Using the Node Script

1. First, get your Supabase credentials:
   - Go to **Settings** → **API** in your Supabase Dashboard
   - Copy your **Project URL** and **Service Role Key**

2. Edit `scripts/quick-admin-setup.js`:
   - Replace `YOUR_SUPABASE_URL` with your Project URL
   - Replace `YOUR_SERVICE_ROLE_KEY` with your Service Role Key

3. Run the script:
```bash
cd scripts
node quick-admin-setup.js
```

## Login Credentials

- **Email:** mparish@meridianswfl.com
- **Password:** Meridian

## Password Recovery Setup

If password recovery isn't working:

1. Go to Supabase Dashboard → **Authentication** → **Email Templates**
2. Ensure "Enable email confirmations" is ON
3. Check your SMTP settings in **Settings** → **Auth**
4. For testing, you can use Supabase's default email service

## Troubleshooting

### "User already exists" error
- The user is already in Auth system
- Use the SQL method to update/create the profile
- Or run the Node script which handles existing users

### Password recovery not working
1. Check spam folder
2. Verify SMTP settings in Supabase
3. Test with Supabase's default email service first
4. Check redirect URL in your app matches your domain

### Can't login after setup
1. Verify the user exists in Authentication → Users
2. Check the profile exists with: `SELECT * FROM profiles WHERE email = 'mparish@meridianswfl.com';`
3. Ensure role is set to 'admin' in the profiles table