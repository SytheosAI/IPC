'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageTitle from '@/components/PageTitle'
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
  AlertCircle,
  X
} from 'lucide-react'
import { db } from '@/lib/supabase-client'
import { useSupabase } from '../hooks/useSupabase'

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
  // Enhanced fields
  work_performed?: string
  materials_used?: string
  equipment_used?: string
  subcontractors?: string
  visitors?: string
  delays?: string
  safety_incidents?: string
  quality_issues?: string
  // Related data (loaded separately)
  work_completed?: any[]
  issues?: any[]
  safety_observations?: any[]
  personnel?: any[]
  photos?: string[]  // Array of photo URLs
}

interface NotificationEmail {
  id: string
  email: string
  name?: string
}

interface Project {
  id: string
  projectNumber: string
  name: string
  address: string
  city: string
  state: string
}

interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
  role: string
}

export default function FieldReportsPage() {
  const { client, loading: supabaseLoading, execute } = useSupabase()
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
  const [projects, setProjects] = useState<Project[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [selectedReporter, setSelectedReporter] = useState<string>('')
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([])
  const [weatherData, setWeatherData] = useState<{ conditions: string; temperature: number } | null>(null)

  useEffect(() => {
    loadFieldReports()
    loadNotificationEmails()
    loadProjects()
    loadTeamMembers()
    
    // Subscribe to real-time updates
    // Enterprise: No legacy subscription - real-time updates handled elsewhere
    return () => {
      // Cleanup handled by component unmount
    }
  }, [])

  useEffect(() => {
    if (showNewReportModal) {
      fetchWeatherData()
    }
  }, [showNewReportModal])

  const loadFieldReports = async () => {
    try {
      setLoading(true)
      setError(null)
      let data: any[] = []
      
      if (client) {
        try {
          data = await execute(async (supabase) => {
            const { data: reports, error } = await supabase
              .from('field_reports')
              .select('*')
              .order('created_at', { ascending: false })
            
            if (error) throw error
            return reports || []
          })
        } catch (dbError) {
          console.warn('Failed to load field reports from database:', dbError)
          data = []
        }
      }
      
      setReports(data)
      setError(null)
    } catch (err) {
      console.error('Error loading field reports:', err)
      setError('Failed to load field reports')
    } finally {
      setLoading(false)
    }
  }

  const loadNotificationEmails = async () => {
    try {
      // Enterprise: Use empty array until proper Supabase implementation
      const emails: any[] = []
      setNotificationEmails(emails.filter(e => 
        e.notification_type === 'field_reports' || e.notification_type === 'all'
      ))
    } catch (err) {
      console.error('Error loading notification emails:', err)
    }
  }

  const loadProjects = async () => {
    try {
      // Enterprise: Use direct Supabase query instead of legacy db interface
      const projectsData: any[] = []  // Empty for now until proper implementation
      setProjects(projectsData.map(p => ({
        id: p.id,
        projectNumber: p.projectNumber || p.id,
        name: p.name || 'Unnamed Project',
        address: p.address || '',
        city: p.city || '',
        state: p.state || ''
      })))
    } catch (err) {
      console.error('Error loading projects:', err)
      setProjects([])
    }
  }

  const loadTeamMembers = async () => {
    try {
      // TODO: Load from contacts table once it's set up
      // const members = await db.contacts.getAll()
      // setTeamMembers(members)
      
      // For now, set empty array until database is configured
      setTeamMembers([])
    } catch (err) {
      console.error('Error loading team members:', err)
      setTeamMembers([])
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (uploadedPhotos.length + files.length > 6) {
      alert('Maximum 6 photos allowed')
      return
    }
    setUploadedPhotos([...uploadedPhotos, ...files.slice(0, 6 - uploadedPhotos.length)])
  }

  const removePhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index))
  }

  const fetchWeatherData = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
      if (apiKey) {
        // Fort Myers coordinates
        const lat = 26.6406
        const lon = -81.8723
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
        )
        if (response.ok) {
          const data = await response.json()
          setWeatherData({
            conditions: data.weather[0].main,
            temperature: Math.round(data.main.temp)
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error)
      // Set default values if API fails
      setWeatherData({
        conditions: 'Clear',
        temperature: 75
      })
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
      if (!client) return
      
      const newReport = await execute(async (supabase) => {
        const { data, error } = await supabase
          .from('field_reports')
          .insert({
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
          .select()
          .single()
        
        if (error) throw error
        return data
      })
      
      await loadFieldReports()
      setShowNewReportModal(false)
      
      // Log activity
      await execute(async (supabase) => {
        const { error } = await supabase
          .from('activity_logs')
          .insert({
            action: 'Created field report',
            entity_type: 'field_report',
            entity_id: newReport.id,
            metadata: { report_number: newReport.report_number }
          })
        
        if (error) throw error
      })
    } catch (err) {
      console.error('Error creating field report:', err)
      alert('Failed to create field report')
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      try {
        if (!client) return
        
        await execute(async (supabase) => {
          const { error } = await supabase
            .from('field_reports')
            .delete()
            .eq('id', reportId)
          
          if (error) throw error
        })
        
        await loadFieldReports()
        
        // Log activity
        await execute(async (supabase) => {
          const { error } = await supabase
            .from('activity_logs')
            .insert({
              action: 'Deleted field report',
              entity_type: 'field_report',
              entity_id: reportId
            })
          
          if (error) throw error
        })
      } catch (err) {
        console.error('Error deleting field report:', err)
        alert('Failed to delete field report')
      }
    }
  }

  const handleSubmitReport = async (reportId: string) => {
    try {
      if (!client) return
      
      await execute(async (supabase) => {
        const { error } = await supabase
          .from('field_reports')
          .update({ status: 'submitted' })
          .eq('id', reportId)
        
        if (error) throw error
      })
      
      await loadFieldReports()
      
      // Send notifications
      if (notificationEmails.length > 0) {
        console.log('Sending notifications to:', notificationEmails.map(e => e.email))
      }
      
      // Log activity
      await execute(async (supabase) => {
        const { error } = await supabase
          .from('activity_logs')
          .insert({
            action: 'Submitted field report',
            entity_type: 'field_report',
            entity_id: reportId
          })
        
        if (error) throw error
      })
    } catch (err) {
      console.error('Error submitting field report:', err)
      alert('Failed to submit field report')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
      {/* Header */}
      <div className="p-4">
        <PageTitle title="Field Reports" />
      </div>

      {/* Filters and Search */}
      <div className="p-4">
        <div className="card-modern hover-lift p-4 mb-4">
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
              className="input-modern"
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
              <label className="block text-sm font-medium text-yellow-400 mb-1">Start Date</label>
              <input
                type="date"
                className="input-modern"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">End Date</label>
              <input
                type="date"
                className="input-modern"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="spinner-modern"></div>
            <span className="ml-2 text-yellow-400">Loading field reports...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card-modern bg-gradient-to-r from-red-900/20 to-red-800/20 border-red-500/30 p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-300">{error}</span>
              <button 
                onClick={loadFieldReports}
                className="ml-auto text-red-400 hover:text-red-300 transition-colors"
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
              <div className="card-modern p-12 text-center">
                <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-yellow-400 mb-2">No Field Reports Found</h3>
                <p className="text-gray-400 mb-4">
                  {searchQuery || filterType !== 'all' || filterStatus !== 'all' || filterPriority !== 'all'
                    ? 'Try adjusting your filters or search query'
                    : 'Get started by creating your first field report'}
                </p>
                {!searchQuery && filterType === 'all' && filterStatus === 'all' && filterPriority === 'all' && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => setShowNewReportModal(true)}
                      className="btn-primary"
                    >
                      New Report
                    </button>
                  </div>
                )}
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="card-modern hover-lift p-6"
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
                      
                      <h3 className="text-lg font-semibold text-gray-100 mb-1">{report.project_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
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
                          <span className="text-gray-400">
                            Weather: {report.weather_conditions} {report.weather_temperature}°F
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/field-reports/${report.id}`)}
                        className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                        title="View Report"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {report.status === 'draft' && (
                        <>
                          <button
                            onClick={() => router.push(`/field-reports/${report.id}/edit`)}
                            className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                            title="Edit Report"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleSubmitReport(report.id)}
                            className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                            title="Submit Report"
                          >
                            <Send className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
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

      {/* Enhanced New Report Modal */}
      {showNewReportModal && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="modal-modern max-w-4xl w-full p-6 my-8">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">Create New Field Report</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const selectedProj = projects.find(p => p.id === selectedProject)
                const selectedRep = teamMembers.find(m => m.id === selectedReporter)
                
                handleNewReport({
                  project_id: selectedProject,
                  project_name: selectedProj?.name || (formData.get('project_name') as string),
                  project_address: selectedProj?.address || (formData.get('project_address') as string),
                  report_type: formData.get('report_type') as FieldReport['report_type'],
                  priority: formData.get('priority') as FieldReport['priority'],
                  reported_by: selectedRep?.name || (formData.get('reported_by') as string),
                  reporter_id: selectedReporter,
                  work_performed: formData.get('work_performed') as string,
                  materials_used: formData.get('materials_used') as string,
                  equipment_used: formData.get('equipment_used') as string,
                  subcontractors: formData.get('subcontractors') as string,
                  visitors: formData.get('visitors') as string,
                  delays: formData.get('delays') as string,
                  safety_incidents: formData.get('safety_incidents') as string,
                  quality_issues: formData.get('quality_issues') as string,
                  weather_conditions: formData.get('weather_conditions') as string,
                  weather_temperature: parseInt(formData.get('weather_temperature') as string) || undefined
                })
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Building className="h-4 w-4 inline mr-1" />
                      Select Project
                    </label>
                    <select
                      value={selectedProject}
                      onChange={(e) => {
                        setSelectedProject(e.target.value)
                        const proj = projects.find(p => p.id === e.target.value)
                        if (proj) {
                          // Auto-fill project details
                        }
                      }}
                      className="input-modern"
                    >
                      <option value="">-- Select a Project --</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.projectNumber} - {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!selectedProject && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                        <input
                          type="text"
                          name="project_name"
                          required={!selectedProject}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Address</label>
                        <input
                          type="text"
                          name="project_address"
                          required={!selectedProject}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </>
                  )}

                  {selectedProject && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Project:</strong> {projects.find(p => p.id === selectedProject)?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Address:</strong> {projects.find(p => p.id === selectedProject)?.address}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="h-4 w-4 inline mr-1" />
                      Reported By (Team Member)
                    </label>
                    <select
                      value={selectedReporter}
                      onChange={(e) => setSelectedReporter(e.target.value)}
                      className="input-modern"
                    >
                      <option value="">-- Select Team Member --</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} - {member.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!selectedReporter && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Or Enter Name</label>
                      <input
                        type="text"
                        name="reported_by"
                        required={!selectedReporter}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weather</label>
                      <input
                        type="text"
                        name="weather_conditions"
                        defaultValue={weatherData?.conditions || ''}
                        placeholder="Auto-filled from weather API"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°F)</label>
                      <input
                        type="number"
                        name="weather_temperature"
                        defaultValue={weatherData?.temperature || ''}
                        placeholder="Auto-filled"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Performed</label>
                    <textarea
                      name="work_performed"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Describe work completed today..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Materials Used</label>
                    <textarea
                      name="materials_used"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="List materials used..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Used</label>
                    <input
                      type="text"
                      name="equipment_used"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="e.g., Excavator, Crane"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subcontractors</label>
                    <input
                      type="text"
                      name="subcontractors"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="List subcontractors on site"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visitors</label>
                    <input
                      type="text"
                      name="visitors"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="List any site visitors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delays</label>
                      <textarea
                        name="delays"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="Any delays?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quality Issues</label>
                      <textarea
                        name="quality_issues"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="Any quality concerns?"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Safety Incidents</label>
                    <textarea
                      name="safety_incidents"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Report any safety incidents..."
                    />
                  </div>
                </div>
              </div>

              {/* Photo Upload Section */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Camera className="h-4 w-4 inline mr-1" />
                  Upload Photos (Max 6)
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {uploadedPhotos.length < 6 && (
                    <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-sky-500 transition-colors">
                      <Upload className="h-6 w-6 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewReportModal(false)
                    setSelectedProject('')
                    setSelectedReporter('')
                    setUploadedPhotos([])
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
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