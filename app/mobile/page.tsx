'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Settings, Building2 } from 'lucide-react'
import Link from 'next/link'

export default function MobileLandingPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is on mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    
    // If accessing from desktop, redirect to main app
    if (!isMobile && process.env.NODE_ENV === 'production') {
      router.push('/')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center gap-3 justify-center">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))' }}>
              <Zap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">IPC Mobile</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Field Access Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-md mx-auto space-y-4">
          {/* VBA Access */}
          <Link href="/vba" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-sky-100 dark:bg-sky-900 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Virtual Building Authority</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Access field tools and features</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Settings Access */}
          <Link href="/settings" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Settings className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Configure your mobile experience</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-8">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Mobile Access Only:</strong> This portal provides field access to VBA tools and settings. For full platform access, please use the desktop application.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-400">
        IPC Mobile v1.0 • Inspection & Permit Control
      </div>
    </div>
  )
}