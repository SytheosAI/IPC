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
  Activity,
  Cloud,
  Droplets,
  Wind,
  ExternalLink,
  Newspaper,
  ArrowUp
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

interface WeatherData {
  temp: number
  condition: string
  feelsLike: number
  humidity: number
  forecast: Array<{
    day: string
    high: number
    low: number
    condition: string
  }>
}

interface NewsItem {
  id: string
  title: string
  source: string
  date: string
  category: string
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
  const [weatherData] = useState<WeatherData>({
    temp: 82,
    condition: 'Partly Cloudy',
    feelsLike: 88,
    humidity: 65,
    forecast: [
      { day: 'Today', high: 85, low: 74, condition: 'partly-cloudy' },
      { day: 'Tomorrow', high: 86, low: 77, condition: 'cloudy' },
      { day: 'Fri', high: 90, low: 79, condition: 'cloudy' }
    ]
  })
  const [newsItems] = useState<NewsItem[]>([
    {
      id: '1',
      title: 'AI-Powered Construction Management Reduces Project Delays by 35%',
      source: 'Construction AI Weekly',
      date: 'Jan 27',
      category: 'AI & Tech'
    },
    {
      id: '2',
      title: 'Construction Robotics Market to Hit $20B by 2026',
      source: 'TechConstruct News',
      date: 'Jan 24',
      category: 'AI & Tech'
    }
  ])

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
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Virtual Building Authority</h1>
        <p className="text-gray-600 mt-1">Digital Inspection Platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weather Widget */}
        <div className="bg-gray-800 text-white rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">Fort Myers</span>
            </div>
            <button className="p-1 hover:bg-gray-700 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <Cloud className="h-16 w-16" />
            <div>
              <div className="text-5xl font-bold">{weatherData.temp}°</div>
              <div className="text-sm opacity-80">{weatherData.condition}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs opacity-70 mb-1">
                <Wind className="h-3 w-3" />
                Feels like
              </div>
              <div className="text-lg font-semibold">{weatherData.feelsLike}°</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs opacity-70 mb-1">
                <Droplets className="h-3 w-3" />
                Humidity
              </div>
              <div className="text-lg font-semibold">{weatherData.humidity}%</div>
            </div>
          </div>

          <div className="space-y-2">
            {weatherData.forecast.map((day) => (
              <div key={day.day} className="flex items-center justify-between text-sm">
                <span className="opacity-70">{day.day}</span>
                <Cloud className="h-4 w-4" />
                <span>{day.high}° / {day.low}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* This Week Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
            This Week
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Inspections Completed</span>
                <span className="text-lg font-semibold text-gray-900">32</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-sky-500 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Pass Rate</span>
                <span className="text-lg font-semibold text-gray-900">94%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Average Duration</span>
                <span className="text-lg font-semibold text-gray-900">45 min</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/vba/inspection-guidelines" className="flex items-center gap-2 text-sm text-gray-600 hover:text-sky-600">
                <FileText className="h-4 w-4" />
                Inspection Guidelines
              </Link>
              <Link href="/vba/compliance-standards" className="flex items-center gap-2 text-sm text-gray-600 hover:text-sky-600">
                <Shield className="h-4 w-4" />
                Compliance Standards
              </Link>
              <Link href="/vba/inspector-directory" className="flex items-center gap-2 text-sm text-gray-600 hover:text-sky-600">
                <Users className="h-4 w-4" />
                Inspector Directory
              </Link>
            </div>
          </div>
        </div>

        {/* Construction News */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
            Construction AI & Industry News
            <Newspaper className="h-5 w-5 text-gray-400" />
          </h3>

          <div className="flex gap-2 mb-4">
            <button className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">All</button>
            <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200">AI & Tech</button>
            <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200">General</button>
            <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200">Updates</button>
          </div>

          <div className="space-y-4">
            {newsItems.map((news) => (
              <div key={news.id} className="border-b border-gray-100 pb-4 last:border-0">
                <h4 className="text-sm font-medium text-gray-900 mb-1 hover:text-sky-600 cursor-pointer">
                  {news.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-0.5 rounded">ai</span>
                  <span>{news.source}</span>
                  <span>•</span>
                  <span>{news.date}</span>
                </div>
              </div>
            ))}
          </div>

          <Link href="/vba/news" className="mt-4 flex items-center justify-center gap-2 text-sm text-sky-600 hover:text-sky-700">
            View More Construction AI News
            <ArrowUp className="h-4 w-4 rotate-90" />
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search inspections..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select
          className="px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        
        <button className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <Filter className="h-5 w-5" />
          More Filters
        </button>
        
        <button className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <Download className="h-5 w-5" />
          Export
        </button>
      </div>

      {/* Inspection Projects Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Inspection Projects</h2>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="inline-flex items-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Project
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Job #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Date Added
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading inspections...</p>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-24 text-center">
                    <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No inspections found</p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.jobNumber || `J${project.id.slice(-4)}`}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/vba/project/${project.id}`} className="text-sm font-medium text-gray-900 hover:text-sky-600">
                        {project.projectName}
                      </Link>
                      <div className="text-xs text-gray-500 mt-1">{project.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(project.scheduledDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI-Powered Inspections */}
      <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI-Powered Inspections</h3>
              <p className="text-white/80">Use computer vision to automatically detect compliance issues</p>
            </div>
          </div>
          <button className="bg-white text-purple-600 px-6 py-2 rounded-lg hover:bg-gray-100 font-medium transition-colors">
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