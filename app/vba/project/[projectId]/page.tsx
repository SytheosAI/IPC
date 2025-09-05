'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, FileText, FileCheck, BookOpen, Archive, Plus, Upload, 
  Download, Eye, Edit2, Save, X, Calendar, ChevronRight, Building, 
  CheckCircle, Shield, Clock, Camera, Trash2, Phone, Mail, MapPin,
  User, Users, Briefcase, Home, DollarSign, FileSearch, AlertCircle,
  ClipboardList, HardHat, UserCheck, Building2, CreditCard
} from 'lucide-react'
import { db, supabase } from '@/lib/supabase-client'

interface VBAProject {
  id: string
  job_number?: string
  project_name: string
  address: string
  city?: string
  state?: string
  zip_code?: string
  
  // Owner Information
  owner?: string
  owner_company?: string
  owner_phone?: string
  owner_email?: string
  owner_address?: string
  
  // Contractor Information
  contractor?: string
  contractor_company?: string
  contractor_license?: string
  contractor_phone?: string
  contractor_email?: string
  contractor_address?: string
  
  // Inspector Information
  inspector?: string
  inspector_license?: string
  inspector_phone?: string
  inspector_email?: string
  inspector_company?: string
  
  // Consultant Information
  consultant?: string
  consultant_company?: string
  consultant_phone?: string
  consultant_email?: string
  consultant_specialty?: string
  
  // Architect/Engineer Information
  architect?: string
  architect_firm?: string
  architect_license?: string
  architect_phone?: string
  architect_email?: string
  
  engineer?: string
  engineer_firm?: string
  engineer_license?: string
  engineer_phone?: string
  engineer_email?: string
  
  // Project Details
  project_type?: string
  building_type?: string
  construction_type?: string
  occupancy_type?: string
  square_footage?: number
  number_of_stories?: number
  number_of_units?: number
  
  // Permit Information
  permit_number?: string
  permit_type?: string
  permit_issued_date?: string
  permit_expiration_date?: string
  
  // Financial Information
  project_value?: number
  permit_fee?: number
  inspection_fee?: number
  total_fees?: number
  payment_status?: string
  
  // Schedule Information
  start_date?: string
  estimated_completion?: string
  actual_completion?: string
  
  // Status and Compliance
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'passed'
  compliance_status?: 'compliant' | 'non_compliant' | 'pending'
  compliance_notes?: string
  
  // Additional Information
  special_instructions?: string
  site_conditions?: string
  access_notes?: string
  safety_requirements?: string
  
  selected_inspections?: string[]
  created_at?: string
  updated_at?: string
}

interface ContactSection {
  title: string
  icon: React.ReactNode
  fields: Array<{
    label: string
    key: keyof VBAProject
    type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea'
    placeholder?: string
  }>
}

