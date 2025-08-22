'use client'

import { useState, useEffect } from 'react'
import { 
  Settings,
  User,
  Shield,
  Bell,
  Globe,
  Database,
  Download,
  Upload,
  ChevronDown,
  Save,
  X,
  Moon,
  Sun,
  Monitor,
  Key,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  FileText
} from 'lucide-react'
import { db } from '@/lib/supabase-client'
import { useUser } from '@/app/contexts/UserContext'

interface UserProfile {
  name: string
  email: string
  role: string
  department: string
  phone: string
  avatar?: string
}

interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  projectUpdates: boolean
  inspectionAlerts: boolean
  reportSubmissions: boolean
  documentUploads: boolean
}

interface SecuritySettings {
  twoFactorAuth: boolean
  sessionTimeout: number
  passwordExpiry: number
  loginAlerts: boolean
}

interface ThemeSettings {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  fontSize: 'small' | 'medium' | 'large'
}

export default function SettingsPage() {
  const userContext = useUser()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Profile state - initialize from context if available
  const [profile, setProfile] = useState<UserProfile>({
    name: userContext?.profile?.name || 'John Doe',
    email: userContext?.profile?.email || 'john.doe@example.com',
    role: userContext?.profile?.title || 'Senior Inspector',
    department: 'Building & Safety',
    phone: userContext?.profile?.phone || '(555) 123-4567'
  })

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    projectUpdates: true,
    inspectionAlerts: true,
    reportSubmissions: true,
    documentUploads: false
  })

  // Security settings
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAlerts: true
  })

  // Theme settings - use context value
  const [theme, setTheme] = useState<ThemeSettings>({
    mode: userContext?.theme?.theme || 'light',
    primaryColor: userContext?.theme?.accentColor || 'sky',
    fontSize: 'medium'
  })

  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Monitor },
    { id: 'data', label: 'Data Export', icon: Database },
  ]

  const handleProfileUpdate = () => {
    setLoading(true)
    // Update profile in context
    if (userContext?.updateProfile) {
      userContext.updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        title: profile.role,
        company: profile.department,
        address: ''
      })
    }
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      alert('Profile updated successfully!')
    }, 1000)
  }

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long!')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }, 1000)
  }

  const exportDatabaseData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch all data from Supabase
      const [projects, fieldReports, documents, vbaProjects, inspections] = await Promise.all([
        db.projects.getAll(),
        db.fieldReports.getAll(),
        db.documents.getAll(),
        db.vbaProjects.getAll(),
        db.inspections.getAll()
      ])
      
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '2.0',
        data: {
          projects,
          fieldReports,
          documents,
          vbaProjects,
          inspections
        }
      }
      
      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `IPC-database-export-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      
      alert('Database exported successfully!')
    } catch (err) {
      console.error('Error exporting data:', err)
      setError('Failed to export database. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (type: 'pdf' | 'csv') => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch recent activity
      const recentActivity = await db.activityLogs.getRecent(100)
      
      if (type === 'csv') {
        // Generate CSV
        const headers = ['Date', 'Action', 'Entity Type', 'Entity ID', 'User']
        const rows = recentActivity.map(log => [
          new Date(log.created_at).toLocaleString(),
          log.action,
          log.entity_type || '',
          log.entity_id || '',
          log.user_id || 'System'
        ])
        
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')
        
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `activity-report-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        URL.revokeObjectURL(url)
      } else {
        alert('PDF export coming soon!')
      }
    } catch (err) {
      console.error('Error generating report:', err)
      setError('Failed to generate report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border-l-4 border-sky-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Profile Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="h-10 w-10 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">
                        Upload Photo
                      </button>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">JPG, PNG or GIF. Max 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        value={profile.role}
                        onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        value={profile.department}
                        onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={handleProfileUpdate}
                      disabled={loading}
                      className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Notification Channels</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates via email</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.email}
                          onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                          className="h-5 w-5 text-sky-600 rounded focus:ring-sky-500"
                        />
                      </label>
                      <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bell className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Push Notifications</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Browser push notifications</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.push}
                          onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                          className="h-5 w-5 text-sky-600 rounded focus:ring-sky-500"
                        />
                      </label>
                      <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">SMS Notifications</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Text message alerts</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.sms}
                          onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                          className="h-5 w-5 text-sky-600 rounded focus:ring-sky-500"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Notification Types</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Project Updates</span>
                        <input
                          type="checkbox"
                          checked={notifications.projectUpdates}
                          onChange={(e) => setNotifications({ ...notifications, projectUpdates: e.target.checked })}
                          className="h-5 w-5 text-sky-600 rounded focus:ring-sky-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Inspection Alerts</span>
                        <input
                          type="checkbox"
                          checked={notifications.inspectionAlerts}
                          onChange={(e) => setNotifications({ ...notifications, inspectionAlerts: e.target.checked })}
                          className="h-5 w-5 text-sky-600 rounded focus:ring-sky-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Report Submissions</span>
                        <input
                          type="checkbox"
                          checked={notifications.reportSubmissions}
                          onChange={(e) => setNotifications({ ...notifications, reportSubmissions: e.target.checked })}
                          className="h-5 w-5 text-sky-600 rounded focus:ring-sky-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Document Uploads</span>
                        <input
                          type="checkbox"
                          checked={notifications.documentUploads}
                          onChange={(e) => setNotifications({ ...notifications, documentUploads: e.target.checked })}
                          className="h-5 w-5 text-sky-600 rounded focus:ring-sky-500"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <button 
                        onClick={handlePasswordChange}
                        disabled={loading}
                        className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Security Options</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={security.twoFactorAuth}
                          onChange={(e) => setSecurity({ ...security, twoFactorAuth: e.target.checked })}
                          className="h-5 w-5 text-sky-600 rounded focus:ring-sky-500"
                        />
                      </label>
                      <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bell className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Login Alerts</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Get notified of new sign-ins</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={security.loginAlerts}
                          onChange={(e) => setSecurity({ ...security, loginAlerts: e.target.checked })}
                          className="h-5 w-5 text-sky-600 rounded focus:ring-sky-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Appearance Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Theme</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => {
                          const newTheme = { ...theme, mode: 'light' as const }
                          setTheme(newTheme)
                          // Apply theme immediately via context
                          if (userContext?.updateTheme) {
                            userContext.updateTheme({ theme: 'light', accentColor: theme.primaryColor })
                          }
                        }}
                        className={`p-4 rounded-lg border-2 ${
                          theme.mode === 'light' 
                            ? 'border-sky-600 bg-sky-50 dark:bg-sky-900/20' 
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <Sun className="h-6 w-6 mx-auto mb-2 text-gray-700 dark:text-gray-300" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Light</span>
                      </button>
                      <button
                        onClick={() => {
                          const newTheme = { ...theme, mode: 'dark' as const }
                          setTheme(newTheme)
                          // Apply theme immediately via context
                          if (userContext?.updateTheme) {
                            userContext.updateTheme({ theme: 'dark', accentColor: theme.primaryColor })
                          }
                        }}
                        className={`p-4 rounded-lg border-2 ${
                          theme.mode === 'dark' 
                            ? 'border-sky-600 bg-sky-50 dark:bg-sky-900/20' 
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <Moon className="h-6 w-6 mx-auto mb-2 text-gray-700 dark:text-gray-300" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Dark</span>
                      </button>
                      <button
                        onClick={() => {
                          const newTheme = { ...theme, mode: 'system' as const }
                          setTheme(newTheme)
                          // Apply theme immediately via context
                          if (userContext?.updateTheme) {
                            userContext.updateTheme({ theme: 'auto', accentColor: theme.primaryColor })
                          }
                        }}
                        className={`p-4 rounded-lg border-2 ${
                          theme.mode === 'system' 
                            ? 'border-sky-600 bg-sky-50 dark:bg-sky-900/20' 
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <Monitor className="h-6 w-6 mx-auto mb-2 text-gray-700 dark:text-gray-300" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">System</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Font Size</h3>
                    <select
                      value={theme.fontSize}
                      onChange={(e) => setTheme({ ...theme, fontSize: e.target.value as ThemeSettings['fontSize'] })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <button className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Appearance
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Data Export Tab */}
            {activeTab === 'data' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Data Management</h2>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                      <span className="text-red-800">{error}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Database Export
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Export all your data from the database for backup or migration purposes.
                    </p>
                    <button 
                      onClick={exportDatabaseData}
                      disabled={loading}
                      className="w-full p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Export Database</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Download as JSON file</p>
                        </div>
                        {loading ? (
                          <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                        ) : (
                          <Download className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Activity Reports
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Generate reports of system activity and usage.
                    </p>
                    <div className="space-y-3">
                      <button 
                        onClick={() => generateReport('csv')}
                        disabled={loading}
                        className="w-full p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Activity Log CSV</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Recent activity export</p>
                          </div>
                          {loading ? (
                            <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                          ) : (
                            <Download className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">Data Privacy Notice</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Your exported data contains sensitive information. Please store it securely and follow your organization&apos;s data handling policies.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Import required icons from lucide-react
import type { LucideIcon } from 'lucide-react'

interface TabIcon {
  icon: LucideIcon
}

type FileText = LucideIcon