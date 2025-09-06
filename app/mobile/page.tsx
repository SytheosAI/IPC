'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Settings, Building2 } from 'lucide-react'
import Link from 'next/link'
import PageTitle from '@/components/PageTitle'

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <PageTitle title="IPC Mobile" subtitle="Field Access Portal" />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-md mx-auto space-y-4">
          {/* VBA Access */}
          <Link href="/vba" className="block">
            <div className="card-modern hover-lift backdrop-blur-lg p-6 hover:shadow-glow transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-yellow-400">Virtual Building Authority</h2>
                  <p className="text-sm text-gray-300">Access field tools and features</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Settings Access */}
          <Link href="/settings" className="block">
            <div className="card-modern hover-lift backdrop-blur-lg p-6 hover:shadow-glow transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-gray-600/20 to-gray-500/20 backdrop-blur-sm flex items-center justify-center">
                  <Settings className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-200">Settings</h2>
                  <p className="text-sm text-gray-300">Configure your mobile experience</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Info Box */}
          <div className="card-modern backdrop-blur-lg border border-blue-500/30 p-4 mt-8">
            <p className="text-sm text-blue-300">
              <strong className="text-yellow-400">Mobile Access Only:</strong> This portal provides field access to VBA tools and settings. For full platform access, please use the desktop application.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-xs text-gray-400">
        IPC Mobile v1.0 • Inspection & Permit Control
      </div>
    </div>
  )
}