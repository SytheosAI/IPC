import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Database interfaces for type safety
export interface VBAProject {
  id: string
  project_name: string
  project_number?: string
  address: string
  city?: string
  state?: string
  owner?: string
  contractor?: string
  project_type?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'passed'
  start_date?: string
  completion_date?: string
  inspector_name?: string
  selected_inspections?: string[]
  job_number?: string
  permit_number?: string
  contract_number?: string
  created_at?: string
  updated_at?: string
}

export interface ProjectInformation {
  id: string
  project_id: string
  reference: string
  attention: string
  company_logo?: string
  license_number: string
  company_name: string
  digital_signature?: string

  // Site Superintendent
  site_superintendent: string
  superintendent_phone: string
  superintendent_email: string

  // Consultant
  consultant: string
  consultant_company: string
  consultant_phone: string
  consultant_email: string

  // Inspector
  inspector: string
  inspector_company: string
  inspector_phone: string
  inspector_email: string
  inspector_license: string

  // Project Details
  project_type: string
  project_size: string
  project_value: string
  building_height: string
  number_of_units: string
  square_footage: string
  scope_of_work: string

  // Engineering fields
  engineering_seal?: string
  engineering_standards?: string[]
  peer_review_required?: boolean

  created_at?: string
  updated_at?: string
}

export interface InspectionReport {
  id: string
  project_id: string
  report_type: 'inspection' | 'compliance' | 'safety_incident' | 'material_defect' | 'engineering'
  report_title: string
  report_sequence: string
  report_date: string
  inspection_type?: string

  // Basic content (all reports)
  observations: string
  recommendations: string
  weather?: string
  work_zone?: string
  work_performed?: string

  // Compliance specific
  compliance_standard?: string
  compliance_status?: 'compliant' | 'non_compliant' | 'partial'
  violations?: string[]
  corrective_actions?: string
  next_review_date?: string

  // Safety incident specific
  incident_type?: string
  incident_date?: string
  incident_time?: string
  injured_party?: string
  witness_names?: string[]
  incident_description?: string
  immediate_actions?: string
  root_cause?: string
  preventive_measures?: string
  reported_to_osha?: boolean
  severity?: 'minor' | 'moderate' | 'severe' | 'fatal'

  // Material defect specific
  material_type?: string
  manufacturer?: string
  batch_lot_number?: string
  defect_type?: string
  defect_description?: string
  affected_quantity?: string
  discovery_date?: string
  supplier_notified?: boolean
  replacement_required?: boolean
  cost_impact?: string

  // Engineering specific
  engineering_report_type?: 'structural' | 'design' | 'analysis' | 'inspection' | 'assessment'
  engineering_standards?: string[]
  calculations_attached?: boolean
  drawings_attached?: boolean
  professional_opinion?: string
  engineering_recommendations?: string
  limitations_assumptions?: string
  seal_date?: string

  status: 'draft' | 'final'
  generated_by: string
  file_url?: string

  created_at?: string
  updated_at?: string
}

export interface InspectionPhoto {
  id: string
  project_id: string
  inspection_type?: string
  category?: string
  name: string
  caption?: string
  url?: string
  data?: string // base64 image data
  created_at?: string
}

export interface ActivityLog {
  id: string
  user_id?: string
  action: string
  entity_type?: string
  entity_id?: string
  metadata?: any
  created_at?: string
}

