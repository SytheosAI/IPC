/**
 * Jurisdiction API Integration
 * Handles permit submittal synchronization with jurisdiction systems
 */

export interface JurisdictionEndpoint {
  name: string
  apiUrl?: string
  webhookUrl?: string
  apiKey?: string
  authType: 'api_key' | 'oauth' | 'basic' | 'none'
  supportedMethods: ('submit' | 'status' | 'update' | 'documents')[]
  requiresManualSubmission: boolean
}

// Florida jurisdiction API endpoints and webhook configurations
export const JURISDICTION_ENDPOINTS: Record<string, JurisdictionEndpoint> = {
  'Miami-Dade County': {
    name: 'Miami-Dade County',
    apiUrl: 'https://api.miamidade.gov/permits/v1',
    webhookUrl: 'https://permits.miamidade.gov/webhooks/status',
    apiKey: process.env.MIAMI_DADE_API_KEY,
    authType: 'api_key',
    supportedMethods: ['submit', 'status', 'update', 'documents'],
    requiresManualSubmission: false
  },
  'Broward County': {
    name: 'Broward County',
    apiUrl: 'https://api.broward.org/building/permits',
    webhookUrl: 'https://permits.broward.org/api/webhooks',
    apiKey: process.env.BROWARD_API_KEY,
    authType: 'api_key',
    supportedMethods: ['submit', 'status', 'documents'],
    requiresManualSubmission: false
  },
  'Palm Beach County': {
    name: 'Palm Beach County',
    apiUrl: 'https://epermits.pbcgov.org/api/v2',
    apiKey: process.env.PALM_BEACH_API_KEY,
    authType: 'oauth',
    supportedMethods: ['submit', 'status', 'update'],
    requiresManualSubmission: false
  },
  'City of Miami': {
    name: 'City of Miami',
    apiUrl: 'https://permitsonline.miami.gov/api',
    apiKey: process.env.MIAMI_API_KEY,
    authType: 'api_key',
    supportedMethods: ['submit', 'status'],
    requiresManualSubmission: false
  },
  'City of Tampa': {
    name: 'City of Tampa',
    apiUrl: 'https://permits.tampagov.net/api/v1',
    webhookUrl: 'https://permits.tampagov.net/webhooks',
    authType: 'basic',
    supportedMethods: ['submit', 'status', 'update', 'documents'],
    requiresManualSubmission: false
  },
  'City of Orlando': {
    name: 'City of Orlando',
    apiUrl: 'https://permits.cityoforlando.net/api',
    apiKey: process.env.ORLANDO_API_KEY,
    authType: 'api_key',
    supportedMethods: ['submit', 'status'],
    requiresManualSubmission: false
  },
  'Lee County': {
    name: 'Lee County',
    apiUrl: 'https://econnect.leegov.com/api/permits',
    authType: 'oauth',
    supportedMethods: ['status'],
    requiresManualSubmission: true
  },
  'Jacksonville': {
    name: 'Jacksonville',
    apiUrl: 'https://permits.coj.net/api/v1',
    authType: 'api_key',
    supportedMethods: ['submit', 'status', 'documents'],
    requiresManualSubmission: false
  }
}

// Default configuration for jurisdictions without API
const DEFAULT_JURISDICTION: JurisdictionEndpoint = {
  name: 'Manual Submission Required',
  authType: 'none',
  supportedMethods: [],
  requiresManualSubmission: true
}

export interface SubmittalPayload {
  submittalNumber: string
  projectName: string
  projectAddress: string
  applicant: string
  contractor?: string
  type: string
  category: string
  jurisdiction: string
  documents: File[]
}

export interface SubmittalResponse {
  success: boolean
  jurisdictionId?: string
  trackingNumber?: string
  status?: string
  message: string
  nextSteps?: string[]
}

/**
 * Submit permit application to jurisdiction
 */
