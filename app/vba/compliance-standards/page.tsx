'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageTitle from '@/components/PageTitle'
import { 
  ArrowLeft, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Building,
  Zap,
  Droplet,
  Home,
  Wind,
  Flame,
  TreePine,
  Wrench,
  Search
} from 'lucide-react'

export default function ComplianceStandardsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Standards', icon: Shield },
    { id: 'building', name: 'Building', icon: Building },
    { id: 'electrical', name: 'Electrical', icon: Zap },
    { id: 'plumbing', name: 'Plumbing', icon: Droplet },
    { id: 'mechanical', name: 'Mechanical', icon: Wrench },
    { id: 'fire', name: 'Fire Safety', icon: Flame },
    { id: 'accessibility', name: 'Accessibility', icon: Home },
    { id: 'energy', name: 'Energy', icon: TreePine },
    { id: 'wind', name: 'Wind Resistance', icon: Wind }
  ]

  const standards = [
    {
      id: '1',
      category: 'building',
      code: 'FBC 2023 - Chapter 10',
      title: 'Means of Egress',
      description: 'Requirements for exit access, exit discharge, and number of exits',
      criticalPoints: [
        'Minimum corridor width: 44 inches',
        'Maximum travel distance: 250 feet (with sprinklers)',
        'Minimum door width: 32 inches clear',
        'Maximum occupant load per exit: varies by occupancy'
      ],
      lastUpdated: '2023-10-01'
    },
    {
      id: '2',
      category: 'electrical',
      code: 'NEC 210.8',
      title: 'GFCI Protection Requirements',
      description: 'Ground-fault circuit-interrupter protection for personnel',
      criticalPoints: [
        'Required in bathrooms, kitchens, garages',
        'Outdoor receptacles require GFCI',
        'Within 6 feet of sinks',
        'All 125-volt, 15- and 20-ampere receptacles'
      ],
      lastUpdated: '2023-09-15'
    },
    {
      id: '3',
      category: 'plumbing',
      code: 'IPC 605.1',
      title: 'Water Supply System Design',
      description: 'Requirements for water supply system design and sizing',
      criticalPoints: [
        'Minimum water pressure: 40 psi',
        'Maximum water pressure: 80 psi',
        'Backflow prevention required',
        'Cross-connection control mandatory'
      ],
      lastUpdated: '2023-08-20'
    },
    {
      id: '4',
      category: 'fire',
      code: 'NFPA 13',
      title: 'Sprinkler System Installation',
      description: 'Standard for the installation of sprinkler systems',
      criticalPoints: [
        'Coverage area per sprinkler head',
        'Minimum water supply requirements',
        'Pipe sizing calculations',
        'Inspection and testing requirements'
      ],
      lastUpdated: '2023-11-05'
    },
    {
      id: '5',
      category: 'accessibility',
      code: 'ADA 2010 - Section 404',
      title: 'Doors, Doorways, and Gates',
      description: 'Accessibility requirements for doors and doorways',
      criticalPoints: [
        'Clear width minimum: 32 inches',
        'Maneuvering clearance: 18 inches',
        'Maximum opening force: 5 pounds',
        'Threshold height maximum: 1/2 inch'
      ],
      lastUpdated: '2023-07-10'
    },
    {
      id: '6',
      category: 'energy',
      code: 'IECC 2021 - R402',
      title: 'Building Thermal Envelope',
      description: 'Energy efficiency requirements for building envelope',
      criticalPoints: [
        'R-38 ceiling insulation (Climate Zone 2)',
        'R-13 wall insulation minimum',
        'U-factor 0.32 for windows',
        'Air leakage testing required'
      ],
      lastUpdated: '2023-12-01'
    },
    {
      id: '7',
      category: 'wind',
      code: 'ASCE 7-22 - Chapter 26',
      title: 'Wind Loads on Buildings',
      description: 'Wind load requirements for buildings and structures',
      criticalPoints: [
        'Design wind speed: 150 mph (Risk Category II)',
        'Exposure category determinations',
        'Wind-borne debris region requirements',
        'Roof uplift resistance calculations'
      ],
      lastUpdated: '2023-09-30'
    },
    {
      id: '8',
      category: 'mechanical',
      code: 'IMC 403.3',
      title: 'Mechanical Ventilation',
      description: 'Required mechanical ventilation rates',
      criticalPoints: [
        'Minimum outdoor air: 15 cfm per person',
        'Exhaust rates for bathrooms: 50 cfm',
        'Kitchen exhaust: 100 cfm minimum',
        'Air balance requirements'
      ],
      lastUpdated: '2023-10-15'
    },
    {
      id: '9',
      category: 'building',
      code: 'FBC 2023 - Chapter 16',
      title: 'Structural Design',
      description: 'Structural design requirements and load combinations',
      criticalPoints: [
        'Live load: 40 psf residential',
        'Wind load per ASCE 7',
        'Seismic design category',
        'Foundation requirements'
      ],
      lastUpdated: '2023-11-20'
    },
    {
      id: '10',
      category: 'electrical',
      code: 'NEC 250.24',
      title: 'Grounding and Bonding',
      description: 'System grounding and bonding requirements',
      criticalPoints: [
        'Grounding electrode system required',
        'Bonding of metal water piping',
        'Equipment grounding conductors',
        'Ground rod requirements: 8 feet minimum'
      ],
      lastUpdated: '2023-08-05'
    }
  ]

  const filteredStandards = standards.filter(standard => {
    const matchesCategory = selectedCategory === 'all' || standard.category === selectedCategory
    const matchesSearch = standard.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          standard.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          standard.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageTitle title="Compliance Standards" subtitle="Building codes and regulatory requirements" />
      <div className="mb-6">
        <button 
          onClick={() => router.push('/vba')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Search and Filter */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search standards by code, title, or description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
          {categories.slice(1).map(cat => {
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-lg border transition-all ${
                  selectedCategory === cat.id 
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <Icon className="h-5 w-5 mx-auto mb-1" />
                <span className="text-xs font-medium">{cat.name}</span>
              </button>
            )
          })}
        </div>

        {/* Standards List */}
        <div className="space-y-4">
          {filteredStandards.map(standard => {
            const category = categories.find(cat => cat.id === standard.category)
            const Icon = category?.icon || Shield
            
            return (
              <div key={standard.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    standard.category === 'electrical' ? 'bg-yellow-100' :
                    standard.category === 'plumbing' ? 'bg-blue-100' :
                    standard.category === 'fire' ? 'bg-red-100' :
                    standard.category === 'building' ? 'bg-gray-100' :
                    standard.category === 'accessibility' ? 'bg-green-100' :
                    standard.category === 'energy' ? 'bg-emerald-100' :
                    standard.category === 'wind' ? 'bg-sky-100' :
                    standard.category === 'mechanical' ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      standard.category === 'electrical' ? 'text-yellow-600' :
                      standard.category === 'plumbing' ? 'text-blue-600' :
                      standard.category === 'fire' ? 'text-red-600' :
                      standard.category === 'building' ? 'text-gray-600' :
                      standard.category === 'accessibility' ? 'text-green-600' :
                      standard.category === 'energy' ? 'text-emerald-600' :
                      standard.category === 'wind' ? 'text-sky-600' :
                      standard.category === 'mechanical' ? 'text-purple-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded mb-2">
                          {standard.code}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">{standard.title}</h3>
                      </div>
                      <span className="text-xs text-gray-500">
                        Updated: {new Date(standard.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{standard.description}</p>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Critical Points:</h4>
                      <ul className="space-y-1">
                        {standard.criticalPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredStandards.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No standards found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}