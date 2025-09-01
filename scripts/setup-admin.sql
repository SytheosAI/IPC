-- Supabase Admin User Setup SQL Script
-- Run this in your Supabase SQL Editor

-- This script helps re-add the admin user after deletion
-- Admin email: mparish@meridianswfl.com

-- Step 1: First, you need to create the user through Supabase Dashboard
-- Go to Authentication > Users > Invite User
-- Email: mparish@meridianswfl.com
-- Set a password and auto-confirm the email

-- Step 2: After creating the user in Auth, get the user ID
-- You can find this in Authentication > Users table
-- Copy the user's UUID

-- Step 3: Replace 'YOUR_USER_UUID_HERE' with the actual UUID and run this query:

-- Insert or update the admin profile
INSERT INTO profiles (
  user_id,
  email,
  name,
  role,
  title,
  created_at,
  updated_at
) VALUES (
  'YOUR_USER_UUID_HERE', -- Replace with actual user UUID
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

-- Verify the admin user was created successfully
SELECT * FROM profiles WHERE email = 'mparish@meridianswfl.com';

-- Optional: If you want to check all admin users
SELECT * FROM profiles WHERE role = 'admin';