export async function submitToJurisdiction(
  payload: SubmittalPayload
): Promise<SubmittalResponse> {
  const endpoint = JURISDICTION_ENDPOINTS[payload.jurisdiction] || DEFAULT_JURISDICTION

  if (endpoint.requiresManualSubmission) {
    return {
      success: true,
      message: `Submittal prepared for ${payload.jurisdiction}. Manual submission required.`,
      nextSteps: [
        `Visit ${payload.jurisdiction} permit office or website`,
        'Upload documents to jurisdiction portal',
        'Reference submittal number: ' + payload.submittalNumber
      ]
    }
  }

  if (!endpoint.apiUrl || !endpoint.supportedMethods.includes('submit')) {
    return {
      success: false,
      message: `Electronic submission not available for ${payload.jurisdiction}`,
      nextSteps: ['Contact jurisdiction directly for submission instructions']
    }
  }

  try {
    // Prepare form data
    const formData = new FormData()
    formData.append('project_name', payload.projectName)
    formData.append('project_address', payload.projectAddress)
    formData.append('applicant', payload.applicant)
    if (payload.contractor) formData.append('contractor', payload.contractor)
    formData.append('permit_type', payload.type)
    formData.append('category', payload.category)
    formData.append('reference_number', payload.submittalNumber)

    // Add documents
    payload.documents.forEach((doc, index) => {
      formData.append(`document_${index}`, doc)
    })

    // Set up headers based on auth type
    const headers: HeadersInit = {}
    if (endpoint.authType === 'api_key' && endpoint.apiKey) {
      headers['X-API-Key'] = endpoint.apiKey
    } else if (endpoint.authType === 'basic') {
      // Basic auth would be configured here
      headers['Authorization'] = `Basic ${btoa('username:password')}`
    }

    // Submit to jurisdiction API
    const response = await fetch(`${endpoint.apiUrl}/submittals`, {
      method: 'POST',
      headers,
      body: formData
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        jurisdictionId: data.id || data.submittal_id,
        trackingNumber: data.tracking_number,
        status: data.status || 'submitted',
        message: `Successfully submitted to ${payload.jurisdiction}`,
        nextSteps: data.next_steps || [
          'Monitor status in dashboard',
          'Check email for updates',
          'Respond to any review comments'
        ]
      }
    } else {
      const error = await response.text()
      return {
        success: false,
        message: `Submission failed: ${error}`,
        nextSteps: ['Review error message', 'Contact support if needed']
      }
    }
  } catch (error) {
    console.error('Jurisdiction submission error:', error)
    return {
      success: false,
      message: `Network error submitting to ${payload.jurisdiction}`,
      nextSteps: ['Check internet connection', 'Try again later', 'Contact support']
    }
  }
}

/**
 * Check permit status from jurisdiction
 */
export async function checkPermitStatus(
  jurisdiction: string,
  trackingNumber: string
): Promise<any> {
  const endpoint = JURISDICTION_ENDPOINTS[jurisdiction] || DEFAULT_JURISDICTION

  if (!endpoint.apiUrl || !endpoint.supportedMethods.includes('status')) {
    return {
      success: false,
      message: 'Status check not available for this jurisdiction'
    }
  }

  try {
    const headers: HeadersInit = {}
    if (endpoint.apiKey) headers['X-API-Key'] = endpoint.apiKey

    const response = await fetch(
      `${endpoint.apiUrl}/status/${trackingNumber}`,
      { headers }
    )

    if (response.ok) {
      return await response.json()
    }
    
    return {
      success: false,
      message: 'Unable to retrieve status'
    }
  } catch (error) {
    console.error('Status check error:', error)
    return {
      success: false,
      message: 'Error checking permit status'
    }
  }
}

/**
 * Register webhook for status updates
 */
export async function registerWebhook(
  jurisdiction: string,
  submittalId: string,
  callbackUrl: string
): Promise<boolean> {
  const endpoint = JURISDICTION_ENDPOINTS[jurisdiction]
  
  if (!endpoint?.webhookUrl) {
    console.log(`No webhook support for ${jurisdiction}`)
    return false
  }

  try {
    const response = await fetch(endpoint.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(endpoint.apiKey && { 'X-API-Key': endpoint.apiKey })
      },
      body: JSON.stringify({
        submittal_id: submittalId,
        callback_url: callbackUrl,
        events: ['status_change', 'comment_added', 'document_requested']
      })
    })

    return response.ok
  } catch (error) {
    console.error('Webhook registration error:', error)
    return false
  }
}

/**
 * Get jurisdiction configuration
 */
export function getJurisdictionConfig(jurisdiction: string): JurisdictionEndpoint {
  return JURISDICTION_ENDPOINTS[jurisdiction] || DEFAULT_JURISDICTION
}

/**
 * Check if jurisdiction supports electronic submission
 */
export function supportsElectronicSubmission(jurisdiction: string): boolean {
  const endpoint = JURISDICTION_ENDPOINTS[jurisdiction]
  return endpoint ? !endpoint.requiresManualSubmission : false
}