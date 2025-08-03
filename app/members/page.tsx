'use client'

import { useState } from 'react'
import { 
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Building,
  Home,
  ChevronRight,
  X,
  Shield,
  UserPlus,
  CheckCircle
} from 'lucide-react'

interface Member {
  id: string
  name: string
  email: string
  phone: string
  company: string
  role: string
  type: 'contractor' | 'architect' | 'engineer' | 'inspector' | 'owner' | 'other'
  status: 'active' | 'inactive' | 'pending'
  joinedDate: string
  lastActive: string
  projects: number
  licenseNumber?: string
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '(305) 555-0123',
      company: 'Smith Construction LLC',
      role: 'General Contractor',
      type: 'contractor',
      status: 'active',
      joinedDate: '2024-01-05',
      lastActive: '2024-01-19',
      projects: 5,
      licenseNumber: 'CGC1234567'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@architectureplus.com',
      phone: '(305) 555-0124',
      company: 'Architecture Plus',
      role: 'Lead Architect',
      type: 'architect',
      status: 'active',
      joinedDate: '2024-01-08',
      lastActive: '2024-01-18',
      projects: 3,
      licenseNumber: 'AR0012345'
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mchen@cityinspections.gov',
      phone: '(305) 555-0125',
      company: 'City Building Department',
      role: 'Senior Inspector',
      type: 'inspector',
      status: 'active',
      joinedDate: '2023-11-15',
      lastActive: '2024-01-19',
      projects: 12
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    type: 'contractor' as Member['type'],
    licenseNumber: ''
  })

  const memberTypes = {
    contractor: { label: 'Contractor', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    architect: { label: 'Architect', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    engineer: { label: 'Engineer', color: 'bg-green-100 text-green-700 border-green-300' },
    inspector: { label: 'Inspector', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    owner: { label: 'Owner', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    other: { label: 'Other', color: 'bg-gray-100 text-gray-700 border-gray-300' }
  }

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    
    const member: Member = {
      id: Date.now().toString(),
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone,
      company: newMember.company,
      role: newMember.role,
      type: newMember.type,
      status: 'pending',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      projects: 0,
      licenseNumber: newMember.licenseNumber
    }
    
    setMembers([member, ...members])
    setShowAddModal(false)
    setNewMember({
      name: '',
      email: '',
      phone: '',
      company: '',
      role: '',
      type: 'contractor',
      licenseNumber: ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-300'
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.company.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || member.type === filterType
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Home className="h-4 w-4" />
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">Members</span>
      </div>

      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600 mt-1">Manage project participants and contacts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{members.length}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {members.filter(m => m.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Contractors</p>
              <p className="text-2xl font-bold text-blue-600">
                {members.filter(m => m.type === 'contractor').length}
              </p>
            </div>
            <Building className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inspectors</p>
              <p className="text-2xl font-bold text-yellow-600">
                {members.filter(m => m.type === 'inspector').length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-yellow-400" />
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
              placeholder="Search members..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              {Object.entries(memberTypes).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
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

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                    <span className="text-lg font-semibold text-gray-700">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="h-4 w-4 mr-2 text-gray-400" />
                  {member.company}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {member.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {member.phone}
                </div>
                {member.licenseNumber && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="h-4 w-4 mr-2 text-gray-400" />
                    License: {member.licenseNumber}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${memberTypes[member.type].color}`}>
                    {memberTypes[member.type].label}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(member.status)}`}>
                    {member.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:text-sky-600 transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-sky-600 transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <span>Joined {new Date(member.joinedDate).toLocaleDateString()}</span>
                <span>{member.projects} projects</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add New Member</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddMember} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    placeholder="(555) 555-5555"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={newMember.company}
                    onChange={(e) => setNewMember({ ...newMember, company: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role/Title</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    placeholder="e.g., General Contractor, Lead Architect"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member Type</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={newMember.type}
                    onChange={(e) => setNewMember({ ...newMember, type: e.target.value as Member['type'] })}
                  >
                    {Object.entries(memberTypes).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number (Optional)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={newMember.licenseNumber}
                    onChange={(e) => setNewMember({ ...newMember, licenseNumber: e.target.value })}
                    placeholder="Professional license number"
                  />
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
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}