// Database client class
class DatabaseClient {
  private supabase: SupabaseClient | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      // Client-side initialization
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      this.supabase = createClient(url, key)
    }
  }

  // Initialize for server-side usage
  initializeServer() {
    if (!this.supabase) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      this.supabase = createClient(url, key)
    }
    return this.supabase
  }

  // VBA Projects
  vbaProjects = {
    async getAll(): Promise<VBAProject[]> {
      const client = this.supabase || this.initializeServer()
      const { data, error } = await client.from('vba_projects').select('*')
      if (error) throw error
      return data || []
    },

    async get(id: string): Promise<VBAProject | null> {
      const client = this.supabase || this.initializeServer()
      const { data, error } = await client.from('vba_projects').select('*').eq('id', id).single()
      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw error
      }
      return data
    },

    async create(project: Partial<VBAProject>): Promise<VBAProject> {
      const client = this.supabase || this.initializeServer()
      const { data, error } = await client.from('vba_projects').insert(project).select().single()
      if (error) throw error
      return data
    },

    async update(id: string, updates: Partial<VBAProject>): Promise<VBAProject> {
      const client = this.supabase || this.initializeServer()
      const { data, error } = await client.from('vba_projects').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single()
      if (error) throw error
      return data
    },

    async delete(id: string): Promise<void> {
      const client = this.supabase || this.initializeServer()
      const { error } = await client.from('vba_projects').delete().eq('id', id)
      if (error) throw error
    }
  }

  // Project Information
  projectInfo = {
    async get(projectId: string): Promise<ProjectInformation | null> {
      const client = this.supabase || this.initializeServer()
      const { data, error } = await client.from('project_information').select('*').eq('project_id', projectId).single()
      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }
      return data
    },

    async upsert(info: Partial<ProjectInformation>): Promise<ProjectInformation> {
      const client = this.supabase || this.initializeServer()
      const { data, error } = await client.from('project_information').upsert(info).select().single()
      if (error) throw error
      return data
    }
  }

  // Inspection Reports
  inspectionReports = {
    async getAll(): Promise<InspectionReport[]> {
      const client = this.supabase || this.initializeServer()
      const { data, error } = await client.from('inspection_reports').select('*')
      if (error) throw error
      return data || []
    },

    async getByProject(projectId: string): Promise<InspectionReport[]> {
      const client = this.supabase || this.initializeServer()
      const { data, error } = await client.from('inspection_reports').select('*').eq('project_id', projectId)
      if (error) throw error
      return data || []
    },

    async get(id: string): Promise<InspectionReport | null> {
      const client = this.supabase || this.initializeServer()
      const { data, error } = await client.from('inspection_reports').select('*').eq('id', id).single()
      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }
      return data
    },

    async create(report: Partial<InspectionReport>): Promise<InspectionReport> {
      const client = this.supabase || this.initializeServer()
      const { data, error } = await client.from('inspection_reports').insert(report).select().single()
      if (error) throw error
      return data
    },

    async update(id: string, updates: Partial<InspectionReport>): Promise<InspectionReport> {
      const client = this.supabase || this.initializeServer()
      const { data, error } = await client.from('inspection_reports').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single()
      if (error) throw error
      return data
    },

    async delete(id: string): Promise<void> {
      const client = this.supabase || this.initializeServer()
      const { error } = await client.from('inspection_reports').delete().eq('id', id)
      if (error) throw error
    }
  }

  // Inspection Photos
  inspections = {
    async getPhotosByProject(projectId: string): Promise<InspectionPhoto[]> {
      const client = this.supabase || this.initializeServer()
      const { data, error } = await client.from('inspection_photos').select('*').eq('project_id', projectId)
      if (error) throw error
      return data || []
    },

    async getPhotosByType(projectId: string, inspectionType: string): Promise<InspectionPhoto[]> {
      const client = this.supabase || this.initializeServer()
      const { data, error } = await client.from('inspection_photos').select('*').eq('project_id', projectId).eq('category', inspectionType)
      if (error) throw error
      return data || []
    },

    async savePhoto(photo: Partial<InspectionPhoto>): Promise<InspectionPhoto> {
      const client = this.supabase || this.initializeServer()
      const { data, error } = await client.from('inspection_photos').insert(photo).select().single()
      if (error) throw error
      return data
    }
  }

  // Activity Logs
  activityLogs = {
    async create(log: Partial<ActivityLog>): Promise<ActivityLog> {
      const client = this.supabase || this.initializeServer()
      const { data, error } = await client.from('activity_logs').insert(log).select().single()
      if (error) throw error
      return data
    },

    async getRecent(limit: number = 50): Promise<ActivityLog[]> {
      const client = this.supabase || this.initializeServer()
      const { data, error } = await client.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(limit)
      if (error) throw error
      return data || []
    }
  }
}

// Export singleton instance
export const db = new DatabaseClient()

// Export client creator for advanced usage
export const createDbClient = () => new DatabaseClient()