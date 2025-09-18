import { ReportGenerator } from './reportGenerator'
import { ComplianceReportData } from '../types/reports'

export class ComplianceReportGenerator extends ReportGenerator {

  public generateSpecificContent(reportData: ComplianceReportData): void {
    // Generate base report structure first
    this.generateBaseReport(reportData)

    // Add compliance-specific content
    this.addComplianceDetails(reportData)
    this.addComplianceFindings(reportData)
    this.addCorrectiveActions(reportData)
    // Signature, photos and limitations would go here if needed
  }

  private addComplianceDetails(reportData: ComplianceReportData): void {
    const pdf = this.pdfInstance
    const { margin } = this.pageProperties
    let yPosition = this.currentYPosition

    // Compliance audit introduction
    const currentDate = new Date()
    const auditDescription = `HBS conducted a compliance audit on ${currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} to verify adherence to the following standards and requirements:`
    const lines = pdf.splitTextToSize(auditDescription, this.pageProperties.contentWidth)
    pdf.text(lines, margin, yPosition)
    yPosition += lines.length * 5 + 10

    // Compliance standard
    pdf.text('● ' + (reportData.complianceStandard || 'Florida Building Code'), margin, yPosition)
    yPosition += 10

    // Audit scope
    if (reportData.auditScope) {
      pdf.text('Audit Scope:', margin, yPosition)
      yPosition += 6
      const scopeLines = pdf.splitTextToSize(reportData.auditScope, this.pageProperties.contentWidth - 20)
      pdf.text(scopeLines, margin + 10, yPosition)
      yPosition += scopeLines.length * 5 + 10
    }

    // Compliance Report details box
    const reportNumber = reportData.reportSequence.padStart(3, '0')

    pdf.text(`Compliance Report: ${reportNumber}`, margin, yPosition)
    yPosition += 6
    pdf.text(`Date of Audit: ${reportData.complianceDate}`, margin, yPosition)
    yPosition += 6
    pdf.text(`Compliance Standard: ${reportData.complianceStandard}`, margin, yPosition)
    yPosition += 6
    pdf.text(`Compliance Status: ${this.formatComplianceStatus(reportData.complianceStatus)}`, margin, yPosition)
    yPosition += 6

    if (reportData.nextReviewDate) {
      pdf.text(`Next Review Date: ${reportData.nextReviewDate}`, margin, yPosition)
      yPosition += 10
    } else {
      yPosition += 5
    }

    this.currentYPosition = yPosition
  }

