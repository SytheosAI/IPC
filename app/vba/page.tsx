'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Plus, 
  Building, 
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
  MoreVertical,
  Eye
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
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'scheduled':
        return <Calendar className="h-5 w-5 text-gray-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'scheduled':
        return 'bg-gray-100 text-gray-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Virtual Building Authority</h1>
          <p className="text-gray-600 mt-1">Digital inspection platform for real-time compliance monitoring</p>
        </div>
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Inspection
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{inspectionStats.totalInspections}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Total Inspections</h3>
          <p className="text-xs text-gray-500 mt-1">All scheduled inspections</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{inspectionStats.completedInspections}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Completed</h3>
          <p className="text-xs text-gray-500 mt-1">Successfully finished</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{inspectionStats.pendingInspections}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Pending</h3>
          <p className="text-xs text-gray-500 mt-1">Awaiting inspection</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{inspectionStats.averageComplianceScore}%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Compliance Rate</h3>
          <p className="text-xs text-gray-500 mt-1">Average score</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/vba/inspection-guidelines" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <FileText className="h-8 w-8 text-indigo-600" />
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Inspection Guidelines</h3>
          <p className="text-sm text-gray-600 mt-1">View standards and requirements</p>
        </Link>

        <Link href="/vba/compliance-standards" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <Shield className="h-8 w-8 text-indigo-600" />
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Compliance Standards</h3>
          <p className="text-sm text-gray-600 mt-1">Building codes and regulations</p>
        </Link>

        <Link href="/vba/inspector-directory" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-indigo-600" />
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Inspector Directory</h3>
          <p className="text-sm text-gray-600 mt-1">Certified inspector contacts</p>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search inspections..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              More Filters
            </button>
            
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inspection Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inspector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI Enabled
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading inspections...</p>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No inspections found</p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {project.jobNumber || `J${project.id.slice(-4)}`}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{project.projectName}</div>
                        <div className="text-xs text-gray-500">{project.address}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.inspectionType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
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
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
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
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button className="text-gray-600 hover:text-gray-900">
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
      <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI-Powered Compliance Detection</h3>
              <p className="text-indigo-100">Automatically identify code violations using computer vision</p>
            </div>
          </div>
          <button className="bg-white text-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-50 font-medium">
            Learn More
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500"
                value={projectData.jobNumber}
                onChange={(e) => setProjectData({ ...projectData, jobNumber: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500"
                value={projectData.projectName}
                onChange={(e) => setProjectData({ ...projectData, projectName: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500"
                value={projectData.address}
                onChange={(e) => setProjectData({ ...projectData, address: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500"
                value={projectData.owner}
                onChange={(e) => setProjectData({ ...projectData, owner: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contractor</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500"
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
                      className="rounded text-indigo-600 focus:ring-indigo-500"
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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