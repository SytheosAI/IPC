'use client'

import { useState, useEffect } from 'react'
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
  FileSpreadsheet,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { db, supabase } from '@/lib/supabase-client'
import PageTitle from '@/components/PageTitle'

interface Document {
  id: string
  project_id?: string
  name: string
  file_type?: string
  category?: 'Permits' | 'Plans' | 'Reports' | 'Inspections' | 'Contracts' | 'Correspondence' | 'Other'
  project_name?: string
  uploaded_by?: string
  uploaded_by_name?: string
  file_size?: string
  file_url?: string
  status?: 'active' | 'archived' | 'pending_review'
  tags?: string[]
  created_at?: string
  updated_at?: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [newDocument, setNewDocument] = useState({
    name: '',
    category: 'Permits' as Document['category'],
    project_name: '',
    uploaded_by_name: '',
    tags: '',
    file: null as File | null
  })

  const categories: Document['category'][] = ['Permits', 'Plans', 'Reports', 'Inspections', 'Contracts', 'Correspondence', 'Other']

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      setError(null)
      let data: any[] = []
      try {
        data = await db.documents.getAll()
      } catch (dbError) {
        console.warn('Failed to load documents from database:', dbError)
        data = [] // Use empty array as fallback
      }
      setDocuments(data)
      setError(null)
    } catch (err) {
      console.error('Error loading documents:', err)
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newDocument.file) {
      alert('Please select a file to upload')
      return
    }

    try {
      setUploading(true)
      
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${newDocument.file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, newDocument.file)
      
      if (uploadError) throw uploadError
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)
      
      // Create document record in database
      const document = await db.documents.create({
        name: newDocument.name || newDocument.file.name,
        file_type: newDocument.file.type.split('/')[1] || 'pdf',
        category: newDocument.category,
        project_name: newDocument.project_name,
        uploaded_by_name: newDocument.uploaded_by_name,
        file_size: `${(newDocument.file.size / (1024 * 1024)).toFixed(1)} MB`,
        file_url: publicUrl,
        status: 'active',
        tags: newDocument.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      })
      
      await loadDocuments()
      setShowAddModal(false)
      setNewDocument({
        name: '',
        category: 'Permits',
        project_name: '',
        uploaded_by_name: '',
        tags: '',
        file: null
      })
      
      // Log activity
      if (document) {
        await db.activityLogs.create({
          action: 'Uploaded document',
          entity_type: 'document',
          entity_id: (document as any).id,
          metadata: { name: (document as any).name }
        })
      }
    } catch (err) {
      console.error('Error uploading document:', err)
      alert('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDocument = async (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await db.documents.delete(id)
        await loadDocuments()
        
        // Log activity
        await db.activityLogs.create({
          action: 'Deleted document',
          entity_type: 'document',
          entity_id: id
        })
      } catch (err) {
        console.error('Error deleting document:', err)
        alert('Failed to delete document')
      }
    }
  }

  const getFileIcon = (type?: string) => {
    if (!type) return <File className="h-8 w-8 text-gray-500" />
    
    switch (type.toLowerCase()) {
      case 'pdf': return <FileText className="h-8 w-8 text-red-500" />
      case 'jpg':
      case 'jpeg':
      case 'png': return <FileImage className="h-8 w-8 text-blue-500" />
      case 'xls':
      case 'xlsx':
      case 'csv': return <FileSpreadsheet className="h-8 w-8 text-green-500" />
      default: return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Permits': return 'bg-purple-100 text-purple-800'
      case 'Plans': return 'bg-blue-100 text-blue-800'
      case 'Reports': return 'bg-green-100 text-green-800'
      case 'Inspections': return 'bg-yellow-100 text-yellow-800'
      case 'Contracts': return 'bg-red-100 text-red-800'
      case 'Correspondence': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.uploaded_by_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      {/* Upload Document Button */}
      <div className="absolute top-2 right-4">
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Upload
        </button>
      </div>

      {/* Header */}
      <PageTitle title="Document Management" />

      {/* Search and Filters */}
      <div className="card-modern hover-lift p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              className="input-modern pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="input-modern"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="spinner-modern"></div>
          <span className="ml-2 text-yellow-400">Loading documents...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card-modern bg-gradient-to-r from-red-900/20 to-red-800/20 border-red-500/30 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-300">{error}</span>
            <button 
              onClick={loadDocuments}
              className="ml-auto text-red-400 hover:text-red-300 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.length === 0 ? (
            <div className="col-span-full card-modern p-12 text-center">
              <Folder className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-yellow-400 mb-2">No Documents Found</h3>
              <p className="text-gray-400 mb-4">
                {searchQuery || filterCategory !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'Get started by uploading your first document'}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Upload Document
              </button>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div key={doc.id} className="card-modern hover-lift p-6">
                <div className="flex items-start justify-between mb-4">
                  {getFileIcon(doc.file_type)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(doc.category)}`}>
                    {doc.category}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-100 mb-2 truncate" title={doc.name}>
                  {doc.name}
                </h3>
                
                <div className="space-y-1 text-sm text-gray-400 mb-4">
                  {doc.project_name && (
                    <div className="flex items-center gap-1">
                      <Folder className="h-3 w-3" />
                      <span className="truncate">{doc.project_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{doc.uploaded_by_name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  {doc.file_size && (
                    <div className="text-xs text-gray-500">Size: {doc.file_size}</div>
                  )}
                </div>

                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {doc.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                    doc.status === 'active' ? 'bg-green-100 text-green-800' :
                    doc.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {doc.status || 'active'}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-gray-600 hover:text-sky-600 transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    )}
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        download={doc.name}
                        className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                    <button 
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="modal-modern max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-yellow-400">Upload Document</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocument}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-1">File</label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setNewDocument({...newDocument, file: e.target.files?.[0] || null})}
                    className="input-modern"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-1">Document Name (Optional)</label>
                  <input
                    type="text"
                    value={newDocument.name}
                    onChange={(e) => setNewDocument({...newDocument, name: e.target.value})}
                    placeholder="Leave blank to use file name"
                    className="input-modern"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-1">Category</label>
                  <select
                    value={newDocument.category}
                    onChange={(e) => setNewDocument({...newDocument, category: e.target.value as Document['category']})}
                    className="input-modern"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={newDocument.project_name}
                    onChange={(e) => setNewDocument({...newDocument, project_name: e.target.value})}
                    className="input-modern"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Uploaded By</label>
                  <input
                    type="text"
                    value={newDocument.uploaded_by_name}
                    onChange={(e) => setNewDocument({...newDocument, uploaded_by_name: e.target.value})}
                    className="input-modern"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={newDocument.tags}
                    onChange={(e) => setNewDocument({...newDocument, tags: e.target.value})}
                    placeholder="e.g., important, review, 2024"
                    className="input-modern"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="inline h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="inline h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}