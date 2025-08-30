# Schema Gap Analysis Report

## Overview
This document identifies all missing database tables and fields required for complete data retention across the IPC application.

## 🔴 Critical Missing Tables

### 1. **Submittals Table** (MISSING ENTIRELY)
The submittals page has no corresponding database table. This is critical for permit application tracking.

**Required Fields:**
- `submittal_number` (unique identifier)
- `project_name`, `project_address`
- `applicant`, `contractor`
- `type` (Building, Electrical, Plumbing, etc.)
- `category` (commercial/residential/industrial)
- `status` (draft/submitted/under_review/approved/rejected/revisions_required)
- `jurisdiction` (Miami-Dade, Broward, etc.)
- `jurisdiction_id` (external tracking)
- `completeness` (percentage)
- `documents_count`, `comments_count`

**Related Tables Needed:**
- `submittal_documents` - File attachments
- `submittal_comments` - Review comments

### 2. **Organization Table** (MISSING ENTIRELY)
The organization page stores company-wide settings but has no database table.

**Required Fields:**
- Company Information (name, legal name, tax ID, license)
- Contact Information (phones, emails, website)
- Address Information (full address details)
- Business Details (employees, revenue, industry, certifications)
- Billing Information (billing address, payment method)
- System Settings (timezone, date format, currency, language)

**Related Tables Needed:**
- `organization_compliance` - Certifications and compliance tracking

### 3. **Members Table** (PARTIALLY MISSING)
While we have `profiles`, the Members page needs extended functionality.

**Gap:** Current `profiles` table lacks:
- `folder` field (team/residents/contractors/design)
- `company` field
- `emergency_contact` information
- `permissions` JSONB field
- `last_active` tracking

**Related Tables Needed:**
- `member_messages` - Internal messaging system

### 4. **Project Control Center Tables** (MISSING)
The new Project Control Center needs several tables:

**Missing Tables:**
- `project_contacts` - Contact management per project
- `project_folders` - Document organization structure
- `project_files` - Enhanced file management with versioning
- `project_metrics` - Dashboard metrics and KPIs

### 5. **VBA Enhancement Tables** (PARTIALLY MISSING)

**Missing Tables:**
- `inspection_schedules` - Detailed scheduling beyond basic inspections
- `vba_contacts` - Project-specific contacts for VBA

### 6. **Jurisdiction API Configuration** (MISSING)
For the jurisdiction integration system:

**Missing Table:**
- `jurisdiction_configs` - Store API endpoints, keys, and settings

## 🟡 Fields Missing from Existing Tables

### Field Reports Table
**Current Gaps:**
- Missing `equipment_used` field
- Missing `materials_delivered` field
- Missing `subcontractors_present` field
- Missing `visitor_log` field

### Projects Table
**Current Gaps:**
- Missing `budget` field
- Missing `completion_percentage` field
- Missing `contract_value` field
- Missing `start_date` and `end_date` fields

### Documents Table
**Current Gaps:**
- Missing `version` field for document versioning
- Missing `parent_document_id` for version tracking
- Missing `expiry_date` for time-sensitive documents

## 📊 Summary Statistics

- **Total Missing Tables:** 14
- **Total Missing Critical Fields:** 45+
- **Affected Features:**
  - ❌ Submittals (completely broken for data persistence)
  - ❌ Organization (no data persistence)
  - ⚠️ Members (partial functionality)
  - ❌ Project Control Center (no data persistence)
  - ⚠️ VBA (missing scheduling features)

## 🚀 Implementation Priority

### Priority 1 (CRITICAL - Implement Immediately):
1. `submittals` table and related tables
2. `organization` table
3. `members` table enhancements

### Priority 2 (HIGH - Implement This Week):
1. `project_contacts`, `project_folders`, `project_files`
2. `project_metrics` for dashboard
3. `inspection_schedules` for VBA

### Priority 3 (MEDIUM - Implement Soon):
1. `member_messages` for internal communication
2. `jurisdiction_configs` for API management
3. `organization_compliance` for certification tracking

## 💾 Database Migration Steps

1. **Backup Current Database**
   ```sql
   pg_dump your_database > backup_$(date +%Y%m%d).sql
   ```

2. **Run Main Schema** (if not already applied)
   ```sql
   psql -d your_database -f supabase-schema.sql
   ```

3. **Apply Missing Schema**
   ```sql
   psql -d your_database -f COMPLETE_SCHEMA.sql
   ```

4. **Verify Installation**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

## 🔧 Application Code Updates Required

After applying the schema, update these files:
1. `/lib/supabase-client.ts` - Add new table interfaces
2. `/app/submittals/page.tsx` - Connect to database
3. `/app/organization/page.tsx` - Connect to database
4. `/app/members/page.tsx` - Use enhanced schema
5. `/app/projects/[id]/control-center/page.tsx` - Connect to new tables

## ⚠️ Risk Assessment

**High Risk Areas:**
- Submittals page is currently storing nothing
- Organization settings are not persisted
- Project Control Center has no data backend
- Member messages feature is non-functional

**Data Loss Risk:**
- Any submittals created are lost on page refresh
- Organization settings revert to defaults
- Project folder contents are mock data only

## ✅ Testing Checklist

After implementation, test:
- [ ] Create and retrieve submittals
- [ ] Save and load organization settings
- [ ] Add and manage team members
- [ ] Upload files to project folders
- [ ] Create inspection schedules
- [ ] Send member messages
- [ ] Track project metrics
- [ ] Configure jurisdiction APIs