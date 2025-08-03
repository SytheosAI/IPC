// VBA Data Bridge - Connects mobile VBA data with main PlanX system

export interface VBADataEvent {
  type: 'inspection_complete' | 'issue_found' | 'photo_uploaded' | 'checkin' | 'signature'
  projectId: string
  projectName: string
  data: any
  timestamp: string
  userId: string
  location?: { lat: number; lng: number }
}

class VBADataBridge {
  private static instance: VBADataBridge
  private eventQueue: VBADataEvent[] = []
  private syncInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.startAutoSync()
  }

  static getInstance(): VBADataBridge {
    if (!VBADataBridge.instance) {
      VBADataBridge.instance = new VBADataBridge()
    }
    return VBADataBridge.instance
  }

  // Send VBA event to main system
  async sendEvent(event: VBADataEvent) {
    this.eventQueue.push(event)
    
    // Try immediate sync
    if (navigator.onLine) {
      await this.syncEvents()
    }
  }

  // Sync events with main system
  private async syncEvents() {
    if (this.eventQueue.length === 0) return

    const eventsToSync = [...this.eventQueue]
    this.eventQueue = []

    try {
      // Send to main dashboard
      await fetch('/api/vba/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: eventsToSync,
          source: 'mobile_vba'
        })
      })

      // Update local storage for dashboard
      const activities = JSON.parse(localStorage.getItem('planx-activities') || '[]')
      eventsToSync.forEach(event => {
        activities.unshift({
          id: `vba-${Date.now()}-${Math.random()}`,
          type: 'vba',
          subType: event.type,
          title: this.getEventTitle(event),
          description: this.getEventDescription(event),
          timestamp: event.timestamp,
          projectId: event.projectId,
          projectName: event.projectName,
          userId: event.userId,
          location: event.location
        })
      })
      
      // Keep only last 50 activities
      localStorage.setItem('planx-activities', JSON.stringify(activities.slice(0, 50)))
      
      // Trigger dashboard refresh
      window.dispatchEvent(new CustomEvent('vba-activity-update'))
    } catch (error) {
      console.error('Failed to sync VBA events:', error)
      // Re-add events to queue
      this.eventQueue = [...eventsToSync, ...this.eventQueue]
    }
  }

  private getEventTitle(event: VBADataEvent): string {
    switch (event.type) {
      case 'inspection_complete':
        return 'Inspection Completed'
      case 'issue_found':
        return 'Issue Identified'
      case 'photo_uploaded':
        return 'Photos Added'
      case 'checkin':
        return 'Site Check-in'
      case 'signature':
        return 'Document Signed'
      default:
        return 'VBA Activity'
    }
  }

  private getEventDescription(event: VBADataEvent): string {
    switch (event.type) {
      case 'inspection_complete':
        return `${event.data.inspectionType} inspection completed for ${event.projectName}`
      case 'issue_found':
        return `${event.data.severity} severity issue found at ${event.projectName}`
      case 'photo_uploaded':
        return `${event.data.count} photos uploaded for ${event.projectName}`
      case 'checkin':
        return `Inspector checked in at ${event.projectName}`
      case 'signature':
        return `${event.data.documentType} signed for ${event.projectName}`
      default:
        return `Activity recorded for ${event.projectName}`
    }
  }

  // Auto-sync every 30 seconds
  private startAutoSync() {
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && this.eventQueue.length > 0) {
        this.syncEvents()
      }
    }, 30000)
  }

  // Create inspection report in main system
  async createInspectionReport(projectId: string, inspectionData: any) {
    const report = {
      id: `report-${Date.now()}`,
      projectId,
      type: 'vba_inspection',
      data: inspectionData,
      createdAt: new Date().toISOString(),
      status: 'pending_review'
    }

    // Save to main system
    const reports = JSON.parse(localStorage.getItem('planx-reports') || '[]')
    reports.unshift(report)
    localStorage.setItem('planx-reports', JSON.stringify(reports))

    // Notify main dashboard
    this.sendEvent({
      type: 'inspection_complete',
      projectId,
      projectName: inspectionData.projectName,
      data: {
        inspectionType: inspectionData.type,
        result: inspectionData.result,
        issues: inspectionData.issues
      },
      timestamp: new Date().toISOString(),
      userId: inspectionData.inspectorId
    })

    return report
  }

  // Get VBA stats for main dashboard
  static getVBAStats() {
    const vbaProjects = JSON.parse(localStorage.getItem('vba-projects') || '[]')
    const activities = JSON.parse(localStorage.getItem('planx-activities') || '[]')
    
    const today = new Date().toDateString()
    const vbaActivitiesToday = activities.filter((a: any) => 
      a.type === 'vba' && new Date(a.timestamp).toDateString() === today
    )

    return {
      activeInspections: vbaProjects.filter((p: any) => p.status === 'in_progress').length,
      completedToday: vbaActivitiesToday.filter((a: any) => a.subType === 'inspection_complete').length,
      totalPhotos: vbaActivitiesToday.filter((a: any) => a.subType === 'photo_uploaded')
        .reduce((sum: number, a: any) => sum + (a.data?.count || 0), 0),
      activeInspectors: new Set(vbaActivitiesToday.map((a: any) => a.userId)).size
    }
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
  }
}

export default VBADataBridge

// Export singleton instance
export const vbaDataBridge = VBADataBridge.getInstance()