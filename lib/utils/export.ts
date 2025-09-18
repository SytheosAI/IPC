import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

// Excel Export Utilities
export async function exportToExcel(data: any[], filename: string = 'export') {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Auto-size columns
    const colWidths: any[] = [];
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      headers.forEach((header, index) => {
        const maxLength = Math.max(
          header.length,
          ...data.map(row => String(row[header] || '').length)
        );
        colWidths[index] = { wch: Math.min(maxLength + 2, 50) };
      });
      ws['!cols'] = colWidths;
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Save file
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    return { success: true };
  } catch (error) {
    console.error('Excel export failed:', error);
    throw new Error('Failed to export to Excel');
  }
}

// PDF Export Utilities
export async function exportToPDF(data: any[], title: string = 'Report') {
  try {
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(18);
    pdf.text(title, 20, 20);
    
    // Add metadata
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
    pdf.text(`Records: ${data.length}`, 20, 35);
    
    let yPosition = 50;
    
    if (data.length === 0) {
      pdf.text('No data to display', 20, yPosition);
    } else {
      // Add headers
      const headers = Object.keys(data[0]);
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'bold');
      
      let xPosition = 20;
      headers.forEach(header => {
        pdf.text(header, xPosition, yPosition);
        xPosition += 40;
      });
      
      yPosition += 10;
      
      // Add data rows
      pdf.setFont(undefined, 'normal');
      data.forEach((row, index) => {
        if (yPosition > 270) { // Start new page if needed
          pdf.addPage();
          yPosition = 20;
        }
        
        xPosition = 20;
        headers.forEach(header => {
          const value = String(row[header] || '');
          // Truncate long values
          const truncated = value.length > 15 ? value.substring(0, 12) + '...' : value;
          pdf.text(truncated, xPosition, yPosition);
          xPosition += 40;
        });
        
        yPosition += 6;
      });
    }
    
    // Save PDF
    pdf.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
    
    return { success: true };
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to export to PDF');
  }
}

// Inspection-specific export formats
export async function exportInspectionsToExcel(inspections: any[]) {
  const formattedData = inspections.map(inspection => ({
    'Project Number': inspection.project_number || '',
    'Project Name': inspection.project_name || '',
    'Address': inspection.address || '',
    'Status': inspection.status || '',
    'Compliance Score': inspection.compliance_score || '',
    'Start Date': inspection.start_date ? new Date(inspection.start_date).toLocaleDateString() : '',
    'Created Date': inspection.created_at ? new Date(inspection.created_at).toLocaleDateString() : '',
    'Owner': inspection.owner || '',
    'Contractor': inspection.contractor || '',
    'Notes': inspection.notes || ''
  }));
  
  return exportToExcel(formattedData, 'inspections');
}

export async function exportProjectsToExcel(projects: any[]) {
  const formattedData = projects.map(project => ({
    'Permit Number': project.permit_number || '',
    'Project Name': project.project_name || '',
    'Address': project.address || '',
    'City': project.city || '',
    'State': project.state || '',
    'Status': project.status || '',
    'Applicant': project.applicant || '',
    'Project Type': project.project_type || '',
    'Submitted Date': project.submitted_date ? new Date(project.submitted_date).toLocaleDateString() : '',
    'Last Updated': project.updated_at ? new Date(project.updated_at).toLocaleDateString() : ''
  }));
  
  return exportToExcel(formattedData, 'projects');
}

// CSV Export (alternative to Excel)
export function exportToCSV(data: any[], filename: string = 'export') {
  try {
    if (data.length === 0) {
      throw new Error('No data to export');
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape commas and quotes
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    
    return { success: true };
  } catch (error) {
    console.error('CSV export failed:', error);
    throw new Error('Failed to export to CSV');
  }
}

// Bulk export with progress tracking
export async function bulkExportWithProgress(
  data: any[], 
  format: 'excel' | 'pdf' | 'csv',
  filename: string,
  onProgress?: (progress: number) => void
) {
  try {
    onProgress?.(10);
    
    let result;
    switch (format) {
      case 'excel':
        onProgress?.(50);
        result = await exportToExcel(data, filename);
        break;
      case 'pdf':
        onProgress?.(50);
        result = await exportToPDF(data, filename);
        break;
      case 'csv':
        onProgress?.(50);
        result = exportToCSV(data, filename);
        break;
      default:
        throw new Error('Unsupported export format');
    }
    
    onProgress?.(100);
    return result;
  } catch (error) {
    console.error('Bulk export failed:', error);
    throw error;
  }
}