import React, { useState } from 'react';
import { Calendar, Upload, FileText, Settings, Image as ImageIcon } from 'lucide-react';
import { useWeatherData } from '@/src/hooks/useWeatherData';

// Inspection types with their corresponding numbers (in order of construction process)
const INSPECTION_TYPES_WITH_NUMBERS = [
  { name: 'Pre Construction', number: '00' },
  { name: 'Permit Review', number: '01' },
  { name: 'Site Survey', number: '02' },
  { name: 'Demolition', number: '03' },
  { name: 'Silt Fence', number: '04' },
  { name: 'UG Plumbing', number: '05' },
  { name: 'UG Electrical', number: '06' },
  { name: 'UG Gas', number: '07' },
  { name: 'Compaction', number: '08' },
  { name: 'Termite Pre-Treatment', number: '09' },
  { name: 'Footings', number: '10' },
  { name: 'Slab', number: '11' },
  { name: 'Stem Wall', number: '12' },
  { name: 'Pos-Tension', number: '13' },
  { name: 'Mono Slab', number: '14' },
  { name: 'Column', number: '15' },
  { name: 'Tie Beam', number: '16' },
  { name: 'Lintel', number: '17' },
  { name: 'Elevated Slab', number: '18' },
  { name: 'Truss/Framing', number: '19' },
  { name: 'Framing', number: '20' },
  { name: 'Sheathing Nailing', number: '21' },
  { name: 'Strapping/Hardware', number: '22' },
  { name: 'Wind Mitigation', number: '23' },
  { name: 'Window Bucks', number: '24' },
  { name: 'Waterproofing', number: '25' },
  { name: 'Window Installation', number: '26' },
  { name: 'Door Installation', number: '27' },
  { name: 'Door/Window Flashing', number: '28' },
  { name: 'Roofing Dry-In', number: '29' },
  { name: 'Roofing Nailer', number: '30' },
  { name: 'Roofing Final', number: '31' },
  { name: 'Stucco Lathe', number: '32' },
  { name: 'Rough Electrical', number: '33' },
  { name: 'Rough Plumbing', number: '34' },
  { name: 'Rough Low Voltage/Security', number: '35' },
  { name: 'Rough HVAC', number: '36' },
  { name: 'Water Meter(Utility)', number: '37' },
  { name: 'Duct Pressure Test', number: '38' },
  { name: 'Fireplace', number: '39' },
  { name: 'Wall Insulation', number: '40' },
  { name: 'Attic Insulation', number: '41' },
  { name: 'Sound Insulation(STC)', number: '42' },
  { name: 'Fire-Penetration', number: '43' },
  { name: 'Drywall Screw Pattern', number: '44' },
  { name: 'Drywall', number: '45' },
  { name: 'Final Electrical', number: '46' },
  { name: 'Final Plumbing', number: '47' },
  { name: 'Final HVAC', number: '48' },
  { name: 'Final Low Voltage', number: '49' },
  { name: 'Back-Flow Preventer', number: '50' },
  { name: 'Duct Blaster Test', number: '51' },
  { name: 'Fire Sprinkler', number: '52' },
  { name: 'Fire Alarm', number: '53' },
  { name: 'Grading/Drainage', number: '54' },
  { name: 'Elevator', number: '55' },
  { name: 'Meter Equipment', number: '56' },
  { name: 'Transfer Switch', number: '57' },
  { name: 'Storm Shutters', number: '58' },
  { name: 'Fence', number: '59' },
  { name: 'Accessibility', number: '60' },
  { name: 'Handrails', number: '61' },
  { name: 'Egress', number: '62' },
  { name: 'Landscaping/Egress', number: '63' },
  { name: 'Final Building', number: '64' },
  { name: 'Pool Shell', number: '65' },
  { name: 'Pool Plumbing Rough', number: '66' },
  { name: 'Pool Bonding', number: '67' },
  { name: 'Pool Shell II (Pre-Gunite)', number: '68' },
  { name: 'Pool Deck', number: '69' },
  { name: 'Pool Equipment', number: '70' },
  { name: 'Pool Gas', number: '71' },
  { name: 'Pool Alarms', number: '72' },
  { name: 'Pool Final', number: '73' }
];

interface InspectionReportData {
  // Auto-generated fields (red text)
  projectName: string;
  projectAddress: string;
  jobNumber: string;
  inspectionDate: Date;
  selectedInspection: string; // Selected inspection type
  reportSequence: number; // For multiple reports of same inspection (1, 2, 3, etc.)
  weatherData?: {
    current: string;
    forecast: string;
  };
  
  // Manual input fields (gold text)
  inspectorName: string;
  licenseNumber: string;
  companyName: string;
  observations: string;
  recommendations: string;
  signature?: string;
  
  // Template settings
  reportTitle: string;
  recipientRef: string;
  recipientAttn: string;
  logoUrl?: string;
  generalContext: string;
  footerText: string;
  
