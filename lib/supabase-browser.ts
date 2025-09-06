// Browser-only Supabase client to avoid SSR issues
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  // Only create client in browser environment
  if (typeof window === 'undefined') {
    return null
  }

  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables')
    return null
  }

  // Clean URL
  let cleanUrl = supabaseUrl
    .replace(/https:\/\/https:\/\//g, 'https://')
    .replace(/http:\/\/http:\/\//g, 'http://')

  if (!cleanUrl.startsWith('http')) {
    cleanUrl = `https://${cleanUrl}`
  }

  // Create instance
  supabaseInstance = createClient(cleanUrl, supabaseAnonKey)
  return supabaseInstance
}