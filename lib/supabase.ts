import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Database types matching our SQL schema
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string | null
          email: string
          name: string | null
          role: string | null
          department: string | null
          phone: string | null
          avatar_url: string | null
          company: string | null
          license_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          name?: string | null
          role?: string | null
          department?: string | null
          phone?: string | null
          avatar_url?: string | null
          company?: string | null
          license_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string
          name?: string | null
          role?: string | null
          department?: string | null
          phone?: string | null
          avatar_url?: string | null
          company?: string | null
          license_number?: string | null
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          job_number: string | null
          project_name: string
          address: string
          owner: string | null
          contractor: string | null
          project_type: string | null
          category: 'commercial' | 'residential' | 'industrial' | null
          start_date: string | null
          status: 'active' | 'completed' | 'cancelled' | 'on_hold'
          location_lat: number | null
          location_lng: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_number?: string | null
          project_name: string
          address: string
          owner?: string | null
          contractor?: string | null
          project_type?: string | null
          category?: 'commercial' | 'residential' | 'industrial' | null
          start_date?: string | null
          status?: 'active' | 'completed' | 'cancelled' | 'on_hold'
          location_lat?: number | null
          location_lng?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_number?: string | null
          project_name?: string
          address?: string
          owner?: string | null
          contractor?: string | null
          project_type?: string | null
          category?: 'commercial' | 'residential' | 'industrial' | null
          start_date?: string | null
          status?: 'active' | 'completed' | 'cancelled' | 'on_hold'
          location_lat?: number | null
          location_lng?: number | null
          created_by?: string | null
          updated_at?: string
        }
      }
      inspections: {
        Row: {
          id: string
          project_id: string
          inspection_type: string
          status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
          scheduled_date: string
          inspector_id: string | null
          completion_rate: number
          compliance_score: number | null
          virtual_inspector_enabled: boolean
          ai_confidence: number | null
          photo_count: number
          violations: number
          location_lat: number | null
          location_lng: number | null
          selected_inspections: string[] | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          inspection_type: string
          status?: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
          scheduled_date: string
          inspector_id?: string | null
          completion_rate?: number
          compliance_score?: number | null
          virtual_inspector_enabled?: boolean
          ai_confidence?: number | null
          photo_count?: number
          violations?: number
          location_lat?: number | null
          location_lng?: number | null
          selected_inspections?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          inspection_type?: string
          status?: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
          scheduled_date?: string
          inspector_id?: string | null
          completion_rate?: number
          compliance_score?: number | null
          virtual_inspector_enabled?: boolean
          ai_confidence?: number | null
          photo_count?: number
          violations?: number
          location_lat?: number | null
          location_lng?: number | null
          selected_inspections?: string[] | null
          notes?: string | null
          updated_at?: string
        }
      }
      // Add other table types as needed...
    }
  }
}

// Client-side Supabase client - SSR safe
export const createClientComponentSupabase = () => {
  // Only create client on browser
  if (typeof window === 'undefined') {
    return null as any
  }
  
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  // Fix malformed URLs
  url = url.replace('https://https//', 'https://')
           .replace('https://https://', 'https://')
           .replace('https//', 'https://')
  
  return createClient<Database>(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server-side Supabase client  
export const createServerComponentSupabase = async () => {
  const cookieStore = await cookies()
  
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  // Fix malformed URLs
  url = url.replace('https://https//', 'https://')
           .replace('https://https://', 'https://')
           .replace('https//', 'https://')
  
  return createClient<Database>(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Admin Supabase client (with service role key)
export const createAdminSupabase = () => {
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  // Fix malformed URLs
  supabaseUrl = supabaseUrl.replace('https://https//', 'https://')
                           .replace('https://https://', 'https://')
                           .replace('https//', 'https://')
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}