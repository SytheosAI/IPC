'use client'

import { useState } from 'react'
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
  Activity
} from 'lucide-react'

interface Project {
  id: string
  projectNumber: string
  projectName: string
  projectAddress: string
  client: string
  projectManager: string
  status: 'in_queue' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  startDate: string
  expectedCompletion: string
  actualCompletion?: string
  progress: number
  budget: number
  spent: number
  teamSize: number
  category: 'residential' | 'commercial' | 'industrial' | 'municipal'
  permitStatus: 'pending' | 'approved' | 'expired' | 'rejected'
  lastActivity: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      projectNumber: 'PRJ-2024-001',
      projectName: 'Sunrise Medical Center',
      projectAddress: '1234 Healthcare Blvd, Miami, FL',
      client: 'Healthcare Properties LLC',
      projectManager: 'Sarah Johnson',
      status: 'in_progress',
      priority: 'high',
      startDate: '2024-01-15',
      expectedCompletion: '2024-08-15',
      progress: 65,
      budget: 2500000,
      spent: 1625000,
      teamSize: 12,
      category: 'commercial',
      permitStatus: 'approved',
      lastActivity: '2024-01-19'
    },
    {
      id: '2',
      projectNumber: 'PRJ-2024-002',
      projectName: 'Oak Grove Residential',
      projectAddress: '567 Oak Street, Miami, FL',
      client: 'Johnson Family Trust',
      projectManager: 'Mike Chen',
      status: 'completed',
      priority: 'medium',
      startDate: '2023-11-01',
      expectedCompletion: '2024-01-15',
      actualCompletion: '2024-01-12',
      progress: 100,
      budget: 450000,
      spent: 438000,
      teamSize: 6,
      category: 'residential',
      permitStatus: 'approved',
      lastActivity: '2024-01-12'
    },
    {
      id: '3',
      projectNumber: 'PRJ-2024-003',
      projectName: 'Downtown Office Complex',
      projectAddress: '890 Commerce Way, Miami, FL',
      client: 'Plaza Holdings Inc',
      projectManager: 'Lisa Rodriguez',
      status: 'in_queue',
      priority: 'medium',
      startDate: '2024-02-01',
      expectedCompletion: '2024-12-01',
      progress: 0,
      budget: 3200000,
      spent: 0,
      teamSize: 15,
      category: 'commercial',
      permitStatus: 'pending',
      lastActivity: '2024-01-18'
    },
    {
      id: '4',
      projectNumber: 'PRJ-2024-004',
      projectName: 'Industrial Warehouse',
      projectAddress: '2345 Industry Park, Miami, FL',
      client: 'Logistics Corp',
      projectManager: 'David Kim',
      status: 'on_hold',
      priority: 'low',
      startDate: '2024-01-20',
      expectedCompletion: '2024-06-20',
      progress: 25,
      budget: 1800000,
      spent: 450000,
      teamSize: 8,
      category: 'industrial',
      permitStatus: 'expired',
      lastActivity: '2024-01-16'
    },
    {
      id: '5',
      projectNumber: 'PRJ-2024-005',
      projectName: 'City Hall Renovation',
      projectAddress: '100 Government Plaza, Miami, FL',
      client: 'City of Miami',
      projectManager: 'Sarah Johnson',
      status: 'in_progress',
      priority: 'urgent',
      startDate: '2024-01-01',
      expectedCompletion: '2024-05-01',
      progress: 45,
      budget: 950000,
      spent: 427500,
      teamSize: 10,
      category: 'municipal',
      permitStatus: 'approved',
      lastActivity: '2024-01-19'
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortField, setSortField] = useState<'progress' | 'priority' | 'expectedCompletion'>('expectedCompletion')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_queue': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'in_progress': return 'bg-green-100 text-green-700 border-green-300'
      case 'on_hold': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'low': return 'bg-green-100 text-green-700 border-green-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_queue': return <Clock className="h-4 w-4" />
      case 'in_progress': return <PlayCircle className="h-4 w-4" />
      case 'on_hold': return <PauseCircle className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.projectNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    const matchesCategory = filterCategory === 'all' || project.category === filterCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case 'progress':
        comparison = a.progress - b.progress
        break
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
        comparison = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
        break
      case 'expectedCompletion':
        comparison = new Date(a.expectedCompletion).getTime() - new Date(b.expectedCompletion).getTime()
        break
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    inQueue: projects.filter(p => p.status === 'in_queue').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    totalSpent: projects.reduce((sum, p) => sum + p.spent, 0)
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-4">Project Queue</h1>
        <div className="flex justify-end">
          <button className="btn-primary">
            <Plus className="h-5 w-5 mr-2" />
            New Project
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-green-600">{stats.inProgress}</p>
            </div>
            <PlayCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">In Queue</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inQueue}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Budget</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                ${(stats.totalBudget / 1000000).toFixed(1)}M
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Spent</p>
              <p className="text-lg font-bold text-purple-600">
                ${(stats.totalSpent / 1000000).toFixed(1)}M
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="input-modern pl-10 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <select
              className="input-modern text-gray-900 dark:text-gray-100"
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
              className="input-modern text-gray-900 dark:text-gray-100"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="municipal">Municipal</option>
            </select>

            <button className="btn-secondary">
              <Filter className="h-5 w-5" />
              More Filters
            </button>

            <button className="btn-secondary">
              <Download className="h-5 w-5" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedProjects.map((project) => (
          <div 
            key={project.id} 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer card-hover"
            onClick={() => window.location.href = `/projects/${project.id}`}
          >
            {/* Project Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {project.projectName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{project.projectNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}>
                  {project.priority.toUpperCase()}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                  {getStatusIcon(project.status)}
                  {project.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{project.projectAddress}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Building className="h-4 w-4 flex-shrink-0" />
                <span>{project.client}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="h-4 w-4 flex-shrink-0" />
                <span>PM: {project.projectManager}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    project.progress === 100 ? 'bg-green-500' : 
                    project.progress >= 75 ? 'bg-blue-500' :
                    project.progress >= 50 ? 'bg-yellow-500' : 
                    project.progress >= 25 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <DollarSign className="h-3 w-3" />
                  Budget
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  ${(project.budget / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <Users className="h-3 w-3" />
                  Team
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{project.teamSize}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <Calendar className="h-3 w-3" />
                  Due
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {new Date(project.expectedCompletion).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}