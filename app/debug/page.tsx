'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/supabase-client'
import PageTitle from '@/components/PageTitle'

export default function DebugPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testConnections()
  }, [])

  const testConnections = async () => {
    const testResults: any = {}
    
    try {
      // Test 1: Basic Supabase connection
      testResults.supabaseConfig = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      }

      // Test 2: Try to fetch from each table
      const tables = ['projects', 'vba_projects', 'field_reports', 'documents', 'inspections']
      
      for (const table of tables) {
        try {
          console.log(`Testing table: ${table}`)
          let data
          
          switch (table) {
            case 'projects':
              data = await db.projects.getAll()
              break
            case 'vba_projects':
              data = await db.vbaProjects.getAll()
              break
            case 'field_reports':
              data = await db.fieldReports.getAll()
              break
            case 'documents':
              data = await db.documents.getAll()
              break
            case 'inspections':
              data = await db.inspections.getAll()
              break
          }
          
          testResults[table] = {
            status: 'SUCCESS',
            count: Array.isArray(data) ? (data as any[]).length : 0,
            sample: Array.isArray(data) && (data as any[]).length > 0 ? (data as any[])[0] : null
          }
        } catch (error: any) {
          testResults[table] = {
            status: 'ERROR',
            error: error.message,
            details: error
          }
        }
      }

      // Test 3: Try direct Supabase client
      try {
        const { supabase } = await import('@/lib/supabase-client')
        const { data, error } = await supabase.from('projects').select('*').limit(1)
        
        testResults.directSupabase = {
          status: error ? 'ERROR' : 'SUCCESS',
          error: error?.message,
          data: data
        }
      } catch (error: any) {
        testResults.directSupabase = {
          status: 'ERROR',
          error: error.message
        }
      }

    } catch (error: any) {
      testResults.generalError = {
        message: error.message,
        stack: error.stack
      }
    }

    setResults(testResults)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <PageTitle title="Debugging Supabase Connection..." />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <PageTitle title="Supabase Debug Results" subtitle="Connection and table test results" />
      
      <div className="space-y-6">
        {Object.entries(results).map(([key, value]: [string, any]) => (
          <div key={key} className="card-modern hover-lift backdrop-blur-lg p-4">
            <h2 className="text-lg font-semibold text-yellow-400 mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h2>
            <pre className="bg-gray-800/50 backdrop-blur-sm p-3 rounded-xl text-sm overflow-auto text-gray-200 border border-gray-600/50">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      <div className="mt-8 card-modern backdrop-blur-lg p-4 border border-blue-500/30">
        <h3 className="font-semibold text-yellow-400 mb-2">Instructions:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
          <li>Check the &quot;Supabase Config&quot; - both URL and key should show &quot;Set&quot;</li>
          <li>Look at each table test - they should show &quot;SUCCESS&quot; status</li>
          <li>If you see &quot;ERROR&quot; status, check the error message</li>
          <li>Common issues: RLS policies, missing tables, wrong env variables</li>
        </ul>
      </div>

      <button 
        onClick={testConnections}
        className="mt-6 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-gray-900 rounded-xl hover:from-yellow-400 hover:to-orange-500 transition-all duration-300 hover:scale-105 shadow-glow font-semibold"
      >
        Re-run Tests
      </button>
    </div>
  )
}