import jsPDF from 'jspdf'

export interface BaseReportData {
  // Project Information
  projectName: string
  projectAddress: string
  jobNumber: string
  permitNumber?: string
  contractNumber?: string

  // Company Information
  companyName: string
  companyAddress: string
  companyLocation: string
  companyPhone: string
  logo: string | null

  // Inspector/Engineer Information
  inspectorName: string
  inspectorLicense: string
  inspectorEmail: string

  // Report Information
  reportTitle: string
  reportSequence: string
  reportDate: string

  // Additional Information
  reference: string
  attention: string
  digitalSignature: string | null
  digitalSeal?: string | null // For engineering reports

  // Content
  generalContext: string
  observations: string
  recommendations: string

  // Photos
  photos: Array<{
    id: string
    url: string
    caption: string
  }>
}

export interface ComplianceReportData extends BaseReportData {
  complianceStandard: string
  complianceStatus: 'compliant' | 'non-compliant' | 'partial'
  violations: string[]
  correctiveActions: string
  complianceDate: string
  nextReviewDate: string
}

export interface SafetyIncidentReportData extends BaseReportData {
  incidentType: string
  incidentDate: string
  incidentTime: string
  injuredParty: string
  witnessNames: string[]
  incidentDescription: string
  immediateActions: string
  rootCause: string
  preventiveMeasures: string
  reportedToOSHA: boolean
  severity: 'minor' | 'moderate' | 'severe' | 'fatal'
}

export interface MaterialDefectReportData extends BaseReportData {
  materialType: string
  manufacturer: string
  batchLotNumber: string
  defectType: string
  defectDescription: string
  affectedQuantity: string
  discoveryDate: string
  supplierNotified: boolean
  replacementRequired: boolean
  costImpact: string
}

export interface EngineeringReportData extends BaseReportData {
  engineeringSeal: string | null
  reportType: 'structural' | 'design' | 'analysis' | 'inspection' | 'assessment'
  engineeringStandards: string[]
  calculationsAttached: boolean
  drawingsAttached: boolean
  professionalOpinion: string
  engineeringRecommendations: string
  limitationsAndAssumptions: string
  peerReviewRequired: boolean
  sealDate: string
}

