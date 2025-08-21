'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  FileText, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  ClipboardList,
  Home,
  Zap,
  Droplet,
  Building
} from 'lucide-react'

export default function InspectionGuidelinesPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('general')

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
              <h1 className="text-xl font-semibold text-gray-900">General Inspection Guidelines</h1>
              <p className="text-sm text-gray-600">Standards and best practices for all inspections</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* General Guidelines */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">General Guidelines</h2>
          
          {/* Pre-Inspection Requirements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Pre-Inspection Requirements</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Verify all required permits are obtained and posted on-site</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Ensure approved plans are available and match current construction</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Confirm site accessibility and safety measures are in place</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Review previous inspection reports and any outstanding violations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Verify inspector credentials and jurisdiction authority</span>
              </li>
            </ul>
          </div>

          {/* Safety Protocols */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Safety Protocols</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Wear appropriate PPE including hard hat, safety vest, and steel-toed boots</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Never enter unsafe structures or areas without proper assessment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Maintain awareness of active construction hazards</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Follow all OSHA safety guidelines and site-specific safety rules</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Report any immediate safety hazards to site supervisor</span>
              </li>
            </ul>
          </div>

          {/* Documentation Standards */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Documentation Standards</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Take clear, well-lit photographs of all inspected areas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Document all violations with specific code references</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Record accurate measurements and locations of deficiencies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Complete inspection reports within 24 hours of site visit</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Maintain chain of custody for all inspection documentation</span>
              </li>
            </ul>
          </div>

          {/* Common Violations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Common Violations</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Missing or improper fire blocking in walls and ceilings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Inadequate electrical grounding and bonding</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Improper plumbing venting or slope</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Missing hurricane straps or structural connectors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Non-compliant egress windows or emergency exits</span>
              </li>
            </ul>
          </div>

          {/* Best Practices */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Best Practices</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Arrive on time and check in with site supervisor</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Conduct systematic inspections following a consistent pattern</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Communicate findings clearly and professionally</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Provide educational guidance to contractors when appropriate</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Follow up on corrections within established timeframes</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Inspection-Specific Requirements */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Inspection-Specific Requirements</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Foundation Inspections */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Foundation Inspections</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Verify footing dimensions match approved plans</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Check reinforcement placement and clearances</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Confirm proper soil compaction and drainage</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Inspect waterproofing and dampproofing application</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Verify anchor bolt placement and embedment</span>
                </li>
              </ul>
            </div>

            {/* Framing Inspections */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Framing Inspections</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Check lumber grade stamps and moisture content</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Verify proper nailing patterns and fastener schedules</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Inspect load paths and structural connections</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Confirm fire blocking and draft stopping installation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Check window and door rough openings</span>
                </li>
              </ul>
            </div>

            {/* Electrical Inspections */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Electrical Inspections</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Verify proper wire sizing for circuit loads</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Check GFCI and AFCI protection requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Inspect grounding and bonding systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Confirm proper clearances and accessibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Test all safety devices and disconnects</span>
                </li>
              </ul>
            </div>

            {/* Plumbing Inspections */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Plumbing Inspections</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Perform pressure tests on supply lines</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Verify proper drain slope (1/4&quot; per foot minimum)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Check venting requirements and terminations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Inspect backflow prevention devices</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Confirm fixture rough-in measurements</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Final Inspections */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Inspections</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Test all life safety systems (smoke/CO detectors)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Verify ADA compliance for accessibility</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Check all required labels and placards</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Confirm certificate of occupancy requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Document all warranties and equipment manuals</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Important Code References */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Important Code References</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Building Codes:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Florida Building Code (FBC) - Latest Edition</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>International Building Code (IBC)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>National Electrical Code (NEC)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>International Plumbing Code (IPC)</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Standards:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>ASCE 7 - Wind Load Requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>ADA Standards for Accessible Design</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>NFPA Fire Protection Standards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Energy Conservation Code</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}