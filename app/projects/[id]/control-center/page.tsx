'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageTitle from '@/components/PageTitle'
import { 
  ArrowLeft, 
  FileText, 
  Users, 
  FolderOpen, 
  ClipboardCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  Building,
  MapPin,
  Phone,
  Mail,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Activity,
  BarChart3,
  PieChart,
  FileCheck,
  HardHat,
  Wrench,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/supabase-client'

interface Project {
  id: string
  permit_number: string
  project_name: string
  address: string
  city: string
  applicant: string
  applicant_email?: string
  applicant_phone?: string
  project_type: string
  status: string
  submitted_date: string
  approved_date?: string
}

interface FolderItem {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: string
  modified: string
  icon?: any
}

export default function ProjectControlCenter() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [folderContents, setFolderContents] = useState<FolderItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadProjectData()
  }, [projectId])

  const loadProjectData = async () => {
    try {
      const projectData = await db.projects.get(projectId)
      setProject(projectData)
    } catch (error) {
      console.error('Failed to load project:', error)
      // Use mock data for now
      setProject({
        id: projectId,
        permit_number: 'PRM-2024-001',
        project_name: 'Sample Project',
        address: '123 Main St',
        city: 'Fort Myers',
        applicant: 'John Doe',
        applicant_email: 'john@example.com',
        applicant_phone: '(239) 555-0100',
        project_type: 'commercial',
        status: 'under_review',
        submitted_date: new Date().toISOString()
      })
    }
  }

  const folders = [
    { id: 'plans', name: 'Plan Documents', icon: FileText, count: 12 },
    { id: 'specs', name: 'Spec Documents', icon: ClipboardCheck, count: 8 },
    { id: 'contacts', name: 'Project Contacts', icon: Users, count: 6 },
    { id: 'permits', name: 'Permit Documents', icon: Shield, count: 4 },
    { id: 'inspections', name: 'Inspection Reports', icon: HardHat, count: 15 },
    { id: 'field', name: 'Field Reports', icon: Wrench, count: 23 }
  ]

  const permitMetrics = [
    { label: 'Submittal Date', value: '01/15/2024', trend: null },
    { label: 'Review Status', value: 'In Progress', trend: 'stable' },
    { label: 'Comments', value: '3 Open', trend: 'up' },
    { label: 'Est. Approval', value: '02/28/2024', trend: null }
  ]

  const inspectionMetrics = [
    { label: 'Total Inspections', value: '15', trend: 'up' },
    { label: 'Passed', value: '12', trend: 'up' },
    { label: 'Failed', value: '2', trend: 'down' },
    { label: 'Pending', value: '1', trend: 'stable' }
  ]

  const loadFolderContents = (folderId: string) => {
    // Mock folder contents - in production, load from database
    const mockContents: Record<string, FolderItem[]> = {
      plans: [
        { id: '1', name: 'A1.0 - Site Plan.pdf', type: 'file', size: '2.4 MB', modified: '2024-01-15' },
        { id: '2', name: 'A2.0 - Floor Plans.pdf', type: 'file', size: '3.1 MB', modified: '2024-01-15' },
        { id: '3', name: 'A3.0 - Elevations.pdf', type: 'file', size: '2.8 MB', modified: '2024-01-15' },
        { id: '4', name: 'S1.0 - Structural Plans.pdf', type: 'file', size: '4.2 MB', modified: '2024-01-14' }
      ],
      specs: [
        { id: '1', name: 'Technical Specifications.pdf', type: 'file', size: '1.8 MB', modified: '2024-01-10' },
        { id: '2', name: 'Material Specifications.xlsx', type: 'file', size: '856 KB', modified: '2024-01-10' }
      ],
      contacts: [
        { id: '1', name: 'John Doe - Owner', type: 'file', icon: Users, modified: 'john@example.com' },
        { id: '2', name: 'Jane Smith - Architect', type: 'file', icon: Users, modified: 'jane@architects.com' },
        { id: '3', name: 'Bob Builder - Contractor', type: 'file', icon: Users, modified: 'bob@construction.com' }
      ],
      permits: [
        { id: '1', name: 'Building Permit Application.pdf', type: 'file', size: '1.2 MB', modified: '2024-01-15' },
        { id: '2', name: 'Electrical Permit.pdf', type: 'file', size: '890 KB', modified: '2024-01-16' }
      ],
      inspections: [
        { id: '1', name: 'Foundation Inspection - PASSED', type: 'file', size: '456 KB', modified: '2024-01-20' },
        { id: '2', name: 'Framing Inspection - PASSED', type: 'file', size: '512 KB', modified: '2024-01-25' },
        { id: '3', name: 'Electrical Rough-In - PENDING', type: 'file', size: '398 KB', modified: '2024-01-28' }
      ],
      field: [
        { id: '1', name: 'Daily Report - 01/28/2024', type: 'file', size: '234 KB', modified: '2024-01-28' },
        { id: '2', name: 'Safety Incident Report', type: 'file', size: '189 KB', modified: '2024-01-27' },
        { id: '3', name: 'Weather Delay Report', type: 'file', size: '145 KB', modified: '2024-01-26' }
      ]
    }
    
    setFolderContents(mockContents[folderId] || [])
    setSelectedFolder(folderId)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      approved: 'bg-green-100 text-green-700 border-green-300',
      under_review: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      rejected: 'bg-red-100 text-red-700 border-red-300',
      pending: 'bg-gray-100 text-gray-700 border-gray-300'
    }
    return colors[status] || colors.pending
  }

  const getTrendIcon = (trend: string | null) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend === 'down') return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
    return <Activity className="h-4 w-4 text-gray-400" />
  }

  if (!project) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <PageTitle 
        title={`Project Control Center - ${project.project_name}`}
        subtitle={`Permit #${project.permit_number}`}
      />
      
      <div className="mb-6">
        <button 
          onClick={() => router.push('/projects')}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </button>
      </div>

      {/* Project Info Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <Building className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Project Type</p>
              <p className="text-sm font-medium capitalize">{project.project_type}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="text-sm font-medium">{project.city}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Applicant</p>
              <p className="text-sm font-medium">{project.applicant}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {!selectedFolder ? (
        <>
          {/* Dashboard Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Permit Status Metrics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-sky-600" />
                Permit Status Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {permitMetrics.map((metric, index) => (
                  <div key={index} className="border-l-2 border-sky-200 pl-3">
                    <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-gray-900">{metric.value}</p>
                      {metric.trend && getTrendIcon(metric.trend)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inspection Metrics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HardHat className="h-5 w-5 text-orange-600" />
                Inspection Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {inspectionMetrics.map((metric, index) => (
                  <div key={index} className="border-l-2 border-orange-200 pl-3">
                    <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-gray-900">{metric.value}</p>
                      {metric.trend && getTrendIcon(metric.trend)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Folder Grid */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => loadFolderContents(folder.id)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-sky-300 transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <folder.icon className="h-8 w-8 text-sky-600 group-hover:text-sky-700" />
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {folder.count} items
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 group-hover:text-sky-700">
                    {folder.name}
                  </h4>
                  <div className="flex items-center gap-1 mt-2 text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs">Open folder</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Folder Contents View */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedFolder(null)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-semibold text-gray-900">
                  {folders.find(f => f.id === selectedFolder)?.name}
                </h3>
                <span className="text-sm text-gray-500">
                  ({folderContents.length} items)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-sky-600 text-white text-sm rounded-lg hover:bg-sky-700 flex items-center gap-1">
                  <Upload className="h-4 w-4" />
                  Upload
                </button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Files List */}
          <div className="divide-y divide-gray-200">
            {folderContents.length === 0 ? (
              <div className="p-8 text-center">
                <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No files in this folder</p>
                <button className="mt-3 text-sky-600 hover:text-sky-700 text-sm">
                  Upload first file
                </button>
              </div>
            ) : (
              folderContents
                .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item.icon ? (
                        <item.icon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <FileText className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.size ? `${item.size} • ` : ''}{item.modified}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-sky-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-sky-600">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}