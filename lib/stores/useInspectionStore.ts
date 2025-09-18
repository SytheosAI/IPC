import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface InspectionState {
  // Data
  inspections: VBAInspection[]
  selectedInspections: string[]
  filters: InspectionFilters
  sortBy: 'date' | 'status' | 'name' | 'compliance'
  sortOrder: 'asc' | 'desc'
  
  // Loading States
  isLoading: boolean
  isBulkOperating: boolean
  
  // Actions
  setInspections: (inspections: VBAInspection[]) => void
  addInspection: (inspection: VBAInspection) => void
  updateInspection: (id: string, updates: Partial<VBAInspection>) => void
  deleteInspection: (id: string) => void
  
  // Selection
  toggleSelection: (id: string) => void
  selectAll: () => void
  clearSelection: () => void
  getSelectedItems: () => VBAInspection[]
  
  // Bulk Operations
  bulkUpdateStatus: (status: string) => Promise<void>
  bulkDelete: () => Promise<void>
  bulkExport: (format: 'pdf' | 'excel') => Promise<void>
  
  // Filtering & Sorting
  setFilters: (filters: InspectionFilters) => void
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  getFilteredInspections: () => VBAInspection[]
  
  // Data Fetching
  fetchInspections: () => Promise<void>
  refreshInspection: (id: string) => Promise<void>
}

export interface VBAInspection {
  id: string
  project_id?: string
  project_name: string
  project_number?: string
  address: string
  city?: string
  state?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'passed'
  inspection_type?: string
  inspection_date?: string
  inspector_name?: string
  compliance_score?: number
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface InspectionFilters {
  status?: string[]
  dateRange?: { start: string; end: string }
  inspector?: string
  complianceMin?: number
  searchQuery?: string
}

export const useInspectionStore = create<InspectionState>()(
  devtools(
    (set, get) => ({
      // Initial State
      inspections: [],
      selectedInspections: [],
      filters: {},
      sortBy: 'date',
      sortOrder: 'desc',
      isLoading: false,
      isBulkOperating: false,
      
      // Basic Actions
      setInspections: (inspections) => set({ inspections }),
      
      addInspection: (inspection) => set(state => ({
        inspections: [inspection, ...state.inspections]
      })),
      
      updateInspection: (id, updates) => set(state => ({
        inspections: state.inspections.map(i => 
          i.id === id ? { ...i, ...updates } : i
        )
      })),
      
      deleteInspection: (id) => set(state => ({
        inspections: state.inspections.filter(i => i.id !== id),
        selectedInspections: state.selectedInspections.filter(sid => sid !== id)
      })),
      
      // Selection Management
      toggleSelection: (id) => set(state => ({
        selectedInspections: state.selectedInspections.includes(id)
          ? state.selectedInspections.filter(sid => sid !== id)
          : [...state.selectedInspections, id]
      })),
      
      selectAll: () => set(state => ({
        selectedInspections: state.inspections.map(i => i.id)
      })),
      
      clearSelection: () => set({ selectedInspections: [] }),
      
      getSelectedItems: () => {
        const { inspections, selectedInspections } = get()
        return inspections.filter(i => selectedInspections.includes(i.id))
      },
      
      // Bulk Operations with Supabase
      bulkUpdateStatus: async (status) => {
        const { selectedInspections } = get()
        if (selectedInspections.length === 0) return
        
        set({ isBulkOperating: true })
        
        try {
          const response = await fetch('/api/vba-projects/bulk-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ids: selectedInspections,
              updates: { status }
            })
          })
          
          if (response.ok) {
            set(state => ({
              inspections: state.inspections.map(i =>
                selectedInspections.includes(i.id) 
                  ? { ...i, status: status as any }
                  : i
              ),
              selectedInspections: [],
              isBulkOperating: false
            }))
          }
        } catch (error) {
          console.error('Bulk update failed:', error)
          set({ isBulkOperating: false })
        }
      },
      
      bulkDelete: async () => {
        const { selectedInspections } = get()
        if (selectedInspections.length === 0) return
        
        if (!confirm(`Delete ${selectedInspections.length} inspections?`)) return
        
        set({ isBulkOperating: true })
        
        try {
          const response = await fetch('/api/vba-projects/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: selectedInspections })
          })
          
          if (response.ok) {
            set(state => ({
              inspections: state.inspections.filter(
                i => !selectedInspections.includes(i.id)
              ),
              selectedInspections: [],
              isBulkOperating: false
            }))
          }
        } catch (error) {
          console.error('Bulk delete failed:', error)
          set({ isBulkOperating: false })
        }
      },
      
      bulkExport: async (format) => {
        const selectedItems = get().getSelectedItems()
        if (selectedItems.length === 0) return
        
        set({ isBulkOperating: true })
        
        try {
          if (format === 'excel') {
            const { exportToExcel } = await import('@/lib/utils/export')
            await exportToExcel(selectedItems, 'inspections')
          } else if (format === 'pdf') {
            const { exportToPDF } = await import('@/lib/utils/export')
            await exportToPDF(selectedItems, 'Inspection Report')
          }
          
          set({ isBulkOperating: false })
        } catch (error) {
          console.error('Export failed:', error)
          set({ isBulkOperating: false })
        }
      },
      
      // Filtering & Sorting
      setFilters: (filters) => set({ filters }),
      
      setSorting: (sortBy, sortOrder) => set({ 
        sortBy: sortBy as any, 
        sortOrder 
      }),
      
      getFilteredInspections: () => {
        const { inspections, filters, sortBy, sortOrder } = get()
        
        let filtered = [...inspections]
        
        // Apply filters
        if (filters.status?.length) {
          filtered = filtered.filter(i => 
            filters.status!.includes(i.status)
          )
        }
        
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase()
          filtered = filtered.filter(i =>
            i.project_name.toLowerCase().includes(query) ||
            i.address.toLowerCase().includes(query) ||
            i.project_number?.toLowerCase().includes(query)
          )
        }
        
        if (filters.complianceMin !== undefined) {
          filtered = filtered.filter(i =>
            (i.compliance_score || 0) >= filters.complianceMin!
          )
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
          let comparison = 0
          
          switch (sortBy) {
            case 'date':
              comparison = new Date(a.created_at || 0).getTime() - 
                          new Date(b.created_at || 0).getTime()
              break
            case 'name':
              comparison = a.project_name.localeCompare(b.project_name)
              break
            case 'status':
              comparison = a.status.localeCompare(b.status)
              break
            case 'compliance':
              comparison = (a.compliance_score || 0) - (b.compliance_score || 0)
              break
          }
          
          return sortOrder === 'asc' ? comparison : -comparison
        })
        
        return filtered
      },
      
      // Data Fetching from Supabase
      fetchInspections: async () => {
        set({ isLoading: true })
        
        try {
          const response = await fetch('/api/vba-projects')
          const { data } = await response.json()
          
          set({ 
            inspections: data || [], 
            isLoading: false 
          })
        } catch (error) {
          console.error('Failed to fetch inspections:', error)
          set({ isLoading: false })
        }
      },
      
      refreshInspection: async (id) => {
        try {
          const response = await fetch(`/api/vba-projects/${id}`)
          const { data } = await response.json()
          
          if (data) {
            get().updateInspection(id, data)
          }
        } catch (error) {
          console.error('Failed to refresh inspection:', error)
        }
      }
    }),
    {
      name: 'inspection-store'
    }
  )
)