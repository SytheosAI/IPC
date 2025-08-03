'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Folder, FileText, FileCheck, BookOpen, Archive, Plus, Upload, Download, Trash2, Eye, Edit2, Save, X, Calendar, ChevronLeft, ChevronRight, Clock, Building, CheckCircle, Shield, Camera, Mic, MapPin, MessageSquare, Smartphone } from 'lucide-react'

interface VBAProject {
  id: string
  jobNumber?: string
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
  type: 'file' | 'folder'
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
      
      // Load from localStorage
      const savedProjects = localStorage.getItem('vba-projects')
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const foundProject = projects.find((p: VBAProject) => p.id === projectId)
        if (foundProject) {
          setProject(foundProject)
          setEditedProject(foundProject)
        }
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
    console.log(`${action} file: ${file.name}`)
  }

  const loadFolderContent = (folder: string) => {
    // Load content for specific folder
    const savedContent = localStorage.getItem(`vba-content-${projectId}-${folder}`)
    if (savedContent) {
      setFolderContent(JSON.parse(savedContent))
    } else {
      setFolderContent([])
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
        return 'bg-blue-500 hover:bg-blue-600'
      case 'reports':
        return 'bg-green-500 hover:bg-green-600'
      case 'templates':
        return 'bg-purple-500 hover:bg-purple-600'
      case 'miscellaneous':
        return 'bg-gray-500 hover:bg-gray-600'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
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

  // If viewing folder content
  if (activeFolder) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Folder Header */}
        <div className="mb-6">
          <button 
            onClick={() => setActiveFolder(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Project
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border-2 border-slate-800">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 capitalize flex items-center gap-2">
              {getFolderIcon(activeFolder)}
              {activeFolder === 'miscellaneous' ? 'Miscellaneous' : activeFolder === 'reports' ? 'Inspection Reports' : activeFolder}
            </h2>
            <button
              onClick={handleFileUpload}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
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
                          <h3 className="text-lg font-semibold text-gray-900">{selectedInspection}</h3>
                          <button
                            onClick={() => setSelectedInspection(null)}
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            Back to all inspections
                          </button>
                        </div>
                        
                        <div className="mb-4 space-y-3">
                          <button
                            onClick={() => {
                              setActiveInspectionType(selectedInspection)
                              setShowCamera(true)
                            }}
                            className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                          >
                            <Camera className="h-5 w-5" />
                            Take Photo for {selectedInspection}
                          </button>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => {
                                setActiveInspectionType(selectedInspection)
                                setShowChecklist(true)
                              }}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm"
                            >
                              <FileCheck className="h-4 w-4" />
                              Checklist
                            </button>
                            
                            <button
                              onClick={() => {
                                setActiveInspectionType(selectedInspection)
                                setShowSignature(true)
                              }}
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 text-sm"
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
                            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2 text-sm"
                          >
                            <Upload className="h-4 w-4" />
                            Upload from Gallery
                          </button>
                        </div>

                        <div className="space-y-2">
                          {getInspectionPhotos(selectedInspection).length === 0 ? (
                            <p className="text-center py-8 text-gray-500">No photos uploaded yet</p>
                          ) : (
                            getInspectionPhotos(selectedInspection).map((photo) => (
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
                  // Show the list of inspections
                  project?.selectedInspections ? (
                      <div className="space-y-4 mb-6">
                        <h3 className="font-medium text-gray-900 mb-3">Select an inspection to view checklist:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {project.selectedInspections.map((inspection, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setActiveInspectionType(inspection)
                                setShowChecklist(true)
                                setActiveFolder(null)
                              }}
                              className="bg-white border border-gray-200 px-4 py-3 rounded-lg text-left hover:bg-gray-50 hover:border-indigo-300 transition-all flex items-center justify-between group"
                            >
                              <div>
                                <p className="font-medium text-gray-900">{inspection}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {getInspectionPhotos(inspection).length} photos uploaded
                                </p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                            </button>
                          ))}
                        </div>
                      </div>
                  ) : null
                )}
              </div>
            ) : null}

            {activeFolder === 'templates' ? (
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      window.location.href = `/vba/inspection-report/${projectId}`
                    }}
                    className="bg-white border-2 border-indigo-500 px-4 py-3 rounded-lg text-left hover:bg-indigo-50 transition-all"
                  >
                    <div>
                      <p className="font-medium text-gray-900">Inspection Report</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      alert('Executive Summary feature coming soon')
                    }}
                    className="bg-white border border-gray-200 px-4 py-3 rounded-lg text-left hover:bg-gray-50 hover:border-indigo-300 transition-all"
                  >
                    <div>
                      <p className="font-medium text-gray-900">Executive Summary</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = `/vba/project-information/${projectId}`
                    }}
                    className="bg-white border border-gray-200 px-4 py-3 rounded-lg text-left hover:bg-gray-50 hover:border-indigo-300 transition-all"
                  >
                    <div>
                      <p className="font-medium text-gray-900">Project Information</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setActiveFolder('photo-documentation')
                    }}
                    className="bg-white border border-gray-200 px-4 py-3 rounded-lg text-left hover:bg-gray-50 hover:border-indigo-300 transition-all"
                  >
                    <div>
                      <p className="font-medium text-gray-900">Photo Documentation</p>
                    </div>
                  </button>
                </div>
              </div>
            ) : null}

            {activeFolder === 'photo-documentation' ? (
              <div className="space-y-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Photo Documentation by Inspection:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {project?.selectedInspections?.map((inspection, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        alert(`Viewing photos for ${inspection}: ${getInspectionPhotos(inspection).length} photos`)
                      }}
                      className="bg-white border border-gray-200 px-4 py-3 rounded-lg text-left hover:bg-gray-50 hover:border-indigo-300 transition-all"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{inspection}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {getInspectionPhotos(inspection).length} photos
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {folderContent.length === 0 ? (
              <div className="text-center py-12">
                {/* Empty folder - no icon */}
              </div>
            ) : (
              <div className="space-y-2">
                {folderContent.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {file.size} • Uploaded {new Date(file.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleFileAction('view', file)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleFileAction('download', file)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleFileAction('delete', file)}
                        className="p-2 text-red-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
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

  // Show mobile dashboard on small screens
  if (isMobile && !activeFolder && !showCamera && !showVoiceNotes && !showSignature && !showChecklist && !showCollaboration) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <MobileDashboard projectId={projectId} />
        
        {/* Mobile Quick Actions */}
        <div className="fixed bottom-20 right-4 flex flex-col gap-3">
          <button
            onClick={() => setShowCamera(true)}
            className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
          >
            <Camera className="h-6 w-6" />
          </button>
          <button
            onClick={() => setShowVoiceNotes(true)}
            className="p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700"
          >
            <Mic className="h-6 w-6" />
          </button>
          <button
            onClick={() => setShowCollaboration(true)}
            className="p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700"
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
          setShowCamera(false)
        }}
        onClose={() => setShowCamera(false)}
        projectId={projectId}
      />
    )
  }

  // Voice notes modal
  if (showVoiceNotes) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-lg w-full">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Voice Notes</h3>
            <button onClick={() => setShowVoiceNotes(false)} className="text-gray-400 hover:text-gray-600">
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
        }}
        onClose={() => setShowSignature(false)}
        projectId={projectId}
        documentName="Inspection Report"
      />
    )
  }

  // Don't use early returns for modals - render them as overlays instead

  // Collaboration hub modal
  if (showCollaboration) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Team Collaboration</h3>
          <button onClick={() => setShowCollaboration(false)} className="text-gray-400 hover:text-gray-600">
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back To VBA Home
        </button>
      </div>

      {/* Project Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <h3 className="text-xs md:text-sm font-medium text-gray-600">Total</h3>
            <Building className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{project?.selectedInspections?.length || 0}</p>
          <p className="text-xs text-gray-600 mt-0.5 md:mt-1 hidden md:block">Scheduled for project</p>
        </div>

        <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <h3 className="text-xs md:text-sm font-medium text-gray-600">Done</h3>
            <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-green-600">
            {inspectionEvents.filter(e => e.status === 'completed').length}
          </p>
          <p className="text-xs text-gray-600 mt-0.5 md:mt-1 hidden md:block">Passed inspections</p>
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


      {/* Project Info Header with Edit */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-slate-800 p-6 mb-6">
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
                onClick={handleCancelEdit}
                className="text-red-600 hover:text-red-800 flex items-center gap-2"
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.projectName}</h1>
              <p className="text-gray-600">{project.address}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Job #:</span>
                <span className="text-gray-900">{project.jobNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Type:</span>
                <span className="text-gray-900">{project.projectType}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Status:</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Owner:</span>
                <span className="text-gray-900">{project.owner}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Contractor:</span>
                <span className="text-gray-900">{project.contractor}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Start Date:</span>
                <span className="text-gray-900">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={editedProject?.projectName || ''}
                onChange={(e) => setEditedProject({ ...editedProject!, projectName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Number</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={editedProject?.jobNumber || ''}
                onChange={(e) => setEditedProject({ ...editedProject!, jobNumber: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={editedProject?.address || ''}
                onChange={(e) => setEditedProject({ ...editedProject!, address: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={editedProject?.owner || ''}
                onChange={(e) => setEditedProject({ ...editedProject!, owner: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contractor</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
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
          className="bg-blue-600 text-white p-3 rounded-lg flex flex-col items-center gap-1"
        >
          <Camera className="h-5 w-5" />
          <span className="text-xs">Photo</span>
        </button>
        <button
          onClick={() => setShowVoiceNotes(true)}
          className="bg-green-600 text-white p-3 rounded-lg flex flex-col items-center gap-1"
        >
          <Mic className="h-5 w-5" />
          <span className="text-xs">Voice</span>
        </button>
        <button
          onClick={() => setShowCollaboration(true)}
          className="bg-purple-600 text-white p-3 rounded-lg flex flex-col items-center gap-1"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs">Team</span>
        </button>
      </div>

      {/* Folder Structure */}
      <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
        {(['inspections', 'reports', 'templates', 'miscellaneous'] as const).map((folder) => (
          <button
            key={folder}
            onClick={() => loadFolderContent(folder)}
            className={`p-3 md:p-4 rounded-lg text-white transition-all flex flex-col md:flex-row items-center gap-2 md:gap-3 ${getFolderColor(folder)} text-center md:text-left`}
          >
            {getFolderIcon(folder)}
            <span className="font-medium capitalize text-sm md:text-base">
              {folder === 'miscellaneous' ? 'Misc' : folder === 'reports' ? 'Reports' : folder}
            </span>
          </button>
        ))}
      </div>

      {/* Calendar for Scheduling Inspections */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-slate-800 p-3 md:p-6 overflow-x-auto">
        
        <div className="flex items-center justify-between mb-4">
          <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded text-gray-700">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-medium text-gray-900">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded text-gray-700">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 md:gap-1 min-w-[300px]">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} className="text-center text-xs md:text-sm font-medium text-gray-900 py-1 md:py-2">
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
                className="min-h-[60px] md:min-h-[80px] border border-gray-200 rounded p-1 md:p-2 hover:bg-gray-50 hover:border-indigo-300 transition-colors cursor-pointer"
                onClick={() => handleDayClick(day)}
              >
                <div className="font-medium text-xs md:text-sm mb-0.5 md:mb-1 text-gray-900">{day}</div>
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
                {events.length > 2 && (
                  <div className="text-xs text-gray-500">+{events.length - 2} more</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Scheduling Modal */}
      {showScheduleModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Schedule Inspection for {selectedDate.toLocaleDateString()}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Inspection Type
                </label>
                <select
                  id="inspection-type"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <input
                    type="time"
                    id="inspection-time"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500"
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
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
        <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{activeInspectionType} Checklist</h3>
            <button 
              onClick={() => {
                setShowChecklist(false)
                setActiveInspectionType(null)
              }} 
              className="text-gray-400 hover:text-gray-600"
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