// SSR-safe Supabase client - NO browser globals at module level
import type { SupabaseClient } from '@supabase/supabase-js'

// Server-side: return null, client-side: lazy load
export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') {
    // Server-side: always return null
    return null
  }
  
  // Client-side: this will be handled by the useSupabase hook
  console.warn('Use useSupabase() hook instead of direct client access')
  return null
}

// Dummy export for compatibility - DO NOT USE DIRECTLY
export const supabase = null as any as SupabaseClient

// Type definitions
export interface Profile {
  id: string
  user_id?: string
  email: string
  name?: string
  role?: string
  title?: string
  department?: string
  phone?: string
  avatar_url?: string
  company?: string
  license_number?: string
  created_at?: string
  updated_at?: string
}

export interface Project {
  id: string
  permit_number: string
  project_name: string
  address: string
  city?: string
  state?: string
  zip_code?: string
  applicant?: string
  applicant_email?: string
  applicant_phone?: string
  project_type?: string
  status: 'intake' | 'in_review' | 'approved' | 'rejected' | 'issued'
  submitted_date?: string
  last_updated?: string
  total_issues?: number
  total_conditions?: number
  total_notes?: number
  assigned_to?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface VBAProject {
  id: string
  project_id?: string
  project_name: string
  project_number?: string
  address: string
  city?: string
  state?: string
  contractor?: string
  owner?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'passed'
  start_date?: string
  completion_date?: string
  inspection_count?: number
  last_inspection_date?: string
  compliance_score?: number
  virtual_inspector_enabled?: boolean
  notes?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface FieldReport {
  id: string
  report_number: string
  project_id?: string
  project_name: string
  project_address: string
  report_type: 'Safety' | 'Progress' | 'Quality' | 'Incident' | 'Daily' | 'Weekly' | 'Inspection'
  report_date: string
  report_time?: string
  reported_by: string
  reporter_id?: string
  status: 'draft' | 'submitted'
  priority: 'low' | 'medium' | 'high' | 'critical'
  weather_temperature?: number
  weather_conditions?: string
  weather_wind_speed?: number
  signature?: string
  created_at?: string
  updated_at?: string
}

export interface Document {
  id: string
  project_id?: string
  name: string
  file_type?: string
  category?: 'Permits' | 'Plans' | 'Reports' | 'Inspections' | 'Contracts' | 'Correspondence' | 'Other'
  project_name?: string
  uploaded_by?: string
  uploaded_by_name?: string
  file_size?: string
  file_url?: string
  status?: 'active' | 'archived' | 'pending_review'
  tags?: string[]
  created_at?: string
  updated_at?: string
}

export interface Inspection {
  id: string
  vba_project_id?: string
  inspection_number: string
  inspection_type: string
  inspection_date: string
  inspection_time?: string
  inspector_id?: string
  inspector_name?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'passed'
  result?: 'pass' | 'fail' | 'partial' | 'pending'
  notes?: string
  checklist?: any
  compliance_score?: number
  follow_up_required?: boolean
  follow_up_date?: string
  created_at?: string
  updated_at?: string
}

export interface NotificationEmail {
  id: string
  email: string
  name?: string
  notification_type?: 'field_reports' | 'inspections' | 'projects' | 'all'
  active?: boolean
  created_at?: string
}

export interface ActivityLog {
  id: string
  user_id?: string
  action: string
  entity_type?: string
  entity_id?: string
  metadata?: any
  ip_address?: string
  user_agent?: string
  created_at?: string
}

// Legacy db export - DO NOT USE, use useSupabase hook instead
export const db = {
  projects: {
    async getAll() { throw new Error('Use useSupabase hook') },
    async get(id: string) { throw new Error('Use useSupabase hook') },
    async create(project: any) { throw new Error('Use useSupabase hook') },
    async update(id: string, updates: any) { throw new Error('Use useSupabase hook') },
    async delete(id: string) { throw new Error('Use useSupabase hook') }
  },
  fieldReports: {
    async getAll() { throw new Error('Use useSupabase hook') },
    async get(id: string) { throw new Error('Use useSupabase hook') },
    async create(report: any) { throw new Error('Use useSupabase hook') },
    async update(id: string, updates: any) { throw new Error('Use useSupabase hook') },
    async delete(id: string) { throw new Error('Use useSupabase hook') }
  },
  userSettings: {
    async get(id: string): Promise<any> { throw new Error('Use useSupabase hook') },
    async upsert(id: string, data: any): Promise<any> { throw new Error('Use useSupabase hook') }
  },
  vbaProjects: {
    async getAll() { throw new Error('Use useSupabase hook') },
    async get(id: string) { throw new Error('Use useSupabase hook') },
    async create(project: any) { throw new Error('Use useSupabase hook') },
    async update(id: string, updates: any) { throw new Error('Use useSupabase hook') },
    async delete(id: string) { throw new Error('Use useSupabase hook') }
  },
  documents: {
    async getAll() { throw new Error('Use useSupabase hook') },
    async get(id: string) { throw new Error('Use useSupabase hook') },
    async create(doc: any) { throw new Error('Use useSupabase hook') },
    async update(id: string, updates: any) { throw new Error('Use useSupabase hook') },
    async delete(id: string) { throw new Error('Use useSupabase hook') }
  },
  inspections: {
    async getAll() { throw new Error('Use useSupabase hook') },
    async get(id: string) { throw new Error('Use useSupabase hook') },
    async create(inspection: any) { throw new Error('Use useSupabase hook') },
    async update(id: string, updates: any) { throw new Error('Use useSupabase hook') },
    async delete(id: string) { throw new Error('Use useSupabase hook') },
    async getPhotosByProject(projectId: string) { throw new Error('Use useSupabase hook') }
  },
  profiles: {
    async getAll() { throw new Error('Use useSupabase hook') },
    async get(id: string) { throw new Error('Use useSupabase hook') },
    async create(profile: any) { throw new Error('Use useSupabase hook') },
    async update(id: string, updates: any) { throw new Error('Use useSupabase hook') },
    async delete(id: string) { throw new Error('Use useSupabase hook') }
  },
  activityLogs: {
    async getAll() { throw new Error('Use useSupabase hook') },
    async get(id: string) { throw new Error('Use useSupabase hook') },
    async create(log: any) { throw new Error('Use useSupabase hook') },
    async getRecent(limit: number) { throw new Error('Use useSupabase hook') }
  },
  notificationEmails: {
    async getAll() { throw new Error('Use useSupabase hook') },
    async get(id: string) { throw new Error('Use useSupabase hook') },
    async create(email: any) { throw new Error('Use useSupabase hook') },
    async update(id: string, updates: any) { throw new Error('Use useSupabase hook') },
    async delete(id: string) { throw new Error('Use useSupabase hook') }
  }
}

export const subscriptions = {
  subscribeToProjects(callback: any) { throw new Error('Use useSupabase hook') },
  subscribeToFieldReports(callback: any) { throw new Error('Use useSupabase hook') },
  subscribeToInspections(callback: any) { throw new Error('Use useSupabase hook') }
}