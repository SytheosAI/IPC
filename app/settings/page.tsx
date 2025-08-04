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
  Camera
} from 'lucide-react'

export default function SettingsPage() {
  const { profile, notifications, security, theme, updateProfile, updateNotifications, updateSecurity, updateTheme } = useUser()
  const [activeTab, setActiveTab] = useState('profile')
  const [localProfile, setLocalProfile] = useState(profile)
  const [localNotifications, setLocalNotifications] = useState(notifications)
  const [localSecurity, setLocalSecurity] = useState(security)
  const [localTheme, setLocalTheme] = useState(theme)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

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
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Home className="h-4 w-4" />
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">Settings</span>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 relative group ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-sky-50 to-sky-100 text-sky-600 border-l-4 border-sky-600'
                    : 'hover:bg-gray-50 text-gray-700 hover:pl-6'
                }`}
              >
                <tab.icon className={`h-5 w-5 transition-transform duration-200 ${
                  activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'
                }`} />
                <span className="font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute right-2 w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 relative overflow-hidden">
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
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
                <form onSubmit={handleSaveProfile}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                          value={localProfile.name}
                          onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                          value={localProfile.email}
                          onChange={(e) => setLocalProfile({ ...localProfile, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                          value={localProfile.phone}
                          onChange={(e) => setLocalProfile({ ...localProfile, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        value={localProfile.title}
                        onChange={(e) => setLocalProfile({ ...localProfile, title: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                          value={localProfile.company}
                          onChange={(e) => setLocalProfile({ ...localProfile, company: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        value={localProfile.address}
                        onChange={(e) => setLocalProfile({ ...localProfile, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
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
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Delivery Methods</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded text-sky-600 focus:ring-sky-500 mr-3"
                          checked={localNotifications.emailNotifications}
                          onChange={(e) => setLocalNotifications({ ...localNotifications, emailNotifications: e.target.checked })}
                        />
                        <span className="text-sm text-gray-700">Email notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded text-sky-600 focus:ring-sky-500 mr-3"
                          checked={localNotifications.smsNotifications}
                          onChange={(e) => setLocalNotifications({ ...localNotifications, smsNotifications: e.target.checked })}
                        />
                        <span className="text-sm text-gray-700">SMS notifications</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Activity Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded text-sky-600 focus:ring-sky-500 mr-3"
                          checked={localNotifications.permitUpdates}
                          onChange={(e) => setLocalNotifications({ ...localNotifications, permitUpdates: e.target.checked })}
                        />
                        <span className="text-sm text-gray-700">Permit status updates</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded text-sky-600 focus:ring-sky-500 mr-3"
                          checked={localNotifications.inspectionReminders}
                          onChange={(e) => setLocalNotifications({ ...localNotifications, inspectionReminders: e.target.checked })}
                        />
                        <span className="text-sm text-gray-700">Inspection reminders</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded text-sky-600 focus:ring-sky-500 mr-3"
                          checked={localNotifications.documentUploads}
                          onChange={(e) => setLocalNotifications({ ...localNotifications, documentUploads: e.target.checked })}
                        />
                        <span className="text-sm text-gray-700">New document uploads</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded text-sky-600 focus:ring-sky-500 mr-3"
                          checked={localNotifications.newMembers}
                          onChange={(e) => setLocalNotifications({ ...localNotifications, newMembers: e.target.checked })}
                        />
                        <span className="text-sm text-gray-700">New team members</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded text-sky-600 focus:ring-sky-500 mr-3"
                          checked={localNotifications.systemAlerts}
                          onChange={(e) => setLocalNotifications({ ...localNotifications, systemAlerts: e.target.checked })}
                        />
                        <span className="text-sm text-gray-700">System alerts and updates</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNotifications}
                      className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
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
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
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

            {/* System Tab */}
            {activeTab === 'system' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">System Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Version</span>
                      <p className="font-medium text-gray-900">1.0.0</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Environment</span>
                      <p className="font-medium text-gray-900">Production</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Updated</span>
                      <p className="font-medium text-gray-900">January 19, 2024</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Database Status</span>
                      <p className="font-medium text-green-600">Connected</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Data Management</h3>
                    <div className="space-y-3">
                      <button className="text-sky-600 hover:text-sky-700 text-sm font-medium">
                        Export All Data
                      </button>
                      <br />
                      <button className="text-sky-600 hover:text-sky-700 text-sm font-medium">
                        Backup Settings
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Storage Usage</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Documents</span>
                        <span className="font-medium text-gray-900">2.4 GB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Plans</span>
                        <span className="font-medium text-gray-900">1.8 GB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Database</span>
                        <span className="font-medium text-gray-900">156 MB</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-gray-900">Total Used</span>
                          <span className="text-gray-900">4.36 GB / 10 GB</span>
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                          <div className="bg-sky-500 h-2 rounded-full" style={{ width: '43.6%' }}></div>
                        </div>
                      </div>
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