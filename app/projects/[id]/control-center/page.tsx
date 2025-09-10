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
      // Fetch project via API
      const response = await fetch(`/api/projects/${projectId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch project')
      }
      const { data: projectData } = await response.json()
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 flex items-center justify-center">
        <div className="card-modern p-8 text-center shadow-glow">
          <div className="spinner-modern mx-auto mb-4"></div>
          <p className="text-yellow-400">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Header */}
      <PageTitle 
        title={`Project Control Center - ${project.project_name}`}
        subtitle={`Permit #${project.permit_number}`}
      />
      
      <div className="mb-6">
        <button 
          onClick={() => router.push('/projects')}
          className="text-gray-400 hover:text-yellow-400 flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </button>
      </div>

      {/* Project Info Bar */}
      <div className="card-modern hover-lift p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <Building className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Project Type</p>
              <p className="text-sm font-medium capitalize text-gray-100">{project.project_type}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Location</p>
              <p className="text-sm font-medium text-gray-100">{project.city}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Applicant</p>
              <p className="text-sm font-medium text-gray-100">{project.applicant}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Status</p>
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
            <div className="card-modern hover-lift p-6">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-yellow-400" />
                Permit Status Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {permitMetrics.map((metric, index) => (
                  <div key={index} className="border-l-2 border-yellow-400/50 pl-3">
                    <p className="text-xs text-gray-400 mb-1">{metric.label}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-gray-100">{metric.value}</p>
                      {metric.trend && getTrendIcon(metric.trend)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inspection Metrics */}
            <div className="card-modern hover-lift p-6">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                <HardHat className="h-5 w-5 text-orange-400" />
                Inspection Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {inspectionMetrics.map((metric, index) => (
                  <div key={index} className="border-l-2 border-orange-400/50 pl-3">
                    <p className="text-xs text-gray-400 mb-1">{metric.label}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-gray-100">{metric.value}</p>
                      {metric.trend && getTrendIcon(metric.trend)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Folder Grid */}
          <div className="card-modern hover-lift p-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Project Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => loadFolderContents(folder.id)}
                  className="p-4 card-glass hover-lift transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <folder.icon className="h-8 w-8 text-yellow-400 group-hover:text-yellow-300" />
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {folder.count} items
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-100 group-hover:text-yellow-400">
                    {folder.name}
                  </h4>
                  <div className="flex items-center gap-1 mt-2 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity">
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
        <div className="card-modern hover-lift">
          <div className="p-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedFolder(null)}
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-semibold text-yellow-400">
                  {folders.find(f => f.id === selectedFolder)?.name}
                </h3>
                <span className="text-sm text-gray-400">
                  ({folderContents.length} items)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-primary flex items-center gap-1">
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
                className="input-modern"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Files List */}
          <div className="divide-y divide-gray-700/30">
            {folderContents.length === 0 ? (
              <div className="p-8 text-center">
                <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">No files in this folder</p>
                <button className="btn-glass mt-3">
                  Upload first file
                </button>
              </div>
            ) : (
              folderContents
                .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-800/30 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item.icon ? (
                        <item.icon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <FileText className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-100">{item.name}</p>
                        <p className="text-xs text-gray-400">
                          {item.size ? `${item.size} • ` : ''}{item.modified}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-yellow-400 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-yellow-400 transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
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