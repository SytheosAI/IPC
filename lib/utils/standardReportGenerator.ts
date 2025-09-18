import jsPDF from 'jspdf'
import { BaseReportData } from '@/lib/types/reports'

export class StandardReportGenerator {
  protected pdf: jsPDF
  protected pageWidth: number
  protected pageHeight: number
  protected margin: number = 20
  protected contentWidth: number
  protected yPosition: number

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'letter')
    this.pageWidth = this.pdf.internal.pageSize.getWidth()
    this.pageHeight = this.pdf.internal.pageSize.getHeight()
    this.contentWidth = this.pageWidth - (this.margin * 2)
    this.yPosition = this.margin
  }

  // Helper function to check page overflow and add headers/footers
  protected checkPageBreak(additionalHeight: number): boolean {
    if (this.yPosition + additionalHeight > this.pageHeight - 40) {
      this.addFooter()
      this.pdf.addPage()
      this.addPageHeader()
      this.yPosition = this.margin + 15
      return true
    }
    return false
  }

  // Add page header (for pages 2+)
  protected addPageHeader() {
    if (this.pdf.internal.getNumberOfPages() > 1) {
      this.pdf.setFontSize(10)
      this.pdf.setFont('helvetica', 'normal')
      this.pdf.text('HBS Consultants Report', this.pageWidth / 2, 15, { align: 'center' })
      this.pdf.text(`Page ${this.pdf.internal.getNumberOfPages()}`, this.pageWidth - this.margin, 15, { align: 'right' })
    }
  }

  // Add footer to each page
  protected addFooter() {
    this.pdf.setFontSize(8)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text('HBS Consultants', this.margin, this.pageHeight - 15)
    this.pdf.text('368 Ashbury Way', this.pageWidth / 2, this.pageHeight - 15, { align: 'center' })
    this.pdf.text('Naples, FL 34110', this.pageWidth - this.margin, this.pageHeight - 15, { align: 'right' })
    this.pdf.text('239-326-7846', this.pageWidth / 2, this.pageHeight - 8, { align: 'center' })
  }

  // Add date and logo header
  protected addDateAndLogo(reportData: BaseReportData) {
    // Date at top left
    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'normal')
    const currentDate = new Date()
    this.pdf.text(currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }), this.margin, this.yPosition)

    // Add logo if available - position at top right
    if (reportData.logo) {
      try {
        const maxLogoWidth = 40
        const maxLogoHeight = 20
        const imageType = reportData.logo.includes('png') ? 'PNG' : 'JPEG'
        this.pdf.addImage(reportData.logo, imageType, this.pageWidth - this.margin - maxLogoWidth, this.yPosition - 5, maxLogoWidth, maxLogoHeight, undefined, 'FAST')
      } catch (e) {
        console.error('Failed to add logo:', e)
      }
    }

    this.yPosition += 20
  }

  // Add recipient information
  protected addRecipientInfo(reportData: BaseReportData) {
    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'normal')

    // Project name and address
    this.pdf.text(reportData.projectName, this.margin, this.yPosition)
    this.yPosition += 5
    this.pdf.text(reportData.projectAddress, this.margin, this.yPosition)
    this.yPosition += 10

    // Attention line
    const attentionText = reportData.attention || 'Building Department'
    this.pdf.text(`Attn: ${attentionText}`, this.margin, this.yPosition)
    this.yPosition += 15
  }

  // Add reference section
  protected addReference(reportData: BaseReportData, reportType: string) {
    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'normal')

    this.pdf.text(`RE: ${reportType}`, this.margin, this.yPosition)
    this.yPosition += 5

    if (reportData.reference) {
      const referenceLines = this.pdf.splitTextToSize(reportData.reference, this.contentWidth - 20)
      referenceLines.forEach((line: string) => {
        this.pdf.text(`     ${line}`, this.margin, this.yPosition)
        this.yPosition += 5
      })
    } else {
      this.pdf.text(`     ${reportData.projectName}`, this.margin, this.yPosition)
      this.yPosition += 5
      this.pdf.text(`     ${reportData.projectAddress}`, this.margin, this.yPosition)
      this.yPosition += 5
      if (reportData.jobNumber) {
        this.pdf.text(`     HBS Project Number: ${reportData.jobNumber}`, this.margin, this.yPosition)
        this.yPosition += 5
      }
    }

    this.yPosition += 10
  }

  // Add professional introduction
  protected addIntroduction(reportData: BaseReportData, scopeDescription: string) {
    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'normal')

    const recipientTitle = reportData.attention || 'Project Team'
    this.pdf.text(`${recipientTitle}:`, this.margin, this.yPosition)
    this.yPosition += 10

    const introText = `Subsequent to your request, a review of the existing conditions was conducted by ${reportData.inspectorName || 'Mr. Robert Sprehe, PE, SI'}, of ${reportData.companyName || 'HBS Consultants'} (HBS), at the above referenced property. More specifically, the scope of this service assignment is to ${scopeDescription}.`

    const introLines = this.pdf.splitTextToSize(introText, this.contentWidth)
    introLines.forEach((line: string) => {
      this.pdf.text(line, this.margin, this.yPosition)
      this.yPosition += 5
    })

    this.yPosition += 10
  }

  // Add signature section
  protected addSignature(reportData: BaseReportData, includeSeal: boolean = false) {
    this.checkPageBreak(40)

    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'normal')
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
    if (includeSeal && (reportData as any).digitalSeal) {
      try {
        const sealData = (reportData as any).digitalSeal
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
    const inspectorName = reportData.inspectorName || 'Robert S. Sprehe'
    const inspectorTitle = includeSeal ? ', P.E., S.I.' : ', P.E.'
    this.pdf.text(`${inspectorName}${inspectorTitle}`, this.margin, this.yPosition)
    this.yPosition += 5
    this.pdf.text(`Florida License No. ${reportData.inspectorLicense || 'PE74791'}`, this.margin, this.yPosition)
    this.yPosition += 5
    this.pdf.text(`${reportData.inspectorEmail || 'robert@hbspe.com'}`, this.margin, this.yPosition)
    this.yPosition += 15
  }

  // Add limitations section
  protected addLimitations() {
    this.checkPageBreak(60)

    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Limitations', this.margin, this.yPosition)
    this.yPosition += 10

    this.pdf.setFont('helvetica', 'normal')
    const limitationsText = 'The conclusions, analysis, and opinions expressed herein have been prepared within a reasonable degree of engineering certainty. They are based on the results and interpretations of the testing and/or data collection activities performed at the site, the information available at the time the report was issued, and the education, training, knowledge, skill, and experience of the author and/or licensed professional engineer.\n\nThe contents of this report are confidential and intended for the use of the Property Owner, and his representatives or clients. Contents of this report may also be privileged or otherwise protected by work product immunity or other legal rules. No liability is assumed for the misuse of this information by others and reserves the right to update this report should additional information become available.'

    const limitationsLines = this.pdf.splitTextToSize(limitationsText, this.contentWidth)
    limitationsLines.forEach((line: string) => {
      this.checkPageBreak(5)
      this.pdf.text(line, this.margin, this.yPosition)
      this.yPosition += 5
    })
  }

  // Add photos section
  protected addPhotos(reportData: BaseReportData) {
    if (reportData.photos && reportData.photos.length > 0) {
      this.pdf.addPage()
      this.addPageHeader()
      this.yPosition = this.margin + 25

      this.pdf.setFont('helvetica', 'bold')
      this.pdf.setFontSize(12)
      this.pdf.text('Photo Documentation', this.pageWidth / 2, this.yPosition, { align: 'center' })
      this.yPosition += 20

      // Add photos in a grid layout
      let photosPerRow = 2
      let photoWidth = (this.contentWidth - 10) / photosPerRow
      let photoHeight = photoWidth * 0.75
      let xPosition = this.margin
      let photoCount = 0

      reportData.photos.forEach((photo, index) => {
        if (photo.url && photo.url.startsWith('data:image')) {
          try {
            // Check if we need a new row
            if (photoCount > 0 && photoCount % photosPerRow === 0) {
              this.yPosition += photoHeight + 15
              xPosition = this.margin
              this.checkPageBreak(photoHeight + 20)
            }

            const imageType = photo.url.includes('png') ? 'PNG' : 'JPEG'
            this.pdf.addImage(photo.url, imageType, xPosition, this.yPosition, photoWidth, photoHeight, undefined, 'FAST')

            // Add caption
            this.pdf.setFont('helvetica', 'normal')
            this.pdf.setFontSize(8)
            const captionLines = this.pdf.splitTextToSize(photo.caption || `Photo ${index + 1}`, photoWidth)
            let captionY = this.yPosition + photoHeight + 5
            captionLines.forEach((line: string) => {
              this.pdf.text(line, xPosition + photoWidth / 2, captionY, { align: 'center' })
              captionY += 4
            })

            xPosition += photoWidth + 5
            photoCount++

          } catch (e) {
            console.error('Failed to add photo:', e)
          }
        }
      })
    }
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

  // Helper methods for content formatting
  protected addSection(title: string, content: string) {
    this.checkPageBreak(20)

    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text(`${title}:`, this.margin, this.yPosition)
    this.yPosition += 8

    this.pdf.setFont('helvetica', 'normal')
    const contentLines = this.pdf.splitTextToSize(content, this.contentWidth)
    contentLines.forEach((line: string) => {
      this.checkPageBreak(5)
      this.pdf.text(line, this.margin, this.yPosition)
      this.yPosition += 5
    })
    this.yPosition += 5
  }

  protected addBulletList(items: string[]) {
    items.forEach(item => {
      this.checkPageBreak(5)
      this.pdf.text(`• ${item}`, this.margin + 5, this.yPosition)
      this.yPosition += 5
    })
    this.yPosition += 5
  }

  protected addNumberedList(items: string[]) {
    items.forEach((item, index) => {
      this.checkPageBreak(5)
      this.pdf.text(`${index + 1}. ${item}`, this.margin + 5, this.yPosition)
      this.yPosition += 5
    })
    this.yPosition += 5
  }
}