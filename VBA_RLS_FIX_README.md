# VBA Projects RLS (Row Level Security) Fix

## Problem
The app is receiving a 401 Unauthorized error with RLS policy violation when creating VBA projects, even though SQL queries work fine in the Supabase SQL console.

## Root Cause
The issue is due to a mismatch between how authentication is handled in the SQL console (which uses service role privileges) versus the app (which uses authenticated user tokens via the anon key).

## Solution Overview

### 1. Enhanced Supabase Client (`lib/supabase-client-enhanced.ts`)
- Created an enhanced Supabase client using `@supabase/ssr` for proper cookie-based authentication
- Added auth debugging functions to help diagnose authentication issues
- Includes better error handling and informative error messages

### 2. Updated VBA Page (`app/vba/page.tsx`)
- Updated to use the enhanced client instead of the basic client
- Added comprehensive auth debugging before project creation
- Added a "Test RLS" button for easy permission testing
- Enhanced error messages to be more informative

### 3. Test Endpoint (`app/api/test-rls/route.ts`)
- Created a test endpoint to verify RLS policies from the server side
- Tests read, create, update, and delete operations
- Provides detailed diagnostic information

### 4. SQL Fixes (`scripts/fix-vba-rls-final.sql`)
- Comprehensive SQL script to fix RLS policies
- Creates permissive policies for authenticated users
- Includes diagnostic functions

## How to Apply the Fix

### Option 1: Through the App UI
1. Make sure you're logged in to the app
2. Navigate to the VBA page
3. Click the "Test RLS" button to verify permissions
4. Try creating a new project

### Option 2: Run the Node.js Script
```bash
cd C:\Users\mpari\Desktop\HIVE239\Apps\IPC
node scripts/apply-rls-fix-simple.js
```

### Option 3: Manual SQL Execution
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the following SQL:

```sql
-- Enable RLS on the table
ALTER TABLE vba_projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "vba_projects_select" ON vba_projects;
DROP POLICY IF EXISTS "vba_projects_insert" ON vba_projects;
DROP POLICY IF EXISTS "vba_projects_update" ON vba_projects;
DROP POLICY IF EXISTS "vba_projects_delete" ON vba_projects;

-- Create permissive policies for authenticated users
CREATE POLICY "vba_projects_select"
ON vba_projects FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "vba_projects_insert"
ON vba_projects FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "vba_projects_update"
ON vba_projects FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "vba_projects_delete"
ON vba_projects FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);
```

## Debugging Authentication Issues

### Check Auth State in Browser Console
When on the VBA page, open browser console and look for:
- "Auth status before creation" logs
- "Current auth" information
- Any RLS test results

### Use the Test RLS Button
The VBA page now has a "Test RLS" button that will:
1. Check your current authentication status
2. Attempt to create a test project
3. Report success or failure with details

### Test via API Endpoint
Visit: `http://localhost:3000/api/test-rls` (while logged in)
This will return a JSON response with detailed RLS test results.

## Common Issues and Solutions

### Issue: "No authenticated user found"
**Solution:** Make sure you're logged in. Check browser cookies for Supabase auth tokens.

### Issue: "RLS policy violation"
**Solution:** Run the SQL fixes above to update the policies.

### Issue: Works in SQL console but not in app
**Solution:** This is because SQL console uses service role key. Use the enhanced client which properly handles user authentication.

## Files Changed/Created

1. **`lib/supabase-client-enhanced.ts`** - New enhanced Supabase client with auth handling
2. **`app/vba/page.tsx`** - Updated to use enhanced client with debugging
3. **`app/api/test-rls/route.ts`** - New test endpoint for RLS verification
4. **`scripts/fix-vba-rls-final.sql`** - Comprehensive SQL fix
5. **`scripts/apply-rls-fix-simple.js`** - Node.js script to apply fixes
6. **`scripts/create-auth-helper.sql`** - Helper functions for auth debugging

## Production Considerations

Before deploying to production:
1. Remove or comment out the "Test RLS" button in VBA page
2. Tighten RLS policies to be more restrictive (current policies are permissive for testing)
3. Add proper role-based access control if needed
4. Remove debug console.log statements

## Testing Checklist

- [ ] User can log in successfully
- [ ] "Test RLS" button shows success
- [ ] User can create new VBA projects
- [ ] User can view existing VBA projects
- [ ] User can update VBA projects
- [ ] User can delete VBA projects (if permitted)

## Support

If issues persist:
1. Check Supabase Dashboard > Authentication > Users to verify user exists
2. Check Supabase Dashboard > Database > vba_projects table policies
3. Review browser console for detailed error messages
4. Check Network tab for 401 responses and their details