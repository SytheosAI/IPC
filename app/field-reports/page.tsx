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
  Activity,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { db, subscriptions } from '@/lib/supabase-client'

interface FieldReport {
  id: string
  report_number: string
  project_id?: string
  project_name: string
  project_address: string
  report_type: 'Safety' | 'Progress' | 'Quality' | 'Incident' | 'Daily' | 'Weekly' | 'Inspection'
  report_date: string
  report_time?: string
  reported_by: string
  reporter_id?: string
  status: 'draft' | 'submitted'
  priority: 'low' | 'medium' | 'high' | 'critical'
  weather_temperature?: number
  weather_conditions?: string
  weather_wind_speed?: number
  signature?: string
  created_at?: string
  updated_at?: string
  // Related data (loaded separately)
  work_completed?: any[]
  issues?: any[]
  safety_observations?: any[]
  personnel?: any[]
  photos?: any[]
}

interface NotificationEmail {
  id: string
  email: string
  name?: string
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
  const [notificationEmails, setNotificationEmails] = useState<NotificationEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFieldReports()
    loadNotificationEmails()
    
    // Subscribe to real-time updates
    const channel = subscriptions.subscribeToFieldReports(() => {
      loadFieldReports()
    })
    
    return () => {
      channel.unsubscribe()
    }
  }, [])

  const loadFieldReports = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await db.fieldReports.getAll()
      setReports(data)
    } catch (err) {
      console.error('Error loading field reports:', err)
      setError('Failed to load field reports')
    } finally {
      setLoading(false)
    }
  }

  const loadNotificationEmails = async () => {
    try {
      const emails = await db.notificationEmails.getAll()
      setNotificationEmails(emails.filter(e => 
        e.notification_type === 'field_reports' || e.notification_type === 'all'
      ))
    } catch (err) {
      console.error('Error loading notification emails:', err)
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.project_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.report_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reported_by.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = filterType === 'all' || report.report_type === filterType
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus
    const matchesPriority = filterPriority === 'all' || report.priority === filterPriority
    
    let matchesDate = true
    if (dateRange.start && dateRange.end) {
      const reportDate = new Date(report.report_date)
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'low':
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
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
        return <Eye className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Safety':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Quality':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Incident':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Inspection':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleNewReport = async (reportData: Partial<FieldReport>) => {
    try {
      const newReport = await db.fieldReports.create({
        report_number: `FR-${Date.now()}`,
        project_name: reportData.project_name || '',
        project_address: reportData.project_address || '',
        report_type: reportData.report_type || 'Daily',
        report_date: new Date().toISOString().split('T')[0],
        report_time: new Date().toTimeString().split(' ')[0],
        reported_by: reportData.reported_by || 'Current User',
        status: 'draft',
        priority: reportData.priority || 'medium'
      })
      
      await loadFieldReports()
      setShowNewReportModal(false)
      
      // Log activity
      await db.activityLogs.create(
        'Created field report',
        'field_report',
        newReport.id,
        { report_number: newReport.report_number }
      )
    } catch (err) {
      console.error('Error creating field report:', err)
      alert('Failed to create field report')
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      try {
        await db.fieldReports.delete(reportId)
        await loadFieldReports()
        
        // Log activity
        await db.activityLogs.create(
          'Deleted field report',
          'field_report',
          reportId
        )
      } catch (err) {
        console.error('Error deleting field report:', err)
        alert('Failed to delete field report')
      }
    }
  }

  const handleSubmitReport = async (reportId: string) => {
    try {
      await db.fieldReports.update(reportId, { status: 'submitted' })
      await loadFieldReports()
      
      // Send notifications
      if (notificationEmails.length > 0) {
        console.log('Sending notifications to:', notificationEmails.map(e => e.email))
      }
      
      // Log activity
      await db.activityLogs.create(
        'Submitted field report',
        'field_report',
        reportId
      )
    } catch (err) {
      console.error('Error submitting field report:', err)
      alert('Failed to submit field report')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 border-gradient">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Field Reports</h1>
            </div>
            <button
              onClick={() => setShowNewReportModal(true)}
              className="btn-primary absolute right-6"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Report
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-6">
        <div className="glass-morphism rounded-xl p-4 mb-6 border-animated">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  className="input-modern pl-10"
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
              <option value="Safety">Safety</option>
              <option value="Progress">Progress</option>
              <option value="Quality">Quality</option>
              <option value="Incident">Incident</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Inspection">Inspection</option>
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
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Date Range Filter */}
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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-sky-500" />
            <span className="ml-2 text-gray-600">Loading field reports...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
              <button 
                onClick={loadFieldReports}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Reports Grid/List */}
        {!loading && (
          <div className="grid gap-4">
            {filteredReports.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Field Reports Found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || filterType !== 'all' || filterStatus !== 'all' || filterPriority !== 'all'
                    ? 'Try adjusting your filters or search query'
                    : 'Get started by creating your first field report'}
                </p>
                <button
                  onClick={() => setShowNewReportModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Field Report
                </button>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(report.report_type)}`}>
                          {getTypeIcon(report.report_type)}
                          <span className="ml-2">{report.report_type}</span>
                        </span>
                        <span className="text-sm text-gray-500">#{report.report_number}</span>
                        {getStatusIcon(report.status)}
                        {getPriorityIcon(report.priority)}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.project_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {report.project_address}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(report.report_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {report.reported_by}
                        </span>
                      </div>

                      {/* Quick Stats */}
                      <div className="flex items-center gap-6 text-sm">
                        {report.weather_conditions && (
                          <span className="text-gray-600">
                            Weather: {report.weather_conditions} {report.weather_temperature}°F
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/field-reports/${report.id}`)}
                        className="p-2 text-gray-600 hover:text-sky-600 transition-colors"
                        title="View Report"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {report.status === 'draft' && (
                        <>
                          <button
                            onClick={() => router.push(`/field-reports/${report.id}/edit`)}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Edit Report"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleSubmitReport(report.id)}
                            className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                            title="Submit Report"
                          >
                            <Send className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* New Report Modal */}
      {showNewReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Field Report</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleNewReport({
                  project_name: formData.get('project_name') as string,
                  project_address: formData.get('project_address') as string,
                  report_type: formData.get('report_type') as FieldReport['report_type'],
                  priority: formData.get('priority') as FieldReport['priority'],
                  reported_by: formData.get('reported_by') as string
                })
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    name="project_name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Address</label>
                  <input
                    type="text"
                    name="project_address"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                  <select
                    name="report_type"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Safety">Safety</option>
                    <option value="Progress">Progress</option>
                    <option value="Quality">Quality</option>
                    <option value="Incident">Incident</option>
                    <option value="Inspection">Inspection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label>
                  <input
                    type="text"
                    name="reported_by"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewReportModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  Create Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}