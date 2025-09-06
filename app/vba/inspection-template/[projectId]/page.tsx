'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Camera, Mic, Map, Brain, FileText, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface InspectionItem {
  id: string;
  category: string;
  description: string;
  status: 'pass' | 'fail' | 'na' | 'pending';
  notes: string;
  photos: string[];
}

interface InspectionTemplate {
  projectId: string;
  projectName: string;
  inspectionType: string;
  date: string;
  inspector: string;
  items: InspectionItem[];
  overallNotes: string;
  virtualInspectorEnabled: boolean;
}

const INSPECTION_CATEGORIES = {
  electrical: [
    { category: 'Service Entrance', description: 'Main electrical service and meter installation' },
    { category: 'Panel Installation', description: 'Main panel and sub-panels properly installed and grounded' },
    { category: 'GFCI Protection', description: 'GFCI outlets in required locations (kitchen, bathroom, outdoor)' },
    { category: 'AFCI Protection', description: 'Arc-fault circuit interrupters for bedroom circuits' },
    { category: 'Wiring Methods', description: 'Proper wire sizing and installation methods' },
    { category: 'Grounding System', description: 'Equipment grounding and bonding' },
    { category: 'Circuit Labeling', description: 'All circuits properly identified in panel' }
  ],
  plumbing: [
    { category: 'Water Supply', description: 'Main water line and shut-off valve' },
    { category: 'Drainage System', description: 'Proper slope and venting of drain lines' },
    { category: 'Fixture Installation', description: 'All fixtures properly installed and sealed' },
    { category: 'Water Heater', description: 'Proper installation with T&P valve and discharge' },
    { category: 'Backflow Prevention', description: 'Required backflow preventers installed' }
  ],
  structural: [
    { category: 'Foundation', description: 'Foundation walls, footings, and waterproofing' },
    { category: 'Framing', description: 'Wall, floor, and roof framing per plans' },
    { category: 'Sheathing', description: 'Proper nailing patterns and material' },
    { category: 'Load Paths', description: 'Continuous load path from roof to foundation' },
    { category: 'Hardware', description: 'Hurricane clips, hold-downs, and connectors' }
  ],
  hvac: [
    { category: 'Equipment Installation', description: 'Proper sizing and installation of units' },
    { category: 'Ductwork', description: 'Sealed joints and proper insulation' },
    { category: 'Ventilation', description: 'Fresh air intake and exhaust systems' },
    { category: 'Refrigerant Lines', description: 'Proper sizing and insulation' },
    { category: 'Condensate Drainage', description: 'Proper slope and discharge location' }
  ]
};

