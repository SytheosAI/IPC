'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutGrid,
  FileText,
  Building2,
  FileArchive,
  Users,
  Building,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  FileCheck,
  Shield,
  Brain,
  LogOut
} from 'lucide-react'
import { clsx } from 'clsx'
import { useUser } from '../../contexts/UserContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

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
    name: 'Organization', 
    href: '/organization', 
    icon: Building,
    description: 'Company Settings'
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
  { 
    name: 'Sign Out', 
    href: '#', 
    icon: LogOut,
    description: 'Logout',
    action: 'logout'
  },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { profile, theme } = useUser()
  const supabase = createClientComponentClient()
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }
  
  // Add Security Center and Architecture Analysis for admin users
  // Check if user is admin based on title, role, or email
  const isAdmin = profile?.title?.toLowerCase() === 'admin' || 
                  profile?.title?.toLowerCase() === 'administrator' ||
                  (profile as any)?.role === 'admin' ||
                  profile?.email === 'mparish@meridianswfl.com'
  
  // Debug logging
  console.log('Profile:', profile)
  console.log('Is Admin:', isAdmin)
  
  // Always show Architecture for now to test
  const navItems = [
    ...navigation.slice(0, -2), // All items except settings and sign out
    { 
      name: 'Architecture', 
      href: '/architecture-analysis', 
      icon: Brain,
      description: 'System Analysis'
    },
    ...(isAdmin ? [{ 
      name: 'Security', 
      href: '/security', 
      icon: Shield,
      description: 'Security Center'
    }] : []),
    navigation[navigation.length - 2], // Settings
    navigation[navigation.length - 1] // Sign Out at the end
  ]

  return (
    <div
      className={clsx(
        'fixed left-0 top-0 h-full transition-all duration-300 z-40',
        'bg-gradient-to-b from-gray-900/95 via-gray-800/90 to-gray-900/95',
        'backdrop-filter backdrop-blur-xl border-r border-yellow-400/20',
        'shadow-2xl shadow-yellow-400/10',
        {
          'w-64': !isCollapsed,
          'w-16': isCollapsed,
        }
      )}
      style={{
        background: 'linear-gradient(135deg, rgba(15, 20, 25, 0.95) 0%, rgba(31, 41, 55, 0.90) 50%, rgba(15, 20, 25, 0.95) 100%)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(251, 191, 36, 0.2)',
        boxShadow: '0 0 50px rgba(251, 191, 36, 0.1), inset 0 1px 2px rgba(251, 191, 36, 0.05)'
      }}
    >
      {/* Header */}
      <div 
        className="h-16 flex items-center justify-between px-4 relative"
        style={{
          borderBottom: '1px solid rgba(251, 191, 36, 0.2)',
          background: 'rgba(251, 191, 36, 0.05)'
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.2)'
            }}
          >
            <Zap className="h-6 w-6 text-gray-900 drop-shadow-sm" />
            <div 
              className="absolute inset-0 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent, rgba(217, 119, 6, 0.2))',
                opacity: 0.6
              }}
            />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-yellow-400 tracking-wide drop-shadow-sm">IPC</h1>
              <p className="text-[10px] leading-tight text-yellow-300/80 font-medium">Inspection & Permit Control</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg transition-all duration-200 hover:bg-yellow-400/10 hover:shadow-lg group"
          style={{
            border: '1px solid rgba(251, 191, 36, 0.2)'
          }}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-6 flex-1 overflow-y-auto">
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href))
            
            // Handle Sign Out action
            if (item.action === 'logout') {
              return (
                <button
                  key={item.name}
                  onClick={handleLogout}
                  className={clsx(
                    'w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden',
                    'border border-transparent backdrop-blur-sm hover:shadow-lg'
                  )}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    backdropFilter: 'blur(8px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                    e.currentTarget.style.border = '1px solid rgba(239, 68, 68, 0.4)';
                    e.currentTarget.style.transform = 'translateX(6px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(239, 68, 68, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.border = '1px solid rgba(239, 68, 68, 0.2)';
                    e.currentTarget.style.transform = 'translateX(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="relative">
                    <item.icon className="h-6 w-6 flex-shrink-0 text-red-400 group-hover:text-red-300 transition-colors" />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-red-400 group-hover:text-red-300 transition-colors">
                        {item.name}
                      </p>
                      <p className="text-xs font-medium text-red-400/70 group-hover:text-red-300/70 transition-colors">
                        {item.description}
                      </p>
                    </div>
                  )}
                </button>
              )
            }
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden',
                  'border border-transparent backdrop-blur-sm',
                  {
                    'shadow-xl': isActive,
                    'hover:shadow-lg': !isActive,
                  }
                )}
                style={
                  isActive 
                    ? { 
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%)',
                        border: '1px solid rgba(251, 191, 36, 0.4)',
                        boxShadow: '0 8px 32px rgba(251, 191, 36, 0.3), inset 0 1px 2px rgba(251, 191, 36, 0.1)',
                        backdropFilter: 'blur(16px)'
                      }
                    : { 
                        background: 'rgba(31, 41, 55, 0.3)',
                        border: '1px solid rgba(251, 191, 36, 0.1)',
                        backdropFilter: 'blur(8px)'
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(251, 191, 36, 0.08)';
                    e.currentTarget.style.border = '1px solid rgba(251, 191, 36, 0.3)';
                    e.currentTarget.style.transform = 'translateX(6px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(251, 191, 36, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(31, 41, 55, 0.3)';
                    e.currentTarget.style.border = '1px solid rgba(251, 191, 36, 0.1)';
                    e.currentTarget.style.transform = 'translateX(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <div className="relative">
                  <item.icon 
                    className={clsx('h-6 w-6 flex-shrink-0 transition-all duration-300', {
                      'text-yellow-400 drop-shadow-lg': isActive,
                      'text-gray-400 group-hover:text-yellow-400': !isActive,
                    })} 
                  />
                  {isActive && (
                    <div 
                      className="absolute -inset-2 rounded-full animate-pulse"
                      style={{
                        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)',
                        filter: 'blur(4px)'
                      }}
                    />
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex-1">
                    <p className={clsx('text-sm font-semibold transition-colors duration-300', {
                      'text-yellow-300 drop-shadow-sm': isActive,
                      'text-gray-200 group-hover:text-yellow-300': !isActive,
                    })}>
                      {item.name}
                    </p>
                    <p className={clsx('text-xs font-medium transition-colors duration-300', {
                      'text-yellow-400/70': isActive,
                      'text-gray-400 group-hover:text-yellow-400/70': !isActive,
                    })}>
                      {item.description}
                    </p>
                  </div>
                )}
                {/* Glow effect for active item */}
                {isActive && !isCollapsed && (
                  <div 
                    className="absolute right-3 w-2 h-8 rounded-full"
                    style={{
                      background: 'linear-gradient(to bottom, transparent, #fbbf24, transparent)',
                      boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)'
                    }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div 
        className="p-4"
        style={{
          borderTop: '1px solid rgba(251, 191, 36, 0.2)',
          background: 'rgba(251, 191, 36, 0.05)'
        }}
      >
        {!isCollapsed && profile.name && (
          <div className="flex items-center gap-3 p-3 rounded-xl backdrop-blur-sm"
            style={{
              background: 'rgba(31, 41, 55, 0.4)',
              border: '1px solid rgba(251, 191, 36, 0.2)'
            }}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-gray-900 font-bold text-base shadow-lg relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
            >
              <span>
                {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent)',
                  opacity: 0.6
                }}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-300 drop-shadow-sm">{profile.name}</p>
              <p className="text-xs text-yellow-400/70 font-medium">{profile.title || 'User'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}