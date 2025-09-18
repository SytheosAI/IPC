// Unique information and formatting elements for each report type

export interface ComplianceReportSpecifics {
  // Header Elements
  reportType: 'Compliance Report'
  regulatoryBody: string // e.g., "OSHA", "EPA", "Building Department"
  complianceStandard: string // e.g., "IBC 2021", "OSHA 1926.95"
  auditDate: string

  // Content Structure
  scopeOfCompliance: string
  regulatoryRequirements: string[]
  complianceStatus: 'compliant' | 'non_compliant' | 'partial'

  // Findings Section (unique formatting)
  complianceFindings: Array<{
    requirement: string
    status: 'compliant' | 'non_compliant' | 'not_applicable'
    observations: string
    evidence?: string
  }>

  // Non-Compliance Details (if applicable)
  violations: Array<{
    code: string
    description: string
    severity: 'minor' | 'major' | 'critical'
    correctionRequired: boolean
    timeframe?: string
  }>

  // Corrective Actions
  correctiveActions: Array<{
    violation: string
    action: string
    responsible: string
    deadline: string
    status: 'pending' | 'in_progress' | 'completed'
  }>

  // Follow-up Requirements
  nextReviewDate: string
  followUpRequired: boolean
  certificationRequired: boolean

  // Special Formatting Elements
  complianceMatrix: boolean // Show table format
  attachComplianceCertificate: boolean
}

export interface SafetyIncidentReportSpecifics {
  // Header Elements (OSHA Required)
  reportType: 'Safety/Incident Report'
  oshaReportable: boolean
  oshaFormRequired: string // "300", "301", "None"
  incidentNumber: string

  // Incident Details (Critical Section)
  incidentDateTime: {
    date: string
    time: string
    timezone: string
  }

  incidentLocation: {
    specificLocation: string
    area: string
    coordinates?: string
    weatherConditions: string
  }

  // People Involved (Special formatting for privacy)
  injuredParty: {
    name: string // May be redacted in some versions
    age?: number
    position: string
    experience: string
    employedBy: string
  }

  witnesses: Array<{
    name: string
    position: string
    contact: string
    statement?: string
  }>

  // Incident Classification
  incidentType: 'injury' | 'near_miss' | 'property_damage' | 'environmental' | 'security'
  severity: 'minor' | 'moderate' | 'severe' | 'fatal'
  bodyPartAffected?: string[]
  injuryType?: 'cut' | 'bruise' | 'fracture' | 'burn' | 'strain' | 'other'

  // Immediate Response (Timeline format)
  immediateActions: Array<{
    time: string
    action: string
    performedBy: string
  }>

  // Medical Response
  medicalAttention: {
    required: boolean
    type: 'first_aid' | 'medical_treatment' | 'hospital' | 'none'
    provider?: string
    outcome?: string
  }

  // Work Impact
  workStoppageRequired: boolean
  areaSecured: boolean
  equipmentImpounded: boolean

  // Investigation Details
  investigationTeam: string[]
  rootCauseAnalysis: {
    primaryCause: string
    contributingFactors: string[]
    humanFactors: string[]
    environmentalFactors: string[]
    equipmentFactors: string[]
  }

  // Prevention Measures (Action-oriented formatting)
  preventiveMeasures: Array<{
    measure: string
    implementation: 'immediate' | 'short_term' | 'long_term'
    responsible: string
    targetDate: string
  }>

  // Regulatory Notifications
  notificationsRequired: Array<{
    agency: string // OSHA, Insurance, etc.
    deadline: string
    completed: boolean
    confirmationNumber?: string
  }>

  // Special Formatting Elements
  includePhotos: boolean
  includeStatements: boolean
  confidentialityLevel: 'public' | 'internal' | 'restricted'
}

export interface MaterialDefectReportSpecifics {
  // Header Elements
  reportType: 'Material/Installation Defect Report'
  defectCategory: 'material' | 'installation' | 'design' | 'workmanship'
  urgency: 'low' | 'medium' | 'high' | 'critical'

  // Material Information (Product-focused)
  materialDetails: {
    type: string
    manufacturer: string
    model: string
    batchLotNumber: string
    serialNumber?: string
    specifications: string
    supplier: string
    purchaseOrder?: string
    deliveryDate: string
    installationDate: string
  }

  // Defect Classification
  defectType: 'dimensional' | 'structural' | 'cosmetic' | 'functional' | 'safety'
  defectDescription: string
  defectCause: 'manufacturing' | 'shipping' | 'storage' | 'installation' | 'design' | 'unknown'

  // Scope of Impact
  affectedQuantity: {
    units: number
    description: string
    locations: string[]
    percentageOfTotal: number
  }

  // Discovery Information
  discoveryDetails: {
    date: string
    discoveredBy: string
    discoveryMethod: 'inspection' | 'testing' | 'failure' | 'complaint'
    circumstances: string
  }

  // Quality Control Information
  testResults: Array<{
    testType: string
    standard: string
    expectedResult: string
    actualResult: string
    status: 'pass' | 'fail' | 'marginal'
  }>

