'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  FileText, Shield, AlertTriangle, Package, Calculator,
  ChevronRight, Home, Plus, Settings, Search, Bell,
  ChevronDown, Check, Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReportType } from '@/lib/types/reports'

// Breadcrumb Component
interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex", className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            )}

            {item.current ? (
              <span className="text-sm font-medium text-gray-900">
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-gray-600">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Enhanced Breadcrumb with Auto-generation
interface SmartBreadcrumbProps {
  projectId?: string
  reportType?: ReportType
  reportId?: string
  customItems?: BreadcrumbItem[]
  className?: string
}

export function SmartBreadcrumb({
  projectId,
  reportType,
  reportId,
  customItems,
  className
}: SmartBreadcrumbProps) {
  const pathname = usePathname()

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/' }
    ]

    if (customItems) {
      return [...items, ...customItems]
    }

    // Auto-generate based on current path
    const segments = pathname.split('/').filter(Boolean)

    if (segments.includes('vba')) {
      items.push({ label: 'VBA', href: '/vba' })

      if (projectId) {
        items.push({ label: 'Projects', href: '/vba/projects' })
        items.push({ label: `Project ${projectId.slice(0, 8)}...`, href: `/vba/project/${projectId}` })

        if (reportType) {
          const reportTypeLabels = {
            inspection: 'Inspection Report',
            compliance: 'Compliance Report',
            safety_incident: 'Safety Report',
            material_defect: 'Material Defect Report',
            engineering: 'Engineering Report'
          }

          items.push({
            label: reportTypeLabels[reportType],
            href: reportId ? `/vba/project/${projectId}/reports/${reportType}/${reportId}` : undefined,
            current: !reportId
          })

          if (reportId) {
            items.push({
              label: `Report ${reportId.slice(0, 8)}...`,
              current: true
            })
          }
        }
      }
    }

    return items
  }

  return <Breadcrumb items={generateBreadcrumbs()} className={className} />
}

// Report Type Selector
interface ReportTypeSelectorProps {
  currentType?: ReportType
  onSelect: (type: ReportType) => void
  className?: string
}

