// Florida Jurisdiction Profiles for Permit Portal Integration
// Contains configuration for major FL cities and counties

export interface JurisdictionProfile {
  id: string
  name: string
  type: 'city' | 'county'
  region: string
  population?: number
  portal: {
    provider: 'tyler' | 'accela' | 'cityview' | 'citizenserve' | 'viewpoint' | 'custom'
    url: string
    publicSearchUrl?: string
    apiAvailable: boolean
    apiDocumentation?: string
    sandboxAvailable?: boolean
  }
  contact: {
    department: string
    phone?: string
    email?: string
    address?: string
  }
  permitTypes: string[]
  inspectionTypes: string[]
  fees: {
    structure: 'flat' | 'percentage' | 'tiered'
    onlinePayment: boolean
    paymentMethods: string[]
  }
  requirements?: {
    contractorLicense: boolean
    noticeOfCommencement: boolean
    workersComp: boolean
    generalLiability: boolean
  }
  timeline?: {
    reviewDays: number
    expirationDays: number
    extensionAllowed: boolean
  }
  notes?: string
}

// Major Florida Jurisdictions
export const floridaJurisdictions: JurisdictionProfile[] = [
  // SOUTH FLORIDA REGION
  {
    id: 'miami-dade',
    name: 'Miami-Dade County',
    type: 'county',
    region: 'South Florida',
    population: 2700000,
    portal: {
      provider: 'tyler',
      url: 'https://www.miamidade.gov/permits/',
      publicSearchUrl: 'https://www.miamidade.gov/permits/search-permits.asp',
      apiAvailable: true,
      apiDocumentation: 'https://www.miamidade.gov/api/permits',
      sandboxAvailable: true
    },
    contact: {
      department: 'Department of Regulatory and Economic Resources',
      phone: '(786) 315-2000',
      email: 'permits@miamidade.gov',
      address: '11805 SW 26th Street, Miami, FL 33175'
    },
    permitTypes: ['Building', 'Electrical', 'Mechanical', 'Plumbing', 'Roofing', 'Pool', 'Demo'],
    inspectionTypes: ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'Mechanical', 'Final'],
    fees: {
      structure: 'tiered',
      onlinePayment: true,
      paymentMethods: ['Credit Card', 'ACH', 'Check']
    },
    requirements: {
      contractorLicense: true,
      noticeOfCommencement: true,
      workersComp: true,
      generalLiability: true
    },
    timeline: {
      reviewDays: 10,
      expirationDays: 180,
      extensionAllowed: true
    }
  },
  {
    id: 'broward',
    name: 'Broward County',
    type: 'county',
    region: 'South Florida',
    population: 1950000,
    portal: {
      provider: 'tyler',
      url: 'https://www.broward.org/permittingandlicensing/',
      publicSearchUrl: 'https://bcwebprodext.broward.org/eservices/',
      apiAvailable: true,
      sandboxAvailable: true
    },
    contact: {
      department: 'Building Code Services Division',
      phone: '(954) 765-4400',
      email: 'permits@broward.org'
    },
    permitTypes: ['Building', 'Electrical', 'Mechanical', 'Plumbing', 'Roofing', 'Pool'],
    inspectionTypes: ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'Mechanical', 'Final'],
    fees: {
      structure: 'tiered',
      onlinePayment: true,
      paymentMethods: ['Credit Card', 'ACH', 'eCheck']
    }
  },
  {
    id: 'palm-beach',
    name: 'Palm Beach County',
    type: 'county',
    region: 'South Florida',
    population: 1500000,
    portal: {
      provider: 'tyler',
      url: 'https://www.pbcgov.com/pzb/',
      publicSearchUrl: 'https://epermitting.pbcgov.org/EnerGovProd/',
      apiAvailable: true,
      sandboxAvailable: false
    },
    contact: {
      department: 'Planning, Zoning & Building Department',
      phone: '(561) 233-5000',
      email: 'pzb@pbcgov.org'
    },
    permitTypes: ['Building', 'Electrical', 'Mechanical', 'Plumbing', 'Roofing'],
    inspectionTypes: ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'Final'],
    fees: {
      structure: 'percentage',
      onlinePayment: true,
      paymentMethods: ['Credit Card', 'ACH']
    }
  },
  
  // SOUTHWEST FLORIDA REGION
  {
    id: 'lee-county',
    name: 'Lee County',
    type: 'county',
    region: 'Southwest Florida',
    population: 770000,
    portal: {
      provider: 'accela',
      url: 'https://www.leegov.com/dcd',
      publicSearchUrl: 'https://econnect.leegov.com/econnect/',
      apiAvailable: true,
      apiDocumentation: 'Contact IT Department',
      sandboxAvailable: false
    },
    contact: {
      department: 'Department of Community Development',
      phone: '(239) 533-8585',
      email: 'dcdinfo@leegov.com',
      address: '1500 Monroe Street, Fort Myers, FL 33901'
    },
    permitTypes: ['Building', 'Electrical', 'Mechanical', 'Plumbing', 'Roofing', 'Pool', 'Fence'],
    inspectionTypes: ['Spot Survey', 'Tie Beam', 'Lintel', 'Framing', 'Insulation', 'Drywall', 'Final'],
    fees: {
      structure: 'tiered',
      onlinePayment: true,
      paymentMethods: ['Credit Card', 'eCheck', 'Cash', 'Check']
    },
    requirements: {
      contractorLicense: true,
      noticeOfCommencement: true,
      workersComp: true,
      generalLiability: true
    },
    timeline: {
      reviewDays: 15,
      expirationDays: 180,
      extensionAllowed: true
    },
    notes: 'Requires flood elevation certificate for properties in flood zones'
  },
  {
    id: 'collier',
    name: 'Collier County',
    type: 'county',
    region: 'Southwest Florida',
    population: 380000,
    portal: {
      provider: 'accela',
      url: 'https://www.colliercountyfl.gov/government/growth-management',
      publicSearchUrl: 'https://citizenaccess.colliercountyfl.gov/',
      apiAvailable: true,
      sandboxAvailable: false
    },
    contact: {
      department: 'Growth Management Department',
      phone: '(239) 252-2400',
      email: 'gmdesk@colliercountyfl.gov'
    },
    permitTypes: ['Building', 'Electrical', 'Mechanical', 'Plumbing', 'Roofing', 'Pool'],
    inspectionTypes: ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'Mechanical', 'Final'],
    fees: {
      structure: 'tiered',
      onlinePayment: true,
      paymentMethods: ['Credit Card', 'ACH', 'Check']
    }
  },
  {
    id: 'charlotte',
    name: 'Charlotte County',
    type: 'county',
    region: 'Southwest Florida',
    population: 190000,
    portal: {
      provider: 'citizenserve',
      url: 'https://www.charlottecountyfl.gov/services/buildingconstruction/',
      publicSearchUrl: 'https://charlotte.citizenserve.com/',
      apiAvailable: false,
      sandboxAvailable: false
    },
    contact: {
      department: 'Building Construction Services',
      phone: '(941) 743-1201',
      email: 'building@charlottecountyfl.gov'
    },
    permitTypes: ['Building', 'Electrical', 'Mechanical', 'Plumbing', 'Roofing'],
    inspectionTypes: ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'Final'],
    fees: {
      structure: 'flat',
      onlinePayment: true,
      paymentMethods: ['Credit Card', 'Check']
    }
  },
  {
    id: 'sarasota',
    name: 'Sarasota County',
    type: 'county',
    region: 'Southwest Florida',
    population: 430000,
    portal: {
      provider: 'accela',
      url: 'https://www.scgov.net/government/planning-and-development-services',
      publicSearchUrl: 'https://aca.scgov.net/',
      apiAvailable: true,
      sandboxAvailable: false
    },
    contact: {
      department: 'Planning and Development Services',
      phone: '(941) 861-5000',
      email: 'permits@scgov.net'
    },
    permitTypes: ['Building', 'Electrical', 'Mechanical', 'Plumbing', 'Roofing', 'Pool'],
    inspectionTypes: ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'Mechanical', 'Final'],
    fees: {
      structure: 'tiered',
      onlinePayment: true,
      paymentMethods: ['Credit Card', 'ACH', 'Check']
    }
  },
  
  // CENTRAL FLORIDA REGION
  {
    id: 'orlando',
    name: 'City of Orlando',
    type: 'city',
    region: 'Central Florida',
    population: 310000,
    portal: {
      provider: 'accela',
      url: 'https://www.orlando.gov/Building-Development',
      publicSearchUrl: 'https://aca1.accela.com/orlando/',
      apiAvailable: true,
      apiDocumentation: 'https://www.orlando.gov/api',
      sandboxAvailable: true
    },
    contact: {
      department: 'Permitting Services',
      phone: '(407) 246-2300',
      email: 'permits@orlando.gov'
    },
    permitTypes: ['Building', 'Electrical', 'Mechanical', 'Plumbing', 'Roofing', 'Sign'],
    inspectionTypes: ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'Mechanical', 'Final'],
    fees: {
      structure: 'tiered',
      onlinePayment: true,
      paymentMethods: ['Credit Card', 'ACH', 'Bitcoin']
    },
    notes: 'First city in Florida to accept cryptocurrency for permit payments'
  },
  {
    id: 'orange-county',
    name: 'Orange County',
    type: 'county',
    region: 'Central Florida',
    population: 1400000,
    portal: {
      provider: 'tyler',
      url: 'https://www.orangecountyfl.net/PermitsLicenses/',
      publicSearchUrl: 'https://fasttrack.ocfl.net/',
      apiAvailable: true,
      sandboxAvailable: true
    },
    contact: {
      department: 'Building Safety Division',
      phone: '(407) 836-5550',
      email: 'building.safety@ocfl.net'
    },
    permitTypes: ['Building', 'Electrical', 'Mechanical', 'Plumbing', 'Roofing', 'Pool'],
    inspectionTypes: ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'Mechanical', 'Final'],
    fees: {
      structure: 'tiered',
      onlinePayment: true,
      paymentMethods: ['Credit Card', 'ACH', 'Check']
    }
  },
  {
    id: 'tampa',
    name: 'City of Tampa',
    type: 'city',
    region: 'Central Florida',
    population: 400000,
    portal: {
      provider: 'accela',
      url: 'https://www.tampa.gov/construction-services',
      publicSearchUrl: 'https://aca.tampa.gov/',
      apiAvailable: true,
      sandboxAvailable: false
    },
    contact: {
      department: 'Construction Services Department',
      phone: '(813) 274-3100',
      email: 'constructionservices@tampa.gov'
    },
    permitTypes: ['Building', 'Electrical', 'Mechanical', 'Plumbing', 'Roofing', 'Demo'],
    inspectionTypes: ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'Mechanical', 'Final'],
    fees: {
      structure: 'percentage',
      onlinePayment: true,
      paymentMethods: ['Credit Card', 'ACH']
    }
  },
  {
    id: 'hillsborough',
    name: 'Hillsborough County',
    type: 'county',
    region: 'Central Florida',
    population: 1500000,
    portal: {
      provider: 'accela',
      url: 'https://www.hillsboroughcounty.org/en/businesses/permits',
      publicSearchUrl: 'https://aca.hillsboroughcounty.org/',
      apiAvailable: true,
      sandboxAvailable: false
    },
    contact: {
      department: 'Development Services',
      phone: '(813) 272-5600',
      email: 'permits@hillsboroughcounty.org'
    },
    permitTypes: ['Building', 'Electrical', 'Mechanical', 'Plumbing', 'Roofing'],
    inspectionTypes: ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'Final'],
    fees: {
      structure: 'tiered',
      onlinePayment: true,
      paymentMethods: ['Credit Card', 'ACH', 'Check']
    }
  },
  
  // NORTH FLORIDA REGION
  {
    id: 'jacksonville',
    name: 'City of Jacksonville',
    type: 'city',
    region: 'North Florida',
    population: 950000,
    portal: {
      provider: 'accela',
      url: 'https://www.coj.net/departments/planning-and-development',
      publicSearchUrl: 'https://jaxepermit.coj.net/',
      apiAvailable: true,
      sandboxAvailable: false
    },
    contact: {
      department: 'Building Inspection Division',
      phone: '(904) 255-7000',
      email: 'buildinginspection@coj.net'
    },
    permitTypes: ['Building', 'Electrical', 'Mechanical', 'Plumbing', 'Roofing', 'Pool'],
    inspectionTypes: ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'Mechanical', 'Final'],
    fees: {
      structure: 'tiered',
      onlinePayment: true,
      paymentMethods: ['Credit Card', 'ACH']
    }
  },
  {
    id: 'duval',
    name: 'Duval County',
    type: 'county',
    region: 'North Florida',
    population: 1000000,
    portal: {
      provider: 'accela',
      url: 'https://www.duvalcountyfl.gov/',
      publicSearchUrl: 'https://jaxepermit.coj.net/',
      apiAvailable: true,
      sandboxAvailable: false
    },
    contact: {
      department: 'Building Inspection Division',
      phone: '(904) 255-7000',
      email: 'permits@duvalcountyfl.gov'
    },
    permitTypes: ['Building', 'Electrical', 'Mechanical', 'Plumbing', 'Roofing'],
    inspectionTypes: ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'Final'],
    fees: {
      structure: 'tiered',
      onlinePayment: true,
      paymentMethods: ['Credit Card', 'ACH']
    }
  },
  
  // SPECIAL MUNICIPALITIES
  {
    id: 'fort-myers',
    name: 'City of Fort Myers',
    type: 'city',
    region: 'Southwest Florida',
    population: 95000,
    portal: {
      provider: 'citizenserve',
      url: 'https://www.cityftmyers.com/development-services',
      publicSearchUrl: 'https://fortmyers.citizenserve.com/',
      apiAvailable: false,
      sandboxAvailable: false
    },
    contact: {
      department: 'Building Department',
      phone: '(239) 321-7925',
      email: 'building@cityftmyers.com',
      address: '1825 Hendry Street, Fort Myers, FL 33901'
    },
    permitTypes: ['Building', 'Electrical', 'Mechanical', 'Plumbing', 'Roofing', 'Sign'],
    inspectionTypes: ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'Mechanical', 'Final'],
    fees: {
      structure: 'flat',
      onlinePayment: true,
      paymentMethods: ['Credit Card', 'Check', 'Cash']
    },
    requirements: {
      contractorLicense: true,
      noticeOfCommencement: true,
      workersComp: true,
      generalLiability: true
    },
    timeline: {
      reviewDays: 10,
      expirationDays: 180,
      extensionAllowed: true
    }
  },
  {
    id: 'cape-coral',
    name: 'City of Cape Coral',
    type: 'city',
    region: 'Southwest Florida',
    population: 200000,
    portal: {
      provider: 'tyler',
      url: 'https://www.capecoral.gov/department/building_division/',
      publicSearchUrl: 'https://energov.capecoral.gov/',
      apiAvailable: true,
      sandboxAvailable: false
    },
    contact: {
      department: 'Building Division',
      phone: '(239) 574-0546',
      email: 'permits@capecoral.gov'
    },
    permitTypes: ['Building', 'Electrical', 'Mechanical', 'Plumbing', 'Roofing', 'Pool', 'Seawall'],
    inspectionTypes: ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'Mechanical', 'Final'],
    fees: {
      structure: 'tiered',
      onlinePayment: true,
      paymentMethods: ['Credit Card', 'ACH', 'Check']
    },
    notes: 'Special requirements for seawall and canal-related permits'
  },
  {
    id: 'naples',
    name: 'City of Naples',
    type: 'city',
    region: 'Southwest Florida',
    population: 22000,
    portal: {
      provider: 'custom',
      url: 'https://www.naplesgov.com/buildingpermitting',
      publicSearchUrl: 'https://permits.naplesgov.com/',
      apiAvailable: false,
      sandboxAvailable: false
    },
    contact: {
      department: 'Building Department',
      phone: '(239) 213-5030',
      email: 'building@naplesgov.com'
    },
    permitTypes: ['Building', 'Electrical', 'Mechanical', 'Plumbing', 'Roofing'],
    inspectionTypes: ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'Final'],
    fees: {
      structure: 'percentage',
      onlinePayment: true,
      paymentMethods: ['Credit Card', 'Check']
    },
    notes: 'Historic district has additional requirements'
  }
]

