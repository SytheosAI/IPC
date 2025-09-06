'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building, MapPin, Calendar, User, Shield, Brain, FileText, Plus, Download, Edit2, Save, X, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface InspectionReport {
  id: string;
  reportNumber: string;
  date: string;
  type: string;
  status: 'passed' | 'failed' | 'pending' | 'in_progress';
  inspector: string;
  violations: number;
  completionRate: number;
  aiAnalysisComplete: boolean;
}

interface ProjectInfo {
  id: string;
  projectName: string;
  address: string;
  projectType: string;
  permitNumber: string;
  startDate: string;
  expectedCompletion: string;
  contractor: string;
  owner: string;
  architect: string;
  squareFootage: number;
  constructionValue: number;
  currentPhase: string;
  overallCompliance: number;
  inspectionReports: InspectionReport[];
  notes: string;
}

export default function ProjectInfoPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReports, setShowReports] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');

  useEffect(() => {
    loadProjectInfo();
  }, [projectId]);

  const loadProjectInfo = async () => {
    try {
      // Mock data - in production, fetch from API
      const mockProject: ProjectInfo = {
        id: projectId,
        projectName: 'Sunset Tower - Mixed Use Development',
        address: '1234 Ocean Drive, Miami Beach, FL 33139',
        projectType: 'Commercial/Residential',
        permitNumber: 'MB-2024-001234',
        startDate: '2024-01-01',
        expectedCompletion: '2025-06-30',
        contractor: 'Coastal Construction LLC',
        owner: 'Sunset Properties Inc.',
        architect: 'Miami Modern Architecture',
        squareFootage: 125000,
        constructionValue: 45000000,
        currentPhase: 'Foundation & Structural',
        overallCompliance: 88,
        notes: 'Project progressing on schedule. Special attention required for electrical systems in basement levels due to flood zone requirements.',
        inspectionReports: [
          {
            id: 'report-001',
            reportNumber: 'VBA-2024-001',
            date: '2024-01-15',
            type: 'Electrical - Main Panel',
            status: 'passed',
            inspector: 'John Smith',
            violations: 2,
            completionRate: 100,
            aiAnalysisComplete: true
          },
          {
            id: 'report-002',
            reportNumber: 'VBA-2024-002',
            date: '2024-01-10',
            type: 'Foundation',
            status: 'passed',
            inspector: 'Maria Garcia',
            violations: 0,
            completionRate: 100,
            aiAnalysisComplete: true
          },
          {
            id: 'report-003',
            reportNumber: 'VBA-2024-003',
            date: '2024-01-18',
            type: 'Fire Safety Systems',
            status: 'pending',
            inspector: 'Robert Chen',
            violations: 0,
            completionRate: 0,
            aiAnalysisComplete: false
          }
        ]
      };

      setProject(mockProject);
      setEditedNotes(mockProject.notes);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading project info:', error);
      setIsLoading(false);
    }
  };

  const handleSaveNotes = () => {
    if (project) {
      setProject({ ...project, notes: editedNotes });
      setIsEditingNotes(false);
      // In production, save to API
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-gray-600 bg-gray-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5" />;
      case 'failed': return <X className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'in_progress': return <AlertTriangle className="w-5 h-5" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project information...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="glass-morphism border-b border-gray-600">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/vba')}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-200 hover:text-yellow-400"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-yellow-400">{project.projectName}</h1>
                <p className="text-sm text-gray-300">Permit #{project.permitNumber}</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowReports(!showReports)}
              className="btn-primary"
            >
              <FileText className="h-5 w-5" />
              <span>Inspection Reports</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Project Details */}
        <div className="card-modern hover-lift p-6 mb-6">
          <h2 className="text-lg font-semibold text-yellow-400 mb-4">Project Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-400">Address</p>
              <p className="font-medium text-gray-100 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                {project.address}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Project Type</p>
              <p className="font-medium text-gray-100 flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-400" />
                {project.projectType}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Current Phase</p>
              <p className="font-medium text-gray-100">{project.currentPhase}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Start Date</p>
              <p className="font-medium text-gray-100 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                {new Date(project.startDate).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Expected Completion</p>
              <p className="font-medium text-gray-100">{new Date(project.expectedCompletion).toLocaleDateString()}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Construction Value</p>
              <p className="font-medium text-gray-100">${project.constructionValue.toLocaleString()}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Contractor</p>
              <p className="font-medium text-gray-100 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                {project.contractor}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Owner</p>
              <p className="font-medium text-gray-100">{project.owner}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Architect</p>
              <p className="font-medium text-gray-100">{project.architect}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Square Footage</p>
              <p className="font-medium text-gray-100">{project.squareFootage.toLocaleString()} sq ft</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Overall Compliance</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      project.overallCompliance >= 85 ? 'bg-green-500' :
                      project.overallCompliance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${project.overallCompliance}%` }}
                  />
                </div>
                <span className="font-medium text-gray-900">{project.overallCompliance}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="card-modern hover-lift p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Project Notes</h2>
            {!isEditingNotes && (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {isEditingNotes ? (
            <div>
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                className="w-full p-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium"
                rows={4}
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => {
                    setEditedNotes(project.notes);
                    setIsEditingNotes(false);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700">{project.notes || 'No notes added yet.'}</p>
          )}
        </div>

        {/* Inspection Reports Section */}
        {showReports && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Inspection Reports</h2>
              <Link href={`/vba/inspection-template/${projectId}`}>
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Plus className="h-5 w-5" />
                  <span>New Inspection</span>
                </button>
              </Link>
            </div>
            
            <div className="space-y-3">
              {project.inspectionReports.map((report) => (
                <div key={report.id} className="border-2 border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(report.status)}`}>
                          {getStatusIcon(report.status)}
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-600">{report.reportNumber}</span>
                        {report.aiAnalysisComplete && (
                          <div className="flex items-center gap-1 text-indigo-600">
                            <Brain className="h-4 w-4" />
                            <span className="text-xs font-medium">AI Analyzed</span>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-gray-900">{report.type}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(report.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {report.inspector}
                        </span>
                        {report.violations > 0 && (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            {report.violations} violations
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {report.completionRate > 0 && report.completionRate < 100 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{report.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${report.completionRate}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}