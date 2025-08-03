'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Plus, 
  Building2, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Calendar, 
  Map, 
  Camera, 
  FileText, 
  Download, 
  Shield, 
  Brain, 
  Users, 
  TrendingUp, 
  Clock, 
  Filter, 
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Eye,
  Home,
  MapPin,
  Activity
} from 'lucide-react'
import Link from 'next/link'

interface VBAProject {
  id: string
  jobNumber?: string
  projectName: string
  address: string
  inspectionType: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed'
  scheduledDate: string
  inspector: string
  completionRate: number
  complianceScore?: number
  lastUpdated: string
  virtualInspectorEnabled: boolean
  gpsLocation?: { lat: number; lng: number }
  photoCount: number
  violations: number
  aiConfidence?: number
  selectedInspections?: string[]
}

interface InspectionStats {
  totalInspections: number
  completedInspections: number
  pendingInspections: number
  failedInspections: number
  averageComplianceScore: number
  virtualInspectorUsage: number
  timesSaved: number
}

export default function VBAPage() {
  const [projects, setProjects] = useState<VBAProject[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [inspectionStats, setInspectionStats] = useState<InspectionStats>({
    totalInspections: 0,
    completedInspections: 0,
    pendingInspections: 0,
    failedInspections: 0,
    averageComplianceScore: 0,
    virtualInspectorUsage: 0,
    timesSaved: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadVBAProjects()
  }, [])

  const loadVBAProjects = async () => {
    try {
      setIsLoading(true)
      // Load projects from API or localStorage
      const savedProjects = localStorage.getItem('vba-projects')
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects))
      }

      // Calculate stats
      const loadedProjects = savedProjects ? JSON.parse(savedProjects) : []
      const stats: InspectionStats = {
        totalInspections: loadedProjects.length,
        completedInspections: loadedProjects.filter((p: VBAProject) => p.status === 'completed').length,
        pendingInspections: loadedProjects.filter((p: VBAProject) => p.status === 'scheduled').length,
        failedInspections: loadedProjects.filter((p: VBAProject) => p.status === 'failed').length,
        averageComplianceScore: loadedProjects.length > 0 ? Math.round(
          loadedProjects
            .filter((p: VBAProject) => p.complianceScore !== undefined)
            .reduce((acc: number, p: VBAProject) => acc + (p.complianceScore || 0), 0) /
          (loadedProjects.filter((p: VBAProject) => p.complianceScore !== undefined).length || 1)
        ) : 0,
        virtualInspectorUsage: loadedProjects.length > 0 ? Math.round(
          (loadedProjects.filter((p: VBAProject) => p.virtualInspectorEnabled).length / loadedProjects.length) * 100
        ) : 0,
        timesSaved: 48 // Mock hours saved
      }

      setInspectionStats(stats)
    } catch (error) {
      console.error('Failed to load VBA projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.inspector.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-gray-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'scheduled':
        return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Home className="h-4 w-4" />
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">VBA</span>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Virtual Building Authority</h1>
          <p className="text-gray-600 mt-1">Digital inspection platform for real-time compliance monitoring</p>
        </div>
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="inline-flex items-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Inspection
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-sky-100 rounded-lg">
              <Calendar className="h-6 w-6 text-sky-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{inspectionStats.totalInspections}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Total Inspections</h3>
          <p className="text-xs text-gray-500 mt-1">All scheduled inspections</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{inspectionStats.completedInspections}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Completed</h3>
          <p className="text-xs text-gray-500 mt-1">Successfully finished</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{inspectionStats.pendingInspections}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Pending</h3>
          <p className="text-xs text-gray-500 mt-1">Awaiting inspection</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{inspectionStats.averageComplianceScore}%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Compliance Rate</h3>
          <p className="text-xs text-gray-500 mt-1">Average score</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/vba/inspection-guidelines" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-sky-300 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <FileText className="h-8 w-8 text-sky-600" />
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Inspection Guidelines</h3>
          <p className="text-sm text-gray-600 mt-1">View standards and requirements</p>
        </Link>

        <Link href="/vba/compliance-standards" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-sky-300 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <Shield className="h-8 w-8 text-sky-600" />
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Compliance Standards</h3>
          <p className="text-sm text-gray-600 mt-1">Building codes and regulations</p>
        </Link>

        <Link href="/vba/inspector-directory" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-sky-300 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-sky-600" />
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Inspector Directory</h3>
          <p className="text-sm text-gray-600 mt-1">Certified inspector contacts</p>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search inspections..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
              <Filter className="h-5 w-5" />
              More Filters
            </button>
            
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
              <Download className="h-5 w-5" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Job #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Inspection Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Inspector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Scheduled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  AI Enabled
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading inspections...</p>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No inspections found</p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {project.jobNumber || `J${project.id.slice(-4)}`}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{project.projectName}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {project.address}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.inspectionType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {project.complianceScore !== undefined ? (
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${getComplianceColor(project.complianceScore)}`}>
                            {project.complianceScore}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.inspector || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(project.scheduledDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {project.virtualInspectorEnabled ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          <Brain className="h-3 w-3 mr-1" />
                          Enabled
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/vba/project/${project.id}`}
                          className="text-sky-600 hover:text-sky-900 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button className="text-gray-600 hover:text-gray-900 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Feature Highlight */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-sky-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI-Powered Compliance Detection</h3>
              <p className="text-gray-600">Automatically identify code violations using computer vision</p>
            </div>
          </div>
          <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-medium transition-colors">
            Learn More
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Inspection Calendar</h3>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-900 min-w-[120px] text-center">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-gray-50 p-2 text-center">
              <span className="text-xs font-medium text-gray-600">{day}</span>
            </div>
          ))}
          {Array.from({ length: 35 }, (_, i) => {
            const date = i - new Date().getDay() + 1
            const isToday = date === new Date().getDate()
            const hasInspections = [3, 7, 12, 15, 21, 28].includes(date)
            
            return (
              <div
                key={i}
                className={`bg-white p-2 min-h-[80px] border border-gray-100 ${
                  isToday ? 'bg-sky-50' : ''
                } ${hasInspections ? 'cursor-pointer hover:bg-gray-50' : ''}`}
              >
                <div className={`text-sm font-medium ${
                  isToday ? 'text-sky-600' : 'text-gray-900'
                } ${date < 1 || date > 31 ? 'text-gray-400' : ''}`}>
                  {date > 0 && date <= 31 ? date : ''}
                </div>
                {hasInspections && date > 0 && date <= 31 && (
                  <div className="mt-1 space-y-1">
                    <div className="text-xs bg-sky-100 text-sky-700 px-1 py-0.5 rounded truncate">
                      2 inspections
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-sky-100 rounded"></div>
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 rounded"></div>
              <span>Completed</span>
            </div>
          </div>
          <button className="text-sky-600 hover:text-sky-700 font-medium">
            View Full Calendar
          </button>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <NewProjectModal 
          onClose={() => setShowNewProjectModal(false)}
          onSave={(newProject) => {
            const updatedProjects = [newProject, ...projects]
            setProjects(updatedProjects)
            localStorage.setItem('vba-projects', JSON.stringify(updatedProjects))
            setShowNewProjectModal(false)
          }}
        />
      )}
    </div>
  )
}

// Inspection types list
const INSPECTION_TYPES = [
  'Pre Construction',
  'Permit Review',
  'Site Survey',
  'Demolition',
  'Silt Fence',
  'UG Plumbing',
  'UG Electrical',
  'UG Gas',
  'Compaction',
  'Termite Pre-Treatment',
  'Footings',
  'Slab',
  'Stem Wall',
  'Pos-Tension',
  'Mono Slab',
  'Column',
  'Tie Beam',
  'Lintel',
  'Elevated Slab',
  'Truss/Framing',
  'Framing',
  'Sheathing Nailing',
  'Strapping/Hardware',
  'Wind Mitigation',
  'Window Bucks',
  'Waterproofing',
  'Window Installation',
  'Door Installation',
  'Door/Window Flashing',
  'Roofing Dry-In',
  'Roofing Nailer',
  'Roofing Final',
  'Stucco Lathe',
  'Rough Electrical',
  'Rough Plumbing',
  'Rough Low Voltage/Security',
  'Rough HVAC',
  'Water Meter(Utility)',
  'Duct Pressure Test',
  'Fireplace',
  'Wall Insulation',
  'Attic Insulation',
  'Sound Insulation(STC)',
  'Fire-Penetration',
  'Drywall Screw Pattern',
  'Drywall',
  'Final Electrical',
  'Final Plumbing',
  'Final HVAC',
  'Final Low Voltage',
  'Back-Flow Preventer',
  'Duct Blaster Test',
  'Fire Sprinkler',
  'Fire Alarm',
  'Grading/Drainage',
  'Elevator',
  'Meter Equipment',
  'Transfer Switch',
  'Storm Shutters',
  'Fence',
  'Accessibility',
  'Handrails',
  'Egress',
  'Landscaping/Egress',
  'Final Building',
  'Pool Shell',
  'Pool Plumbing Rough',
  'Pool Bonding',
  'Pool Shell II (Pre-Gunite)',
  'Pool Deck',
  'Pool Equipment',
  'Pool Gas',
  'Pool Alarms',
  'Pool Final'
]

// New Project Modal Component
function NewProjectModal({ onClose, onSave }: { onClose: () => void; onSave: (project: VBAProject) => void }) {
  const [projectData, setProjectData] = useState({
    projectName: '',
    address: '',
    jobNumber: '',
    owner: '',
    contractor: '',
    projectType: 'Commercial'
  })
  const [selectedInspections, setSelectedInspections] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newProject: VBAProject = {
      id: Date.now().toString(),
      jobNumber: projectData.jobNumber,
      projectName: projectData.projectName,
      address: projectData.address,
      inspectionType: selectedInspections.join(', '),
      status: 'scheduled',
      scheduledDate: new Date().toISOString(),
      inspector: '',
      completionRate: 0,
      lastUpdated: new Date().toISOString(),
      virtualInspectorEnabled: false,
      photoCount: 0,
      violations: 0,
      selectedInspections: selectedInspections
    }

    onSave(newProject)
  }

  const toggleInspection = (inspection: string) => {
    setSelectedInspections(prev =>
      prev.includes(inspection)
        ? prev.filter(i => i !== inspection)
        : [...prev, inspection]
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">New VBA Inspection Project</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Number</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={projectData.jobNumber}
                onChange={(e) => setProjectData({ ...projectData, jobNumber: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={projectData.projectName}
                onChange={(e) => setProjectData({ ...projectData, projectName: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={projectData.address}
                onChange={(e) => setProjectData({ ...projectData, address: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={projectData.owner}
                onChange={(e) => setProjectData({ ...projectData, owner: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contractor</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={projectData.contractor}
                onChange={(e) => setProjectData({ ...projectData, contractor: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Applicable Inspections</label>
            <div className="border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INSPECTION_TYPES.map((inspection) => (
                  <label key={inspection} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-sky-600 focus:ring-sky-500"
                      checked={selectedInspections.includes(inspection)}
                      onChange={() => toggleInspection(inspection)}
                    />
                    <span className="text-sm text-gray-700">{inspection}</span>
                  </label>
                ))}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Selected: {selectedInspections.length} inspection{selectedInspections.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
              disabled={!projectData.projectName || !projectData.jobNumber || selectedInspections.length === 0}
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}