export default function EnhancedProjectHub() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [project, setProject] = useState<VBAProject | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProject, setEditedProject] = useState<VBAProject | null>(null)
  const [activeView, setActiveView] = useState<'hub' | 'inspections' | 'reports' | 'templates' | 'contacts'>('hub')
  const [activeContactTab, setActiveContactTab] = useState('owner')
  const [loading, setLoading] = useState(true)

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

  const contactSections: ContactSection[] = [
    {
      title: 'Owner Information',
      icon: <Home className="h-5 w-5" />,
      fields: [
        { label: 'Owner Name', key: 'owner' },
        { label: 'Company', key: 'owner_company' },
        { label: 'Phone', key: 'owner_phone', type: 'tel' },
        { label: 'Email', key: 'owner_email', type: 'email' },
        { label: 'Address', key: 'owner_address' }
      ]
    },
    {
      title: 'Contractor Information',
      icon: <HardHat className="h-5 w-5" />,
      fields: [
        { label: 'Contractor Name', key: 'contractor' },
        { label: 'Company', key: 'contractor_company' },
        { label: 'License #', key: 'contractor_license' },
        { label: 'Phone', key: 'contractor_phone', type: 'tel' },
        { label: 'Email', key: 'contractor_email', type: 'email' },
        { label: 'Address', key: 'contractor_address' }
      ]
    },
    {
      title: 'Inspector Information',
      icon: <UserCheck className="h-5 w-5" />,
      fields: [
        { label: 'Inspector Name', key: 'inspector' },
        { label: 'License #', key: 'inspector_license' },
        { label: 'Company', key: 'inspector_company' },
        { label: 'Phone', key: 'inspector_phone', type: 'tel' },
        { label: 'Email', key: 'inspector_email', type: 'email' }
      ]
    },
    {
      title: 'Consultant Information',
      icon: <Users className="h-5 w-5" />,
      fields: [
        { label: 'Consultant Name', key: 'consultant' },
        { label: 'Company', key: 'consultant_company' },
        { label: 'Specialty', key: 'consultant_specialty' },
        { label: 'Phone', key: 'consultant_phone', type: 'tel' },
        { label: 'Email', key: 'consultant_email', type: 'email' }
      ]
    },
    {
      title: 'Architect Information',
      icon: <Building2 className="h-5 w-5" />,
      fields: [
        { label: 'Architect Name', key: 'architect' },
        { label: 'Firm', key: 'architect_firm' },
        { label: 'License #', key: 'architect_license' },
        { label: 'Phone', key: 'architect_phone', type: 'tel' },
        { label: 'Email', key: 'architect_email', type: 'email' }
      ]
    },
    {
      title: 'Engineer Information',
      icon: <Briefcase className="h-5 w-5" />,
      fields: [
        { label: 'Engineer Name', key: 'engineer' },
        { label: 'Firm', key: 'engineer_firm' },
        { label: 'License #', key: 'engineer_license' },
        { label: 'Phone', key: 'engineer_phone', type: 'tel' },
        { label: 'Email', key: 'engineer_email', type: 'email' }
      ]
    }
  ]

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

  // Contacts View
  if (activeView === 'contacts') {
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
              <Users className="h-5 w-5" />
              Project Contacts & Information
            </h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit All
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="text-green-600 hover:text-green-800 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save All
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

          <div className="flex border-b border-gray-200">
            {contactSections.map((section, index) => (
              <button
                key={index}
                onClick={() => setActiveContactTab(section.title.toLowerCase().split(' ')[0])}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeContactTab === section.title.toLowerCase().split(' ')[0]
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span className="hidden md:inline">{section.title.split(' ')[0]}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="p-6">
            {contactSections.map((section) => {
              if (activeContactTab !== section.title.toLowerCase().split(' ')[0]) return null
              
              return (
                <div key={section.title} className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    {section.icon}
                    {section.title}
                  </h3>
                  
                  {!isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.fields.map((field) => (
                        <div key={field.key}>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            {field.label}
                          </label>
                          <p className="text-gray-900">
                            {project[field.key] || 'Not specified'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.fields.map((field) => (
                        <div key={field.key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                          </label>
                          <input
                            type={field.type || 'text'}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            value={editedProject?.[field.key] || ''}
                            onChange={(e) => setEditedProject({ 
                              ...editedProject!, 
                              [field.key]: e.target.value 
                            })}
                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Main Project Hub View (Enhanced)
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

      {/* Enhanced Project Info with More Fields */}
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
          <div>
            {/* Project Header */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.project_name}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {project.address}, {project.city}, {project.state} {project.zip_code}
                </span>
                <span className="flex items-center gap-1">
                  <ClipboardList className="h-4 w-4" />
                  Job #{project.job_number || project.id}
                </span>
              </div>
            </div>

            {/* Key Contacts Quick View */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Inspector
                </h4>
                <p className="font-medium text-gray-900">{project.inspector || 'Not assigned'}</p>
                {project.inspector_phone && (
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    {project.inspector_phone}
                  </p>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <HardHat className="h-4 w-4" />
                  Contractor
                </h4>
                <p className="font-medium text-gray-900">{project.contractor || 'Not specified'}</p>
                {project.contractor_phone && (
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    {project.contractor_phone}
                  </p>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Consultant
                </h4>
                <p className="font-medium text-gray-900">{project.consultant || 'Not specified'}</p>
                {project.consultant_phone && (
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    {project.consultant_phone}
                  </p>
                )}
              </div>
            </div>

            {/* Project Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">Project Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="text-gray-900">{project.project_type || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Building Type:</span>
                    <span className="text-gray-900">{project.building_type || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Square Footage:</span>
                    <span className="text-gray-900">{project.square_footage ? `${project.square_footage.toLocaleString()} sq ft` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stories:</span>
                    <span className="text-gray-900">{project.number_of_stories || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">Permit Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Permit #:</span>
                    <span className="text-gray-900">{project.permit_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="text-gray-900">{project.permit_type || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Issued:</span>
                    <span className="text-gray-900">
                      {project.permit_issued_date ? new Date(project.permit_issued_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires:</span>
                    <span className="text-gray-900">
                      {project.permit_expiration_date ? new Date(project.permit_expiration_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">Financial</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Project Value:</span>
                    <span className="text-gray-900">
                      {project.project_value ? `$${project.project_value.toLocaleString()}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Permit Fee:</span>
                    <span className="text-gray-900">
                      {project.permit_fee ? `$${project.permit_fee.toLocaleString()}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Fees:</span>
                    <span className="text-gray-900">
                      {project.total_fees ? `$${project.total_fees.toLocaleString()}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment:</span>
                    <span className={`font-medium ${
                      project.payment_status === 'paid' ? 'text-green-600' : 
                      project.payment_status === 'pending' ? 'text-yellow-600' : 'text-gray-900'
                    }`}>
                      {project.payment_status || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {(project.special_instructions || project.access_notes || project.safety_requirements) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-600 mb-3">Special Notes</h4>
                {project.special_instructions && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">Special Instructions:</p>
                    <p className="text-gray-900">{project.special_instructions}</p>
                  </div>
                )}
                {project.access_notes && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">Access Notes:</p>
                    <p className="text-gray-900">{project.access_notes}</p>
                  </div>
                )}
                {project.safety_requirements && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">Safety Requirements:</p>
                    <p className="text-gray-900">{project.safety_requirements}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Edit Mode - Comprehensive Form
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={editedProject?.city || ''}
                    onChange={(e) => setEditedProject({ ...editedProject!, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={editedProject?.state || ''}
                    onChange={(e) => setEditedProject({ ...editedProject!, state: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={editedProject?.zip_code || ''}
                    onChange={(e) => setEditedProject({ ...editedProject!, zip_code: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Quick Contact Fields */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Key Contacts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inspector Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={editedProject?.inspector || ''}
                    onChange={(e) => setEditedProject({ ...editedProject!, inspector: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inspector Phone</label>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={editedProject?.inspector_phone || ''}
                    onChange={(e) => setEditedProject({ ...editedProject!, inspector_phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consultant Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={editedProject?.consultant || ''}
                    onChange={(e) => setEditedProject({ ...editedProject!, consultant: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consultant Phone</label>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={editedProject?.consultant_phone || ''}
                    onChange={(e) => setEditedProject({ ...editedProject!, consultant_phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Note about more fields */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                For complete contact information and additional project details, click the &quot;View All Contacts&quot; button below.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setActiveView('contacts')}
          className="bg-indigo-500 hover:bg-indigo-600 text-white p-6 rounded-lg transition-all flex items-center gap-3"
        >
          <Users className="h-6 w-6" />
          <span className="font-medium text-lg">View All Contacts</span>
        </button>
        
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
          className="bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-lg transition-all flex items-center gap-3"
        >
          <Camera className="h-6 w-6" />
          <span className="font-medium text-lg">Photos</span>
        </button>
        
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white p-6 rounded-lg transition-all flex items-center gap-3"
        >
          <Archive className="h-6 w-6" />
          <span className="font-medium text-lg">Documents</span>
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Project Status</h3>
            <Building className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 capitalize">{project.status}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Compliance</h3>
            <Shield className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{project.compliance_status || 'Pending'}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Inspections</h3>
            <ClipboardList className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{project.selected_inspections?.length || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Completion</h3>
            <Calendar className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-lg font-bold text-purple-600">
            {project.estimated_completion ? new Date(project.estimated_completion).toLocaleDateString() : 'TBD'}
          </p>
        </div>
      </div>
    </div>
  )
}