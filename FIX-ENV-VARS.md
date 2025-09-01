# FIX YOUR ENVIRONMENT VARIABLES

## The Problem
Your Supabase URL has `https://https//` (double https and missing colon) causing CORS errors.

## The Solution

Create a `.env.local` file in your project root with the CORRECT format:

```env
# CORRECT FORMAT - Copy this exactly
NEXT_PUBLIC_SUPABASE_URL=https://rxkakjowitqnbbjezedu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Steps to Fix:

1. **Create `.env.local` file** in `C:\Users\mpari\Desktop\HIVE239\Apps\IPC\`

2. **Get your keys from Supabase:**
   - Go to your Supabase Dashboard
   - Click on your project
   - Go to Settings → API
   - Copy the Project URL (should be: `https://rxkakjowitqnbbjezedu.supabase.co`)
   - Copy the `anon` public key
   - Copy the `service_role` secret key

3. **Paste them in `.env.local`** with the CORRECT format shown above

4. **Restart your development server:**
   ```bash
   npm run dev
   ```

## Common Mistakes to Avoid:
- ❌ `https://https://rxkakjowitqnbbjezedu.supabase.co` (double https)
- ❌ `https//rxkakjowitqnbbjezedu.supabase.co` (missing colon)
- ❌ `rxkakjowitqnbbjezedu.supabase.co` (missing protocol)
- ✅ `https://rxkakjowitqnbbjezedu.supabase.co` (CORRECT)

## After Fixing Environment Variables:

Run the SQL script `FIX-AUTH-ISSUES.sql` in Supabase SQL Editor to ensure auth is properly configured.