import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  user_id?: string
  email: string
  name?: string
  role?: string
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

// Helper functions for database operations
export const db = {
  // Projects
  projects: {
    async getAll() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    
    async get(id: string) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    
    async create(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single()
      if (error) throw error
      return data
    },
    
    async update(id: string, updates: Partial<Project>) {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    
    async delete(id: string) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
      if (error) throw error
      return true
    }
  },

  // Field Reports
  fieldReports: {
    async getAll() {
      const { data, error } = await supabase
        .from('field_reports')
        .select('*')
        .order('report_date', { ascending: false })
      if (error) throw error
      return data || []
    },
    
    async get(id: string) {
      const { data, error } = await supabase
        .from('field_reports')
        .select(`
          *,
          field_report_work_completed (*)
          field_report_issues (*)
          field_report_safety_observations (*)
          field_report_personnel (*)
          field_report_photos (*)
        `)
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    
    async create(report: Omit<FieldReport, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('field_reports')
        .insert(report)
        .select()
        .single()
      if (error) throw error
      return data
    },
    
    async update(id: string, updates: Partial<FieldReport>) {
      const { data, error } = await supabase
        .from('field_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    
    async delete(id: string) {
      const { error } = await supabase
        .from('field_reports')
        .delete()
        .eq('id', id)
      if (error) throw error
      return true
    },

    // Work completed items
    async addWorkCompleted(reportId: string, description: string, orderIndex: number = 0) {
      const { data, error } = await supabase
        .from('field_report_work_completed')
        .insert({ report_id: reportId, description, order_index: orderIndex })
        .select()
        .single()
      if (error) throw error
      return data
    },

    // Issues
    async addIssue(reportId: string, description: string, severity?: 'minor' | 'major' | 'critical') {
      const { data, error } = await supabase
        .from('field_report_issues')
        .insert({ report_id: reportId, description, severity })
        .select()
        .single()
      if (error) throw error
      return data
    },

    // Safety observations
    async addSafetyObservation(reportId: string, observation: string, orderIndex: number = 0) {
      const { data, error } = await supabase
        .from('field_report_safety_observations')
        .insert({ report_id: reportId, observation, order_index: orderIndex })
        .select()
        .single()
      if (error) throw error
      return data
    },

    // Personnel
    async addPersonnel(reportId: string, name: string, role?: string, hours?: number) {
      const { data, error } = await supabase
        .from('field_report_personnel')
        .insert({ report_id: reportId, name, role, hours })
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  // Documents
  documents: {
    async getAll() {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    
    async create(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('documents')
        .insert(document)
        .select()
        .single()
      if (error) throw error
      return data
    },
    
    async update(id: string, updates: Partial<Document>) {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    
    async delete(id: string) {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
      if (error) throw error
      return true
    },

    async uploadFile(file: File) {
      const fileName = `${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file)
      if (error) throw error
      
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)
      
      return publicUrl
    }
  },

  // VBA Projects
  vbaProjects: {
    async getAll() {
      const { data, error } = await supabase
        .from('vba_projects')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    
    async get(id: string) {
      const { data, error } = await supabase
        .from('vba_projects')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    
    async create(project: Partial<Omit<VBAProject, 'id' | 'created_at' | 'updated_at'>>) {
      // Generate a unique project number if not provided
      const projectNumber = project.project_number || `VBA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Ensure required fields have defaults
      const projectWithDefaults = {
        project_name: project.project_name || 'Untitled Project',
        address: project.address || '',
        status: project.status || 'scheduled',
        ...project,
        project_number: projectNumber // Override with generated project_number
      }
      const { data, error } = await supabase
        .from('vba_projects')
        .insert(projectWithDefaults)
        .select()
        .single()
      if (error) throw error
      return data
    },
    
    async update(id: string, updates: Partial<VBAProject>) {
      const { data, error } = await supabase
        .from('vba_projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    
    async delete(id: string) {
      const { error } = await supabase
        .from('vba_projects')
        .delete()
        .eq('id', id)
      if (error) throw error
      return true
    }
  },

  // Inspections
  inspections: {
    async getAll() {
      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .order('inspection_date', { ascending: false })
      if (error) throw error
      return data || []
    },
    
    async getByVBAProject(vbaProjectId: string) {
      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .eq('vba_project_id', vbaProjectId)
        .order('inspection_date', { ascending: false })
      if (error) throw error
      return data || []
    },
    
    async create(inspection: Omit<Inspection, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('inspections')
        .insert(inspection)
        .select()
        .single()
      if (error) throw error
      return data
    },
    
    async update(id: string, updates: Partial<Inspection>) {
      const { data, error } = await supabase
        .from('inspections')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    
    async delete(id: string) {
      const { error } = await supabase
        .from('inspections')
        .delete()
        .eq('id', id)
      if (error) throw error
      return true
    },

    async addPhoto(inspectionId: string, vbaProjectId: string, url: string, caption?: string, category?: string) {
      const { data, error } = await supabase
        .from('inspection_photos')
        .insert({
          inspection_id: inspectionId,
          vba_project_id: vbaProjectId,
          url,
          caption,
          category
        })
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  // Profiles
  profiles: {
    async getAll() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name')
      if (error) throw error
      return data || []
    },
    
    async get(id: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    
    async create(profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single()
      if (error) throw error
      return data
    },
    
    async update(id: string, updates: Partial<Profile>) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  // Notification Emails
  notificationEmails: {
    async getAll() {
      const { data, error } = await supabase
        .from('notification_emails')
        .select('*')
        .eq('active', true)
        .order('email')
      if (error) throw error
      return data || []
    },
    
    async create(email: string, name?: string, type: 'field_reports' | 'inspections' | 'projects' | 'all' = 'all') {
      const { data, error } = await supabase
        .from('notification_emails')
        .insert({
          email,
          name,
          notification_type: type,
          active: true
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    
    async delete(id: string) {
      const { error } = await supabase
        .from('notification_emails')
        .delete()
        .eq('id', id)
      if (error) throw error
      return true
    }
  },

  // Activity Logs
  activityLogs: {
    async create(action: string, entityType?: string, entityId?: string, metadata?: any) {
      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          action,
          entity_type: entityType,
          entity_id: entityId,
          metadata
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    
    async getRecent(limit: number = 50) {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data || []
    }
  },

  // User Settings
  userSettings: {
    async get(userId: string) {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (error && error.code !== 'PGRST116') throw error // Ignore not found error
      return data
    },
    
    async upsert(userId: string, settings: any) {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...settings
        })
        .select()
        .single()
      if (error) throw error
      return data
    }
  }
}

// Real-time subscriptions
export const subscriptions = {
  subscribeToProjects(callback: (payload: any) => void) {
    return supabase
      .channel('projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, callback)
      .subscribe()
  },

  subscribeToFieldReports(callback: (payload: any) => void) {
    return supabase
      .channel('field_reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'field_reports' }, callback)
      .subscribe()
  },

  subscribeToInspections(callback: (payload: any) => void) {
    return supabase
      .channel('inspections')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inspections' }, callback)
      .subscribe()
  }
}