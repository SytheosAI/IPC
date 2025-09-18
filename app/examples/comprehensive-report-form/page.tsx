'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FormWizard,
  FormProgress,
  FormStep,
  FormNavigation,
  AutoSaveIndicator,
  FieldGroup
} from '@/app/components/forms/FormWizard'
import {
  TextInput,
  Textarea,
  Select,
  DateInput,
  FileUpload,
  Checkbox
} from '@/app/components/forms/FormInputs'
import {
  FormStateProvider,
  FormActionsBar,
  FormInput
} from '@/app/components/forms/FormStateManager'
import {
  NavigationHeader,
  SmartBreadcrumb,
  ReportTypeSelector,
  QuickCreateMenu
} from '@/app/components/navigation/ReportNavigation'
import {
  ReportsTable,
  ReportStatusBadge,
  ReportTypeBadge
} from '@/app/components/reports/ReportsTable'
import {
  useResponsive,
  MobileReportsList,
  MobileFilterPanel,
  FloatingActionButton,
  MobileFormLayout
} from '@/app/components/responsive/MobileComponents'
import { ReportType, ReportMetadata } from '@/lib/types/reports'
import { validateEmail, validateRequired, validateMinLength } from '@/lib/utils'

// Mock data for demonstration
const mockReports: ReportMetadata[] = [
  {
    id: '1',
    projectId: 'proj-123',
    reportType: 'inspection',
    reportTitle: 'Concrete Foundation Inspection',
    reportSequence: '001',
    reportDate: '2024-01-15',
    status: 'final',
    generatedBy: 'John Smith, PE',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    projectId: 'proj-123',
    reportType: 'safety_incident',
    reportTitle: 'Near Miss Report - Crane Operation',
    reportSequence: '002',
    reportDate: '2024-01-14',
    status: 'draft',
    generatedBy: 'Sarah Johnson',
    createdAt: '2024-01-14T14:00:00Z',
    updatedAt: '2024-01-14T14:15:00Z'
  },
  {
    id: '3',
    projectId: 'proj-123',
    reportType: 'engineering',
    reportTitle: 'Structural Analysis - Beam Design',
    reportSequence: '003',
    reportDate: '2024-01-13',
    status: 'final',
    generatedBy: 'Michael Chen, PE',
    createdAt: '2024-01-13T09:00:00Z',
    updatedAt: '2024-01-13T09:45:00Z'
  }
]

// Form Steps Configuration
const formSteps = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Project and report details',
    component: BasicInformationStep
  },
  {
    id: 'inspector',
    title: 'Inspector Details',
    description: 'Inspector and company information',
    component: InspectorInformationStep
  },
  {
    id: 'technical',
    title: 'Technical Details',
    description: 'Technical observations and findings',
    component: TechnicalDetailsStep
  },
  {
    id: 'attachments',
    title: 'Attachments',
    description: 'Photos and supporting documents',
    component: AttachmentsStep
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review all information before submission',
    component: ReviewStep
  }
]

// Individual Step Components
function BasicInformationStep() {
  return (
    <FormStep title="Basic Information" description="Enter the basic project and report details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextInput
          label="Project Name"
          placeholder="Enter project name"
          required
          value=""
          onChange={() => {}}
        />

        <TextInput
          label="Project Address"
          placeholder="Enter project address"
          required
          value=""
          onChange={() => {}}
        />

        <DateInput
          label="Inspection Date"
          required
          value=""
          onChange={() => {}}
        />

        <Select
          label="Report Type"
          placeholder="Select report type"
          required
          options={[
            { value: 'inspection', label: 'Inspection Report' },
            { value: 'compliance', label: 'Compliance Report' },
            { value: 'safety_incident', label: 'Safety Incident Report' },
            { value: 'material_defect', label: 'Material Defect Report' },
            { value: 'engineering', label: 'Engineering Report' }
          ]}
          value=""
          onChange={() => {}}
        />
      </div>

      <FieldGroup title="Additional Details" collapsible>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextInput
            label="Job Number"
            placeholder="Enter job number"
            value=""
            onChange={() => {}}
          />

          <TextInput
            label="Report Sequence"
            placeholder="001"
            required
            value=""
            onChange={() => {}}
          />
        </div>

        <Textarea
          label="General Context"
          placeholder="Enter general context or description"
          rows={4}
          value=""
          onChange={() => {}}
        />
      </FieldGroup>
    </FormStep>
  )
}

