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
  Trash2
} from 'lucide-react'

interface OrganizationData {
  // Company Information
  companyName: string
  legalName: string
  taxId: string
  licenseNumber: string
  foundedYear: string
  companyType: string
  
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
    companyName: 'IPC Solutions Inc.',
    legalName: 'Intelligent Plan Check Solutions, Inc.',
    taxId: '88-1234567',
    licenseNumber: 'FL-BC-123456',
    foundedYear: '2020',
    companyType: 'Corporation',
    mainPhone: '(239) 555-0100',
    mainEmail: 'info@ipcsolutions.com',
    supportEmail: 'support@ipcsolutions.com',
    website: 'https://ipcsolutions.com',
    streetAddress: '123 Innovation Drive',
    suite: 'Suite 400',
    city: 'Fort Myers',
    state: 'FL',
    zipCode: '33901',
    country: 'United States',
    numberOfEmployees: '25-50',
    annualRevenue: '$5M - $10M',
    primaryIndustry: 'Construction Technology',
    secondaryIndustries: ['Building Inspection', 'Permit Management', 'Compliance Software'],
    certifications: ['ISO 9001:2015', 'SOC 2 Type II', 'OSHA Certified'],
    billingAddress: '123 Innovation Drive',
    billingCity: 'Fort Myers',
    billingState: 'FL',
    billingZip: '33901',
    paymentMethod: 'Credit Card',
    billingEmail: 'billing@ipcsolutions.com',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    language: 'English'
  })
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@ipcsolutions.com',
      role: 'CEO',
      department: 'Executive',
      phone: '(239) 555-0101',
      status: 'active',
      joinedDate: '2020-01-15',
      lastActive: '2024-01-28'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@ipcsolutions.com',
      role: 'CTO',
      department: 'Technology',
      phone: '(239) 555-0102',
      status: 'active',
      joinedDate: '2020-03-01',
      lastActive: '2024-01-28'
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike.w@ipcsolutions.com',
      role: 'Lead Inspector',
      department: 'Operations',
      phone: '(239) 555-0103',
      status: 'active',
      joinedDate: '2021-06-15',
      lastActive: '2024-01-27'
    }
  ])

  const handleSave = () => {
    // Save organization data to database
    localStorage.setItem('organizationData', JSON.stringify(organizationData))
    setIsEditing(false)
    alert('Organization information saved successfully!')
  }

  const handleInputChange = (field: keyof OrganizationData, value: string | string[]) => {
    setOrganizationData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const stats = [
    { label: 'Active Projects', value: '47', icon: Briefcase, color: 'text-sky-600' },
    { label: 'Team Members', value: teamMembers.length.toString(), icon: Users, color: 'text-green-600' },
    { label: 'Certifications', value: organizationData.certifications.length.toString(), icon: Award, color: 'text-purple-600' },
    { label: 'Years Active', value: (new Date().getFullYear() - parseInt(organizationData.foundedYear)).toString(), icon: Calendar, color: 'text-orange-600' }
  ]

  return (
    <div className="p-6">
      <PageTitle title="Organization" subtitle="Manage company information and settings" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {['details', 'team', 'billing', 'compliance'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Company Details</h3>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                isEditing 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-sky-600 text-white hover:bg-sky-700'
              }`}
            >
              {isEditing ? (
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
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Company Information
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={organizationData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Legal Name</label>
                  <input
                    type="text"
                    value={organizationData.legalName}
                    onChange={(e) => handleInputChange('legalName', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tax ID</label>
                    <input
                      type="text"
                      value={organizationData.taxId}
                      onChange={(e) => handleInputChange('taxId', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">License #</label>
                    <input
                      type="text"
                      value={organizationData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Information
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Main Phone</label>
                  <input
                    type="tel"
                    value={organizationData.mainPhone}
                    onChange={(e) => handleInputChange('mainPhone', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Main Email</label>
                  <input
                    type="email"
                    value={organizationData.mainEmail}
                    onChange={(e) => handleInputChange('mainEmail', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Website</label>
                  <input
                    type="url"
                    value={organizationData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address Information
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={organizationData.streetAddress}
                    onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">City</label>
                    <input
                      type="text"
                      value={organizationData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">State</label>
                    <input
                      type="text"
                      value={organizationData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Business Details
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Primary Industry</label>
                  <input
                    type="text"
                    value={organizationData.primaryIndustry}
                    onChange={(e) => handleInputChange('primaryIndustry', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Employees</label>
                    <select
                      value={organizationData.numberOfEmployees}
                      onChange={(e) => handleInputChange('numberOfEmployees', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                    >
                      <option value="1-10">1-10</option>
                      <option value="11-25">11-25</option>
                      <option value="25-50">25-50</option>
                      <option value="51-100">51-100</option>
                      <option value="100+">100+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Annual Revenue</label>
                    <select
                      value={organizationData.annualRevenue}
                      onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
            <button className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Member
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{member.role}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{member.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{member.phone}</td>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Billing Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Method
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Payment Type</label>
                  <select
                    value={organizationData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Check">Check</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Billing Email</label>
                  <input
                    type="email"
                    value={organizationData.billingEmail}
                    onChange={(e) => handleInputChange('billingEmail', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Billing Address
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={organizationData.billingAddress}
                    onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">City</label>
                    <input
                      type="text"
                      value={organizationData.billingCity}
                      onChange={(e) => handleInputChange('billingCity', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">ZIP</label>
                    <input
                      type="text"
                      value={organizationData.billingZip}
                      onChange={(e) => handleInputChange('billingZip', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Compliance & Certifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Active Certifications
              </h4>
              <div className="space-y-3">
                {organizationData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-gray-900">{cert}</span>
                    </div>
                    {isEditing && (
                      <button className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-sky-500 hover:text-sky-600">
                    + Add Certification
                  </button>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Compliance Status
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm font-medium text-green-900">Insurance</span>
                  <span className="text-xs text-green-700">Valid until 12/31/2024</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm font-medium text-green-900">License</span>
                  <span className="text-xs text-green-700">Valid until 06/30/2024</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <span className="text-sm font-medium text-yellow-900">Bonding</span>
                  <span className="text-xs text-yellow-700">Renewal needed in 30 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}