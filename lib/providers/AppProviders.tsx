'use client'

import { QueryProvider } from './QueryProvider'
import { Toaster } from 'react-hot-toast'
import { UserProvider } from '../../app/contexts/UserContext'
import { useKeyboardShortcuts } from '../utils/keyboard-shortcuts'
import { useEffect } from 'react'

function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const { initializeShortcuts, destroyShortcuts } = useKeyboardShortcuts()
  
  useEffect(() => {
    initializeShortcuts()
    
    return () => {
      destroyShortcuts()
    }
  }, [initializeShortcuts, destroyShortcuts])
  
  return <>{children}</>
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <UserProvider>
        <KeyboardShortcutsProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #374151',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </KeyboardShortcutsProvider>
      </UserProvider>
    </QueryProvider>
  )
}