function InspectorInformationStep() {
  return (
    <FormStep title="Inspector Information" description="Enter inspector and company details">
      <FieldGroup title="Inspector Details" required>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextInput
            label="Inspector Name"
            placeholder="Enter inspector name"
            required
            value=""
            onChange={() => {}}
          />

          <TextInput
            label="License Number"
            placeholder="PE12345"
            required
            value=""
            onChange={() => {}}
          />

          <TextInput
            label="Email Address"
            type="email"
            placeholder="inspector@company.com"
            required
            value=""
            onChange={() => {}}
          />

          <TextInput
            label="Phone Number"
            type="tel"
            placeholder="(555) 123-4567"
            value=""
            onChange={() => {}}
          />
        </div>
      </FieldGroup>

      <FieldGroup title="Company Information" required>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextInput
            label="Company Name"
            placeholder="Enter company name"
            required
            value=""
            onChange={() => {}}
          />

          <TextInput
            label="Company Address"
            placeholder="Enter company address"
            value=""
            onChange={() => {}}
          />

          <TextInput
            label="Company Phone"
            type="tel"
            placeholder="(555) 123-4567"
            value=""
            onChange={() => {}}
          />

          <FileUpload
            label="Company Logo"
            accept="image/*"
            value={null}
            onChange={() => {}}
          />
        </div>
      </FieldGroup>
    </FormStep>
  )
}

function TechnicalDetailsStep() {
  return (
    <FormStep title="Technical Details" description="Enter technical observations and findings">
      <FieldGroup title="Observations" required>
        <Textarea
          label="Detailed Observations"
          placeholder="Enter detailed observations from the inspection..."
          rows={6}
          required
          value=""
          onChange={() => {}}
        />
      </FieldGroup>

      <FieldGroup title="Recommendations">
        <Textarea
          label="Recommendations"
          placeholder="Enter recommendations based on observations..."
          rows={4}
          value=""
          onChange={() => {}}
        />
      </FieldGroup>

      <FieldGroup title="Technical Specifications" collapsible>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextInput
            label="Work Zone"
            placeholder="Enter work zone"
            value=""
            onChange={() => {}}
          />

          <TextInput
            label="Work Performed"
            placeholder="Enter work performed"
            value=""
            onChange={() => {}}
          />

          <TextInput
            label="Drawing Page"
            placeholder="Enter drawing reference"
            value=""
            onChange={() => {}}
          />

          <Select
            label="Weather Conditions"
            options={[
              { value: 'sunny', label: 'Sunny' },
              { value: 'cloudy', label: 'Cloudy' },
              { value: 'rainy', label: 'Rainy' },
              { value: 'windy', label: 'Windy' }
            ]}
            value=""
            onChange={() => {}}
          />
        </div>
      </FieldGroup>
    </FormStep>
  )
}

function AttachmentsStep() {
  return (
    <FormStep title="Attachments" description="Upload photos and supporting documents">
      <FieldGroup title="Photos">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUpload
            label="Site Photos"
            accept="image/*"
            value={null}
            onChange={() => {}}
          />

          <FileUpload
            label="Additional Photos"
            accept="image/*"
            value={null}
            onChange={() => {}}
          />
        </div>
      </FieldGroup>

      <FieldGroup title="Digital Signature" required>
        <FileUpload
          label="Digital Signature"
          accept="image/*"
          required
          value={null}
          onChange={() => {}}
        />
      </FieldGroup>

      <FieldGroup title="Supporting Documents" collapsible>
        <FileUpload
          label="Additional Documents"
          accept=".pdf,.doc,.docx"
          value={null}
          onChange={() => {}}
        />
      </FieldGroup>
    </FormStep>
  )
}

function ReviewStep() {
  return (
    <FormStep title="Review & Submit" description="Review all information before final submission">
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Review Instructions</h3>
          <p className="text-sm text-blue-700">
            Please review all the information you've entered. Once submitted, the report will be marked as final
            and cannot be modified without creating a new revision.
          </p>
        </div>

        <FieldGroup title="Report Summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Project:</span>
              <span className="ml-2 text-gray-900">Sample Project Name</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Inspector:</span>
              <span className="ml-2 text-gray-900">John Smith, PE</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Date:</span>
              <span className="ml-2 text-gray-900">January 15, 2024</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Report Type:</span>
              <span className="ml-2 text-gray-900">Inspection Report</span>
            </div>
          </div>
        </FieldGroup>

        <FieldGroup title="Confirmation" required>
          <Checkbox
            checked={false}
            onChange={() => {}}
          >
            I confirm that all information entered is accurate and complete to the best of my knowledge.
          </Checkbox>

          <Checkbox
            checked={false}
            onChange={() => {}}
          >
            I understand that this report will be marked as final upon submission.
          </Checkbox>
        </FieldGroup>
      </div>
    </FormStep>
  )
}

