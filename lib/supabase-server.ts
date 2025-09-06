// Server-side only Supabase operations
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createServerClient() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return { 
        supabase: null, 
        error: new Response(JSON.stringify({ error: 'Missing Supabase configuration' }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    // Clean URL
    let cleanUrl = supabaseUrl
      .replace(/https:\/\/https:\/\//g, 'https://')
      .replace(/http:\/\/http:\/\//g, 'http://')

    if (!cleanUrl.startsWith('http')) {
      cleanUrl = `https://${cleanUrl}`
    }

    const supabase = createClient(cleanUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })

    return { supabase, error: null }
  } catch (error) {
    console.error('Server client creation error:', error)
    return { 
      supabase: null, 
      error: new Response(JSON.stringify({ error: 'Server configuration error' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}