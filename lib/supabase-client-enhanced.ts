import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// Enhanced Supabase client that properly handles authentication
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Clean URL
supabaseUrl = supabaseUrl
  .replace(/https:\/\/https:\/\//g, 'https://')
  .replace(/https:\/\/https\/\//g, 'https://')
  .replace(/https\/\//g, 'https://')

// Ensure proper format
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  supabaseUrl = `https://${supabaseUrl}`
}

// Create browser client for client components with proper auth handling
export const supabase = createBrowserClient(
  supabaseUrl, 
  supabaseAnonKey,
  {
    cookies: {
      // These will use browser cookies automatically
      get(name: string) {
        if (typeof document === 'undefined') {
          return undefined
        }
        const cookies = document.cookie.split('; ')
        const cookie = cookies.find(c => c.startsWith(`${name}=`))
        return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined
      },
      set(name: string, value: string, options?: any) {
        if (typeof document === 'undefined') {
          return
        }
        let cookieString = `${name}=${encodeURIComponent(value)}`
        if (options?.maxAge) {
          cookieString += `; Max-Age=${options.maxAge}`
        }
        if (options?.path) {
          cookieString += `; Path=${options.path}`
        }
        if (options?.domain) {
          cookieString += `; Domain=${options.domain}`
        }
        if (options?.sameSite) {
          cookieString += `; SameSite=${options.sameSite}`
        }
        if (options?.secure) {
          cookieString += `; Secure`
        }
        document.cookie = cookieString
      },
      remove(name: string, options?: any) {
        if (typeof document === 'undefined') {
          return
        }
        let cookieString = `${name}=; Max-Age=0`
        if (options?.path) {
          cookieString += `; Path=${options.path}`
        }
        if (options?.domain) {
          cookieString += `; Domain=${options.domain}`
        }
        document.cookie = cookieString
      },
    },
  }
)

// Auth debugging helper
export async function debugAuth() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    console.log('=== Auth Debug Info ===')
    console.log('Session:', session ? 'Active' : 'None', sessionError || '')
    console.log('User ID:', user?.id || 'Not authenticated')
    console.log('User Email:', user?.email || 'N/A')
    console.log('Session Token:', session?.access_token ? 'Present' : 'Missing')
    console.log('Token Expiry:', session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A')
    
    return {
      isAuthenticated: !!session && !!user,
      userId: user?.id,
      email: user?.email,
      session,
      error: sessionError || userError
    }
  } catch (error) {
    console.error('Auth debug failed:', error)
    return {
      isAuthenticated: false,
      error
    }
  }
}

// RLS test function
export async function testRLSAccess() {
  try {
    console.log('=== Testing RLS Access ===')
    
    // First check auth
    const authInfo = await debugAuth()
    if (!authInfo.isAuthenticated) {
      console.error('Not authenticated - cannot test RLS')
      return { success: false, error: 'Not authenticated' }
    }
    
    // Try to create a test VBA project
    const testProject = {
      project_name: `RLS Test ${Date.now()}`,
      address: '123 Test St',
      status: 'scheduled' as const,
      project_number: `TEST-${Date.now()}`
    }
    
    console.log('Attempting to create test project:', testProject)
    
    const { data, error } = await supabase
      .from('vba_projects')
      .insert(testProject)
      .select()
      .single()
    
    if (error) {
      console.error('RLS test failed:', error)
      return { success: false, error: error.message, code: error.code }
    }
    
    console.log('RLS test successful! Created project:', data)
    
    // Clean up test project
    if (data?.id) {
      await supabase
        .from('vba_projects')
        .delete()
        .eq('id', data.id)
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('RLS test error:', error)
    return { success: false, error }
  }
}

// Database types (copied from supabase-client.ts)
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

// Enhanced database operations with better error handling
export const db = {
  // VBA Projects with enhanced auth handling
  vbaProjects: {
    async getAll() {
      // Check auth before making request
      const authInfo = await debugAuth()
      console.log('Getting VBA projects, auth status:', authInfo.isAuthenticated)
      
      const { data, error } = await supabase
        .from('vba_projects')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching VBA projects:', error)
        throw error
      }
      
      return data || []
    },
    
    async create(project: Partial<Omit<VBAProject, 'id' | 'created_at' | 'updated_at'>>) {
      // Debug auth state before creation
      const authInfo = await debugAuth()
      console.log('Creating VBA project, auth status:', authInfo.isAuthenticated)
      console.log('User ID:', authInfo.userId)
      
      if (!authInfo.isAuthenticated) {
        throw new Error('You must be logged in to create projects')
      }
      
      // Generate project number if not provided
      const projectNumber = project.project_number || `VBA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Ensure required fields
      const projectWithDefaults = {
        project_name: project.project_name || 'Untitled Project',
        address: project.address || '',
        status: project.status || 'scheduled',
        ...project,
        project_number: projectNumber,
        created_by: project.created_by || authInfo.userId // Use authenticated user ID
      }
      
      console.log('Sending project data:', projectWithDefaults)
      
      try {
        const { data, error } = await supabase
          .from('vba_projects')
          .insert(projectWithDefaults)
          .select()
          .single()
        
        if (error) {
          console.error('Database error creating VBA project:', error)
          
          // Enhanced error messages
          if (error.code === '42501' || error.message?.includes('row-level security')) {
            // RLS policy violation
            throw new Error(`Permission denied. RLS policy violation. User ID: ${authInfo.userId}. Please ensure you have proper permissions.`)
          } else if (error.code === '23505') {
            // Unique constraint violation
            throw new Error('A project with this project number already exists')
          } else if (error.code === '23503') {
            // Foreign key violation
            throw new Error('Invalid reference to related data')
          } else {
            throw new Error(`Database error: ${error.message}`)
          }
        }
        
        console.log('Project created successfully:', data)
        return data
      } catch (err: any) {
        console.error('Failed to create VBA project:', err)
        
        // If it's already a formatted error, pass it through
        if (err.message) {
          throw err
        }
        
        // Otherwise wrap it
        throw new Error('An unexpected error occurred while creating the project')
      }
    },
    
    async update(id: string, updates: Partial<VBAProject>) {
      const authInfo = await debugAuth()
      if (!authInfo.isAuthenticated) {
        throw new Error('You must be logged in to update projects')
      }
      
      const { data, error } = await supabase
        .from('vba_projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating VBA project:', error)
        throw error
      }
      
      return data
    },
    
    async delete(id: string) {
      const authInfo = await debugAuth()
      if (!authInfo.isAuthenticated) {
        throw new Error('You must be logged in to delete projects')
      }
      
      const { error } = await supabase
        .from('vba_projects')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Error deleting VBA project:', error)
        throw error
      }
      
      return true
    }
  }
}