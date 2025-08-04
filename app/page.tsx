'use client'

import { useState } from 'react'
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
  Zap
} from 'lucide-react'

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
  permitNumber: string
  projectName: string
  address: string
  applicant: string
  status: 'intake' | 'in_review' | 'approved' | 'rejected' | 'issued'
  submittedDate: string
  lastUpdated: string
  totalIssues: number
  totalConditions: number
  totalNotes: number
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats: DashboardStat[] = [
    {
      label: 'Total Applications',
      value: 3,
      icon: FileText,
      color: 'blue',
      description: 'Active permits in system'
    },
    {
      label: 'Pending Review',
      value: 1,
      icon: Clock,
      color: 'yellow',
      description: 'Awaiting review'
    },
    {
      label: 'Approved',
      value: 1,
      icon: CheckCircle,
      color: 'green',
      description: 'This month'
    },
    {
      label: 'Avg. Processing',
      value: '7 days',
      icon: TrendingUp,
      color: 'purple',
      trend: 'down',
      trendValue: '-2 days'
    }
  ]

  const recentProjects: ProjectSummary[] = [
    {
      permitNumber: 'PER-2024-0156',
      projectName: 'Medical Office Building',
      address: '1234 Healthcare Blvd',
      applicant: 'Healthcare Properties LLC',
      status: 'in_review',
      submittedDate: '2024-01-14',
      lastUpdated: '2024-01-18',
      totalIssues: 3,
      totalConditions: 1,
      totalNotes: 1
    },
    {
      permitNumber: 'PER-2024-0157',
      projectName: 'Residential Addition',
      address: '567 Oak Street',
      applicant: 'Johnson Family Trust',
      status: 'intake',
      submittedDate: '2024-01-17',
      lastUpdated: '2024-01-17',
      totalIssues: 0,
      totalConditions: 0,
      totalNotes: 0
    },
    {
      permitNumber: 'PER-2024-0155',
      projectName: 'Retail Plaza Renovation',
      address: '890 Commerce Way',
      applicant: 'Plaza Holdings Inc',
      status: 'approved',
      submittedDate: '2024-01-10',
      lastUpdated: '2024-01-16',
      totalIssues: 0,
      totalConditions: 3,
      totalNotes: 3
    }
  ]

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
    project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.permitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.applicant.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of permit applications and inspection activities</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="ai-badge">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Insights Available
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const colorClasses = getStatColorClasses(stat.color)
          
          return (
            <div key={index} className="relative group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300" 
                style={{
                  backgroundImage: stat.color === 'blue' ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' :
                                  stat.color === 'green' ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' :
                                  stat.color === 'yellow' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                                  stat.color === 'red' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
                                  'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'
                }}
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg shadow-sm ${
                    stat.color === 'blue' ? 'bg-sky-100' :
                    stat.color === 'green' ? 'bg-green-100' :
                    stat.color === 'yellow' ? 'bg-yellow-100' :
                    stat.color === 'red' ? 'bg-red-100' :
                    'bg-purple-100'
                  }`}>
                    <Icon className={`h-8 w-8 ${
                      stat.color === 'blue' ? 'text-sky-600' :
                      stat.color === 'green' ? 'text-green-600' :
                      stat.color === 'yellow' ? 'text-yellow-600' :
                      stat.color === 'red' ? 'text-red-600' :
                      'text-purple-600'
                    }`} />
                  </div>
                  {stat.trend && (
                    <div className={`text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-full ${
                      stat.trend === 'up' ? 'bg-green-100 text-green-600' : 
                      stat.trend === 'down' ? 'bg-red-100 text-red-600' : 
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {stat.trendValue}
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
              {filteredProjects.map((project) => (
                <tr key={project.permitNumber} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{project.permitNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{project.projectName}</div>
                      <div className="text-sm text-gray-500">{project.address}</div>
                      <div className="text-xs text-gray-400 mt-1">{project.applicant}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(project.status)}`}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-3 text-sm">
                      <span className="text-red-600 font-medium">{project.totalIssues}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-yellow-600 font-medium">{project.totalConditions}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-blue-600 font-medium">{project.totalNotes}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(project.submittedDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
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
              <span className="text-sm font-medium text-gray-900">2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Residential</span>
              <span className="text-sm font-medium text-gray-900">1</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Industrial</span>
              <span className="text-sm font-medium text-gray-900">0</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Total Active</span>
              <span className="text-lg font-bold text-sky-600">3</span>
            </div>
          </div>
        </div>

        {/* VBA Inspections */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 card-hover">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">VBA Inspections</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Scheduled Today</span>
              <span className="text-sm font-medium text-gray-900">5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="text-sm font-medium text-gray-900">2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-sm font-medium text-gray-900">8</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Compliance Rate</span>
              <span className="text-lg font-bold text-green-600">94%</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 card-hover">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Review Progress</span>
                <span className="text-sm font-medium text-gray-900">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-sky-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">On-Time Rate</span>
                <span className="text-sm font-medium text-gray-900">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">AI-Powered Insights</h3>
              <p className="text-white/80 text-sm">Intelligent recommendations based on your permit data</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Generate Report
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trend Analysis
            </h4>
            <p className="text-sm text-white/90">Permit approvals are 23% faster this month compared to last month</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Risk Detection
            </h4>
            <p className="text-sm text-white/90">2 permits require immediate attention due to missing documentation</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Optimization
            </h4>
            <p className="text-sm text-white/90">Automating document validation could save 4 hours per week</p>
          </div>
        </div>
      </div>
    </div>
  )
}