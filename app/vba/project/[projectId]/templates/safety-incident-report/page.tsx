'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, AlertTriangle, FileText, Save, Download, Upload, Camera, CheckCircle } from 'lucide-react'
import { db } from '@/lib/db-client'
import { FormWizard, FormProgress, FormStep, FormNavigation, AutoSaveIndicator } from '@/app/components/forms/FormWizard'
import { SafetyIncidentReportSpecifics } from '@/lib/types/reportSpecifics'
import { StandardReportGenerator } from '@/lib/utils/standardReportGenerator'

interface SafetyIncidentFormData extends SafetyIncidentReportSpecifics {
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

export default function SafetyIncidentReportTemplate() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [reportData, setReportData] = useState<SafetyIncidentFormData>({
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
    reportTitle: 'Safety/Incident Report',
    reportSequence: '1',
    reportDate: new Date().toISOString().split('T')[0],
    reference: '',
    attention: 'Safety Department',
    digitalSignature: null,
    generalContext: 'This safety incident report documents the details of an incident that occurred during construction activities.',
    observations: '',
    recommendations: '',
    photos: [],

    // Safety incident specific fields
    reportType: 'Safety/Incident Report',
    oshaReportable: false,
    oshaFormRequired: 'None',
    incidentNumber: '',

    incidentDateTime: {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      timezone: 'EST'
    },

    incidentLocation: {
      specificLocation: '',
      area: '',
      coordinates: '',
      weatherConditions: ''
    },

    injuredParty: {
      name: '',
      age: 0,
      position: '',
      experience: '',
      employedBy: ''
    },

    witnesses: [],

    incidentType: 'injury',
    severity: 'minor',
    bodyPartAffected: [],
    injuryType: 'cut',

    immediateActions: [],

    medicalAttention: {
      required: false,
      type: 'none',
      provider: '',
      outcome: ''
    },

    workStoppageRequired: false,
    areaSecured: false,
    equipmentImpounded: false,

    investigationTeam: [],

    rootCauseAnalysis: {
      primaryCause: '',
      contributingFactors: [],
      humanFactors: [],
      environmentalFactors: [],
      equipmentFactors: []
    },

    preventiveMeasures: [],

    notificationsRequired: [],

    includePhotos: true,
    includeStatements: false,
    confidentialityLevel: 'internal',

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
      description: 'Incident overview and basic details',
      isValid: !!(reportData.incidentNumber && reportData.incidentLocation.specificLocation),
      isOptional: false,
      component: () => null
    },
    {
      id: 'incident-details',
      title: 'Incident Details',
      description: 'Detailed incident information',
      isValid: !!(reportData.incidentType && reportData.injuredParty.name),
      isOptional: false,
      component: () => null
    },
    {
      id: 'investigation',
      title: 'Investigation',
      description: 'Root cause analysis and findings',
      isValid: !!(reportData.rootCauseAnalysis.primaryCause),
      isOptional: false,
      component: () => null
    },
    {
      id: 'actions',
      title: 'Actions & Prevention',
      description: 'Corrective and preventive measures',
      isValid: !!(reportData.preventiveMeasures.length > 0),
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

      // Generate incident number
      const timestamp = Date.now().toString(36).toUpperCase()
      setReportData(prev => ({
        ...prev,
        incidentNumber: `SI-${timestamp}`
      }))

    } catch (error) {
      console.error('Failed to load project data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFormUpdate = (updates: Partial<SafetyIncidentFormData>) => {
    setReportData(prev => ({ ...prev, ...updates }))
  }

  const handleStepChange = (stepIndex: number) => {
    setReportData(prev => ({ ...prev, currentStep: stepIndex }))
  }

  const handleAutoSave = async () => {
    try {
      // Auto-save to database
      await db.inspectionReports.create({
        project_id: projectId,
        report_type: 'safety_incident',
        report_title: reportData.reportTitle,
        report_sequence: reportData.reportSequence,
        report_date: reportData.reportDate,

        observations: reportData.observations,
        recommendations: reportData.recommendations,

        // Safety incident specific fields
        incident_type: reportData.incidentType,
        incident_date: reportData.incidentDateTime.date,
        incident_time: reportData.incidentDateTime.time,
        injured_party: reportData.injuredParty.name,
        witness_names: reportData.witnesses.map(w => w.name),
        incident_description: reportData.observations,
        immediate_actions: reportData.immediateActions.map(a => a.action).join('; '),
        root_cause: reportData.rootCauseAnalysis.primaryCause,
        preventive_measures: reportData.preventiveMeasures.map(p => p.measure).join('; '),
        reported_to_osha: reportData.oshaReportable,
        severity: reportData.severity,

        status: 'draft',
        generated_by: reportData.inspectorName || 'System'
      })

      // Log activity
      await db.activityLogs.create({
        action: 'auto_saved_safety_incident_report',
        entity_type: 'safety_incident_report',
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
      class SafetyIncidentReportGenerator extends StandardReportGenerator {
        generateSpecificContent(data: SafetyIncidentFormData) {
          this.addDateAndLogo(data)
          this.addRecipientInfo(data)
          this.addReference(data, 'Safety/Incident Report')
          this.addIntroduction(data, 'investigate and document the safety incident that occurred on the project site')

          // Incident Overview
          this.addSection('Incident Overview', `
Incident Number: ${data.incidentNumber || 'SI-' + Date.now().toString(36).toUpperCase()}
Date and Time: ${data.incidentDateTime.date} at ${data.incidentDateTime.time}
Location: ${data.incidentLocation.specificLocation}
Incident Type: ${data.incidentType}
Severity: ${data.severity}
OSHA Reportable: ${data.oshaReportable ? 'Yes' : 'No'}
          `)

          // Involved Parties
          this.addSection('Injured Party Information', `
Name: ${data.injuredParty.name}
Position: ${data.injuredParty.position}
Employer: ${data.injuredParty.employedBy}
Experience: ${data.injuredParty.experience}
          `)

          if (data.witnesses && data.witnesses.length > 0) {
            this.addSection('Witnesses', '')
            data.witnesses.forEach((witness, index) => {
              this.checkPageBreak(10)
              this.pdf.text(`${index + 1}. ${witness.name} - ${witness.position}`, this.margin + 10, this.yPosition)
              this.yPosition += 5
            })
            this.yPosition += 5
          }

          // Incident Description
          if (data.observations) {
            this.addSection('Incident Description', data.observations)
          }

          // Immediate Actions
          if (data.immediateActions && data.immediateActions.length > 0) {
            this.addSection('Immediate Actions Taken', '')
            data.immediateActions.forEach((action) => {
              this.checkPageBreak(5)
              this.pdf.text(`• ${action.time}: ${action.action} (by ${action.performedBy})`, this.margin + 5, this.yPosition)
              this.yPosition += 5
            })
            this.yPosition += 5
          }

          // Root Cause Analysis
          if (data.rootCauseAnalysis.primaryCause) {
            this.addSection('Root Cause Analysis', `
Primary Cause: ${data.rootCauseAnalysis.primaryCause}

Contributing Factors:
${data.rootCauseAnalysis.contributingFactors.map(f => `• ${f}`).join('\n')}

Human Factors:
${data.rootCauseAnalysis.humanFactors.map(f => `• ${f}`).join('\n')}

Environmental Factors:
${data.rootCauseAnalysis.environmentalFactors.map(f => `• ${f}`).join('\n')}

Equipment Factors:
${data.rootCauseAnalysis.equipmentFactors.map(f => `• ${f}`).join('\n')}
            `)
          }

          // Preventive Measures
          if (data.preventiveMeasures && data.preventiveMeasures.length > 0) {
            this.addSection('Preventive Measures', '')
            data.preventiveMeasures.forEach((measure) => {
              this.checkPageBreak(10)
              this.pdf.text(`• ${measure.measure}`, this.margin + 5, this.yPosition)
              this.yPosition += 5
              this.pdf.text(`  Implementation: ${measure.implementation}`, this.margin + 10, this.yPosition)
              this.yPosition += 5
              this.pdf.text(`  Responsible: ${measure.responsible}`, this.margin + 10, this.yPosition)
              this.yPosition += 5
              this.pdf.text(`  Target Date: ${measure.targetDate}`, this.margin + 10, this.yPosition)
              this.yPosition += 10
            })
          }

          // Recommendations
          if (data.recommendations) {
            this.addSection('Recommendations', data.recommendations)
          }

          // Signature
          this.addSignature(data, false)

          // Limitations
          this.addLimitations()

          // Photos
          if (data.includePhotos) {
            this.addPhotos(data)
          }
        }
      }

      const generator = new SafetyIncidentReportGenerator()
      generator.generateSpecificContent(reportData)

      // Generate filename
      const date = new Date()
      const year = date.getFullYear().toString().slice(-2)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const sequence = reportData.reportSequence.padStart(3, '0')
      const filename = `${year} ${month} ${day} ${sequence} - Safety Incident Report`

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
        report_type: 'safety_incident',
        report_title: reportData.reportTitle,
        report_sequence: reportData.reportSequence,
        report_date: reportData.reportDate,

        observations: reportData.observations,
        recommendations: reportData.recommendations,

        incident_type: reportData.incidentType,
        incident_date: reportData.incidentDateTime.date,
        incident_time: reportData.incidentDateTime.time,
        injured_party: reportData.injuredParty.name,
        witness_names: reportData.witnesses.map(w => w.name),
        incident_description: reportData.observations,
        immediate_actions: reportData.immediateActions.map(a => a.action).join('; '),
        root_cause: reportData.rootCauseAnalysis.primaryCause,
        preventive_measures: reportData.preventiveMeasures.map(p => p.measure).join('; '),
        reported_to_osha: reportData.oshaReportable,
        severity: reportData.severity,

        status: 'final',
        generated_by: reportData.inspectorName || 'System',
        file_url: `${filename}.pdf`
      })

      // Log activity
      await db.activityLogs.create({
        action: 'generated_safety_incident_report',
        entity_type: 'safety_incident_report',
        entity_id: projectId,
        metadata: {
          filename: `${filename}.pdf`,
          incidentNumber: reportData.incidentNumber,
          severity: reportData.severity
        }
      })

      alert(`Safety Incident Report generated successfully!\n\nFile: ${filename}.pdf`)

    } catch (error) {
      console.error('Failed to generate report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const addWitness = () => {
    setReportData(prev => ({
      ...prev,
      witnesses: [...prev.witnesses, { name: '', position: '', contact: '', statement: '' }]
    }))
  }

  const updateWitness = (index: number, field: string, value: string) => {
    setReportData(prev => ({
      ...prev,
      witnesses: prev.witnesses.map((witness, i) =>
        i === index ? { ...witness, [field]: value } : witness
      )
    }))
  }

  const removeWitness = (index: number) => {
    setReportData(prev => ({
      ...prev,
      witnesses: prev.witnesses.filter((_, i) => i !== index)
    }))
  }

  const addImmediateAction = () => {
    setReportData(prev => ({
      ...prev,
      immediateActions: [...prev.immediateActions, {
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        action: '',
        performedBy: ''
      }]
    }))
  }

  const addPreventiveMeasure = () => {
    setReportData(prev => ({
      ...prev,
      preventiveMeasures: [...prev.preventiveMeasures, {
        measure: '',
        implementation: 'immediate',
        responsible: '',
        targetDate: ''
      }]
    }))
  }

  const updateImmediateAction = (index: number, field: string, value: string) => {
    setReportData(prev => ({
      ...prev,
      immediateActions: prev.immediateActions.map((action, i) =>
        i === index ? { ...action, [field]: value } : action
      )
    }))
  }

  const removeImmediateAction = (index: number) => {
    setReportData(prev => ({
      ...prev,
      immediateActions: prev.immediateActions.filter((_, i) => i !== index)
    }))
  }

  const updatePreventiveMeasure = (index: number, field: string, value: string) => {
    setReportData(prev => ({
      ...prev,
      preventiveMeasures: prev.preventiveMeasures.map((measure, i) =>
        i === index ? { ...measure, [field]: value } : measure
      )
    }))
  }

  const removePreventiveMeasure = (index: number) => {
    setReportData(prev => ({
      ...prev,
      preventiveMeasures: prev.preventiveMeasures.filter((_, i) => i !== index)
    }))
  }

  const addContributingFactor = (category: string) => {
    setReportData(prev => ({
      ...prev,
      rootCauseAnalysis: {
        ...prev.rootCauseAnalysis,
        [category]: [...prev.rootCauseAnalysis[category as keyof typeof prev.rootCauseAnalysis] as string[], '']
      }
    }))
  }

  const updateContributingFactor = (category: string, index: number, value: string) => {
    setReportData(prev => ({
      ...prev,
      rootCauseAnalysis: {
        ...prev.rootCauseAnalysis,
        [category]: (prev.rootCauseAnalysis[category as keyof typeof prev.rootCauseAnalysis] as string[]).map((factor, i) =>
          i === index ? value : factor
        )
      }
    }))
  }

  const removeContributingFactor = (category: string, index: number) => {
    setReportData(prev => ({
      ...prev,
      rootCauseAnalysis: {
        ...prev.rootCauseAnalysis,
        [category]: (prev.rootCauseAnalysis[category as keyof typeof prev.rootCauseAnalysis] as string[]).filter((_, i) => i !== index)
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h1 className="text-xl font-semibold text-gray-900">Safety/Incident Report</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <AutoSaveIndicator />
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2"
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

          {/* Step Content */}
          {reportData.currentStep === 0 && (
            <FormStep title="Basic Incident Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Incident Number *
                  </label>
                  <input
                    type="text"
                    value={reportData.incidentNumber}
                    onChange={(e) => handleFormUpdate({ incidentNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Incident Date *
                  </label>
                  <input
                    type="date"
                    value={reportData.incidentDateTime.date}
                    onChange={(e) => handleFormUpdate({
                      incidentDateTime: { ...reportData.incidentDateTime, date: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Incident Time *
                  </label>
                  <input
                    type="time"
                    value={reportData.incidentDateTime.time}
                    onChange={(e) => handleFormUpdate({
                      incidentDateTime: { ...reportData.incidentDateTime, time: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specific Location *
                  </label>
                  <input
                    type="text"
                    value={reportData.incidentLocation.specificLocation}
                    onChange={(e) => handleFormUpdate({
                      incidentLocation: { ...reportData.incidentLocation, specificLocation: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g., Building 3, 2nd Floor, East Wing"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Area
                  </label>
                  <input
                    type="text"
                    value={reportData.incidentLocation.area}
                    onChange={(e) => handleFormUpdate({
                      incidentLocation: { ...reportData.incidentLocation, area: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g., Construction Zone A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weather Conditions
                  </label>
                  <input
                    type="text"
                    value={reportData.incidentLocation.weatherConditions}
                    onChange={(e) => handleFormUpdate({
                      incidentLocation: { ...reportData.incidentLocation, weatherConditions: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g., Clear, 85°F, Light Wind"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={reportData.oshaReportable}
                        onChange={(e) => handleFormUpdate({ oshaReportable: e.target.checked })}
                        className="rounded border-gray-300 text-red-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">OSHA Reportable Incident</span>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        OSHA Form Required
                      </label>
                      <select
                        value={reportData.oshaFormRequired}
                        onChange={(e) => handleFormUpdate({ oshaFormRequired: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="None">None</option>
                        <option value="300">Form 300</option>
                        <option value="301">Form 301</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </FormStep>
          )}

          {/* Additional form steps would go here */}
          {reportData.currentStep === 1 && (
            <FormStep title="Incident Details">
              <div className="space-y-6">
                {/* Injured Party Information */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Injured Party Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={reportData.injuredParty.name}
                        onChange={(e) => handleFormUpdate({
                          injuredParty: { ...reportData.injuredParty, name: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        value={reportData.injuredParty.age || ''}
                        onChange={(e) => handleFormUpdate({
                          injuredParty: { ...reportData.injuredParty, age: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position/Job Title
                      </label>
                      <input
                        type="text"
                        value={reportData.injuredParty.position}
                        onChange={(e) => handleFormUpdate({
                          injuredParty: { ...reportData.injuredParty, position: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employer
                      </label>
                      <input
                        type="text"
                        value={reportData.injuredParty.employedBy}
                        onChange={(e) => handleFormUpdate({
                          injuredParty: { ...reportData.injuredParty, employedBy: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Experience Level
                      </label>
                      <input
                        type="text"
                        value={reportData.injuredParty.experience}
                        onChange={(e) => handleFormUpdate({
                          injuredParty: { ...reportData.injuredParty, experience: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="e.g., 5 years in construction, 2 years in current role"
                      />
                    </div>
                  </div>
                </div>

                {/* Incident Classification */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Incident Classification</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Incident Type *
                      </label>
                      <select
                        value={reportData.incidentType}
                        onChange={(e) => handleFormUpdate({ incidentType: e.target.value as any })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      >
                        <option value="injury">Injury</option>
                        <option value="near_miss">Near Miss</option>
                        <option value="property_damage">Property Damage</option>
                        <option value="environmental">Environmental</option>
                        <option value="security">Security</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Severity *
                      </label>
                      <select
                        value={reportData.severity}
                        onChange={(e) => handleFormUpdate({ severity: e.target.value as any })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      >
                        <option value="minor">Minor</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                        <option value="fatal">Fatal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type of Injury
                      </label>
                      <select
                        value={reportData.injuryType}
                        onChange={(e) => handleFormUpdate({ injuryType: e.target.value as any })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="cut">Cut</option>
                        <option value="bruise">Bruise</option>
                        <option value="fracture">Fracture</option>
                        <option value="burn">Burn</option>
                        <option value="strain">Strain</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Witnesses */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Witnesses</h3>
                    <button
                      onClick={addWitness}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Add Witness
                    </button>
                  </div>

                  {reportData.witnesses.map((witness, index) => (
                    <div key={index} className="border border-gray-100 rounded-lg p-3 mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Witness {index + 1}</span>
                        <button
                          onClick={() => removeWitness(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Name"
                          value={witness.name}
                          onChange={(e) => updateWitness(index, 'name', e.target.value)}
                          className="border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Position"
                          value={witness.position}
                          onChange={(e) => updateWitness(index, 'position', e.target.value)}
                          className="border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Contact"
                          value={witness.contact}
                          onChange={(e) => updateWitness(index, 'contact', e.target.value)}
                          className="border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  ))}

                  {reportData.witnesses.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No witnesses added. Click &quot;Add Witness&quot; to include witness information.
                    </p>
                  )}
                </div>
              </div>
            </FormStep>
          )}

          {/* Step 3: Investigation */}
          {reportData.currentStep === 2 && (
            <FormStep title="Investigation">
              <div className="space-y-6">
                {/* Immediate Actions */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Immediate Actions Taken</h3>
                    <button
                      onClick={addImmediateAction}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Add Action
                    </button>
                  </div>

                  {reportData.immediateActions.map((action, index) => (
                    <div key={index} className="border border-gray-100 rounded-lg p-3 mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Action {index + 1}</span>
                        <button
                          onClick={() => removeImmediateAction(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="time"
                          placeholder="Time"
                          value={action.time}
                          onChange={(e) => updateImmediateAction(index, 'time', e.target.value)}
                          className="border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Action Taken"
                          value={action.action}
                          onChange={(e) => updateImmediateAction(index, 'action', e.target.value)}
                          className="border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Performed By"
                          value={action.performedBy}
                          onChange={(e) => updateImmediateAction(index, 'performedBy', e.target.value)}
                          className="border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  ))}

                  {reportData.immediateActions.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No immediate actions recorded. Click &quot;Add Action&quot; to document response timeline.
                    </p>
                  )}
                </div>

                {/* Work Impact */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Work Impact</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={reportData.workStoppageRequired}
                        onChange={(e) => handleFormUpdate({ workStoppageRequired: e.target.checked })}
                        className="rounded border-gray-300 text-red-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Work stoppage required</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={reportData.areaSecured}
                        onChange={(e) => handleFormUpdate({ areaSecured: e.target.checked })}
                        className="rounded border-gray-300 text-red-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Area secured</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={reportData.equipmentImpounded}
                        onChange={(e) => handleFormUpdate({ equipmentImpounded: e.target.checked })}
                        className="rounded border-gray-300 text-red-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Equipment impounded</span>
                    </label>
                  </div>
                </div>

                {/* Medical Attention */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Attention</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center mb-3">
                        <input
                          type="checkbox"
                          checked={reportData.medicalAttention.required}
                          onChange={(e) => handleFormUpdate({
                            medicalAttention: { ...reportData.medicalAttention, required: e.target.checked }
                          })}
                          className="rounded border-gray-300 text-red-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Medical attention required</span>
                      </label>

                      {reportData.medicalAttention.required && (
                        <>
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Type of Treatment
                            </label>
                            <select
                              value={reportData.medicalAttention.type}
                              onChange={(e) => handleFormUpdate({
                                medicalAttention: { ...reportData.medicalAttention, type: e.target.value as any }
                              })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            >
                              <option value="none">None</option>
                              <option value="first_aid">First Aid</option>
                              <option value="medical_treatment">Medical Treatment</option>
                              <option value="hospital">Hospital</option>
                            </select>
                          </div>

                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Healthcare Provider
                            </label>
                            <input
                              type="text"
                              value={reportData.medicalAttention.provider || ''}
                              onChange={(e) => handleFormUpdate({
                                medicalAttention: { ...reportData.medicalAttention, provider: e.target.value }
                              })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              placeholder="Hospital, Clinic, or First Aid Provider"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Treatment Outcome
                            </label>
                            <textarea
                              value={reportData.medicalAttention.outcome || ''}
                              onChange={(e) => handleFormUpdate({
                                medicalAttention: { ...reportData.medicalAttention, outcome: e.target.value }
                              })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              rows={3}
                              placeholder="Brief description of treatment and current status"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Root Cause Analysis */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Root Cause Analysis</h3>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Cause *
                    </label>
                    <textarea
                      value={reportData.rootCauseAnalysis.primaryCause}
                      onChange={(e) => handleFormUpdate({
                        rootCauseAnalysis: { ...reportData.rootCauseAnalysis, primaryCause: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      rows={3}
                      placeholder="Describe the primary root cause of the incident"
                      required
                    />
                  </div>

                  {/* Contributing Factors */}
                  {[
                    { key: 'contributingFactors', label: 'Contributing Factors' },
                    { key: 'humanFactors', label: 'Human Factors' },
                    { key: 'environmentalFactors', label: 'Environmental Factors' },
                    { key: 'equipmentFactors', label: 'Equipment Factors' }
                  ].map(({ key, label }) => (
                    <div key={key} className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {label}
                        </label>
                        <button
                          onClick={() => addContributingFactor(key)}
                          className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
                        >
                          Add Factor
                        </button>
                      </div>

                      {(reportData.rootCauseAnalysis[key as keyof typeof reportData.rootCauseAnalysis] as string[]).map((factor, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={factor}
                            onChange={(e) => updateContributingFactor(key, index, e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                            placeholder={`Enter ${label.toLowerCase()}`}
                          />
                          <button
                            onClick={() => removeContributingFactor(key, index)}
                            className="text-red-600 hover:text-red-800 px-2"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Incident Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detailed Incident Description
                  </label>
                  <textarea
                    value={reportData.observations}
                    onChange={(e) => handleFormUpdate({ observations: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={6}
                    placeholder="Provide a detailed description of what happened, sequence of events, and circumstances leading to the incident..."
                  />
                </div>
              </div>
            </FormStep>
          )}

          {/* Step 4: Actions & Prevention */}
          {reportData.currentStep === 3 && (
            <FormStep title="Actions & Prevention">
              <div className="space-y-6">
                {/* Preventive Measures */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Preventive Measures *</h3>
                    <button
                      onClick={addPreventiveMeasure}
                      className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
                    >
                      Add Measure
                    </button>
                  </div>

                  {reportData.preventiveMeasures.map((measure, index) => (
                    <div key={index} className="border border-gray-100 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-700">Preventive Measure {index + 1}</span>
                        <button
                          onClick={() => removePreventiveMeasure(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Measure Description *
                          </label>
                          <textarea
                            value={measure.measure}
                            onChange={(e) => updatePreventiveMeasure(index, 'measure', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            rows={3}
                            placeholder="Describe the preventive measure to be implemented"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Implementation Timeline
                            </label>
                            <select
                              value={measure.implementation}
                              onChange={(e) => updatePreventiveMeasure(index, 'implementation', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            >
                              <option value="immediate">Immediate</option>
                              <option value="short_term">Short Term (1-30 days)</option>
                              <option value="long_term">Long Term (30+ days)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Responsible Person
                            </label>
                            <input
                              type="text"
                              value={measure.responsible}
                              onChange={(e) => updatePreventiveMeasure(index, 'responsible', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                              placeholder="Name/Title"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Target Date
                            </label>
                            <input
                              type="date"
                              value={measure.targetDate}
                              onChange={(e) => updatePreventiveMeasure(index, 'targetDate', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {reportData.preventiveMeasures.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <AlertTriangle className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">
                        At least one preventive measure is required. Click &quot;Add Measure&quot; to document prevention steps.
                      </p>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Recommendations
                  </label>
                  <textarea
                    value={reportData.recommendations}
                    onChange={(e) => handleFormUpdate({ recommendations: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={4}
                    placeholder="Additional recommendations for preventing similar incidents..."
                  />
                </div>

                {/* Report Options */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Report Options</h3>

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={reportData.includePhotos}
                        onChange={(e) => handleFormUpdate({ includePhotos: e.target.checked })}
                        className="rounded border-gray-300 text-red-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Include photos in report</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={reportData.includeStatements}
                        onChange={(e) => handleFormUpdate({ includeStatements: e.target.checked })}
                        className="rounded border-gray-300 text-red-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Include witness statements</span>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confidentiality Level
                      </label>
                      <select
                        value={reportData.confidentialityLevel}
                        onChange={(e) => handleFormUpdate({ confidentialityLevel: e.target.value as any })}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="internal">Internal Use Only</option>
                        <option value="restricted">Restricted Access</option>
                        <option value="public">Public Record</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </FormStep>
          )}

          {/* Step 5: Review & Generate */}
          {reportData.currentStep === 4 && (
            <FormStep title="Review & Generate">
              <div className="space-y-6">
                {/* Report Summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Report Summary</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Incident Number:</span>
                      <span className="ml-2 text-gray-600">{reportData.incidentNumber}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Date & Time:</span>
                      <span className="ml-2 text-gray-600">
                        {reportData.incidentDateTime.date} at {reportData.incidentDateTime.time}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <span className="ml-2 text-gray-600">{reportData.incidentLocation.specificLocation}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Severity:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        reportData.severity === 'fatal' ? 'bg-red-100 text-red-800' :
                        reportData.severity === 'severe' ? 'bg-orange-100 text-orange-800' :
                        reportData.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {reportData.severity.charAt(0).toUpperCase() + reportData.severity.slice(1)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Injured Party:</span>
                      <span className="ml-2 text-gray-600">{reportData.injuredParty.name || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">OSHA Reportable:</span>
                      <span className="ml-2 text-gray-600">{reportData.oshaReportable ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Witnesses:</span>
                      <span className="ml-2 text-gray-600">{reportData.witnesses.length} recorded</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Preventive Measures:</span>
                      <span className="ml-2 text-gray-600">{reportData.preventiveMeasures.length} defined</span>
                    </div>
                  </div>
                </div>

                {/* Validation Checks */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Validation Checks</h3>

                  <div className="space-y-2">
                    {[
                      { check: !!reportData.incidentNumber, label: 'Incident number provided' },
                      { check: !!reportData.incidentLocation.specificLocation, label: 'Incident location specified' },
                      { check: !!reportData.injuredParty.name, label: 'Injured party identified' },
                      { check: !!reportData.rootCauseAnalysis.primaryCause, label: 'Root cause analysis completed' },
                      { check: reportData.preventiveMeasures.length > 0, label: 'Preventive measures defined' },
                      { check: reportData.immediateActions.length > 0 || reportData.observations.length > 50, label: 'Sufficient incident details provided' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center">
                        {item.check ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                        )}
                        <span className={`text-sm ${item.check ? 'text-gray-700' : 'text-yellow-700'}`}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generate Report Button */}
                <div className="text-center py-6">
                  <button
                    onClick={handleGenerateReport}
                    disabled={generating}
                    className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2 mx-auto text-lg"
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating Safety Incident Report...
                      </>
                    ) : (
                      <>
                        <FileText className="h-5 w-5" />
                        Generate Safety Incident Report
                      </>
                    )}
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    This will create a PDF report and save it to the project records.
                  </p>
                </div>
              </div>
            </FormStep>
          )}

          <FormNavigation />
        </FormWizard>
      </div>
    </div>
  )
}