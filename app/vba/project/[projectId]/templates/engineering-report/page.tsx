'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, HardHat, FileText, Award, Calculator, CheckCircle } from 'lucide-react'
import { db } from '@/lib/db-client'
import { FormWizard, FormProgress, FormStep, FormNavigation, AutoSaveIndicator } from '@/app/components/forms/FormWizard'
import { EngineeringReportSpecifics } from '@/lib/types/reportSpecifics'
import { StandardReportGenerator } from '@/lib/utils/standardReportGenerator'

interface EngineeringFormData extends EngineeringReportSpecifics {
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
  engineeringSeal: string | null
  generalContext: string
  observations: string
  recommendations: string
  photos: any[]

  // Additional form state
  currentStep: number
  isValid: Record<number, boolean>
}

export default function EngineeringReportTemplate() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [reportData, setReportData] = useState<EngineeringFormData>({
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
    reportTitle: 'Engineering Report',
    reportSequence: '1',
    reportDate: new Date().toISOString().split('T')[0],
    reference: '',
    attention: 'Project Engineer',
    digitalSignature: null,
    engineeringSeal: null,
    generalContext: 'This engineering report provides professional analysis and recommendations for the specified project components.',
    observations: '',
    recommendations: '',
    photos: [],

    // Engineering specific fields
    reportType: 'Engineering Report',
    reportSubtype: 'structural',
    sealRequired: true,
    peerReviewRequired: false,

    engineer: {
      name: '',
      title: 'Professional Engineer',
      licenseNumber: '',
      licenseState: 'FL',
      expirationDate: '',
      specializations: [],
      firmName: '',
      firmLicense: ''
    },

    engineeringScope: {
      purpose: '',
      designCriteria: [],
      applicableCodes: [],
      loadRequirements: [],
      analysisMethod: [],
      assumptions: []
    },

    engineeringStandards: [],

    technicalFindings: {
      structuralAnalysis: '',
      loadAnalysis: '',
      materialProperties: '',
      safetyFactors: '',
      designMargins: '',
      codeCompliance: ''
    },

    professionalOpinion: {
      summary: '',
      conclusions: [],
      limitations: [],
      assumptions: [],
      confidence: 'high'
    },

    engineeringRecommendations: [],

    attachments: {
      calculations: false,
      drawings: false,
      specifications: false,
      testResults: false,
      codeAnalysis: false,
      precedentStudies: false
    },

    sealInformation: {
      sealDate: new Date().toISOString().split('T')[0],
      digitalSeal: '',
      sealStatement: 'The engineering services reflected in this document have been performed under my direct supervision.',
      revisionNumber: '0',
      originalDate: new Date().toISOString().split('T')[0]
    },

    peerReview: {
      required: false,
      reviewer: '',
      reviewDate: '',
      reviewComments: '',
      approval: false
    },

    limitationsAndDisclaimer: 'This report is based on information available at the time of analysis and is subject to the limitations and assumptions stated herein.',
    professionalLiability: 'This report has been prepared in accordance with accepted engineering practices.',
    copyrightNotice: '© 2024 HBS Consultants. All rights reserved.',

    includeCalculations: false,
    includeDrawings: false,
    technicalFormatting: true,
    legalFormatting: true,

    // Form state
    currentStep: 0,
    isValid: {}
  })

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  // Form steps configuration
  const formSteps = [
    {
      id: 'professional-info',
      title: 'Professional Information',
      description: 'Engineer credentials and scope',
      isValid: !!(reportData.engineer.name && reportData.engineer.licenseNumber),
      isOptional: false,
      component: () => null
    },
    {
      id: 'technical-analysis',
      title: 'Technical Analysis',
      description: 'Engineering findings and analysis',
      isValid: !!(reportData.technicalFindings.structuralAnalysis || reportData.technicalFindings.codeCompliance),
      isOptional: false,
      component: () => null
    },
    {
      id: 'professional-opinion',
      title: 'Professional Opinion',
      description: 'Conclusions and recommendations',
      isValid: !!(reportData.professionalOpinion.summary),
      isOptional: false,
      component: () => null
    },
    {
      id: 'seal-review',
      title: 'Seal & Review',
      description: 'Professional seal and peer review',
      isValid: true,
      isOptional: false,
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
        setReportData(prev => ({
          ...prev,
          companyName: extendedInfo.company_name || prev.companyName,
          logo: extendedInfo.company_logo || null,
          inspectorName: extendedInfo.inspector || '',
          inspectorLicense: extendedInfo.inspector_license || '',
          inspectorEmail: extendedInfo.inspector_email || '',
          digitalSignature: extendedInfo.digital_signature || null,
          engineeringSeal: null,
          engineer: {
            ...prev.engineer,
            name: extendedInfo.inspector || prev.engineer.name,
            licenseNumber: extendedInfo.inspector_license || prev.engineer.licenseNumber,
            firmName: extendedInfo.company_name || prev.engineer.firmName
          }
        }))
      }

    } catch (error) {
      console.error('Failed to load project data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFormUpdate = (updates: Partial<EngineeringFormData>) => {
    setReportData(prev => ({ ...prev, ...updates }))
  }

  const handleStepChange = (stepIndex: number) => {
    setReportData(prev => ({ ...prev, currentStep: stepIndex }))
  }

  const handleAutoSave = async () => {
    try {
      await db.inspectionReports.create({
        project_id: projectId,
        report_type: 'engineering',
        report_title: reportData.reportTitle,
        report_sequence: reportData.reportSequence,
        report_date: reportData.reportDate,

        observations: reportData.observations,
        recommendations: reportData.recommendations,

        status: 'draft',
        generated_by: reportData.engineer.name || 'System'
      })

      // Log activity
      await db.activityLogs.create({
        action: 'auto_saved_engineering_report',
        entity_type: 'engineering_report',
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
      class EngineeringReportGenerator extends StandardReportGenerator {
        generateSpecificContent(data: EngineeringFormData) {
          this.addDateAndLogo(data)
          this.addRecipientInfo(data)
          this.addReference(data, 'Engineering Report')
          this.addIntroduction(data, 'provide professional engineering analysis and recommendations')

          // Professional Information
          this.addSection('Professional Engineer', `
${data.engineer.name}, ${data.engineer.title}
License Number: ${data.engineer.licenseNumber} (${data.engineer.licenseState})
Firm: ${data.engineer.firmName}
Specializations: ${data.engineer.specializations.join(', ') || 'General Engineering'}
          `)

          // Engineering Scope
          if (data.engineeringScope.purpose) {
            this.addSection('Scope of Engineering Services', `
Purpose: ${data.engineeringScope.purpose}

Design Criteria:
${data.engineeringScope.designCriteria.map(c => `• ${c}`).join('\n')}

Applicable Codes:
${data.engineeringScope.applicableCodes.map(c => `• ${c}`).join('\n')}

Analysis Methods:
${data.engineeringScope.analysisMethod.map(m => `• ${m}`).join('\n')}
            `)
          }

          // Engineering Standards
          if (data.engineeringStandards.length > 0) {
            this.addSection('Engineering Standards', '')
            data.engineeringStandards.forEach((standard, index) => {
              this.checkPageBreak(10)
              this.pdf.text(`${index + 1}. ${standard.code} (${standard.version})`, this.margin + 5, this.yPosition)
              this.yPosition += 5
              this.pdf.text(`   Section: ${standard.section}`, this.margin + 10, this.yPosition)
              this.yPosition += 5
              this.pdf.text(`   Applicability: ${standard.applicability}`, this.margin + 10, this.yPosition)
              this.yPosition += 8
            })
          }

          // Technical Findings
          this.addSection('Technical Findings', '')

          if (data.technicalFindings.structuralAnalysis) {
            this.pdf.setFont('helvetica', 'bold')
            this.pdf.text('Structural Analysis:', this.margin, this.yPosition)
            this.yPosition += 5
            this.pdf.setFont('helvetica', 'normal')
            this.pdf.text(data.technicalFindings.structuralAnalysis, this.margin + 5, this.yPosition)
            this.yPosition += 10
          }

          if (data.technicalFindings.codeCompliance) {
            this.pdf.setFont('helvetica', 'bold')
            this.pdf.text('Code Compliance:', this.margin, this.yPosition)
            this.yPosition += 5
            this.pdf.setFont('helvetica', 'normal')
            this.pdf.text(data.technicalFindings.codeCompliance, this.margin + 5, this.yPosition)
            this.yPosition += 10
          }

          if (data.technicalFindings.safetyFactors) {
            this.pdf.setFont('helvetica', 'bold')
            this.pdf.text('Safety Factors:', this.margin, this.yPosition)
            this.yPosition += 5
            this.pdf.setFont('helvetica', 'normal')
            this.pdf.text(data.technicalFindings.safetyFactors, this.margin + 5, this.yPosition)
            this.yPosition += 10
          }

          // Professional Opinion
          this.addSection('Professional Opinion', data.professionalOpinion.summary)

          if (data.professionalOpinion.conclusions.length > 0) {
            this.checkPageBreak(20)
            this.pdf.setFont('helvetica', 'bold')
            this.pdf.text('Conclusions:', this.margin, this.yPosition)
            this.yPosition += 5
            this.pdf.setFont('helvetica', 'normal')
            data.professionalOpinion.conclusions.forEach(conclusion => {
              this.pdf.text(`• ${conclusion}`, this.margin + 5, this.yPosition)
              this.yPosition += 5
            })
            this.yPosition += 5
          }

          // Engineering Recommendations
          if (data.engineeringRecommendations.length > 0) {
            this.addSection('Engineering Recommendations', '')
            data.engineeringRecommendations.forEach((rec, index) => {
              this.checkPageBreak(20)

              const priorityColor = rec.priority === 'critical' ? '#7C2D12' :
                                   rec.priority === 'high' ? '#EF4444' :
                                   rec.priority === 'medium' ? '#F59E0B' : '#10B981'

              this.pdf.setTextColor(priorityColor)
              this.pdf.setFont('helvetica', 'bold')
              this.pdf.text(`${index + 1}. [${rec.priority.toUpperCase()}]`, this.margin + 5, this.yPosition)
              this.yPosition += 5

              this.pdf.setTextColor(0, 0, 0)
              this.pdf.setFont('helvetica', 'normal')
              this.pdf.text(`   ${rec.recommendation}`, this.margin + 10, this.yPosition)
              this.yPosition += 5
              this.pdf.text(`   Justification: ${rec.justification}`, this.margin + 10, this.yPosition)
              this.yPosition += 5
              this.pdf.text(`   Timeframe: ${rec.timeframe}`, this.margin + 10, this.yPosition)
              this.yPosition += 5

              if (rec.cost) {
                this.pdf.text(`   Estimated Cost: ${rec.cost}`, this.margin + 10, this.yPosition)
                this.yPosition += 5
              }
              this.yPosition += 5
            })
          }

          // Limitations and Assumptions
          if (data.professionalOpinion.limitations.length > 0 || data.professionalOpinion.assumptions.length > 0) {
            this.addSection('Limitations and Assumptions', '')

            if (data.professionalOpinion.limitations.length > 0) {
              this.pdf.setFont('helvetica', 'bold')
              this.pdf.text('Limitations:', this.margin, this.yPosition)
              this.yPosition += 5
              this.pdf.setFont('helvetica', 'normal')
              data.professionalOpinion.limitations.forEach(limitation => {
                this.pdf.text(`• ${limitation}`, this.margin + 5, this.yPosition)
                this.yPosition += 5
              })
              this.yPosition += 5
            }

            if (data.professionalOpinion.assumptions.length > 0) {
              this.pdf.setFont('helvetica', 'bold')
              this.pdf.text('Assumptions:', this.margin, this.yPosition)
              this.yPosition += 5
              this.pdf.setFont('helvetica', 'normal')
              data.professionalOpinion.assumptions.forEach(assumption => {
                this.pdf.text(`• ${assumption}`, this.margin + 5, this.yPosition)
                this.yPosition += 5
              })
              this.yPosition += 5
            }
          }

          // Attachments
          if (Object.values(data.attachments).some(v => v)) {
            this.addSection('Attachments', '')
            const attachmentList = []
            if (data.attachments.calculations) attachmentList.push('Engineering Calculations')
            if (data.attachments.drawings) attachmentList.push('Technical Drawings')
            if (data.attachments.specifications) attachmentList.push('Specifications')
            if (data.attachments.testResults) attachmentList.push('Test Results')
            if (data.attachments.codeAnalysis) attachmentList.push('Code Analysis')
            if (data.attachments.precedentStudies) attachmentList.push('Precedent Studies')

            attachmentList.forEach(attachment => {
              this.pdf.text(`• ${attachment}`, this.margin + 5, this.yPosition)
              this.yPosition += 5
            })
            this.yPosition += 5
          }

          // Professional Seal Section
          if (data.sealRequired) {
            this.checkPageBreak(40)
            this.pdf.setDrawColor(0)
            this.pdf.setLineWidth(0.5)
            this.pdf.rect(this.margin, this.yPosition, this.pageWidth - 2 * this.margin, 35, 'S')

            this.pdf.setFont('helvetica', 'bold')
            this.pdf.text('PROFESSIONAL ENGINEER SEAL', this.margin + 5, this.yPosition + 8)

            this.pdf.setFont('helvetica', 'normal')
            this.pdf.setFontSize(10)
            this.pdf.text(data.sealInformation.sealStatement, this.margin + 5, this.yPosition + 15)
            this.pdf.text(`Seal Date: ${data.sealInformation.sealDate}`, this.margin + 5, this.yPosition + 22)
            this.pdf.text(`Revision: ${data.sealInformation.revisionNumber}`, this.margin + 5, this.yPosition + 28)

            if (data.engineeringSeal) {
              // Add engineering seal image if available
              this.pdf.text('[Digital Seal Applied]', this.pageWidth - this.margin - 50, this.yPosition + 20)
            }

            this.yPosition += 40
          }

          // Signature with seal
          this.addSignature(data, true)

          // Professional Liability Statement
          this.checkPageBreak(20)
          this.pdf.setFontSize(9)
          this.pdf.setTextColor(100, 100, 100)
          this.pdf.text('PROFESSIONAL LIABILITY STATEMENT', this.margin, this.yPosition)
          this.yPosition += 5
          this.pdf.text(data.professionalLiability, this.margin, this.yPosition)
          this.yPosition += 10

          // Copyright Notice
          this.pdf.text(data.copyrightNotice, this.margin, this.yPosition)
          this.pdf.setTextColor(0, 0, 0)
          this.pdf.setFontSize(11)

          // Photos
          if (data.photos && data.photos.length > 0) {
            this.addPhotos(data)
          }
        }
      }

      const generator = new EngineeringReportGenerator()
      generator.generateSpecificContent(reportData)

      // Generate filename
      const date = new Date()
      const year = date.getFullYear().toString().slice(-2)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const sequence = reportData.reportSequence.padStart(3, '0')
      const filename = `${year} ${month} ${day} ${sequence} - Engineering Report`

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
        report_type: 'engineering',
        report_title: reportData.reportTitle,
        report_sequence: reportData.reportSequence,
        report_date: reportData.reportDate,

        observations: reportData.observations,
        recommendations: reportData.recommendations,

        engineering_report_type: reportData.reportSubtype,
        engineering_standards: reportData.engineeringStandards.map(s => s.code),
        calculations_attached: reportData.attachments.calculations,
        drawings_attached: reportData.attachments.drawings,
        professional_opinion: reportData.professionalOpinion.summary,
        engineering_recommendations: reportData.engineeringRecommendations.map(r => r.recommendation).join('; '),
        limitations_assumptions: reportData.limitationsAndDisclaimer,
        seal_date: reportData.sealInformation.sealDate,

        status: 'final',
        generated_by: reportData.engineer.name || 'System',
        file_url: `${filename}.pdf`
      })

      // Log activity
      await db.activityLogs.create({
        action: 'generated_engineering_report',
        entity_type: 'engineering_report',
        entity_id: projectId,
        metadata: {
          filename: `${filename}.pdf`,
          reportSubtype: reportData.reportSubtype,
          sealed: reportData.sealRequired
        }
      })

      alert(`Engineering Report generated successfully!\n\nFile: ${filename}.pdf`)

    } catch (error) {
      console.error('Failed to generate report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  // Helper functions
  const addSpecialization = () => {
    setReportData(prev => ({
      ...prev,
      engineer: {
        ...prev.engineer,
        specializations: [...prev.engineer.specializations, '']
      }
    }))
  }

  const addStandard = () => {
    setReportData(prev => ({
      ...prev,
      engineeringStandards: [...prev.engineeringStandards, {
        code: '',
        version: '',
        section: '',
        applicability: ''
      }]
    }))
  }

  const addRecommendation = () => {
    setReportData(prev => ({
      ...prev,
      engineeringRecommendations: [...prev.engineeringRecommendations, {
        priority: 'medium',
        recommendation: '',
        justification: '',
        timeframe: '',
        cost: ''
      }]
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
              <HardHat className="h-6 w-6 text-purple-600" />
              <h1 className="text-xl font-semibold text-gray-900">Engineering Report</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <AutoSaveIndicator />
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2"
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

          {/* Step 1: Professional Information */}
          {reportData.currentStep === 0 && (
            <FormStep title="Professional Information">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Report Subtype
                    </label>
                    <select
                      value={reportData.reportSubtype}
                      onChange={(e) => handleFormUpdate({ reportSubtype: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="structural">Structural</option>
                      <option value="design">Design</option>
                      <option value="analysis">Analysis</option>
                      <option value="inspection">Inspection</option>
                      <option value="assessment">Assessment</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-4 pt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={reportData.sealRequired}
                        onChange={(e) => handleFormUpdate({ sealRequired: e.target.checked })}
                        className="rounded border-gray-300 text-purple-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">PE Seal Required</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={reportData.peerReviewRequired}
                        onChange={(e) => handleFormUpdate({ peerReviewRequired: e.target.checked })}
                        className="rounded border-gray-300 text-purple-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Peer Review Required</span>
                    </label>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-purple-600" />
                    Professional Engineer Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Engineer Name *
                      </label>
                      <input
                        type="text"
                        value={reportData.engineer.name}
                        onChange={(e) => handleFormUpdate({
                          engineer: { ...reportData.engineer, name: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Professional Title
                      </label>
                      <input
                        type="text"
                        value={reportData.engineer.title}
                        onChange={(e) => handleFormUpdate({
                          engineer: { ...reportData.engineer, title: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        License Number *
                      </label>
                      <input
                        type="text"
                        value={reportData.engineer.licenseNumber}
                        onChange={(e) => handleFormUpdate({
                          engineer: { ...reportData.engineer, licenseNumber: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="PE License #"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        License State
                      </label>
                      <input
                        type="text"
                        value={reportData.engineer.licenseState}
                        onChange={(e) => handleFormUpdate({
                          engineer: { ...reportData.engineer, licenseState: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        maxLength={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Firm Name
                      </label>
                      <input
                        type="text"
                        value={reportData.engineer.firmName}
                        onChange={(e) => handleFormUpdate({
                          engineer: { ...reportData.engineer, firmName: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Firm License #
                      </label>
                      <input
                        type="text"
                        value={reportData.engineer.firmLicense || ''}
                        onChange={(e) => handleFormUpdate({
                          engineer: { ...reportData.engineer, firmLicense: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Engineering Scope</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Purpose of Analysis
                      </label>
                      <textarea
                        value={reportData.engineeringScope.purpose}
                        onChange={(e) => handleFormUpdate({
                          engineeringScope: { ...reportData.engineeringScope, purpose: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        rows={3}
                        placeholder="Describe the purpose and objectives of this engineering analysis..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FormStep>
          )}

          {/* Placeholder for remaining steps */}
          {reportData.currentStep >= 1 && (
            <FormStep title="Form Steps In Development">
              <div className="text-center py-12">
                <HardHat className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Engineering Report Steps {reportData.currentStep + 1}-{formSteps.length} In Development
                </h3>
                <p className="text-gray-600 mb-6">
                  The remaining form steps for technical analysis, professional opinion, and seal are being implemented.
                </p>
                <button
                  onClick={handleGenerateReport}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
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