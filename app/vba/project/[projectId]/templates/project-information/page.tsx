'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, Save, Upload, FileImage, Building2, User, Phone, Mail, HardHat, ClipboardCheck, MapPin, Calendar, DollarSign, Briefcase
} from 'lucide-react'
import { db } from '@/lib/supabase-client'

interface ProjectInfoData {
  // Basic Info
  reference: string
  attention: string
  companyLogo: string | null
  projectName: string
  projectAddress: string
  licenseNumber: string
  companyName: string
  digitalSignature: string | null
  
  // Site Superintendent
  siteSuperintendent: string
  superintendentPhone: string
  superintendentEmail: string
  
  // Consultant
  consultant: string
  consultantCompany: string
  consultantPhone: string
  consultantEmail: string
  
  // Inspector
  inspector: string
  inspectorCompany: string
  inspectorPhone: string
  inspectorEmail: string
  inspectorLicense: string
  
  // Project Details
  projectType: string
  projectSize: string
  projectValue: string
  startDate: string
  completionDate: string
  buildingHeight: string
  numberOfUnits: string
  squareFootage: string
  permitNumber: string
  contractNumber: string
  scopeOfWork: string
}

export default function ProjectInformationTemplate() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  
  const [projectInfo, setProjectInfo] = useState<ProjectInfoData>({
    // Basic Info
    reference: '',
    attention: '',
    companyLogo: null,
    projectName: '',
    projectAddress: '',
    licenseNumber: '',
    companyName: '',
    digitalSignature: null,
    
    // Site Superintendent
    siteSuperintendent: '',
    superintendentPhone: '',
    superintendentEmail: '',
    
    // Consultant
    consultant: '',
    consultantCompany: '',
    consultantPhone: '',
    consultantEmail: '',
    
    // Inspector
    inspector: '',
    inspectorCompany: '',
    inspectorPhone: '',
    inspectorEmail: '',
    inspectorLicense: '',
    
    // Project Details
    projectType: '',
    projectSize: '',
    projectValue: '',
    startDate: '',
    completionDate: '',
    buildingHeight: '',
    numberOfUnits: '',
    squareFootage: '',
    permitNumber: '',
    contractNumber: '',
    scopeOfWork: ''
  })
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjectInfo()
  }, [projectId])

  const loadProjectInfo = async () => {
    try {
      setLoading(true)
      // Load project info from Supabase
      const project = await db.vbaProjects.get(projectId)
      if (project) {
        setProjectInfo(prev => ({
          ...prev,
          projectName: project.project_name,
          projectAddress: project.address,
          siteSuperintendent: project.contractor || '',
          inspector: project.inspector_name || '',
          startDate: project.start_date || '',
          completionDate: project.completion_date || ''
        }))
      }
    } catch (error) {
      console.error('Failed to load project info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    // Log activity instead of saving to localStorage
    await db.activityLogs.create(
      'updated_project_info',
      'vba_project',
      projectId,
      projectInfo
    )
    alert('Project information saved successfully!')
  }

  const handleLogoUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          setProjectInfo({ ...projectInfo, companyLogo: event.target?.result as string })
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleSignatureUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          setProjectInfo({ ...projectInfo, digitalSignature: event.target?.result as string })
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Project Information</h1>
              <p className="text-sm text-gray-600">Edit project details for inspection reports</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Information
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reference */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference
              </label>
              <textarea
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={projectInfo.reference}
                onChange={(e) => setProjectInfo({ ...projectInfo, reference: e.target.value })}
                placeholder=""
              />
            </div>

            {/* Attention */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attention
              </label>
              <textarea
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={projectInfo.attention}
                onChange={(e) => setProjectInfo({ ...projectInfo, attention: e.target.value })}
                placeholder=""
              />
            </div>

            {/* Company Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Logo
              </label>
              <div 
                onClick={handleLogoUpload}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors"
              >
                {projectInfo.companyLogo ? (
                  <img src={projectInfo.companyLogo} alt="Company Logo" className="mx-auto max-h-24" />
                ) : (
                  <>
                    <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                      <Upload className="h-4 w-4 inline mr-2" />
                      Upload Logo
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={projectInfo.projectName}
                onChange={(e) => setProjectInfo({ ...projectInfo, projectName: e.target.value })}
              />
            </div>

            {/* Project Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Address
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={projectInfo.projectAddress}
                onChange={(e) => setProjectInfo({ ...projectInfo, projectAddress: e.target.value })}
                placeholder="121"
              />
            </div>

            {/* License Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={projectInfo.licenseNumber}
                onChange={(e) => setProjectInfo({ ...projectInfo, licenseNumber: e.target.value })}
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={projectInfo.companyName}
                onChange={(e) => setProjectInfo({ ...projectInfo, companyName: e.target.value })}
              />
            </div>

            {/* Digital Signature */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Digital Signature
              </label>
              <div 
                onClick={handleSignatureUpload}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-indigo-500 transition-colors"
              >
                {projectInfo.digitalSignature ? (
                  <img src={projectInfo.digitalSignature} alt="Digital Signature" className="mx-auto max-h-24" />
                ) : (
                  <>
                    <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                      <Upload className="h-4 w-4 inline mr-2" />
                      Upload Digital Signature
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Site Superintendent Section */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <HardHat className="h-5 w-5 text-orange-600" />
              Site Superintendent Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Superintendent Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.siteSuperintendent}
                  onChange={(e) => setProjectInfo({ ...projectInfo, siteSuperintendent: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.superintendentPhone}
                  onChange={(e) => setProjectInfo({ ...projectInfo, superintendentPhone: e.target.value })}
                  placeholder="(239) 555-0100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.superintendentEmail}
                  onChange={(e) => setProjectInfo({ ...projectInfo, superintendentEmail: e.target.value })}
                  placeholder="john@construction.com"
                />
              </div>
            </div>
          </div>

          {/* Consultant Section */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Consultant Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultant Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.consultant}
                  onChange={(e) => setProjectInfo({ ...projectInfo, consultant: e.target.value })}
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.consultantCompany}
                  onChange={(e) => setProjectInfo({ ...projectInfo, consultantCompany: e.target.value })}
                  placeholder="Engineering Consultants Inc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.consultantPhone}
                  onChange={(e) => setProjectInfo({ ...projectInfo, consultantPhone: e.target.value })}
                  placeholder="(239) 555-0200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.consultantEmail}
                  onChange={(e) => setProjectInfo({ ...projectInfo, consultantEmail: e.target.value })}
                  placeholder="jane@consultants.com"
                />
              </div>
            </div>
          </div>

          {/* Inspector Section */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-green-600" />
              Inspector Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inspector Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.inspector}
                  onChange={(e) => setProjectInfo({ ...projectInfo, inspector: e.target.value })}
                  placeholder="Mike Wilson"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inspector Company
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.inspectorCompany}
                  onChange={(e) => setProjectInfo({ ...projectInfo, inspectorCompany: e.target.value })}
                  placeholder="City Building Department"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.inspectorPhone}
                  onChange={(e) => setProjectInfo({ ...projectInfo, inspectorPhone: e.target.value })}
                  placeholder="(239) 555-0300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.inspectorEmail}
                  onChange={(e) => setProjectInfo({ ...projectInfo, inspectorEmail: e.target.value })}
                  placeholder="mike@citybuilding.gov"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inspector License Number
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.inspectorLicense}
                  onChange={(e) => setProjectInfo({ ...projectInfo, inspectorLicense: e.target.value })}
                  placeholder="BN-123456"
                />
              </div>
            </div>
          </div>

          {/* Project Details Section */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              Additional Project Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Type
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.projectType}
                  onChange={(e) => setProjectInfo({ ...projectInfo, projectType: e.target.value })}
                >
                  <option value="">Select Type</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Residential">Residential</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Mixed Use">Mixed Use</option>
                  <option value="Infrastructure">Infrastructure</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Size
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.projectSize}
                  onChange={(e) => setProjectInfo({ ...projectInfo, projectSize: e.target.value })}
                  placeholder="Large, Medium, Small"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Value
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.projectValue}
                  onChange={(e) => setProjectInfo({ ...projectInfo, projectValue: e.target.value })}
                  placeholder="$5,000,000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.startDate}
                  onChange={(e) => setProjectInfo({ ...projectInfo, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Completion Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.completionDate}
                  onChange={(e) => setProjectInfo({ ...projectInfo, completionDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Building Height
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.buildingHeight}
                  onChange={(e) => setProjectInfo({ ...projectInfo, buildingHeight: e.target.value })}
                  placeholder="3 stories / 45 ft"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Units
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.numberOfUnits}
                  onChange={(e) => setProjectInfo({ ...projectInfo, numberOfUnits: e.target.value })}
                  placeholder="150 units"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Square Footage
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.squareFootage}
                  onChange={(e) => setProjectInfo({ ...projectInfo, squareFootage: e.target.value })}
                  placeholder="250,000 sq ft"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permit Number
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.permitNumber}
                  onChange={(e) => setProjectInfo({ ...projectInfo, permitNumber: e.target.value })}
                  placeholder="PRM-2024-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract Number
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.contractNumber}
                  onChange={(e) => setProjectInfo({ ...projectInfo, contractNumber: e.target.value })}
                  placeholder="CNT-2024-001"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scope of Work
                </label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectInfo.scopeOfWork}
                  onChange={(e) => setProjectInfo({ ...projectInfo, scopeOfWork: e.target.value })}
                  placeholder="Detailed description of the project scope..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}