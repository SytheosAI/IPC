import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { UserProvider } from './contexts/UserContext'
import { ThemeInitializer } from './components/ThemeInitializer'
import ClientLayout from './components/layout/ClientLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IPC - Inspections & Permit Control',
  description: 'Comprehensive permit submittal and tracking system with Virtual Building Authority',
  manifest: '/manifest.json',
  themeColor: '#0ea5e9',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <UserProvider>
            <ThemeInitializer />
            <ClientLayout>
              {children}
            </ClientLayout>
          </UserProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}