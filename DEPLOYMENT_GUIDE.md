# IPC Deployment Guide

Complete guide to deploy the IPC (Inspections & Permit Control) system with Supabase backend.

## 🚀 Quick Start Deployment

### 1. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a project name: `ipc-production` (or preferred name)
3. Select your region (choose closest to your users)
4. Set a strong database password
5. Wait for project creation (2-3 minutes)

#### Database Schema Setup
1. Go to your Supabase dashboard → SQL Editor
2. Copy and paste the entire `supabase-schema.sql` file
3. Click "Run" to create all tables, indexes, and policies
4. Verify all tables were created in the Table Editor

#### Get API Keys
1. Go to Settings → API
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role secret key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### Storage Setup
1. Go to Storage → Create Bucket
2. Create these buckets:
   - `documents` (public: false)
   - `photos` (public: false) 
   - `avatars` (public: true)
3. Set up RLS policies for each bucket

### 2. Environment Variables

Create `.env.local` file with these **REQUIRED** variables:

```bash
# ========== REQUIRED FOR BASIC FUNCTIONALITY ==========

# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://https://rxkakjowitqnbbjezedu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a2Fram93aXRxbmJiamV6ZWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNTM1NTgsImV4cCI6MjA2OTgyOTU1OH0.h0tIYhWUsAsB5_rle4pB6OyiEuJx-V1MIYLSbisBIe8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a2Fram93aXRxbmJiamV6ZWR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDI1MzU1OCwiZXhwIjoyMDY5ODI5NTU4fQ.RugCai5lmT3_eIU55G7XzlqdQDy6dZLk-5JtXeIJmeA

# App Configuration (REQUIRED)
NEXTAUTH_SECRET=4a3328cb1503c2ef1971c22b1d4e2c75
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Storage Buckets (REQUIRED)
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_DOCUMENTS=documents
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_PHOTOS=photos
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_AVATARS=avatars

# ========== OPTIONAL FOR ENHANCED FEATURES ==========

# Google Maps (for location features)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key

# AI Features (optional)
OPENAI_API_KEY=sk-your-openai-key
NEXT_PUBLIC_ENABLE_AI_COMPLIANCE=true

# Real-time Features
NEXT_PUBLIC_ENABLE_REALTIME=true
```

### 3. Install Dependencies

```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

### 4. Deploy Options

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

#### Option B: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=out
```

#### Option C: Docker
```bash
# Build Docker image
docker build -t ipc-app .

# Run container
docker run -p 3000:3000 --env-file .env.local ipc-app
```

## 📊 Database Schema Overview

### Core Tables Structure

```sql
users (authentication & profiles)
├── projects (construction projects)
│   ├── permits (permit applications)
│   ├── submittals (document submittals)
│   ├── inspections (VBA inspections)
│   │   └── checklist_items (inspection checklists)
│   ├── files (document storage)
│   ├── messages (collaboration)
│   ├── events (calendar scheduling)
│   └── activities (audit trail)
└── vba_events (real-time sync)
```

### Key Relationships
- **One Project** → Many Permits, Inspections, Files
- **One Inspection** → Many Checklist Items
- **Users** can be assigned to multiple Projects/Inspections
- **Activities** track all user actions across the system

## 🔧 Configuration Details

### Required Environment Variables for Production

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public API key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin API key | ✅ |
| `NEXTAUTH_SECRET` | JWT signing secret | ✅ |
| `NEXTAUTH_URL` | App URL for auth | ✅ |

### Optional But Recommended

| Variable | Purpose | Impact |
|----------|---------|---------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Location services | VBA GPS features |
| `OPENAI_API_KEY` | AI compliance detection | AI-powered inspections |
| `SENTRY_DSN` | Error tracking | Production monitoring |
| `NEXT_PUBLIC_GA_TRACKING_ID` | Analytics | Usage tracking |

## 🗄️ Storage Configuration

### Supabase Storage Buckets

1. **documents** - PDF files, reports, permits
   - RLS: Only project members can access
   - Max size: 10MB per file

2. **photos** - Inspection photos, site images
   - RLS: Only project members can access  
   - Max size: 5MB per file

3. **avatars** - User profile pictures
   - RLS: Public read, user can update own
   - Max size: 1MB per file

### Storage Policies Example
```sql
-- Allow users to upload photos to their project folders
CREATE POLICY "Users can upload project photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 🔐 Security Setup

### Row Level Security (RLS)

All tables have RLS enabled with these default policies:
- **Read**: Authenticated users can view all records
- **Insert**: Authenticated users can create records
- **Update**: Users can update records they created
- **Delete**: Users can delete records they created

### Custom Policies for Production

```sql
-- Example: Restrict inspector assignment
CREATE POLICY "Only admins can assign inspectors" ON inspections
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);
```

## 📱 Mobile Features Configuration

### GPS & Location Services
```bash
NEXT_PUBLIC_ENABLE_GPS_TRACKING=true
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
```

### Camera & Photo Upload
```bash
NEXT_PUBLIC_ENABLE_MOBILE_CAMERA=true
MAX_PHOTO_SIZE=5242880  # 5MB
```

### Offline Mode
```bash
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
```

## 🔄 Real-time Features

### Enable Real-time Subscriptions
```bash
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_WS_URL=wss://your-project-id.supabase.co/realtime/v1/websocket
```

### Real-time Tables
Enable real-time for these tables in Supabase dashboard:
- `activities` (for live activity feed)
- `messages` (for collaboration chat)
- `inspections` (for status updates)
- `vba_events` (for mobile sync)

## 🚀 Post-Deployment Checklist

### 1. Verify Database
- [ ] All tables created successfully
- [ ] Sample data inserted (inspection types)
- [ ] RLS policies active
- [ ] Indexes created for performance

### 2. Test Authentication
- [ ] User signup/login works
- [ ] User profiles created automatically
- [ ] Password reset functional

### 3. Test Core Features
- [ ] Dashboard loads with sample data
- [ ] Create new permit/submittal
- [ ] VBA inspection creation
- [ ] File upload to storage buckets
- [ ] Calendar scheduling

### 4. Test Mobile Features
- [ ] Responsive design on mobile
- [ ] Camera access (if enabled)
- [ ] GPS location (if enabled)
- [ ] Offline mode (if enabled)

### 5. Performance & Monitoring
- [ ] Error tracking setup (Sentry)
- [ ] Analytics configured (GA)
- [ ] Performance monitoring
- [ ] Backup strategy

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify Supabase URL and keys
   - Check if project is paused (free tier)

2. **RLS Policy Errors**
   - Ensure user is authenticated
   - Check policy conditions
   - Verify user roles

3. **File Upload Failures**
   - Check storage bucket permissions
   - Verify file size limits
   - Ensure RLS policies for storage

4. **Real-time Not Working**
   - Enable real-time on tables
   - Check WebSocket URL
   - Verify subscription filters

### Debug Mode
Enable debug logging:
```bash
NEXT_PUBLIC_DEBUG_MODE=true
```

## 📞 Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Repository Issues**: https://github.com/SytheosAI/IPC/issues

---

## 🎯 Production Deployment Summary

**Minimum Required Setup:**
1. Create Supabase project
2. Run `supabase-schema.sql`
3. Set 5 required environment variables
4. Install Supabase dependencies
5. Deploy to Vercel/Netlify

**Full Feature Setup:**
- Add Google Maps API key
- Configure OpenAI for AI features
- Set up error tracking
- Enable real-time subscriptions
- Configure mobile features

The IPC system is now ready for production with full permit management and VBA inspection capabilities! 🎉