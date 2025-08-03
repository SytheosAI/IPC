import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          status: 'online' | 'offline' | 'busy'
          location_lat: number | null
          location_lng: number | null
          last_seen: string | null
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: string
          status?: 'online' | 'offline' | 'busy'
          location_lat?: number | null
          location_lng?: number | null
          last_seen?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: string
          status?: 'online' | 'offline' | 'busy'
          location_lat?: number | null
          location_lng?: number | null
          last_seen?: string | null
          avatar_url?: string | null
          phone?: string | null
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

// Client-side Supabase client
export const createClientComponentSupabase = () => 
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// Server-side Supabase client  
export const createServerComponentSupabase = async () => {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// Admin Supabase client (with service role key)
export const createAdminSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}