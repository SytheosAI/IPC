'use client'

import { useState, useEffect } from 'react'
import PageTitle from '@/components/PageTitle'
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Shield,
  CreditCard,
  FileText,
  Save,
  Edit2,
  Upload,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  UserPlus,
  Briefcase,
  Award,
  Trash2,
  X
} from 'lucide-react'

interface OrganizationData {
  // Company Information
  companyName: string
  legalName: string
  taxId: string
  licenseNumber: string
  foundedYear: string
  companyType: string
  logoUrl?: string
  
  // Contact Information
  mainPhone: string
  mainEmail: string
  supportEmail: string
  website: string
  
  // Address Information
  streetAddress: string
  suite: string
  city: string
  state: string
  zipCode: string
  country: string
  
  // Business Details
  numberOfEmployees: string
  annualRevenue: string
  primaryIndustry: string
  secondaryIndustries: string[]
  certifications: string[]
  
  // Billing Information
  billingAddress: string
  billingCity: string
  billingState: string
  billingZip: string
  paymentMethod: string
  billingEmail: string
  
  // System Settings
  timezone: string
  dateFormat: string
  currency: string
  language: string
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  department: string
  phone: string
  status: 'active' | 'inactive'
  joinedDate: string
  lastActive: string
}

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<'details' | 'team' | 'billing' | 'compliance'>('details')
  const [isEditing, setIsEditing] = useState(false)
  const [organizationData, setOrganizationData] = useState<OrganizationData>({
    companyName: '',
    legalName: '',
    taxId: '',
    licenseNumber: '',
    logoUrl: '',
    foundedYear: '',
    companyType: '',
    mainPhone: '',
    mainEmail: '',
    supportEmail: '',
    website: '',
    streetAddress: '',
    suite: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    numberOfEmployees: '',
    annualRevenue: '',
    primaryIndustry: '',
    secondaryIndustries: [],
    certifications: [],
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    paymentMethod: '',
    billingEmail: '',
    timezone: '',
    dateFormat: '',
    currency: '',
    language: ''
  })
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: ''
  })

  // Load organization data and members from database
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load organization data
        const orgResponse = await fetch('/api/organization')
        const orgData = await orgResponse.json()
        
        if (orgData && Object.keys(orgData).length > 0) {
          setOrganizationData({
            companyName: orgData.company_name || '',
            legalName: orgData.legal_name || '',
            taxId: orgData.tax_id || '',
            licenseNumber: orgData.license_number || '',
            logoUrl: orgData.logo_url || '',
            foundedYear: orgData.founded_year || '',
            companyType: orgData.company_type || '',
            mainPhone: orgData.main_phone || '',
            mainEmail: orgData.main_email || '',
            supportEmail: orgData.support_email || '',
            website: orgData.website || '',
            streetAddress: orgData.street_address || '',
            suite: orgData.suite || '',
            city: orgData.city || '',
            state: orgData.state || '',
            zipCode: orgData.zip_code || '',
            country: orgData.country || '',
            numberOfEmployees: orgData.number_of_employees || '',
            annualRevenue: orgData.annual_revenue || '',
            primaryIndustry: orgData.primary_industry || '',
            secondaryIndustries: orgData.secondary_industries || [],
            certifications: orgData.certifications || [],
            billingAddress: orgData.billing_address || '',
            billingCity: orgData.billing_city || '',
            billingState: orgData.billing_state || '',
            billingZip: orgData.billing_zip || '',
            paymentMethod: orgData.payment_method || '',
            billingEmail: orgData.billing_email || '',
            timezone: orgData.timezone || '',
            dateFormat: orgData.date_format || '',
            currency: orgData.currency || '',
            language: orgData.language || ''
          })
        }
        
        // Load members data
        const membersResponse = await fetch('/api/members')
        const membersData = await membersResponse.json()
        
        if (membersData.data && Array.isArray(membersData.data)) {
          const formattedMembers = membersData.data.map((member: any) => ({
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role,
            department: member.department,
            phone: member.phone,
            status: member.status || 'active',
            joinedDate: member.joined_date || member.created_at,
            lastActive: member.last_active || member.updated_at
          }))
          setTeamMembers(formattedMembers)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const handleAddMember = async () => {
    try {
      // Call the API to add the member
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMember)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add member')
      }
      
      const { data } = await response.json()
      
      // Add to local state
      const memberData = {
        ...data,
        status: data.status || 'active',
        joinedDate: data.joined_date || data.created_at,
        lastActive: data.last_active || data.updated_at
      }
      setTeamMembers(prev => [...prev, memberData])
      
      // Reset form and close modal
      setNewMember({ name: '', email: '', phone: '', role: '', department: '' })
      setShowAddMemberModal(false)
      
      alert('Team member added successfully!')
    } catch (error) {
      console.error('Error adding team member:', error)
      alert('Failed to add team member. Please try again.')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/organization', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(organizationData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to save organization data')
      }
      
      setIsEditing(false)
      alert('Organization information saved successfully!')
    } catch (error) {
      console.error('Error saving organization data:', error)
      alert('Failed to save organization data. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof OrganizationData, value: string | string[]) => {
    setOrganizationData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const stats = [
    { label: 'Active Projects', value: '0', icon: Briefcase, color: 'text-sky-600' },
    { label: 'Team Members', value: teamMembers.length.toString(), icon: Users, color: 'text-green-600' },
    { label: 'Certifications', value: organizationData.certifications.length.toString(), icon: Award, color: 'text-purple-600' },
    { label: 'Years Active', value: (new Date().getFullYear() - parseInt(organizationData.foundedYear)).toString(), icon: Calendar, color: 'text-orange-600' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 flex items-center justify-center">
        <div className="text-yellow-400 text-xl">Loading organization data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <PageTitle title="Organization" subtitle="Manage company information and settings" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="card-modern hover-lift backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-4 bg-gray-800/30 backdrop-blur-sm p-1 rounded-xl w-fit">
        {['details', 'team', 'billing', 'compliance'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === tab
                ? 'bg-yellow-500/20 text-yellow-400 shadow-glow'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="card-modern hover-lift backdrop-blur-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-yellow-400">Company Details</h3>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={saving}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-glow font-semibold ${
                isEditing 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-400 hover:to-green-500' 
                  : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-gray-900 hover:from-yellow-400 hover:to-orange-500'
              }`}
            >
              {saving ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4" />
                  Edit
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <Building className="h-4 w-4 text-yellow-400" />
                Company Information
              </h4>
              <div className="space-y-4">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm text-yellow-400 mb-1 font-medium">Company Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {organizationData.logoUrl ? (
                        <>
                          <img 
                            src={organizationData.logoUrl} 
                            alt="Company Logo" 
                            className="w-20 h-20 object-contain bg-gray-800/50 rounded-lg p-2"
                          />
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleInputChange('logoUrl', '')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              title="Remove logo"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="w-20 h-20 bg-gray-800/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                          <Upload className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="url"
                        value={organizationData.logoUrl || ''}
                        onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter logo image URL (https://example.com/logo.png)"
                        className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 disabled:bg-gray-700/30 disabled:text-gray-500 w-full"
                      />
                      {isEditing && (
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                try {
                                  // Upload the file
                                  const formData = new FormData()
                                  formData.append('file', file)
                                  
                                  const response = await fetch('/api/upload', {
                                    method: 'POST',
                                    body: formData
                                  })
                                  
                                  if (response.ok) {
                                    const { url } = await response.json()
                                    handleInputChange('logoUrl', url)
                                    alert('Logo uploaded successfully!')
                                  } else {
                                    alert('Failed to upload logo. Please try again.')
                                  }
                                } catch (error) {
                                  console.error('Upload error:', error)
                                  alert('Failed to upload logo. Please try again.')
                                }
                                e.target.value = '' // Reset file input
                              }
                            }}
                            className="hidden"
                            id="logoFileInput"
                          />
                          <label
                            htmlFor="logoFileInput"
                            className="cursor-pointer px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-400 text-xs hover:bg-yellow-500/30 transition-colors"
                          >
                            Choose File
                          </label>
                          <span className="text-xs text-gray-500">or paste image URL above</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-yellow-400 mb-1 font-medium">Company Name</label>
                  <input
                    type="text"
                    value={organizationData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    disabled={!isEditing}
                    className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 disabled:bg-gray-700/30 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-yellow-400 mb-1 font-medium">Legal Name</label>
                  <input
                    type="text"
                    value={organizationData.legalName}
                    onChange={(e) => handleInputChange('legalName', e.target.value)}
                    disabled={!isEditing}
                    className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 disabled:bg-gray-700/30 disabled:text-gray-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-yellow-400 mb-1 font-medium">Tax ID</label>
                    <input
                      type="text"
                      value={organizationData.taxId}
                      onChange={(e) => handleInputChange('taxId', e.target.value)}
                      disabled={!isEditing}
                      className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 disabled:bg-gray-700/30 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-yellow-400 mb-1 font-medium">License #</label>
                    <input
                      type="text"
                      value={organizationData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      disabled={!isEditing}
                      className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 disabled:bg-gray-700/30 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <Phone className="h-4 w-4 text-yellow-400" />
                Contact Information
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-yellow-400 mb-1 font-medium">Main Phone</label>
                  <input
                    type="tel"
                    value={organizationData.mainPhone}
                    onChange={(e) => handleInputChange('mainPhone', e.target.value)}
                    disabled={!isEditing}
                    className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 disabled:bg-gray-700/30 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-yellow-400 mb-1 font-medium">Main Email</label>
                  <input
                    type="email"
                    value={organizationData.mainEmail}
                    onChange={(e) => handleInputChange('mainEmail', e.target.value)}
                    disabled={!isEditing}
                    className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 disabled:bg-gray-700/30 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-yellow-400 mb-1 font-medium">Website</label>
                  <input
                    type="url"
                    value={organizationData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!isEditing}
                    className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 disabled:bg-gray-700/30 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-yellow-400" />
                Address Information
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-yellow-400 mb-1 font-medium">Street Address</label>
                  <input
                    type="text"
                    value={organizationData.streetAddress}
                    onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                    disabled={!isEditing}
                    className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 disabled:bg-gray-700/30 disabled:text-gray-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm text-yellow-400 mb-1 font-medium">City</label>
                    <input
                      type="text"
                      value={organizationData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!isEditing}
                      className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 disabled:bg-gray-700/30 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-yellow-400 mb-1 font-medium">State</label>
                    <input
                      type="text"
                      value={organizationData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      disabled={!isEditing}
                      className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 disabled:bg-gray-700/30 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-yellow-400" />
                Business Details
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-yellow-400 mb-1 font-medium">Primary Industry</label>
                  <input
                    type="text"
                    value={organizationData.primaryIndustry}
                    onChange={(e) => handleInputChange('primaryIndustry', e.target.value)}
                    disabled={!isEditing}
                    className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 disabled:bg-gray-700/30 disabled:text-gray-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-yellow-400 mb-1 font-medium">Employees</label>
                    <select
                      value={organizationData.numberOfEmployees}
                      onChange={(e) => handleInputChange('numberOfEmployees', e.target.value)}
                      disabled={!isEditing}
                      className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 disabled:bg-gray-700/30 disabled:text-gray-500"
                    >
                      <option value="1-10">1-10</option>
                      <option value="11-25">11-25</option>
                      <option value="25-50">25-50</option>
                      <option value="51-100">51-100</option>
                      <option value="100+">100+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-yellow-400 mb-1 font-medium">Annual Revenue</label>
                    <select
                      value={organizationData.annualRevenue}
                      onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                      disabled={!isEditing}
                      className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 disabled:bg-gray-700/30 disabled:text-gray-500"
                    >
                      <option value="< $1M">Less than $1M</option>
                      <option value="$1M - $5M">$1M - $5M</option>
                      <option value="$5M - $10M">$5M - $10M</option>
                      <option value="$10M - $50M">$10M - $50M</option>
                      <option value="$50M+">$50M+</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="card-modern hover-lift backdrop-blur-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-yellow-400">Team Members</h3>
            <button 
              onClick={() => setShowAddMemberModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-gray-900 rounded-xl hover:from-yellow-400 hover:to-orange-500 font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-glow"
            >
              <UserPlus className="h-4 w-4" />
              Add Member
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-200">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{member.role}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{member.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{member.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        member.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(member.lastActive).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="card-modern hover-lift backdrop-blur-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-400 mb-6">Billing Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-yellow-400" />
                Payment Method
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-yellow-400 mb-1 font-medium">Payment Type</label>
                  <select
                    value={organizationData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    disabled={!isEditing}
                    className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 disabled:bg-gray-700/30 disabled:text-gray-500"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Check">Check</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-yellow-400 mb-1 font-medium">Billing Email</label>
                  <input
                    type="email"
                    value={organizationData.billingEmail}
                    onChange={(e) => handleInputChange('billingEmail', e.target.value)}
                    disabled={!isEditing}
                    className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 disabled:bg-gray-700/30 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-yellow-400" />
                Billing Address
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-yellow-400 mb-1 font-medium">Street Address</label>
                  <input
                    type="text"
                    value={organizationData.billingAddress}
                    onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                    disabled={!isEditing}
                    className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 disabled:bg-gray-700/30 disabled:text-gray-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm text-yellow-400 mb-1 font-medium">City</label>
                    <input
                      type="text"
                      value={organizationData.billingCity}
                      onChange={(e) => handleInputChange('billingCity', e.target.value)}
                      disabled={!isEditing}
                      className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 disabled:bg-gray-700/30 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-yellow-400 mb-1 font-medium">ZIP</label>
                    <input
                      type="text"
                      value={organizationData.billingZip}
                      onChange={(e) => handleInputChange('billingZip', e.target.value)}
                      disabled={!isEditing}
                      className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 disabled:bg-gray-700/30 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="card-modern hover-lift backdrop-blur-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-400 mb-6">Compliance & Certifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-400" />
                Active Certifications
              </h4>
              <div className="space-y-3">
                {organizationData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-600 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-gray-200">{cert}</span>
                    </div>
                    {isEditing && (
                      <button className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button className="w-full py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-yellow-500 hover:text-yellow-400">
                    + Add Certification
                  </button>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-yellow-400" />
                Compliance Status
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-600/50 rounded-lg">
                  <span className="text-sm font-medium text-green-400">Insurance</span>
                  <span className="text-xs text-green-500">Valid until 12/31/2024</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-600/50 rounded-lg">
                  <span className="text-sm font-medium text-green-400">License</span>
                  <span className="text-xs text-green-500">Valid until 06/30/2024</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
                  <span className="text-sm font-medium text-yellow-400">Bonding</span>
                  <span className="text-xs text-yellow-500">Renewal needed in 30 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card-modern max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-yellow-400">Add Team Member</h3>
              <button
                onClick={() => {
                  setShowAddMemberModal(false)
                  setNewMember({ name: "", email: "", phone: "", role: "", department: "" })
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddMember(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-yellow-400 mb-1 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    required
                    className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 w-full"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-yellow-400 mb-1 font-medium">Role</label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    required
                    className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white w-full"
                  >
                    <option value="">Select role</option>
                    <option value="Manager">Manager</option>
                    <option value="Inspector">Inspector</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Field Worker">Field Worker</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Consultant">Consultant</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-yellow-400 mb-1 font-medium">Email</label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    required
                    className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 w-full"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm text-yellow-400 mb-1 font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    required
                    className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 w-full"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-yellow-400 mb-1 font-medium">Department</label>
                <input
                  type="text"
                  value={newMember.department}
                  onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                  required
                  className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 w-full"
                  placeholder="Enter department"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMemberModal(false)
                    setNewMember({ name: "", email: "", phone: "", role: "", department: "" })
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-gray-900 rounded-lg hover:from-yellow-400 hover:to-orange-500 font-semibold transition-all"
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