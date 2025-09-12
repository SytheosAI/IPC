'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Folder, FileText, FileCheck, BookOpen, Archive, Plus, Upload, Download, Trash2, Eye, Edit2, Save, X, Calendar, ChevronLeft, ChevronRight, Clock, Building, CheckCircle, Shield, Camera, Mic, MapPin, MessageSquare, Smartphone } from 'lucide-react'

interface VBAProject {
  id: string
  projectNumber?: string
  permitNumber?: string
  projectName: string
  address: string
  owner?: string
  contractor?: string
  projectType?: string
  startDate?: string
  status: string
  selectedInspections?: string[]
}

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder' | 'inspection' | 'template'
  size?: string
  uploadDate: string
  uploadedBy?: string
}

interface InspectionEvent {
  id: string
  title: string
  date: Date
  type: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

import dynamic from 'next/dynamic'

// Lazy load mobile components for better performance
const CameraCapture = dynamic(() => import('@/app/components/vba/CameraCapture'), { ssr: false })
const LocationServices = dynamic(() => import('@/app/components/vba/LocationServices'), { ssr: false })
const VoiceDictation = dynamic(() => import('@/app/components/vba/VoiceDictation'), { ssr: false })
const DigitalSignature = dynamic(() => import('@/app/components/vba/DigitalSignature'), { ssr: false })
const InspectionChecklist = dynamic(() => import('@/app/components/vba/InspectionChecklist'), { ssr: false })
const CollaborationHub = dynamic(() => import('@/app/components/vba/CollaborationHub'), { ssr: false })
const OfflineSync = dynamic(() => import('@/app/components/vba/OfflineSync'), { ssr: false })
const MobileDashboard = dynamic(() => import('@/app/components/vba/MobileDashboard'), { ssr: false })

export default function VBAProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [project, setProject] = useState<VBAProject | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProject, setEditedProject] = useState<VBAProject | null>(null)
  const [activeFolder, setActiveFolder] = useState<'inspections' | 'reports' | 'templates' | 'miscellaneous' | 'photo-documentation' | null>(null)
  const [folderContent, setFolderContent] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [inspectionEvents, setInspectionEvents] = useState<InspectionEvent[]>([])
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null)
  const [showInspectionModal, setShowInspectionModal] = useState(false)
  const [inspectionPhotos, setInspectionPhotos] = useState<Record<string, FileItem[]>>({})
  const [showCamera, setShowCamera] = useState(false)
  const [showVoiceNotes, setShowVoiceNotes] = useState(false)
  const [showSignature, setShowSignature] = useState(false)
  const [showChecklist, setShowChecklist] = useState(false)
  const [showCollaboration, setShowCollaboration] = useState(false)
  const [activeInspectionType, setActiveInspectionType] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    loadProjectDetails()
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [projectId])

  const loadProjectDetails = async () => {
    try {
      setLoading(true)
      
      // Load from localStorage first as fallback
      const savedProjects = localStorage.getItem('vba-projects')
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const foundProject = projects.find((p: VBAProject) => p.id === projectId)
        if (foundProject) {
          setProject(foundProject)
          setEditedProject(foundProject)
        }
      }

      // Try to load from API
      try {
        const response = await fetch(`/api/vba-projects/${projectId}`)
        if (response.ok) {
          const result = await response.json()
          if (result.data) {
            // Map database fields to component fields
            // Parse selected inspections from notes if not in dedicated field
            let selectedInspections = result.data.selected_inspections || []
            
            // If no selected_inspections field, try to parse from notes
            if ((!selectedInspections || selectedInspections.length === 0) && result.data.notes) {
              const notesLines = result.data.notes.split('\n')
              const inspectionsLine = notesLines.find((line: string) => line.startsWith('Inspections:'))
              if (inspectionsLine) {
                const inspectionsStr = inspectionsLine.replace('Inspections:', '').trim()
                selectedInspections = inspectionsStr.split(',').map((i: string) => i.trim()).filter((i: string) => i.length > 0)
              }
            }
            
            const apiProject = {
              ...result.data,
              projectName: result.data.project_name,
              projectNumber: result.data.project_number,
              permitNumber: result.data.permit_number,
              projectType: result.data.project_type,
              startDate: result.data.start_date,
              selectedInspections: selectedInspections
            }
            setProject(apiProject)
            setEditedProject(apiProject)
          }
        }
      } catch (apiError) {
        console.log('API not available, using localStorage')
      }

      // Load folder content from localStorage
      const savedContent = localStorage.getItem(`vba-content-${projectId}`)
      if (savedContent) {
        setFolderContent(JSON.parse(savedContent))
      }

      // Load inspection events
      const savedEvents = localStorage.getItem(`vba-events-${projectId}`)
      if (savedEvents) {
        setInspectionEvents(JSON.parse(savedEvents))
      }

      // Load inspection photos
      const savedPhotos = localStorage.getItem(`vba-inspection-photos-${projectId}`)
      if (savedPhotos) {
        setInspectionPhotos(JSON.parse(savedPhotos))
      }
    } catch (error) {
      console.error('Failed to load project details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEdit = () => {
    if (!editedProject) return

    // Update in localStorage
    const savedProjects = localStorage.getItem('vba-projects')
    if (savedProjects) {
      const projects = JSON.parse(savedProjects)
      const updatedProjects = projects.map((p: VBAProject) =>
        p.id === projectId ? editedProject : p
      )
      localStorage.setItem('vba-projects', JSON.stringify(updatedProjects))
    }

    setProject(editedProject)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedProject(project)
    setIsEditing(false)
  }

  const handleFileUpload = () => {
    // Create a file input element
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files
      if (files && activeFolder) {
        const newFiles: FileItem[] = Array.from(files).map((file) => ({
          id: Date.now().toString() + Math.random().toString(),
          name: file.name,
          type: 'file' as const,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          uploadDate: new Date().toISOString(),
          uploadedBy: 'Current User'
        }))
        
        const updatedContent = [...folderContent, ...newFiles]
        setFolderContent(updatedContent)
        localStorage.setItem(`vba-content-${projectId}-${activeFolder}`, JSON.stringify(updatedContent))
      }
    }
    input.click()
  }

  const handleFileAction = (action: 'view' | 'download' | 'delete', file: FileItem) => {
    // Handle file actions
    if (file.type === 'inspection') {
      if (action === 'view') {
        // Open inspection checklist
        setActiveInspectionType(file.name)
        setShowChecklist(true)
        setActiveFolder(null)
      }
    } else if (file.type === 'template' && file.id?.includes('report')) {
      if (action === 'view') {
        // Navigate to report generation
        if (file.id === 'inspection-report') {
          window.open(`/vba/inspection-report/${projectId}`, '_blank')
        } else {
          alert(`Opening ${file.name}...`)
        }
      }
    } else {
      console.log(`${action} file: ${file.name}`)
    }
  }

  const loadFolderContent = (folder: string) => {
    // Load content for specific folder
    if (folder === 'inspections' && project?.selectedInspections) {
      // Don't set content here, let the folder view handle it
      setFolderContent([])
    } else if (folder === 'reports') {
      // Load report templates
      const reportItems: FileItem[] = [
        {
          id: 'inspection-report',
          name: 'Inspection Report Generator',
          type: 'template',
          size: 'PDF Generator',
          uploadDate: new Date().toISOString(),
          uploadedBy: 'System'
        },
        {
          id: 'compliance-report',
          name: 'Compliance Summary Report',
          type: 'template',
          size: 'Compliance Overview',
          uploadDate: new Date().toISOString(),
          uploadedBy: 'System'
        },
        {
          id: 'photo-report',
          name: 'Photo Documentation Report',
          type: 'template',
          size: 'Photo Gallery',
          uploadDate: new Date().toISOString(),
          uploadedBy: 'System'
        }
      ]
      setFolderContent(reportItems)
    } else if (folder === 'templates') {
      // Templates folder content
      setFolderContent([])
    } else {
      // For other folders, try localStorage
      const savedContent = localStorage.getItem(`vba-content-${projectId}-${folder}`)
      if (savedContent) {
        setFolderContent(JSON.parse(savedContent))
      } else {
        setFolderContent([])
      }
    }
    setActiveFolder(folder as any)
  }

  const getFolderIcon = (folder: string) => {
    switch (folder) {
      case 'inspections':
        return <FileCheck className="h-5 w-5" />
      case 'reports':
        return <FileText className="h-5 w-5" />
      case 'templates':
        return <BookOpen className="h-5 w-5" />
      case 'miscellaneous':
        return <Archive className="h-5 w-5" />
      default:
        return <Folder className="h-5 w-5" />
    }
  }

  const getFolderColor = (folder: string) => {
    switch (folder) {
      case 'inspections':
        return 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-400 hover:via-blue-500 hover:to-blue-600 shadow-glow'
      case 'reports':
        return 'bg-gradient-to-br from-green-500 via-green-600 to-green-700 hover:from-green-400 hover:via-green-500 hover:to-green-600 shadow-glow'
      case 'templates':
        return 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 hover:from-purple-400 hover:via-purple-500 hover:to-purple-600 shadow-glow'
      case 'miscellaneous':
        return 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 hover:from-gray-400 hover:via-gray-500 hover:to-gray-600 shadow-glow'
      default:
        return 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 hover:from-gray-400 hover:via-gray-500 hover:to-gray-600 shadow-glow'
    }
  }

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const getEventsForDay = (day: number) => {
    return inspectionEvents.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentMonth.getMonth() &&
             eventDate.getFullYear() === currentMonth.getFullYear()
    })
  }

  const handleDayClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    setSelectedDate(date)
    setShowScheduleModal(true)
  }

  const getInspectionPhotos = (inspection: string) => {
    return inspectionPhotos[inspection] || []
  }

  const handleScheduleInspection = (inspectionType: string, time: string) => {
    if (!selectedDate) return

    const scheduledDate = new Date(selectedDate)
    const [hours, minutes] = time.split(':').map(Number)
    scheduledDate.setHours(hours, minutes, 0, 0)

    const newEvent: InspectionEvent = {
      id: Date.now().toString(),
      title: inspectionType,
      date: scheduledDate,
      type: inspectionType,
      status: 'scheduled'
    }

    const updatedEvents = [...inspectionEvents, newEvent]
    setInspectionEvents(updatedEvents)
    localStorage.setItem(`vba-events-${projectId}`, JSON.stringify(updatedEvents))
    setShowScheduleModal(false)
    setSelectedDate(null)
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center h-screen">
        <div className="spinner-modern"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen p-6">
        <div className="card-modern hover-lift p-8 text-center">
          <p className="text-yellow-400 text-xl mb-6">Project not found</p>
          <button onClick={() => router.back()} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // If viewing folder content
  if (activeFolder) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
        {/* Folder Header */}
        <div className="mb-6">
          <button 
            onClick={() => setActiveFolder(null)}
            className="btn-secondary flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Project
          </button>
        </div>

        <div className="card-modern hover-lift">
          <div className="p-6 border-b border-glow flex items-center justify-between">
            <h2 className="text-xl font-bold text-yellow-400 capitalize flex items-center gap-3">
              {getFolderIcon(activeFolder)}
              {activeFolder === 'miscellaneous' ? 'Miscellaneous' : activeFolder === 'reports' ? 'Inspection Reports' : activeFolder}
            </h2>
            <button
              onClick={handleFileUpload}
              className="btn-primary flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload File
            </button>
          </div>

          <div className="p-4">
            {activeFolder === 'inspections' ? (
              <div>
                {selectedInspection ? (
                  // Show the upload interface for this specific inspection
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-yellow-400">{selectedInspection}</h3>
                          <button
                            onClick={() => setSelectedInspection(null)}
                            className="btn-glass text-sm"
                          >
                            Back to all inspections
                          </button>
                        </div>
                        
                        <div className="mb-4 space-y-3">
                          <button
                            onClick={() => {
                              setActiveInspectionType(selectedInspection)
                              setShowCamera(true)
                              setActiveFolder(null)
                            }}
                            className="w-full btn-primary flex items-center justify-center gap-2"
                          >
                            <Camera className="h-5 w-5" />
                            Take Photo for {selectedInspection}
                          </button>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => {
                                setActiveInspectionType(selectedInspection)
                                setShowChecklist(true)
                                setActiveFolder(null)
                              }}
                              className="btn-cyber flex items-center justify-center gap-2 text-sm"
                            >
                              <FileCheck className="h-4 w-4" />
                              Checklist
                            </button>
                            
                            <button
                              onClick={() => {
                                setActiveInspectionType(selectedInspection)
                                setShowSignature(true)
                                setActiveFolder(null)
                              }}
                              className="btn-glass flex items-center justify-center gap-2 text-sm"
                            >
                              <Edit2 className="h-4 w-4" />
                              Sign Off
                            </button>
                          </div>
                          
                          <button
                            onClick={() => {
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.multiple = true
                              input.accept = 'image/*'
                              input.onchange = (e: Event) => {
                                const files = (e.target as HTMLInputElement).files
                                if (files) {
                                  const newPhotos: FileItem[] = Array.from(files).map((file) => ({
                                    id: Date.now().toString() + Math.random().toString(),
                                    name: file.name,
                                    type: 'file' as const,
                                    size: `${(file.size / 1024).toFixed(1)} KB`,
                                    uploadDate: new Date().toISOString(),
                                    uploadedBy: 'Current User'
                                  }))
                                  
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
                            className="w-full btn-secondary flex items-center justify-center gap-2 text-sm"
                          >
                            <Upload className="h-4 w-4" />
                            Upload from Gallery
                          </button>
                        </div>

                        <div className="space-y-2">
                          {getInspectionPhotos(selectedInspection).length === 0 ? (
                            <div className="card-glass p-8 text-center">
                              <p className="text-yellow-400">No photos uploaded yet</p>
                            </div>
                          ) : (
                            getInspectionPhotos(selectedInspection).map((photo) => (
                              <div key={photo.id} className="card-glass hover-lift flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                  <Camera className="h-5 w-5 text-yellow-400" />
                                  <div>
                                    <p className="font-semibold text-gray-100">{photo.name}</p>
                                    <p className="text-sm text-yellow-400">{photo.size}</p>
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
                                  className="p-2 text-red-400 hover:text-red-600 hover-glow transition-all"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                ) : (
                  // Show the list of inspections
                  project?.selectedInspections && project.selectedInspections.length > 0 ? (
                      <div className="space-y-4 mb-6">
                        <h3 className="font-bold text-yellow-400 mb-3">Select an inspection to manage:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {project.selectedInspections.map((inspection, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedInspection(inspection)}
                              className="card-modern hover-lift px-6 py-4 text-left transition-all flex items-center justify-between group"
                            >
                              <div>
                                <p className="font-bold text-gray-100">{inspection}</p>
                                <p className="text-xs text-yellow-400 mt-1">
                                  {getInspectionPhotos(inspection).length} photos uploaded
                                </p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-yellow-400 group-hover:text-yellow-300" />
                            </button>
                          ))}
                        </div>
                      </div>
                  ) : (
                    <div className="card-glass p-8 text-center">
                      <p className="text-yellow-400 text-lg mb-2">No inspections selected for this project</p>
                      <p className="text-gray-300 text-sm">Please edit the project to add inspections</p>
                    </div>
                  )
                )}
              </div>
            ) : activeFolder === 'templates' ? (
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      window.location.href = `/vba/inspection-report/${projectId}`
                    }}
                    className="card-modern hover-lift px-6 py-4 text-left transition-all"
                  >
                    <div>
                      <p className="font-bold text-yellow-400">Inspection Report</p>
                      <p className="text-xs text-gray-300 mt-1">Generate PDF Report</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      alert('Executive Summary feature coming soon')
                    }}
                    className="card-glass hover-lift px-6 py-4 text-left transition-all"
                  >
                    <div>
                      <p className="font-bold text-gray-100">Executive Summary</p>
                      <p className="text-xs text-gray-300 mt-1">High-level overview</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = `/vba/project-information/${projectId}`
                    }}
                    className="card-glass hover-lift px-6 py-4 text-left transition-all"
                  >
                    <div>
                      <p className="font-bold text-gray-100">Project Information</p>
                      <p className="text-xs text-gray-300 mt-1">Detailed project data</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setActiveFolder('photo-documentation')
                    }}
                    className="card-glass hover-lift px-6 py-4 text-left transition-all"
                  >
                    <div>
                      <p className="font-bold text-gray-100">Photo Documentation</p>
                      <p className="text-xs text-gray-300 mt-1">All project photos</p>
                    </div>
                  </button>
                </div>
              </div>
            ) : activeFolder === 'photo-documentation' ? (
              <div className="space-y-4 mb-6">
                <h3 className="font-bold text-yellow-400 mb-3">Photo Documentation by Inspection:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {project?.selectedInspections?.map((inspection, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        alert(`Viewing photos for ${inspection}: ${getInspectionPhotos(inspection).length} photos`)
                      }}
                      className="card-glass hover-lift px-6 py-4 text-left transition-all"
                    >
                      <div>
                        <p className="font-bold text-gray-100">{inspection}</p>
                        <p className="text-xs text-yellow-400 mt-1">
                          {getInspectionPhotos(inspection).length} photos
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : activeFolder === 'reports' ? (
              <div className="space-y-2">
                {folderContent.map((file) => (
                  <div
                    key={file.id}
                    className="card-glass hover-lift flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-yellow-400" />
                      <div>
                        <p className="font-bold text-gray-100">{file.name}</p>
                        <p className="text-sm text-yellow-400">
                          {file.size} • Click to generate
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleFileAction('view', file)}
                        className="btn-glass p-2"
                        title="Generate Report"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {folderContent.length === 0 ? (
                  <div className="card-glass text-center py-12">
                    <p className="text-yellow-400">No items in this folder</p>
                  </div>
                ) : (
                  folderContent.map((file) => (
                    <div
                      key={file.id}
                      className="card-glass hover-lift flex items-center justify-between p-4"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-yellow-400" />
                        <div>
                          <p className="font-bold text-gray-100">{file.name}</p>
                          <p className="text-sm text-yellow-400">
                            {file.size} • Uploaded {new Date(file.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFileAction('view', file)}
                          className="btn-glass p-2"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleFileAction('download', file)}
                          className="btn-glass p-2"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleFileAction('delete', file)}
                          className="btn-glass p-2 text-red-400 hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show mobile dashboard on small screens
  if (isMobile && !activeFolder && !showCamera && !showVoiceNotes && !showSignature && !showChecklist && !showCollaboration) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
        <MobileDashboard projectId={projectId} />
        
        {/* Mobile Quick Actions */}
        <div className="fixed bottom-20 right-4 flex flex-col gap-3">
          <button
            onClick={() => setShowCamera(true)}
            className="btn-primary p-4 rounded-full shadow-glow hover-lift"
          >
            <Camera className="h-6 w-6" />
          </button>
          <button
            onClick={() => setShowVoiceNotes(true)}
            className="btn-cyber p-4 rounded-full shadow-glow hover-lift"
          >
            <Mic className="h-6 w-6" />
          </button>
          <button
            onClick={() => setShowCollaboration(true)}
            className="btn-glass p-4 rounded-full shadow-glow hover-lift"
          >
            <MessageSquare className="h-6 w-6" />
          </button>
        </div>
      </div>
    )
  }

  // Camera capture modal
  if (showCamera) {
    return (
      <CameraCapture
        onCapture={(imageData, metadata) => {
          console.log('Photo captured:', metadata)
          // Save photo to the active inspection type
          if (activeInspectionType) {
            const newPhoto: FileItem = {
              id: Date.now().toString() + Math.random().toString(),
              name: `Photo_${new Date().toISOString()}.jpg`,
              type: 'file',
              size: 'Camera capture',
              uploadDate: new Date().toISOString(),
              uploadedBy: 'Current User'
            }
            
            const updatedPhotos = {
              ...inspectionPhotos,
              [activeInspectionType]: [...(inspectionPhotos[activeInspectionType] || []), newPhoto]
            }
            setInspectionPhotos(updatedPhotos)
            localStorage.setItem(`vba-inspection-photos-${projectId}`, JSON.stringify(updatedPhotos))
          }
          setShowCamera(false)
          setActiveInspectionType(null)
        }}
        onClose={() => {
          setShowCamera(false)
          setActiveInspectionType(null)
        }}
        projectId={projectId}
      />
    )
  }

  // Voice notes modal
  if (showVoiceNotes) {
    return (
      <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
        <div className="modal-modern max-w-lg w-full">
          <div className="p-6 border-b border-glow flex items-center justify-between">
            <h3 className="text-xl font-bold text-yellow-400">Voice Notes</h3>
            <button onClick={() => setShowVoiceNotes(false)} className="btn-glass p-2">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4">
            <VoiceDictation
              onTranscription={(text, audio) => {
                console.log('Voice note:', text)
                setShowVoiceNotes(false)
              }}
              projectId={projectId}
            />
          </div>
        </div>
      </div>
    )
  }

  // Digital signature modal
  if (showSignature) {
    return (
      <DigitalSignature
        onSignature={(signatureData, metadata) => {
          console.log('Signature captured:', metadata)
          setShowSignature(false)
          setActiveInspectionType(null)
        }}
        onClose={() => {
          setShowSignature(false)
          setActiveInspectionType(null)
        }}
        projectId={projectId}
        documentName={activeInspectionType || "Inspection Report"}
      />
    )
  }

  // Collaboration hub modal
  if (showCollaboration) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50">
        <div className="sticky top-0 card-modern border-b border-glow p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-yellow-400">Team Collaboration</h3>
          <button onClick={() => setShowCollaboration(false)} className="btn-glass p-2">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 h-[calc(100vh-80px)]">
          <CollaborationHub
            projectId={projectId}
            currentUserId="current-user"
            currentUserName="Inspector"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => router.back()}
          className="btn-secondary flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back To VBA Home
        </button>
      </div>

      {/* Project Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="card-modern hover-lift p-4 shadow-glow animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-yellow-400">Total</h3>
            <Building className="h-5 w-5 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-gradient-to-r from-yellow-400 to-yellow-300">{project?.selectedInspections?.length || 0}</p>
          <p className="text-xs text-gray-300 mt-1">Scheduled for project</p>
        </div>

        <div className="card-modern hover-lift p-4 shadow-glow animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-green-400">Done</h3>
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
            {inspectionEvents.filter(e => e.status === 'completed').length}
          </p>
          <p className="text-xs text-gray-300 mt-1">Passed inspections</p>
        </div>

        <div className="card-modern hover-lift p-4 shadow-glow animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-yellow-400">Pending</h3>
            <Clock className="h-4 w-4 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
            {inspectionEvents.filter(e => e.status === 'scheduled').length}
          </p>
          <p className="text-xs text-gray-300 mt-1">Upcoming inspections</p>
        </div>

        <div className="card-modern hover-lift p-4 shadow-glow animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-purple-400">Compliance Rate</h3>
            <Shield className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
            {inspectionEvents.length > 0 
              ? Math.round((inspectionEvents.filter(e => e.status === 'completed').length / inspectionEvents.length) * 100)
              : 0}%
          </p>
          <p className="text-xs text-gray-300 mt-1">Overall compliance</p>
        </div>
      </div>


      {/* Project Info Header with Edit */}
      <div className="card-modern hover-lift p-6 mb-6 shadow-glow">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-yellow-400">Project Information</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-glass flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="btn-cyber flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="btn-glass flex items-center gap-2 text-red-400"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h1 className="text-3xl font-bold text-yellow-400 mb-2">{project.projectName}</h1>
              <p className="text-gray-300">{project.address}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">Project #:</span>
                <span className="text-gray-100">{project.projectNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">Type:</span>
                <span className="text-gray-100">{project.projectType}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">Status:</span>
                <span className="badge-modern text-sm">Active</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">Owner:</span>
                <span className="text-gray-100">{project.owner}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">Contractor:</span>
                <span className="text-gray-100">{project.contractor}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">Start Date:</span>
                <span className="text-gray-100">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-yellow-400 mb-1">Project Name</label>
              <input
                type="text"
                className="input-modern"
                value={editedProject?.projectName || ''}
                onChange={(e) => setEditedProject({ ...editedProject!, projectName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-yellow-400 mb-1">Project Number</label>
              <input
                type="text"
                className="input-modern"
                value={editedProject?.projectNumber || ''}
                onChange={(e) => setEditedProject({ ...editedProject!, projectNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-yellow-400 mb-1">Permit Number</label>
              <input
                type="text"
                className="input-modern"
                value={editedProject?.permitNumber || ''}
                onChange={(e) => setEditedProject({ ...editedProject!, permitNumber: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-yellow-400 mb-1">Address</label>
              <input
                type="text"
                className="input-modern"
                value={editedProject?.address || ''}
                onChange={(e) => setEditedProject({ ...editedProject!, address: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-yellow-400 mb-1">Owner</label>
              <input
                type="text"
                className="input-modern"
                value={editedProject?.owner || ''}
                onChange={(e) => setEditedProject({ ...editedProject!, owner: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-yellow-400 mb-1">Contractor</label>
              <input
                type="text"
                className="input-modern"
                value={editedProject?.contractor || ''}
                onChange={(e) => setEditedProject({ ...editedProject!, contractor: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Feature Buttons */}
      <div className="md:hidden grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={() => setShowCamera(true)}
          className="btn-primary p-4 rounded-2xl flex flex-col items-center gap-1 hover-lift"
        >
          <Camera className="h-5 w-5" />
          <span className="text-xs font-bold">Photo</span>
        </button>
        <button
          onClick={() => setShowVoiceNotes(true)}
          className="btn-cyber p-4 rounded-2xl flex flex-col items-center gap-1 hover-lift"
        >
          <Mic className="h-5 w-5" />
          <span className="text-xs font-bold">Voice</span>
        </button>
        <button
          onClick={() => setShowCollaboration(true)}
          className="btn-glass p-4 rounded-2xl flex flex-col items-center gap-1 hover-lift"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs font-bold">Team</span>
        </button>
      </div>

      {/* Folder Structure */}
      <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
        {(['inspections', 'reports', 'templates', 'miscellaneous'] as const).map((folder) => (
          <button
            key={folder}
            onClick={() => loadFolderContent(folder)}
            className={`p-4 md:p-6 rounded-2xl text-white transition-all duration-300 hover-lift flex flex-col md:flex-row items-center gap-2 md:gap-3 ${getFolderColor(folder)} text-center md:text-left border border-transparent hover:border-yellow-400/30`}
          >
            {getFolderIcon(folder)}
            <span className="font-medium capitalize text-sm md:text-base">
              {folder === 'miscellaneous' ? 'Misc' : folder === 'reports' ? 'Reports' : folder}
            </span>
          </button>
        ))}
      </div>

      {/* Calendar for Scheduling Inspections */}
      <div className="card-modern hover-lift p-6 md:p-8 overflow-x-auto shadow-glow">
        
        <div className="flex items-center justify-between mb-4">
          <button onClick={previousMonth} className="btn-glass p-3">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="text-2xl font-bold text-yellow-400">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={nextMonth} className="btn-glass p-3">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 md:gap-1 min-w-[300px]">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} className="text-center text-xs md:text-sm font-bold text-yellow-400 py-2">
              <span className="md:hidden">{day}</span>
              <span className="hidden md:inline">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}</span>
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
                className="min-h-[60px] md:min-h-[80px] card-glass hover-lift rounded-lg p-2 md:p-3 hover:border-yellow-400/50 transition-all cursor-pointer"
                onClick={() => handleDayClick(day)}
              >
                <div className="font-bold text-xs md:text-sm mb-0.5 md:mb-1 text-yellow-400">{day}</div>
                {events.slice(0, 2).map((event, idx) => (
                  <div
                    key={idx}
                    className={`text-xs p-1 rounded mb-1 truncate font-semibold ${
                      event.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      event.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {event.title}
                  </div>
                ))}
                {events.length > 2 && (
                  <div className="text-xs text-yellow-400 font-semibold">+{events.length - 2} more</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Scheduling Modal */}
      {showScheduleModal && selectedDate && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
          <div className="modal-modern max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-yellow-400 mb-6">
              Schedule Inspection for {selectedDate.toLocaleDateString()}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-yellow-400 mb-2">
                  Select Inspection Type
                </label>
                <select
                  id="inspection-type"
                  className="input-modern"
                >
                  <option value="">Choose an inspection type</option>
                  {project?.selectedInspections?.map((inspection) => (
                    <option key={inspection} value={inspection}>
                      {inspection}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-yellow-400 mb-2">
                  Select Time
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-400" />
                  <input
                    type="time"
                    id="inspection-time"
                    className="flex-1 input-modern"
                    defaultValue="09:00"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowScheduleModal(false)
                    setSelectedDate(null)
                  }}
                  className="btn-glass"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const typeSelect = document.getElementById('inspection-type') as HTMLSelectElement
                    const timeInput = document.getElementById('inspection-time') as HTMLInputElement
                    if (typeSelect.value && timeInput.value) {
                      handleScheduleInspection(typeSelect.value, timeInput.value)
                    }
                  }}
                  className="btn-primary"
                >
                  Schedule Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Checklist Modal */}
      {showChecklist && activeInspectionType && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50 overflow-y-auto">
          <div className="sticky top-0 card-modern border-b border-glow p-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-yellow-400">{activeInspectionType} Checklist</h3>
            <button 
              onClick={() => {
                setShowChecklist(false)
                setActiveInspectionType(null)
              }} 
              className="btn-glass p-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4">
            <InspectionChecklist
              inspectionType={activeInspectionType}
              projectId={projectId}
              onComplete={(items, timeSpent) => {
                console.log('Checklist completed:', items, 'Time:', timeSpent)
                // Mark the inspection as completed
                const updatedEvents = inspectionEvents.map(event => {
                  if (event.type === activeInspectionType && event.status === 'scheduled') {
                    return { ...event, status: 'completed' as const }
                  }
                  return event
                })
                setInspectionEvents(updatedEvents)
                localStorage.setItem(`vba-events-${projectId}`, JSON.stringify(updatedEvents))
                
                setShowChecklist(false)
                setActiveInspectionType(null)
              }}
            />
          </div>
        </div>
      )}

    </div>
  )
}