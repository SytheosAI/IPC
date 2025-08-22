'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, FileText, FileCheck, BookOpen, Archive, Plus, Upload, 
  Download, Eye, Edit2, Save, X, Calendar, ChevronRight, Building, 
  CheckCircle, Shield, Clock, Camera, Trash2
} from 'lucide-react'
import { db } from '@/lib/supabase-client'

interface VBAProject {
  id: string
  job_number?: string
  project_name: string
  address: string
  owner?: string
  contractor?: string
  project_type?: string
  start_date?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed'
  selected_inspections?: string[]
  created_at?: string
  updated_at?: string
}

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: string
  uploadDate: string
  uploadedBy?: string
  data?: string // Base64 image data
}

interface InspectionEvent {
  id: string
  title: string
  date: Date
  type: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

export default function ProjectHub() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [project, setProject] = useState<VBAProject | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProject, setEditedProject] = useState<VBAProject | null>(null)
  const [activeView, setActiveView] = useState<'hub' | 'inspections' | 'reports' | 'templates' | 'misc' | 'photoDocumentation'>('hub')
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null)
  const [inspectionPhotos, setInspectionPhotos] = useState<Record<string, FileItem[]>>({})
  const [reports, setReports] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [inspectionEvents, setInspectionEvents] = useState<InspectionEvent[]>([])

  useEffect(() => {
    loadProjectDetails()
  }, [projectId])

  const loadProjectDetails = async () => {
    try {
      setLoading(true)
      
      // Load from Supabase
      const projects = await db.vbaProjects.getAll()
      const foundProject = projects.find((p: VBAProject) => p.id === projectId)
      if (foundProject) {
        setProject(foundProject)
        setEditedProject(foundProject)
      }

      // For now, keep photos and reports in localStorage until we add them to Supabase
      // Load inspection photos
      const savedPhotos = localStorage.getItem(`vba-inspection-photos-${projectId}`)
      if (savedPhotos) {
        setInspectionPhotos(JSON.parse(savedPhotos))
      }

      // Load reports
      const savedReports = localStorage.getItem(`vba-reports-${projectId}`)
      if (savedReports) {
        setReports(JSON.parse(savedReports))
      }

      // Load inspection events
      const savedEvents = localStorage.getItem(`vba-events-${projectId}`)
      if (savedEvents) {
        setInspectionEvents(JSON.parse(savedEvents))
      }
    } catch (error) {
      console.error('Failed to load project details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editedProject) return

    try {
      await db.vbaProjects.update(projectId, editedProject as Partial<VBAProject>)
      setProject(editedProject)
      setIsEditing(false)
      
      // Log activity
      await db.activityLogs.create(
        'updated_vba_project',
        'vba_project',
        projectId,
        { updated_fields: Object.keys(editedProject) }
      )
    } catch (error) {
      console.error('Failed to save project edits:', error)
      alert('Failed to save changes. Please try again.')
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDay = (day: number) => {
    return inspectionEvents.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentMonth.getMonth() &&
             eventDate.getFullYear() === currentMonth.getFullYear()
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Project not found</p>
        <button onClick={() => router.back()} className="mt-4 text-indigo-600 hover:text-indigo-800">
          Go back
        </button>
      </div>
    )
  }

  // Inspections View
  if (activeView === 'inspections') {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <button 
            onClick={() => selectedInspection ? setSelectedInspection(null) : setActiveView('hub')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            {selectedInspection ? 'Back to Inspections' : 'Back to Project'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Inspections
            </h2>
            <button
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.multiple = true
                input.accept = 'image/*'
                input.click()
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload File
            </button>
          </div>

          <div className="p-4">
            {selectedInspection ? (
              // Show photo upload interface for selected inspection
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">{selectedInspection}</h3>
                <p className="text-sm text-gray-500">{inspectionPhotos[selectedInspection]?.length || 0} photos uploaded</p>
                
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.capture = 'environment'
                      input.accept = 'image/*'
                      input.onchange = (e: Event) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (event) => {
                            const newPhoto: FileItem = {
                              id: Date.now().toString(),
                              name: file.name,
                              type: 'file',
                              size: `${(file.size / 1024).toFixed(1)} KB`,
                              uploadDate: new Date().toISOString(),
                              uploadedBy: 'Current User',
                              data: event.target?.result as string // Store base64 data
                            }
                            
                            const updatedPhotos = {
                              ...inspectionPhotos,
                              [selectedInspection]: [...(inspectionPhotos[selectedInspection] || []), newPhoto]
                            }
                            setInspectionPhotos(updatedPhotos)
                            localStorage.setItem(`vba-inspection-photos-${projectId}`, JSON.stringify(updatedPhotos))
                          }
                          reader.readAsDataURL(file)
                        }
                      }
                      input.click()
                    }}
                    className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                  >
                    <Camera className="h-5 w-5" />
                    Take Photo
                  </button>
                  
                  <button
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.multiple = true
                      input.accept = 'image/*'
                      input.onchange = async (e: Event) => {
                        const files = (e.target as HTMLInputElement).files
                        if (files) {
                          const newPhotos: FileItem[] = []
                          
                          // Read each file as base64
                          for (const file of Array.from(files)) {
                            const reader = new FileReader()
                            const photoData = await new Promise<string>((resolve) => {
                              reader.onload = (event) => resolve(event.target?.result as string)
                              reader.readAsDataURL(file)
                            })
                            
                            newPhotos.push({
                              id: Date.now().toString() + Math.random().toString(),
                              name: file.name,
                              type: 'file' as const,
                              size: `${(file.size / 1024).toFixed(1)} KB`,
                              uploadDate: new Date().toISOString(),
                              uploadedBy: 'Current User',
                              data: photoData // Store base64 data
                            })
                          }
                          
                          const updatedPhotos = {
                            ...inspectionPhotos,
                            [selectedInspection]: [...(inspectionPhotos[selectedInspection] || []), ...newPhotos]
                          }
                          setInspectionPhotos(updatedPhotos)
                          localStorage.setItem(`vba-inspection-photos-${projectId}`, JSON.stringify(updatedPhotos))
                        }
                      }
                      input.click()
                    }}
                    className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
                  >
                    <Upload className="h-5 w-5" />
                    Upload from Gallery
                  </button>
                </div>

                <div className="space-y-2 mt-6">
                  {(inspectionPhotos[selectedInspection] || []).length === 0 ? (
                    <p className="text-center py-8 text-gray-500">0 photos uploaded</p>
                  ) : (
                    (inspectionPhotos[selectedInspection] || []).map((photo) => (
                      <div key={photo.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Camera className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{photo.name}</p>
                            <p className="text-sm text-gray-500">{photo.size}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const updatedPhotos = {
                              ...inspectionPhotos,
                              [selectedInspection]: inspectionPhotos[selectedInspection].filter(p => p.id !== photo.id)
                            }
                            setInspectionPhotos(updatedPhotos)
                            localStorage.setItem(`vba-inspection-photos-${projectId}`, JSON.stringify(updatedPhotos))
                          }}
                          className="p-2 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              // Show list of inspections
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Select an inspection to view checklist:</h3>
                <div className="space-y-3">
                  {project.selected_inspections?.map((inspection, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedInspection(inspection)}
                      className="w-full bg-white border border-gray-200 px-4 py-4 rounded-lg text-left hover:bg-gray-50 hover:border-indigo-300 transition-all flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{inspection}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {inspectionPhotos[inspection]?.length || 0} photos uploaded
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Templates View
  if (activeView === 'templates') {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <button 
            onClick={() => setActiveView('hub')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Project
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Templates
            </h2>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => router.push(`/vba/project/${projectId}/templates/inspection-report`)}
                className="bg-white border-2 border-indigo-500 px-6 py-8 rounded-lg text-left hover:bg-indigo-50 transition-all"
              >
                <h3 className="font-medium text-gray-900 text-lg mb-2">Inspection Report</h3>
                <p className="text-sm text-gray-600">Generate inspection reports from templates</p>
              </button>
              
              <button className="bg-white border border-gray-200 px-6 py-8 rounded-lg text-left hover:bg-gray-50 hover:border-indigo-300 transition-all">
                <h3 className="font-medium text-gray-900 text-lg mb-2">Executive Summary</h3>
                <p className="text-sm text-gray-600">Create executive summary documents</p>
              </button>
              
              <button 
                onClick={() => router.push(`/vba/project/${projectId}/templates/project-information`)}
                className="bg-white border border-gray-200 px-6 py-8 rounded-lg text-left hover:bg-gray-50 hover:border-indigo-300 transition-all"
              >
                <h3 className="font-medium text-gray-900 text-lg mb-2">Project Information</h3>
                <p className="text-sm text-gray-600">Update project details and information</p>
              </button>
              
              <button 
                onClick={() => setActiveView('photoDocumentation')}
                className="bg-white border border-gray-200 px-6 py-8 rounded-lg text-left hover:bg-gray-50 hover:border-indigo-300 transition-all"
              >
                <h3 className="font-medium text-gray-900 text-lg mb-2">Photo Documentation</h3>
                <p className="text-sm text-gray-600">Organize and document project photos</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Reports View
  if (activeView === 'reports') {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <button 
            onClick={() => setActiveView('hub')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Project
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Inspection Reports
            </h2>
          </div>

          <div className="p-4">
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No reports generated yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{report.name}</p>
                        <p className="text-sm text-gray-500">
                          Generated {new Date(report.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Photo Documentation View
  if (activeView === 'photoDocumentation') {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <button 
            onClick={() => setActiveView('hub')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Project
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Photo-Documentation
            </h2>
            <button 
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.multiple = true
                input.accept = 'image/*'
                input.click()
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload File
            </button>
          </div>

          <div className="p-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">Photo Documentation by Inspection:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project?.selected_inspections?.map((inspection) => (
                <div 
                  key={inspection}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-indigo-300 cursor-pointer transition-all"
                  onClick={() => setSelectedInspection(inspection)}
                >
                  <h4 className="font-medium text-gray-900 mb-1">{inspection}</h4>
                  <p className="text-sm text-gray-500">
                    {inspectionPhotos[inspection]?.length || 0} photos
                  </p>
                </div>
              ))}
            </div>

            {project?.selected_inspections?.length === 0 && (
              <div className="text-center py-12">
                <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No inspections selected for this project</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Main Project Hub View
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => router.push('/vba')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back To VBA Home
        </button>
      </div>


      {/* Project Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total</h3>
            <Building className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{project?.selected_inspections?.length || 0}</p>
          <p className="text-xs text-gray-600 mt-1">Scheduled for project</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Done</h3>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {inspectionEvents.filter(e => e.status === 'completed').length}
          </p>
          <p className="text-xs text-gray-600 mt-1">Passed inspections</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Pending</h3>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {inspectionEvents.filter(e => e.status === 'scheduled').length}
          </p>
          <p className="text-xs text-gray-600 mt-1">Upcoming inspections</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Compliance Rate</h3>
            <Shield className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-indigo-600">
            {inspectionEvents.length > 0 
              ? Math.round((inspectionEvents.filter(e => e.status === 'completed').length / inspectionEvents.length) * 100)
              : 0}%
          </p>
          <p className="text-xs text-gray-600 mt-1">Overall compliance</p>
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Project Information</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="text-green-600 hover:text-green-800 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={() => {
                  setEditedProject(project)
                  setIsEditing(false)
                }}
                className="text-red-600 hover:text-red-800 flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.project_name}</h1>
              <p className="text-gray-600 mb-4">{project.address}</p>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="text-gray-600 font-medium">Job #:</span>
                  <span className="text-gray-900">{project.job_number || project.id}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-600 font-medium">Type:</span>
                  <span className="text-gray-900">{project.project_type || 'N/A'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-600 font-medium">Status:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="text-gray-600 font-medium">Owner:</span>
                <span className="text-gray-900">{project.owner || 'N/A'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-600 font-medium">Contractor:</span>
                <span className="text-gray-900">{project.contractor || 'N/A'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-600 font-medium">Start Date:</span>
                <span className="text-gray-900">
                  {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={editedProject?.project_name || ''}
                onChange={(e) => setEditedProject({ ...editedProject!, project_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Number</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={editedProject?.job_number || ''}
                onChange={(e) => setEditedProject({ ...editedProject!, job_number: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={editedProject?.address || ''}
                onChange={(e) => setEditedProject({ ...editedProject!, address: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={editedProject?.owner || ''}
                onChange={(e) => setEditedProject({ ...editedProject!, owner: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contractor</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={editedProject?.contractor || ''}
                onChange={(e) => setEditedProject({ ...editedProject!, contractor: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setActiveView('inspections')}
          className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg transition-all flex items-center gap-3"
        >
          <FileCheck className="h-6 w-6" />
          <span className="font-medium text-lg">Inspections</span>
        </button>
        
        <button
          onClick={() => setActiveView('reports')}
          className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-lg transition-all flex items-center gap-3"
        >
          <FileText className="h-6 w-6" />
          <span className="font-medium text-lg">Reports</span>
        </button>
        
        <button
          onClick={() => setActiveView('templates')}
          className="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-lg transition-all flex items-center gap-3"
        >
          <BookOpen className="h-6 w-6" />
          <span className="font-medium text-lg">Templates</span>
        </button>
        
        <button
          onClick={() => setActiveView('photoDocumentation')}
          className="bg-gray-500 hover:bg-gray-600 text-white p-6 rounded-lg transition-all flex items-center gap-3"
        >
          <Camera className="h-6 w-6" />
          <span className="font-medium text-lg">Photo Documentation</span>
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="h-5 w-5 text-gray-600 rotate-180" />
          </button>
          <h3 className="text-lg font-medium text-gray-900">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-900 py-2">
              {day}
            </div>
          ))}
          
          {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}
          
          {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, index) => {
            const day = index + 1
            const events = getEventsForDay(day)
            
            return (
              <div
                key={day}
                className="min-h-[80px] border border-gray-200 rounded p-2 hover:bg-gray-50 cursor-pointer"
              >
                <div className="font-medium text-sm mb-1">{day}</div>
                {events.slice(0, 2).map((event, idx) => (
                  <div
                    key={idx}
                    className={`text-xs p-1 rounded mb-1 truncate ${
                      event.status === 'completed' ? 'bg-green-100 text-green-700' :
                      event.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}