  // Images
  attachedImages: Array<{
    url: string;
    caption?: string;
  }>;
}

interface InspectionReportTemplateProps {
  projectId?: string;
}

export const InspectionReportTemplate: React.FC<InspectionReportTemplateProps> = ({ projectId }) => {
  const [reportData, setReportData] = useState<InspectionReportData>({
    projectName: '',
    projectAddress: '',
    jobNumber: '',
    inspectionDate: new Date(),
    selectedInspection: '',
    reportSequence: 1,
    inspectorName: '',
    licenseNumber: '',
    companyName: '',
    observations: '',
    recommendations: '',
    reportTitle: 'Report Title',
    recipientRef: '',
    recipientAttn: '',
    generalContext: 'This inspection report contains observations and recommendations based on the site visit conducted on the date specified above.',
    footerText: '',
    attachedImages: []
  });

  const [projectInspections, setProjectInspections] = useState<string[]>([]);

  // Load project data if projectId is provided
  React.useEffect(() => {
    if (projectId) {
      const savedProjects = localStorage.getItem('vba-projects');
      if (savedProjects) {
        const projects = JSON.parse(savedProjects);
        const project = projects.find((p: any) => p.id === projectId);
        if (project) {
          setReportData(prev => ({
            ...prev,
            projectName: project.projectName || '',
            projectAddress: project.address || '',
            jobNumber: project.jobNumber || ''
          }));
          
          // Load project inspections
          if (project.selectedInspections && Array.isArray(project.selectedInspections)) {
            setProjectInspections(project.selectedInspections);
            // Set first inspection as default if none selected
            if (project.selectedInspections.length > 0 && !reportData.selectedInspection) {
              setReportData(prev => ({
                ...prev,
                selectedInspection: project.selectedInspections[0]
              }));
            }
          }
        }
      }
    }
  }, [projectId]);

  const { weatherData, loading: weatherLoading } = useWeatherData(reportData.inspectionDate);

  const generateFileName = () => {
    const date = reportData.inspectionDate;
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${year} ${month} ${day}`;
    
    // Get inspection number from the mapping
    const selectedInspectionData = INSPECTION_TYPES_WITH_NUMBERS.find(
      inspection => inspection.name === reportData.selectedInspection
    );
    const inspectionNumber = selectedInspectionData?.number || '001';
    
    // Format: YY MM DD NNN or YY MM DD NNN.X for multiple reports
    const baseNumber = `${formattedDate} ${inspectionNumber}`;
    const suffix = reportData.reportSequence > 1 ? `.${reportData.reportSequence}` : '';
    
    return `${baseNumber}${suffix} - Inspection Report`;
  };

  const handleImageUpload = (files: FileList | null, pageIndex: number) => {
    if (!files) return;
    
    const newImages = [...reportData.attachedImages];
    const startIndex = pageIndex * 2;
    
    Array.from(files).slice(0, 2).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newImages[startIndex + index] = {
            url: e.target.result as string,
            caption: ''
          };
          setReportData({ ...reportData, attachedImages: newImages });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-center text-gray-900">
            Inspection Report
          </h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Template Settings */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2 text-gray-900">
              <Settings className="w-4 h-4" />
              Template Settings
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Report Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  value={reportData.reportTitle}
                  onChange={(e) => setReportData({ ...reportData, reportTitle: e.target.value })}
                  placeholder="Lee County Public Works"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Reference</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  value={reportData.recipientRef}
                  onChange={(e) => setReportData({ ...reportData, recipientRef: e.target.value })}
                  placeholder="Project Reference"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Attention</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  value={reportData.recipientAttn}
                  onChange={(e) => setReportData({ ...reportData, recipientAttn: e.target.value })}
                  placeholder="Recipient Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Logo</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setReportData({ ...reportData, logoUrl: e.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">General Context</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                value={reportData.generalContext}
                onChange={(e) => setReportData({ ...reportData, generalContext: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          {/* Auto-generated Fields */}
          <div className="space-y-4">
            <h3 className="font-semibold text-red-600">Auto-Generated Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Project Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-red-50 border border-red-200 rounded-md text-gray-900"
                  value={reportData.projectName}
                  readOnly
                  placeholder="SWFL Terminal Expansion Phase 2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Project Address</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-red-50 border border-red-200 rounded-md text-gray-900"
                  value={reportData.projectAddress}
                  readOnly
                  placeholder="368 Ashbury Way"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Job Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-red-50 border border-red-200 rounded-md text-gray-900"
                  value={reportData.jobNumber}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Inspection Date</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-gray-900"
                    value={reportData.inspectionDate.toLocaleDateString('en-US')}
                    readOnly
                  />
                  <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Inspection Type</label>
                <select
                  className="w-full px-3 py-2 bg-red-50 border border-red-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={reportData.selectedInspection}
                  onChange={(e) => setReportData({ ...reportData, selectedInspection: e.target.value })}
                >
                  <option value="">Select Inspection Type</option>
                  {projectInspections.map((inspectionType) => {
                    const inspectionData = INSPECTION_TYPES_WITH_NUMBERS.find(
                      inspection => inspection.name === inspectionType
                    );
                    return (
                      <option key={inspectionType} value={inspectionType}>
                        {inspectionData?.number} - {inspectionType}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Report Sequence</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 bg-red-50 border border-red-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={reportData.reportSequence}
                  onChange={(e) => setReportData({ ...reportData, reportSequence: parseInt(e.target.value) || 1 })}
                />
                <p className="text-xs text-gray-600 mt-1">Use 1 for first report, 2 for second report of same inspection, etc.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Weather</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-red-50 border border-red-200 rounded-md text-gray-900"
                  value={weatherData?.current || 'Loading...'}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Manual Input Fields */}
          <div className="space-y-4">
            <h3 className="font-semibold text-yellow-600">Inspector Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Inspector Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  value={reportData.inspectorName}
                  onChange={(e) => setReportData({ ...reportData, inspectorName: e.target.value })}
                  placeholder="John Doe, P.E."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">License Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  value={reportData.licenseNumber}
                  onChange={(e) => setReportData({ ...reportData, licenseNumber: e.target.value })}
                  placeholder="PE12345"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">Company Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  value={reportData.companyName}
                  onChange={(e) => setReportData({ ...reportData, companyName: e.target.value })}
                  placeholder="Engineering Associates, Inc."
                />
              </div>
            </div>
          </div>

          {/* Observations and Recommendations */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Observations</label>
              <textarea
                className="w-full px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                value={reportData.observations}
                onChange={(e) => setReportData({ ...reportData, observations: e.target.value })}
                rows={4}
                placeholder="Enter inspection observations..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Recommendations</label>
              <textarea
                className="w-full px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                value={reportData.recommendations}
                onChange={(e) => setReportData({ ...reportData, recommendations: e.target.value })}
                rows={4}
                placeholder="Enter recommendations..."
              />
            </div>
          </div>

          {/* Digital Signature */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 mb-1">Digital Signature</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                <Upload className="w-4 h-4 mr-2" />
                Upload Signature
              </button>
            </div>
          </div>

          {/* Image Attachments */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Inspection Photos
            </h3>
            {reportData.attachedImages.length > 0 ? (
              <>
                {[0, 1, 2, 3, 4].map((pageIndex) => {
                  const image1 = reportData.attachedImages[pageIndex * 2];
                  const image2 = reportData.attachedImages[pageIndex * 2 + 1];
                  
                  if (!image1 && !image2) return null;
                  
                  return (
                    <div key={pageIndex} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Page {pageIndex + 1}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          {image1 ? (
                            <>
                              <img
                                src={image1.url}
                                alt={image1.caption || 'Inspection photo'}
                                className="w-full h-48 object-cover rounded border"
                              />
                              <p className="text-xs text-gray-600 text-center">{image1.caption}</p>
                            </>
                          ) : (
                            <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                              <span className="text-sm text-gray-400">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          {image2 ? (
                            <>
                              <img
                                src={image2.url}
                                alt={image2.caption || 'Inspection photo'}
                                className="w-full h-48 object-cover rounded border"
                              />
                              <p className="text-xs text-gray-600 text-center">{image2.caption}</p>
                            </>
                          ) : (
                            <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                              <span className="text-sm text-gray-400">No image</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No inspection photos available. Photos taken during inspections will appear here automatically.
              </div>
            )}
          </div>

          {/* File Name Display */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-900 mb-1">Generated File Name</label>
            <p className="font-mono text-lg text-gray-900">{generateFileName()}.pdf</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button 
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" 
              onClick={() => {
                // Generate PDF report
                console.log('Generating report with data:', reportData);
                alert(`Report will be saved as: ${generateFileName()}.pdf`);
              }}
            >
              Generate Report
            </button>
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => {
                // Save current settings as template
                const templateData = {
                  reportTitle: reportData.reportTitle,
                  recipientRef: reportData.recipientRef,
                  recipientAttn: reportData.recipientAttn,
                  generalContext: reportData.generalContext,
                  footerText: reportData.footerText,
                  logoUrl: reportData.logoUrl
                };
                localStorage.setItem('vba-report-template', JSON.stringify(templateData));
                alert('Template settings saved!');
              }}
            >
              Save as Template
            </button>
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => {
                // Duplicate inspection
                setReportData({
                  ...reportData,
                  reportSequence: reportData.reportSequence + 1,
                  inspectionDate: new Date(),
                  observations: '',
                  recommendations: '',
                  attachedImages: []
                });
              }}
            >
              Duplicate Inspection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};