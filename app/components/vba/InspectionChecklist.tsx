'use client'

import { useState, useEffect } from 'react'
import { Check, X, AlertTriangle, Clock, Play, Pause, CheckCircle, Camera, Mic, MapPin } from 'lucide-react'

interface ChecklistItem {
  id: string
  category: string
  description: string
  status: 'pending' | 'pass' | 'fail' | 'na'
  notes?: string
  photoCount?: number
  voiceNoteCount?: number
  timestamp?: string
  location?: { lat: number; lng: number }
}

interface InspectionChecklistProps {
  inspectionType: string
  projectId: string
  onComplete?: (items: ChecklistItem[], timeSpent: number) => void
}

// Sample checklist templates
const checklistTemplates: Record<string, ChecklistItem[]> = {
  'Site Survey': [
    { id: '1', category: 'Property', description: 'Property boundaries verified against survey', status: 'pending' },
    { id: '2', category: 'Setbacks', description: 'Building setbacks meet zoning requirements', status: 'pending' },
    { id: '3', category: 'Utilities', description: 'Utility locations marked and documented', status: 'pending' },
    { id: '4', category: 'Grading', description: 'Site grading plan reviewed and approved', status: 'pending' },
    { id: '5', category: 'Access', description: 'Construction access routes established', status: 'pending' },
    { id: '6', category: 'Trees', description: 'Protected trees identified and marked', status: 'pending' },
    { id: '7', category: 'Elevation', description: 'Site elevations match approved plans', status: 'pending' },
  ],
  'Pre Construction': [
    { id: '1', category: 'Permits', description: 'All required permits obtained', status: 'pending' },
    { id: '2', category: 'Plans', description: 'Approved plans on site', status: 'pending' },
    { id: '3', category: 'Erosion Control', description: 'Erosion control measures installed', status: 'pending' },
    { id: '4', category: 'Site Access', description: 'Construction entrance established', status: 'pending' },
    { id: '5', category: 'Safety', description: 'Safety signage and barriers in place', status: 'pending' },
    { id: '6', category: 'Staging', description: 'Material staging areas designated', status: 'pending' },
  ],
  'Foundation': [
    { id: '1', category: 'Excavation', description: 'Excavation depth and dimensions verified', status: 'pending' },
    { id: '2', category: 'Footings', description: 'Footing size and reinforcement per plans', status: 'pending' },
    { id: '3', category: 'Rebar', description: 'Rebar placement and spacing correct', status: 'pending' },
    { id: '4', category: 'Forms', description: 'Forms properly braced and aligned', status: 'pending' },
    { id: '5', category: 'Waterproofing', description: 'Waterproofing/dampproofing applied', status: 'pending' },
    { id: '6', category: 'Drainage', description: 'Foundation drainage system installed', status: 'pending' },
    { id: '7', category: 'Backfill', description: 'Proper backfill material and compaction', status: 'pending' },
  ],
  'Framing': [
    { id: '1', category: 'Layout', description: 'Wall layout matches approved plans', status: 'pending' },
    { id: '2', category: 'Lumber', description: 'Proper lumber grade and size used', status: 'pending' },
    { id: '3', category: 'Spacing', description: 'Stud/joist spacing per code', status: 'pending' },
    { id: '4', category: 'Headers', description: 'Headers properly sized over openings', status: 'pending' },
    { id: '5', category: 'Bracing', description: 'Temporary and permanent bracing installed', status: 'pending' },
    { id: '6', category: 'Fasteners', description: 'Proper fasteners and fastening schedule', status: 'pending' },
    { id: '7', category: 'Fire Blocking', description: 'Fire blocking installed where required', status: 'pending' },
  ],
  'Electrical': [
    { id: '1', category: 'Panel', description: 'Main electrical panel properly labeled', status: 'pending' },
    { id: '2', category: 'Panel', description: 'Circuit breakers properly sized', status: 'pending' },
    { id: '3', category: 'Wiring', description: 'Wiring properly secured and protected', status: 'pending' },
    { id: '4', category: 'Grounding', description: 'Grounding system properly installed', status: 'pending' },
    { id: '5', category: 'GFCI', description: 'GFCI protection in required locations', status: 'pending' },
    { id: '6', category: 'Boxes', description: 'Junction boxes accessible and covered', status: 'pending' },
    { id: '7', category: 'Clearances', description: 'Proper clearances maintained', status: 'pending' },
  ],
  'Plumbing': [
    { id: '1', category: 'Supply', description: 'Water supply lines properly installed', status: 'pending' },
    { id: '2', category: 'Drainage', description: 'Drainage properly sloped', status: 'pending' },
    { id: '3', category: 'Venting', description: 'Vent pipes properly installed', status: 'pending' },
    { id: '4', category: 'Fixtures', description: 'Fixtures properly secured', status: 'pending' },
    { id: '5', category: 'Testing', description: 'Pressure test passed', status: 'pending' },
    { id: '6', category: 'Supports', description: 'Pipes properly supported', status: 'pending' },
    { id: '7', category: 'Protection', description: 'Pipes protected from damage', status: 'pending' },
  ],
  'Mechanical': [
    { id: '1', category: 'Equipment', description: 'HVAC equipment properly installed', status: 'pending' },
    { id: '2', category: 'Ductwork', description: 'Ductwork properly sized and sealed', status: 'pending' },
    { id: '3', category: 'Venting', description: 'Combustion air and venting adequate', status: 'pending' },
    { id: '4', category: 'Insulation', description: 'Duct insulation properly installed', status: 'pending' },
    { id: '5', category: 'Controls', description: 'Thermostats and controls operational', status: 'pending' },
    { id: '6', category: 'Clearances', description: 'Required clearances maintained', status: 'pending' },
  ],
  'Insulation': [
    { id: '1', category: 'Walls', description: 'Wall insulation properly installed', status: 'pending' },
    { id: '2', category: 'Ceiling', description: 'Ceiling/attic insulation adequate', status: 'pending' },
    { id: '3', category: 'Vapor Barrier', description: 'Vapor barriers properly installed', status: 'pending' },
    { id: '4', category: 'Air Sealing', description: 'Air sealing complete at penetrations', status: 'pending' },
    { id: '5', category: 'R-Values', description: 'R-values meet code requirements', status: 'pending' },
    { id: '6', category: 'Gaps', description: 'No gaps or compression in insulation', status: 'pending' },
  ],
  'Final': [
    { id: '1', category: 'Life Safety', description: 'Smoke/CO detectors installed and tested', status: 'pending' },
    { id: '2', category: 'Egress', description: 'Emergency egress requirements met', status: 'pending' },
    { id: '3', category: 'Accessibility', description: 'ADA requirements satisfied', status: 'pending' },
    { id: '4', category: 'Fixtures', description: 'All fixtures operational', status: 'pending' },
    { id: '5', category: 'Finishes', description: 'Finishes complete and undamaged', status: 'pending' },
    { id: '6', category: 'Documentation', description: 'All required documentation provided', status: 'pending' },
    { id: '7', category: 'Certificate', description: 'Ready for certificate of occupancy', status: 'pending' },
  ],
  'Permit Review': [
    { id: '1', category: 'Permits', description: 'Building permit obtained and posted', status: 'pending' },
    { id: '2', category: 'Plans', description: 'Approved plans match submitted plans', status: 'pending' },
    { id: '3', category: 'Fees', description: 'All permit fees paid', status: 'pending' },
    { id: '4', category: 'Conditions', description: 'Special conditions/requirements noted', status: 'pending' },
    { id: '5', category: 'Expiration', description: 'Permit expiration date verified', status: 'pending' },
  ],
  'Demolition': [
    { id: '1', category: 'Safety', description: 'Area secured and safety measures in place', status: 'pending' },
    { id: '2', category: 'Utilities', description: 'All utilities disconnected and capped', status: 'pending' },
    { id: '3', category: 'Asbestos', description: 'Asbestos abatement completed if required', status: 'pending' },
    { id: '4', category: 'Debris', description: 'Debris removal and disposal plan approved', status: 'pending' },
    { id: '5', category: 'Equipment', description: 'Proper equipment and methods used', status: 'pending' },
    { id: '6', category: 'Dust Control', description: 'Dust control measures implemented', status: 'pending' },
  ],
  'Silt Fence': [
    { id: '1', category: 'Location', description: 'Silt fence installed at correct locations', status: 'pending' },
    { id: '2', category: 'Height', description: 'Proper height above ground (min 6")', status: 'pending' },
    { id: '3', category: 'Trenching', description: 'Bottom buried in trench (min 6")', status: 'pending' },
    { id: '4', category: 'Stakes', description: 'Stakes on downslope side, proper spacing', status: 'pending' },
    { id: '5', category: 'Joints', description: 'Joints properly overlapped and secured', status: 'pending' },
  ],
  'UG Plumbing': [
    { id: '1', category: 'Layout', description: 'Underground layout matches plans', status: 'pending' },
    { id: '2', category: 'Slope', description: 'Proper slope maintained (1/4" per foot min)', status: 'pending' },
    { id: '3', category: 'Bedding', description: 'Proper bedding material used', status: 'pending' },
    { id: '4', category: 'Joints', description: 'All joints properly glued/sealed', status: 'pending' },
    { id: '5', category: 'Testing', description: 'Pressure test performed and passed', status: 'pending' },
    { id: '6', category: 'Backfill', description: 'Proper backfill before concrete pour', status: 'pending' },
  ],
  'UG Electrical': [
    { id: '1', category: 'Conduit', description: 'Proper conduit type and size used', status: 'pending' },
    { id: '2', category: 'Depth', description: 'Minimum burial depth maintained', status: 'pending' },
    { id: '3', category: 'Warning Tape', description: 'Warning tape installed above conduits', status: 'pending' },
    { id: '4', category: 'Grounding', description: 'Grounding electrode system installed', status: 'pending' },
    { id: '5', category: 'Stub-ups', description: 'Stub-ups properly located and protected', status: 'pending' },
  ],
  'UG Gas': [
    { id: '1', category: 'Materials', description: 'Approved pipe materials used', status: 'pending' },
    { id: '2', category: 'Depth', description: 'Minimum burial depth maintained', status: 'pending' },
    { id: '3', category: 'Tracer Wire', description: 'Tracer wire installed with plastic pipe', status: 'pending' },
    { id: '4', category: 'Testing', description: 'Pressure test witnessed and passed', status: 'pending' },
    { id: '5', category: 'Risers', description: 'Risers properly protected and sealed', status: 'pending' },
  ],
  'Compaction': [
    { id: '1', category: 'Testing', description: 'Compaction tests performed per specs', status: 'pending' },
    { id: '2', category: 'Density', description: 'Required density achieved (typically 95%)', status: 'pending' },
    { id: '3', category: 'Moisture', description: 'Proper moisture content maintained', status: 'pending' },
    { id: '4', category: 'Lifts', description: 'Proper lift thickness maintained', status: 'pending' },
    { id: '5', category: 'Reports', description: 'Test reports provided and approved', status: 'pending' },
  ],
  'Termite Pre-Treatment': [
    { id: '1', category: 'Chemical', description: 'Approved termiticide used', status: 'pending' },
    { id: '2', category: 'Application', description: 'Proper application rate and coverage', status: 'pending' },
    { id: '3', category: 'Barriers', description: 'Chemical barriers properly installed', status: 'pending' },
    { id: '4', category: 'Documentation', description: 'Treatment certificate provided', status: 'pending' },
    { id: '5', category: 'Protection', description: 'Treatment protected until concrete pour', status: 'pending' },
  ],
  'Footings': [
    { id: '1', category: 'Size', description: 'Footing size matches plans', status: 'pending' },
    { id: '2', category: 'Depth', description: 'Proper depth below grade/frost line', status: 'pending' },
    { id: '3', category: 'Rebar', description: 'Rebar size, spacing, and clearances correct', status: 'pending' },
    { id: '4', category: 'Forms', description: 'Forms secure and properly braced', status: 'pending' },
    { id: '5', category: 'Embedments', description: 'Anchor bolts/embedments positioned correctly', status: 'pending' },
  ],
  'Slab': [
    { id: '1', category: 'Base', description: 'Proper base material and thickness', status: 'pending' },
    { id: '2', category: 'Vapor Barrier', description: 'Vapor barrier properly installed', status: 'pending' },
    { id: '3', category: 'Reinforcement', description: 'Rebar/mesh properly placed and supported', status: 'pending' },
    { id: '4', category: 'Thickness', description: 'Slab thickness verified', status: 'pending' },
    { id: '5', category: 'Plumbing', description: 'Plumbing penetrations properly sealed', status: 'pending' },
  ],
  'Stem Wall': [
    { id: '1', category: 'Height', description: 'Stem wall height per plans', status: 'pending' },
    { id: '2', category: 'Rebar', description: 'Vertical and horizontal rebar correct', status: 'pending' },
    { id: '3', category: 'Anchor Bolts', description: 'Anchor bolts properly spaced and embedded', status: 'pending' },
    { id: '4', category: 'Waterproofing', description: 'Waterproofing applied where required', status: 'pending' },
    { id: '5', category: 'Alignment', description: 'Wall properly aligned and plumb', status: 'pending' },
  ],
  'Post-Tension': [
    { id: '1', category: 'Tendons', description: 'Tendon layout matches plans', status: 'pending' },
    { id: '2', category: 'Clearances', description: 'Proper clearances maintained', status: 'pending' },
    { id: '3', category: 'Anchors', description: 'Dead and live end anchors properly installed', status: 'pending' },
    { id: '4', category: 'Sheathing', description: 'Tendons properly sheathed', status: 'pending' },
    { id: '5', category: 'Elongation', description: 'Elongation calculations provided', status: 'pending' },
  ],
  'Mono Slab': [
    { id: '1', category: 'Thickness', description: 'Monolithic slab thickness verified', status: 'pending' },
    { id: '2', category: 'Turn-down', description: 'Turn-down depth meets requirements', status: 'pending' },
    { id: '3', category: 'Reinforcement', description: 'Continuous reinforcement installed', status: 'pending' },
    { id: '4', category: 'Grade Beam', description: 'Grade beam properly formed', status: 'pending' },
    { id: '5', category: 'Insulation', description: 'Perimeter insulation installed if required', status: 'pending' },
  ],
  'Column': [
    { id: '1', category: 'Location', description: 'Column locations match plans', status: 'pending' },
    { id: '2', category: 'Size', description: 'Column dimensions correct', status: 'pending' },
    { id: '3', category: 'Rebar', description: 'Vertical bars and ties properly installed', status: 'pending' },
    { id: '4', category: 'Splices', description: 'Rebar splices meet code requirements', status: 'pending' },
    { id: '5', category: 'Alignment', description: 'Columns plumb and properly aligned', status: 'pending' },
  ],
  'Tie Beam': [
    { id: '1', category: 'Dimensions', description: 'Tie beam size matches plans', status: 'pending' },
    { id: '2', category: 'Reinforcement', description: 'Rebar size and spacing correct', status: 'pending' },
    { id: '3', category: 'Connections', description: 'Proper connection to columns/walls', status: 'pending' },
    { id: '4', category: 'Elevation', description: 'Beam elevation and alignment correct', status: 'pending' },
    { id: '5', category: 'Stirrups', description: 'Stirrup spacing meets requirements', status: 'pending' },
  ],
  'Lintel': [
    { id: '1', category: 'Size', description: 'Lintel size adequate for span', status: 'pending' },
    { id: '2', category: 'Bearing', description: 'Minimum bearing on each end', status: 'pending' },
    { id: '3', category: 'Reinforcement', description: 'Proper reinforcement installed', status: 'pending' },
    { id: '4', category: 'Alignment', description: 'Level and properly aligned', status: 'pending' },
    { id: '5', category: 'Load Path', description: 'Load properly transferred to supports', status: 'pending' },
  ],
  'Elevated Slab': [
    { id: '1', category: 'Shoring', description: 'Shoring adequate and properly installed', status: 'pending' },
    { id: '2', category: 'Formwork', description: 'Forms secure and properly supported', status: 'pending' },
    { id: '3', category: 'Reinforcement', description: 'Rebar placement and clearances correct', status: 'pending' },
    { id: '4', category: 'Embedments', description: 'Sleeves and embedments positioned', status: 'pending' },
    { id: '5', category: 'Thickness', description: 'Slab thickness verified', status: 'pending' },
  ],
  'Truss/Framing': [
    { id: '1', category: 'Trusses', description: 'Trusses match engineered drawings', status: 'pending' },
    { id: '2', category: 'Spacing', description: 'Proper truss spacing maintained', status: 'pending' },
    { id: '3', category: 'Bracing', description: 'Temporary and permanent bracing installed', status: 'pending' },
    { id: '4', category: 'Connections', description: 'All connections per manufacturer specs', status: 'pending' },
    { id: '5', category: 'Bearing', description: 'Proper bearing at all support points', status: 'pending' },
  ],
  'Sheathing Nailing': [
    { id: '1', category: 'Pattern', description: 'Nailing pattern meets code/plans', status: 'pending' },
    { id: '2', category: 'Edge Spacing', description: 'Edge nailing spacing correct (typically 6")', status: 'pending' },
    { id: '3', category: 'Field Spacing', description: 'Field nailing spacing correct (typically 12")', status: 'pending' },
    { id: '4', category: 'Fasteners', description: 'Proper fastener type and size used', status: 'pending' },
    { id: '5', category: 'Gaps', description: 'Proper gaps between panels (1/8")', status: 'pending' },
  ],
  'Strapping/Hardware': [
    { id: '1', category: 'Hurricane Straps', description: 'Hurricane straps properly installed', status: 'pending' },
    { id: '2', category: 'Hold-downs', description: 'Hold-down anchors properly installed', status: 'pending' },
    { id: '3', category: 'Fasteners', description: 'Correct fasteners used for all hardware', status: 'pending' },
    { id: '4', category: 'Spacing', description: 'Hardware spacing per plans', status: 'pending' },
    { id: '5', category: 'Installation', description: 'All hardware properly secured', status: 'pending' },
  ],
  'Wind Mitigation': [
    { id: '1', category: 'Roof Deck', description: 'Roof deck attachment verified', status: 'pending' },
    { id: '2', category: 'Roof to Wall', description: 'Roof to wall connections adequate', status: 'pending' },
    { id: '3', category: 'Opening Protection', description: 'Opening protection meets requirements', status: 'pending' },
    { id: '4', category: 'Roof Geometry', description: 'Roof geometry documented', status: 'pending' },
    { id: '5', category: 'Secondary Water', description: 'Secondary water resistance verified', status: 'pending' },
  ],
  'Window Bucks': [
    { id: '1', category: 'Size', description: 'Buck dimensions match window schedule', status: 'pending' },
    { id: '2', category: 'Square', description: 'Bucks square and level', status: 'pending' },
    { id: '3', category: 'Attachment', description: 'Properly secured to structure', status: 'pending' },
    { id: '4', category: 'Sill Slope', description: 'Sill sloped to exterior', status: 'pending' },
    { id: '5', category: 'Clearances', description: 'Proper clearances for window installation', status: 'pending' },
  ],
  'Waterproofing': [
    { id: '1', category: 'Surface Prep', description: 'Surface properly prepared', status: 'pending' },
    { id: '2', category: 'Application', description: 'Waterproofing applied per specs', status: 'pending' },
    { id: '3', category: 'Coverage', description: 'Complete coverage, no holidays', status: 'pending' },
    { id: '4', category: 'Protection', description: 'Protection board installed where required', status: 'pending' },
    { id: '5', category: 'Terminations', description: 'Proper terminations and transitions', status: 'pending' },
  ],
  'Window Installation': [
    { id: '1', category: 'Level/Plumb', description: 'Windows level, plumb, and square', status: 'pending' },
    { id: '2', category: 'Fastening', description: 'Properly fastened per manufacturer', status: 'pending' },
    { id: '3', category: 'Flashing', description: 'Window flashing properly installed', status: 'pending' },
    { id: '4', category: 'Operation', description: 'Windows operate smoothly', status: 'pending' },
    { id: '5', category: 'Tempered Glass', description: 'Tempered glass where required', status: 'pending' },
  ],
  'Door Installation': [
    { id: '1', category: 'Alignment', description: 'Doors plumb and properly aligned', status: 'pending' },
    { id: '2', category: 'Operation', description: 'Doors open/close properly', status: 'pending' },
    { id: '3', category: 'Hardware', description: 'Hardware properly installed', status: 'pending' },
    { id: '4', category: 'Fire Rating', description: 'Fire-rated doors where required', status: 'pending' },
    { id: '5', category: 'Clearances', description: 'Proper clearances maintained', status: 'pending' },
  ],
  'Door/Window Flashing': [
    { id: '1', category: 'Sill Pan', description: 'Sill pan flashing installed', status: 'pending' },
    { id: '2', category: 'Head Flashing', description: 'Head flashing properly lapped', status: 'pending' },
    { id: '3', category: 'Jamb Flashing', description: 'Jamb flashing continuous', status: 'pending' },
    { id: '4', category: 'Integration', description: 'Integrated with WRB properly', status: 'pending' },
    { id: '5', category: 'Sealants', description: 'Compatible sealants used', status: 'pending' },
  ],
  'Roofing Dry-In': [
    { id: '1', category: 'Deck', description: 'Roof deck properly installed', status: 'pending' },
    { id: '2', category: 'Underlayment', description: 'Underlayment properly lapped', status: 'pending' },
    { id: '3', category: 'Ice Barrier', description: 'Ice/water barrier where required', status: 'pending' },
    { id: '4', category: 'Valleys', description: 'Valley protection installed', status: 'pending' },
    { id: '5', category: 'Penetrations', description: 'Roof penetrations properly flashed', status: 'pending' },
  ],
  'Roofing Nailing': [
    { id: '1', category: 'Pattern', description: 'Nailing pattern per manufacturer', status: 'pending' },
    { id: '2', category: 'Fasteners', description: 'Proper fastener type and length', status: 'pending' },
    { id: '3', category: 'Penetration', description: 'Fasteners properly driven', status: 'pending' },
    { id: '4', category: 'High Wind', description: 'High wind nailing if required', status: 'pending' },
    { id: '5', category: 'Spacing', description: 'Proper spacing maintained', status: 'pending' },
  ],
  'Roofing Final': [
    { id: '1', category: 'Materials', description: 'Approved materials used', status: 'pending' },
    { id: '2', category: 'Installation', description: 'Installed per manufacturer specs', status: 'pending' },
    { id: '3', category: 'Flashings', description: 'All flashings properly installed', status: 'pending' },
    { id: '4', category: 'Ridge Vents', description: 'Ridge vents properly installed', status: 'pending' },
    { id: '5', category: 'Gutters', description: 'Gutters installed and sloped', status: 'pending' },
  ],
  'Stucco Lath': [
    { id: '1', category: 'WRB', description: 'Weather resistant barrier installed', status: 'pending' },
    { id: '2', category: 'Lath', description: 'Lath properly attached and lapped', status: 'pending' },
    { id: '3', category: 'Accessories', description: 'Corner beads and trim installed', status: 'pending' },
    { id: '4', category: 'Control Joints', description: 'Control joints properly placed', status: 'pending' },
    { id: '5', category: 'Clearances', description: 'Proper clearance from grade', status: 'pending' },
  ],
  'Rough Electrical': [
    { id: '1', category: 'Wiring', description: 'Wiring properly installed and secured', status: 'pending' },
    { id: '2', category: 'Boxes', description: 'Boxes properly installed and secured', status: 'pending' },
    { id: '3', category: 'Protection', description: 'Wiring protected from damage', status: 'pending' },
    { id: '4', category: 'Bonding', description: 'Bonding jumpers installed', status: 'pending' },
    { id: '5', category: 'Panel', description: 'Panel rough-in complete', status: 'pending' },
  ],
  'Rough Plumbing': [
    { id: '1', category: 'Supply Lines', description: 'Supply lines properly installed', status: 'pending' },
    { id: '2', category: 'DWV', description: 'Drain, waste, vent properly installed', status: 'pending' },
    { id: '3', category: 'Testing', description: 'Water/air test performed', status: 'pending' },
    { id: '4', category: 'Protection', description: 'Pipes protected from damage', status: 'pending' },
    { id: '5', category: 'Supports', description: 'Proper pipe supports installed', status: 'pending' },
  ],
  'Rough Low Voltage/Security': [
    { id: '1', category: 'Wiring', description: 'Low voltage wiring properly installed', status: 'pending' },
    { id: '2', category: 'Separation', description: 'Proper separation from power wiring', status: 'pending' },
    { id: '3', category: 'Boxes', description: 'Boxes and brackets installed', status: 'pending' },
    { id: '4', category: 'Labeling', description: 'All cables properly labeled', status: 'pending' },
    { id: '5', category: 'Fire Rating', description: 'Fire-rated cables where required', status: 'pending' },
  ],
  'Rough HVAC': [
    { id: '1', category: 'Ductwork', description: 'Ductwork properly installed', status: 'pending' },
    { id: '2', category: 'Sealing', description: 'All joints properly sealed', status: 'pending' },
    { id: '3', category: 'Supports', description: 'Ducts properly supported', status: 'pending' },
    { id: '4', category: 'Insulation', description: 'Duct insulation installed', status: 'pending' },
    { id: '5', category: 'Equipment', description: 'Equipment pads/stands installed', status: 'pending' },
  ],
  'Water Meter(Utility)': [
    { id: '1', category: 'Location', description: 'Meter location approved by utility', status: 'pending' },
    { id: '2', category: 'Access', description: 'Proper access for reading', status: 'pending' },
    { id: '3', category: 'Protection', description: 'Meter properly protected', status: 'pending' },
    { id: '4', category: 'Shut-off', description: 'Shut-off valves accessible', status: 'pending' },
    { id: '5', category: 'Backflow', description: 'Backflow prevention if required', status: 'pending' },
  ],
  'Duct Pressure Test': [
    { id: '1', category: 'Sealing', description: 'All registers/grilles sealed', status: 'pending' },
    { id: '2', category: 'Pressure', description: 'Test pressure maintained', status: 'pending' },
    { id: '3', category: 'Leakage', description: 'Leakage within allowable limits', status: 'pending' },
    { id: '4', category: 'Documentation', description: 'Test results documented', status: 'pending' },
    { id: '5', category: 'Corrections', description: 'Leaks repaired if found', status: 'pending' },
  ],
  'Fireplace': [
    { id: '1', category: 'Clearances', description: 'Combustible clearances maintained', status: 'pending' },
    { id: '2', category: 'Hearth', description: 'Hearth extension adequate', status: 'pending' },
    { id: '3', category: 'Damper', description: 'Damper operates properly', status: 'pending' },
    { id: '4', category: 'Chimney', description: 'Chimney properly installed', status: 'pending' },
    { id: '5', category: 'Gas', description: 'Gas lines properly installed/tested', status: 'pending' },
  ],
  'Wall Insulation': [
    { id: '1', category: 'Installation', description: 'Insulation fills all cavities', status: 'pending' },
    { id: '2', category: 'R-Value', description: 'R-value meets requirements', status: 'pending' },
    { id: '3', category: 'Vapor Barrier', description: 'Vapor barrier on warm side', status: 'pending' },
    { id: '4', category: 'Air Sealing', description: 'All penetrations sealed', status: 'pending' },
    { id: '5', category: 'Fire Blocking', description: 'Fire blocking not compromised', status: 'pending' },
  ],
  'Attic Insulation': [
    { id: '1', category: 'R-Value', description: 'R-value meets requirements', status: 'pending' },
    { id: '2', category: 'Coverage', description: 'Complete coverage, no gaps', status: 'pending' },
    { id: '3', category: 'Ventilation', description: 'Ventilation not blocked', status: 'pending' },
    { id: '4', category: 'Access', description: 'Attic access insulated', status: 'pending' },
    { id: '5', category: 'Markers', description: 'Depth markers installed', status: 'pending' },
  ],
  'Sound Insulation(STC)': [
    { id: '1', category: 'Installation', description: 'Sound insulation properly installed', status: 'pending' },
    { id: '2', category: 'Coverage', description: 'Complete coverage in rated walls', status: 'pending' },
    { id: '3', category: 'Sealing', description: 'All penetrations properly sealed', status: 'pending' },
    { id: '4', category: 'Outlets', description: 'Outlets offset or properly sealed', status: 'pending' },
    { id: '5', category: 'Rating', description: 'Assembly meets STC rating', status: 'pending' },
  ],
  'Fire-Penetration': [
    { id: '1', category: 'Firestopping', description: 'All penetrations properly firestopped', status: 'pending' },
    { id: '2', category: 'Materials', description: 'Approved firestop materials used', status: 'pending' },
    { id: '3', category: 'Installation', description: 'Installed per listing/specs', status: 'pending' },
    { id: '4', category: 'Labeling', description: 'Firestop systems labeled', status: 'pending' },
    { id: '5', category: 'Integrity', description: 'Fire-rated assemblies maintained', status: 'pending' },
  ],
  'Drywall Screw Pattern': [
    { id: '1', category: 'Spacing', description: 'Screw spacing meets code', status: 'pending' },
    { id: '2', category: 'Edge Distance', description: 'Proper edge distance maintained', status: 'pending' },
    { id: '3', category: 'Penetration', description: 'Screws properly set', status: 'pending' },
    { id: '4', category: 'Pattern', description: 'Pattern appropriate for assembly', status: 'pending' },
    { id: '5', category: 'Type', description: 'Correct screw type and length', status: 'pending' },
  ],
  'Drywall': [
    { id: '1', category: 'Installation', description: 'Drywall properly installed', status: 'pending' },
    { id: '2', category: 'Fire Rating', description: 'Fire-rated board where required', status: 'pending' },
    { id: '3', category: 'Moisture', description: 'Moisture-resistant board in wet areas', status: 'pending' },
    { id: '4', category: 'Gaps', description: 'Proper gaps at floors/ceilings', status: 'pending' },
    { id: '5', category: 'Corner Beads', description: 'Corner beads properly installed', status: 'pending' },
  ],
  'Final Electrical': [
    { id: '1', category: 'Devices', description: 'All devices properly installed', status: 'pending' },
    { id: '2', category: 'GFCI/AFCI', description: 'GFCI/AFCI protection working', status: 'pending' },
    { id: '3', category: 'Panel', description: 'Panel properly labeled', status: 'pending' },
    { id: '4', category: 'Testing', description: 'All circuits tested and working', status: 'pending' },
    { id: '5', category: 'Cover Plates', description: 'All cover plates installed', status: 'pending' },
  ],
  'Final Plumbing': [
    { id: '1', category: 'Fixtures', description: 'All fixtures properly installed', status: 'pending' },
    { id: '2', category: 'Operation', description: 'All fixtures operate properly', status: 'pending' },
    { id: '3', category: 'Leaks', description: 'No leaks present', status: 'pending' },
    { id: '4', category: 'Water Heater', description: 'Water heater operational', status: 'pending' },
    { id: '5', category: 'Shut-offs', description: 'All shut-off valves accessible', status: 'pending' },
  ],
  'Final HVAC': [
    { id: '1', category: 'Equipment', description: 'All equipment operational', status: 'pending' },
    { id: '2', category: 'Airflow', description: 'Proper airflow at all registers', status: 'pending' },
    { id: '3', category: 'Controls', description: 'Thermostats functioning properly', status: 'pending' },
    { id: '4', category: 'Filters', description: 'Filters installed and accessible', status: 'pending' },
    { id: '5', category: 'Refrigerant', description: 'Refrigerant charge verified', status: 'pending' },
  ],
  'Final Low Voltage': [
    { id: '1', category: 'Terminations', description: 'All terminations complete', status: 'pending' },
    { id: '2', category: 'Testing', description: 'All circuits tested', status: 'pending' },
    { id: '3', category: 'Devices', description: 'All devices operational', status: 'pending' },
    { id: '4', category: 'Labeling', description: 'Proper labeling complete', status: 'pending' },
    { id: '5', category: 'Documentation', description: 'System documentation provided', status: 'pending' },
  ],
  'Back-Flow Preventer': [
    { id: '1', category: 'Installation', description: 'Properly installed per specs', status: 'pending' },
    { id: '2', category: 'Height', description: 'Proper height above grade', status: 'pending' },
    { id: '3', category: 'Access', description: 'Accessible for testing', status: 'pending' },
    { id: '4', category: 'Testing', description: 'Initial test performed', status: 'pending' },
    { id: '5', category: 'Certification', description: 'Test certificate provided', status: 'pending' },
  ],
  'Duct Blaster Test': [
    { id: '1', category: 'Setup', description: 'Test equipment properly set up', status: 'pending' },
    { id: '2', category: 'Baseline', description: 'Baseline pressure established', status: 'pending' },
    { id: '3', category: 'Results', description: 'Leakage within limits', status: 'pending' },
    { id: '4', category: 'Report', description: 'Test report complete', status: 'pending' },
    { id: '5', category: 'Sealing', description: 'Additional sealing if required', status: 'pending' },
  ],
  'Fire Sprinkler': [
    { id: '1', category: 'Heads', description: 'Sprinkler heads properly installed', status: 'pending' },
    { id: '2', category: 'Coverage', description: 'Proper coverage spacing', status: 'pending' },
    { id: '3', category: 'Piping', description: 'Piping properly supported', status: 'pending' },
    { id: '4', category: 'Testing', description: 'System pressure tested', status: 'pending' },
    { id: '5', category: 'FDC', description: 'Fire department connection accessible', status: 'pending' },
  ],
  'Fire Alarm': [
    { id: '1', category: 'Devices', description: 'All devices properly installed', status: 'pending' },
    { id: '2', category: 'Spacing', description: 'Device spacing per code', status: 'pending' },
    { id: '3', category: 'Wiring', description: 'Wiring properly installed', status: 'pending' },
    { id: '4', category: 'Testing', description: 'System tested and operational', status: 'pending' },
    { id: '5', category: 'Monitoring', description: 'Monitoring connection verified', status: 'pending' },
  ],
  'Grading/Drainage': [
    { id: '1', category: 'Slopes', description: 'Proper slopes away from building', status: 'pending' },
    { id: '2', category: 'Swales', description: 'Drainage swales properly graded', status: 'pending' },
    { id: '3', category: 'Downspouts', description: 'Downspouts directed away', status: 'pending' },
    { id: '4', category: 'Retention', description: 'Retention areas functional', status: 'pending' },
    { id: '5', category: 'Erosion', description: 'Erosion control in place', status: 'pending' },
  ],
  'Elevator': [
    { id: '1', category: 'Shaft', description: 'Shaft construction complete', status: 'pending' },
    { id: '2', category: 'Equipment', description: 'Equipment properly installed', status: 'pending' },
    { id: '3', category: 'Safety', description: 'Safety devices operational', status: 'pending' },
    { id: '4', category: 'Fire Rating', description: 'Fire-rated doors/walls', status: 'pending' },
    { id: '5', category: 'Testing', description: 'Initial testing complete', status: 'pending' },
  ],
  'Meter Equipment': [
    { id: '1', category: 'Installation', description: 'Meters properly installed', status: 'pending' },
    { id: '2', category: 'Grounding', description: 'Proper grounding installed', status: 'pending' },
    { id: '3', category: 'Access', description: 'Utility access maintained', status: 'pending' },
    { id: '4', category: 'Protection', description: 'Weather protection adequate', status: 'pending' },
    { id: '5', category: 'Labeling', description: 'Proper identification/labeling', status: 'pending' },
  ],
  'Transfer Switch': [
    { id: '1', category: 'Installation', description: 'Switch properly installed', status: 'pending' },
    { id: '2', category: 'Wiring', description: 'Wiring connections correct', status: 'pending' },
    { id: '3', category: 'Operation', description: 'Automatic operation verified', status: 'pending' },
    { id: '4', category: 'Grounding', description: 'Grounding system complete', status: 'pending' },
    { id: '5', category: 'Labeling', description: 'Warning labels installed', status: 'pending' },
  ],
  'Storm Shutters': [
    { id: '1', category: 'Installation', description: 'Shutters properly installed', status: 'pending' },
    { id: '2', category: 'Operation', description: 'Shutters operate smoothly', status: 'pending' },
    { id: '3', category: 'Attachment', description: 'Attachment points adequate', status: 'pending' },
    { id: '4', category: 'Rating', description: 'Product approval verified', status: 'pending' },
    { id: '5', category: 'Storage', description: 'Storage location identified', status: 'pending' },
  ],
  'Fence': [
    { id: '1', category: 'Location', description: 'Fence on property line', status: 'pending' },
    { id: '2', category: 'Height', description: 'Height meets code requirements', status: 'pending' },
    { id: '3', category: 'Posts', description: 'Posts properly set and spaced', status: 'pending' },
    { id: '4', category: 'Gates', description: 'Gates operate properly', status: 'pending' },
    { id: '5', category: 'Pool Code', description: 'Pool code requirements met', status: 'pending' },
  ],
  'Accessibility': [
    { id: '1', category: 'Routes', description: 'Accessible routes provided', status: 'pending' },
    { id: '2', category: 'Parking', description: 'Accessible parking compliant', status: 'pending' },
    { id: '3', category: 'Doors', description: 'Door widths and hardware compliant', status: 'pending' },
    { id: '4', category: 'Bathrooms', description: 'Accessible bathrooms compliant', status: 'pending' },
    { id: '5', category: 'Signage', description: 'Required signage installed', status: 'pending' },
  ],
  'Handrails': [
    { id: '1', category: 'Height', description: 'Handrail height 34"-38"', status: 'pending' },
    { id: '2', category: 'Graspability', description: 'Proper graspable profile', status: 'pending' },
    { id: '3', category: 'Extensions', description: 'Required extensions provided', status: 'pending' },
    { id: '4', category: 'Attachment', description: 'Securely attached', status: 'pending' },
    { id: '5', category: 'Continuity', description: 'Continuous along stairs/ramps', status: 'pending' },
  ],
  'Egress': [
    { id: '1', category: 'Width', description: 'Egress width adequate', status: 'pending' },
    { id: '2', category: 'Height', description: 'Minimum height clearance met', status: 'pending' },
    { id: '3', category: 'Lighting', description: 'Emergency lighting provided', status: 'pending' },
    { id: '4', category: 'Signage', description: 'Exit signs properly installed', status: 'pending' },
    { id: '5', category: 'Hardware', description: 'Panic hardware where required', status: 'pending' },
  ],
  'Landscaping/Egress': [
    { id: '1', category: 'Plants', description: 'Plants installed per plan', status: 'pending' },
    { id: '2', category: 'Irrigation', description: 'Irrigation system operational', status: 'pending' },
    { id: '3', category: 'Mulch', description: 'Mulch/ground cover installed', status: 'pending' },
    { id: '4', category: 'Trees', description: 'Trees properly staked', status: 'pending' },
    { id: '5', category: 'Egress', description: 'Egress paths maintained', status: 'pending' },
  ],
  'Final Building': [
    { id: '1', category: 'Life Safety', description: 'All life safety systems operational', status: 'pending' },
    { id: '2', category: 'Finishes', description: 'All finishes complete', status: 'pending' },
    { id: '3', category: 'Cleaning', description: 'Building cleaned and ready', status: 'pending' },
    { id: '4', category: 'Documentation', description: 'All closeout documents provided', status: 'pending' },
    { id: '5', category: 'Keys', description: 'Keys and access cards provided', status: 'pending' },
  ],
  'Pool Shell': [
    { id: '1', category: 'Excavation', description: 'Excavation per plans', status: 'pending' },
    { id: '2', category: 'Steel', description: 'Reinforcing steel installed', status: 'pending' },
    { id: '3', category: 'Plumbing', description: 'Shell plumbing installed', status: 'pending' },
    { id: '4', category: 'Electrical', description: 'Bonding wire installed', status: 'pending' },
    { id: '5', category: 'Forms', description: 'Forms properly braced', status: 'pending' },
  ],
  'Pool Plumbing Rough': [
    { id: '1', category: 'Piping', description: 'Piping properly sized', status: 'pending' },
    { id: '2', category: 'Pressure Test', description: 'Pressure test passed', status: 'pending' },
    { id: '3', category: 'Skimmers', description: 'Skimmers properly placed', status: 'pending' },
    { id: '4', category: 'Returns', description: 'Return lines properly located', status: 'pending' },
    { id: '5', category: 'Main Drains', description: 'Dual main drains installed', status: 'pending' },
  ],
  'Pool Bonding': [
    { id: '1', category: 'Grid', description: 'Bonding grid complete', status: 'pending' },
    { id: '2', category: 'Equipment', description: 'Equipment properly bonded', status: 'pending' },
    { id: '3', category: 'Water', description: 'Water bonding installed', status: 'pending' },
    { id: '4', category: 'Deck', description: 'Deck steel bonded', status: 'pending' },
    { id: '5', category: 'Testing', description: 'Continuity verified', status: 'pending' },
  ],
  'Pool Shell II (Pre-Gunite)': [
    { id: '1', category: 'Steel', description: 'Steel coverage verified', status: 'pending' },
    { id: '2', category: 'Clearances', description: 'Proper clearances maintained', status: 'pending' },
    { id: '3', category: 'Plumbing', description: 'Plumbing secured', status: 'pending' },
    { id: '4', category: 'Lights', description: 'Light niches installed', status: 'pending' },
    { id: '5', category: 'Ready', description: 'Ready for gunite/shotcrete', status: 'pending' },
  ],
  'Pool Deck': [
    { id: '1', category: 'Slope', description: 'Deck slopes away from pool', status: 'pending' },
    { id: '2', category: 'Reinforcement', description: 'Reinforcement installed', status: 'pending' },
    { id: '3', category: 'Expansion Joints', description: 'Expansion joints placed', status: 'pending' },
    { id: '4', category: 'Bonding', description: 'Deck bonding complete', status: 'pending' },
    { id: '5', category: 'Slip Resistance', description: 'Slip-resistant surface', status: 'pending' },
  ],
  'Pool Equipment': [
    { id: '1', category: 'Pump/Filter', description: 'Pump and filter operational', status: 'pending' },
    { id: '2', category: 'Heater', description: 'Heater installed and tested', status: 'pending' },
    { id: '3', category: 'Controls', description: 'Control systems operational', status: 'pending' },
    { id: '4', category: 'Safety', description: 'Safety equipment installed', status: 'pending' },
    { id: '5', category: 'Grounding', description: 'Equipment properly grounded', status: 'pending' },
  ],
  'Pool Gas': [
    { id: '1', category: 'Piping', description: 'Gas piping properly sized', status: 'pending' },
    { id: '2', category: 'Testing', description: 'Pressure test passed', status: 'pending' },
    { id: '3', category: 'Shut-off', description: 'Shut-off valve accessible', status: 'pending' },
    { id: '4', category: 'Venting', description: 'Heater venting adequate', status: 'pending' },
    { id: '5', category: 'Clearances', description: 'Clearances maintained', status: 'pending' },
  ],
  'Pool Final': [
    { id: '1', category: 'Water Quality', description: 'Water chemistry balanced', status: 'pending' },
    { id: '2', category: 'Safety', description: 'All safety features operational', status: 'pending' },
    { id: '3', category: 'Barriers', description: 'Required barriers installed', status: 'pending' },
    { id: '4', category: 'Alarms', description: 'Door/gate alarms functional', status: 'pending' },
    { id: '5', category: 'Certificate', description: 'Ready for certificate', status: 'pending' },
  ]
}

