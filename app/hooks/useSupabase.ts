'use client'

import { useState, useEffect } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

let clientInstance: SupabaseClient | null = null

async function getBrowserClient(): Promise<SupabaseClient | null> {
  if (typeof window === 'undefined') {
    return null
  }

  if (clientInstance) {
    return clientInstance
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    
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

    clientInstance = createClient(cleanUrl, supabaseAnonKey)
    return clientInstance
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    return null
  }
}

export function useSupabase() {
  const [client, setClient] = useState<SupabaseClient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function initClient() {
      const supabase = await getBrowserClient()
      if (mounted) {
        setClient(supabase)
        setLoading(false)
      }
    }

    initClient()

    return () => {
      mounted = false
    }
  }, [])

  const execute = async <T>(operation: (client: SupabaseClient) => Promise<T>) => {
    if (!client) {
      throw new Error('Supabase client not initialized')
    }
    return operation(client)
  }

  return { client, loading, execute }
}