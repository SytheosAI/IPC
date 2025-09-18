'use client'

import React, { useState, useEffect } from 'react'
import { ChevronRight, MoreVertical, Search, Filter, Plus, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReportMetadata, ReportType } from '@/lib/types/reports'
import { ReportStatusBadge, ReportTypeBadge } from '../reports/ReportsTable'

// Hook for responsive breakpoints
export function useResponsive() {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setScreenSize('mobile')
      } else if (window.innerWidth < 1024) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return {
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop',
    screenSize
  }
}

// Mobile Card Component for Reports
interface MobileReportCardProps {
  report: ReportMetadata
  isSelected: boolean
  onSelect: (selected: boolean) => void
  onAction: (action: string, reportId: string) => void
  actions: string[]
}

export function MobileReportCard({
  report,
  isSelected,
  onSelect,
  onAction,
  actions
}: MobileReportCardProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div className={cn(
      "bg-white border border-gray-200 rounded-lg p-4 transition-all duration-200",
      isSelected ? "ring-2 ring-indigo-500 bg-indigo-50" : "hover:shadow-md"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          {/* Selection Checkbox */}
          <button
            onClick={() => onSelect(!isSelected)}
            className="mt-1 flex-shrink-0"
          >
            <div className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
              isSelected
                ? "bg-indigo-600 border-indigo-600"
                : "border-gray-300 hover:border-indigo-400"
            )}>
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>
          </button>

          {/* Report Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {report.reportTitle}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              #{report.reportSequence} • {new Date(report.reportDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions Menu */}
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Badges */}
      <div className="flex items-center space-x-2 mb-3">
        <ReportTypeBadge type={report.reportType} />
        <ReportStatusBadge status={report.status} type={report.reportType} />
      </div>

      {/* Inspector */}
      <div className="text-xs text-gray-600">
        Inspector: {report.generatedBy}
      </div>

      {/* Actions Panel */}
      {showActions && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            {actions.map((action) => (
              <button
                key={action}
                onClick={() => {
                  onAction(action, report.id)
                  setShowActions(false)
                }}
                className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors capitalize"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Mobile Reports List
interface MobileReportsListProps {
  reports: ReportMetadata[]
  selectedReports: Set<string>
  onSelectReport: (reportId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onAction: (action: string, reportId: string) => void
  onBatchAction: (action: string, reportIds: string[]) => void
}

export function MobileReportsList({
  reports,
  selectedReports,
  onSelectReport,
  onSelectAll,
  onAction,
  onBatchAction
}: MobileReportsListProps) {
  const allSelected = reports.length > 0 && selectedReports.size === reports.length
  const someSelected = selectedReports.size > 0 && selectedReports.size < reports.length

  return (
    <div className="space-y-3">
      {/* Batch Selection Header */}
      {reports.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <button
            onClick={() => onSelectAll(!allSelected)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-700"
          >
            <div className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
              allSelected
                ? "bg-indigo-600 border-indigo-600"
                : someSelected
                ? "bg-indigo-100 border-indigo-400"
                : "border-gray-300"
            )}>
              {allSelected && <Check className="w-3 h-3 text-white" />}
              {someSelected && !allSelected && (
                <div className="w-2 h-2 bg-indigo-600 rounded"></div>
              )}
            </div>
            <span>
              {selectedReports.size > 0
                ? `${selectedReports.size} selected`
                : 'Select all'
              }
            </span>
          </button>

          {selectedReports.size > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => onBatchAction('download', Array.from(selectedReports))}
                className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md"
              >
                Download
              </button>
              <button
                onClick={() => onBatchAction('delete', Array.from(selectedReports))}
                className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* Report Cards */}
      {reports.map((report) => (
        <MobileReportCard
          key={report.id}
          report={report}
          isSelected={selectedReports.has(report.id)}
          onSelect={(selected) => onSelectReport(report.id, selected)}
          onAction={onAction}
          actions={['view', 'edit', 'download', 'share']}
        />
      ))}

      {reports.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-sm">No reports found</div>
        </div>
      )}
    </div>
  )
}

// Mobile Filter Panel
interface MobileFilterPanelProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    search: string
    type: ReportType | 'all'
    status: 'draft' | 'final' | 'all'
    inspector: string
    dateRange: { start: string; end: string }
  }
  onFilterChange: (filters: any) => void
}

export function MobileFilterPanel({
  isOpen,
  onClose,
  filters,
  onFilterChange
}: MobileFilterPanelProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="p-4 space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={filters.search}
                onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="inspection">Inspection</option>
              <option value="compliance">Compliance</option>
              <option value="safety_incident">Safety Incident</option>
              <option value="material_defect">Material Defect</option>
              <option value="engineering">Engineering</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="final">Final</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => onFilterChange({
                  ...filters,
                  dateRange: { ...filters.dateRange, start: e.target.value }
                })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => onFilterChange({
                  ...filters,
                  dateRange: { ...filters.dateRange, end: e.target.value }
                })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={() => {
                onFilterChange({
                  search: '',
                  type: 'all',
                  status: 'all',
                  inspector: '',
                  dateRange: { start: '', end: '' }
                })
              }}
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Floating Action Button
interface FloatingActionButtonProps {
  onClick: () => void
  icon?: React.ReactNode
  label?: string
  className?: string
}

export function FloatingActionButton({
  onClick,
  icon = <Plus className="w-6 h-6" />,
  label = "Create",
  className
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-40",
        "flex items-center justify-center",
        "bg-indigo-600 text-white rounded-full shadow-lg",
        "hover:bg-indigo-700 hover:shadow-xl",
        "transform transition-all duration-200 hover:scale-105",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
        "lg:hidden", // Only show on mobile/tablet
        className
      )}
      style={{
        width: label ? 'auto' : '56px',
        height: '56px',
        padding: label ? '0 20px 0 16px' : '0'
      }}
    >
      {icon}
      {label && (
        <span className="ml-2 text-sm font-medium whitespace-nowrap">
          {label}
        </span>
      )}
    </button>
  )
}

// Mobile Form Layout
interface MobileFormLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  onBack?: () => void
  actions?: React.ReactNode
}

export function MobileFormLayout({
  children,
  title,
  subtitle,
  onBack,
  actions
}: MobileFormLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 lg:bg-white">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-500 rotate-180" />
              </button>
            )}
            <div>
              <h1 className="text-lg font-medium text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 lg:px-0 lg:py-0">
        {children}
      </div>
    </div>
  )
}

// Responsive Grid
interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveGrid({ children, className }: ResponsiveGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 gap-4",
      "sm:grid-cols-2 sm:gap-5",
      "lg:grid-cols-3 lg:gap-6",
      "xl:grid-cols-4",
      className
    )}>
      {children}
    </div>
  )
}

// Mobile-first Card Component
interface MobileCardProps {
  children: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
  onClick?: () => void
  className?: string
}

export function MobileCard({
  children,
  title,
  description,
  action,
  onClick,
  className
}: MobileCardProps) {
  const isClickable = !!onClick

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 shadow-sm",
        "transition-all duration-200",
        isClickable && "cursor-pointer hover:shadow-md hover:border-gray-300",
        className
      )}
      onClick={onClick}
    >
      {(title || description || action) && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h3 className="text-sm font-medium text-gray-900">{title}</h3>
              )}
              {description && (
                <p className="text-xs text-gray-600 mt-1">{description}</p>
              )}
            </div>
            {action && (
              <div className="ml-3 flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}