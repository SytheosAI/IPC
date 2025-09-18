'use client'

import React, { useState, useMemo, useCallback } from 'react'
import {
  Search, Filter, Download, Edit, Eye, Trash2, MoreHorizontal,
  CheckSquare, Square, ChevronDown, ChevronUp, ArrowUpDown,
  Calendar, User, FileText, AlertCircle, CheckCircle, Clock,
  Plus, Archive, Share, Copy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReportMetadata, ReportType } from '@/lib/types/reports'

// Status Badge Component
interface StatusBadgeProps {
  status: 'draft' | 'final'
  type: ReportType
  className?: string
}

export function ReportStatusBadge({ status, type, className }: StatusBadgeProps) {
  const getBadgeConfig = () => {
    const configs = {
      draft: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: Clock,
        label: 'Draft'
      },
      final: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle,
        label: 'Final'
      }
    }

    return configs[status]
  }

  const config = getBadgeConfig()
  const Icon = config.icon

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      config.bg,
      config.text,
      className
    )}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </span>
  )
}

// Report Type Badge Component
interface ReportTypeBadgeProps {
  type: ReportType
  className?: string
}

export function ReportTypeBadge({ type, className }: ReportTypeBadgeProps) {
  const getTypeConfig = () => {
    const configs = {
      inspection: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Inspection'
      },
      compliance: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        label: 'Compliance'
      },
      safety_incident: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Safety'
      },
      material_defect: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        label: 'Material'
      },
      engineering: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-800',
        label: 'Engineering'
      }
    }

    return configs[type]
  }

  const config = getTypeConfig()

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      config.bg,
      config.text,
      className
    )}>
      {config.label}
    </span>
  )
}

// Quick Actions Component
interface QuickActionsProps {
  reportId: string
  actions: ('view' | 'edit' | 'download' | 'share' | 'delete')[]
  onAction: (action: string, reportId: string) => void
}

