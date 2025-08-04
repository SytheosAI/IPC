import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from './components/layout/Sidebar'
import { UserProvider } from './contexts/UserContext'
import { ThemeInitializer } from './components/ThemeInitializer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IPC - Inspections & Permit Control',
  description: 'Comprehensive permit submittal and tracking system with Virtual Building Authority',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <ThemeInitializer />
          <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar />
            <main className="flex-1 overflow-y-auto ml-16 lg:ml-64 transition-all duration-300">
              {children}
            </main>
          </div>
        </UserProvider>
      </body>
    </html>
  )
}