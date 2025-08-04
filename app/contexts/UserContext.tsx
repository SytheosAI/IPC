'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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

  useEffect(() => {
    // Load settings from localStorage
    const savedProfile = localStorage.getItem('userProfile')
    const savedNotifications = localStorage.getItem('notificationSettings')
    const savedSecurity = localStorage.getItem('securitySettings')
    const savedTheme = localStorage.getItem('themeSettings')

    if (savedProfile) setProfile(JSON.parse(savedProfile))
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications))
    if (savedSecurity) setSecurity(JSON.parse(savedSecurity))
    if (savedTheme) setTheme(JSON.parse(savedTheme))
  }, [])

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile)
    localStorage.setItem('userProfile', JSON.stringify(newProfile))
  }

  const updateNotifications = (newNotifications: NotificationSettings) => {
    setNotifications(newNotifications)
    localStorage.setItem('notificationSettings', JSON.stringify(newNotifications))
  }

  const updateSecurity = (newSecurity: SecuritySettings) => {
    setSecurity(newSecurity)
    localStorage.setItem('securitySettings', JSON.stringify(newSecurity))
  }

  const updateTheme = (newTheme: ThemeSettings) => {
    setTheme(newTheme)
    localStorage.setItem('themeSettings', JSON.stringify(newTheme))
    
    // Apply theme to document
    if (newTheme.theme === 'dark' || (newTheme.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
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