  private addComplianceFindings(reportData: ComplianceReportData): void {
    const pdf = this.pdfInstance
    const { margin } = this.pageProperties
    let yPosition = this.currentYPosition

    // Check page break
    if (yPosition + 80 > this.pageProperties.height - 40) {
      pdf.addPage()
      yPosition = margin + 15
    }

    // Regulatory Requirements section
    if (reportData.regulatoryRequirements) {
      pdf.setFont('helvetica', 'bold')
      pdf.text('Regulatory Requirements:', margin, yPosition)
      yPosition += 8
      pdf.setFont('helvetica', 'normal')

      const reqLines = pdf.splitTextToSize(reportData.regulatoryRequirements, this.pageProperties.contentWidth - 10)
      pdf.text(reqLines, margin + 10, yPosition)
      yPosition += reqLines.length * 5 + 10
    }

    // Observations section
    pdf.setFont('helvetica', 'bold')
    pdf.text('Compliance Findings:', margin, yPosition)
    yPosition += 8
    pdf.setFont('helvetica', 'normal')

    const reportNumber = reportData.reportSequence.padStart(3, '0')

    // Main observations
    const observationText = `${reportNumber}.01 ${reportData.observations || 'Compliance audit findings and observations are documented below.'}`
    const obsLines = pdf.splitTextToSize(observationText, this.pageProperties.contentWidth - 10)
    pdf.text(obsLines, margin + 10, yPosition)
    yPosition += obsLines.length * 5 + 10

    // Violations section if any
    if (reportData.violations && reportData.violations.length > 0) {
      pdf.setFont('helvetica', 'bold')
      pdf.text('Violations Identified:', margin, yPosition)
      yPosition += 8
      pdf.setFont('helvetica', 'normal')

      reportData.violations.forEach((violation, index) => {
        const violationText = `${reportNumber}.${String(index + 2).padStart(2, '0')} ${violation}`
        const violationLines = pdf.splitTextToSize(violationText, this.pageProperties.contentWidth - 10)
        pdf.text(violationLines, margin + 10, yPosition)
        yPosition += violationLines.length * 5 + 5
      })
      yPosition += 5
    }

    // Non-compliance details if status is not compliant
    if (reportData.complianceStatus !== 'compliant' && reportData.nonComplianceDetails) {
      pdf.setFont('helvetica', 'bold')
      pdf.text('Non-Compliance Details:', margin, yPosition)
      yPosition += 8
      pdf.setFont('helvetica', 'normal')

      const detailsLines = pdf.splitTextToSize(reportData.nonComplianceDetails, this.pageProperties.contentWidth - 10)
      pdf.text(detailsLines, margin + 10, yPosition)
      yPosition += detailsLines.length * 5 + 10
    }

    // Compliance evidence
    if (reportData.complianceEvidence) {
      pdf.setFont('helvetica', 'bold')
      pdf.text('Compliance Evidence:', margin, yPosition)
      yPosition += 8
      pdf.setFont('helvetica', 'normal')

      const evidenceLines = pdf.splitTextToSize(reportData.complianceEvidence, this.pageProperties.contentWidth - 10)
      pdf.text(evidenceLines, margin + 10, yPosition)
      yPosition += evidenceLines.length * 5 + 10
    }

    this.currentYPosition = yPosition
  }

  private addCorrectiveActions(reportData: ComplianceReportData): void {
    const pdf = this.pdfInstance
    const { margin } = this.pageProperties
    let yPosition = this.currentYPosition

    // Check page break
    if (yPosition + 60 > this.pageProperties.height - 40) {
      pdf.addPage()
      yPosition = margin + 15
    }

    // Corrective Actions section
    if (reportData.correctiveActions) {
      pdf.setFont('helvetica', 'bold')
      pdf.text('Corrective Actions Required:', margin, yPosition)
      yPosition += 8
      pdf.setFont('helvetica', 'normal')

      const actionLines = pdf.splitTextToSize(reportData.correctiveActions, this.pageProperties.contentWidth - 10)
      pdf.text(actionLines, margin + 10, yPosition)
      yPosition += actionLines.length * 5 + 10
    }

    // Recommendations section
    if (reportData.recommendations) {
      pdf.setFont('helvetica', 'bold')
      pdf.text('Recommendations:', margin, yPosition)
      yPosition += 8
      pdf.setFont('helvetica', 'normal')

      const recLines = pdf.splitTextToSize(reportData.recommendations, this.pageProperties.contentWidth - 10)
      pdf.text(recLines, margin + 10, yPosition)
      yPosition += recLines.length * 5 + 15
    }

    // Professional opinion statement
    const professionalOpinion = reportData.complianceStatus === 'compliant'
      ? 'It is my professional opinion that the observed elements are in compliance with the applicable standards and requirements as specified above.'
      : 'It is my professional opinion that corrective action is required to achieve full compliance with the applicable standards and requirements as specified above.'

    const opinionLines = pdf.splitTextToSize(professionalOpinion, this.pageProperties.contentWidth)
    pdf.text(opinionLines, margin, yPosition)
    yPosition += opinionLines.length * 5 + 10

    this.currentYPosition = yPosition
  }

  private formatComplianceStatus(status: 'compliant' | 'non_compliant' | 'partial'): string {
    switch (status) {
      case 'compliant':
        return 'COMPLIANT'
      case 'non_compliant':
        return 'NON-COMPLIANT'
      case 'partial':
        return 'PARTIALLY COMPLIANT'
      default:
        return 'PENDING REVIEW'
    }
  }

  public static async generateComplianceReport(reportData: ComplianceReportData): Promise<Blob> {
    const generator = new ComplianceReportGenerator()
    generator.generateSpecificContent(reportData)
    return generator.generateReport()
  }
}