export class ReportGenerator {
  private pdf: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margin: number = 20
  private contentWidth: number
  private yPosition: number

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'letter')
    this.pageWidth = this.pdf.internal.pageSize.getWidth()
    this.pageHeight = this.pdf.internal.pageSize.getHeight()
    this.contentWidth = this.pageWidth - (this.margin * 2)
    this.yPosition = this.margin
  }

  // Helper function to check page overflow and add headers/footers
  private checkPageBreak(additionalHeight: number): boolean {
    if (this.yPosition + additionalHeight > this.pageHeight - 40) {
      this.addFooter()
      this.pdf.addPage()
      this.addHeader()
      this.yPosition = this.margin + 15
      return true
    }
    return false
  }

  // Add header to each page (except first)
  private addHeader() {
    if (this.pdf.internal.getNumberOfPages() > 1) {
      this.pdf.setFontSize(10)
      this.pdf.setFont('helvetica', 'normal')
      this.pdf.text('HBS Consultants Report', this.pageWidth / 2, 15, { align: 'center' })
      this.pdf.text(`Page ${this.pdf.internal.getNumberOfPages()}`, this.pageWidth - this.margin, 15, { align: 'right' })
    }
  }

  // Add footer to each page
  private addFooter() {
    this.pdf.setFontSize(8)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text('HBS Consultants', this.margin, this.pageHeight - 15)
    this.pdf.text('368 Ashbury Way', this.pageWidth / 2, this.pageHeight - 15, { align: 'center' })
    this.pdf.text('Naples, FL 34110', this.pageWidth - this.margin, this.pageHeight - 15, { align: 'right' })
    this.pdf.text('239.326.7846', this.pageWidth / 2, this.pageHeight - 8, { align: 'center' })
  }

  // Add logo and date header
  private addLogoAndDate(reportData: BaseReportData) {
    // Add logo if available - position at top right
    if (reportData.logo) {
      try {
        const maxLogoWidth = 40
        const maxLogoHeight = 20
        const imageType = reportData.logo.includes('png') ? 'PNG' : 'JPEG'
        this.pdf.addImage(reportData.logo, imageType, this.pageWidth - this.margin - maxLogoWidth, this.yPosition, maxLogoWidth, maxLogoHeight, undefined, 'FAST')
      } catch (e) {
        console.error('Failed to add logo:', e)
      }
    }

    // Date at top left
    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'normal')
    const currentDate = new Date()
    this.pdf.text(`Date: ${currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, this.margin, this.yPosition)
    this.yPosition += 15
  }

  // Add recipient section
  private addRecipientSection(reportData: BaseReportData) {
    this.pdf.text('Lee County Public Works', this.margin, this.yPosition)
    this.yPosition += 6

    // Attention block
    this.pdf.text('Attn: Building and Permit Services', this.margin, this.yPosition)
    this.yPosition += 5
    this.pdf.text('     1500 Monroe St', this.margin, this.yPosition)
    this.yPosition += 5
    this.pdf.text('     Fort Myers, FL 33901', this.margin, this.yPosition)
    this.yPosition += 10
  }

  // Add reference section
  private addReferenceSection(reportData: BaseReportData) {
    this.pdf.text('Ref: ' + (reportData.reference || reportData.projectName), this.margin, this.yPosition)
    this.yPosition += 5
    this.pdf.text('     ' + reportData.projectAddress, this.margin, this.yPosition)
    this.yPosition += 5
    if (reportData.jobNumber) {
      this.pdf.text('     HBS Project Number: ' + reportData.jobNumber, this.margin, this.yPosition)
      this.yPosition += 10
    } else {
      this.yPosition += 5
    }
  }

  // Add signature section
  private addSignatureSection(reportData: BaseReportData, includeSeal: boolean = false) {
    this.pdf.text('Respectfully Submitted,', this.margin, this.yPosition)
    this.yPosition += 15

    // Add signature if available
    if (reportData.digitalSignature) {
      try {
        if (reportData.digitalSignature.startsWith('data:image')) {
          const sigWidth = 60
          const sigHeight = 20
          const imageType = reportData.digitalSignature.includes('png') ? 'PNG' : 'JPEG'
          this.pdf.addImage(reportData.digitalSignature, imageType, this.margin, this.yPosition, sigWidth, sigHeight, undefined, 'FAST')
          this.yPosition += sigHeight + 5
        }
      } catch (e) {
        console.error('Failed to add signature:', e)
        this.yPosition += 20
      }
    } else {
      this.yPosition += 20
    }

    // Add digital seal for engineering reports
    if (includeSeal && (reportData as EngineeringReportData).engineeringSeal) {
      try {
        const sealData = (reportData as EngineeringReportData).engineeringSeal
        if (sealData && sealData.startsWith('data:image')) {
          const sealWidth = 40
          const sealHeight = 40
          const imageType = sealData.includes('png') ? 'PNG' : 'JPEG'
          this.pdf.addImage(sealData, imageType, this.margin + 70, this.yPosition - 25, sealWidth, sealHeight, undefined, 'FAST')
        }
      } catch (e) {
        console.error('Failed to add engineering seal:', e)
      }
    }

    // Inspector credentials
    this.pdf.text(`${reportData.inspectorName}, P.E.`, this.margin, this.yPosition)
    this.yPosition += 5
    this.pdf.text(`Florida License No. ${reportData.inspectorLicense}`, this.margin, this.yPosition)
    this.yPosition += 5
    this.pdf.text(`${reportData.companyName}`, this.margin, this.yPosition)
    this.yPosition += 5
    this.pdf.text(`${reportData.inspectorEmail}`, this.margin, this.yPosition)
    this.yPosition += 15
  }

  // Add photos section
  private addPhotosSection(reportData: BaseReportData) {
    if (reportData.photos && reportData.photos.length > 0) {
      // Add Exhibit B page
      this.pdf.addPage()
      this.pdf.text(`${reportData.projectName}`, this.pageWidth / 2, 15, { align: 'center' })

      this.yPosition = this.margin + 35
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.text('Exhibit B - Photos', this.pageWidth / 2, this.yPosition, { align: 'center' })
      this.yPosition += 20

      // Add photos
      reportData.photos.slice(0, 4).forEach((photo, index) => {
        if (photo.url && photo.url.startsWith('data:image')) {
          try {
            const imgWidth = 120
            const imgHeight = 90
            const imageType = photo.url.includes('png') ? 'PNG' : 'JPEG'
            const xPos = this.pageWidth / 2 - imgWidth / 2
            this.pdf.addImage(photo.url, imageType, xPos, this.yPosition, imgWidth, imgHeight, undefined, 'FAST')
            this.yPosition += imgHeight + 10

            // Add caption
            this.pdf.setFont('helvetica', 'normal')
            this.pdf.setFontSize(9)
            this.pdf.text(photo.caption, this.pageWidth / 2, this.yPosition, { align: 'center' })
            this.yPosition += 15
          } catch (e) {
            console.error('Failed to add photo:', e)
          }
        }
      })
    }
  }

  // Add limitations page
  private addLimitationsPage() {
    this.pdf.addPage()
    this.yPosition = this.margin + 25

    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Limitations', this.margin, this.yPosition)
    this.yPosition += 10

    this.pdf.setFont('helvetica', 'normal')
    const limitationsText = 'Our observations are based upon nondestructive testing techniques. The conclusions, analysis, and opinions expressed herein have been prepared within a reasonable degree of engineering certainty. They are based on the results and interpretations of the testing and/or data collection activities performed at the site, the information available at the time the report was issued, and the education, training, knowledge, skill, and experience of the author and/or licensed professional engineer.\n\nThe contents of this report are confidential and intended for the use of the Property Owner, and his representatives or clients. Contents of this report may also be privileged or otherwise protected by work product immunity or other legal rules. No liability is assumed for the misuse of this information by others and reserves the right to update this report should additional information become available.'
    const limitationsLines = this.pdf.splitTextToSize(limitationsText, this.contentWidth)
    this.pdf.text(limitationsLines, this.margin, this.yPosition)
  }

  // Generate and return PDF blob
  public generateReport(): Blob {
    // Add footers to all pages
    const totalPages = this.pdf.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i)
      this.addFooter()
    }

    return this.pdf.output('blob')
  }

  // Abstract method to be implemented by specific report types
  public generateSpecificContent(reportData: any): void {
    throw new Error('Must implement generateSpecificContent in subclass')
  }

  // Main generation method
  public generateBaseReport(reportData: BaseReportData): void {
    this.addLogoAndDate(reportData)
    this.addRecipientSection(reportData)
    this.addReferenceSection(reportData)
  }

  // Getters for protected properties
  public get currentYPosition(): number { return this.yPosition }
  public set currentYPosition(value: number) { this.yPosition = value }
  public get pdfInstance(): jsPDF { return this.pdf }
  public get pageProperties() {
    return {
      width: this.pageWidth,
      height: this.pageHeight,
      margin: this.margin,
      contentWidth: this.contentWidth
    }
  }
}