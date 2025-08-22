'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { db } from '@/lib/supabase-client'

interface UserProfile {
  name: string
  email: string
  phone: string
  title: string
  company: string
  address: string
  avatar?: string
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  permitUpdates: boolean
  inspectionReminders: boolean
  documentUploads: boolean
  newMembers: boolean
  systemAlerts: boolean
}

interface SecuritySettings {
  twoFactorAuth: boolean
  sessionTimeout: string
  passwordExpiry: string
}

interface ThemeSettings {
  theme: 'light' | 'dark' | 'auto'
  accentColor: string
}

interface UserContextType {
  profile: UserProfile
  notifications: NotificationSettings
  security: SecuritySettings
  theme: ThemeSettings
  updateProfile: (profile: UserProfile) => void
  updateNotifications: (notifications: NotificationSettings) => void
  updateSecurity: (security: SecuritySettings) => void
  updateTheme: (theme: ThemeSettings) => void
}

const defaultProfile: UserProfile = {
  name: '',
  email: '',
  phone: '',
  title: '',
  company: '',
  address: ''
}

const defaultNotifications: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  permitUpdates: true,
  inspectionReminders: true,
  documentUploads: true,
  newMembers: false,
  systemAlerts: true
}

const defaultSecurity: SecuritySettings = {
  twoFactorAuth: false,
  sessionTimeout: '30',
  passwordExpiry: '90'
}

const defaultTheme: ThemeSettings = {
  theme: 'light',
  accentColor: 'sky'
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications)
  const [security, setSecurity] = useState<SecuritySettings>(defaultSecurity)
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme)

  const applyThemeToDocument = (newTheme: ThemeSettings) => {
    // Apply theme to document
    if (newTheme.theme === 'dark' || (newTheme.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Apply accent color
    document.documentElement.style.setProperty('--accent-color', newTheme.accentColor)
    
    // Update CSS variables based on accent color
    const accentColors = {
      sky: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e'
      },
      blue: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a'
      },
      purple: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7c3aed',
        800: '#6b21a8',
        900: '#581c87'
      },
      green: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d'
      },
      red: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d'
      }
    }
    
    const colors = accentColors[newTheme.accentColor as keyof typeof accentColors] || accentColors.sky
    
    // Set CSS variables for accent colors
    Object.entries(colors).forEach(([shade, value]) => {
      document.documentElement.style.setProperty(`--accent-${shade}`, value)
    })
  }

  useEffect(() => {
    // Load settings from Supabase
    const loadSettings = async () => {
      try {
        const settings = await db.userSettings.get('default-user')
        if (settings) {
          if (settings.profile) setProfile(settings.profile)
          if (settings.notifications) setNotifications(settings.notifications)
          if (settings.security) setSecurity(settings.security)
          if (settings.theme) {
            setTheme(settings.theme)
            applyThemeToDocument(settings.theme)
          }
        }
      } catch (error) {
        console.error('Failed to load user settings:', error)
        // Use defaults if Supabase fails
        applyThemeToDocument(defaultTheme)
      }
    }
    loadSettings()
  }, [])

  const updateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile)
    try {
      await db.userSettings.upsert('default-user', {
        profile: newProfile,
        notifications,
        security,
        theme
      })
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }

  const updateNotifications = async (newNotifications: NotificationSettings) => {
    setNotifications(newNotifications)
    try {
      await db.userSettings.upsert('default-user', {
        profile,
        notifications: newNotifications,
        security,
        theme
      })
    } catch (error) {
      console.error('Failed to save notifications:', error)
    }
  }

  const updateSecurity = async (newSecurity: SecuritySettings) => {
    setSecurity(newSecurity)
    try {
      await db.userSettings.upsert('default-user', {
        profile,
        notifications,
        security: newSecurity,
        theme
      })
    } catch (error) {
      console.error('Failed to save security settings:', error)
    }
  }

  const updateTheme = async (newTheme: ThemeSettings) => {
    setTheme(newTheme)
    applyThemeToDocument(newTheme)
    try {
      await db.userSettings.upsert('default-user', {
        profile,
        notifications,
        security,
        theme: newTheme
      })
    } catch (error) {
      console.error('Failed to save theme:', error)
    }
  }

  return (
    <UserContext.Provider value={{
      profile,
      notifications,
      security,
      theme,
      updateProfile,
      updateNotifications,
      updateSecurity,
      updateTheme
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}