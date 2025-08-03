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
  Folder,
  Home,
  ChevronRight,
  X,
  Upload,
  File,
  FileImage,
  FileSpreadsheet
} from 'lucide-react'

interface Document {
  id: string
  name: string
  type: string
  category: string
  projectName: string
  uploadedBy: string
  uploadedDate: string
  lastModified: string
  fileSize: string
  status: 'active' | 'archived' | 'pending_review'
  tags: string[]
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Building Permit Application.pdf',
      type: 'pdf',
      category: 'Permits',
      projectName: 'Medical Office Building',
      uploadedBy: 'John Smith',
      uploadedDate: '2024-01-15',
      lastModified: '2024-01-15',
      fileSize: '2.4 MB',
      status: 'active',
      tags: ['permit', 'application', 'medical']
    },
    {
      id: '2',
      name: 'Site Survey Report.pdf',
      type: 'pdf',
      category: 'Reports',
      projectName: 'Retail Plaza Renovation',
      uploadedBy: 'Sarah Johnson',
      uploadedDate: '2024-01-10',
      lastModified: '2024-01-12',
      fileSize: '8.7 MB',
      status: 'active',
      tags: ['survey', 'site', 'report']
    },
    {
      id: '3',
      name: 'Inspection Photos.zip',
      type: 'zip',
      category: 'Inspections',
      projectName: 'Residential Addition',
      uploadedBy: 'Mike Chen',
      uploadedDate: '2024-01-18',
      lastModified: '2024-01-18',
      fileSize: '45.2 MB',
      status: 'pending_review',
      tags: ['photos', 'inspection', 'residential']
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newDocument, setNewDocument] = useState({
    name: '',
    category: 'Permits',
    projectName: '',
    uploadedBy: '',
    tags: '',
    file: null as File | null
  })

  const categories = ['Permits', 'Plans', 'Reports', 'Inspections', 'Contracts', 'Correspondence', 'Other']

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault()
    
    const document: Document = {
      id: Date.now().toString(),
      name: newDocument.file?.name || newDocument.name,
      type: newDocument.file?.type.split('/')[1] || 'pdf',
      category: newDocument.category,
      projectName: newDocument.projectName,
      uploadedBy: newDocument.uploadedBy,
      uploadedDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      fileSize: newDocument.file ? `${(newDocument.file.size / (1024 * 1024)).toFixed(1)} MB` : '0 MB',
      status: 'active',
      tags: newDocument.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    }
    
    setDocuments([document, ...documents])
    setShowAddModal(false)
    setNewDocument({
      name: '',
      category: 'Permits',
      projectName: '',
      uploadedBy: '',
      tags: '',
      file: null
    })
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-8 w-8 text-red-500" />
      case 'jpg':
      case 'jpeg':
      case 'png': return <FileImage className="h-8 w-8 text-blue-500" />
      case 'xlsx':
      case 'xls': return <FileSpreadsheet className="h-8 w-8 text-green-500" />
      default: return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-300'
      case 'archived': return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'pending_review': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Home className="h-4 w-4" />
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">Documents</span>
      </div>

      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Library</h1>
          <p className="text-gray-600 mt-1">Manage project documents and files</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Upload Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {documents.filter(d => d.status === 'active').length}
              </p>
            </div>
            <Folder className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {documents.filter(d => d.status === 'pending_review').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Size</p>
              <p className="text-2xl font-bold text-gray-900">56.3 MB</p>
            </div>
            <Download className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
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

      {/* Documents Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getFileIcon(document.type)}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{document.name}</div>
                        <div className="text-xs text-gray-500">
                          {document.tags.map(tag => (
                            <span key={tag} className="inline-block bg-gray-100 rounded px-2 py-0.5 mr-1">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {document.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{document.projectName}</div>
                    <div className="text-xs text-gray-500">by {document.uploadedBy}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(document.status)}`}>
                      {document.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(document.uploadedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {document.fileSize}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button className="text-sky-600 hover:text-sky-900 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-sky-600 hover:text-sky-900 transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Upload Document</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddDocument} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={newDocument.name}
                    onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                    placeholder="Leave blank to use file name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={newDocument.category}
                    onChange={(e) => setNewDocument({ ...newDocument, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={newDocument.projectName}
                    onChange={(e) => setNewDocument({ ...newDocument, projectName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Uploaded By</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={newDocument.uploadedBy}
                    onChange={(e) => setNewDocument({ ...newDocument, uploadedBy: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={newDocument.tags}
                    onChange={(e) => setNewDocument({ ...newDocument, tags: e.target.value })}
                    placeholder="e.g., permit, application, building"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      className="hidden"
                      id="file-upload"
                      onChange={(e) => setNewDocument({ ...newDocument, file: e.target.files?.[0] || null })}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-sm text-gray-600">
                        {newDocument.file ? newDocument.file.name : 'Click to upload or drag and drop'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">Any file type up to 50MB</p>
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
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}