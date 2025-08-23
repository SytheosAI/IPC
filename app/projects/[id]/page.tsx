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
    <div className="p-6 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Project Control Center...</p>
      </div>
    </div>
  )
}