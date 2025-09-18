'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Package, FileText, AlertTriangle, DollarSign, CheckCircle } from 'lucide-react'
import { db } from '@/lib/db-client'
import { FormWizard, FormProgress, FormStep, FormNavigation, AutoSaveIndicator } from '@/app/components/forms/FormWizard'
import { MaterialDefectReportSpecifics } from '@/lib/types/reportSpecifics'
import { StandardReportGenerator } from '@/lib/utils/standardReportGenerator'

interface MaterialDefectFormData extends MaterialDefectReportSpecifics {
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

export default function MaterialDefectReportTemplate() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [reportData, setReportData] = useState<MaterialDefectFormData>({
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
    reportTitle: 'Material/Installation Defect Report',
    reportSequence: '1',
    reportDate: new Date().toISOString().split('T')[0],
    reference: '',
    attention: 'Project Manager',
    digitalSignature: null,
    generalContext: 'This report documents material and/or installation defects identified during construction inspection.',
    observations: '',
    recommendations: '',
    photos: [],

    // Material Defect specific fields
    reportType: 'Material/Installation Defect Report',
    defectCategory: 'material',
    urgency: 'medium',

    materialDetails: {
      type: '',
      manufacturer: '',
      model: '',
      batchLotNumber: '',
      serialNumber: '',
      specifications: '',
      supplier: '',
      purchaseOrder: '',
      deliveryDate: '',
      installationDate: ''
    },

    defectType: 'dimensional',
    defectDescription: '',
    defectCause: 'unknown',

    affectedQuantity: {
      units: 0,
      description: '',
      locations: [],
      percentageOfTotal: 0
    },

    discoveryDetails: {
      date: new Date().toISOString().split('T')[0],
      discoveredBy: '',
      discoveryMethod: 'inspection',
      circumstances: ''
    },

    testResults: [],

    impactAssessment: {
      structural: 'none',
      safety: 'none',
      schedule: 'none',
      cost: '',
      warranty: false
    },

    supplierNotification: {
      notified: false,
      date: '',
      method: '',
      response: '',
      claimNumber: ''
    },

    correctiveActions: [],
    qaEnhancements: [],

    includeTestData: false,
    includeSpecifications: false,
    requireApprovals: false,
    attachWarrantyInfo: false,

    // Form state
    currentStep: 0,
    isValid: {}
  })

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  // Form steps configuration
  const formSteps = [
    {
      id: 'material-info',
      title: 'Material Information',
      description: 'Product and supplier details',
      isValid: !!(reportData.materialDetails.type && reportData.materialDetails.manufacturer),
      isOptional: false,
      component: () => null
    },
    {
      id: 'defect-details',
      title: 'Defect Details',
      description: 'Defect classification and description',
      isValid: !!(reportData.defectDescription && reportData.defectType),
      isOptional: false,
      component: () => null
    },
    {
      id: 'impact',
      title: 'Impact Assessment',
      description: 'Assess impact on project',
      isValid: true,
      isOptional: false,
      component: () => null
    },
    {
      id: 'corrective',
      title: 'Corrective Actions',
      description: 'Required actions and QA measures',
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
          digitalSignature: extendedInfo.digital_signature || null
        }))
      }

    } catch (error) {
      console.error('Failed to load project data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFormUpdate = (updates: Partial<MaterialDefectFormData>) => {
    setReportData(prev => ({ ...prev, ...updates }))
  }

  const handleStepChange = (stepIndex: number) => {
    setReportData(prev => ({ ...prev, currentStep: stepIndex }))
  }

  const handleAutoSave = async () => {
    try {
      await db.inspectionReports.create({
        project_id: projectId,
        report_type: 'material_defect',
        report_title: reportData.reportTitle,
        report_sequence: reportData.reportSequence,
        report_date: reportData.reportDate,

        observations: reportData.observations,
        recommendations: reportData.recommendations,

        // Material defect specific fields
        material_type: reportData.materialDetails.type,
        manufacturer: reportData.materialDetails.manufacturer,
        batch_lot_number: reportData.materialDetails.batchLotNumber,
        defect_type: reportData.defectType,
        defect_description: reportData.defectDescription,
        affected_quantity: `${reportData.affectedQuantity.units} ${reportData.affectedQuantity.description}`,
        discovery_date: reportData.discoveryDetails.date,
        supplier_notified: reportData.supplierNotification.notified,
        replacement_required: reportData.correctiveActions.some(a => a.action === 'replace'),
        cost_impact: reportData.impactAssessment.cost,

        status: 'draft',
        generated_by: reportData.inspectorName || 'System'
      })

      // Log activity
      await db.activityLogs.create({
        action: 'auto_saved_material_defect_report',
        entity_type: 'material_defect_report',
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
      class MaterialDefectReportGenerator extends StandardReportGenerator {
        generateSpecificContent(data: MaterialDefectFormData) {
          this.addDateAndLogo(data)
          this.addRecipientInfo(data)
          this.addReference(data, 'Material/Installation Defect Report')
          this.addIntroduction(data, 'investigate and assess material defects identified during construction')

          // Material Information
          this.addSection('Material Information', `
Type: ${data.materialDetails.type}
Manufacturer: ${data.materialDetails.manufacturer}
Model: ${data.materialDetails.model}
Batch/Lot Number: ${data.materialDetails.batchLotNumber}
Serial Number: ${data.materialDetails.serialNumber || 'N/A'}
Supplier: ${data.materialDetails.supplier}
Purchase Order: ${data.materialDetails.purchaseOrder || 'N/A'}
Delivery Date: ${data.materialDetails.deliveryDate}
Installation Date: ${data.materialDetails.installationDate}
          `)

          // Defect Details
          this.addSection('Defect Details', `
Defect Category: ${data.defectCategory.charAt(0).toUpperCase() + data.defectCategory.slice(1)}
Defect Type: ${data.defectType.charAt(0).toUpperCase() + data.defectType.slice(1)}
Urgency Level: ${data.urgency.charAt(0).toUpperCase() + data.urgency.slice(1)}
Defect Cause: ${data.defectCause.charAt(0).toUpperCase() + data.defectCause.slice(1)}

Description:
${data.defectDescription}
          `)

          // Affected Quantity
          this.addSection('Affected Quantity', `
Units Affected: ${data.affectedQuantity.units}
Description: ${data.affectedQuantity.description}
Percentage of Total: ${data.affectedQuantity.percentageOfTotal}%
Locations: ${data.affectedQuantity.locations.join(', ')}
          `)

          // Discovery Information
          this.addSection('Discovery Information', `
Discovery Date: ${data.discoveryDetails.date}
Discovered By: ${data.discoveryDetails.discoveredBy}
Discovery Method: ${data.discoveryDetails.discoveryMethod.charAt(0).toUpperCase() + data.discoveryDetails.discoveryMethod.slice(1)}
Circumstances: ${data.discoveryDetails.circumstances}
          `)

          // Test Results
          if (data.testResults.length > 0) {
            this.addSection('Test Results', '')
            data.testResults.forEach((test, index) => {
              this.checkPageBreak(15)
              this.pdf.setFontSize(11)
              this.pdf.text(`${index + 1}. ${test.testType} (${test.standard})`, this.margin + 5, this.yPosition)
              this.yPosition += 5
              this.pdf.text(`   Expected: ${test.expectedResult}`, this.margin + 10, this.yPosition)
              this.yPosition += 5
              this.pdf.text(`   Actual: ${test.actualResult}`, this.margin + 10, this.yPosition)
              this.yPosition += 5

              const statusColor = test.status === 'pass' ? '#10B981' :
                                 test.status === 'fail' ? '#EF4444' : '#F59E0B'
              this.pdf.setTextColor(statusColor)
              this.pdf.text(`   Status: ${test.status.toUpperCase()}`, this.margin + 10, this.yPosition)
              this.pdf.setTextColor(0, 0, 0)
              this.yPosition += 8
            })
          }

          // Impact Assessment
          this.addSection('Impact Assessment', `
Structural Impact: ${data.impactAssessment.structural.charAt(0).toUpperCase() + data.impactAssessment.structural.slice(1)}
Safety Impact: ${data.impactAssessment.safety.charAt(0).toUpperCase() + data.impactAssessment.safety.slice(1)}
Schedule Impact: ${data.impactAssessment.schedule.charAt(0).toUpperCase() + data.impactAssessment.schedule.slice(1)}
Cost Impact: ${data.impactAssessment.cost || 'To be determined'}
Warranty Affected: ${data.impactAssessment.warranty ? 'Yes' : 'No'}
          `)

          // Supplier Notification
          if (data.supplierNotification.notified) {
            this.addSection('Supplier Notification', `
Notified: Yes
Date: ${data.supplierNotification.date}
Method: ${data.supplierNotification.method}
Response: ${data.supplierNotification.response}
Claim Number: ${data.supplierNotification.claimNumber || 'Pending'}
            `)
          }

          // Corrective Actions
          if (data.correctiveActions.length > 0) {
            this.addSection('Corrective Actions', '')
            data.correctiveActions.forEach((action, index) => {
              this.checkPageBreak(15)
              this.pdf.setFontSize(11)
              this.pdf.text(`${index + 1}. ${action.action.charAt(0).toUpperCase() + action.action.slice(1)}`, this.margin + 5, this.yPosition)
              this.yPosition += 5
              this.pdf.text(`   ${action.description}`, this.margin + 10, this.yPosition)
              this.yPosition += 5
              this.pdf.text(`   Cost: ${action.cost}`, this.margin + 10, this.yPosition)
              this.yPosition += 5
              this.pdf.text(`   Timeframe: ${action.timeframe}`, this.margin + 10, this.yPosition)
              this.yPosition += 5
              this.pdf.text(`   Responsible: ${action.responsible}`, this.margin + 10, this.yPosition)
              this.yPosition += 5

              const approvalColor = action.approval === 'approved' ? '#10B981' :
                                   action.approval === 'denied' ? '#EF4444' : '#F59E0B'
              this.pdf.setTextColor(approvalColor)
              this.pdf.text(`   Approval: ${action.approval.charAt(0).toUpperCase() + action.approval.slice(1)}`, this.margin + 10, this.yPosition)
              this.pdf.setTextColor(0, 0, 0)
              this.yPosition += 8
            })
          }

          // Quality Assurance Enhancements
          if (data.qaEnhancements.length > 0) {
            this.addSection('QA Enhancements', '')
            data.qaEnhancements.forEach((qa, index) => {
              this.checkPageBreak(10)
              this.pdf.text(`${index + 1}. ${qa.measure}`, this.margin + 5, this.yPosition)
              this.yPosition += 5
              this.pdf.text(`   Implementation: ${qa.implementation}`, this.margin + 10, this.yPosition)
              this.yPosition += 5
              this.pdf.text(`   Responsible: ${qa.responsible}`, this.margin + 10, this.yPosition)
              this.yPosition += 5
              this.pdf.text(`   Effective Date: ${qa.effectiveDate}`, this.margin + 10, this.yPosition)
              this.yPosition += 8
            })
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

      const generator = new MaterialDefectReportGenerator()
      generator.generateSpecificContent(reportData)

      // Generate filename
      const date = new Date()
      const year = date.getFullYear().toString().slice(-2)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const sequence = reportData.reportSequence.padStart(3, '0')
      const filename = `${year} ${month} ${day} ${sequence} - Material Defect Report`

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
        report_type: 'material_defect',
        report_title: reportData.reportTitle,
        report_sequence: reportData.reportSequence,
        report_date: reportData.reportDate,

        observations: reportData.observations,
        recommendations: reportData.recommendations,

        material_type: reportData.materialDetails.type,
        manufacturer: reportData.materialDetails.manufacturer,
        batch_lot_number: reportData.materialDetails.batchLotNumber,
        defect_type: reportData.defectType,
        defect_description: reportData.defectDescription,
        affected_quantity: `${reportData.affectedQuantity.units} ${reportData.affectedQuantity.description}`,
        discovery_date: reportData.discoveryDetails.date,
        supplier_notified: reportData.supplierNotification.notified,
        replacement_required: reportData.correctiveActions.some(a => a.action === 'replace'),
        cost_impact: reportData.impactAssessment.cost,

        status: 'final',
        generated_by: reportData.inspectorName || 'System',
        file_url: `${filename}.pdf`
      })

      // Log activity
      await db.activityLogs.create({
        action: 'generated_material_defect_report',
        entity_type: 'material_defect_report',
        entity_id: projectId,
        metadata: {
          filename: `${filename}.pdf`,
          defectType: reportData.defectType,
          urgency: reportData.urgency
        }
      })

      alert(`Material Defect Report generated successfully!\n\nFile: ${filename}.pdf`)

    } catch (error) {
      console.error('Failed to generate report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  // Helper functions
  const addTestResult = () => {
    setReportData(prev => ({
      ...prev,
      testResults: [...prev.testResults, {
        testType: '',
        standard: '',
        expectedResult: '',
        actualResult: '',
        status: 'pass'
      }]
    }))
  }

  const addCorrectiveAction = () => {
    setReportData(prev => ({
      ...prev,
      correctiveActions: [...prev.correctiveActions, {
        action: 'repair',
        description: '',
        cost: '',
        timeframe: '',
        responsible: '',
        approval: 'pending'
      }]
    }))
  }

  const addQAEnhancement = () => {
    setReportData(prev => ({
      ...prev,
      qaEnhancements: [...prev.qaEnhancements, {
        measure: '',
        implementation: '',
        responsible: '',
        effectiveDate: ''
      }]
    }))
  }

  const addLocation = () => {
    setReportData(prev => ({
      ...prev,
      affectedQuantity: {
        ...prev.affectedQuantity,
        locations: [...prev.affectedQuantity.locations, '']
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
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
              <Package className="h-6 w-6 text-orange-600" />
              <h1 className="text-xl font-semibold text-gray-900">Material/Installation Defect Report</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <AutoSaveIndicator />
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 flex items-center gap-2"
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

          {/* Step 1: Material Information */}
          {reportData.currentStep === 0 && (
            <FormStep title="Material Information">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Defect Category
                    </label>
                    <select
                      value={reportData.defectCategory}
                      onChange={(e) => handleFormUpdate({ defectCategory: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="material">Material</option>
                      <option value="installation">Installation</option>
                      <option value="design">Design</option>
                      <option value="workmanship">Workmanship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Urgency Level
                    </label>
                    <select
                      value={reportData.urgency}
                      onChange={(e) => handleFormUpdate({ urgency: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Material Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Material Type *
                      </label>
                      <input
                        type="text"
                        value={reportData.materialDetails.type}
                        onChange={(e) => handleFormUpdate({
                          materialDetails: { ...reportData.materialDetails, type: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="e.g., Concrete, Steel, Drywall"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Manufacturer *
                      </label>
                      <input
                        type="text"
                        value={reportData.materialDetails.manufacturer}
                        onChange={(e) => handleFormUpdate({
                          materialDetails: { ...reportData.materialDetails, manufacturer: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model/Product Name
                      </label>
                      <input
                        type="text"
                        value={reportData.materialDetails.model}
                        onChange={(e) => handleFormUpdate({
                          materialDetails: { ...reportData.materialDetails, model: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Batch/Lot Number
                      </label>
                      <input
                        type="text"
                        value={reportData.materialDetails.batchLotNumber}
                        onChange={(e) => handleFormUpdate({
                          materialDetails: { ...reportData.materialDetails, batchLotNumber: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Supplier
                      </label>
                      <input
                        type="text"
                        value={reportData.materialDetails.supplier}
                        onChange={(e) => handleFormUpdate({
                          materialDetails: { ...reportData.materialDetails, supplier: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Purchase Order #
                      </label>
                      <input
                        type="text"
                        value={reportData.materialDetails.purchaseOrder || ''}
                        onChange={(e) => handleFormUpdate({
                          materialDetails: { ...reportData.materialDetails, purchaseOrder: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Date
                      </label>
                      <input
                        type="date"
                        value={reportData.materialDetails.deliveryDate}
                        onChange={(e) => handleFormUpdate({
                          materialDetails: { ...reportData.materialDetails, deliveryDate: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Installation Date
                      </label>
                      <input
                        type="date"
                        value={reportData.materialDetails.installationDate}
                        onChange={(e) => handleFormUpdate({
                          materialDetails: { ...reportData.materialDetails, installationDate: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material Specifications
                    </label>
                    <textarea
                      value={reportData.materialDetails.specifications}
                      onChange={(e) => handleFormUpdate({
                        materialDetails: { ...reportData.materialDetails, specifications: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      rows={3}
                      placeholder="Technical specifications, grade, dimensions, etc."
                    />
                  </div>
                </div>
              </div>
            </FormStep>
          )}

          {/* Placeholder for remaining steps */}
          {reportData.currentStep >= 1 && (
            <FormStep title="Form Steps In Development">
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Material Defect Report Steps {reportData.currentStep + 1}-{formSteps.length} In Development
                </h3>
                <p className="text-gray-600 mb-6">
                  The remaining form steps are being implemented.
                </p>
                <button
                  onClick={handleGenerateReport}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700"
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