'use client'

import { useState, useEffect } from 'react'
import { useUser } from '../contexts/UserContext'
import { 
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Key,
  Home,
  ChevronRight,
  Save,
  Mail,
  Smartphone,
  Building,
  CreditCard,
  Sparkles,
  CheckCircle,
  Camera,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Clock,
  MapPin,
  Zap,
  Cpu,
  HardDrive,
  Wifi,
  Monitor,
  Calendar,
  FileText,
  Link,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Activity,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Plus,
  Minus,
  Search,
  Filter
} from 'lucide-react'

export default function SettingsPage() {
  const { profile, notifications, security, theme, updateProfile, updateNotifications, updateSecurity, updateTheme } = useUser()
  const [activeTab, setActiveTab] = useState('profile')
  const [localProfile, setLocalProfile] = useState(profile)
  const [localNotifications, setLocalNotifications] = useState(notifications)
  const [localSecurity, setLocalSecurity] = useState(security)
  const [localTheme, setLocalTheme] = useState(theme)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Weather API', key: 'sk-***************************abc', created: '2024-01-15', lastUsed: '2024-01-19' },
    { id: '2', name: 'Maps Integration', key: 'pk-***************************xyz', created: '2024-01-10', lastUsed: '2024-01-18' }
  ])
  const [showApiKey, setShowApiKey] = useState<string | null>(null)
  const [backupHistory, setBackupHistory] = useState([
    { id: '1', date: '2024-01-19', size: '4.2 MB', status: 'completed', type: 'automatic' },
    { id: '2', date: '2024-01-18', size: '4.1 MB', status: 'completed', type: 'manual' },
    { id: '3', date: '2024-01-17', size: '4.0 MB', status: 'completed', type: 'automatic' }
  ])
  const [integrations, setIntegrations] = useState([
    { id: '1', name: 'Google Drive', status: 'connected', icon: '🟢', description: 'Sync documents and plans' },
    { id: '2', name: 'Slack', status: 'disconnected', icon: '🔴', description: 'Team notifications' },
    { id: '3', name: 'Microsoft Teams', status: 'connected', icon: '🟢', description: 'Video meetings and chat' },
    { id: '4', name: 'Dropbox', status: 'disconnected', icon: '🔴', description: 'File storage and sharing' }
  ])
  const [activityLogs, setActivityLogs] = useState([
    { id: '1', action: 'Profile Updated', timestamp: '2024-01-19 10:30 AM', ip: '192.168.1.1', device: 'Chrome on macOS' },
    { id: '2', action: 'Login', timestamp: '2024-01-19 09:15 AM', ip: '192.168.1.1', device: 'Chrome on macOS' },
    { id: '3', action: 'Password Changed', timestamp: '2024-01-18 03:45 PM', ip: '192.168.1.2', device: 'Safari on iOS' },
    { id: '4', action: 'Document Uploaded', timestamp: '2024-01-18 02:20 PM', ip: '192.168.1.1', device: 'Chrome on macOS' }
  ])

  useEffect(() => {
    setLocalProfile(profile)
    setLocalNotifications(notifications)
    setLocalSecurity(security)
    setLocalTheme(theme)
  }, [profile, notifications, security, theme])

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Link },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'backup', label: 'Backup & Export', icon: Download },
    { id: 'activity', label: 'Activity Log', icon: Activity },
    { id: 'system', label: 'System', icon: Database }
  ]

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveStatus('saving')
    updateProfile(localProfile)
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  const handleSaveNotifications = async () => {
    setSaveStatus('saving')
    updateNotifications(localNotifications)
    await new Promise(resolve => setTimeout(resolve, 500))
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  const handleSaveSecurity = async () => {
    setSaveStatus('saving')
    updateSecurity(localSecurity)
    await new Promise(resolve => setTimeout(resolve, 500))
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  const handleSaveTheme = async () => {
    setSaveStatus('saving')
    updateTheme(localTheme)
    await new Promise(resolve => setTimeout(resolve, 500))
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">Settings</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 relative group ${
                  activeTab === tab.id
                    ? 'text-white border-l-4'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:pl-6'
                }`}
                style={activeTab === tab.id ? { 
                  background: 'linear-gradient(to right, var(--accent-500), var(--accent-600))',
                  borderLeftColor: 'var(--accent-700)'
                } : {}}
              >
                <tab.icon className={`h-5 w-5 transition-transform duration-200 ${
                  activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'
                }`} />
                <span className="font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute right-2 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-200)' }} />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden">
            {/* Save Status */}
            {saveStatus !== 'idle' && (
              <div className={`absolute top-4 right-4 px-4 py-2 rounded-lg flex items-center gap-2 text-white font-medium z-10 shadow-lg transition-all duration-300 ${
                saveStatus === 'saving' ? 'bg-gradient-to-r from-sky-500 to-sky-600' : 'bg-gradient-to-r from-green-500 to-green-600'
              }`}>
                {saveStatus === 'saving' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Saved!
                  </>
                )}
              </div>
            )}
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Profile Information</h2>
                <form onSubmit={handleSaveProfile}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          className="input-modern pl-10 text-gray-900 dark:text-gray-100"
                          value={localProfile.name}
                          onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          className="input-modern pl-10 text-gray-900 dark:text-gray-100"
                          value={localProfile.email}
                          onChange={(e) => setLocalProfile({ ...localProfile, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          className="input-modern pl-10 text-gray-900 dark:text-gray-100"
                          value={localProfile.phone}
                          onChange={(e) => setLocalProfile({ ...localProfile, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
                      <input
                        type="text"
                        className="input-modern text-gray-900 dark:text-gray-100"
                        value={localProfile.title}
                        onChange={(e) => setLocalProfile({ ...localProfile, title: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          className="input-modern pl-10 text-gray-900 dark:text-gray-100"
                          value={localProfile.company}
                          onChange={(e) => setLocalProfile({ ...localProfile, company: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                      <input
                        type="text"
                        className="input-modern text-gray-900 dark:text-gray-100"
                        value={localProfile.address}
                        onChange={(e) => setLocalProfile({ ...localProfile, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Delivery Methods</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded focus:ring-2 mr-3"
                          style={{ accentColor: 'var(--accent-500)' }}
                          checked={localNotifications.emailNotifications}
                          onChange={(e) => setLocalNotifications({ ...localNotifications, emailNotifications: e.target.checked })}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Email notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded focus:ring-2 mr-3"
                          style={{ accentColor: 'var(--accent-500)' }}
                          checked={localNotifications.smsNotifications}
                          onChange={(e) => setLocalNotifications({ ...localNotifications, smsNotifications: e.target.checked })}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">SMS notifications</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Activity Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded focus:ring-2 mr-3"
                          style={{ accentColor: 'var(--accent-500)' }}
                          checked={localNotifications.permitUpdates}
                          onChange={(e) => setLocalNotifications({ ...localNotifications, permitUpdates: e.target.checked })}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Permit status updates</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded focus:ring-2 mr-3"
                          style={{ accentColor: 'var(--accent-500)' }}
                          checked={localNotifications.inspectionReminders}
                          onChange={(e) => setLocalNotifications({ ...localNotifications, inspectionReminders: e.target.checked })}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Inspection reminders</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded focus:ring-2 mr-3"
                          style={{ accentColor: 'var(--accent-500)' }}
                          checked={localNotifications.documentUploads}
                          onChange={(e) => setLocalNotifications({ ...localNotifications, documentUploads: e.target.checked })}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">New document uploads</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded focus:ring-2 mr-3"
                          style={{ accentColor: 'var(--accent-500)' }}
                          checked={localNotifications.newMembers}
                          onChange={(e) => setLocalNotifications({ ...localNotifications, newMembers: e.target.checked })}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">New team members</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded focus:ring-2 mr-3"
                          style={{ accentColor: 'var(--accent-500)' }}
                          checked={localNotifications.systemAlerts}
                          onChange={(e) => setLocalNotifications({ ...localNotifications, systemAlerts: e.target.checked })}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">System alerts and updates</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNotifications}
                      className="btn-primary"
                    >
                      <Save className="h-5 w-5 mr-2" />
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
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900">Two-Factor Authentication</span>
                        <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account</p>
                      </div>
                      <button
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          localSecurity.twoFactorAuth ? 'bg-sky-600' : 'bg-gray-200'
                        }`}
                        onClick={() => setLocalSecurity({ ...localSecurity, twoFactorAuth: !localSecurity.twoFactorAuth })}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            localSecurity.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      value={localSecurity.sessionTimeout}
                      onChange={(e) => setLocalSecurity({ ...localSecurity, sessionTimeout: e.target.value })}
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password Expiry (days)</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      value={localSecurity.passwordExpiry}
                      onChange={(e) => setLocalSecurity({ ...localSecurity, passwordExpiry: e.target.value })}
                    >
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                      <option value="180">180 days</option>
                      <option value="365">1 year</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Password Management</h3>
                    <div className="space-y-3">
                      <button className="text-sky-600 hover:text-sky-700 text-sm font-medium">
                        Change Password
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveSecurity}
                      className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      Save Security Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Appearance Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Theme</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {(['light', 'dark', 'auto'] as const).map((themeOption) => (
                        <label key={themeOption} className="cursor-pointer">
                          <input 
                            type="radio" 
                            name="theme" 
                            value={themeOption} 
                            checked={localTheme.theme === themeOption}
                            onChange={() => setLocalTheme({ ...localTheme, theme: themeOption })}
                            className="sr-only" 
                          />
                          <div className={`border-2 rounded-lg p-4 text-center hover:bg-gray-50 transition-all ${
                            localTheme.theme === themeOption ? 'border-sky-600 bg-sky-50' : 'border-gray-300'
                          }`}>
                            <div className={`w-full h-20 rounded mb-2 ${
                              themeOption === 'light' ? 'bg-gray-100' :
                              themeOption === 'dark' ? 'bg-gray-800' :
                              'bg-gradient-to-r from-gray-100 to-gray-800'
                            }`}></div>
                            <span className="text-sm font-medium capitalize">{themeOption}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Accent Color</h3>
                    <div className="flex gap-3">
                      {[
                        { name: 'sky', color: 'bg-sky-500', border: 'border-sky-600' },
                        { name: 'blue', color: 'bg-blue-500', border: 'border-blue-600' },
                        { name: 'purple', color: 'bg-purple-500', border: 'border-purple-600' },
                        { name: 'green', color: 'bg-green-500', border: 'border-green-600' },
                        { name: 'red', color: 'bg-red-500', border: 'border-red-600' }
                      ].map((accentOption) => (
                        <button
                          key={accentOption.name}
                          onClick={() => setLocalTheme({ ...localTheme, accentColor: accentOption.name })}
                          className={`w-10 h-10 ${accentOption.color} rounded-full border-2 transition-all ${
                            localTheme.accentColor === accentOption.name 
                              ? accentOption.border + ' scale-110' 
                              : 'border-transparent hover:border-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveTheme}
                      className="btn-primary"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      Save Theme Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Third-Party Integrations</h2>
                  <button className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Integration
                  </button>
                </div>
                
                <div className="space-y-4">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{integration.icon}</span>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{integration.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{integration.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            integration.status === 'connected' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {integration.status}
                          </span>
                          <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            integration.status === 'connected'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                          }`}>
                            {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Integration Benefits</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Connect your favorite tools to streamline workflows, sync data automatically, and enhance team collaboration.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">API Key Management</h2>
                  <button className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Generate New Key
                  </button>
                </div>

                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">{apiKey.name}</h3>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <Key className="h-4 w-4 text-gray-400" />
                              <code className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {showApiKey === apiKey.id ? 'sk-1234567890abcdef1234567890abcdef' : apiKey.key}
                              </code>
                              <button
                                onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                {showApiKey === apiKey.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>Created: {apiKey.created}</span>
                            <span>Last used: {apiKey.lastUsed}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Security Notice</h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Keep your API keys secure. Never share them publicly or commit them to version control. 
                        Rotate keys regularly for enhanced security.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Backup & Export Tab */}
            {activeTab === 'backup' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Backup & Data Export</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Quick Export
                    </h3>
                    <div className="space-y-3">
                      <button className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">All Data</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Projects, documents, settings</p>
                          </div>
                          <Download className="h-4 w-4 text-gray-400" />
                        </div>
                      </button>
                      <button className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Documents Only</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">PDF files and attachments</p>
                          </div>
                          <Download className="h-4 w-4 text-gray-400" />
                        </div>
                      </button>
                      <button className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Settings Backup</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">User preferences and configuration</p>
                          </div>
                          <Download className="h-4 w-4 text-gray-400" />
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <RefreshCw className="h-5 w-5" />
                      Automatic Backups
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Daily Backups</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Runs every day at 2:00 AM</p>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-sky-600">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Weekly Reports</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Email backup status weekly</p>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Retention Period</label>
                        <select className="input-modern text-gray-900 dark:text-gray-100">
                          <option value="7">7 days</option>
                          <option value="30" selected>30 days</option>
                          <option value="90">90 days</option>
                          <option value="365">1 year</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Backup History</h3>
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {backupHistory.map((backup) => (
                        <div key={backup.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              backup.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{backup.date}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {backup.size} • {backup.type} backup
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              backup.status === 'completed' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {backup.status}
                            </span>
                            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Log Tab */}
            {activeTab === 'activity' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Activity Log</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search activities..."
                        className="input-modern pl-10 w-64 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                    <button className="btn-secondary">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </button>
                    <button className="btn-secondary">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-sky-500 mt-2" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{log.action}</p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {log.timestamp}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {log.ip}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Monitor className="h-3 w-3" />
                                  {log.device}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>Showing 4 of 234 activities</span>
                      <button className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300">
                        Load more
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">System Information</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Application Info
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Version</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">1.2.3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Environment</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">Production</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">January 19, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Build</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">#2024.01.001</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Cpu className="h-5 w-5" />
                      System Health
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">API Status</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="font-medium text-green-600">Operational</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Database</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="font-medium text-green-600">Connected</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">File Storage</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="font-medium text-green-600">Available</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Uptime</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">99.8%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Storage Usage
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">Documents</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">2.4 GB</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '24%' }} />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">Plans & Drawings</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">1.8 GB</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '18%' }} />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">Database</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">256 MB</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '2.6%' }} />
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-900 dark:text-gray-100">Total Used</span>
                        <span className="text-gray-900 dark:text-gray-100">4.46 GB / 10 GB</span>
                      </div>
                      <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div className="bg-gradient-to-r from-sky-500 to-sky-600 h-3 rounded-full" style={{ width: '44.6%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">1.2s</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Avg Response Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">2,847</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Requests/Hour</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">0.01%</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Error Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">99.9%</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Availability</div>
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