  // Impact Assessment
  impactAssessment: {
    structural: 'none' | 'minor' | 'moderate' | 'severe'
    safety: 'none' | 'minor' | 'moderate' | 'severe'
    schedule: 'none' | 'minor' | 'moderate' | 'severe'
    cost: string
    warranty: boolean
  }

  // Supplier Communication (Business-focused)
  supplierNotification: {
    notified: boolean
    date?: string
    method?: string
    response?: string
    claimNumber?: string
  }

  // Corrective Actions (Project management format)
  correctiveActions: Array<{
    action: 'replace' | 'repair' | 'accept' | 'reject'
    description: string
    cost: string
    timeframe: string
    responsible: string
    approval: 'pending' | 'approved' | 'denied'
  }>

  // Quality Assurance Measures
  qaEnhancements: Array<{
    measure: string
    implementation: string
    responsible: string
    effectiveDate: string
  }>

  // Special Formatting Elements
  includeTestData: boolean
  includeSpecifications: boolean
  requireApprovals: boolean
  attachWarrantyInfo: boolean
}

export interface EngineeringReportSpecifics {
  // Header Elements (Professional/Legal)
  reportType: 'Engineering Report'
  reportSubtype: 'structural' | 'design' | 'analysis' | 'inspection' | 'assessment' | 'peer_review'
  sealRequired: boolean
  peerReviewRequired: boolean

  // Professional Credentials (Emphasized)
  engineer: {
    name: string
    title: string
    licenseNumber: string
    licenseState: string
    expirationDate: string
    specializations: string[]
    firmName: string
    firmLicense?: string
  }

  // Technical Scope (Detailed)
  engineeringScope: {
    purpose: string
    designCriteria: string[]
    applicableCodes: string[]
    loadRequirements: string[]
    analysisMethod: string[]
    assumptions: string[]
  }

  // Standards and Codes (Regulatory emphasis)
  engineeringStandards: Array<{
    code: string
    version: string
    section: string
    applicability: string
  }>

  // Technical Analysis (Scientific format)
  technicalFindings: {
    structuralAnalysis?: string
    loadAnalysis?: string
    materialProperties?: string
    safetyFactors?: string
    designMargins?: string
    codeCompliance?: string
  }

  // Professional Opinion (Legal weight)
  professionalOpinion: {
    summary: string
    conclusions: string[]
    limitations: string[]
    assumptions: string[]
    confidence: 'high' | 'medium' | 'low'
  }

  // Engineering Recommendations (Actionable)
  engineeringRecommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low'
    recommendation: string
    justification: string
    timeframe: string
    cost?: string
  }>

  // Technical Attachments
  attachments: {
    calculations: boolean
    drawings: boolean
    specifications: boolean
    testResults: boolean
    codeAnalysis: boolean
    precedentStudies: boolean
  }

  // Professional Sealing Information
  sealInformation: {
    sealDate: string
    digitalSeal: string
    sealStatement: string
    revisionNumber: string
    originalDate?: string
  }

  // Peer Review (if required)
  peerReview?: {
    required: boolean
    reviewer?: string
    reviewDate?: string
    reviewComments?: string
    approval?: boolean
  }

  // Legal/Professional Elements
  limitationsAndDisclaimer: string
  professionalLiability: string
  copyrightNotice: string

  // Special Formatting Elements
  includeCalculations: boolean
  includeDrawings: boolean
  technicalFormatting: boolean
  legalFormatting: boolean
}

// Report formatting configurations
export const REPORT_FORMATTING = {
  compliance: {
    useTable: true,
    includeMatrix: true,
    emphasizeViolations: true,
    colorCoding: {
      compliant: '#10B981',
      nonCompliant: '#EF4444',
      partial: '#F59E0B'
    }
  },

  safetyIncident: {
    includeTimeline: true,
    emphasizeUrgency: true,
    protectPrivacy: true,
    oshaFormatting: true,
    colorCoding: {
      minor: '#10B981',
      moderate: '#F59E0B',
      severe: '#EF4444',
      fatal: '#7C2D12'
    }
  },

  materialDefect: {
    includeProductInfo: true,
    emphasizeCosts: true,
    trackingNumbers: true,
    supplierFocus: true,
    colorCoding: {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#7C2D12'
    }
  },

  engineering: {
    professionalFormat: true,
    includeSeal: true,
    emphasizeCodes: true,
    technicalLayout: true,
    legalDisclaimer: true,
    colorCoding: {
      approved: '#10B981',
      conditional: '#F59E0B',
      rejected: '#EF4444'
    }
  }
} as const

// Content templates for professional language
export const PROFESSIONAL_LANGUAGE = {
  compliance: {
    introduction: "monitor compliance with applicable building codes and regulations",
    conclusion: "Based on the review conducted, the following compliance status has been determined:"
  },

  safetyIncident: {
    introduction: "investigate and document the safety incident that occurred",
    conclusion: "The investigation has been completed and corrective measures have been identified:"
  },

  materialDefect: {
    introduction: "investigate and assess material defects identified during construction",
    conclusion: "The material defect assessment has been completed with the following determinations:"
  },

  engineering: {
    introduction: "provide professional engineering analysis and recommendations",
    conclusion: "Based on the engineering analysis conducted, the following professional opinion is provided:"
  }
} as const