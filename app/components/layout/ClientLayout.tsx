'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    }
    checkMobile()
  }, [])

  // Check if on login page
  const isLoginPage = pathname === '/login'

  // If on login page, render without any navigation
  if (isLoginPage) {
    return <>{children}</>
  }

  // Mobile paths that don't need sidebar
  const mobilePaths = ['/mobile', '/vba', '/settings']
  const isMobilePath = mobilePaths.some(path => pathname.startsWith(path))

  // If mobile device and on mobile-allowed path, show mobile layout
  if (isMobile && isMobilePath) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {pathname !== '/mobile' && <MobileNav />}
        <main className={pathname !== '/mobile' ? 'pt-16' : ''}>
          {children}
        </main>
      </div>
    )
  }

  // Desktop layout with sidebar
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto ml-16 lg:ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  )
}