'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  User,
  FileText,
  Folder,
  FolderOpen,
  Upload,
  Download,
  Eye,
  Trash2,
  Plus,
  Bell,
  BellOff,
  CheckCircle,
  AlertCircle,
  Clock,
  ClipboardList,
  Shield,
  Users,
  UserPlus,
  Edit,
  X,
  Send,
  Filter,
  Search
} from 'lucide-react'
import { db } from '@/lib/supabase-client'

interface Project {
  id: string
  permit_number: string
  project_name: string
  address: string
  city?: string
  state?: string
  zip_code?: string
  applicant?: string
  applicant_email?: string
  applicant_phone?: string
  project_type?: string
  status: string
  submitted_date?: string
  last_updated?: string
}

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  role: string
  company?: string
  notifications: {
    field_reports: boolean
    inspection_reports: boolean
    permit_updates: boolean
  }
}

interface Document {
  id: string
  name: string
  type: string
  size: string
  uploaded_date: string
  uploaded_by: string
  folder: 'documents' | 'field_reports' | 'inspection_reports'
}

export default function ProjectHomePage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [activeFolder, setActiveFolder] = useState<'documents' | 'field_reports' | 'inspection_reports'>('documents')
  const [showAddContactModal, setShowAddContactModal] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadProjectData()
  }, [projectId])

  const loadProjectData = async () => {
    try {
      setLoading(true)
      
      // Load project details
      const projectData = await db.projects.get(projectId)
      setProject(projectData)
      
      // Load mock contacts for now
      const mockContacts: Contact[] = [
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '(239) 555-0101',
          role: 'Project Manager',
          company: 'Smith Construction',
          notifications: {
            field_reports: true,
            inspection_reports: true,
            permit_updates: true
          }
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          phone: '(239) 555-0102',
          role: 'Site Supervisor',
          company: 'Johnson Engineering',
          notifications: {
            field_reports: true,
            inspection_reports: false,
            permit_updates: false
          }
        },
        {
          id: '3',
          name: 'Mike Williams',
          email: 'mike.w@example.com',
          phone: '(239) 555-0103',
          role: 'Inspector',
          company: 'City Building Dept',
          notifications: {
            field_reports: false,
            inspection_reports: true,
            permit_updates: true
          }
        }
      ]
      setContacts(mockContacts)
      
      // Load mock documents
      const mockDocuments: Document[] = [
        {
          id: '1',
          name: 'Building Plans v2.pdf',
          type: 'PDF',
          size: '4.2 MB',
          uploaded_date: new Date().toISOString(),
          uploaded_by: 'John Smith',
          folder: 'documents'
        },
        {
          id: '2',
          name: 'Site Survey.pdf',
          type: 'PDF',
          size: '2.8 MB',
          uploaded_date: new Date().toISOString(),
          uploaded_by: 'Sarah Johnson',
          folder: 'documents'
        },
        {
          id: '3',
          name: 'Daily Report - 2024-01-15.pdf',
          type: 'PDF',
          size: '1.2 MB',
          uploaded_date: new Date().toISOString(),
          uploaded_by: 'Mike Williams',
          folder: 'field_reports'
        },
        {
          id: '4',
          name: 'Foundation Inspection.pdf',
          type: 'PDF',
          size: '3.5 MB',
          uploaded_date: new Date().toISOString(),
          uploaded_by: 'Mike Williams',
          folder: 'inspection_reports'
        }
      ]
      setDocuments(mockDocuments)
      
    } catch (error) {
      console.error('Failed to load project data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleNotification = (contactId: string, notificationType: keyof Contact['notifications']) => {
    setContacts(contacts.map(contact => {
      if (contact.id === contactId) {
        return {
          ...contact,
          notifications: {
            ...contact.notifications,
            [notificationType]: !contact.notifications[notificationType]
          }
        }
      }
      return contact
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploaded_date: new Date().toISOString(),
        uploaded_by: 'Current User',
        folder: activeFolder
      }
      setDocuments([...documents, newDoc])
    })
  }

  const filteredDocuments = documents.filter(doc => 
    doc.folder === activeFolder &&
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'intake': return 'bg-blue-100 text-blue-700'
      case 'in_review': return 'bg-yellow-100 text-yellow-700'
      case 'approved': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'issued': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getFolderIcon = (folder: string) => {
    switch (folder) {
      case 'documents': return <FileText className="h-5 w-5" />
      case 'field_reports': return <ClipboardList className="h-5 w-5" />
      case 'inspection_reports': return <Shield className="h-5 w-5" />
      default: return <Folder className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Project not found</p>
          <button
            onClick={() => router.push('/projects')}
            className="mt-4 text-sky-600 hover:text-sky-700"
          >
            Return to Projects
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/projects')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{project.project_name}</h1>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-gray-500">Permit #{project.permit_number}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-secondary">
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </button>
              <button className="btn-primary">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {project.address}
                  </p>
                  {project.city && (
                    <p className="text-sm text-gray-600">{project.city}, {project.state} {project.zip_code}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Project Type</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {project.project_type || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Applicant</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {project.applicant || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted Date</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {project.submitted_date ? new Date(project.submitted_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Folders */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Project Files</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <label className="btn-primary cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Folder Tabs */}
                <div className="flex gap-2">
                  {(['documents', 'field_reports', 'inspection_reports'] as const).map(folder => (
                    <button
                      key={folder}
                      onClick={() => setActiveFolder(folder)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        activeFolder === folder
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {getFolderIcon(folder)}
                      <span className="text-sm font-medium">
                        {folder === 'documents' && 'Documents'}
                        {folder === 'field_reports' && 'Field Reports'}
                        {folder === 'inspection_reports' && 'Inspection Reports'}
                      </span>
                      <span className="bg-white px-2 py-0.5 rounded-full text-xs">
                        {documents.filter(d => d.folder === folder).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* File List */}
              <div className="p-6">
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No files in this folder</p>
                    <p className="text-sm text-gray-400 mt-1">Upload files to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredDocuments.map(doc => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              {doc.type} • {doc.size} • Uploaded by {doc.uploaded_by}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Eye className="h-4 w-4 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Download className="h-4 w-4 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contacts & Notifications */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Project Contacts</h2>
                <button
                  onClick={() => setShowAddContactModal(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <UserPlus className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                {contacts.map(contact => (
                  <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-600">{contact.role}</p>
                        {contact.company && (
                          <p className="text-xs text-gray-500">{contact.company}</p>
                        )}
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Edit className="h-3 w-3 text-gray-500" />
                      </button>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-700 mb-2">Notifications</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={contact.notifications.field_reports}
                            onChange={() => handleToggleNotification(contact.id, 'field_reports')}
                            className="rounded text-sky-600"
                          />
                          <span className="text-xs text-gray-600">Field Reports</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={contact.notifications.inspection_reports}
                            onChange={() => handleToggleNotification(contact.id, 'inspection_reports')}
                            className="rounded text-sky-600"
                          />
                          <span className="text-xs text-gray-600">Inspection Reports</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={contact.notifications.permit_updates}
                            onChange={() => handleToggleNotification(contact.id, 'permit_updates')}
                            className="rounded text-sky-600"
                          />
                          <span className="text-xs text-gray-600">Permit Updates</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {contacts.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No contacts assigned</p>
                  <button
                    onClick={() => setShowAddContactModal(true)}
                    className="mt-3 text-sm text-sky-600 hover:text-sky-700"
                  >
                    Add first contact
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Contact</h3>
              <button
                onClick={() => setShowAddContactModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Select contacts from the directory to add to this project:</p>
              
              {/* This would be populated from the members directory */}
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-500">Contact selection will be connected to the team members directory</p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddContactModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button className="btn-primary">
                  Add Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}