export function ReportTypeSelector({
  currentType,
  onSelect,
  className
}: ReportTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const reportTypes = [
    {
      type: 'inspection' as ReportType,
      label: 'Inspection Report',
      description: 'Site inspection and observation reports',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      type: 'compliance' as ReportType,
      label: 'Compliance Report',
      description: 'Regulatory compliance assessments',
      icon: Shield,
      color: 'text-purple-600'
    },
    {
      type: 'safety_incident' as ReportType,
      label: 'Safety Incident Report',
      description: 'Safety incidents and near-miss reports',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      type: 'material_defect' as ReportType,
      label: 'Material Defect Report',
      description: 'Material and installation defect reports',
      icon: Package,
      color: 'text-orange-600'
    },
    {
      type: 'engineering' as ReportType,
      label: 'Engineering Report',
      description: 'Professional engineering analysis reports',
      icon: Calculator,
      color: 'text-indigo-600'
    }
  ]

  const currentTypeData = reportTypes.find(rt => rt.type === currentType)

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 text-left",
          "bg-white border border-gray-300 rounded-lg shadow-sm",
          "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
          "transition-colors duration-200"
        )}
      >
        <div className="flex items-center space-x-3">
          {currentTypeData ? (
            <>
              <currentTypeData.icon className={cn("h-5 w-5", currentTypeData.color)} />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {currentTypeData.label}
                </div>
                <div className="text-xs text-gray-500">
                  {currentTypeData.description}
                </div>
              </div>
            </>
          ) : (
            <span className="text-sm text-gray-500">Select report type...</span>
          )}
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-gray-400 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1">
              {reportTypes.map((reportType) => {
                const Icon = reportType.icon
                const isSelected = currentType === reportType.type

                return (
                  <button
                    key={reportType.type}
                    onClick={() => {
                      onSelect(reportType.type)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "flex items-center space-x-3 w-full px-4 py-3 text-left",
                      "hover:bg-gray-50 transition-colors duration-200",
                      isSelected && "bg-indigo-50"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", reportType.color)} />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {reportType.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {reportType.description}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-indigo-600" />
                    )}
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

// Quick Create Menu
interface QuickCreateMenuProps {
  projectId: string
  onSelect: (type: ReportType) => void
  className?: string
}

export function QuickCreateMenu({
  projectId,
  onSelect,
  className
}: QuickCreateMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const reportTypes = [
    {
      type: 'inspection' as ReportType,
      label: 'Inspection Report',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      type: 'compliance' as ReportType,
      label: 'Compliance Report',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100'
    },
    {
      type: 'safety_incident' as ReportType,
      label: 'Safety Report',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100'
    },
    {
      type: 'material_defect' as ReportType,
      label: 'Material Report',
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100'
    },
    {
      type: 'engineering' as ReportType,
      label: 'Engineering Report',
      icon: Calculator,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100'
    }
  ]

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center space-x-2 px-4 py-2",
          "bg-indigo-600 text-white rounded-lg shadow-sm",
          "hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
          "transition-colors duration-200"
        )}
      >
        <Plus className="h-4 w-4" />
        <span className="text-sm font-medium">New Report</span>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2 mb-1">
                Create New Report
              </div>
              {reportTypes.map((reportType) => {
                const Icon = reportType.icon

                return (
                  <button
                    key={reportType.type}
                    onClick={() => {
                      onSelect(reportType.type)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "flex items-center space-x-3 w-full px-3 py-2 text-left rounded-md",
                      "transition-colors duration-200",
                      reportType.bgColor
                    )}
                  >
                    <Icon className={cn("h-5 w-5", reportType.color)} />
                    <span className="text-sm font-medium text-gray-900">
                      {reportType.label}
                    </span>
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

// Report Navigation Tabs
interface ReportNavigationProps {
  currentReport?: ReportType
  projectId: string
  reportCounts?: Record<ReportType, number>
  className?: string
}

export function ReportNavigation({
  currentReport,
  projectId,
  reportCounts = {} as Record<ReportType, number>,
  className
}: ReportNavigationProps) {
  const reportTabs = [
    {
      type: 'inspection' as ReportType,
      label: 'Inspection',
      icon: FileText,
      href: `/vba/project/${projectId}/reports?type=inspection`
    },
    {
      type: 'compliance' as ReportType,
      label: 'Compliance',
      icon: Shield,
      href: `/vba/project/${projectId}/reports?type=compliance`
    },
    {
      type: 'safety_incident' as ReportType,
      label: 'Safety',
      icon: AlertTriangle,
      href: `/vba/project/${projectId}/reports?type=safety_incident`
    },
    {
      type: 'material_defect' as ReportType,
      label: 'Material',
      icon: Package,
      href: `/vba/project/${projectId}/reports?type=material_defect`
    },
    {
      type: 'engineering' as ReportType,
      label: 'Engineering',
      icon: Calculator,
      href: `/vba/project/${projectId}/reports?type=engineering`
    }
  ]

  return (
    <div className={cn("border-b border-gray-200", className)}>
      <nav className="-mb-px flex space-x-8" aria-label="Report types">
        {reportTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = currentReport === tab.type
          const count = reportCounts[tab.type] || 0

          return (
            <Link
              key={tab.type}
              href={tab.href}
              className={cn(
                "flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200",
                isActive
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 mr-2",
                isActive ? "text-indigo-500" : "text-gray-400"
              )} />
              {tab.label}
              {count > 0 && (
                <span className={cn(
                  "ml-2 py-0.5 px-2 rounded-full text-xs font-medium",
                  isActive
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-gray-100 text-gray-600"
                )}>
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

// Main Navigation Header
interface NavigationHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  showSearch?: boolean
  onSearch?: (query: string) => void
  className?: string
}

export function NavigationHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  showSearch = false,
  onSearch,
  className
}: NavigationHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  return (
    <div className={cn("bg-white border-b border-gray-200", className)}>
      <div className="px-6 py-4">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-4">
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}

        {/* Title and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            {showSearch && (
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </form>
            )}

            {/* Actions */}
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}