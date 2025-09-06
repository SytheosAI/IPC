// SSR-safe Supabase client that avoids initialization during module load
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

// Only initialize Supabase when actually needed, not at module load
export async function getSupabase(): Promise<SupabaseClient> {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Only initialize in browser environment
  if (typeof window === 'undefined') {
    // Server-side: return a dummy client that won't throw errors
    return new Proxy({} as SupabaseClient, {
      get() {
        return () => Promise.resolve({ data: null, error: null })
      }
    })
  }

  // Client-side: dynamically import and create real client
  const { createClient } = await import('@supabase/supabase-js')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  // Clean URL
  let cleanUrl = supabaseUrl
    .replace(/https:\/\/https:\/\//g, 'https://')
    .replace(/http:\/\/http:\/\//g, 'http://')
  
  if (!cleanUrl.startsWith('http')) {
    cleanUrl = `https://${cleanUrl}`
  }
  
  supabaseInstance = createClient(cleanUrl, supabaseAnonKey)
  return supabaseInstance
}

// Export a getter that returns the promise
export const supabase = {
  get: getSupabase
}