export function QuickActions({ reportId, actions, onAction }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const actionConfigs = {
    view: { icon: Eye, label: 'View', color: 'text-gray-600 hover:text-gray-900' },
    edit: { icon: Edit, label: 'Edit', color: 'text-indigo-600 hover:text-indigo-900' },
    download: { icon: Download, label: 'Download', color: 'text-green-600 hover:text-green-900' },
    share: { icon: Share, label: 'Share', color: 'text-blue-600 hover:text-blue-900' },
    delete: { icon: Trash2, label: 'Delete', color: 'text-red-600 hover:text-red-900' }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <MoreHorizontal className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              {actions.map((action) => {
                const config = actionConfigs[action]
                const Icon = config.icon

                return (
                  <button
                    key={action}
                    onClick={() => {
                      onAction(action, reportId)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "flex items-center px-4 py-2 text-sm w-full text-left hover:bg-gray-50 transition-colors",
                      config.color
                    )}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {config.label}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Filter Types
interface ReportFilters {
  search: string
  type: ReportType | 'all'
  status: 'draft' | 'final' | 'all'
  inspector: string
  dateRange: {
    start: string
    end: string
  }
}

interface SortConfig {
  key: keyof ReportMetadata
  direction: 'asc' | 'desc'
}

// Main Reports Table Props
interface ReportsTableProps {
  reports: ReportMetadata[]
  filters: ReportFilters
  onFilter: (filters: ReportFilters) => void
  onSort: (sort: SortConfig) => void
  onBatchAction: (action: string, reportIds: string[]) => void
  onQuickAction: (action: string, reportId: string) => void
  isLoading?: boolean
  className?: string
}

export function ReportsTable({
  reports,
  filters,
  onFilter,
  onSort,
  onBatchAction,
  onQuickAction,
  isLoading = false,
  className
}: ReportsTableProps) {
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set())
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' })
  const [showFilters, setShowFilters] = useState(false)

  // Filtered and sorted reports
  const processedReports = useMemo(() => {
    let filtered = reports

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(report =>
        report.reportTitle.toLowerCase().includes(searchLower) ||
        report.id.toLowerCase().includes(searchLower)
      )
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(report => report.reportType === filters.type)
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(report => report.status === filters.status)
    }

    if (filters.inspector) {
      filtered = filtered.filter(report => report.generatedBy === filters.inspector)
    }

    if (filters.dateRange.start) {
      filtered = filtered.filter(report => report.reportDate >= filters.dateRange.start)
    }

    if (filters.dateRange.end) {
      filtered = filtered.filter(report => report.reportDate <= filters.dateRange.end)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === undefined || bValue === undefined) return 0
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [reports, filters, sortConfig])

  // Selection handlers
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedReports(new Set(processedReports.map(r => r.id)))
    } else {
      setSelectedReports(new Set())
    }
  }, [processedReports])

  const handleSelectReport = useCallback((reportId: string, checked: boolean) => {
    const newSelected = new Set(selectedReports)
    if (checked) {
      newSelected.add(reportId)
    } else {
      newSelected.delete(reportId)
    }
    setSelectedReports(newSelected)
  }, [selectedReports])

  // Sort handler
  const handleSort = useCallback((key: keyof ReportMetadata) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    const newSort: SortConfig = { key, direction }
    setSortConfig(newSort)
    onSort(newSort)
  }, [sortConfig, onSort])

  const isAllSelected = processedReports.length > 0 && selectedReports.size === processedReports.length
  const isPartiallySelected = selectedReports.size > 0 && selectedReports.size < processedReports.length

  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200", className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
            <p className="text-sm text-gray-600">
              {processedReports.length} of {reports.length} reports
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={filters.search}
                onChange={(e) => onFilter({ ...filters, search: e.target.value })}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center px-4 py-2 border rounded-lg transition-colors",
                showFilters
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </button>

            {/* Batch Actions */}
            {selectedReports.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedReports.size} selected
                </span>
                <button
                  onClick={() => onBatchAction('download', Array.from(selectedReports))}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
                <button
                  onClick={() => onBatchAction('delete', Array.from(selectedReports))}
                  className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Report Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => onFilter({ ...filters, type: e.target.value as ReportType | 'all' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Types</option>
                  <option value="inspection">Inspection</option>
                  <option value="compliance">Compliance</option>
                  <option value="safety_incident">Safety Incident</option>
                  <option value="material_defect">Material Defect</option>
                  <option value="engineering">Engineering</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => onFilter({ ...filters, status: e.target.value as 'draft' | 'final' | 'all' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="final">Final</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => onFilter({
                    ...filters,
                    dateRange: { ...filters.dateRange, start: e.target.value }
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => onFilter({
                    ...filters,
                    dateRange: { ...filters.dateRange, end: e.target.value }
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSelectAll(!isAllSelected)}
                    className="flex items-center"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="h-4 w-4 text-indigo-600" />
                    ) : isPartiallySelected ? (
                      <div className="h-4 w-4 bg-indigo-600 rounded border border-indigo-600 flex items-center justify-center">
                        <div className="h-2 w-2 bg-white"></div>
                      </div>
                    ) : (
                      <Square className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </th>

                {/* Sortable Headers */}
                {[
                  { key: 'reportTitle', label: 'Report Title' },
                  { key: 'reportType', label: 'Type' },
                  { key: 'status', label: 'Status' },
                  { key: 'reportDate', label: 'Date' },
                  { key: 'generatedBy', label: 'Inspector' }
                ].map(({ key, label }) => (
                  <th key={key} className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort(key as keyof ReportMetadata)}
                      className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      {label}
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </button>
                  </th>
                ))}

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {processedReports.map((report) => (
                <tr
                  key={report.id}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    selectedReports.has(report.id) && "bg-indigo-50"
                  )}
                >
                  {/* Selection Checkbox */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleSelectReport(report.id, !selectedReports.has(report.id))}
                    >
                      {selectedReports.has(report.id) ? (
                        <CheckSquare className="h-4 w-4 text-indigo-600" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </td>

                  {/* Report Title */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {report.reportTitle}
                        </div>
                        <div className="text-sm text-gray-500">
                          #{report.reportSequence}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Report Type */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ReportTypeBadge type={report.reportType} />
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ReportStatusBadge status={report.status} type={report.reportType} />
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(report.reportDate).toLocaleDateString()}
                  </td>

                  {/* Inspector */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{report.generatedBy}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <QuickActions
                      reportId={report.id}
                      actions={['view', 'edit', 'download', 'share', 'delete']}
                      onAction={onQuickAction}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {processedReports.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-sm text-gray-500">
                {filters.search || filters.type !== 'all' || filters.status !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by creating your first report.'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}