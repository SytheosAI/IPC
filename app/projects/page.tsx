'use client'

import { useState, useEffect } from 'react'
import { 
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  User,
  Building,
  CheckCircle,
  Clock,
  PlayCircle,
  PauseCircle,
  AlertTriangle,
  MapPin,
  DollarSign,
  Users,
  Percent,
  TrendingUp,
  Activity,
  X,
  MoreVertical,
  ArrowUpDown
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
  status: 'intake' | 'in_review' | 'approved' | 'rejected' | 'issued'
  submitted_date?: string
  last_updated?: string
  total_issues?: number
  total_conditions?: number
  total_notes?: number
  assigned_to?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProject, setNewProject] = useState({
    project_name: '',
    address: '',
    city: '',
    permit_number: '',
    applicant: '',
    applicant_email: '',
    applicant_phone: '',
    project_type: 'commercial',
    status: 'intake' as 'intake' | 'in_review' | 'approved' | 'rejected' | 'issued',
    priority: 'medium'
  })
  
  // Load projects from Supabase on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await db.projects.getAll()
        setProjects(data)
      } catch (error) {
        console.error('Failed to load projects:', error)
      }
    }
    loadProjects()
  }, [])
  
  // Generate permit number
  const generatePermitNumber = () => {
    const year = new Date().getFullYear()
    const count = projects.filter(p => p.permit_number?.startsWith(`PRM-${year}`)).length + 1
    return `PRM-${year}-${String(count).padStart(3, '0')}`
  }
  
  // Handle new project creation
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const project = await db.projects.create({
        permit_number: newProject.permit_number || generatePermitNumber(),
        project_name: newProject.project_name,
        address: newProject.address,
        city: newProject.city,
        applicant: newProject.applicant,
        applicant_email: newProject.applicant_email,
        applicant_phone: newProject.applicant_phone,
        project_type: newProject.project_type,
        status: newProject.status,
        submitted_date: new Date().toISOString()
      })
      
      setProjects([project, ...projects])
    } catch (error) {
      console.error('Failed to create project:', error)
      alert('Failed to create project. Please try again.')
    }
    
    // Reset form
    setNewProject({
      project_name: '',
      address: '',
      city: '',
      permit_number: '',
      applicant: '',
      applicant_email: '',
      applicant_phone: '',
      project_type: 'commercial',
      status: 'intake',
      priority: 'medium'
    })
    setShowNewProjectModal(false)
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortField, setSortField] = useState<'project_name' | 'status' | 'submitted_date'>('submitted_date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'intake': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'in_review': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'approved': return 'bg-green-100 text-green-700 border-green-300'
      case 'rejected': return 'bg-red-100 text-red-700 border-red-300'
      case 'issued': return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'intake': return <Clock className="h-4 w-4" />
      case 'in_review': return <Eye className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <X className="h-4 w-4" />
      case 'issued': return <FileText className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.permit_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.city?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                         (project.address?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                         (project.applicant?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    const matchesCategory = filterCategory === 'all' || project.project_type === filterCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      case 'submitted_date':
        comparison = new Date(a.submitted_date || 0).getTime() - new Date(b.submitted_date || 0).getTime()
        break
      case 'project_name':
        comparison = a.project_name.localeCompare(b.project_name)
        break
      default:
        comparison = 0
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-4">Project Queue</h1>
        <div className="flex justify-end">
          <button 
            onClick={() => setShowNewProjectModal(true)}
            className="btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Project
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by project name, number, city, or permit..."
              className="w-full pl-9 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 hover:border-gray-400 dark:hover:border-gray-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:ring-sky-500 focus:border-sky-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              className="px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="in_queue">In Queue</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              className="px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="municipal">Municipal</option>
            </select>

            <button className="btn-secondary flex items-center gap-1 px-3 py-2 text-sm">
              <Filter className="h-4 w-4" />
              Filters
            </button>

            <button className="btn-secondary flex items-center gap-1 px-3 py-2 text-sm">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider hover:text-gray-900 dark:hover:text-gray-100"
                    onClick={() => {
                      if (sortField === 'project_name') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortField('project_name')
                        setSortOrder('asc')
                      }
                    }}
                  >
                    Project Name
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Permit #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No projects found</p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">Get started by creating your first project</p>
                    <button
                      onClick={() => setShowNewProjectModal(true)}
                      className="btn-primary"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create New Project
                    </button>
                  </td>
                </tr>
              ) : (
                sortedProjects.map((project) => (
                  <tr 
                    key={project.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/projects/${project.id}`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{project.project_name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{project.permit_number}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-gray-100">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {project.city || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{project.applicant || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{project.permit_number || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{project.project_type || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            window.location.href = `/projects/${project.id}`
                          }}
                          className="text-sky-600 hover:text-sky-900 dark:hover:text-sky-300 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                        >
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

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">New Project</h3>
                <button
                  onClick={() => setShowNewProjectModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateProject} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name *</label>
                  <input
                    type="text"
                    className="input-modern text-gray-900 dark:text-gray-100"
                    value={newProject.project_name}
                    onChange={(e) => setNewProject({ ...newProject, project_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      className="input-modern pl-10 text-gray-900 dark:text-gray-100"
                      value={newProject.city}
                      onChange={(e) => setNewProject({ ...newProject, city: e.target.value })}
                      placeholder="e.g., Miami"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Submittal Number</label>
                  <input
                    type="text"
                    className="input-modern text-gray-900 dark:text-gray-100"
                    value={newProject.applicant}
                    onChange={(e) => setNewProject({ ...newProject, applicant: e.target.value })}
                    placeholder="e.g., 2024-0804-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Permit Number</label>
                  <input
                    type="text"
                    className="input-modern text-gray-900 dark:text-gray-100"
                    value={newProject.permit_number}
                    onChange={(e) => setNewProject({ ...newProject, permit_number: e.target.value })}
                    placeholder="e.g., PER-2024-0123"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      className="input-modern text-gray-900 dark:text-gray-100"
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value as any })}
                    >
                      <option value="in_queue">In Queue</option>
                      <option value="in_progress">In Progress</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Type</label>
                    <select
                      className="input-modern text-gray-900 dark:text-gray-100"
                      value={newProject.project_type}
                      onChange={(e) => setNewProject({ ...newProject, project_type: e.target.value })}
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="industrial">Industrial</option>
                      <option value="municipal">Municipal</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <input
                      type="text"
                      className="input-modern text-gray-900 dark:text-gray-100"
                      value={newProject.address}
                      onChange={(e) => setNewProject({ ...newProject, address: e.target.value })}
                      placeholder="Project address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      className="input-modern text-gray-900 dark:text-gray-100"
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value as any })}
                    >
                      <option value="intake">Intake</option>
                      <option value="in_review">In Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="issued">Issued</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Applicant Email</label>
                    <input
                      type="email"
                      className="input-modern text-gray-900 dark:text-gray-100"
                      value={newProject.applicant_email}
                      onChange={(e) => setNewProject({ ...newProject, applicant_email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Applicant Phone</label>
                    <input
                      type="tel"
                      className="input-modern text-gray-900 dark:text-gray-100"
                      value={newProject.applicant_phone}
                      onChange={(e) => setNewProject({ ...newProject, applicant_phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!newProject.project_name || !newProject.city}
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}