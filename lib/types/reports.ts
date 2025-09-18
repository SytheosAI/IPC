// Shared types for all report templates

export interface BaseReportData {
  // Project Information
  projectName: string
  projectAddress: string
  jobNumber: string
  permitNumber?: string
  contractNumber?: string

  // Company Information
  companyName: string
  companyAddress: string
  companyLocation: string
  companyPhone: string
  logo: string | null

  // Inspector/Engineer Information
  inspectorName: string
  inspectorLicense: string
  inspectorEmail: string

  // Report Information
  reportTitle: string
  reportSequence: string
  reportDate: string

  // Additional Information
  reference: string
  attention: string
  digitalSignature: string | null

  // Content
  generalContext: string
  observations: string
  recommendations: string

  // Photos
  photos: Array<{
    id: string
    url: string
    caption: string
  }>
}

export interface InspectionReportData extends BaseReportData {
  inspectionType: string
  weather: string
  workZone: string
  workPerformed: string
  drawingPage: string
  inspectionDate: string
}

export interface ComplianceReportData extends BaseReportData {
  complianceStandard: string
  complianceStatus: 'compliant' | 'non_compliant' | 'partial'
  violations: string[]
  correctiveActions: string
  complianceDate: string
  nextReviewDate: string
  auditScope: string
  regulatoryRequirements: string
  nonComplianceDetails: string
  complianceEvidence: string
}

export interface SafetyIncidentReportData extends BaseReportData {
  incidentType: string
  incidentDate: string
  incidentTime: string
  injuredParty: string
  witnessNames: string[]
  incidentDescription: string
  immediateActions: string
  rootCause: string
  preventiveMeasures: string
  reportedToOSHA: boolean
  severity: 'minor' | 'moderate' | 'severe' | 'fatal'
  locationOfIncident: string
  equipmentInvolved: string
  injuryType: string
  medicalAttentionRequired: boolean
  workStoppage: boolean
  supervisorNotified: string
  investigationFindings: string
}

export interface MaterialDefectReportData extends BaseReportData {
  materialType: string
  manufacturer: string
  batchLotNumber: string
  defectType: string
  defectDescription: string
  affectedQuantity: string
  discoveryDate: string
  supplierNotified: boolean
  replacementRequired: boolean
  costImpact: string
  deliveryDate: string
  installationDate: string
  testResults: string
  correctiveAction: string
  qualityControlMeasures: string
  approvedReplacement: string
  scheduleImpact: string
}

export interface EngineeringReportData extends BaseReportData {
  digitalSeal: string | null
  reportType: 'structural' | 'design' | 'analysis' | 'inspection' | 'assessment'
  engineeringStandards: string[]
  calculationsAttached: boolean
  drawingsAttached: boolean
  professionalOpinion: string
  engineeringRecommendations: string
  limitationsAndAssumptions: string
  peerReviewRequired: boolean
  sealDate: string
  designCriteria: string
  loadRequirements: string
  materialSpecifications: string
  constructionMethods: string
  codeCompliance: string
  structuralAnalysis: string
  safetyFactors: string
  qualityAssurance: string
}

export type ReportType = 'inspection' | 'compliance' | 'safety_incident' | 'material_defect' | 'engineering'

export interface ReportMetadata {
  id: string
  projectId: string
  reportType: ReportType
  reportTitle: string
  reportSequence: string
  reportDate: string
  status: 'draft' | 'final'
  generatedBy: string
  fileUrl?: string
  createdAt: string
  updatedAt: string
}

// Report configuration for each type
export const REPORT_CONFIGS = {
  inspection: {
    title: 'Inspection Report',
    filePrefix: 'Inspection Report',
    requiresWeather: true,
    requiresWorkZone: true,
    requiresPhotos: true,
    pdfMargins: { top: 20, bottom: 40, left: 20, right: 20 }
  },
  compliance: {
    title: 'Compliance Report',
    filePrefix: 'Compliance Report',
    requiresWeather: false,
    requiresWorkZone: false,
    requiresPhotos: true,
    pdfMargins: { top: 20, bottom: 40, left: 20, right: 20 }
  },
  safety_incident: {
    title: 'Safety/Incident Report',
    filePrefix: 'Safety Incident Report',
    requiresWeather: true,
    requiresWorkZone: true,
    requiresPhotos: true,
    pdfMargins: { top: 20, bottom: 40, left: 20, right: 20 }
  },
  material_defect: {
    title: 'Material/Installation Defect Report',
    filePrefix: 'Material Defect Report',
    requiresWeather: false,
    requiresWorkZone: true,
    requiresPhotos: true,
    pdfMargins: { top: 20, bottom: 40, left: 20, right: 20 }
  },
  engineering: {
    title: 'Engineering Report',
    filePrefix: 'Engineering Report',
    requiresWeather: false,
    requiresWorkZone: false,
    requiresPhotos: true,
    requiresSeal: true,
    pdfMargins: { top: 20, bottom: 40, left: 20, right: 20 }
  }
} as const

// Helper functions
export function generateReportFilename(reportType: ReportType, sequence: string, date?: Date): string {
  const reportDate = date || new Date()
  const year = reportDate.getFullYear().toString().slice(-2)
  const month = String(reportDate.getMonth() + 1).padStart(2, '0')
  const day = String(reportDate.getDate()).padStart(2, '0')
  const sequencePadded = sequence.padStart(3, '0')

  const config = REPORT_CONFIGS[reportType]
  return `${year} ${month} ${day} ${sequencePadded} - ${config.filePrefix}`
}

export function getReportTitle(reportType: ReportType): string {
  return REPORT_CONFIGS[reportType].title
}

export function validateReportData(reportType: ReportType, data: any): string[] {
  const errors: string[] = []

  // Common required fields
  if (!data.projectName) errors.push('Project name is required')
  if (!data.projectAddress) errors.push('Project address is required')
  if (!data.inspectorName) errors.push('Inspector name is required')
  if (!data.reportSequence) errors.push('Report sequence is required')
  if (!data.observations) errors.push('Observations are required')

  // Type-specific validation
  switch (reportType) {
    case 'inspection':
      if (!data.inspectionType) errors.push('Inspection type is required')
      if (!data.workPerformed) errors.push('Work performed is required')
      break

    case 'compliance':
      if (!data.complianceStandard) errors.push('Compliance standard is required')
      if (!data.complianceStatus) errors.push('Compliance status is required')
      break

    case 'safety_incident':
      if (!data.incidentType) errors.push('Incident type is required')
      if (!data.incidentDate) errors.push('Incident date is required')
      if (!data.severity) errors.push('Severity is required')
      break

    case 'material_defect':
      if (!data.materialType) errors.push('Material type is required')
      if (!data.defectType) errors.push('Defect type is required')
      if (!data.discoveryDate) errors.push('Discovery date is required')
      break

    case 'engineering':
      if (!data.reportType) errors.push('Engineering report type is required')
      if (!data.professionalOpinion) errors.push('Professional opinion is required')
      if (!data.sealDate) errors.push('Seal date is required')
      break
  }

  return errors
}