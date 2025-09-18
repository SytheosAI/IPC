'use client';

import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileArchive, Check } from 'lucide-react';

interface ExportToolsProps {
  data?: any[];
  filename?: string;
}

const ExportTools: React.FC<ExportToolsProps> = ({ data = [], filename = 'export' }) => {
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<string | null>(null);

  const exportToCSV = () => {
    setExporting('csv');

    // Convert data to CSV format
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row =>
          headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',')
              ? `"${value}"`
              : value;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();
    }

    setTimeout(() => {
      setExporting(null);
      setExported('csv');
      setTimeout(() => setExported(null), 2000);
    }, 500);
  };

  const exportToJSON = () => {
    setExporting('json');

    // Convert data to JSON format
    const jsonContent = JSON.stringify(data, null, 2);

    // Create and download file
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();

    setTimeout(() => {
      setExporting(null);
      setExported('json');
      setTimeout(() => setExported(null), 2000);
    }, 500);
  };

  const exportToPDF = async () => {
    setExporting('pdf');

    try {
      // Dynamic import of jsPDF to reduce bundle size
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.text(filename.charAt(0).toUpperCase() + filename.slice(1), 20, 20);

      // Add data
      doc.setFontSize(11);
      let yPosition = 40;

      data.forEach((item, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.text(`Record ${index + 1}:`, 20, yPosition);
        yPosition += 10;

        Object.entries(item).forEach(([key, value]) => {
          if (yPosition > 260) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`  ${key}: ${value}`, 20, yPosition);
          yPosition += 7;
        });

        yPosition += 5;
      });

      // Save the PDF
      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }

    setTimeout(() => {
      setExporting(null);
      setExported('pdf');
      setTimeout(() => setExported(null), 2000);
    }, 500);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToCSV}
        disabled={exporting === 'csv'}
        className="btn-glass flex items-center gap-2 text-sm"
      >
        {exported === 'csv' ? (
          <>
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-green-400">Exported!</span>
          </>
        ) : exporting === 'csv' ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export CSV</span>
          </>
        )}
      </button>

      <button
        onClick={exportToJSON}
        disabled={exporting === 'json'}
        className="btn-glass flex items-center gap-2 text-sm"
      >
        {exported === 'json' ? (
          <>
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-green-400">Exported!</span>
          </>
        ) : exporting === 'json' ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <FileArchive className="h-4 w-4" />
            <span>Export JSON</span>
          </>
        )}
      </button>

      <button
        onClick={exportToPDF}
        disabled={exporting === 'pdf'}
        className="btn-glass flex items-center gap-2 text-sm"
      >
        {exported === 'pdf' ? (
          <>
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-green-400">Exported!</span>
          </>
        ) : exporting === 'pdf' ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" />
            <span>Export PDF</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ExportTools;