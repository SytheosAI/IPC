'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from './hooks/useSupabase'
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
import { db } from '@/lib/supabase-client'
import PageTitle from '@/components/PageTitle'

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

interface ActivityItem {
  id: string
  type: 'application_added' | 'application_status' | 'application_closed' | 
        'project_added' | 'project_closed' | 'vba_added' | 
        'inspection_scheduled' | 'inspection_completed' | 
        'field_report' | 'contact_added' | 'message_received'
  action: string
  project?: string
  jurisdiction?: string
  timestamp: string
  user?: string
  details?: string
  icon?: string
  color?: string
}

export default function DashboardPage() {
  const { client, loading: supabaseLoading, execute } = useSupabase()
  const [searchQuery, setSearchQuery] = useState('')
  const [recentProjects, setRecentProjects] = useState<ProjectSummary[]>([])
  const [stats, setStats] = useState<DashboardStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterProject, setFilterProject] = useState('all')
  const [filterJurisdiction, setFilterJurisdiction] = useState('all')
  const [activities, setActivities] = useState<ActivityItem[]>([])

  useEffect(() => {
    if (!client || supabaseLoading) return
    
    loadDashboardData()
    
    // Enterprise: Set up real-time subscription with proper Supabase client
    const subscription = client
      .channel('dashboard-projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        loadDashboardData()
      })
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [client, supabaseLoading])

  const loadDashboardData = async () => {
    if (!client || supabaseLoading) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Enterprise: Load projects with proper Supabase client
      const projects = await execute(async (supabase) => {
        const { data, error } = await supabase.from('projects').select('*').limit(10)
        if (error) throw error
        return data || []
      })
      
      setRecentProjects(projects)
      
      // Load real activity data from database (empty for now since no activity tracking yet)
      setActivities([])

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
  
  const filteredActivities = activities.filter(activity => {
    const matchesProject = filterProject === 'all' || 
      activity.project?.toLowerCase().includes(filterProject.toLowerCase())
    const matchesJurisdiction = filterJurisdiction === 'all' || 
      activity.jurisdiction?.toLowerCase().replace(/\s+/g, '_') === filterJurisdiction
    return matchesProject && matchesJurisdiction
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-6 pb-6">
      {/* Header */}
      <div className="mb-2 flex justify-center items-center relative">
        <PageTitle 
          title="Intelligent Plan Check Dashboard"
        />
        <button 
          onClick={loadDashboardData}
          className="absolute right-0 p-2 text-gray-600 hover:text-sky-600 transition-colors"
          title="Refresh data"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="mb-6">
        <div className="card-modern hover-lift p-4">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 text-yellow-400 mr-2 shadow-glow" />
            <span className="text-sm text-yellow-200">
              <strong className="text-yellow-400">AI-Powered Analysis:</strong> Automatically reviewing plans for compliance and generating smart recommendations
            </span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="spinner-modern"></div>
          <span className="ml-2 text-yellow-400">Loading dashboard data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card-modern bg-gradient-to-r from-red-900/20 to-red-800/20 border-red-500/30 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              const colorClasses = getStatColorClasses(stat.color)
              
              return (
                <div 
                  key={index} 
                  className="card-modern hover-lift p-6 shadow-glow"
                >
                  {/* Modern Gradient Background */}
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-white/30"></div>
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-current to-transparent opacity-10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gradient-to-tr from-current to-transparent opacity-10 rounded-full blur-2xl"></div>
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle at 20% 50%, currentColor 0%, transparent 50%),
                                       radial-gradient(circle at 80% 80%, currentColor 0%, transparent 50%),
                                       radial-gradient(circle at 40% 20%, currentColor 0%, transparent 50%)`,
                      opacity: 0.03
                    }}></div>
                  </div>
                  
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex-shrink-0">
                      <Icon className="h-10 w-10 text-yellow-400" />
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
                      <p className="text-sm font-medium text-yellow-400">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1 text-gray-100">{stat.value}</p>
                      {stat.description && (
                        <p className="text-xs text-gray-400 mt-2">{stat.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Recent Activity Table */}
          <div className="card-modern hover-lift overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-700/50">
              <div className="flex items-center justify-center relative">
                <h2 className="text-lg font-semibold text-yellow-400">Recent Activity</h2>
                <div className="absolute right-0 flex gap-3">
                  <select
                    className="input-modern w-32"
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                  >
                    <option value="all">Projects</option>
                    <option value="commercial">Commercial</option>
                    <option value="residential">Residential</option>
                    <option value="industrial">Industrial</option>
                  </select>
                  <select
                    className="input-modern w-36"
                    value={filterJurisdiction}
                    onChange={(e) => setFilterJurisdiction(e.target.value)}
                  >
                    <option value="all">Jurisdictions</option>
                    <option value="fort_myers">Fort Myers</option>
                    <option value="cape_coral">Cape Coral</option>
                    <option value="naples">Naples</option>
                    <option value="lee_county">Lee County</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table-modern w-full">
                <thead>
                  <tr className="border-b border-gray-700/50">
                    <th className="px-4 py-3 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jurisdiction
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                        No recent activity
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-gray-800/30 transition-all duration-200">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                          {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3">
                          <div className={`text-sm font-medium ${activity.color || 'text-gray-300'}`}>
                            {activity.action}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-100">
                          {activity.project || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {activity.jurisdiction?.replace(/_/g, ' ') || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {activity.user || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {activity.details || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Active Permits Summary */}
            <div className="card-modern hover-lift p-6">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">Active Permits</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Commercial</span>
                  <span className="text-sm font-semibold text-gray-100">
                    {recentProjects.filter(p => p.project_name.toLowerCase().includes('commercial')).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Residential</span>
                  <span className="text-sm font-semibold text-gray-100">
                    {recentProjects.filter(p => p.project_name.toLowerCase().includes('residential')).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Industrial</span>
                  <span className="text-sm font-semibold text-gray-100">
                    {recentProjects.filter(p => p.project_name.toLowerCase().includes('industrial')).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card-modern hover-lift p-6">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="btn-glass w-full justify-start mb-2">
                  Create New Application
                </button>
                <button className="btn-glass w-full justify-start mb-2">
                  Review Pending
                </button>
                <button className="btn-glass w-full justify-start">
                  Generate Reports
                </button>
              </div>
            </div>

            {/* AI Analysis Insights */}
            <div className="card-modern hover-lift p-6 bg-gradient-to-br from-yellow-400/10 via-yellow-500/5 to-yellow-600/10">
              <div className="flex items-center mb-4">
                <Brain className="h-6 w-6 text-yellow-400 mr-2 shadow-glow" />
                <h3 className="text-lg font-semibold text-yellow-400">AI Insights</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Zap className="h-4 w-4 text-yellow-500 mr-2 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-300">
                    <strong className="text-yellow-400">90%</strong> of applications processed within compliance timeframe
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-300">
                    Most common issue: <strong className="text-yellow-400">Missing structural calculations</strong>
                  </p>
                </div>
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-blue-500 mr-2 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-300">
                    Recommendation: <strong className="text-yellow-400">Automate preliminary reviews</strong>
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