// Main Page Component
export default function ComprehensiveReportFormExample() {
  const router = useRouter()
  const { isMobile, isTablet } = useResponsive()

  const [showReportsTable, setShowReportsTable] = useState(true)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set())
  const [currentReportType, setCurrentReportType] = useState<ReportType>('inspection')

  const [filters, setFilters] = useState({
    search: '',
    type: 'all' as ReportType | 'all',
    status: 'all' as 'draft' | 'final' | 'all',
    inspector: '',
    dateRange: { start: '', end: '' }
  })

  // Form validation rules
  const validationRules = {
    projectName: validateRequired,
    inspectorName: validateRequired,
    inspectorEmail: (value: string) => validateRequired(value) || validateEmail(value),
    observations: (value: string) => validateRequired(value) || validateMinLength(value, 10)
  }

  // Auto-save handler
  const handleAutoSave = async (data: Record<string, any>) => {
    console.log('Auto-saving form data:', data)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Form submission handler
  const handleSubmit = async (data: Record<string, any>) => {
    console.log('Submitting form:', data)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  // Report actions
  const handleQuickAction = (action: string, reportId: string) => {
    console.log(`Action: ${action} on report: ${reportId}`)
  }

  const handleBatchAction = (action: string, reportIds: string[]) => {
    console.log(`Batch action: ${action} on reports:`, reportIds)
  }

  // Breadcrumb configuration
  const breadcrumbs = [
    { label: 'Dashboard', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'Sample Project', href: '/projects/sample' },
    { label: 'Reports', current: true }
  ]

  if (isMobile) {
    return (
      <MobileFormLayout
        title="Reports"
        subtitle="Comprehensive Report System"
        onBack={() => router.push('/projects')}
        actions={
          <FloatingActionButton
            onClick={() => setShowReportsTable(false)}
            label="Create"
          />
        }
      >
        {showReportsTable ? (
          <>
            <MobileReportsList
              reports={mockReports}
              selectedReports={selectedReports}
              onSelectReport={(id, selected) => {
                const newSelected = new Set(selectedReports)
                if (selected) newSelected.add(id)
                else newSelected.delete(id)
                setSelectedReports(newSelected)
              }}
              onSelectAll={(selected) => {
                setSelectedReports(selected ? new Set(mockReports.map(r => r.id)) : new Set())
              }}
              onAction={handleQuickAction}
              onBatchAction={handleBatchAction}
            />

            <MobileFilterPanel
              isOpen={showMobileFilters}
              onClose={() => setShowMobileFilters(false)}
              filters={filters}
              onFilterChange={setFilters}
            />
          </>
        ) : (
          <FormStateProvider
            validationRules={validationRules}
            onAutoSave={handleAutoSave}
            onSubmit={handleSubmit}
          >
            <FormWizard
              steps={formSteps}
              onComplete={async (data) => {
                await handleSubmit(data)
                setShowReportsTable(true)
              }}
            >
              <FormProgress />

              <div className="mt-6">
                {formSteps.map((step, index) => (
                  <div key={step.id} className={index === 0 ? 'block' : 'hidden'}>
                    <step.component />
                  </div>
                ))}
              </div>

              <FormNavigation />

              <div className="mt-6">
                <FormActionsBar />
              </div>
            </FormWizard>
          </FormStateProvider>
        )}
      </MobileFormLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <NavigationHeader
        title="Comprehensive Report System"
        subtitle="Advanced form wizard with responsive design"
        breadcrumbs={breadcrumbs}
        showSearch
        onSearch={(query) => setFilters({ ...filters, search: query })}
        actions={
          <div className="flex items-center space-x-3">
            <QuickCreateMenu
              projectId="sample-project"
              onSelect={(type) => {
                setCurrentReportType(type)
                setShowReportsTable(false)
              }}
            />
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showReportsTable ? (
          /* Reports Table View */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Existing Reports</h2>

              <div className="flex items-center space-x-3">
                <ReportTypeSelector
                  currentType={currentReportType}
                  onSelect={setCurrentReportType}
                />

                <button
                  onClick={() => setShowReportsTable(false)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create New Report
                </button>
              </div>
            </div>

            <ReportsTable
              reports={mockReports}
              filters={filters}
              onFilter={setFilters}
              onSort={(sort) => console.log('Sort:', sort)}
              onBatchAction={handleBatchAction}
              onQuickAction={handleQuickAction}
            />
          </div>
        ) : (
          /* Form Creation View */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Create New Report</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Follow the steps below to create a comprehensive report
                    </p>
                  </div>

                  <button
                    onClick={() => setShowReportsTable(true)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Back to Reports
                  </button>
                </div>
              </div>

              <div className="p-6">
                <FormStateProvider
                  validationRules={validationRules}
                  onAutoSave={handleAutoSave}
                  onSubmit={handleSubmit}
                  autoSaveDelay={3000}
                >
                  <FormWizard
                    steps={formSteps}
                    onComplete={async (data) => {
                      await handleSubmit(data)
                      setShowReportsTable(true)
                    }}
                    className="space-y-8"
                  >
                    <div className="mb-8">
                      <FormProgress />
                      <div className="mt-4 flex justify-end">
                        <AutoSaveIndicator showDetailedStatus />
                      </div>
                    </div>

                    {formSteps.map((step, index) => (
                      <div key={step.id} className={index === 0 ? 'block' : 'hidden'}>
                        <step.component />
                      </div>
                    ))}

                    <FormNavigation />
                  </FormWizard>

                  <FormActionsBar
                    onCancel={() => setShowReportsTable(true)}
                    className="mt-8"
                  />
                </FormStateProvider>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}