// Helper functions
export function getJurisdictionById(id: string): JurisdictionProfile | undefined {
  return floridaJurisdictions.find(j => j.id === id)
}

export function getJurisdictionsByRegion(region: string): JurisdictionProfile[] {
  return floridaJurisdictions.filter(j => j.region === region)
}

export function getJurisdictionsByProvider(provider: string): JurisdictionProfile[] {
  return floridaJurisdictions.filter(j => j.portal.provider === provider)
}

export function getJurisdictionsWithAPI(): JurisdictionProfile[] {
  return floridaJurisdictions.filter(j => j.portal.apiAvailable)
}

// Quick lookup for common areas
export const jurisdictionQuickLookup = {
  // Major Cities
  'Miami': 'miami-dade',
  'Fort Lauderdale': 'broward',
  'West Palm Beach': 'palm-beach',
  'Fort Myers': 'lee-county',
  'Naples': 'collier',
  'Tampa': 'tampa',
  'Orlando': 'orlando',
  'Jacksonville': 'jacksonville',
  'Cape Coral': 'cape-coral',
  'Sarasota': 'sarasota',
  
  // Counties by Major City
  'Miami-Dade': 'miami-dade',
  'Broward': 'broward',
  'Palm Beach': 'palm-beach',
  'Lee': 'lee-county',
  'Collier': 'collier',
  'Charlotte': 'charlotte',
  'Orange': 'orange-county',
  'Hillsborough': 'hillsborough',
  'Duval': 'duval'
}

// Export regions for UI
export const floridaRegions = [
  'South Florida',
  'Southwest Florida', 
  'Central Florida',
  'North Florida'
]