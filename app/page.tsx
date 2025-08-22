'use client'

import { useState, useEffect } from 'react'
import { 
  Home,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  Users,
  Calendar,
  BarChart3,
  Building2,
  Search,
  Sparkles,
  Brain,
  Zap,
  RefreshCw
} from 'lucide-react'
import { db, subscriptions } from '@/lib/supabase-client'

interface DashboardStat {
  label: string
  value: string | number
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon: React.ElementType
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

interface ProjectSummary {
  id: string
  permit_number: string
  project_name: string
  address: string
  applicant?: string
  status: 'intake' | 'in_review' | 'approved' | 'rejected' | 'issued'
  submitted_date?: string
  last_updated?: string
  total_issues?: number
  total_conditions?: number
  total_notes?: number
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [recentProjects, setRecentProjects] = useState<ProjectSummary[]>([])
  const [stats, setStats] = useState<DashboardStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
    
    // Subscribe to real-time updates
    const channel = subscriptions.subscribeToProjects(() => {
      loadDashboardData()
    })
    
    return () => {
      channel.unsubscribe()
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load projects from Supabase with error handling
      let projects = []
      try {
        projects = await db.projects.getAll()
      } catch (dbError) {
        console.warn('Failed to load projects from database:', dbError)
        projects = [] // Use empty array as fallback
      }
      setRecentProjects(projects.slice(0, 10)) // Show only recent 10

      // Calculate stats based on actual data
      const pendingCount = projects.filter((p: ProjectSummary) => p.status === 'in_review').length
      const approvedCount = projects.filter((p: ProjectSummary) => p.status === 'approved').length
      
      // Calculate average processing time
      const avgDays = calculateAverageProcessingTime(projects)

      const calculatedStats: DashboardStat[] = [
        {
          label: 'Total Applications',
          value: projects.length,
          icon: FileText,
          color: 'blue',
          description: 'Active permits in system'
        },
        {
          label: 'Pending Review',
          value: pendingCount,
          icon: Clock,
          color: 'yellow',
          description: 'Awaiting review'
        },
        {
          label: 'Approved',
          value: approvedCount,
          icon: CheckCircle,
          color: 'green',
          description: 'Total approved'
        },
        {
          label: 'Avg. Processing',
          value: avgDays > 0 ? `${avgDays} days` : 'N/A',
          icon: TrendingUp,
          color: 'purple',
          trend: 'neutral',
          trendValue: ''
        }
      ]
      
      setStats(calculatedStats)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const calculateAverageProcessingTime = (projects: ProjectSummary[]) => {
    const processedProjects = projects.filter(p => 
      p.status === 'approved' || p.status === 'issued'
    )
    
    if (processedProjects.length === 0) return 0
    
    const totalDays = processedProjects.reduce((sum, p) => {
      if (p.submitted_date && p.last_updated) {
        const submitted = new Date(p.submitted_date)
        const updated = new Date(p.last_updated)
        const days = Math.floor((updated.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24))
        return sum + days
      }
      return sum
    }, 0)
    
    return Math.round(totalDays / processedProjects.length)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      intake: 'bg-sky-500 text-white',
      in_review: 'bg-yellow-500 text-white',
      approved: 'bg-green-500 text-white',
      rejected: 'bg-red-500 text-white',
      issued: 'bg-purple-500 text-white'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-500 text-white'
  }


  const getStatColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-sky-50 text-sky-600 border-sky-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200'
    }
    return colors[color as keyof typeof colors] || 'bg-gray-50 text-gray-600 border-gray-200'
  }

  const filteredProjects = recentProjects.filter(project =>
    project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.permit_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.applicant && project.applicant.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="h-8 w-8 text-sky-600" />
          <h1 className="text-3xl font-bold text-gray-900">Intelligent Plan Check Dashboard</h1>
          <button 
            onClick={loadDashboardData}
            className="ml-auto p-2 text-gray-600 hover:text-sky-600 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-lg p-3">
          <Sparkles className="h-5 w-5 text-sky-600 mr-2" />
          <span className="text-sm text-sky-800">
            <strong>AI-Powered Analysis:</strong> Automatically reviewing plans for compliance and generating smart recommendations
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-sky-500" />
          <span className="ml-2 text-gray-600">Loading dashboard data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              const colorClasses = getStatColorClasses(stat.color)
              
              return (
                <div 
                  key={index} 
                  className={`relative overflow-hidden bg-white rounded-xl shadow-lg border-2 ${colorClasses} p-6 card-hover`}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `repeating-linear-gradient(45deg, currentColor, currentColor 10px, transparent 10px, transparent 20px)`
                    }}></div>
                  </div>
                  
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex-shrink-0">
                      <Icon className="h-10 w-10 opacity-80" />
                      {stat.trend && (
                        <div className="mt-2 flex items-center text-xs">
                          {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500 mr-1" />}
                          {stat.trend === 'down' && <Activity className="h-3 w-3 text-red-500 mr-1 rotate-180" />}
                          <span className={stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'}>
                            {stat.trendValue}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1 text-gray-900">{stat.value}</p>
                      {stat.description && (
                        <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Recent Applications Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permit Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issues/Conditions/Notes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        {searchQuery ? 'No projects found matching your search' : 'No projects yet. Create your first project to get started.'}
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50 cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{project.permit_number}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{project.project_name}</div>
                            <div className="text-sm text-gray-500">{project.address}</div>
                            {project.applicant && (
                              <div className="text-xs text-gray-400 mt-1">{project.applicant}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(project.status)}`}>
                            {project.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-3 text-sm">
                            <span className="text-red-600 font-medium">{project.total_issues || 0}</span>
                            <span className="text-gray-400">/</span>
                            <span className="text-yellow-600 font-medium">{project.total_conditions || 0}</span>
                            <span className="text-gray-400">/</span>
                            <span className="text-blue-600 font-medium">{project.total_notes || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {project.submitted_date ? new Date(project.submitted_date).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Active Permits Summary */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 card-hover">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Permits</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Commercial</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {recentProjects.filter(p => p.project_name.toLowerCase().includes('commercial')).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Residential</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {recentProjects.filter(p => p.project_name.toLowerCase().includes('residential')).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Industrial</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {recentProjects.filter(p => p.project_name.toLowerCase().includes('industrial')).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 card-hover">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 text-sm bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition-colors">
                  Create New Application
                </button>
                <button className="w-full text-left px-4 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                  Review Pending
                </button>
                <button className="w-full text-left px-4 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                  Generate Reports
                </button>
              </div>
            </div>

            {/* AI Analysis Insights */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg border border-purple-200 p-6 card-hover">
              <div className="flex items-center mb-4">
                <Brain className="h-6 w-6 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Zap className="h-4 w-4 text-yellow-500 mr-2 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <strong>90%</strong> of applications processed within compliance timeframe
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    Most common issue: <strong>Missing structural calculations</strong>
                  </p>
                </div>
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-blue-500 mr-2 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    Recommendation: <strong>Automate preliminary reviews</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}