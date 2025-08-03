'use client'

import { useCallback, useEffect } from 'react'
import { vbaDataBridge, VBADataEvent } from '@/app/services/vbaDataBridge'

export function useVBAIntegration(projectId?: string) {
  // Send VBA event to main system
  const sendVBAEvent = useCallback((
    type: VBADataEvent['type'],
    data: any,
    projectName?: string
  ) => {
    if (!projectId) return

    const event: VBADataEvent = {
      type,
      projectId,
      projectName: projectName || 'VBA Project',
      data,
      timestamp: new Date().toISOString(),
      userId: 'current-user', // In production, get from auth context
      location: undefined
    }

    // Get location if available
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          event.location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          vbaDataBridge.sendEvent(event)
        },
        () => {
          // Send without location
          vbaDataBridge.sendEvent(event)
        }
      )
    } else {
      vbaDataBridge.sendEvent(event)
    }
  }, [projectId])

  // Track inspection completion
  const completeInspection = useCallback(async (
    inspectionType: string,
    result: 'pass' | 'fail' | 'partial',
    issues: any[],
    timeSpent: number,
    photos: number
  ) => {
    if (!projectId) return

    const inspectionData = {
      projectId,
      type: inspectionType,
      result,
      issues,
      timeSpent,
      photos,
      completedAt: new Date().toISOString(),
      inspectorId: 'current-user'
    }

    // Create report in main system
    const report = await vbaDataBridge.createInspectionReport(projectId, inspectionData)

    // Send completion event
    sendVBAEvent('inspection_complete', {
      inspectionType,
      result,
      reportId: report.id,
      issues: issues.length,
      timeSpent,
      photos
    })

    return report
  }, [projectId, sendVBAEvent])

  // Track photo uploads
  const uploadPhotos = useCallback((count: number, inspectionType?: string) => {
    sendVBAEvent('photo_uploaded', {
      count,
      inspectionType,
      timestamp: new Date().toISOString()
    })
  }, [sendVBAEvent])

  // Track check-ins
  const checkIn = useCallback((location: { lat: number; lng: number }) => {
    sendVBAEvent('checkin', {
      location,
      timestamp: new Date().toISOString()
    })
  }, [sendVBAEvent])

  // Track signatures
  const addSignature = useCallback((documentType: string, signerName: string) => {
    sendVBAEvent('signature', {
      documentType,
      signerName,
      timestamp: new Date().toISOString()
    })
  }, [sendVBAEvent])

  // Track issues
  const reportIssue = useCallback((
    severity: 'high' | 'medium' | 'low',
    description: string,
    category: string
  ) => {
    sendVBAEvent('issue_found', {
      severity,
      description,
      category,
      timestamp: new Date().toISOString()
    })
  }, [sendVBAEvent])

  // Listen for sync updates
  useEffect(() => {
    const handleSyncUpdate = () => {
      // Refresh local data when sync completes
      window.location.reload()
    }

    window.addEventListener('vba-sync-complete', handleSyncUpdate)
    return () => {
      window.removeEventListener('vba-sync-complete', handleSyncUpdate)
    }
  }, [])

  return {
    sendVBAEvent,
    completeInspection,
    uploadPhotos,
    checkIn,
    addSignature,
    reportIssue
  }
}