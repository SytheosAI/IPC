'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PageTitle from '@/components/PageTitle'
import { 
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowUpDown,
  MoreVertical,
  Home,
  ChevronRight,
  X,
  Upload,
  Building,
  User,
  MapPin
} from 'lucide-react'

interface Submittal {
  id: string
  submittalNumber: string
  projectName: string
  projectAddress: string
  applicant: string
  contractor?: string
  type: string
  category: 'commercial' | 'residential' | 'industrial'
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'revisions_required'
  dateSubmitted: string
  lastUpdated: string
  reviewer?: string
  jurisdiction: string
  completeness: number
  documents: number
  comments: number
}

// Florida jurisdictions for building review
const FLORIDA_JURISDICTIONS = [
  // Major Cities
  'Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Tallahassee', 'Fort Lauderdale',
  'Port St. Lucie', 'Cape Coral', 'Pembroke Pines', 'Hollywood', 'Miramar', 'Gainesville', 'Coral Springs',
  'Clearwater', 'Miami Gardens', 'Brandon', 'West Palm Beach', 'Pompano Beach', 'Sunrise', 'Lakeland',
  'Davie', 'Miami Beach', 'Plantation', 'Boca Raton', 'Deltona', 'Largo', 'Deerfield Beach', 'Boynton Beach',
  'Weston', 'Melbourne', 'Margate', 'Coconut Creek', 'Sanford', 'Sarasota', 'Pensacola', 'Kissimmee',
  'Homestead', 'Fort Myers', 'Delray Beach', 'Ocala', 'Palm Bay', 'Pinellas Park', 'North Miami',
  
  // Counties
  'Miami-Dade County', 'Broward County', 'Palm Beach County', 'Hillsborough County', 'Orange County',
  'Pinellas County', 'Duval County', 'Lee County', 'Polk County', 'Brevard County', 'Volusia County',
  'Pasco County', 'Seminole County', 'Sarasota County', 'Manatee County', 'Lake County', 'Collier County',
  'Escambia County', 'Leon County', 'Clay County', 'St. Johns County', 'Charlotte County', 'Marion County',
  'Alachua County', 'Osceola County', 'Hernando County', 'St. Lucie County', 'Citrus County', 'Okaloosa County',
  'Martin County', 'Indian River County', 'Bay County', 'Santa Rosa County', 'Highlands County', 'Sumter County',
  'Walton County', 'Nassau County', 'Columbia County', 'Jackson County', 'Gadsden County', 'Suwannee County',
  'Washington County', 'Holmes County', 'Wakulla County', 'Baker County', 'Bradford County', 'Putnam County',
  'Flagler County', 'Levy County', 'Gilchrist County', 'Dixie County', 'Taylor County', 'Jefferson County',
  'Madison County', 'Hamilton County', 'Lafayette County', 'Union County', 'Calhoun County', 'Liberty County',
  'Franklin County', 'Gulf County', 'Hardee County', 'DeSoto County', 'Okeechobee County', 'Hendry County',
  'Glades County', 'Monroe County'
].sort()

