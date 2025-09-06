'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/supabase-client'
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
  workZone: string
  workPerformed: string
  drawingPage: string
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
    workZone: '',
    workPerformed: '',
    drawingPage: '',
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

  const loadReportData = async () => {
    try {
      setLoading(true)
      
      // Load project info from Supabase
      const project: any = await db.vbaProjects.get(projectId)
      if (project) {
        setReportData(prev => ({
          ...prev,
          projectName: project.project_name,
          projectAddress: project.address,
          jobNumber: project.job_number || project.id,
          // These fields might not exist yet in the database
          reference: '',
          attention: '',
          logo: '',
          inspectorLicense: '',
          companyName: '',
          digitalSignature: ''
        }))
        setAvailableInspections(project.selected_inspections || [])
      }
      
      // Skip loading previous report data for now
      // TODO: Implement reports table in Supabase
      
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
      // Log activity instead of saving to localStorage
      await db.activityLogs.create({
        action: 'generated_inspection_report',
        entity_type: 'vba_project',
        entity_id: projectId,
        metadata: { inspection_type: reportData.inspectionType }
      })
      
      // Load actual photos from the inspection type folder
      let actualPhotos = reportData.photos
      if (reportData.inspectionType) {
        // Load photos from Supabase
        console.log('Loading photos for inspection type:', reportData.inspectionType)
        const photos: any[] = await db.inspections.getPhotosByProject(projectId)
        if (photos && photos.length > 0) {
          // Filter photos by inspection type if they have a category field
          const inspectionPhotos = photos.filter((photo: any) => 
            photo.category === reportData.inspectionType
          )
          console.log('Found inspection photos:', inspectionPhotos.length)
          actualPhotos = inspectionPhotos.map((photo: any) => ({
            id: photo.id,
            url: photo.url || photo.data, // Prioritize url over data
            caption: photo.caption || photo.name || 'Photo'
          }))
          console.log('Mapped photos:', actualPhotos.length, actualPhotos[0]?.url?.substring(0, 50))
        }
      }
    
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
    
    // Add logo if available - maintain aspect ratio
    if (reportData.logo) {
      try {
        // Fixed dimensions to maintain aspect ratio
        const maxLogoWidth = 50
        const maxLogoHeight = 25
        // Position logo at top right
        // Use JPEG/PNG based on data URL
        const imageType = reportData.logo.includes('png') ? 'PNG' : 'JPEG'
        pdf.addImage(reportData.logo, imageType, pageWidth - margin - maxLogoWidth, yPosition, maxLogoWidth, maxLogoHeight, undefined, 'FAST')
      } catch (e) {
        console.error('Failed to add logo:', e)
      }
    }
    
    // Date at top left
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, yPosition)
    yPosition += 8
    
    // Attention section
    if (reportData.attention) {
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const attentionLines = reportData.attention.split('\n')
      pdf.text('Attn:', margin, yPosition)
      yPosition += 6
      attentionLines.forEach(line => {
        if (line.trim()) {
          pdf.text(line.trim(), margin + 15, yPosition)
          yPosition += 5
        }
      })
      yPosition += 3
    }
    
    // Reference section
    if (reportData.reference) {
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Ref:', margin, yPosition)
      yPosition += 6
      const refLines = reportData.reference.split('\n')
      refLines.forEach(line => {
        if (line.trim()) {
          pdf.text(line.trim(), margin + 15, yPosition)
          yPosition += 5
        }
      })
      yPosition += 8
    }
    
    // Inspection Report Title and Details (formatted like example)
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    const inspectionTitle = reportData.inspectionType || 'Threshold Inspection'
    const reportNumber = reportData.reportSequence.padStart(3, '0')
    pdf.text(`${inspectionTitle} Report: ${reportNumber}`, margin + 5, yPosition)
    yPosition += 8
    
    pdf.text(`Date & Time of Inspection: ${reportData.inspectionDate}, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`, margin + 5, yPosition)
    yPosition += 6
    
    pdf.text(`Inspector Name: ${reportData.inspectorName || ''}`, margin + 5, yPosition)
    yPosition += 6
    
    pdf.text(`Weather Conditions: ${reportData.weather || ''}`, margin + 5, yPosition)
    yPosition += 6
    
    const temp = reportData.weather ? reportData.weather.match(/\d+°F/) : null
    pdf.text(`Temperature: ${temp ? temp[0] : '80F'}`, margin + 5, yPosition)
    yPosition += 6
    
    pdf.text(`Work Zone: ${reportData.workZone || ''}`, margin + 5, yPosition)
    yPosition += 6
    
    pdf.text(`Work Performed: ${reportData.workPerformed || ''}`, margin + 5, yPosition)
    yPosition += 6
    
    pdf.text(`Plans Used: ${reportData.projectName || ''}`, margin + 5, yPosition)
    yPosition += 6
    
    pdf.text(`Current Date/Revision: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, margin + 5, yPosition)
    yPosition += 6
    
    pdf.text(`Drawing Page: ${reportData.drawingPage || ''}`, margin + 5, yPosition)
    yPosition += 10
    
    // HBS project number if available
    if (reportData.jobNumber) {
      pdf.setFont('helvetica', 'bold')
      pdf.text(`HBS Project Number: ${reportData.jobNumber}`, margin + 5, yPosition)
      pdf.setFont('helvetica', 'normal')
      yPosition += 10
    }
    
    // Inspector Information Section
    checkPageBreak(20)
    yPosition += 10
    
    addWrappedText('INSPECTOR INFORMATION', 14, true)
    yPosition += 5
    
    const inspectorInfo = [
      ['Inspector Name:', reportData.inspectorName || ''],
      ['License Number:', reportData.inspectorLicense || ''],
      ['Company:', reportData.companyName || '']
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
      yPosition += 10
      
      addWrappedText('GENERAL CONTEXT', 14, true)
      yPosition += 5
      addWrappedText(reportData.generalContext, 10)
      yPosition += 5
    }
    
    // Observations Section
    if (reportData.observations) {
      checkPageBreak(20)
      yPosition += 10
      
      addWrappedText('OBSERVATIONS', 14, true)
      yPosition += 5
      addWrappedText(reportData.observations, 10)
      yPosition += 5
    }
    
    // Recommendations Section
    if (reportData.recommendations) {
      checkPageBreak(20)
      yPosition += 10
      
      addWrappedText('RECOMMENDATIONS', 14, true)
      yPosition += 5
      addWrappedText(reportData.recommendations, 10)
      yPosition += 5
    }
    
    // Photos Section - embed actual photos
    if (actualPhotos && actualPhotos.length > 0) {
      checkPageBreak(30)
      yPosition += 10
      
      addWrappedText('INSPECTION PHOTOS', 14, true)
      yPosition += 5
      
      // Add actual photos to PDF
      actualPhotos.forEach((photo, index) => {
        checkPageBreak(80) // Space for photo + caption
        
        // Add photo caption
        pdf.setFontSize(10)
        pdf.text(`Photo ${index + 1}: ${photo.caption}`, margin, yPosition)
        yPosition += 5
        
        // Try to add the actual image
        if (photo.url) {
          try {
            // Check if it's a base64 image
            if (photo.url.startsWith('data:image')) {
              const imgWidth = 80
              const imgHeight = 60
              const imageType = photo.url.includes('png') ? 'PNG' : 'JPEG'
              pdf.addImage(photo.url, imageType, margin, yPosition, imgWidth, imgHeight, undefined, 'FAST')
              yPosition += imgHeight + 10
            } else {
              // If it's not base64, show placeholder
              pdf.text('[Photo URL not embedded - base64 required]', margin, yPosition)
              yPosition += 10
            }
          } catch (e) {
            console.error('Failed to add photo:', e, photo.url?.substring(0, 50))
            pdf.text('[Photo could not be embedded]', margin, yPosition)
            yPosition += 10
          }
        } else {
          pdf.text('[No photo data available]', margin, yPosition)
          yPosition += 10
        }
      })
      yPosition += 5
    }
    
    // Digital Signature
    if (reportData.digitalSignature) {
      checkPageBreak(50)
      yPosition += 10
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Digitally Signed By:', margin, yPosition)
      yPosition += 8
      
      try {
        // Add actual signature image if it's base64
        if (reportData.digitalSignature.startsWith('data:image')) {
          // Fixed dimensions to maintain aspect ratio
          const sigWidth = 60
          const sigHeight = 20
          const imageType = reportData.digitalSignature.includes('png') ? 'PNG' : 'JPEG'
          pdf.addImage(reportData.digitalSignature, imageType, margin, yPosition, sigWidth, sigHeight, undefined, 'FAST')
          yPosition += sigHeight + 5
        } else {
          pdf.text('[Digital Signature]', margin, yPosition)
          yPosition += 8
        }
      } catch (e) {
        console.error('Failed to add signature:', e)
        pdf.text('[Digital Signature]', margin, yPosition)
        yPosition += 8
      }
      
      pdf.text(reportData.inspectorName || 'Inspector', margin, yPosition)
      yPosition += 5
      pdf.text(new Date().toLocaleDateString('en-US'), margin, yPosition)
    }
    
    // Remove footer - no longer needed
    const addFooter = () => {
      // Footer removed per request
    }
    
    // Add page numbers to bottom of all pages
    const totalPages = pdf.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    }
    
    // Save the PDF to inspection-reports folder
    // Create a download that mimics saving to a specific folder
    const blob = pdf.output('blob')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    // Log activity for generated report
    await db.activityLogs.create({
      action: 'generated_pdf_report',
      entity_type: 'vba_project',
      entity_id: projectId,
      metadata: {
        filename: `${filename}.pdf`,
        date: new Date().toISOString(),
        inspectionType: reportData.inspectionType,
        sequence: reportData.reportSequence,
        type: 'inspection'
      }
    })
    
    // Show success message
    alert(`Report generated successfully!\n\nFile saved as: ${filename}.pdf`)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setGeneratingPDF(false)
    }
  }

  const loadInspectionPhotos = async () => {
    if (reportData.inspectionType) {
      // Load photos from Supabase
      const photos: any[] = await db.inspections.getPhotosByProject(projectId)
      if (photos && photos.length > 0) {
        // Filter photos by inspection type
        const inspectionPhotos = photos.filter((photo: any) => 
          photo.category === reportData.inspectionType
        )
        
        setReportData(prev => ({
          ...prev,
          photos: inspectionPhotos.map((photo: any) => ({
            id: photo.id,
            url: photo.data || photo.url || '', // Use actual photo data
            caption: photo.name || ''
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
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={5}
                value={reportData.reference}
                onChange={(e) => setReportData({ ...reportData, reference: e.target.value })}
                placeholder=""
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Attention</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={5}
                value={reportData.attention}
                onChange={(e) => setReportData({ ...reportData, attention: e.target.value })}
                placeholder=""
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
              <p className="text-gray-900">{reportData.projectName || ''}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Address</label>
              <p className="text-gray-900">{reportData.projectAddress || ''}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Number</label>
              <p className="text-gray-900">{reportData.jobNumber || ''}</p>
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Zone</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={reportData.workZone}
                onChange={(e) => setReportData({ ...reportData, workZone: e.target.value })}
                placeholder=""
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Performed</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={reportData.workPerformed}
                onChange={(e) => setReportData({ ...reportData, workPerformed: e.target.value })}
                placeholder=""
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Drawing Page</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={reportData.drawingPage}
                onChange={(e) => setReportData({ ...reportData, drawingPage: e.target.value })}
                placeholder=""
              />
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">Weather</label>
              <p className="text-gray-900">{reportData.weather || ''}</p>
            </div>
          </div>
        </div>

        {/* Inspector Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-orange-600 mb-4">Inspector Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspector Name</label>
              <div className="bg-yellow-50 p-3 rounded">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={reportData.inspectorName}
                  onChange={(e) => setReportData({ ...reportData, inspectorName: e.target.value })}
                  placeholder=""
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspector License</label>
              <div className="bg-yellow-50 p-3 rounded">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={reportData.inspectorLicense}
                  onChange={(e) => setReportData({ ...reportData, inspectorLicense: e.target.value })}
                  placeholder=""
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <div className="bg-yellow-50 p-3 rounded">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={reportData.companyName}
                  onChange={(e) => setReportData({ ...reportData, companyName: e.target.value })}
                  placeholder=""
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
                  placeholder=""
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
                  placeholder=""
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
                  <div className="bg-gray-100 h-32 rounded flex items-center justify-center mb-2 overflow-hidden">
                    {photo.url && photo.url.startsWith('data:image') ? (
                      <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 truncate">{photo.caption}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">
              Select an inspection type to view photos.
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