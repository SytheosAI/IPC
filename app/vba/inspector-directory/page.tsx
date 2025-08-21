'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Users, 
  Search,
  Phone,
  Mail,
  MapPin,
  Award,
  Star,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  UserPlus
} from 'lucide-react'

interface Inspector {
  id: string
  name: string
  email: string
  phone: string
  role: string
  licenseNumber: string
  specializations: string[]
  location: string
  rating: number
  completedInspections: number
  yearsExperience: number
  availability: 'available' | 'busy' | 'unavailable'
  certifications: string[]
  photo?: string
}

export default function InspectorDirectoryPage() {
  const router = useRouter()
  const [inspectors, setInspectors] = useState<Inspector[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterAvailability, setFilterAvailability] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingInspector, setEditingInspector] = useState<Inspector | null>(null)
  const [formData, setFormData] = useState<Partial<Inspector>>({
    name: '',
    email: '',
    phone: '',
    role: 'Inspector',
    licenseNumber: '',
    specializations: [],
    location: 'Fort Myers, FL',
    rating: 5,
    completedInspections: 0,
    yearsExperience: 0,
    availability: 'available',
    certifications: []
  })

  useEffect(() => {
    loadInspectors()
  }, [])

  const loadInspectors = () => {
    const saved = localStorage.getItem('vba-inspectors')
    if (saved) {
      setInspectors(JSON.parse(saved))
    } else {
      // Default inspectors
      const defaultInspectors: Inspector[] = [
        {
          id: '1',
          name: 'Robert Sprehe',
          email: 'robert.sprehe@hbsconsultants.com',
          phone: '(239) 555-0101',
          role: 'Senior Inspector',
          licenseNumber: 'FL-SI-12345',
          specializations: ['Threshold', 'Structural', 'Foundation'],
          location: 'Fort Myers, FL',
          rating: 4.9,
          completedInspections: 342,
          yearsExperience: 15,
          availability: 'available',
          certifications: ['ICC Certified', 'NFPA Certified', 'ACI Certified']
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.j@hbsconsultants.com',
          phone: '(239) 555-0102',
          role: 'Lead Inspector',
          licenseNumber: 'FL-LI-23456',
          specializations: ['Electrical', 'Plumbing', 'HVAC'],
          location: 'Naples, FL',
          rating: 4.8,
          completedInspections: 287,
          yearsExperience: 12,
          availability: 'busy',
          certifications: ['ICC Certified', 'Master Electrician']
        },
        {
          id: '3',
          name: 'Michael Chen',
          email: 'michael.c@hbsconsultants.com',
          phone: '(239) 555-0103',
          role: 'Inspector',
          licenseNumber: 'FL-IN-34567',
          specializations: ['Framing', 'Roofing', 'Windows'],
          location: 'Cape Coral, FL',
          rating: 4.7,
          completedInspections: 198,
          yearsExperience: 8,
          availability: 'available',
          certifications: ['ICC Certified', 'Wind Mitigation Certified']
        },
        {
          id: '4',
          name: 'Emily Rodriguez',
          email: 'emily.r@hbsconsultants.com',
          phone: '(239) 555-0104',
          role: 'Junior Inspector',
          licenseNumber: 'FL-JI-45678',
          specializations: ['Fire Safety', 'Accessibility', 'Energy'],
          location: 'Fort Myers, FL',
          rating: 4.6,
          completedInspections: 76,
          yearsExperience: 3,
          availability: 'available',
          certifications: ['ICC Certified', 'NFPA Fire Inspector I']
        }
      ]
      setInspectors(defaultInspectors)
      localStorage.setItem('vba-inspectors', JSON.stringify(defaultInspectors))
    }
  }

  const handleSaveInspector = () => {
    if (editingInspector) {
      // Update existing
      const updated = inspectors.map(i => 
        i.id === editingInspector.id ? { ...editingInspector, ...formData } : i
      )
      setInspectors(updated)
      localStorage.setItem('vba-inspectors', JSON.stringify(updated))
    } else {
      // Add new
      const newInspector: Inspector = {
        id: Date.now().toString(),
        name: formData.name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        role: formData.role || 'Inspector',
        licenseNumber: formData.licenseNumber || '',
        specializations: formData.specializations || [],
        location: formData.location || 'Fort Myers, FL',
        rating: formData.rating || 5,
        completedInspections: formData.completedInspections || 0,
        yearsExperience: formData.yearsExperience || 0,
        availability: formData.availability || 'available',
        certifications: formData.certifications || []
      }
      const updated = [...inspectors, newInspector]
      setInspectors(updated)
      localStorage.setItem('vba-inspectors', JSON.stringify(updated))
    }
    
    setShowAddModal(false)
    setEditingInspector(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Inspector',
      licenseNumber: '',
      specializations: [],
      location: 'Fort Myers, FL',
      rating: 5,
      completedInspections: 0,
      yearsExperience: 0,
      availability: 'available',
      certifications: []
    })
  }

  const handleDeleteInspector = (id: string) => {
    const updated = inspectors.filter(i => i.id !== id)
    setInspectors(updated)
    localStorage.setItem('vba-inspectors', JSON.stringify(updated))
  }

  const filteredInspectors = inspectors.filter(inspector => {
    const matchesSearch = 
      inspector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspector.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspector.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspector.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesRole = filterRole === 'all' || inspector.role === filterRole
    const matchesAvailability = filterAvailability === 'all' || inspector.availability === filterAvailability
    
    return matchesSearch && matchesRole && matchesAvailability
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/vba')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Inspector Directory</h1>
              <p className="text-sm text-gray-600">Manage and view inspector information</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add Inspector
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, license, or specialization..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="Senior Inspector">Senior Inspector</option>
              <option value="Lead Inspector">Lead Inspector</option>
              <option value="Inspector">Inspector</option>
              <option value="Junior Inspector">Junior Inspector</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
            >
              <option value="all">All Availability</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>

        {/* Inspector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInspectors.map(inspector => (
            <div key={inspector.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold text-lg">
                      {inspector.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{inspector.name}</h3>
                    <p className="text-sm text-gray-600">{inspector.role}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingInspector(inspector)
                      setFormData(inspector)
                      setShowAddModal(true)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteInspector(inspector.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Award className="h-4 w-4" />
                  <span>{inspector.licenseNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{inspector.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{inspector.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{inspector.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{inspector.rating}</span>
                </div>
                <div className="text-gray-600">
                  {inspector.completedInspections} inspections
                </div>
                <div className="text-gray-600">
                  {inspector.yearsExperience} years
                </div>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {inspector.specializations.map((spec, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  inspector.availability === 'available' 
                    ? 'bg-green-100 text-green-700' 
                    : inspector.availability === 'busy'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {inspector.availability === 'available' ? 'Available' : 
                   inspector.availability === 'busy' ? 'Busy' : 'Unavailable'}
                </span>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredInspectors.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inspectors found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingInspector ? 'Edit Inspector' : 'Add New Inspector'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingInspector(null)
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      role: 'Inspector',
                      licenseNumber: '',
                      specializations: [],
                      location: 'Fort Myers, FL',
                      rating: 5,
                      completedInspections: 0,
                      yearsExperience: 0,
                      availability: 'available',
                      certifications: []
                    })
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="Senior Inspector">Senior Inspector</option>
                    <option value="Lead Inspector">Lead Inspector</option>
                    <option value="Inspector">Inspector</option>
                    <option value="Junior Inspector">Junior Inspector</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value as any })}
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years Experience</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={formData.yearsExperience}
                    onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Completed Inspections</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={formData.completedInspections}
                    onChange={(e) => setFormData({ ...formData, completedInspections: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingInspector(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInspector}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingInspector ? 'Update' : 'Add'} Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}