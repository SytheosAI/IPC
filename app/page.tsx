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
  Search
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of permit applications and inspection activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const colorClasses = getStatColorClasses(stat.color)
          
          return (
            <div key={index} className={`bg-white rounded-lg p-6 border-2 ${colorClasses}`}>
              <div className="flex items-start justify-between mb-4">
                <Icon className="h-8 w-8" />
                {stat.trend && (
                  <div className={`text-xs font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 
                    stat.trend === 'down' ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {stat.trendValue}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium opacity-80">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                {stat.description && (
                  <p className="text-xs opacity-60 mt-1">{stat.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
    </div>
  )
}