export default function SubmittalsPage() {
  const [submittals, setSubmittals] = useState<Submittal[]>([])
  const [showNewSubmittalModal, setShowNewSubmittalModal] = useState(false)
  const [newSubmittal, setNewSubmittal] = useState({
    projectName: '',
    projectAddress: '',
    applicant: '',
    contractor: '',
    type: '',
    category: 'commercial' as 'commercial' | 'residential' | 'industrial',
    jurisdiction: '',
    documents: [] as File[]
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortField, setSortField] = useState<'dateSubmitted' | 'projectName' | 'status'>('dateSubmitted')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Load submittals from Supabase on mount
  useEffect(() => {
    // TODO: Load submittals from Supabase
    setSubmittals([])
  }, [])

  // Generate submittal number based on date and count
  const generateSubmittalNumber = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    
    // Count submittals for this year
    const thisYearSubmittals = submittals.filter(s => 
      s.submittalNumber.startsWith(year.toString())
    ).length + 1
    
    return `${year}-${month}${day}-${String(thisYearSubmittals).padStart(3, '0')}`
  }

  // Calculate completeness based on required fields and documents
  const calculateCompleteness = (submittal: any) => {
    const requiredFields = ['projectName', 'projectAddress', 'applicant', 'type', 'jurisdiction']
    const filledFields = requiredFields.filter(field => submittal[field] && submittal[field].trim() !== '').length
    const fieldCompleteness = (filledFields / requiredFields.length) * 60 // 60% for fields
    
    const documentCompleteness = submittal.documents && submittal.documents.length > 0 ? 40 : 0 // 40% for documents
    
    return Math.round(fieldCompleteness + documentCompleteness)
  }

  // Handle new submittal creation
  const handleCreateSubmittal = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submittal: Submittal = {
      id: Date.now().toString(),
      submittalNumber: generateSubmittalNumber(),
      projectName: newSubmittal.projectName,
      projectAddress: newSubmittal.projectAddress,
      applicant: newSubmittal.applicant,
      contractor: newSubmittal.contractor,
      type: newSubmittal.type,
      category: newSubmittal.category,
      jurisdiction: newSubmittal.jurisdiction,
      status: 'draft',
      dateSubmitted: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      completeness: calculateCompleteness(newSubmittal),
      documents: newSubmittal.documents.length,
      comments: 0
    }
    
    const updatedSubmittals = [submittal, ...submittals]
    setSubmittals(updatedSubmittals)
    // TODO: Save submittal to Supabase
    
    // Reset form
    setNewSubmittal({
      projectName: '',
      projectAddress: '',
      applicant: '',
      contractor: '',
      type: '',
      category: 'commercial',
      jurisdiction: '',
      documents: []
    })
    setShowNewSubmittalModal(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'submitted': return 'bg-sky-100 text-sky-700 border-sky-300'
      case 'under_review': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'approved': return 'bg-green-100 text-green-700 border-green-300'
      case 'rejected': return 'bg-red-100 text-red-700 border-red-300'
      case 'revisions_required': return 'bg-orange-100 text-orange-700 border-orange-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit2 className="h-3.5 w-3.5" />
      case 'submitted': return <Clock className="h-3.5 w-3.5" />
      case 'under_review': return <AlertCircle className="h-3.5 w-3.5" />
      case 'approved': return <CheckCircle className="h-3.5 w-3.5" />
      case 'rejected': return <XCircle className="h-3.5 w-3.5" />
      case 'revisions_required': return <AlertCircle className="h-3.5 w-3.5" />
      default: return <FileText className="h-3.5 w-3.5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'commercial': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'residential': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'industrial': return 'bg-gray-100 text-gray-700 border-gray-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const filteredSubmittals = submittals.filter(sub => {
    const matchesSearch = sub.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sub.submittalNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sub.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sub.projectAddress.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus
    const matchesCategory = filterCategory === 'all' || sub.category === filterCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  const sortedSubmittals = [...filteredSubmittals].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case 'dateSubmitted':
        comparison = new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime()
        break
      case 'projectName':
        comparison = a.projectName.localeCompare(b.projectName)
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  return (
    <div className="p-6">
      {/* New Submittal Button */}
      <div className="absolute top-4 right-6">
        <button
          onClick={() => setShowNewSubmittalModal(true)}
          className="btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Submittal
        </button>
      </div>

      {/* Page Header */}
      <PageTitle title="Permit Submittals" />

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by project name, number, or address..."
              className="w-full pl-9 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 hover:border-gray-400 dark:hover:border-gray-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:ring-sky-500 focus:border-sky-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              className="px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="revisions_required">Revisions Required</option>
            </select>

            <select
              className="px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="commercial">Commercial</option>
              <option value="residential">Residential</option>
              <option value="industrial">Industrial</option>
            </select>

            <button className="btn-secondary flex items-center gap-1 px-3 py-2 text-sm">
              <Filter className="h-4 w-4" />
              Filters
            </button>

            <button className="btn-secondary flex items-center gap-1 px-3 py-2 text-sm">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Submittals Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    className="flex items-center gap-1 text-xs font-medium text-gray-600 uppercase tracking-wider hover:text-gray-900"
                    onClick={() => toggleSort('dateSubmitted')}
                  >
                    Submittal #
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    className="flex items-center gap-1 text-xs font-medium text-gray-600 uppercase tracking-wider hover:text-gray-900"
                    onClick={() => toggleSort('projectName')}
                  >
                    Project
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    className="flex items-center gap-1 text-xs font-medium text-gray-600 uppercase tracking-wider hover:text-gray-900"
                    onClick={() => toggleSort('status')}
                  >
                    Status
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Completeness
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Reviewer
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedSubmittals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-24 text-center">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No submittals found</p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">Get started by creating your first permit submittal</p>
                    <button
                      onClick={() => setShowNewSubmittalModal(true)}
                      className="btn-primary"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create New Submittal
                    </button>
                  </td>
                </tr>
              ) : (
                sortedSubmittals.map((submittal) => (
                  <tr 
                    key={submittal.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/submittals/${submittal.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{submittal.submittalNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{submittal.projectName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(submittal.category)}`}>
                        {submittal.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(submittal.status)}`}>
                        {getStatusIcon(submittal.status)}
                        {submittal.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              submittal.completeness === 100 ? 'bg-green-500' : 
                              submittal.completeness >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${submittal.completeness}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{submittal.completeness}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">{submittal.documents}</span>
                        {submittal.comments > 0 && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            {submittal.comments} comments
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(submittal.dateSubmitted).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {submittal.jurisdiction || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/submittals/${submittal.id}`}
                          className="text-sky-600 hover:text-sky-900 dark:hover:text-sky-300 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Submittal Modal */}
      {showNewSubmittalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">New Permit Submittal</h3>
                <button
                  onClick={() => setShowNewSubmittalModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateSubmittal} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name *</label>
                  <input
                    type="text"
                    className="input-modern text-gray-900 dark:text-gray-100"
                    value={newSubmittal.projectName}
                    onChange={(e) => setNewSubmittal({ ...newSubmittal, projectName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jurisdiction *</label>
                  <select
                    className="input-modern text-gray-900 dark:text-gray-100"
                    value={newSubmittal.jurisdiction}
                    onChange={(e) => setNewSubmittal({ ...newSubmittal, jurisdiction: e.target.value })}
                    required
                  >
                    <option value="">Select Jurisdiction</option>
                    {FLORIDA_JURISDICTIONS.map((jurisdiction) => (
                      <option key={jurisdiction} value={jurisdiction}>
                        {jurisdiction}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      className="input-modern pl-10 text-gray-900 dark:text-gray-100"
                      value={newSubmittal.projectAddress}
                      onChange={(e) => setNewSubmittal({ ...newSubmittal, projectAddress: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Applicant *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      className="input-modern pl-10 text-gray-900 dark:text-gray-100"
                      value={newSubmittal.applicant}
                      onChange={(e) => setNewSubmittal({ ...newSubmittal, applicant: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contractor</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      className="input-modern pl-10 text-gray-900 dark:text-gray-100"
                      value={newSubmittal.contractor}
                      onChange={(e) => setNewSubmittal({ ...newSubmittal, contractor: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Type *</label>
                  <select
                    className="input-modern text-gray-900 dark:text-gray-100"
                    value={newSubmittal.type}
                    onChange={(e) => setNewSubmittal({ ...newSubmittal, type: e.target.value })}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="New Construction">New Construction</option>
                    <option value="Addition/Alteration">Addition/Alteration</option>
                    <option value="Renovation">Renovation</option>
                    <option value="Demolition">Demolition</option>
                    <option value="Change of Use">Change of Use</option>
                    <option value="Repair">Repair</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                  <select
                    className="input-modern text-gray-900 dark:text-gray-100"
                    value={newSubmittal.category}
                    onChange={(e) => setNewSubmittal({ ...newSubmittal, category: e.target.value as any })}
                    required
                  >
                    <option value="commercial">Commercial</option>
                    <option value="residential">Residential</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Documents</label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      className="hidden"
                      id="file-upload"
                      multiple
                      accept=".pdf,.dwg,.dxf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => setNewSubmittal({ ...newSubmittal, documents: Array.from(e.target.files || []) })}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {newSubmittal.documents.length > 0 
                          ? `${newSubmittal.documents.length} file(s) selected` 
                          : 'Click to upload or drag and drop'
                        }
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        PDF, DWG, DXF, DOC, JPG, PNG up to 10MB each
                      </p>
                    </label>
                  </div>
                  {newSubmittal.documents.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {newSubmittal.documents.map((file, index) => (
                        <div key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowNewSubmittalModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!newSubmittal.projectName || !newSubmittal.projectAddress || !newSubmittal.applicant || !newSubmittal.type || !newSubmittal.jurisdiction}
                >
                  Create Submittal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}