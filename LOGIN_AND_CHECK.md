# Quick Steps to Check Your Supabase Tables

## Step 1: Login to Supabase CLI

Run this in your terminal:
```bash
supabase login
```

This will open your browser to authenticate. Once done, you'll be logged in.

## Step 2: Pull the Current Schema

Since you're already linked to project `rxkakjowitqnbbjezedu` (IPC), run:

```bash
# This will ask for your database password
supabase db pull

# Or if you have your database password ready:
supabase db pull --password YOUR_DB_PASSWORD
```

Your database password can be found in:
Supabase Dashboard > Settings > Database > Database Password

## Step 3: Check What Tables Exist

After pulling, you can see all your migrations in `supabase/migrations/`. 

To see what tables are in your remote database right now, run:

```bash
# This will show you the current schema
cat supabase/migrations/*_remote_schema.sql | grep "CREATE TABLE" | grep -v "IF NOT EXISTS" | cut -d' ' -f3 | sort | uniq
```

## Step 4: Run the Verification Script

Copy and paste this into your Supabase SQL Editor (Dashboard > SQL Editor):

```sql
-- Quick check of what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

## Step 5: Create Missing Tables

Run the migration script in SQL Editor:
`supabase/migrations/20240821_verify_tables.sql`

## Alternative: Get Your Database URL

If you want to check via script, get your database URL:

1. Go to Supabase Dashboard
2. Settings > Database
3. Copy the "Connection string" (URI)
4. Add it to `.env.local`:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.rxkakjowitqnbbjezedu.supabase.co:5432/postgres
```

Then run:
```bash
node check_tables.js
```