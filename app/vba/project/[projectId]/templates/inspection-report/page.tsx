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
  inspectorEmail: string
  companyName: string
  companyAddress: string
  companyLocation: string
  companyPhone: string
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
    inspectorEmail: '',
    companyName: '',
    companyAddress: '',
    companyLocation: '',
    companyPhone: '',
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
    
    // Helper function to check page overflow and add headers/footers
    const checkPageBreak = (additionalHeight: number) => {
      if (yPosition + additionalHeight > pageHeight - 40) { // Leave space for footer
        addFooter()
        pdf.addPage()
        addHeader()
        yPosition = margin + 15 // Account for header space
        return true
      }
      return false
    }
    
    // Add header to each page (except first)
    const addHeader = () => {
      if (pdf.internal.getNumberOfPages() > 1) {
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`${reportData.projectName || 'SWFIA Terminal Expansion Phase II'}`, pageWidth / 2, 15, { align: 'center' })
        pdf.text(`Page ${pdf.internal.getNumberOfPages()} of ${pdf.internal.getNumberOfPages()}`, pageWidth - margin, 15, { align: 'right' })
      }
    }
    
    // Add footer to each page
    const addFooter = () => {
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`${reportData.companyName || 'HBS Consultants'}`, margin, pageHeight - 15)
      pdf.text(`${reportData.companyAddress || '368 Ashbury Way'}`, pageWidth / 2, pageHeight - 15, { align: 'center' })
      pdf.text(`${reportData.companyLocation || 'Naples, FL 34110'}`, pageWidth - margin, pageHeight - 15, { align: 'right' })
      pdf.text(`${reportData.companyPhone || '239.326.7846'}`, pageWidth / 2, pageHeight - 8, { align: 'center' })
    }
    
    // Add logo if available - position at top right
    if (reportData.logo) {
      try {
        const maxLogoWidth = 40
        const maxLogoHeight = 20
        const imageType = reportData.logo.includes('png') ? 'PNG' : 'JPEG'
        pdf.addImage(reportData.logo, imageType, pageWidth - margin - maxLogoWidth, yPosition, maxLogoWidth, maxLogoHeight, undefined, 'FAST')
      } catch (e) {
        console.error('Failed to add logo:', e)
      }
    }
    
    // Date at top left
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    const currentDate = new Date()
    pdf.text(`Date: ${currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, yPosition)
    yPosition += 15
    
    // Recipient section (Lee County Public Works)
    pdf.text('Lee County Public Works', margin, yPosition)
    yPosition += 6
    
    // Attention block
    pdf.text('Attn: Building and Permit Services', margin, yPosition)
    yPosition += 5
    pdf.text('     1500 Monroe St', margin, yPosition)
    yPosition += 5
    pdf.text('     Fort Myers, FL 33901', margin, yPosition)
    yPosition += 10
    
    // Reference block
    pdf.text('Ref: ' + (reportData.reference || reportData.projectName || 'Southwest Florida International Airport Terminal Expansion'), margin, yPosition)
    yPosition += 5
    pdf.text('     ' + (reportData.projectAddress || '11000 Terminal Access Road, Fort Myers, FL 33913'), margin, yPosition)
    yPosition += 5
    if (reportData.jobNumber) {
      pdf.text('     HBS Project Number: ' + reportData.jobNumber, margin, yPosition)
      yPosition += 10
    } else {
      yPosition += 5
    }
    
    // Main content paragraph - describing what was inspected
    const inspectionDescription = `HBS was on site ${currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} to inspect the following items:`
    const lines = pdf.splitTextToSize(inspectionDescription, contentWidth)
    pdf.text(lines, margin, yPosition)
    yPosition += lines.length * 5 + 5
    
    // Bullet point for what was inspected
    pdf.text('● ' + (reportData.workPerformed || 'Concrete placement'), margin, yPosition)
    yPosition += 10
    
    pdf.text('Our visual observations determined the following:', margin, yPosition)
    yPosition += 10
    
    // Crew section
    pdf.text('Crew:', margin, yPosition)
    yPosition += 6
    const crewItems = ['Suffolk', 'Baker', 'EGS', 'UES', 'HBS', 'Colliers']
    crewItems.forEach(crew => {
      pdf.text('· ' + crew, margin + 5, yPosition)
      yPosition += 5
    })
    yPosition += 5
    
    // Equipment section
    pdf.text('Equipment:', margin, yPosition)
    yPosition += 6
    const equipmentItems = ['Pump', 'Vibrator']
    equipmentItems.forEach(equipment => {
      pdf.text('· ' + equipment, margin + 5, yPosition)
      yPosition += 5
    })
    yPosition += 10
    
    // Inspection Report details box
    const reportNumber = reportData.reportSequence.padStart(3, '0')
    const inspectionTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    
    pdf.text(`Threshold Inspection Report: ${reportNumber}`, margin, yPosition)
    yPosition += 6
    pdf.text(`Date & Time of Inspection: ${reportData.inspectionDate}, ${inspectionTime}`, margin, yPosition)
    yPosition += 6
    pdf.text(`Inspector Name: ${reportData.inspectorName || 'Robert Sprehe'}`, margin, yPosition)
    yPosition += 6
    
    const weatherDesc = reportData.weather ? reportData.weather.split(',')[0] : 'Mostly Sunny'
    pdf.text(`Weather Conditions: ${weatherDesc}`, margin, yPosition)
    yPosition += 6
    
    const temp = reportData.weather ? reportData.weather.match(/\d+°F/)?.[0] : '80°F'
    pdf.text(`Temperature: ${temp}`, margin, yPosition)
    yPosition += 6
    
    pdf.text(`Work Zone: ${reportData.workZone || 'Concourse'}`, margin, yPosition)
    yPosition += 6
    
    pdf.text(`Work Performed:`, margin, yPosition)
    yPosition += 5
    pdf.text(`Plans Used:`, margin, yPosition)
    yPosition += 5
    pdf.text(`Current Date/Revision:`, margin, yPosition)
    yPosition += 5
    pdf.text(`Drawing Page:`, margin, yPosition)
    yPosition += 10
    
    // Right column for inspection details
    const rightColumnX = margin + 70
    let rightY = yPosition - 60
    
    pdf.setFont('helvetica', 'italic')
    pdf.text('Concrete Placement', rightColumnX, rightY)
    rightY += 5
    pdf.setFont('helvetica', 'normal')
    pdf.text(reportData.workZone || 'Concourse', rightColumnX, rightY)
    rightY += 5
    pdf.text('Aug 1 2024', rightColumnX, rightY)
    rightY += 5
    pdf.text(reportData.workZone || 'Concourse', rightColumnX, rightY)
    
    yPosition += 10
    
    checkPageBreak(30)
    
    // Observations section
    pdf.text('Observations:', margin, yPosition)
    yPosition += 10
    
    // Specific observation with number
    pdf.text(`${reportNumber}.01 ${reportData.observations || 'Observed the placement of 160 CY of Mix design 40355 concrete into the location noted above. The observed slump was 4 ½ " and the observed temperature was 81 degrees. Batch time 3:55 am, Placement time 4:28 am.'}`, margin + 10, yPosition)
    yPosition += 25
    
    // Exceptions section
    pdf.text('Exceptions:', margin, yPosition)
    yPosition += 10
    pdf.text(`${reportNumber}.01    None Noted`, margin + 10, yPosition)
    yPosition += 15
    
    // Professional opinion statement
    checkPageBreak(25)
    yPosition += 10
    
    const professionalOpinion = 'It is my professional opinion that the observed structural elements were completed in substantial accordance with the approved project documents and specifications and as modified by RFI\'s approved by the Structural Engineer of Record.'
    const opinionLines = pdf.splitTextToSize(professionalOpinion, contentWidth)
    pdf.text(opinionLines, margin, yPosition)
    yPosition += opinionLines.length * 5 + 10
    
    // Signature section
    pdf.text('Respectfully Submitted,', margin, yPosition)
    yPosition += 15
    
    // Add signature if available
    if (reportData.digitalSignature) {
      try {
        if (reportData.digitalSignature.startsWith('data:image')) {
          const sigWidth = 60
          const sigHeight = 20
          const imageType = reportData.digitalSignature.includes('png') ? 'PNG' : 'JPEG'
          pdf.addImage(reportData.digitalSignature, imageType, margin, yPosition, sigWidth, sigHeight, undefined, 'FAST')
          yPosition += sigHeight + 5
        }
      } catch (e) {
        console.error('Failed to add signature:', e)
        yPosition += 20
      }
    } else {
      yPosition += 20
    }
    
    // Inspector credentials
    pdf.text(`${reportData.inspectorName || 'Robert S. Sprehe'}, S.I., P.E.`, margin, yPosition)
    yPosition += 5
    pdf.text(`Florida License No. ${reportData.inspectorLicense || 'PE74791'}`, margin, yPosition)
    yPosition += 5
    pdf.text(`${reportData.companyName || 'HBS Consultants'}, LLC`, margin, yPosition)
    yPosition += 5
    pdf.text(`${reportData.inspectorEmail || 'robert@hbspe.com'}`, margin, yPosition)
    yPosition += 15
    
    // Enclosures/Attachments
    pdf.text('Enclosures/Attachments', margin, yPosition)
    yPosition += 6
    pdf.text('     Exhibit A: Site Drawing Location Map', margin, yPosition)
    yPosition += 5
    pdf.text('     Exhibit B: Site Photos', margin, yPosition)
    yPosition += 10
    
    // CC list
    pdf.text('cc: Lee County Port Authority', margin, yPosition)
    yPosition += 5
    pdf.text('    Atkins', margin, yPosition)
    yPosition += 5
    pdf.text('    Manhattan Construction', margin, yPosition)
    yPosition += 5
    pdf.text('    EG Solutions', margin, yPosition)
    yPosition += 15
    
    // Add second page with continuation
    checkPageBreak(50)
    
    // Page 2 header
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`${reportData.projectName || 'SWFIA Terminal Expansion Phase II'}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 5
    pdf.text('Page 2 of 6', pageWidth - margin, yPosition, { align: 'right' })
    yPosition += 15
    
    // Observations section on page 2
    pdf.text('Observations:', margin, yPosition)
    yPosition += 10
    
    pdf.text(`${reportNumber}.01    ${reportData.observations || 'Observed the placement of 160 CY of Mix design 40355 concrete into the location noted above. The observed slump was 4 ½ " and the observed temperature was 81 degrees. Batch time 3:55 am, Placement time 4:28 am.'}`, margin + 10, yPosition)
    yPosition += 25
    
    // Exceptions on page 2
    pdf.text('Exceptions:', margin, yPosition)
    yPosition += 10
    pdf.text(`${reportNumber}.01    None Noted`, margin + 10, yPosition)
    yPosition += 15
    
    // Repeat professional opinion
    const professionalOpinion2 = 'It is my professional opinion that the observed structural elements were completed in substantial accordance with the approved project documents and specifications and as modified by RFI\'s approved by the Structural Engineer of Record.'
    const opinionLines2 = pdf.splitTextToSize(professionalOpinion2, contentWidth)
    pdf.text(opinionLines2, margin, yPosition)
    yPosition += opinionLines2.length * 5 + 10
    
    // Repeat signature section
    pdf.text('Respectfully Submitted,', margin, yPosition)
    yPosition += 20
    
    pdf.text(`${reportData.inspectorName || 'Robert S. Sprehe'}, S.I., P.E.`, margin, yPosition)
    yPosition += 5
    pdf.text(`Florida License No. ${reportData.inspectorLicense || 'PE74791'}`, margin, yPosition)
    yPosition += 5
    pdf.text(`${reportData.companyName || 'HBS Consultants'}, LLC`, margin, yPosition)
    yPosition += 5
    pdf.text(`${reportData.inspectorEmail || 'robert@hbspe.com'}`, margin, yPosition)
    yPosition += 15
    
    // Repeat enclosures
    pdf.text('Enclosures/Attachments', margin, yPosition)
    yPosition += 6
    pdf.text('     Exhibit A: Site Drawing Location Map', margin, yPosition)
    yPosition += 5
    pdf.text('     Exhibit B: Site Photos', margin, yPosition)
    yPosition += 10
    
    // Repeat CC list
    pdf.text('cc: Lee County Port Authority', margin, yPosition)
    yPosition += 5
    pdf.text('    Atkins', margin, yPosition)
    yPosition += 5
    pdf.text('    Manhattan Construction', margin, yPosition)
    yPosition += 5
    pdf.text('    EG Solutions', margin, yPosition)
    
    // Page 3 - Limitations
    pdf.addPage()
    addHeader()
    yPosition = margin + 15
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`${reportData.projectName || 'SWFIA Terminal Expansion Phase II'}`, pageWidth / 2, 15, { align: 'center' })
    pdf.text('Page 3 of 6', pageWidth - margin, 15, { align: 'right' })
    
    yPosition = margin + 25
    pdf.setFont('helvetica', 'bold')
    pdf.text('Limitations', margin, yPosition)
    yPosition += 10
    
    pdf.setFont('helvetica', 'normal')
    const limitationsText = 'Our observations are based upon nondestructive testing techniques. The conclusions, analysis, and opinions expressed herein have been prepared within a reasonable degree of engineering certainty. They are based on the results and interpretations of the testing and/or data collection activities performed at the site, the information available at the time the report was issued, and the education, training, knowledge, skill, and experience of the author and/or licensed professional engineer.\n\nThe contents of this report are confidential and intended for the use of the Property Owner, and his representatives or clients. Contents of this report may also be privileged or otherwise protected by work product immunity or other legal rules. No liability is assumed for the misuse of this information by others and reserves the right to update this report should additional information become available.'
    const limitationsLines = pdf.splitTextToSize(limitationsText, contentWidth)
    pdf.text(limitationsLines, margin, yPosition)
    yPosition += limitationsLines.length * 5
    
    // Pages 4-6 for Exhibits
    if (actualPhotos && actualPhotos.length > 0) {
      // Page 4 - Exhibit A
      pdf.addPage()
      pdf.text(`${reportData.projectName || 'SWFIA Terminal Expansion Phase II'}`, pageWidth / 2, 15, { align: 'center' })
      pdf.text('Page 4 of 6', pageWidth - margin, 15, { align: 'right' })
      
      yPosition = margin + 35
      pdf.setFont('helvetica', 'bold')
      pdf.text('Exhibit A', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 20
      
      // Add site drawing if available (placeholder for now)
      pdf.setFont('helvetica', 'normal')
      pdf.text('[Site Drawing Location Map]', pageWidth / 2, yPosition, { align: 'center' })
      
      // Page 5-6 - Exhibit B (Photos)
      pdf.addPage()
      pdf.text(`${reportData.projectName || 'SWFIA Terminal Expansion Phase II'}`, pageWidth / 2, 15, { align: 'center' })
      pdf.text('Page 5 of 6', pageWidth - margin, 15, { align: 'right' })
      
      yPosition = margin + 35
      pdf.setFont('helvetica', 'bold')
      pdf.text('Exhibit B', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 20
      
      // Add actual photos
      actualPhotos.slice(0, 2).forEach((photo, index) => {
        if (photo.url && photo.url.startsWith('data:image')) {
          try {
            const imgWidth = 120
            const imgHeight = 90
            const imageType = photo.url.includes('png') ? 'PNG' : 'JPEG'
            const xPos = pageWidth / 2 - imgWidth / 2
            pdf.addImage(photo.url, imageType, xPos, yPosition, imgWidth, imgHeight, undefined, 'FAST')
            yPosition += imgHeight + 10
          } catch (e) {
            console.error('Failed to add photo:', e)
          }
        }
      })
      
      // Page 6 for additional photos
      if (actualPhotos.length > 2) {
        pdf.addPage()
        pdf.text(`${reportData.projectName || 'SWFIA Terminal Expansion Phase II'}`, pageWidth / 2, 15, { align: 'center' })
        pdf.text('Page 6 of 6', pageWidth - margin, 15, { align: 'right' })
        yPosition = margin + 25
        
        actualPhotos.slice(2).forEach((photo, index) => {
          if (photo.url && photo.url.startsWith('data:image')) {
            try {
              const imgWidth = 120
              const imgHeight = 90
              const imageType = photo.url.includes('png') ? 'PNG' : 'JPEG'
              const xPos = pageWidth / 2 - imgWidth / 2
              pdf.addImage(photo.url, imageType, xPos, yPosition, imgWidth, imgHeight, undefined, 'FAST')
              yPosition += imgHeight + 10
            } catch (e) {
              console.error('Failed to add photo:', e)
            }
          }
        })
      }
    }
    
    // Add footers to all pages
    const totalPages = pdf.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      addFooter()
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspector Email</label>
              <div className="bg-yellow-50 p-3 rounded">
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={reportData.inspectorEmail}
                  onChange={(e) => setReportData({ ...reportData, inspectorEmail: e.target.value })}
                  placeholder=""
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
              <div className="bg-yellow-50 p-3 rounded">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={reportData.companyAddress}
                  onChange={(e) => setReportData({ ...reportData, companyAddress: e.target.value })}
                  placeholder=""
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Location</label>
              <div className="bg-yellow-50 p-3 rounded">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={reportData.companyLocation}
                  onChange={(e) => setReportData({ ...reportData, companyLocation: e.target.value })}
                  placeholder=""
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Phone</label>
              <div className="bg-yellow-50 p-3 rounded">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={reportData.companyPhone}
                  onChange={(e) => setReportData({ ...reportData, companyPhone: e.target.value })}
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