export default function InspectionChecklist({
  inspectionType,
  projectId,
  onComplete
}: InspectionChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'pending' | 'issues'>('all')

  useEffect(() => {
    // TODO: Load checklist from Supabase database instead of localStorage
    // const { data: savedChecklist } = await supabase
    //   .from('inspection_checklists')
    //   .select('items')
    //   .eq('project_id', projectId)
    //   .eq('inspection_type', inspectionType)
    //   .single()
    // if (savedChecklist?.items) {
    //   setItems(savedChecklist.items)
    // } else {
      // Load template - default to a generic checklist if type not found
      const template = checklistTemplates[inspectionType] || [
        { id: '1', category: 'General', description: 'Work performed according to approved plans', status: 'pending' },
        { id: '2', category: 'General', description: 'Materials meet specifications', status: 'pending' },
        { id: '3', category: 'General', description: 'Installation follows manufacturer guidelines', status: 'pending' },
        { id: '4', category: 'General', description: 'Safety requirements met', status: 'pending' },
        { id: '5', category: 'General', description: 'Work area clean and organized', status: 'pending' },
      ]
      setItems(template.map(item => ({ ...item, id: `${projectId}-${item.id}` })))
    }

    // TODO: Load timer state from Supabase database instead of localStorage
    // const { data: savedTimer } = await supabase
    //   .from('inspection_timers')
    //   .select('*')
    //   .eq('project_id', projectId)
    //   .eq('inspection_type', inspectionType)
    //   .single()
    // if (savedTimer) {
    //   setTimeElapsed(savedTimer.elapsed)
    //   if (savedTimer.is_running && savedTimer.start_time) {
    //     setStartTime(new Date(savedTimer.start_time))
    //     setIsTimerRunning(true)
    //   }
    // }
  }, [inspectionType, projectId])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isTimerRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
        setTimeElapsed(elapsed)
        
        // TODO: Save timer state to Supabase database instead of localStorage
        // await supabase
        //   .from('inspection_timers')
        //   .upsert({
        //     project_id: projectId,
        //     inspection_type: inspectionType,
        //     elapsed,
        //     is_running: true,
        //     start_time: startTime.toISOString()
        //   })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning, startTime, projectId, inspectionType])

  const updateItemStatus = (itemId: string, status: ChecklistItem['status']) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status,
          timestamp: new Date().toISOString()
        }
      }
      return item
    })
    
    setItems(updatedItems)
    // TODO: Save checklist items to Supabase database instead of localStorage
    // await supabase
    //   .from('inspection_checklists')
    //   .upsert({
    //     project_id: projectId,
    //     inspection_type: inspectionType,
    //     items: updatedItems
    //   })
  }

  const updateItemNotes = (itemId: string, notes: string) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return { ...item, notes }
      }
      return item
    })
    
    setItems(updatedItems)
    // TODO: Save checklist items to Supabase database instead of localStorage
    // await supabase
    //   .from('inspection_checklists')
    //   .upsert({
    //     project_id: projectId,
    //     inspection_type: inspectionType,
    //     items: updatedItems
    //   })
  }

  const toggleTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false)
      // TODO: Save timer state to Supabase database instead of localStorage
      // await supabase
      //   .from('inspection_timers')
      //   .upsert({
      //     project_id: projectId,
      //     inspection_type: inspectionType,
      //     elapsed: timeElapsed,
      //     is_running: false,
      //     start_time: null
      //   })
    } else {
      const now = new Date()
      setStartTime(now)
      setIsTimerRunning(true)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    const completed = items.filter(item => item.status !== 'pending').length
    return {
      completed,
      total: items.length,
      percentage: items.length > 0 ? (completed / items.length) * 100 : 0
    }
  }

  const getIssueCount = () => {
    return items.filter(item => item.status === 'fail').length
  }

  const filteredItems = items.filter(item => {
    if (filter === 'pending') return item.status === 'pending'
    if (filter === 'issues') return item.status === 'fail'
    return true
  })

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ChecklistItem[]>)

  const handleComplete = () => {
    if (onComplete) {
      onComplete(items, timeElapsed)
    }
  }

  const progress = getProgress()
  const issueCount = getIssueCount()

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{inspectionType} Inspection</h3>
          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <span className="font-mono text-lg">{formatTime(timeElapsed)}</span>
              <button
                onClick={toggleTimer}
                className={`p-2 rounded-lg ${
                  isTimerRunning 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
              >
                {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">{progress.completed} of {progress.total} completed</span>
            <span className="font-medium">{Math.round(progress.percentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-green-50 rounded-lg p-2">
            <p className="text-2xl font-bold text-green-600">
              {items.filter(i => i.status === 'pass').length}
            </p>
            <p className="text-xs text-green-700">Passed</p>
          </div>
          <div className="bg-red-50 rounded-lg p-2">
            <p className="text-2xl font-bold text-red-600">{issueCount}</p>
            <p className="text-xs text-red-700">Issues</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-2xl font-bold text-gray-600">
              {items.filter(i => i.status === 'na').length}
            </p>
            <p className="text-xs text-gray-700">N/A</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              filter === 'all' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              filter === 'pending' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Pending ({items.filter(i => i.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('issues')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              filter === 'issues' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Issues ({issueCount})
          </button>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="divide-y divide-gray-200 max-h-[60vh] overflow-y-auto">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
            <div className="space-y-2">
              {categoryItems.map(item => (
                <div key={item.id} className="border border-gray-200 rounded-lg">
                  <div className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{item.description}</p>
                        
                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateItemStatus(item.id, 'pass')}
                            className={`p-1.5 rounded ${
                              item.status === 'pass' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateItemStatus(item.id, 'fail')}
                            className={`p-1.5 rounded ${
                              item.status === 'fail' 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateItemStatus(item.id, 'na')}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              item.status === 'na' 
                                ? 'bg-gray-200 text-gray-700' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            N/A
                          </button>
                          
                          <div className="flex-1" />
                          
                          {/* Media buttons */}
                          <button className="p-1.5 text-gray-400 hover:text-gray-600">
                            <Camera className="h-4 w-4" />
                            {item.photoCount && (
                              <span className="text-xs text-blue-600 ml-0.5">{item.photoCount}</span>
                            )}
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-gray-600">
                            <Mic className="h-4 w-4" />
                            {item.voiceNoteCount && (
                              <span className="text-xs text-blue-600 ml-0.5">{item.voiceNoteCount}</span>
                            )}
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-gray-600">
                            <MapPin className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Status Indicator */}
                      <div className="flex-shrink-0">
                        {item.status === 'pass' && <CheckCircle className="h-6 w-6 text-green-600" />}
                        {item.status === 'fail' && <AlertTriangle className="h-6 w-6 text-red-600" />}
                        {item.status === 'na' && <div className="h-6 w-6 rounded-full bg-gray-300" />}
                        {item.status === 'pending' && <div className="h-6 w-6 rounded-full border-2 border-gray-300" />}
                      </div>
                    </div>

                    {/* Expandable Notes */}
                    <button
                      onClick={() => {
                        const newExpanded = new Set(expandedItems)
                        if (newExpanded.has(item.id)) {
                          newExpanded.delete(item.id)
                        } else {
                          newExpanded.add(item.id)
                        }
                        setExpandedItems(newExpanded)
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                    >
                      {expandedItems.has(item.id) ? 'Hide' : 'Add'} notes
                    </button>
                  </div>
                  
                  {expandedItems.has(item.id) && (
                    <div className="px-3 pb-3">
                      <textarea
                        value={item.notes || ''}
                        onChange={(e) => updateItemNotes(item.id, e.target.value)}
                        placeholder="Add notes..."
                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded resize-none focus:ring-1 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleComplete}
          disabled={progress.completed < progress.total}
          className={`w-full py-3 rounded-lg font-medium ${
            progress.completed === progress.total
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Complete Inspection
        </button>
      </div>
    </div>
  )
}