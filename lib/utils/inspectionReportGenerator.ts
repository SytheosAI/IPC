import { ReportGenerator, BaseReportData } from './reportGenerator'
import { InspectionReportData } from '../types/reports'

export class InspectionReportGenerator extends ReportGenerator {

  public generateSpecificContent(reportData: InspectionReportData): void {
    // Generate base report structure first
    this.generateBaseReport(reportData)

    // Add inspection-specific content
    this.addInspectionDetails(reportData)
    this.addObservationsSection(reportData)
    // Signature, photos and limitations would go here if needed
  }

  private addInspectionDetails(reportData: InspectionReportData): void {
    const pdf = this.pdfInstance
    const { margin } = this.pageProperties
    let yPosition = this.currentYPosition

    // Main content paragraph - describing what was inspected
    const currentDate = new Date()
    const inspectionDescription = `HBS was on site ${currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} to inspect the following items:`
    const lines = pdf.splitTextToSize(inspectionDescription, this.pageProperties.contentWidth)
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
    pdf.text(`Drawing Page: ${reportData.drawingPage || ''}`, margin, yPosition)
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

    this.currentYPosition = yPosition + 10
  }

  private addObservationsSection(reportData: InspectionReportData): void {
    const pdf = this.pdfInstance
    const { margin } = this.pageProperties
    let yPosition = this.currentYPosition

    // Check page break
    if (yPosition + 60 > this.pageProperties.height - 40) {
      pdf.addPage()
      yPosition = margin + 15
    }

    // Observations section
    pdf.text('Observations:', margin, yPosition)
    yPosition += 10

    const reportNumber = reportData.reportSequence.padStart(3, '0')

    // Specific observation with number
    const observationText = `${reportNumber}.01 ${reportData.observations || 'Observed the placement of 160 CY of Mix design 40355 concrete into the location noted above. The observed slump was 4 ½ " and the observed temperature was 81 degrees. Batch time 3:55 am, Placement time 4:28 am.'}`
    const obsLines = pdf.splitTextToSize(observationText, this.pageProperties.contentWidth - 10)
    pdf.text(obsLines, margin + 10, yPosition)
    yPosition += obsLines.length * 5 + 10

    // Exceptions section
    pdf.text('Exceptions:', margin, yPosition)
    yPosition += 10
    pdf.text(`${reportNumber}.01    None Noted`, margin + 10, yPosition)
    yPosition += 15

    // Professional opinion statement
    yPosition += 10
    const professionalOpinion = 'It is my professional opinion that the observed structural elements were completed in substantial accordance with the approved project documents and specifications and as modified by RFI\'s approved by the Structural Engineer of Record.'
    const opinionLines = pdf.splitTextToSize(professionalOpinion, this.pageProperties.contentWidth)
    pdf.text(opinionLines, margin, yPosition)
    yPosition += opinionLines.length * 5 + 10

    this.currentYPosition = yPosition
  }

  public static async generateInspectionReport(reportData: InspectionReportData): Promise<Blob> {
    const generator = new InspectionReportGenerator()
    generator.generateSpecificContent(reportData)
    return generator.generateReport()
  }
}