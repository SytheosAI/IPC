// Permit Portal Integration Module for IPC
// Integrates with major Florida permitting systems

import { supabase } from './supabase-client'

// Supported portal providers
export type PortalProvider = 'tyler' | 'accela' | 'cityview' | 'citizenserve' | 'viewpoint' | 'custom'

// API credential storage
export interface PortalCredentials {
  id: string
  jurisdiction: string
  provider: PortalProvider
  apiUrl: string
  apiKey?: string
  clientId?: string
  clientSecret?: string
  username?: string
  password?: string
  sandbox: boolean
  active: boolean
  created_at?: string
  updated_at?: string
}

// Permit status mapping
export interface PermitStatus {
  portalStatus: string
  ipcStatus: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'issued' | 'closed' | 'on_hold'
  lastUpdated: string
  nextAction?: string
}

// Permit data structure
export interface PermitData {
  id: string
  permitNumber: string
  projectId: string
  jurisdiction: string
  type: string
  status: PermitStatus
  submittedDate?: string
  approvedDate?: string
  expirationDate?: string
  inspections?: PermitInspection[]
  documents?: PermitDocument[]
  fees?: PermitFee[]
  contacts?: PermitContact[]
  timeline?: PermitEvent[]
}

export interface PermitInspection {
  id: string
  type: string
  status: 'scheduled' | 'passed' | 'failed' | 'cancelled'
  scheduledDate?: string
  completedDate?: string
  inspector?: string
  comments?: string
}

export interface PermitDocument {
  id: string
  name: string
  type: string
  url?: string
  uploadedDate: string
  status: 'pending' | 'approved' | 'rejected'
  comments?: string
}

export interface PermitFee {
  id: string
  description: string
  amount: number
  status: 'unpaid' | 'paid' | 'waived'
  dueDate?: string
  paidDate?: string
}

export interface PermitContact {
  name: string
  role: string
  email?: string
  phone?: string
}

export interface PermitEvent {
  timestamp: string
  event: string
  description: string
  user?: string
}

// Base Portal Integration Class
export abstract class PortalIntegration {
  protected credentials: PortalCredentials
  
  constructor(credentials: PortalCredentials) {
    this.credentials = credentials
  }
  
  // Abstract methods that each provider must implement
  abstract authenticate(): Promise<boolean>
  abstract submitPermit(data: any): Promise<string>
  abstract getPermitStatus(permitNumber: string): Promise<PermitStatus>
  abstract getPermitDetails(permitNumber: string): Promise<PermitData>
  abstract scheduleInspection(permitNumber: string, inspection: any): Promise<boolean>
  abstract uploadDocument(permitNumber: string, document: File): Promise<boolean>
  abstract getInspectionResults(permitNumber: string): Promise<PermitInspection[]>
  abstract searchPermits(query: any): Promise<PermitData[]>
  
  // Common helper methods
  protected async logActivity(action: string, details: any) {
    await supabase.from('permit_portal_logs').insert({
      jurisdiction: this.credentials.jurisdiction,
      provider: this.credentials.provider,
      action,
      details,
      timestamp: new Date().toISOString()
    })
  }
  
  protected mapStatus(portalStatus: string): PermitStatus['ipcStatus'] {
    // Default status mapping - override in specific implementations
    const statusMap: Record<string, PermitStatus['ipcStatus']> = {
      'submitted': 'submitted',
      'pending': 'under_review',
      'in review': 'under_review',
      'approved': 'approved',
      'rejected': 'rejected',
      'issued': 'issued',
      'closed': 'closed',
      'on hold': 'on_hold',
      'expired': 'closed'
    }
    
    return statusMap[portalStatus.toLowerCase()] || 'submitted'
  }
}

