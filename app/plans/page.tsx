'use client'

import { useState } from 'react'
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
  User,
  Building,
  Home,
  ChevronRight,
  X,
  Upload
} from 'lucide-react'

interface Plan {
  id: string
  planNumber: string
  projectName: string
  projectAddress: string
  planType: string
  version: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived'
  submittedBy: string
  submittedDate: string
  lastModified: string
  fileSize: string
  pages: number
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: '1',
      planNumber: 'PLN-2024-001',
      projectName: 'Medical Office Building',
      projectAddress: '1234 Healthcare Blvd',
      planType: 'Architectural',
      version: '3.0',
      status: 'approved',
      submittedBy: 'John Smith',
      submittedDate: '2024-01-15',
      lastModified: '2024-01-18',
      fileSize: '45.2 MB',
      pages: 24
    },
    {
      id: '2',
      planNumber: 'PLN-2024-002',
      projectName: 'Residential Addition',
      projectAddress: '567 Oak Street',
      planType: 'Structural',
      version: '1.0',
      status: 'pending',
      submittedBy: 'Sarah Johnson',
      submittedDate: '2024-01-17',
      lastModified: '2024-01-17',
      fileSize: '12.8 MB',
      pages: 8
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPlan, setNewPlan] = useState({
    projectName: '',
    projectAddress: '',
    planType: 'Architectural',
    submittedBy: '',
    file: null as File | null
  })

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault()
    
    const plan: Plan = {
      id: Date.now().toString(),
      planNumber: `PLN-${new Date().getFullYear()}-${String(plans.length + 1).padStart(3, '0')}`,
      projectName: newPlan.projectName,
      projectAddress: newPlan.projectAddress,
      planType: newPlan.planType,
      version: '1.0',
      status: 'draft',
      submittedBy: newPlan.submittedBy,
      submittedDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      fileSize: newPlan.file ? `${(newPlan.file.size / (1024 * 1024)).toFixed(1)} MB` : '0 MB',
      pages: Math.floor(Math.random() * 20) + 1
    }
    
    setPlans([plan, ...plans])
    setShowAddModal(false)
    setNewPlan({
      projectName: '',
      projectAddress: '',
      planType: 'Architectural',
      submittedBy: '',
      file: null
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'approved': return 'bg-green-100 text-green-700 border-green-300'
      case 'rejected': return 'bg-red-100 text-red-700 border-red-300'
      case 'archived': return 'bg-purple-100 text-purple-700 border-purple-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.planNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.projectAddress.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || plan.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-4">Project Plans</h1>
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Plan
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search plans..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>

            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
              <Filter className="h-5 w-5" />
              More Filters
            </button>

            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
              <Download className="h-5 w-5" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.projectName}</h3>
                  <p className="text-sm text-gray-500">{plan.planNumber}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(plan.status)}`}>
                  {plan.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="h-4 w-4 mr-2 text-gray-400" />
                  {plan.projectAddress}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="h-4 w-4 mr-2 text-gray-400" />
                  {plan.planType} • Version {plan.version}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  {plan.submittedBy}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {new Date(plan.submittedDate).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{plan.pages} pages</span>
                  <span>{plan.fileSize}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:text-sky-600 transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-sky-600 transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add New Plan</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddPlan} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={newPlan.projectName}
                    onChange={(e) => setNewPlan({ ...newPlan, projectName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Address</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={newPlan.projectAddress}
                    onChange={(e) => setNewPlan({ ...newPlan, projectAddress: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={newPlan.planType}
                    onChange={(e) => setNewPlan({ ...newPlan, planType: e.target.value })}
                  >
                    <option value="Architectural">Architectural</option>
                    <option value="Structural">Structural</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Fire Protection">Fire Protection</option>
                    <option value="Civil">Civil</option>
                    <option value="Landscape">Landscape</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Submitted By</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={newPlan.submittedBy}
                    onChange={(e) => setNewPlan({ ...newPlan, submittedBy: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Plan</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.dwg,.dxf"
                      onChange={(e) => setNewPlan({ ...newPlan, file: e.target.files?.[0] || null })}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-sm text-gray-600">
                        {newPlan.file ? newPlan.file.name : 'Click to upload or drag and drop'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">PDF, DWG, or DXF up to 100MB</p>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                >
                  Add Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}