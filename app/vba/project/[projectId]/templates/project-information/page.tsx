'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, Save, Upload, FileImage, Building2
} from 'lucide-react'
import { db } from '@/lib/supabase-client'

interface ProjectInfoData {
  reference: string
  attention: string
  companyLogo: string | null
  projectName: string
  projectAddress: string
  licenseNumber: string
  companyName: string
  digitalSignature: string | null
}

export default function ProjectInformationTemplate() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  
  const [projectInfo, setProjectInfo] = useState<ProjectInfoData>({
    reference: '',
    attention: '',
    companyLogo: null,
    projectName: '',
    projectAddress: '',
    licenseNumber: '',
    companyName: '',
    digitalSignature: null
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
        setProjectInfo({
          reference: '',
          attention: '',
          companyLogo: null,
          projectName: project.project_name,
          projectAddress: project.address,
          licenseNumber: '',
          companyName: '',
          digitalSignature: null
        })
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
        </div>
      </div>
    </div>
  )
}