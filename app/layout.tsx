import '@/lib/polyfills'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProviders } from '@/lib/providers/AppProviders'
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Polyfill for global self reference
              if (typeof self === 'undefined') {
                globalThis.self = globalThis;
              }
              
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(registration => console.log('SW registered'))
                    .catch(error => console.log('SW registration failed'));
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <AppProviders>
            <ThemeInitializer />
            <ClientLayout>
              {children}
            </ClientLayout>
          </AppProviders>
        </ErrorBoundary>
      </body>
    </html>
  )
}