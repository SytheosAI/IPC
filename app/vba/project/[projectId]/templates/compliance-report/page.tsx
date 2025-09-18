'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Shield, FileText, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { db } from '@/lib/db-client'
import { FormWizard, FormProgress, FormStep, FormNavigation, AutoSaveIndicator } from '@/app/components/forms/FormWizard'
import { ComplianceReportSpecifics } from '@/lib/types/reportSpecifics'
import { StandardReportGenerator } from '@/lib/utils/standardReportGenerator'

interface ComplianceFormData extends ComplianceReportSpecifics {
  // Base report data
  projectName: string
  projectAddress: string
  jobNumber: string
  permitNumber: string
  contractNumber: string
  companyName: string
  companyAddress: string
  companyLocation: string
  companyPhone: string
  logo: string | null
  inspectorName: string
  inspectorLicense: string
  inspectorEmail: string
  reportTitle: string
  reportSequence: string
  reportDate: string
  reference: string
  attention: string
  digitalSignature: string | null
  generalContext: string
  observations: string
  recommendations: string
  photos: any[]

  // Additional form state
  currentStep: number
  isValid: Record<number, boolean>
}

export default function ComplianceReportTemplate() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [reportData, setReportData] = useState<ComplianceFormData>({
    // Base report data
    projectName: '',
    projectAddress: '',
    jobNumber: '',
    permitNumber: '',
    contractNumber: '',
    companyName: 'HBS Consultants',
    companyAddress: '368 Ashbury Way',
    companyLocation: 'Naples, FL 34110',
    companyPhone: '239.326.7846',
    logo: null,
    inspectorName: '',
    inspectorLicense: '',
    inspectorEmail: '',
    reportTitle: 'Compliance Report',
    reportSequence: '1',
    reportDate: new Date().toISOString().split('T')[0],
    reference: '',
    attention: 'Building Department',
    digitalSignature: null,
    generalContext: 'This compliance report documents the review of construction activities against applicable building codes and regulations.',
    observations: '',
    recommendations: '',
    photos: [],

    // Compliance specific fields
    reportType: 'Compliance Report',
    regulatoryBody: '',
    complianceStandard: '',
    auditDate: new Date().toISOString().split('T')[0],

    scopeOfCompliance: '',
    regulatoryRequirements: [],
    complianceStatus: 'compliant',

    complianceFindings: [],
    violations: [],
    correctiveActions: [],

    nextReviewDate: '',
    followUpRequired: false,
    certificationRequired: false,

    complianceMatrix: true,
    attachComplianceCertificate: false,

    // Form state
    currentStep: 0,
    isValid: {}
  })

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [projectInfo, setProjectInfo] = useState<any>(null)

  // Form steps configuration
  const formSteps = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Compliance overview and basic details',
      isValid: !!(reportData.regulatoryBody && reportData.complianceStandard),
      isOptional: false,
      component: () => null
    },
    {
      id: 'requirements',
      title: 'Requirements',
      description: 'Regulatory requirements and scope',
      isValid: !!(reportData.scopeOfCompliance && reportData.regulatoryRequirements.length > 0),
      isOptional: false,
      component: () => null
    },
    {
      id: 'findings',
      title: 'Findings',
      description: 'Compliance findings and violations',
      isValid: !!(reportData.complianceFindings.length > 0),
      isOptional: false,
      component: () => null
    },
    {
      id: 'actions',
      title: 'Corrective Actions',
      description: 'Required corrective actions',
      isValid: true, // Optional if no violations
      isOptional: true,
      component: () => null
    },
    {
      id: 'review',
      title: 'Review & Generate',
      description: 'Final review and report generation',
      isValid: true,
      isOptional: false,
      component: () => null
    }
  ]

  useEffect(() => {
    loadProjectData()
  }, [projectId])

  const loadProjectData = async () => {
    try {
      setLoading(true)

      // Load basic project info
      const project = await db.vbaProjects.get(projectId)
      if (project) {
        setReportData(prev => ({
          ...prev,
          projectName: project.project_name,
          projectAddress: project.address,
          jobNumber: project.job_number || project.id,
          permitNumber: project.permit_number || '',
          contractNumber: project.contract_number || ''
        }))
      }

      // Load extended project information
      const extendedInfo = await db.projectInfo.get(projectId)
      if (extendedInfo) {
        setProjectInfo(extendedInfo)
        setReportData(prev => ({
          ...prev,
          companyName: extendedInfo.company_name || prev.companyName,
          logo: extendedInfo.company_logo || null,
          inspectorName: extendedInfo.inspector || '',
          inspectorLicense: extendedInfo.inspector_license || '',
          inspectorEmail: extendedInfo.inspector_email || '',
          digitalSignature: extendedInfo.digital_signature || null
        }))
      }

    } catch (error) {
      console.error('Failed to load project data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFormUpdate = (updates: Partial<ComplianceFormData>) => {
    setReportData(prev => ({ ...prev, ...updates }))
  }

  const handleStepChange = (stepIndex: number) => {
    setReportData(prev => ({ ...prev, currentStep: stepIndex }))
  }

  const handleAutoSave = async () => {
    try {
      await db.inspectionReports.create({
        project_id: projectId,
        report_type: 'compliance',
        report_title: reportData.reportTitle,
        report_sequence: reportData.reportSequence,
        report_date: reportData.reportDate,

        observations: reportData.observations,
        recommendations: reportData.recommendations,

        // Compliance specific fields
        compliance_standard: reportData.complianceStandard,
        regulatory_body: reportData.regulatoryBody,
        compliance_status: reportData.complianceStatus,
        audit_date: reportData.auditDate,
        scope_of_work: reportData.scopeOfCompliance,
        findings: reportData.complianceFindings.map(f => f.observations).join('; '),
        violations: reportData.violations.map(v => v.description),
        corrective_actions: reportData.correctiveActions.map(a => a.action).join('; '),
        follow_up_required: reportData.followUpRequired,
        next_review_date: reportData.nextReviewDate,

        status: 'draft',
        generated_by: reportData.inspectorName || 'System'
      })

      // Log activity
      await db.activityLogs.create({
        action: 'auto_saved_compliance_report',
        entity_type: 'compliance_report',
        entity_id: projectId,
        metadata: { reportSequence: reportData.reportSequence }
      })
    } catch (error) {
      console.error('Auto-save failed:', error)
      throw error
    }
  }

  const handleGenerateReport = async () => {
    try {
      setGenerating(true)

      // Create PDF using StandardReportGenerator
      class ComplianceReportGenerator extends StandardReportGenerator {
        generateSpecificContent(data: ComplianceFormData) {
          this.addDateAndLogo(data)
          this.addRecipientInfo(data)
          this.addReference(data, 'Compliance Report')
          this.addIntroduction(data, 'monitor compliance with applicable building codes and regulations')

          // Compliance Overview
          this.addSection('Compliance Overview', `
Regulatory Body: ${data.regulatoryBody}
Compliance Standard: ${data.complianceStandard}
Audit Date: ${data.auditDate}
Overall Compliance Status: ${data.complianceStatus.charAt(0).toUpperCase() + data.complianceStatus.slice(1)}
          `)

          // Scope of Compliance
          if (data.scopeOfCompliance) {
            this.addSection('Scope of Compliance', data.scopeOfCompliance)
          }

          // Regulatory Requirements
          if (data.regulatoryRequirements.length > 0) {
            this.addSection('Regulatory Requirements', '')
            data.regulatoryRequirements.forEach((req, index) => {
              this.checkPageBreak(5)
              this.pdf.text(`${index + 1}. ${req}`, this.margin + 5, this.yPosition)
              this.yPosition += 6
            })
            this.yPosition += 5
          }

          // Compliance Findings
          if (data.complianceFindings.length > 0) {
            this.addSection('Compliance Findings', '')
            data.complianceFindings.forEach((finding, index) => {
              this.checkPageBreak(15)

              // Status indicator
              const statusColor = finding.status === 'compliant' ? '#10B981' :
                                finding.status === 'non_compliant' ? '#EF4444' : '#6B7280'

              this.pdf.setFontSize(11)
              this.pdf.setFont('helvetica', 'bold')
              this.pdf.text(`${index + 1}. ${finding.requirement}`, this.margin + 5, this.yPosition)
              this.yPosition += 6

              this.pdf.setFont('helvetica', 'normal')
              this.pdf.setTextColor(statusColor)
              this.pdf.text(`Status: ${finding.status.replace('_', ' ').toUpperCase()}`, this.margin + 10, this.yPosition)
              this.yPosition += 5

              this.pdf.setTextColor(0, 0, 0)
              this.pdf.text(`Observations: ${finding.observations}`, this.margin + 10, this.yPosition)
              this.yPosition += 5

              if (finding.evidence) {
                this.pdf.text(`Evidence: ${finding.evidence}`, this.margin + 10, this.yPosition)
                this.yPosition += 5
              }

              this.yPosition += 5
            })
          }

          // Violations (if any)
          if (data.violations.length > 0) {
            this.addSection('Code Violations', '')
            data.violations.forEach((violation, index) => {
              this.checkPageBreak(15)

              this.pdf.setFontSize(11)
              this.pdf.setFont('helvetica', 'bold')
              this.pdf.text(`${index + 1}. Code: ${violation.code}`, this.margin + 5, this.yPosition)
              this.yPosition += 6

              this.pdf.setFont('helvetica', 'normal')
              this.pdf.text(`Description: ${violation.description}`, this.margin + 10, this.yPosition)
              this.yPosition += 5

              const severityColor = violation.severity === 'critical' ? '#7C2D12' :
                                  violation.severity === 'major' ? '#EF4444' : '#F59E0B'
              this.pdf.setTextColor(severityColor)
              this.pdf.text(`Severity: ${violation.severity.toUpperCase()}`, this.margin + 10, this.yPosition)
              this.yPosition += 5

              this.pdf.setTextColor(0, 0, 0)
              this.pdf.text(`Correction Required: ${violation.correctionRequired ? 'Yes' : 'No'}`, this.margin + 10, this.yPosition)
              this.yPosition += 5

              if (violation.timeframe) {
                this.pdf.text(`Timeframe: ${violation.timeframe}`, this.margin + 10, this.yPosition)
                this.yPosition += 5
              }

              this.yPosition += 5
            })
          }

          // Corrective Actions
          if (data.correctiveActions.length > 0) {
            this.addSection('Corrective Actions', '')
            data.correctiveActions.forEach((action, index) => {
              this.checkPageBreak(15)

              this.pdf.setFontSize(11)
              this.pdf.setFont('helvetica', 'bold')
              this.pdf.text(`${index + 1}. ${action.violation}`, this.margin + 5, this.yPosition)
              this.yPosition += 6

              this.pdf.setFont('helvetica', 'normal')
              this.pdf.text(`Action: ${action.action}`, this.margin + 10, this.yPosition)
              this.yPosition += 5
              this.pdf.text(`Responsible: ${action.responsible}`, this.margin + 10, this.yPosition)
              this.yPosition += 5
              this.pdf.text(`Deadline: ${action.deadline}`, this.margin + 10, this.yPosition)
              this.yPosition += 5

              const statusColor = action.status === 'completed' ? '#10B981' :
                                action.status === 'in_progress' ? '#F59E0B' : '#6B7280'
              this.pdf.setTextColor(statusColor)
              this.pdf.text(`Status: ${action.status.replace('_', ' ').toUpperCase()}`, this.margin + 10, this.yPosition)
              this.yPosition += 8
              this.pdf.setTextColor(0, 0, 0)
            })
          }

          // Follow-up Requirements
          if (data.followUpRequired) {
            this.addSection('Follow-up Requirements', `
Next Review Date: ${data.nextReviewDate}
Certification Required: ${data.certificationRequired ? 'Yes' : 'No'}
            `)
          }

          // Observations and Recommendations
          if (data.observations) {
            this.addSection('Additional Observations', data.observations)
          }

          if (data.recommendations) {
            this.addSection('Recommendations', data.recommendations)
          }

          // Signature
          this.addSignature(data, false)

          // Limitations
          this.addLimitations()

          // Photos
          if (data.photos && data.photos.length > 0) {
            this.addPhotos(data)
          }
        }
      }

      const generator = new ComplianceReportGenerator()
      generator.generateSpecificContent(reportData)

      // Generate filename
      const date = new Date()
      const year = date.getFullYear().toString().slice(-2)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const sequence = reportData.reportSequence.padStart(3, '0')
      const filename = `${year} ${month} ${day} ${sequence} - Compliance Report`

      // Save PDF
      const pdfBlob = generator.generateReport()
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Save to database as final
      await db.inspectionReports.create({
        project_id: projectId,
        report_type: 'compliance',
        report_title: reportData.reportTitle,
        report_sequence: reportData.reportSequence,
        report_date: reportData.reportDate,

        observations: reportData.observations,
        recommendations: reportData.recommendations,

        compliance_standard: reportData.complianceStandard,
        regulatory_body: reportData.regulatoryBody,
        compliance_status: reportData.complianceStatus,
        audit_date: reportData.auditDate,
        scope_of_work: reportData.scopeOfCompliance,
        findings: reportData.complianceFindings.map(f => f.observations).join('; '),
        violations: reportData.violations.map(v => v.description),
        corrective_actions: reportData.correctiveActions.map(a => a.action).join('; '),
        follow_up_required: reportData.followUpRequired,
        next_review_date: reportData.nextReviewDate,

        status: 'final',
        generated_by: reportData.inspectorName || 'System',
        file_url: `${filename}.pdf`
      })

      // Log activity
      await db.activityLogs.create({
        action: 'generated_compliance_report',
        entity_type: 'compliance_report',
        entity_id: projectId,
        metadata: {
          filename: `${filename}.pdf`,
          complianceStatus: reportData.complianceStatus,
          regulatoryBody: reportData.regulatoryBody
        }
      })

      alert(`Compliance Report generated successfully!\n\nFile: ${filename}.pdf`)

    } catch (error) {
      console.error('Failed to generate report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  // Helper functions for managing form arrays
  const addRequirement = () => {
    setReportData(prev => ({
      ...prev,
      regulatoryRequirements: [...prev.regulatoryRequirements, '']
    }))
  }

  const updateRequirement = (index: number, value: string) => {
    setReportData(prev => ({
      ...prev,
      regulatoryRequirements: prev.regulatoryRequirements.map((req, i) =>
        i === index ? value : req
      )
    }))
  }

  const removeRequirement = (index: number) => {
    setReportData(prev => ({
      ...prev,
      regulatoryRequirements: prev.regulatoryRequirements.filter((_, i) => i !== index)
    }))
  }

  const addFinding = () => {
    setReportData(prev => ({
      ...prev,
      complianceFindings: [...prev.complianceFindings, {
        requirement: '',
        status: 'compliant',
        observations: '',
        evidence: ''
      }]
    }))
  }

  const updateFinding = (index: number, field: string, value: any) => {
    setReportData(prev => ({
      ...prev,
      complianceFindings: prev.complianceFindings.map((finding, i) =>
        i === index ? { ...finding, [field]: value } : finding
      )
    }))
  }

  const removeFinding = (index: number) => {
    setReportData(prev => ({
      ...prev,
      complianceFindings: prev.complianceFindings.filter((_, i) => i !== index)
    }))
  }

  const addViolation = () => {
    setReportData(prev => ({
      ...prev,
      violations: [...prev.violations, {
        code: '',
        description: '',
        severity: 'minor',
        correctionRequired: true,
        timeframe: ''
      }]
    }))
  }

  const updateViolation = (index: number, field: string, value: any) => {
    setReportData(prev => ({
      ...prev,
      violations: prev.violations.map((violation, i) =>
        i === index ? { ...violation, [field]: value } : violation
      )
    }))
  }

  const removeViolation = (index: number) => {
    setReportData(prev => ({
      ...prev,
      violations: prev.violations.filter((_, i) => i !== index)
    }))
  }

  const addCorrectiveAction = () => {
    setReportData(prev => ({
      ...prev,
      correctiveActions: [...prev.correctiveActions, {
        violation: '',
        action: '',
        responsible: '',
        deadline: '',
        status: 'pending'
      }]
    }))
  }

  const updateCorrectiveAction = (index: number, field: string, value: any) => {
    setReportData(prev => ({
      ...prev,
      correctiveActions: prev.correctiveActions.map((action, i) =>
        i === index ? { ...action, [field]: value } : action
      )
    }))
  }

  const removeCorrectiveAction = (index: number) => {
    setReportData(prev => ({
      ...prev,
      correctiveActions: prev.correctiveActions.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/vba/project/${projectId}`)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Compliance Report</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <AutoSaveIndicator />
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-6xl mx-auto">
        <FormWizard
          steps={formSteps}
          initialData={reportData}
          onStepChange={handleStepChange}
          onComplete={handleGenerateReport}
          autoSave={true}
          onAutoSave={handleAutoSave}
        >
          <FormProgress />

          {/* Step 1: Basic Information */}
          {reportData.currentStep === 0 && (
            <FormStep title="Basic Compliance Information">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Regulatory Body *
                    </label>
                    <select
                      value={reportData.regulatoryBody}
                      onChange={(e) => handleFormUpdate({ regulatoryBody: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">Select Regulatory Body</option>
                      <option value="Building Department">Building Department</option>
                      <option value="OSHA">OSHA</option>
                      <option value="EPA">EPA</option>
                      <option value="Fire Department">Fire Department</option>
                      <option value="Health Department">Health Department</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Compliance Standard *
                    </label>
                    <input
                      type="text"
                      value={reportData.complianceStandard}
                      onChange={(e) => handleFormUpdate({ complianceStandard: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="e.g., IBC 2021, OSHA 1926.95, NFPA 70"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Audit Date *
                    </label>
                    <input
                      type="date"
                      value={reportData.auditDate}
                      onChange={(e) => handleFormUpdate({ auditDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Overall Compliance Status
                    </label>
                    <select
                      value={reportData.complianceStatus}
                      onChange={(e) => handleFormUpdate({ complianceStatus: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="compliant">Compliant</option>
                      <option value="non_compliant">Non-Compliant</option>
                      <option value="partial">Partial Compliance</option>
                      <option value="pending">Pending Review</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scope of Compliance Review
                  </label>
                  <textarea
                    value={reportData.scopeOfCompliance}
                    onChange={(e) => handleFormUpdate({ scopeOfCompliance: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={4}
                    placeholder="Describe the scope of work, areas reviewed, and compliance objectives..."
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportData.followUpRequired}
                      onChange={(e) => handleFormUpdate({ followUpRequired: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Follow-up review required</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportData.certificationRequired}
                      onChange={(e) => handleFormUpdate({ certificationRequired: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Certification required</span>
                  </label>
                </div>

                {reportData.followUpRequired && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Next Review Date
                    </label>
                    <input
                      type="date"
                      value={reportData.nextReviewDate}
                      onChange={(e) => handleFormUpdate({ nextReviewDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 max-w-xs"
                    />
                  </div>
                )}
              </div>
            </FormStep>
          )}

          {/* Step 2: Requirements */}
          {reportData.currentStep === 1 && (
            <FormStep title="Regulatory Requirements">
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Regulatory Requirements *</h3>
                    <button
                      onClick={addRequirement}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Add Requirement
                    </button>
                  </div>

                  {reportData.regulatoryRequirements.map((requirement, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                        placeholder={`Regulatory requirement ${index + 1}`}
                      />
                      <button
                        onClick={() => removeRequirement(index)}
                        className="text-red-600 hover:text-red-800 px-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {reportData.regulatoryRequirements.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">
                        No regulatory requirements added. Click &quot;Add Requirement&quot; to define compliance criteria.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </FormStep>
          )}

          {/* Rest of the steps will be implemented similarly... */}
          {reportData.currentStep >= 2 && (
            <FormStep title="Implementation in Progress">
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Compliance Report Steps {reportData.currentStep + 1}-{formSteps.length} In Development
                </h3>
                <p className="text-gray-600 mb-6">
                  The remaining steps for findings, violations, corrective actions, and review are being implemented.
                </p>
                <button
                  onClick={handleGenerateReport}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  Generate Report with Current Data
                </button>
              </div>
            </FormStep>
          )}

          <FormNavigation />
        </FormWizard>
      </div>
    </div>
  )
}