'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft,
  FileText,
  FolderOpen,
  CheckSquare,
  Download,
  Upload,
  Eye,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Building,
  User,
  Shield,
  AlertCircle,
  ChevronRight,
  FileImage,
  FileCheck,
  FilePlus,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react'

interface ChecklistItem {
  id: string
  category: string
  item: string
  status: 'pending' | 'approved' | 'rejected' | 'na'
  reviewer?: string
  reviewDate?: string
  notes?: string
  required: boolean
}

export default function SubmittalDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [activeTab, setActiveTab] = useState<'plans' | 'documents' | 'checklist'>('checklist')
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  
  // Mock data - in production this would come from your database
  const submittal = {
    id: id,
    permitNumber: 'PER-2024-0156',
    projectName: 'Medical Office Building',
    projectAddress: '1234 Healthcare Blvd, Miami, FL 33130',
    applicant: 'Healthcare Properties LLC',
    contractor: 'BuildPro Construction',
    status: 'under_review',
    submittedDate: '2024-01-14',
    jurisdiction: 'Miami-Dade County',
    permitType: 'Commercial New Construction'
  }

  // Jurisdiction-specific checklist items
  const checklistItems: ChecklistItem[] = [
    // General Requirements
    { id: '1', category: 'General Requirements', item: 'Permit Application Form', status: 'approved', required: true, reviewer: 'Sarah Johnson', reviewDate: '2024-01-15' },
    { id: '2', category: 'General Requirements', item: 'Proof of Property Ownership', status: 'approved', required: true, reviewer: 'Sarah Johnson', reviewDate: '2024-01-15' },
    { id: '3', category: 'General Requirements', item: 'Contractor License Verification', status: 'approved', required: true, reviewer: 'Sarah Johnson', reviewDate: '2024-01-15' },
    { id: '4', category: 'General Requirements', item: 'Notice of Commencement', status: 'pending', required: true },
    
    // Site Plans
    { id: '5', category: 'Site Plans', item: 'Site Survey (Sealed)', status: 'approved', required: true, reviewer: 'Mike Chen', reviewDate: '2024-01-16' },
    { id: '6', category: 'Site Plans', item: 'Proposed Site Plan', status: 'approved', required: true, reviewer: 'Mike Chen', reviewDate: '2024-01-16' },
    { id: '7', category: 'Site Plans', item: 'Grading & Drainage Plan', status: 'pending', required: true },
    { id: '8', category: 'Site Plans', item: 'Landscape Plan', status: 'pending', required: false },
    
    // Architectural Drawings
    { id: '9', category: 'Architectural Drawings', item: 'Floor Plans (Sealed)', status: 'approved', required: true, reviewer: 'Mike Chen', reviewDate: '2024-01-17' },
    { id: '10', category: 'Architectural Drawings', item: 'Elevations (All Sides)', status: 'approved', required: true, reviewer: 'Mike Chen', reviewDate: '2024-01-17' },
    { id: '11', category: 'Architectural Drawings', item: 'Building Sections', status: 'pending', required: true },
    { id: '12', category: 'Architectural Drawings', item: 'Roof Plan', status: 'pending', required: true },
    
    // Structural
    { id: '13', category: 'Structural', item: 'Foundation Plans (Sealed)', status: 'rejected', required: true, notes: 'Missing engineer seal and calculations' },
    { id: '14', category: 'Structural', item: 'Structural Calculations', status: 'pending', required: true },
    { id: '15', category: 'Structural', item: 'Wind Load Compliance', status: 'pending', required: true },
    
    // MEP (Mechanical, Electrical, Plumbing)
    { id: '16', category: 'MEP', item: 'Mechanical Plans (HVAC)', status: 'pending', required: true },
    { id: '17', category: 'MEP', item: 'Electrical Plans', status: 'pending', required: true },
    { id: '18', category: 'MEP', item: 'Plumbing Plans', status: 'pending', required: true },
    { id: '19', category: 'MEP', item: 'Energy Calculations', status: 'pending', required: true },
    
    // Fire & Life Safety
    { id: '20', category: 'Fire & Life Safety', item: 'Fire Protection Plans', status: 'pending', required: true },
    { id: '21', category: 'Fire & Life Safety', item: 'Egress Plan', status: 'approved', required: true, reviewer: 'Fire Marshal', reviewDate: '2024-01-18' },
    { id: '22', category: 'Fire & Life Safety', item: 'Fire Department Approval', status: 'pending', required: true },
  ]

  const categories = [...new Set(checklistItems.map(item => item.category))]
  
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />
      case 'na': return <AlertCircle className="h-5 w-5 text-gray-400" />
      default: return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'na': return 'bg-gray-100 text-gray-600 border-gray-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getCategoryProgress = (category: string) => {
    const items = checklistItems.filter(item => item.category === category)
    const approved = items.filter(item => item.status === 'approved').length
    return Math.round((approved / items.length) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/submittals" 
          className="inline-flex items-center text-gray-400 hover:text-yellow-400 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Submittals
        </Link>
        
        <div className="card-modern hover-lift p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-100 mb-2">{submittal.projectName}</h1>
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {submittal.permitNumber}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {submittal.projectAddress}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {submittal.applicant}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {submittal.contractor}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Shield className="h-4 w-4" />
                    Jurisdiction: <span className="font-medium text-gray-900 dark:text-gray-100">{submittal.jurisdiction}</span>
                  </span>
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    Submitted: {new Date(submittal.submittedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                {submittal.status.replace('_', ' ').toUpperCase()}
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{submittal.permitType}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card-modern hover-lift mb-6">
        <div className="border-b border-gray-700/50">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'checklist'
                  ? 'border-yellow-500 text-yellow-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Permit Checklist
              </div>
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'plans'
                  ? 'border-yellow-500 text-yellow-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileImage className="h-4 w-4" />
                Plans
              </div>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'documents'
                  ? 'border-yellow-500 text-yellow-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Documents
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Permit Checklist Tab */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400">
                    {submittal.jurisdiction} Permit Requirements
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Review and track all required items for permit approval
                  </p>
                </div>
                <button className="btn-primary">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </button>
              </div>

              {categories.map(category => {
                const categoryItems = checklistItems.filter(item => item.category === category)
                const isExpanded = expandedCategories.includes(category)
                const progress = getCategoryProgress(category)
                
                return (
                  <div key={category} className="card-glass rounded-lg">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        <h4 className="font-medium text-gray-100">{category}</h4>
                        <span className="text-sm text-gray-400">
                          ({categoryItems.filter(i => i.status === 'approved').length}/{categoryItems.length})
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              progress === 100 ? 'bg-green-500' : 
                              progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-400">{progress}%</span>
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="border-t border-gray-700/50">
                        {categoryItems.map(item => (
                          <div key={item.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-800/30 border-t border-gray-700/50 first:border-t-0 transition-colors">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(item.status)}
                              <div>
                                <p className="text-sm font-medium text-gray-100">
                                  {item.item}
                                  {item.required && <span className="text-red-400 ml-1">*</span>}
                                </p>
                                {item.notes && (
                                  <p className="text-xs text-red-400 mt-1">{item.notes}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {item.reviewer && (
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Reviewed by</p>
                                  <p className="text-sm font-medium text-gray-300">{item.reviewer}</p>
                                  <p className="text-xs text-gray-500">{item.reviewDate}</p>
                                </div>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                {item.status.toUpperCase()}
                              </span>
                              <button className="p-1 hover:bg-gray-700/50 rounded transition-colors">
                                <Eye className="h-4 w-4 text-gray-400" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-yellow-400">Project Plans</h3>
                <button className="btn-primary">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Plan
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Plan items would be mapped here */}
                <div className="card-glass rounded-lg p-4 hover-lift cursor-pointer">
                  <div className="aspect-square bg-gray-700/50 rounded mb-3 flex items-center justify-center">
                    <FileImage className="h-16 w-16 text-gray-500" />
                  </div>
                  <h4 className="font-medium text-gray-100 text-sm">Site Plan v2.pdf</h4>
                  <p className="text-xs text-gray-500 mt-1">Uploaded Jan 15, 2024</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">2.3 MB</span>
                    <div className="flex gap-2">
                      <button className="text-yellow-400 hover:text-yellow-300 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-yellow-400 hover:text-yellow-300 transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-yellow-400">Supporting Documents</h3>
                <button className="btn-primary">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </button>
              </div>
              
              <div className="space-y-3">
                {/* Document items would be mapped here */}
                <div className="flex items-center justify-between p-4 card-glass rounded-lg hover-lift">
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-10 w-10 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Contractor License.pdf</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded Jan 14, 2024 • 156 KB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-700/50 rounded transition-colors">
                      <Eye className="h-4 w-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-700/50 rounded transition-colors">
                      <Download className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}