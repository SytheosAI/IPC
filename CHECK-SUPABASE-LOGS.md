# CHECK SUPABASE LOGS

The error "Database error querying schema" with error_id `97a14cd9f167a55d-MIA` is coming from Supabase's auth service itself.

## To see the actual error:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/rxkakjowitqnbbjezedu

2. **Navigate to Logs** (in the left sidebar)

3. **Select "Auth" logs** from the dropdown

4. **Look for the error** with ID: `97a14cd9f167a55d-MIA` or recent 500 errors

5. **Click on the error** to see the full stack trace

## Common causes of "Database error querying schema":

1. **Corrupted auth schema** - The auth schema itself is broken
2. **Missing auth tables** - Required auth tables are missing
3. **Permission issues** - The auth service can't access its own tables
4. **Trigger/function conflicts** - Custom triggers interfering with auth

## Immediate fix to try:

Go to **SQL Editor** and run:

```sql
-- Reset auth schema permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA auth TO postgres, service_role;

-- Check if this fixes it
SELECT 'Permissions reset' as status;
```

## If that doesn't work:

The auth schema is corrupted. You may need to:
1. Contact Supabase support with error ID: `97a14cd9f167a55d-MIA`
2. Or create a new Supabase project and migrate your data

The issue is NOT in your code - it's in Supabase's auth system itself.