'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutGrid,
  FileText,
  Building2,
  FileArchive,
  Users,
  FolderOpen,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { clsx } from 'clsx'

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: LayoutGrid,
    description: 'Overview'
  },
  { 
    name: 'Submittals', 
    href: '/submittals', 
    icon: FileText,
    description: 'Permit Applications'
  },
  { 
    name: 'Plans', 
    href: '/plans', 
    icon: FileArchive,
    description: 'Project Plans'
  },
  { 
    name: 'Documents', 
    href: '/documents', 
    icon: FolderOpen,
    description: 'Document Library'
  },
  { 
    name: 'Members', 
    href: '/members', 
    icon: Users,
    description: 'Team Contacts'
  },
  { 
    name: 'VBA', 
    href: '/vba', 
    icon: Building2,
    description: 'Virtual Building Authority'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings,
    description: 'App Settings'
  },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={clsx(
        'fixed left-0 top-0 h-full bg-gray-50 border-r border-gray-200 transition-all duration-300 z-40',
        {
          'w-64': !isCollapsed,
          'w-16': isCollapsed,
        }
      )}
    >
      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-semibold text-gray-900">IPC</h1>
              <p className="text-xs text-gray-500">Permit Control</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded hover:bg-gray-200 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-2 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden',
                  {
                    'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg': isActive,
                    'hover:bg-gray-200 text-gray-700 hover:border-2 hover:border-sky-400': !isActive,
                  }
                )}
              >
                <item.icon className={clsx('h-5 w-5 flex-shrink-0', {
                  'text-white': isActive,
                  'text-gray-500 group-hover:text-gray-700': !isActive,
                })} />
                {!isCollapsed && (
                  <div className="flex-1">
                    <p className={clsx('text-sm font-medium', {
                      'text-white': isActive,
                      'text-gray-900': !isActive,
                    })}>
                      {item.name}
                    </p>
                    <p className={clsx('text-xs', {
                      'text-sky-100': isActive,
                      'text-gray-500': !isActive,
                    })}>
                      {item.description}
                    </p>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-700">JD</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}