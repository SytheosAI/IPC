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
  ChevronRight,
  Zap,
  FileCheck,
  Shield
} from 'lucide-react'
import { clsx } from 'clsx'
import { useUser } from '../../contexts/UserContext'

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
    name: 'Projects', 
    href: '/projects', 
    icon: FileArchive,
    description: 'Project Queue'
  },
  { 
    name: 'VBA', 
    href: '/vba', 
    icon: Building2,
    description: 'Virtual Building Authority'
  },
  { 
    name: 'Field Reports', 
    href: '/field-reports', 
    icon: FileCheck,
    description: 'Field Inspection Reports'
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
    name: 'Settings', 
    href: '/settings', 
    icon: Settings,
    description: 'App Settings'
  },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { profile, theme } = useUser()
  
  // Add Security Center for admin users
  // Check if user is admin based on title
  const isAdmin = profile?.title?.toLowerCase() === 'admin' || profile?.title?.toLowerCase() === 'administrator'
  const navItems = isAdmin ? [
    ...navigation.slice(0, -1), // All items except settings
    { 
      name: 'Security', 
      href: '/security', 
      icon: Shield,
      description: 'Security Center'
    },
    navigation[navigation.length - 1] // Settings at the end
  ] : navigation

  return (
    <div
      className={clsx(
        'fixed left-0 top-0 h-full bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40',
        {
          'w-64': !isCollapsed,
          'w-16': isCollapsed,
        }
      )}
    >
      {/* Header */}
      <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))' }}>
            <Zap className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">IPC</h1>
              <p className="text-[10px] leading-tight text-gray-500 dark:text-gray-400">Inspection & Permit Control</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-2 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden border-2',
                  {
                    'text-white shadow-lg border-transparent': isActive,
                    'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-[var(--accent-400)]': !isActive,
                  }
                )}
                style={isActive ? { background: 'linear-gradient(to right, var(--accent-500), var(--accent-600))' } : {}}
              >
                <item.icon className={clsx('h-5 w-5 flex-shrink-0', {
                  'text-white': isActive,
                  'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200': !isActive,
                })} />
                {!isCollapsed && (
                  <div className="flex-1">
                    <p className={clsx('text-sm font-medium', {
                      'text-white': isActive,
                      'text-gray-900 dark:text-gray-100': !isActive,
                    })}>
                      {item.name}
                    </p>
                    <p className={clsx('text-xs', {
                      'text-sky-100': isActive,
                      'text-gray-500 dark:text-gray-400': !isActive,
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
      {!isCollapsed && profile.name && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ background: `linear-gradient(to right, var(--accent-500), var(--accent-600))` }}
            >
              <span className="text-sm">
                {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{profile.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{profile.title || 'User'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}