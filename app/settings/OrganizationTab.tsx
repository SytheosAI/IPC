import { FileText, Shield, Upload, CheckCircle, Folder } from 'lucide-react'

interface OrganizationData {
  companyName: string
  legalName: string
  taxId: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  email: string
  website: string
  yearEstablished: string
  numberOfEmployees: string
  licenseNumber: string
  licenseState: string
  licenseExpiry: string
  insuranceCarrier: string
  policyNumber: string
  documents: {
    license?: File | null
    w9?: File | null
    generalLiability?: File | null
    workersComp?: File | null
  }
}

interface OrganizationTabProps {
  organization: OrganizationData
  setOrganization: (org: OrganizationData) => void
  handleFileUpload: (docType: keyof OrganizationData['documents'], file: File) => void
  handleSave: () => void
  fileInputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>
}

export default function OrganizationTab({
  organization,
  setOrganization,
  handleFileUpload,
  handleSave,
  fileInputRefs
}: OrganizationTabProps) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Organization Information</h2>
      
      <div className="space-y-8">
        {/* Company Details */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Company Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={organization.companyName}
                onChange={(e) => setOrganization({ ...organization, companyName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Legal Name
              </label>
              <input
                type="text"
                value={organization.legalName}
                onChange={(e) => setOrganization({ ...organization, legalName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tax ID / EIN
              </label>
              <input
                type="text"
                value={organization.taxId}
                onChange={(e) => setOrganization({ ...organization, taxId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year Established
              </label>
              <input
                type="text"
                value={organization.yearEstablished}
                onChange={(e) => setOrganization({ ...organization, yearEstablished: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <input
                type="text"
                value={organization.address}
                onChange={(e) => setOrganization({ ...organization, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                City
              </label>
              <input
                type="text"
                value={organization.city}
                onChange={(e) => setOrganization({ ...organization, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                State
              </label>
              <input
                type="text"
                value={organization.state}
                onChange={(e) => setOrganization({ ...organization, state: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                value={organization.zipCode}
                onChange={(e) => setOrganization({ ...organization, zipCode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={organization.phone}
                onChange={(e) => setOrganization({ ...organization, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Licensing & Insurance */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Licensing & Insurance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                License Number
              </label>
              <input
                type="text"
                value={organization.licenseNumber}
                onChange={(e) => setOrganization({ ...organization, licenseNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                License State
              </label>
              <input
                type="text"
                value={organization.licenseState}
                onChange={(e) => setOrganization({ ...organization, licenseState: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Insurance Carrier
              </label>
              <input
                type="text"
                value={organization.insuranceCarrier}
                onChange={(e) => setOrganization({ ...organization, insuranceCarrier: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Policy Number
              </label>
              <input
                type="text"
                value={organization.policyNumber}
                onChange={(e) => setOrganization({ ...organization, policyNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Organization Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'license', label: 'Business License', icon: FileText },
              { key: 'w9', label: 'W-9 Form', icon: FileText },
              { key: 'generalLiability', label: 'General Liability Insurance', icon: Shield },
              { key: 'workersComp', label: 'Workers Compensation', icon: Shield }
            ].map((doc) => (
              <div key={doc.key} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <doc.icon className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">{doc.label}</span>
                  </div>
                  {organization.documents[doc.key as keyof OrganizationData['documents']] && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <input
                  ref={el => {
                    if (fileInputRefs.current) {
                      fileInputRefs.current[doc.key] = el
                    }
                  }}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(doc.key as keyof OrganizationData['documents'], e.target.files[0])}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRefs.current[doc.key]?.click()}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {organization.documents[doc.key as keyof OrganizationData['documents']] 
                    ? organization.documents[doc.key as keyof OrganizationData['documents']]?.name 
                    : 'Upload Document'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">
            Save Organization Info
          </button>
        </div>
      </div>
    </div>
  )
}