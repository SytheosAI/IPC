'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  useEffect(() => {
    // Redirect to control center
    router.push(`/projects/${projectId}/control-center`)
  }, [projectId, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 flex items-center justify-center">
      <div className="card-modern p-8 text-center shadow-glow">
        <div className="spinner-modern mx-auto mb-4"></div>
        <p className="text-yellow-400">Redirecting to Project Control Center...</p>
      </div>
    </div>
  )
}