// Tyler Technologies Integration
export class TylerIntegration extends PortalIntegration {
  private accessToken?: string
  
  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(`${this.credentials.apiUrl}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret,
          grant_type: 'client_credentials'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        this.accessToken = data.access_token
        await this.logActivity('authentication', { status: 'success' })
        return true
      }
      
      await this.logActivity('authentication', { status: 'failed' })
      return false
    } catch (error) {
      await this.logActivity('authentication', { status: 'error', error })
      return false
    }
  }
  
  async submitPermit(data: any): Promise<string> {
    if (!this.accessToken) await this.authenticate()
    
    const response = await fetch(`${this.credentials.apiUrl}/permits`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    
    const result = await response.json()
    await this.logActivity('permit_submission', { permitNumber: result.permitNumber })
    return result.permitNumber
  }
  
  async getPermitStatus(permitNumber: string): Promise<PermitStatus> {
    if (!this.accessToken) await this.authenticate()
    
    const response = await fetch(`${this.credentials.apiUrl}/permits/${permitNumber}/status`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      }
    })
    
    const data = await response.json()
    return {
      portalStatus: data.status,
      ipcStatus: this.mapStatus(data.status),
      lastUpdated: data.lastModified || new Date().toISOString(),
      nextAction: data.nextRequiredAction
    }
  }
  
  async getPermitDetails(permitNumber: string): Promise<PermitData> {
    if (!this.accessToken) await this.authenticate()
    
    const response = await fetch(`${this.credentials.apiUrl}/permits/${permitNumber}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      }
    })
    
    const data = await response.json()
    return this.transformTylerData(data)
  }
  
  async scheduleInspection(permitNumber: string, inspection: any): Promise<boolean> {
    if (!this.accessToken) await this.authenticate()
    
    const response = await fetch(`${this.credentials.apiUrl}/permits/${permitNumber}/inspections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inspection)
    })
    
    await this.logActivity('inspection_scheduled', { permitNumber, inspection })
    return response.ok
  }
  
  async uploadDocument(permitNumber: string, document: File): Promise<boolean> {
    if (!this.accessToken) await this.authenticate()
    
    const formData = new FormData()
    formData.append('document', document)
    formData.append('permitNumber', permitNumber)
    
    const response = await fetch(`${this.credentials.apiUrl}/permits/${permitNumber}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: formData
    })
    
    await this.logActivity('document_uploaded', { permitNumber, documentName: document.name })
    return response.ok
  }
  
  async getInspectionResults(permitNumber: string): Promise<PermitInspection[]> {
    if (!this.accessToken) await this.authenticate()
    
    const response = await fetch(`${this.credentials.apiUrl}/permits/${permitNumber}/inspections`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      }
    })
    
    const data = await response.json()
    return data.inspections.map(this.transformInspection)
  }
  
  async searchPermits(query: any): Promise<PermitData[]> {
    if (!this.accessToken) await this.authenticate()
    
    const params = new URLSearchParams(query)
    const response = await fetch(`${this.credentials.apiUrl}/permits/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      }
    })
    
    const data = await response.json()
    return data.results.map((permit: any) => this.transformTylerData(permit))
  }
  
  private transformTylerData(data: any): PermitData {
    return {
      id: data.id,
      permitNumber: data.permitNumber,
      projectId: data.projectId || '',
      jurisdiction: this.credentials.jurisdiction,
      type: data.permitType,
      status: {
        portalStatus: data.status,
        ipcStatus: this.mapStatus(data.status),
        lastUpdated: data.lastModified
      },
      submittedDate: data.applicationDate,
      approvedDate: data.approvalDate,
      expirationDate: data.expirationDate,
      inspections: data.inspections?.map(this.transformInspection),
      documents: data.documents?.map(this.transformDocument),
      fees: data.fees?.map(this.transformFee),
      timeline: data.timeline
    }
  }
  
  private transformInspection(inspection: any): PermitInspection {
    return {
      id: inspection.id,
      type: inspection.inspectionType,
      status: inspection.status,
      scheduledDate: inspection.scheduledDate,
      completedDate: inspection.completedDate,
      inspector: inspection.inspectorName,
      comments: inspection.comments
    }
  }
  
  private transformDocument(doc: any): PermitDocument {
    return {
      id: doc.id,
      name: doc.fileName,
      type: doc.documentType,
      url: doc.downloadUrl,
      uploadedDate: doc.uploadDate,
      status: doc.reviewStatus,
      comments: doc.reviewComments
    }
  }
  
  private transformFee(fee: any): PermitFee {
    return {
      id: fee.id,
      description: fee.feeDescription,
      amount: fee.amount,
      status: fee.paymentStatus,
      dueDate: fee.dueDate,
      paidDate: fee.paidDate
    }
  }
}

// Accela Integration
export class AccelaIntegration extends PortalIntegration {
  private sessionId?: string
  
  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(`${this.credentials.apiUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: this.credentials.username!,
          password: this.credentials.password!,
          agency_name: this.credentials.jurisdiction,
          environment: this.credentials.sandbox ? 'TEST' : 'PROD'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        this.sessionId = data.access_token
        return true
      }
      return false
    } catch (error) {
      console.error('Accela authentication failed:', error)
      return false
    }
  }
  
  async submitPermit(data: any): Promise<string> {
    if (!this.sessionId) await this.authenticate()
    
    const response = await fetch(`${this.credentials.apiUrl}/v4/records`, {
      method: 'POST',
      headers: {
        'Authorization': this.sessionId!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: data.permitType,
        description: data.description,
        ...data
      })
    })
    
    const result = await response.json()
    return result.result[0].id
  }
  
  async getPermitStatus(permitNumber: string): Promise<PermitStatus> {
    if (!this.sessionId) await this.authenticate()
    
    const response = await fetch(`${this.credentials.apiUrl}/v4/records/${permitNumber}`, {
      headers: {
        'Authorization': this.sessionId!,
      }
    })
    
    const data = await response.json()
    const record = data.result[0]
    
    return {
      portalStatus: record.status.value,
      ipcStatus: this.mapStatus(record.status.value),
      lastUpdated: record.updateDate,
      nextAction: record.nextInspectionType
    }
  }
  
  async getPermitDetails(permitNumber: string): Promise<PermitData> {
    if (!this.sessionId) await this.authenticate()
    
    const response = await fetch(`${this.credentials.apiUrl}/v4/records/${permitNumber}`, {
      headers: {
        'Authorization': this.sessionId!,
      }
    })
    
    const data = await response.json()
    return this.transformAccelaData(data.result[0])
  }
  
  async scheduleInspection(permitNumber: string, inspection: any): Promise<boolean> {
    if (!this.sessionId) await this.authenticate()
    
    const response = await fetch(`${this.credentials.apiUrl}/v4/inspections`, {
      method: 'POST',
      headers: {
        'Authorization': this.sessionId!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recordId: permitNumber,
        type: inspection.type,
        scheduledDate: inspection.date,
        ...inspection
      })
    })
    
    return response.ok
  }
  
  async uploadDocument(permitNumber: string, document: File): Promise<boolean> {
    if (!this.sessionId) await this.authenticate()
    
    const formData = new FormData()
    formData.append('uploadedFile', document)
    formData.append('recordId', permitNumber)
    
    const response = await fetch(`${this.credentials.apiUrl}/v4/documents`, {
      method: 'POST',
      headers: {
        'Authorization': this.sessionId!,
      },
      body: formData
    })
    
    return response.ok
  }
  
  async getInspectionResults(permitNumber: string): Promise<PermitInspection[]> {
    if (!this.sessionId) await this.authenticate()
    
    const response = await fetch(`${this.credentials.apiUrl}/v4/inspections?recordId=${permitNumber}`, {
      headers: {
        'Authorization': this.sessionId!,
      }
    })
    
    const data = await response.json()
    return data.result.map(this.transformAccelaInspection)
  }
  
  async searchPermits(query: any): Promise<PermitData[]> {
    if (!this.sessionId) await this.authenticate()
    
    const response = await fetch(`${this.credentials.apiUrl}/v4/records/search`, {
      method: 'POST',
      headers: {
        'Authorization': this.sessionId!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query)
    })
    
    const data = await response.json()
    return data.result.map((record: any) => this.transformAccelaData(record))
  }
  
  private transformAccelaData(data: any): PermitData {
    return {
      id: data.id,
      permitNumber: data.customId || data.id,
      projectId: data.projectId || '',
      jurisdiction: this.credentials.jurisdiction,
      type: data.type?.type || '',
      status: {
        portalStatus: data.status?.value || '',
        ipcStatus: this.mapStatus(data.status?.value || ''),
        lastUpdated: data.updateDate
      },
      submittedDate: data.openedDate,
      approvedDate: data.statusDate,
      expirationDate: data.expirationDate,
      timeline: data.statusHistory
    }
  }
  
  private transformAccelaInspection(inspection: any): PermitInspection {
    return {
      id: inspection.id,
      type: inspection.type?.value || '',
      status: inspection.status?.value || 'scheduled',
      scheduledDate: inspection.scheduleDate,
      completedDate: inspection.completedDate,
      inspector: inspection.inspector?.value || '',
      comments: inspection.resultComment
    }
  }
}

