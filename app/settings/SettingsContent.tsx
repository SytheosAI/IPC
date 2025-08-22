'use client'

import { useState } from 'react'
import {
  Sun, Moon, Monitor, Palette, Type, Grid, Layout,
  Bell, Mail, Smartphone, Volume2, MessageSquare,
  Shield, Key, Lock, Eye, EyeOff, AlertCircle,
  User, Building, Users, CreditCard, Download,
  Save, Check, X, ChevronRight, Sparkles,
  Zap, Activity, Globe, Link, Code, Database,
  HelpCircle, Terminal, FileText, Info
} from 'lucide-react'

interface SettingsContentProps {
  userContext: any
}

export function SettingsContent({ userContext }: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Theme state
  const [theme, setTheme] = useState({
    mode: userContext?.theme?.theme || 'light',
    primaryColor: userContext?.theme?.accentColor || 'sky',
    fontSize: 'medium',
    borderRadius: 'medium',
    compactMode: false,
    animations: true,
    highContrast: false
  })

  // Color options with gradient previews
  const colorOptions = [
    { value: 'sky', label: 'Sky Blue', gradient: 'from-sky-400 to-sky-600' },
    { value: 'blue', label: 'Ocean Blue', gradient: 'from-blue-400 to-blue-600' },
    { value: 'purple', label: 'Royal Purple', gradient: 'from-purple-400 to-purple-600' },
    { value: 'green', label: 'Forest Green', gradient: 'from-green-400 to-green-600' },
    { value: 'rose', label: 'Rose Gold', gradient: 'from-rose-400 to-rose-600' },
    { value: 'amber', label: 'Sunset Amber', gradient: 'from-amber-400 to-amber-600' },
    { value: 'teal', label: 'Teal Wave', gradient: 'from-teal-400 to-teal-600' },
    { value: 'indigo', label: 'Deep Indigo', gradient: 'from-indigo-400 to-indigo-600' }
  ]

  const handleSave = () => {
    setLoading(true)
    setSaved(false)
    
    setTimeout(() => {
      setLoading(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 1000)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'company', label: 'Organization', icon: Building },
    { id: 'integrations', label: 'Integrations', icon: Link },
    { id: 'data', label: 'Data & Privacy', icon: Database },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ]

  return (
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 text-sky-600 dark:text-sky-400 border-l-4 border-sky-600 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Appearance Tab - Enhanced */}
          {activeTab === 'appearance' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Appearance Settings</h2>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-gray-500">Customize your experience</span>
                </div>
              </div>

              <div className="space-y-8">
                {/* Theme Mode */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Theme Mode</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'light', icon: Sun, label: 'Light', description: 'Bright and clean' },
                      { value: 'dark', icon: Moon, label: 'Dark', description: 'Easy on the eyes' },
                      { value: 'system', icon: Monitor, label: 'System', description: 'Auto-switch' }
                    ].map((option) => {
                      const Icon = option.icon
                      return (
                        <button
                          key={option.value}
                          onClick={() => setTheme({ ...theme, mode: option.value })}
                          className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                            theme.mode === option.value
                              ? 'border-sky-500 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 shadow-lg transform scale-105'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          {theme.mode === option.value && (
                            <div className="absolute top-2 right-2">
                              <Check className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                            </div>
                          )}
                          <Icon className={`h-8 w-8 mx-auto mb-3 ${
                            theme.mode === option.value
                              ? 'text-sky-600 dark:text-sky-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`} />
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.description}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Accent Color</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setTheme({ ...theme, primaryColor: color.value })}
                        className={`relative group overflow-hidden rounded-xl transition-all duration-300 ${
                          theme.primaryColor === color.value
                            ? 'ring-2 ring-offset-2 ring-sky-500 transform scale-105'
                            : 'hover:transform hover:scale-105'
                        }`}
                      >
                        <div className={`h-20 bg-gradient-to-br ${color.gradient}`} />
                        <div className="p-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{color.label}</div>
                        </div>
                        {theme.primaryColor === color.value && (
                          <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1">
                            <Check className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography & Layout */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Font Size</h3>
                    <div className="space-y-2">
                      {['small', 'medium', 'large', 'extra-large'].map((size) => (
                        <label key={size} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                          <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{size.replace('-', ' ')}</span>
                          <input
                            type="radio"
                            name="fontSize"
                            value={size}
                            checked={theme.fontSize === size}
                            onChange={(e) => setTheme({ ...theme, fontSize: e.target.value })}
                            className="text-sky-600 focus:ring-sky-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Border Radius</h3>
                    <div className="space-y-2">
                      {['none', 'small', 'medium', 'large'].map((radius) => (
                        <label key={radius} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                          <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{radius}</span>
                          <input
                            type="radio"
                            name="borderRadius"
                            value={radius}
                            checked={theme.borderRadius === radius}
                            onChange={(e) => setTheme({ ...theme, borderRadius: e.target.value })}
                            className="text-sky-600 focus:ring-sky-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visual Effects */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Visual Effects</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Animations</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Smooth transitions and effects</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={theme.animations}
                        onChange={(e) => setTheme({ ...theme, animations: e.target.checked })}
                        className="h-5 w-5 text-sky-600 rounded focus:ring-sky-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Grid className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Compact Mode</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Reduce spacing for more content</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={theme.compactMode}
                        onChange={(e) => setTheme({ ...theme, compactMode: e.target.checked })}
                        className="h-5 w-5 text-sky-600 rounded focus:ring-sky-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">High Contrast</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Increase text and UI contrast</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={theme.highContrast}
                        onChange={(e) => setTheme({ ...theme, highContrast: e.target.checked })}
                        className="h-5 w-5 text-sky-600 rounded focus:ring-sky-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Preview Section */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Preview</h3>
                  <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div className="max-w-md mx-auto">
                      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${
                        theme.animations ? 'transition-all duration-300' : ''
                      }`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`h-10 w-10 bg-gradient-to-br ${
                            colorOptions.find(c => c.value === theme.primaryColor)?.gradient || 'from-sky-400 to-sky-600'
                          } rounded-lg flex items-center justify-center`}>
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-semibold text-gray-900 dark:text-gray-100 ${
                              theme.fontSize === 'small' ? 'text-sm' :
                              theme.fontSize === 'large' ? 'text-lg' :
                              theme.fontSize === 'extra-large' ? 'text-xl' : ''
                            }`}>Sample Card</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">This is how your content will look</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className={`px-3 py-1 bg-gradient-to-r ${
                            colorOptions.find(c => c.value === theme.primaryColor)?.gradient || 'from-sky-400 to-sky-600'
                          } text-white text-sm font-medium rounded-${
                            theme.borderRadius === 'none' ? 'none' :
                            theme.borderRadius === 'small' ? 'sm' :
                            theme.borderRadius === 'large' ? 'xl' : 'lg'
                          }`}>
                            Primary
                          </button>
                          <button className={`px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-${
                            theme.borderRadius === 'none' ? 'none' :
                            theme.borderRadius === 'small' ? 'sm' :
                            theme.borderRadius === 'large' ? 'xl' : 'lg'
                          }`}>
                            Secondary
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                  >
                    {loading ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : saved ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saved ? 'Saved!' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add other tab content here */}
          {activeTab !== 'appearance' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Content for {tabs.find(t => t.id === activeTab)?.label} tab
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}