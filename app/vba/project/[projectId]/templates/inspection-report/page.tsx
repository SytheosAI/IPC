'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, FileText, Settings, Upload, Download, Camera
} from 'lucide-react'
import jsPDF from 'jspdf'

interface InspectionReportData {
  reportTitle: string
  reference: string
  attention: string
  logo: string | null
  generalContext: string
  projectName: string
  projectAddress: string
  jobNumber: string
  inspectionDate: string
  inspectionType: string
  reportSequence: string
  weather: string
  inspectorName: string
  inspectorLicense: string
  companyName: string
  observations: string
  recommendations: string
  digitalSignature: string | null
  photos: Array<{
    id: string
    url: string
    caption: string
  }>
}

export default function InspectionReportTemplate() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  
  const [reportData, setReportData] = useState<InspectionReportData>({
    reportTitle: 'Inspection Report',
    reference: '',
    attention: '',
    logo: null,
    generalContext: 'This inspection report contains observations and recommendations based on the site visit conducted on the date specified above.',
    projectName: '',
    projectAddress: '',
    jobNumber: '',
    inspectionDate: new Date().toLocaleDateString('en-US'),
    inspectionType: '',
    reportSequence: '1',
    weather: '',
    inspectorName: '',
    inspectorLicense: '',
    companyName: '',
    observations: '',
    recommendations: '',
    digitalSignature: null,
    photos: []
  })
  
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [availableInspections, setAvailableInspections] = useState<string[]>([])
  const [generatingPDF, setGeneratingPDF] = useState(false)

  useEffect(() => {
    loadReportData()
    fetchWeatherData()
  }, [projectId])

  const loadReportData = () => {
    try {
      setLoading(true)
      
      // Load project info
      const savedProjectInfo = localStorage.getItem(`vba-project-info-${projectId}`)
      if (savedProjectInfo) {
        const projectInfo = JSON.parse(savedProjectInfo)
        setReportData(prev => ({
          ...prev,
          reference: projectInfo.reference,
          attention: projectInfo.attention,
          logo: projectInfo.companyLogo,
          projectName: projectInfo.projectName,
          projectAddress: projectInfo.projectAddress,
          inspectorLicense: projectInfo.licenseNumber,
          companyName: projectInfo.companyName,
          digitalSignature: projectInfo.digitalSignature
        }))
      }
      
      // Load project data
      const savedProjects = localStorage.getItem('vba-projects')
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const project = projects.find((p: any) => p.id === projectId)
        if (project) {
          setReportData(prev => ({
            ...prev,
            projectName: prev.projectName || project.projectName,
            projectAddress: prev.projectAddress || project.address,
            jobNumber: project.jobNumber || project.id
          }))
          setAvailableInspections(project.selectedInspections || [])
        }
      }
      
      // Load previous report data if exists
      const savedReport = localStorage.getItem(`vba-inspection-report-${projectId}`)
      if (savedReport) {
        const report = JSON.parse(savedReport)
        setReportData(prev => ({
          ...prev,
          ...report
        }))
      }
      
    } catch (error) {
      console.error('Failed to load report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWeatherData = async () => {
    try {
      const lat = 26.6406
      const lon = -81.8723
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
      
      if (apiKey) {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
        )
        
        if (response.ok) {
          const data = await response.json()
          if (data.weather && data.weather[0] && data.main) {
            setReportData(prev => ({
              ...prev,
              weather: `${data.weather[0].main}, ${Math.round(data.main.temp)}°F, Humidity: ${data.main.humidity}%`
            }))
          } else {
            throw new Error('Invalid weather data')
          }
        } else {
          throw new Error('Weather API request failed')
        }
      } else {
        // Fallback weather
        setReportData(prev => ({
          ...prev,
          weather: 'Partly Cloudy, 82°F, Humidity: 65%'
        }))
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error)
      setReportData(prev => ({
        ...prev,
        weather: 'Partly Cloudy, 82°F, Humidity: 65%'
      }))
    }
  }

  const handleGenerateReport = async () => {
    setGeneratingPDF(true)
    
    try {
      // Save current state
      localStorage.setItem(`vba-inspection-report-${projectId}`, JSON.stringify(reportData))
    
    // Generate filename based on date and sequence
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const sequence = reportData.reportSequence.padStart(3, '0')
    
    const filename = `${year} ${month} ${day} ${sequence} - Inspection Report`
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'letter')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)
    let yPosition = margin
    
    // Helper function to check page overflow
    const checkPageBreak = (additionalHeight: number) => {
      if (yPosition + additionalHeight > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
        return true
      }
      return false
    }
    
    // Helper function to add wrapped text
    const addWrappedText = (text: string, fontSize: number, isBold: boolean = false) => {
      pdf.setFontSize(fontSize)
      if (isBold) {
        pdf.setFont('helvetica', 'bold')
      } else {
        pdf.setFont('helvetica', 'normal')
      }
      const lines = pdf.splitTextToSize(text, contentWidth)
      const lineHeight = fontSize * 0.5
      checkPageBreak(lines.length * lineHeight)
      pdf.text(lines, margin, yPosition)
      yPosition += lines.length * lineHeight
      return lines.length * lineHeight
    }
    
    // Add logo if available
    if (reportData.logo) {
      try {
        // In production, convert base64 or URL to image
        pdf.addImage(reportData.logo, 'PNG', margin, yPosition, 40, 20)
        yPosition += 25
      } catch (e) {
        console.error('Failed to add logo:', e)
      }
    }
    
    // Title
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text(reportData.reportTitle, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15
    
    // Reference and Attention
    if (reportData.reference) {
      addWrappedText(`Reference: ${reportData.reference}`, 10)
      yPosition += 3
    }
    if (reportData.attention) {
      addWrappedText(`Attention: ${reportData.attention}`, 10)
      yPosition += 3
    }
    
    // Line separator
    pdf.setLineWidth(0.5)
    pdf.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10
    
    // Project Information Section
    addWrappedText('PROJECT INFORMATION', 14, true)
    yPosition += 5
    
    const projectInfo = [
      ['Project Name:', reportData.projectName || 'Not specified'],
      ['Project Address:', reportData.projectAddress || 'Not specified'],
      ['Job Number:', reportData.jobNumber || 'Not specified'],
      ['Inspection Date:', reportData.inspectionDate],
      ['Inspection Type:', reportData.inspectionType || 'Not specified'],
      ['Weather:', reportData.weather || 'Not available']
    ]
    
    projectInfo.forEach(([label, value]) => {
      checkPageBreak(8)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text(label, margin, yPosition)
      pdf.setFont('helvetica', 'normal')
      const lines = pdf.splitTextToSize(value, contentWidth - 50)
      pdf.text(lines, margin + 35, yPosition)
      yPosition += Math.max(8, lines.length * 5)
    })
    
    yPosition += 5
    
    // Inspector Information Section
    checkPageBreak(20)
    pdf.setLineWidth(0.5)
    pdf.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10
    
    addWrappedText('INSPECTOR INFORMATION', 14, true)
    yPosition += 5
    
    const inspectorInfo = [
      ['Inspector Name:', reportData.inspectorName || 'Not specified'],
      ['License Number:', reportData.inspectorLicense || 'Not specified'],
      ['Company:', reportData.companyName || 'Not specified']
    ]
    
    inspectorInfo.forEach(([label, value]) => {
      checkPageBreak(8)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text(label, margin, yPosition)
      pdf.setFont('helvetica', 'normal')
      pdf.text(value, margin + 35, yPosition)
      yPosition += 8
    })
    
    yPosition += 5
    
    // General Context
    if (reportData.generalContext) {
      checkPageBreak(20)
      pdf.setLineWidth(0.5)
      pdf.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
      
      addWrappedText('GENERAL CONTEXT', 14, true)
      yPosition += 5
      addWrappedText(reportData.generalContext, 10)
      yPosition += 5
    }
    
    // Observations Section
    if (reportData.observations) {
      checkPageBreak(20)
      pdf.setLineWidth(0.5)
      pdf.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
      
      addWrappedText('OBSERVATIONS', 14, true)
      yPosition += 5
      addWrappedText(reportData.observations, 10)
      yPosition += 5
    }
    
    // Recommendations Section
    if (reportData.recommendations) {
      checkPageBreak(20)
      pdf.setLineWidth(0.5)
      pdf.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
      
      addWrappedText('RECOMMENDATIONS', 14, true)
      yPosition += 5
      addWrappedText(reportData.recommendations, 10)
      yPosition += 5
    }
    
    // Photos Section
    if (reportData.photos.length > 0) {
      checkPageBreak(30)
      pdf.setLineWidth(0.5)
      pdf.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
      
      addWrappedText('INSPECTION PHOTOS', 14, true)
      yPosition += 5
      
      // Add photo references (in production, actual images would be embedded)
      reportData.photos.forEach((photo, index) => {
        checkPageBreak(10)
        pdf.setFontSize(10)
        pdf.text(`Photo ${index + 1}: ${photo.caption}`, margin, yPosition)
        yPosition += 8
      })
      yPosition += 5
    }
    
    // Digital Signature
    if (reportData.digitalSignature) {
      checkPageBreak(40)
      pdf.setLineWidth(0.5)
      pdf.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Digitally Signed By:', margin, yPosition)
      yPosition += 8
      
      try {
        // In production, add actual signature image
        pdf.text('[Digital Signature]', margin, yPosition)
        yPosition += 8
      } catch (e) {
        console.error('Failed to add signature:', e)
      }
      
      pdf.text(reportData.inspectorName || 'Inspector', margin, yPosition)
      yPosition += 5
      pdf.text(new Date().toLocaleDateString('en-US'), margin, yPosition)
    }
    
    // Footer on last page
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'italic')
    pdf.text(
      `Generated on ${new Date().toLocaleString('en-US')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
    
    // Add page numbers
    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: 'right' }
      )
    }
    
    // Save the PDF
    pdf.save(`${filename}.pdf`)
    
    // Show success message
    alert(`Report generated successfully!\n\nFile saved as: ${filename}.pdf`)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setGeneratingPDF(false)
    }
  }

  const loadInspectionPhotos = () => {
    if (reportData.inspectionType) {
      const savedPhotos = localStorage.getItem(`vba-inspection-photos-${projectId}`)
      if (savedPhotos) {
        const allPhotos = JSON.parse(savedPhotos)
        const inspectionPhotos = allPhotos[reportData.inspectionType] || []
        
        setReportData(prev => ({
          ...prev,
          photos: inspectionPhotos.map((photo: any) => ({
            id: photo.id,
            url: photo.url || '#', // In real app, this would be the actual photo URL
            caption: photo.name
          }))
        }))
      }
    }
  }

  useEffect(() => {
    if (reportData.inspectionType) {
      loadInspectionPhotos()
    }
  }, [reportData.inspectionType])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push(`/vba/project/${projectId}`)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Inspection Report</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-4xl mx-auto">
        {/* Template Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Template Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Title</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={reportData.reportTitle}
                onChange={(e) => setReportData({ ...reportData, reportTitle: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={reportData.reference}
                onChange={(e) => setReportData({ ...reportData, reference: e.target.value })}
                placeholder="Project Reference"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attention</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={reportData.attention}
                onChange={(e) => setReportData({ ...reportData, attention: e.target.value })}
                placeholder="Recipient Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
              <div className="border border-gray-300 rounded-lg p-2 h-12 flex items-center">
                {reportData.logo ? (
                  <img src={reportData.logo} alt="Logo" className="h-8" />
                ) : (
                  <span className="text-gray-400 text-sm">No logo uploaded</span>
                )}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">General Context</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={3}
                value={reportData.generalContext}
                onChange={(e) => setReportData({ ...reportData, generalContext: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Auto-Generated Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Auto-Generated Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <p className="text-gray-900">{reportData.projectName || 'Not specified'}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Address</label>
              <p className="text-gray-900">{reportData.projectAddress || 'Not specified'}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Number</label>
              <p className="text-gray-900">{reportData.jobNumber || 'Not specified'}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Date</label>
              <p className="text-gray-900">{reportData.inspectionDate}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Type</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={reportData.inspectionType}
                onChange={(e) => setReportData({ ...reportData, inspectionType: e.target.value })}
              >
                <option value="">00 - Select Inspection</option>
                {availableInspections.map((inspection, index) => (
                  <option key={inspection} value={inspection}>
                    {String(index + 1).padStart(2, '0')} - {inspection}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Sequence</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={reportData.reportSequence}
                onChange={(e) => setReportData({ ...reportData, reportSequence: e.target.value })}
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">Use 1 for first report, 2 for second report of same inspection, etc.</p>
            </div>
            
            <div className="md:col-span-2 bg-gray-50 p-3 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">Weather</label>
              <p className="text-gray-900">{reportData.weather || 'Weather data unavailable'}</p>
            </div>
          </div>
        </div>

        {/* Inspector Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-orange-600 mb-4">Inspector Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 p-3 rounded">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={reportData.inspectorName}
                onChange={(e) => setReportData({ ...reportData, inspectorName: e.target.value })}
                placeholder="John Doe, P.E."
              />
            </div>
            
            <div className="bg-yellow-50 p-3 rounded">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={reportData.inspectorLicense}
                onChange={(e) => setReportData({ ...reportData, inspectorLicense: e.target.value })}
                placeholder="PE12345"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <div className="bg-yellow-50 p-3 rounded">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={reportData.companyName}
                  onChange={(e) => setReportData({ ...reportData, companyName: e.target.value })}
                  placeholder="Engineering Associates, Inc."
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
              <div className="bg-yellow-50 p-3 rounded">
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={6}
                  value={reportData.observations}
                  onChange={(e) => setReportData({ ...reportData, observations: e.target.value })}
                  placeholder="Enter inspection observations..."
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
              <div className="bg-yellow-50 p-3 rounded">
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={6}
                  value={reportData.recommendations}
                  onChange={(e) => setReportData({ ...reportData, recommendations: e.target.value })}
                  placeholder="Enter recommendations..."
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Digital Signature</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {reportData.digitalSignature ? (
                  <img src={reportData.digitalSignature} alt="Digital Signature" className="mx-auto max-h-24" />
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Upload Signature</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Inspection Photos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Inspection Photos</h2>
          </div>
          
          {reportData.photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {reportData.photos.map((photo) => (
                <div key={photo.id} className="border border-gray-200 rounded-lg p-2">
                  <div className="bg-gray-100 h-32 rounded flex items-center justify-center mb-2">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-600 truncate">{photo.caption}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">
              No inspection photos available. Photos taken during inspections will appear here automatically.
            </p>
          )}
        </div>

        {/* Generated File Name */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Generated File Name</label>
          <p className="text-lg font-mono text-gray-900">
            {`${new Date().getFullYear().toString().slice(-2)} ${String(new Date().getMonth() + 1).padStart(2, '0')} ${String(new Date().getDate()).padStart(2, '0')} ${reportData.reportSequence.padStart(3, '0')} - Inspection Report.pdf`}
          </p>
        </div>

        {/* Generate Report Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerateReport}
            disabled={generatingPDF}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 text-lg transition-colors"
          >
            {generatingPDF ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <FileText className="h-5 w-5" />
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}