export default function InspectionTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  const [template, setTemplate] = useState<InspectionTemplate>({
    projectId,
    projectName: 'Sunset Tower - Mixed Use Development',
    inspectionType: 'electrical',
    date: new Date().toISOString().split('T')[0],
    inspector: '',
    items: [],
    overallNotes: '',
    virtualInspectorEnabled: true
  });
  
  const [customCategory, setCustomCategory] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  // Initialize with default items based on inspection type
  useState(() => {
    const defaultItems = INSPECTION_CATEGORIES[template.inspectionType as keyof typeof INSPECTION_CATEGORIES] || [];
    setTemplate(prev => ({
      ...prev,
      items: defaultItems.map((item, index) => ({
        id: `item-${index}`,
        ...item,
        status: 'pending',
        notes: '',
        photos: []
      }))
    }));
  });

  const handleAddCustomItem = () => {
    if (customCategory && customDescription) {
      const newItem: InspectionItem = {
        id: `item-${Date.now()}`,
        category: customCategory,
        description: customDescription,
        status: 'pending',
        notes: '',
        photos: []
      };
      
      setTemplate(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
      
      setCustomCategory('');
      setCustomDescription('');
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setTemplate(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const handleItemUpdate = (itemId: string, field: keyof InspectionItem, value: any) => {
    setTemplate(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSaveTemplate = () => {
    // In production, save to API
    console.log('Saving inspection template:', template);
    router.push(`/vba/project/${projectId}`);
  };

  const getStatusIcon = (status: InspectionItem['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-gray-600" />;
      case 'na': return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="glass-morphism border-b border-gray-600 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-200 hover:text-yellow-400"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-yellow-400">Inspection Report</h1>
              <p className="text-sm text-gray-300">{template.projectName}</p>
            </div>
            
            <button
              onClick={handleSaveTemplate}
              className="btn-primary"
            >
              <Save className="h-5 w-5" />
              <span>Save Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-4xl mx-auto">
        {/* Basic Information */}
        <div className="card-modern hover-lift p-6 mb-6">
          <h2 className="text-lg font-semibold text-yellow-400 mb-4">Inspection Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">
                Inspection Type
              </label>
              <select
                value={template.inspectionType}
                onChange={(e) => setTemplate(prev => ({ ...prev, inspectionType: e.target.value }))}
                className="input-modern"
              >
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="structural">Structural</option>
                <option value="hvac">HVAC</option>
                <option value="fire_safety">Fire Safety</option>
                <option value="final">Final</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">
                Inspection Date
              </label>
              <input
                type="date"
                value={template.date}
                onChange={(e) => setTemplate(prev => ({ ...prev, date: e.target.value }))}
                className="input-modern"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">
                Inspector Name
              </label>
              <input
                type="text"
                value={template.inspector}
                onChange={(e) => setTemplate(prev => ({ ...prev, inspector: e.target.value }))}
                placeholder="Enter inspector name"
                className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium placeholder-gray-400"
              />
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={template.virtualInspectorEnabled}
                  onChange={(e) => setTemplate(prev => ({ ...prev, virtualInspectorEnabled: e.target.checked }))}
                  className="w-4 h-4 text-yellow-400 border-2 border-gray-600 bg-gray-800 rounded focus:ring-yellow-500"
                />
                <span className="text-gray-200 font-medium flex items-center gap-2">
                  <Brain className="h-5 w-5 text-yellow-400" />
                  Enable Virtual Inspector AI Analysis
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Inspection Items */}
        <div className="card-modern hover-lift p-6 mb-6">
          <h2 className="text-lg font-semibold text-yellow-400 mb-4">Inspection Items</h2>
          
          <div className="space-y-4">
            {template.items.map((item) => (
              <div key={item.id} className="border-2 border-gray-600 rounded-lg p-4 bg-gray-800">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-400">{item.category}</h3>
                    <p className="text-sm text-gray-300">{item.description}</p>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-yellow-400 mb-1">
                      Status
                    </label>
                    <div className="flex gap-2">
                      {(['pass', 'fail', 'pending', 'na'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleItemUpdate(item.id, 'status', status)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg border-2 transition-colors ${
                            item.status === status
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {getStatusIcon(status)}
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {status === 'na' ? 'N/A' : status}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-end gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 rounded-lg hover:bg-gray-50 text-gray-900 font-medium">
                      <Camera className="h-5 w-5" />
                      <span>Add Photo</span>
                    </button>
                    
                    <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 rounded-lg hover:bg-gray-50 text-gray-900 font-medium">
                      <Mic className="h-5 w-5" />
                      <span>Voice Note</span>
                    </button>
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm font-medium text-yellow-400 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={item.notes}
                    onChange={(e) => handleItemUpdate(item.id, 'notes', e.target.value)}
                    placeholder="Add inspection notes..."
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Add Custom Item */}
          <div className="mt-6 p-4 border-2 border-dashed border-gray-400 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Add Custom Item</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Category name"
                className="px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium placeholder-gray-400"
              />
              <input
                type="text"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Description"
                className="px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium placeholder-gray-400"
              />
            </div>
            <button
              onClick={handleAddCustomItem}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Overall Notes */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-400">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Notes</h2>
          <textarea
            value={template.overallNotes}
            onChange={(e) => setTemplate(prev => ({ ...prev, overallNotes: e.target.value }))}
            placeholder="Add any overall inspection notes or comments..."
            className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium placeholder-gray-400"
            rows={4}
          />
        </div>
      </div>
    </main>
  );
}