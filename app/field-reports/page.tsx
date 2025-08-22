'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  User,
  Camera,
  FileText,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Eye,
  Send,
  MoreVertical,
  Upload,
  Building,
  Wrench,
  Shield,
  Activity
} from 'lucide-react'

interface FieldReport {
  id: string
  reportNumber: string
  projectName: string
  projectAddress: string
  reportType: 'Safety' | 'Progress' | 'Quality' | 'Incident' | 'Daily' | 'Weekly' | 'Inspection'
  date: string
  time: string
  reportedBy: string
  status: 'draft' | 'submitted'
  priority: 'low' | 'medium' | 'high' | 'critical'
  notificationEmails?: string[]
  weather?: {
    temperature: number
    conditions: string
    windSpeed?: number
  }
  workCompleted?: string[]
  issues?: {
    id: string
    description: string
    severity: 'minor' | 'major' | 'critical'
    resolved: boolean
  }[]
  photos?: {
    id: string
    url: string
    data?: string // Base64 encoded image data
    caption: string
    timestamp: string
    category?: 'before' | 'during' | 'after' | 'issue' | 'safety' | 'general'
  }[]
  personnel?: {
    name: string
    role: string
    hours: number
  }[]
  equipment?: {
    name: string
    status: 'operational' | 'maintenance' | 'broken'
    hours?: number
  }[]
  safetyObservations?: string[]
  nextSteps?: string[]
  signature?: string
  attachments?: {
    id: string
    name: string
    type: string
    size: number
    url: string
  }[]
}

