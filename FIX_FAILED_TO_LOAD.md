# Fix "Failed to Load" Errors

## The Problem
The Dashboard, Field Reports, and Documents pages show "Failed to load" because the Supabase database tables don't exist yet.

## Quick Fix

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project (rxkakjowitqnbbjezedu)
3. Click on "SQL Editor" in the left sidebar

### Step 2: Create Tables
Copy and paste this entire SQL script into the SQL Editor and click "Run":

```sql
-- Run the migration file content from:
-- supabase/migrations/20240821_final_setup_fixed.sql
```

Or run each of these files in order:
1. First: `supabase/migrations/20240821_final_setup_fixed.sql`
2. Then: `supabase/migrations/create_storage_buckets.sql`

### Step 3: Verify Tables Were Created
Run this query to check:
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

You should see these tables:
- activity_logs
- documents
- field_report_issues
- field_report_personnel
- field_report_photos
- field_report_safety_observations
- field_report_work_completed
- field_reports
- inspection_photos
- inspections
- notification_emails
- profiles
- projects
- user_settings
- vba_projects

### Step 4: Create Storage Bucket (for Documents)
1. Go to "Storage" in the Supabase sidebar
2. Click "New bucket"
3. Name it: `documents`
4. Make it public: Yes (for simplicity)
5. Click "Create bucket"

### Step 5: Disable RLS (For Development Only)
Run this in SQL Editor to disable Row Level Security temporarily:
```sql
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE field_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE vba_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE inspections DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_emails DISABLE ROW LEVEL SECURITY;
```

### Step 6: Refresh Your App
After running the SQL scripts, refresh your application. The "Failed to load" errors should be gone!

## Alternative: Using Supabase CLI
If you have Supabase CLI installed:
```bash
# Link to your project
supabase link --project-ref rxkakjowitqnbbjezedu

# Push the migrations
supabase db push
```

## Still Having Issues?
Check the browser console for specific error messages. Common issues:
- CORS errors: Check Supabase project settings
- Auth errors: Make sure anon key is correct in .env.local
- Network errors: Check if Supabase project is active