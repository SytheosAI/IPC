# Supabase Setup Guide for IPC Application

## Current Status
- ✅ Supabase CLI installed
- ✅ Supabase packages installed (@supabase/supabase-js, @supabase/ssr)
- ✅ Database migration scripts created
- ✅ TypeScript types configured

## Quick Setup Steps

### 1. Configure Environment Variables
Add your Supabase credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional, for admin operations)
```

You can find these in your Supabase project dashboard under Settings > API.

### 2. Run Database Migrations

#### Option A: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/20240821_verify_tables.sql`
4. Run the query

#### Option B: Using Supabase CLI
```bash
# Link your project (run once)
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 3. Verify Tables
Run this query in your Supabase SQL Editor to verify all tables are created:
```sql
SELECT * FROM verify_ipc_tables();
```

Expected output should show all tables as "EXISTS" with proper column counts.

## Table Structure

### Core Tables
1. **profiles** - User profiles and authentication
2. **projects** - Main project records
3. **vba_projects** - Virtual Building Authority projects
4. **field_reports** - Field inspection reports
5. **documents** - Document management
6. **inspections** - Inspection records

### Supporting Tables
- field_report_work_completed
- field_report_issues
- field_report_safety_observations
- field_report_personnel
- field_report_photos
- inspection_photos
- notification_emails
- activity_logs
- user_settings

## Using Supabase CLI

### Common Commands
```bash
# Check status
supabase status

# Generate TypeScript types from your database
supabase gen types typescript --project-id your-project-id > lib/database.types.ts

# Run local development
supabase start

# Stop local development
supabase stop

# Reset local database
supabase db reset

# View migration history
supabase migration list
```

### Local Development
```bash
# Start Supabase locally
supabase start

# This will give you local URLs:
# API URL: http://localhost:54321
# GraphQL URL: http://localhost:54321/graphql/v1
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
```

## Troubleshooting

### If tables already exist
Use `supabase-migration.sql` instead of `supabase-schema.sql`. It includes IF NOT EXISTS checks.

### To check what tables are missing
```sql
-- Run this in SQL Editor
SELECT * FROM verify_ipc_tables();
```

### To drop all tables and start fresh (CAUTION: This will delete all data)
```sql
-- WARNING: This will delete all data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then run the original `supabase-schema.sql`.

### RLS (Row Level Security) Issues
If you're getting permission errors:
```sql
-- Temporarily disable RLS for development (NOT for production!)
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE field_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
-- etc for other tables
```

## Next Steps

1. **Configure Authentication**: Set up Supabase Auth in your app
2. **Update Components**: Replace localStorage with Supabase calls
3. **Set up Storage**: Configure Supabase Storage for file uploads
4. **Enable Realtime**: Set up realtime subscriptions for live updates
5. **Configure RLS Policies**: Set proper security policies for production

## Integration Checklist

- [ ] Environment variables configured
- [ ] Database tables created
- [ ] TypeScript types generated
- [ ] Auth configured
- [ ] Storage bucket created for documents
- [ ] RLS policies configured
- [ ] Components updated to use Supabase
- [ ] localStorage removed
- [ ] Deploy to production