export default function FieldReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<FieldReport[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [selectedReport, setSelectedReport] = useState<FieldReport | null>(null)
  const [showNewReportModal, setShowNewReportModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  const [notificationEmails, setNotificationEmails] = useState<string[]>([])

  useEffect(() => {
    loadFieldReports()
    // Load notification emails from localStorage
    if (typeof window !== 'undefined') {
      const savedEmails = localStorage.getItem('field-report-emails') || ''
      if (savedEmails) {
        setNotificationEmails(savedEmails.split(',').filter(e => e.trim()))
      }
    }
  }, [])

  const loadFieldReports = () => {
    const savedReports = localStorage.getItem('field-reports')
    if (savedReports) {
      setReports(JSON.parse(savedReports))
    } else {
      // Start with empty data
      setReports([])
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.projectAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedBy.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = filterType === 'all' || report.reportType === filterType
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus
    const matchesPriority = filterPriority === 'all' || report.priority === filterPriority
    
    let matchesDate = true
    if (dateRange.start && dateRange.end) {
      const reportDate = new Date(report.date)
      const startDate = new Date(dateRange.start)
      const endDate = new Date(dateRange.end)
      matchesDate = reportDate >= startDate && reportDate <= endDate
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesDate
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'draft':
        return <Edit className="h-4 w-4 text-gray-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700'
      case 'high':
        return 'bg-orange-100 text-orange-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'low':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'Safety':
        return <Shield className="h-5 w-5" />
      case 'Progress':
        return <Activity className="h-5 w-5" />
      case 'Quality':
        return <CheckCircle className="h-5 w-5" />
      case 'Incident':
        return <AlertTriangle className="h-5 w-5" />
      case 'Inspection':
        return <Search className="h-5 w-5" />
      case 'Daily':
      case 'Weekly':
        return <Calendar className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const handleDeleteReport = (reportId: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      const updatedReports = reports.filter(r => r.id !== reportId)
      setReports(updatedReports)
      localStorage.setItem('field-reports', JSON.stringify(updatedReports))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-semibold text-gray-900">Field Reports</h1>
            </div>
            <button
              onClick={() => setShowNewReportModal(true)}
              className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors absolute right-6"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Report
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Type Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Inspection">Inspection</option>
              <option value="Safety">Safety</option>
              <option value="Progress">Progress</option>
              <option value="Quality">Quality</option>
              <option value="Incident">Incident</option>
            </select>

            {/* Status Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
            </select>

            {/* Priority Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Email Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-sky-600" />
              <h3 className="text-sm font-medium text-gray-900">Report Notification Recipients</h3>
            </div>
            <button
              onClick={() => {
                const newEmail = prompt('Add email address:', '')
                if (newEmail && newEmail.includes('@')) {
                  const updatedEmails = [...notificationEmails, newEmail]
                  setNotificationEmails(updatedEmails)
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('field-report-emails', updatedEmails.join(','))
                  }
                }
              }}
              className="text-sky-600 hover:text-sky-700 text-sm font-medium"
            >
              + Add Email
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {notificationEmails.map((email, index) => (
              <div key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-sm">
                <span>{email}</span>
                <button
                  onClick={() => {
                    const updatedEmails = notificationEmails.filter((_, i) => i !== index)
                    setNotificationEmails(updatedEmails)
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('field-report-emails', updatedEmails.join(','))
                    }
                  }}
                  className="ml-1 hover:text-sky-900"
                >
                  <XCircle className="h-3 w-3" />
                </button>
              </div>
            ))}
            {notificationEmails.length === 0 && (
              <p className="text-sm text-gray-500">No notification recipients configured. Click &quot;+ Add Email&quot; to add recipients.</p>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            These email addresses will receive notifications when new field reports are submitted.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-end mb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-sky-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-sky-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Grid View
            </button>
          </div>
        </div>

        {/* Reports List/Grid */}
        {viewMode === 'list' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Report #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Reporter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {report.reportNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.projectName}</div>
                          <div className="text-xs text-gray-500">{report.projectAddress}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getReportTypeIcon(report.reportType)}
                          <span className="text-sm text-gray-900">{report.reportType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(report.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.reportedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {getStatusIcon(report.status)}
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                          {report.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="text-sky-600 hover:text-sky-800"
                            title="View Report"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-800"
                            title="Edit Report"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-800"
                            title="Download Report"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Report"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getReportTypeIcon(report.reportType)}
                    <span className="text-sm font-medium text-gray-900">{report.reportType}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                    {report.priority}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.reportNumber}</h3>
                <p className="text-sm font-medium text-gray-900">{report.projectName}</p>
                <p className="text-xs text-gray-500 mb-3">{report.projectAddress}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(report.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {report.reportedBy}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {getStatusIcon(report.status)}
                    {report.status}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-sky-600 hover:text-sky-800"
                      title="View Report"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="text-gray-600 hover:text-gray-800"
                      title="Download Report"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{selectedReport.reportNumber}</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedReport.projectName}</p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Report Details */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Report Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedReport.reportType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(selectedReport.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Time:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedReport.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Reporter:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedReport.reportedBy}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Status & Priority</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReport.status)}`}>
                        {getStatusIcon(selectedReport.status)}
                        {selectedReport.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Priority:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedReport.priority)}`}>
                        {selectedReport.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Weather */}
              {selectedReport.weather && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Weather Conditions</h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">Temperature: {selectedReport.weather.temperature}°F</span>
                      <span className="text-sm text-gray-600">Conditions: {selectedReport.weather.conditions}</span>
                      {selectedReport.weather.windSpeed && (
                        <span className="text-sm text-gray-600">Wind: {selectedReport.weather.windSpeed} mph</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Work Completed */}
              {selectedReport.workCompleted && selectedReport.workCompleted.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Work Completed</h3>
                  <ul className="space-y-1">
                    {selectedReport.workCompleted.map((work, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{work}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Issues */}
              {selectedReport.issues && selectedReport.issues.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Issues Identified</h3>
                  <div className="space-y-2">
                    {selectedReport.issues.map((issue) => (
                      <div key={issue.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                              issue.severity === 'critical' ? 'text-red-500' :
                              issue.severity === 'major' ? 'text-orange-500' :
                              'text-yellow-500'
                            }`} />
                            <div>
                              <p className="text-sm text-gray-900">{issue.description}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className={`text-xs font-medium ${
                                  issue.severity === 'critical' ? 'text-red-600' :
                                  issue.severity === 'major' ? 'text-orange-600' :
                                  'text-yellow-600'
                                }`}>
                                  {issue.severity}
                                </span>
                                <span className={`text-xs ${issue.resolved ? 'text-green-600' : 'text-gray-600'}`}>
                                  {issue.resolved ? 'Resolved' : 'Pending'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Personnel */}
              {selectedReport.personnel && selectedReport.personnel.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Personnel on Site</h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="grid grid-cols-3 gap-4">
                      {selectedReport.personnel.map((person, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium text-gray-900">{person.name}</span>
                          <div className="text-xs text-gray-600">{person.role} - {person.hours} hours</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Safety Observations */}
              {selectedReport.safetyObservations && selectedReport.safetyObservations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Safety Observations</h3>
                  <ul className="space-y-1">
                    {selectedReport.safetyObservations.map((observation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{observation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Photos Section */}
              {selectedReport.photos && selectedReport.photos.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Photos & Documentation</h3>
                  
                  {/* Photo Categories */}
                  <div className="space-y-6">
                    {['before', 'during', 'after', 'issue', 'safety', 'general'].map((category) => {
                      const categoryPhotos = selectedReport.photos?.filter(p => (p.category || 'general') === category)
                      if (!categoryPhotos || categoryPhotos.length === 0) return null
                      
                      return (
                        <div key={category} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-800 mb-3 capitalize">
                            {category === 'general' ? 'General Documentation' : `${category} Photos`}
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            {categoryPhotos.map((photo) => (
                              <div key={photo.id} className="space-y-2">
                                <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '300px' }}>
                                  {photo.data ? (
                                    <img
                                      src={photo.data}
                                      alt={photo.caption || 'Field photo'}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                      <Camera className="h-12 w-12" />
                                    </div>
                                  )}
                                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                                    <p className="text-xs">{new Date(photo.timestamp).toLocaleString()}</p>
                                  </div>
                                </div>
                                {photo.caption && (
                                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{photo.caption}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Print Layout Notice */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <strong>Note:</strong> When downloading or printing this report, photos will be automatically formatted 
                      to fit properly on standard letter-size pages with appropriate margins and captions.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Edit className="h-4 w-4 inline mr-2" />
                  Edit
                </button>
                <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="h-4 w-4 inline mr-2" />
                  Download PDF
                </button>
                <button 
                  onClick={() => {
                    if (notificationEmails.length > 0) {
                      alert(`Report will be sent to: ${notificationEmails.join(', ')}`)
                      // In a real app, this would trigger an API call to send emails
                    } else {
                      alert('Please configure notification recipients first')
                    }
                  }}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                >
                  <Send className="h-4 w-4 inline mr-2" />
                  Send Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Report Modal */}
      {showNewReportModal && (
        <NewFieldReportModal
          onClose={() => setShowNewReportModal(false)}
          onSave={(newReport) => {
            const updatedReports = [newReport, ...reports]
            setReports(updatedReports)
            localStorage.setItem('field-reports', JSON.stringify(updatedReports))
            setShowNewReportModal(false)
          }}
        />
      )}
    </div>
  )
}

// New Field Report Modal Component
function NewFieldReportModal({ onClose, onSave }: { onClose: () => void; onSave: (report: FieldReport) => void }) {
  const [reportData, setReportData] = useState({
    projectName: '',
    projectAddress: '',
    reportType: 'Daily' as FieldReport['reportType'],
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    reportedBy: '',
    priority: 'medium' as FieldReport['priority'],
    weather: {
      temperature: 75,
      conditions: 'Clear',
      windSpeed: 5
    },
    workCompleted: [''],
    safetyObservations: [''],
    photos: [] as Array<{
      id: string
      url: string
      data?: string
      caption: string
      timestamp: string
      category: 'before' | 'during' | 'after' | 'issue' | 'safety' | 'general'
    }>
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newReport: FieldReport = {
      id: Date.now().toString(),
      reportNumber: `FR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      projectName: reportData.projectName,
      projectAddress: reportData.projectAddress,
      reportType: reportData.reportType,
      date: reportData.date,
      time: reportData.time,
      reportedBy: reportData.reportedBy,
      status: 'draft',
      priority: reportData.priority,
      weather: reportData.weather,
      workCompleted: reportData.workCompleted.filter(w => w.trim() !== ''),
      safetyObservations: reportData.safetyObservations.filter(s => s.trim() !== ''),
      photos: reportData.photos
    }
    
    // Get notification emails
    const emails = localStorage.getItem('field-report-emails') || ''
    if (emails) {
      newReport.notificationEmails = emails.split(',').filter(e => e.trim())
      // In a real app, this would trigger email notifications
      console.log('Sending notifications to:', newReport.notificationEmails)
    }
    
    onSave(newReport)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, category: 'before' | 'during' | 'after' | 'issue' | 'safety' | 'general') => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const newPhoto = {
          id: Date.now().toString() + Math.random().toString(36),
          url: file.name,
          data: event.target?.result as string,
          caption: '',
          timestamp: new Date().toISOString(),
          category
        }
        setReportData(prev => ({
          ...prev,
          photos: [...prev.photos, newPhoto]
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (photoId: string) => {
    setReportData(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== photoId)
    }))
  }

  const updatePhotoCaption = (photoId: string, caption: string) => {
    setReportData(prev => ({
      ...prev,
      photos: prev.photos.map(p => p.id === photoId ? { ...p, caption } : p)
    }))
  }

  const addWorkItem = () => {
    setReportData({
      ...reportData,
      workCompleted: [...reportData.workCompleted, '']
    })
  }

  const updateWorkItem = (index: number, value: string) => {
    const updated = [...reportData.workCompleted]
    updated[index] = value
    setReportData({ ...reportData, workCompleted: updated })
  }

  const addSafetyObservation = () => {
    setReportData({
      ...reportData,
      safetyObservations: [...reportData.safetyObservations, '']
    })
  }

  const updateSafetyObservation = (index: number, value: string) => {
    const updated = [...reportData.safetyObservations]
    updated[index] = value
    setReportData({ ...reportData, safetyObservations: updated })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">Create New Field Report</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={reportData.projectName}
                onChange={(e) => setReportData({ ...reportData, projectName: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Address *</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={reportData.projectAddress}
                onChange={(e) => setReportData({ ...reportData, projectAddress: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type *</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={reportData.reportType}
                onChange={(e) => setReportData({ ...reportData, reportType: e.target.value as FieldReport['reportType'] })}
                required
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Inspection">Inspection</option>
                <option value="Safety">Safety</option>
                <option value="Progress">Progress</option>
                <option value="Quality">Quality</option>
                <option value="Incident">Incident</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={reportData.priority}
                onChange={(e) => setReportData({ ...reportData, priority: e.target.value as FieldReport['priority'] })}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={reportData.date}
                onChange={(e) => setReportData({ ...reportData, date: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={reportData.time}
                onChange={(e) => setReportData({ ...reportData, time: e.target.value })}
                required
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reported By *</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={reportData.reportedBy}
                onChange={(e) => setReportData({ ...reportData, reportedBy: e.target.value })}
                required
              />
            </div>
          </div>
          
          {/* Weather Conditions */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Weather Conditions</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Temperature (°F)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={reportData.weather.temperature}
                  onChange={(e) => setReportData({
                    ...reportData,
                    weather: { ...reportData.weather, temperature: parseInt(e.target.value) }
                  })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Conditions</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={reportData.weather.conditions}
                  onChange={(e) => setReportData({
                    ...reportData,
                    weather: { ...reportData.weather, conditions: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Wind Speed (mph)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={reportData.weather.windSpeed}
                  onChange={(e) => setReportData({
                    ...reportData,
                    weather: { ...reportData.weather, windSpeed: parseInt(e.target.value) }
                  })}
                />
              </div>
            </div>
          </div>
          
          {/* Work Completed */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Work Completed</h4>
              <button
                type="button"
                onClick={addWorkItem}
                className="text-sky-600 hover:text-sky-700 text-sm"
              >
                + Add Item
              </button>
            </div>
            {reportData.workCompleted.map((item, index) => (
              <input
                key={index}
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 mb-2"
                placeholder="Describe work completed..."
                value={item}
                onChange={(e) => updateWorkItem(index, e.target.value)}
              />
            ))}
          </div>
          
          {/* Safety Observations */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Safety Observations</h4>
              <button
                type="button"
                onClick={addSafetyObservation}
                className="text-sky-600 hover:text-sky-700 text-sm"
              >
                + Add Observation
              </button>
            </div>
            {reportData.safetyObservations.map((item, index) => (
              <input
                key={index}
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 mb-2"
                placeholder="Enter safety observation..."
                value={item}
                onChange={(e) => updateSafetyObservation(index, e.target.value)}
              />
            ))}
          </div>
          
          {/* Photo Upload Section */}
          <div className="mb-6 border-t pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Photos & Documentation</h4>
            
            {/* Photo Upload Categories */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {[
                { category: 'before' as const, label: 'Before', icon: Camera },
                { category: 'during' as const, label: 'During', icon: Camera },
                { category: 'after' as const, label: 'After', icon: Camera },
                { category: 'issue' as const, label: 'Issues', icon: AlertTriangle },
                { category: 'safety' as const, label: 'Safety', icon: Shield },
                { category: 'general' as const, label: 'General', icon: FileText }
              ].map(({ category, label, icon: Icon }) => (
                <div key={category}>
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-sky-500 transition-colors text-center">
                      <Icon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                      <p className="text-xs text-gray-500 mt-1">Click to upload</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, category)}
                    />
                  </label>
                </div>
              ))}
            </div>
            
            {/* Uploaded Photos Preview */}
            {reportData.photos.length > 0 && (
              <div className="space-y-4">
                <h5 className="text-sm font-medium text-gray-700">Uploaded Photos ({reportData.photos.length})</h5>
                <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                  {reportData.photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '200px' }}>
                        <img
                          src={photo.data}
                          alt={photo.caption || 'Uploaded photo'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Add caption..."
                          className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                          value={photo.caption}
                          onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                        />
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-12 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        {photo.category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Tip:</strong> Upload photos in appropriate categories for better organization. 
                Photos will be displayed in full size in the report and automatically paginated when printed.
              </p>
            </div>
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
            >
              Create Report
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}