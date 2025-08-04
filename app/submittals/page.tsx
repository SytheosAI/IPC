'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  ChevronRight
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
  completeness: number
  documents: number
  comments: number
}

export default function SubmittalsPage() {
  const [submittals, setSubmittals] = useState<Submittal[]>([
    {
      id: '1',
      submittalNumber: 'SUB-2024-0234',
      projectName: 'Sunrise Medical Center',
      projectAddress: '1234 Healthcare Blvd, Miami, FL',
      applicant: 'Healthcare Development LLC',
      contractor: 'BuildPro Construction',
      type: 'New Construction - Medical',
      category: 'commercial',
      status: 'under_review',
      dateSubmitted: '2024-01-15',
      lastUpdated: '2024-01-18',
      reviewer: 'Sarah Johnson',
      completeness: 85,
      documents: 24,
      comments: 3
    },
    {
      id: '2',
      submittalNumber: 'SUB-2024-0235',
      projectName: 'Residential Addition - Smith',
      projectAddress: '567 Oak Street, Miami, FL',
      applicant: 'John & Jane Smith',
      type: 'Addition/Alteration',
      category: 'residential',
      status: 'submitted',
      dateSubmitted: '2024-01-18',
      lastUpdated: '2024-01-18',
      completeness: 100,
      documents: 12,
      comments: 0
    },
    {
      id: '3',
      submittalNumber: 'SUB-2024-0233',
      projectName: 'Retail Plaza Renovation',
      projectAddress: '890 Commerce Way, Miami, FL',
      applicant: 'Plaza Holdings Inc',
      contractor: 'Renovation Experts LLC',
      type: 'Commercial Renovation',
      category: 'commercial',
      status: 'approved',
      dateSubmitted: '2024-01-10',
      lastUpdated: '2024-01-17',
      reviewer: 'Mike Chen',
      completeness: 100,
      documents: 18,
      comments: 5
    },
    {
      id: '4',
      submittalNumber: 'SUB-2024-0236',
      projectName: 'Industrial Warehouse',
      projectAddress: '2345 Industry Park, Miami, FL',
      applicant: 'Logistics Corp',
      type: 'New Construction - Industrial',
      category: 'industrial',
      status: 'revisions_required',
      dateSubmitted: '2024-01-16',
      lastUpdated: '2024-01-19',
      reviewer: 'Sarah Johnson',
      completeness: 70,
      documents: 15,
      comments: 8
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortField, setSortField] = useState<'dateSubmitted' | 'projectName' | 'status'>('dateSubmitted')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

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
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-4">Permit Submittals</h1>
        <div className="flex justify-end">
          <Link
            href="/submittals/new"
            className="btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Submittal
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by project name, number, or address..."
              className="input-modern pl-10 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <select
              className="input-modern text-gray-900 dark:text-gray-100"
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
              className="input-modern text-gray-900 dark:text-gray-100"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="commercial">Commercial</option>
              <option value="residential">Residential</option>
              <option value="industrial">Industrial</option>
            </select>

            <button className="btn-secondary">
              <Filter className="h-5 w-5" />
              More Filters
            </button>

            <button className="btn-secondary">
              <Download className="h-5 w-5" />
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
              {sortedSubmittals.map((submittal) => (
                <tr 
                  key={submittal.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/submittals/${submittal.id}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{submittal.submittalNumber}</div>
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
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            submittal.completeness === 100 ? 'bg-green-500' : 
                            submittal.completeness >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${submittal.completeness}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{submittal.completeness}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{submittal.documents}</span>
                      {submittal.comments > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          {submittal.comments} comments
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(submittal.dateSubmitted).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {submittal.reviewer || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/submittals/${submittal.id}`}
                        className="text-sky-600 hover:text-sky-900 transition-colors"
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}