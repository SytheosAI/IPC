'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Building,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Shield
} from 'lucide-react'

interface PermitApplication {
  id: string
  permitNumber: string
  projectName: string
  applicant: string
  type: string
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'issued'
  submittedDate: string
  lastUpdated: string
  assignedTo?: string
  progress: number
}

interface DashboardStats {
  totalApplications: number
  pending: number
  approved: number
  inReview: number
  avgProcessingTime: number
  complianceRate: number
}

export default function DashboardPage() {
  const [applications, setApplications] = useState<PermitApplication[]>([
    {
      id: '1',
      permitNumber: 'PER-2024-0156',
      projectName: 'Medical Office Building',
      applicant: 'Healthcare Properties LLC',
      type: 'Commercial New Construction',
      status: 'in_review',
      submittedDate: '2024-01-15',
      lastUpdated: '2024-01-18',
      assignedTo: 'John Smith',
      progress: 65
    },
    {
      id: '2',
      permitNumber: 'PER-2024-0157',
      projectName: 'Residential Addition',
      applicant: 'Johnson Family Trust',
      type: 'Residential Addition',
      status: 'submitted',
      submittedDate: '2024-01-18',
      lastUpdated: '2024-01-18',
      progress: 25
    },
    {
      id: '3',
      permitNumber: 'PER-2024-0155',
      projectName: 'Retail Store Renovation',
      applicant: 'ABC Retail Corp',
      type: 'Commercial Alteration',
      status: 'approved',
      submittedDate: '2024-01-10',
      lastUpdated: '2024-01-17',
      assignedTo: 'Sarah Davis',
      progress: 100
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const stats: DashboardStats = {
    totalApplications: applications.length,
    pending: applications.filter(a => a.status === 'submitted').length,
    approved: applications.filter(a => a.status === 'approved' || a.status === 'issued').length,
    inReview: applications.filter(a => a.status === 'in_review').length,
    avgProcessingTime: 7,
    complianceRate: 94
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'in_review': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'issued': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />
      case 'submitted': return <Clock className="h-4 w-4" />
      case 'in_review': return <AlertCircle className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <AlertCircle className="h-4 w-4" />
      case 'issued': return <Shield className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.permitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.applicant.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of permit applications and inspection activities</p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
              <div className="bg-indigo-100 rounded-full p-3">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Processing</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgProcessingTime} days</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-10 w-10 text-white/80" />
              <span className="text-3xl font-bold">{stats.totalApplications}</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Active Permits</h3>
            <p className="text-indigo-100 text-sm">Total permit applications in system</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-10 w-10 text-white/80" />
              <span className="text-3xl font-bold">12</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Active Inspections</h3>
            <p className="text-yellow-100 text-sm">Ongoing VBA inspections today</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-10 w-10 text-white/80" />
              <span className="text-3xl font-bold">{stats.complianceRate}%</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Compliance Rate</h3>
            <p className="text-green-100 text-sm">Overall inspection pass rate</p>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="in_review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="issued">Issued</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permit Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {application.permitNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.projectName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.applicant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        {application.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${application.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{application.progress}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.submittedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/permits/${application.id}`} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center">
                        View
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}