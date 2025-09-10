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
  Edit2,
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
import jsPDF from 'jspdf'

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
  const [filterProject, setFilterProject] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [selectedReport, setSelectedReport] = useState<FieldReport | null>(null)
  const [showNewReportModal, setShowNewReportModal] = useState(false)
  const [editingReport, setEditingReport] = useState<FieldReport | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
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
      
      // Use API endpoint to fetch field reports
      const response = await fetch('/api/field-reports')
      if (response.ok) {
        const { data } = await response.json()
        setReports(data || [])
      } else {
        console.error('Failed to load field reports')
        setReports([])
      }
      
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
      // Load projects from both regular projects table and VBA projects table
      const allProjects: Project[] = []
      
      // Fetch from regular projects table
      const projectsResponse = await fetch('/api/projects')
      if (projectsResponse.ok) {
        const { data: regularProjects } = await projectsResponse.json()
        if (regularProjects) {
          regularProjects.forEach((p: any) => {
            allProjects.push({
              id: p.id,
              projectNumber: p.permit_number || p.id,
              name: p.project_name || 'Unnamed Project',
              address: p.address || '',
              city: p.city || '',
              state: p.state || ''
            })
          })
        }
      }
      
      // Fetch from VBA projects table
      const vbaResponse = await fetch('/api/vba-projects')
      if (vbaResponse.ok) {
        const { data: vbaProjects } = await vbaResponse.json()
        if (vbaProjects) {
          vbaProjects.forEach((p: any) => {
            allProjects.push({
              id: p.id,
              projectNumber: p.permit_number || p.id,
              name: p.project_name || 'VBA Project',
              address: p.address || '',
              city: p.city || '',
              state: p.state || ''
            })
          })
        }
      }
      
      setProjects(allProjects)
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
    const matchesProject = filterProject === 'all' || report.project_id === filterProject
    const matchesPriority = filterPriority === 'all' || report.priority === filterPriority
    
    return matchesSearch && matchesType && matchesProject && matchesPriority
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
      // Save via API
      const response = await fetch('/api/field-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          report_number: `FR-${Date.now()}`,
          project_id: reportData.project_id,
          project_name: reportData.project_name || '',
          project_address: reportData.project_address || '',
          report_type: reportData.report_type || 'Daily',
          report_date: new Date().toISOString().split('T')[0],
          report_time: new Date().toTimeString().split(' ')[0],
          reported_by: reportData.reported_by || 'Current User',
          status: 'draft',
          priority: reportData.priority || 'medium',
          work_performed: reportData.work_performed,
          materials_used: reportData.materials_used,
          subcontractors: reportData.subcontractors,
          delays: reportData.delays,
          safety_incidents: reportData.safety_incidents,
          quality_issues: reportData.quality_issues,
          weather_conditions: reportData.weather_conditions,
          weather_temperature: reportData.weather_temperature
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create field report')
      }
      
      await loadFieldReports()
      setShowNewReportModal(false)
      setEditingReport(null)
      
      console.log('Field report created successfully')
    } catch (err) {
      console.error('Error creating field report:', err)
      alert('Failed to create field report. Please check all required fields.')
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      try {
        const response = await fetch(`/api/field-reports/${reportId}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to delete report')
        }

        // Refresh the list
        await loadFieldReports()
        console.log('Field report deleted successfully')
      } catch (err) {
        console.error('Error deleting field report:', err)
        alert('Failed to delete field report. Please try again.')
      }
    }
  }

  const handleViewReport = (report: FieldReport) => {
    // Generate and display PDF preview
    generatePDFPreview(report)
  }

  const handleEditReport = (report: FieldReport) => {
    // Set the report data for editing
    setEditingReport(report)
    setSelectedProject(report.project_id || '')
    setShowNewReportModal(true)
  }

  const handleDownloadPDF = (report: FieldReport) => {
    // Generate styled PDF using jsPDF
    const doc = new jsPDF()
    
    // Add header background
    doc.setFillColor(31, 41, 55) // dark gray
    doc.rect(0, 0, 210, 40, 'F')
    
    // Title in header
    doc.setFontSize(24)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text(`FIELD REPORT`, 20, 20)
    
    // Report number
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text(`#${report.report_number}`, 20, 30)
    
    // Report Type Badge
    const typeColors: Record<string, [number, number, number]> = {
      'Safety': [239, 68, 68],
      'Progress': [59, 130, 246],
      'Quality': [34, 197, 94],
      'Incident': [251, 146, 60],
      'Daily': [107, 114, 128],
      'Weekly': [139, 92, 246],
      'Inspection': [168, 85, 247]
    }
    const color = typeColors[report.report_type] || [107, 114, 128]
    doc.setFillColor(color[0], color[1], color[2])
    doc.roundedRect(150, 15, 40, 10, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text(report.report_type.toUpperCase(), 170, 21, { align: 'center' })
    
    // Project Info Section
    doc.setFillColor(249, 250, 251)
    doc.rect(0, 45, 210, 35, 'F')
    
    doc.setFontSize(14)
    doc.setTextColor(31, 41, 55)
    doc.setFont('helvetica', 'bold')
    doc.text('PROJECT INFORMATION', 20, 55)
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(55, 65, 81)
    doc.text(`Project: ${report.project_name}`, 20, 65)
    doc.text(`Location: ${report.project_address}`, 20, 72)
    
    // Report Details
    let yPos = 90
    
    doc.setFontSize(14)
    doc.setTextColor(31, 41, 55)
    doc.setFont('helvetica', 'bold')
    doc.text('REPORT DETAILS', 20, yPos)
    yPos += 10
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(75, 85, 99)
    
    // Two column layout for details
    doc.text(`Date: ${report.report_date}`, 20, yPos)
    doc.text(`Time: ${report.report_time || 'N/A'}`, 110, yPos)
    yPos += 7
    
    doc.text(`Reported By: ${report.reported_by}`, 20, yPos)
    doc.text(`Priority: ${report.priority?.toUpperCase()}`, 110, yPos)
    yPos += 7
    doc.text(`Status: ${report.status?.toUpperCase()}`, 20, yPos)
    
    // Weather conditions if available
    if (report.weather_conditions) {
      yPos += 10
      doc.setFontSize(12)
      doc.text('Weather Conditions', 20, yPos)
      doc.setFontSize(10)
      yPos += 7
      doc.text(`${report.weather_conditions} ${report.weather_temperature ? `- ${report.weather_temperature}°F` : ''}`, 20, yPos)
    }
    
    // Work performed
    if (report.work_performed) {
      yPos += 15
      doc.setFontSize(12)
      doc.text('Work Performed', 20, yPos)
      doc.setFontSize(10)
      yPos += 7
      const lines = doc.splitTextToSize(report.work_performed, 170)
      lines.forEach((line: string) => {
        doc.text(line, 20, yPos)
        yPos += 5
      })
    }
    
    // Materials used
    if (report.materials_used) {
      yPos += 10
      doc.setFontSize(12)
      doc.text('Materials Used', 20, yPos)
      doc.setFontSize(10)
      yPos += 7
      const lines = doc.splitTextToSize(report.materials_used, 170)
      lines.forEach((line: string) => {
        doc.text(line, 20, yPos)
        yPos += 5
      })
    }
    
    // Subcontractors
    if (report.subcontractors) {
      yPos += 10
      doc.setFontSize(12)
      doc.text('Subcontractors', 20, yPos)
      doc.setFontSize(10)
      yPos += 7
      const lines = doc.splitTextToSize(report.subcontractors, 170)
      lines.forEach((line: string) => {
        doc.text(line, 20, yPos)
        yPos += 5
      })
    }
    
    // Safety incidents
    if (report.safety_incidents) {
      yPos += 10
      doc.setFontSize(12)
      doc.setTextColor(220, 53, 69)
      doc.text('Safety Incidents', 20, yPos)
      doc.setFontSize(10)
      doc.setTextColor(33, 37, 41)
      yPos += 7
      const lines = doc.splitTextToSize(report.safety_incidents, 170)
      lines.forEach((line: string) => {
        doc.text(line, 20, yPos)
        yPos += 5
      })
    }
    
    // Quality issues
    if (report.quality_issues) {
      yPos += 10
      doc.setFontSize(12)
      doc.setTextColor(255, 193, 7)
      doc.text('Quality Issues', 20, yPos)
      doc.setFontSize(10)
      doc.setTextColor(33, 37, 41)
      yPos += 7
      const lines = doc.splitTextToSize(report.quality_issues, 170)
      lines.forEach((line: string) => {
        doc.text(line, 20, yPos)
        yPos += 5
      })
    }
    
    // Delays
    if (report.delays) {
      yPos += 10
      doc.setFontSize(12)
      doc.setTextColor(251, 146, 60)
      doc.text('Delays', 20, yPos)
      doc.setFontSize(10)
      doc.setTextColor(75, 85, 99)
      yPos += 7
      const lines = doc.splitTextToSize(report.delays, 170)
      lines.forEach((line: string) => {
        doc.text(line, 20, yPos)
        yPos += 5
      })
    }
    
    // Add footer with generation date and page number
    const pageHeight = doc.internal.pageSize.height
    doc.setFillColor(31, 41, 55)
    doc.rect(0, pageHeight - 20, 210, 20, 'F')
    
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, pageHeight - 10)
    doc.text('Page 1 of 1', 180, pageHeight - 10)
    
    // Add company branding
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('IPC Solutions', 105, pageHeight - 10, { align: 'center' })
    
    // Save the PDF with formatted filename
    const date = new Date().toISOString().split('T')[0]
    doc.save(`FieldReport_${report.report_number}_${date}.pdf`)
  }

  const generatePDFContent = (report: FieldReport) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Field Report - ${report.report_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .section { margin: 20px 0; }
          .label { font-weight: bold; color: #666; }
          .value { margin-left: 10px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .priority-high { color: #dc3545; }
          .priority-medium { color: #ffc107; }
          .priority-low { color: #28a745; }
        </style>
      </head>
      <body>
        <h1>Field Report #${report.report_number}</h1>
        <div class="header">
          <div>
            <div class="section">
              <span class="label">Project:</span>
              <span class="value">${report.project_name}</span>
            </div>
            <div class="section">
              <span class="label">Address:</span>
              <span class="value">${report.project_address}</span>
            </div>
          </div>
          <div>
            <div class="section">
              <span class="label">Date:</span>
              <span class="value">${report.report_date}</span>
            </div>
            <div class="section">
              <span class="label">Type:</span>
              <span class="value">${report.report_type}</span>
            </div>
          </div>
        </div>
        <div class="grid">
          <div class="section">
            <span class="label">Reported By:</span>
            <span class="value">${report.reported_by}</span>
          </div>
          <div class="section">
            <span class="label">Priority:</span>
            <span class="value priority-${report.priority}">${report.priority?.toUpperCase()}</span>
          </div>
          ${report.weather_conditions ? `
          <div class="section">
            <span class="label">Weather:</span>
            <span class="value">${report.weather_conditions} ${report.weather_temperature ? `${report.weather_temperature}°F` : ''}</span>
          </div>
          ` : ''}
        </div>
        ${report.work_performed ? `
        <div class="section">
          <h3>Work Performed</h3>
          <p>${report.work_performed}</p>
        </div>
        ` : ''}
        ${report.materials_used ? `
        <div class="section">
          <h3>Materials Used</h3>
          <p>${report.materials_used}</p>
        </div>
        ` : ''}
        ${report.subcontractors ? `
        <div class="section">
          <h3>Subcontractors</h3>
          <p>${report.subcontractors}</p>
        </div>
        ` : ''}
        ${report.delays ? `
        <div class="section">
          <h3>Delays</h3>
          <p>${report.delays}</p>
        </div>
        ` : ''}
        ${report.safety_incidents ? `
        <div class="section">
          <h3>Safety Incidents</h3>
          <p>${report.safety_incidents}</p>
        </div>
        ` : ''}
        ${report.quality_issues ? `
        <div class="section">
          <h3>Quality Issues</h3>
          <p>${report.quality_issues}</p>
        </div>
        ` : ''}
      </body>
      </html>
    `
  }

  const generatePDFPreview = (report: FieldReport) => {
    const content = generatePDFContent(report)
    const previewWindow = window.open('', '_blank')
    if (previewWindow) {
      previewWindow.document.write(content)
      previewWindow.document.close()
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
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

            {/* Project Filter */}
            <select
              className="input-modern"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              className="input-modern"
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
          <div className="grid gap-3">
            {filteredReports.length === 0 ? (
              <div className="card-modern p-12 text-center">
                <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-yellow-400 mb-2">No Field Reports Found</h3>
                <p className="text-gray-400 mb-4">
                  {searchQuery || filterType !== 'all' || filterProject !== 'all' || filterPriority !== 'all'
                    ? 'Try adjusting your filters or search query'
                    : 'Get started by creating your first field report'}
                </p>
                {!searchQuery && filterType === 'all' && filterProject === 'all' && filterPriority === 'all' && (
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
                  className="card-modern hover-lift p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(report.report_type)}`}>
                          {getTypeIcon(report.report_type)}
                          <span className="ml-2">{report.report_type}</span>
                        </span>
                        <span className="text-sm text-gray-500">#{report.report_number}</span>
                        {getStatusIcon(report.status)}
                        {getPriorityIcon(report.priority)}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-100">{report.project_name}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-400 mb-1">
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
                        onClick={() => handleViewReport(report)}
                        className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                        title="View Report"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditReport(report)}
                        className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Edit Report"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(report)}
                        className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      {report.status === 'draft' && (
                        <button
                          onClick={() => handleSubmitReport(report.id)}
                          className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                          title="Submit Report"
                        >
                          <Send className="h-5 w-5" />
                        </button>
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
        <div className="modal-overlay fixed inset-0 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="modal-modern max-w-4xl w-full p-4 my-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-yellow-400 mb-2">{editingReport ? 'Edit Field Report' : 'Create New Field Report'}</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Left Column */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-yellow-400 mb-1">
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
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!selectedProject && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-yellow-400 mb-1">Project Name</label>
                        <input
                          type="text"
                          name="project_name"
                          required={!selectedProject}
                          defaultValue={editingReport?.project_name || ''}
                          className="input-modern w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-yellow-400 mb-1">Project Address</label>
                        <input
                          type="text"
                          name="project_address"
                          required={!selectedProject}
                          defaultValue={editingReport?.project_address || ''}
                          className="input-modern w-full"
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
                    <label className="block text-sm font-medium text-yellow-400 mb-1">
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
                      <label className="block text-sm font-medium text-yellow-400 mb-1">Or Enter Name</label>
                      <input
                        type="text"
                        name="reported_by"
                        required={!selectedReporter}
                        className="input-modern w-full"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-yellow-400 mb-1">Report Type</label>
                      <select
                        name="report_type"
                        defaultValue={editingReport?.report_type || 'Daily'}
                        className="input-modern w-full"
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
                      <label className="block text-sm font-medium text-yellow-400 mb-1">Priority</label>
                      <select
                        name="priority"
                        defaultValue={editingReport?.priority || 'medium'}
                        className="input-modern w-full"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-yellow-400 mb-1">Weather</label>
                      <input
                        type="text"
                        name="weather_conditions"
                        defaultValue={weatherData?.conditions || ''}
                        placeholder="Auto-filled from weather API"
                        className="input-modern w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-yellow-400 mb-1">Temperature (°F)</label>
                      <input
                        type="number"
                        name="weather_temperature"
                        defaultValue={weatherData?.temperature || ''}
                        placeholder="Auto-filled"
                        className="input-modern w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-yellow-400 mb-1">Work Performed</label>
                    <textarea
                      name="work_performed"
                      rows={3}
                      defaultValue={editingReport?.work_performed || ''}
                      className="input-modern w-full"
                      placeholder="Describe work completed today..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-yellow-400 mb-1">Materials Used</label>
                    <textarea
                      name="materials_used"
                      rows={2}
                      defaultValue={editingReport?.materials_used || ''}
                      className="input-modern w-full"
                      placeholder="List materials used..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-yellow-400 mb-1">Subcontractors</label>
                    <input
                      type="text"
                      name="subcontractors"
                      defaultValue={editingReport?.subcontractors || ''}
                      className="input-modern w-full"
                      placeholder="List subcontractors on site"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-yellow-400 mb-1">Delays</label>
                      <textarea
                        name="delays"
                        rows={2}
                        defaultValue={editingReport?.delays || ''}
                        className="input-modern w-full"
                        placeholder="Any delays?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-yellow-400 mb-1">Quality Issues</label>
                      <textarea
                        name="quality_issues"
                        rows={2}
                        defaultValue={editingReport?.quality_issues || ''}
                        className="input-modern w-full"
                        placeholder="Any quality concerns?"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-yellow-400 mb-1">Safety Incidents</label>
                    <textarea
                      name="safety_incidents"
                      rows={2}
                      defaultValue={editingReport?.safety_incidents || ''}
                      className="input-modern w-full"
                      placeholder="Report any safety incidents..."
                    />
                  </div>
                </div>
              </div>

              {/* Photo Upload Section */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-yellow-400 mb-2">
                  <Camera className="h-4 w-4 inline mr-1" />
                  Upload Photos (Max 6)
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
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
                    setEditingReport(null)
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