// Portal Integration Factory
export class PortalIntegrationFactory {
  static create(credentials: PortalCredentials): PortalIntegration {
    switch (credentials.provider) {
      case 'tyler':
        return new TylerIntegration(credentials)
      case 'accela':
        return new AccelaIntegration(credentials)
      // Add more providers as needed
      default:
        throw new Error(`Unsupported portal provider: ${credentials.provider}`)
    }
  }
}

// Portal Integration Manager
export class PortalIntegrationManager {
  private integrations: Map<string, PortalIntegration> = new Map()
  
  async loadCredentials(): Promise<PortalCredentials[]> {
    const { data, error } = await supabase
      .from('portal_credentials')
      .select('*')
      .eq('active', true)
    
    if (error) throw error
    return data || []
  }
  
  async initializeIntegrations() {
    const credentials = await this.loadCredentials()
    
    for (const cred of credentials) {
      try {
        const integration = PortalIntegrationFactory.create(cred)
        const authenticated = await integration.authenticate()
        
        if (authenticated) {
          this.integrations.set(cred.jurisdiction, integration)
        }
      } catch (error) {
        console.error(`Failed to initialize ${cred.jurisdiction}:`, error)
      }
    }
  }
  
  getIntegration(jurisdiction: string): PortalIntegration | undefined {
    return this.integrations.get(jurisdiction)
  }
  
  async syncPermit(jurisdiction: string, permitNumber: string): Promise<PermitData | null> {
    const integration = this.getIntegration(jurisdiction)
    
    if (!integration) {
      console.error(`No integration found for ${jurisdiction}`)
      return null
    }
    
    try {
      const permitData = await integration.getPermitDetails(permitNumber)
      
      // Save to database
      await supabase.from('permits').upsert({
        permit_number: permitData.permitNumber,
        jurisdiction: permitData.jurisdiction,
        status: permitData.status.ipcStatus,
        portal_status: permitData.status.portalStatus,
        last_synced: new Date().toISOString(),
        data: permitData
      })
      
      return permitData
    } catch (error) {
      console.error(`Failed to sync permit ${permitNumber}:`, error)
      return null
    }
  }
  
  async syncAllPermits() {
    const { data: permits } = await supabase
      .from('permits')
      .select('jurisdiction, permit_number')
    
    if (!permits) return
    
    for (const permit of permits) {
      await this.syncPermit(permit.jurisdiction, permit.permit_number)
    }
  }
}