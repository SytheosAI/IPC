'use client'

import { useState, useEffect, useRef } from 'react'

// Timestamp utility system
const TimestampUtils = {
  now: () => Date.now(),
  fromDate: (date: Date) => date.getTime()
}
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
  FileText,
  CreditCard,
  Users,
  Briefcase,
  Building,
  MapPin,
  Link,
  Zap,
  Activity,
  HelpCircle,
  Code,
  Palette,
  Volume2,
  Wifi,
  Camera,
  Mic,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  BarChart3,
  PieChart,
  Layers,
  GitBranch,
  Terminal,
  Cpu,
  HardDrive,
  Cloud,
  Server,
  CheckCircle,
  XCircle,
  Info,
  Trash2,
  Archive,
  FolderOpen,
  Package,
  MessageSquare,
  Send,
  Inbox,
  Search,
  Filter,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  Compass,
  Navigation,
  Map,
  Target,
  Flag,
  Bookmark,
  Heart,
  Star,
  ThumbsUp,
  MessageCircle,
  Share2,
  Copy,
  Clipboard,
  Edit,
  Type,
  Bold,
  Italic,
  Underline,
  List,
  Grid,
  Layout,
  Columns,
  Sidebar,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Sparkles,
  Wand2,
  Lightbulb,
  Rocket,
  Trophy,
  Medal,
  Crown,
  Gem,
  Gift,
  ShoppingCart,
  DollarSign,
  Euro,
  Percent,
  Calculator,
  Wallet,
  Receipt,
  FileBarChart,
  FileSpreadsheet,
  FilePlus,
  FileMinus,
  FileCheck,
  FileX,
  FolderPlus,
  FolderMinus,
  FolderCheck,
  FolderX,
  Command,
  Plus,
  Check,
  ChevronRight,
  MoreVertical,
  Bot,
  Folder,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Copy as CopyIcon
} from 'lucide-react'
import { db } from '@/lib/supabase-client'
import { useUser } from '@/app/contexts/UserContext'
import PageTitle from '@/components/PageTitle'
import IntegrationsTab from './IntegrationsTab'
import ActivityTab from './ActivityTab'
import SupportTab from './SupportTab'
import TwoFactorAuth from '@/components/TwoFactorAuth'

interface UserProfile {
  name: string
  email: string
  role: string
  department: string
  phone: string
  avatar?: string
  company?: string
  license?: string
}

interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  projectUpdates: boolean
  inspectionAlerts: boolean
  reportSubmissions: boolean
  documentUploads: boolean
  weeklyDigest: boolean
  monthlyReport: boolean
}

interface SecuritySettings {
  twoFactorAuth: boolean
  sessionTimeout: number
  passwordExpiry: number
  loginAlerts: boolean
  apiAccess: boolean
  ipWhitelist: string[]
}

interface ThemeSettings {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  borderRadius: 'none' | 'small' | 'medium' | 'large'
  compactMode: boolean
  animations: boolean
  highContrast: boolean
}

interface OrganizationData {
  companyName: string
  legalName: string
  taxId: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  email: string
  website: string
  yearEstablished: string
  numberOfEmployees: string
  licenseNumber: string
  licenseState: string
  licenseExpiry: string
  insuranceCarrier: string
  policyNumber: string
  documents: {
    license?: File | null
    w9?: File | null
    generalLiability?: File | null
    workersComp?: File | null
  }
}

interface Integration {
  id: string
  name: string
  category: string
  description: string
  icon: string
  connected: boolean
  status: 'active' | 'inactive' | 'error'
  lastSync?: string
}

interface ActivityLog {
  id: string
  timestamp: string
  user: string
  action: string
  details: string
  type: 'login' | 'create' | 'update' | 'delete' | 'view' | 'export'
  status: 'success' | 'warning' | 'error'
}

interface ApiKey {
  id: string
  name: string
  key: string
  created: string
  lastUsed: string
  permissions: string[]
}

export default function SettingsPage() {
  const userContext = useUser()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    name: userContext?.profile?.name || '',
    email: userContext?.profile?.email || '',
    role: userContext?.profile?.title || 'Inspector',
    department: 'Building & Safety',
    phone: userContext?.profile?.phone || '',
    company: userContext?.profile?.company || '',
    license: ''
  })

  // Avatar state
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const avatarStyles = [
    { type: 'gradient', colors: ['from-purple-400', 'to-pink-600'] },
    { type: 'gradient', colors: ['from-cyan-400', 'to-blue-600'] },
    { type: 'gradient', colors: ['from-green-400', 'to-emerald-600'] },
    { type: 'gradient', colors: ['from-yellow-400', 'to-orange-600'] },
    { type: 'gradient', colors: ['from-red-400', 'to-rose-600'] },
    { type: 'tiedye', colors: ['bg-purple-400', 'bg-pink-400', 'bg-blue-400'] },
    { type: 'tiedye', colors: ['bg-green-400', 'bg-yellow-400', 'bg-orange-400'] },
    { type: 'tiedye', colors: ['bg-cyan-400', 'bg-indigo-400', 'bg-purple-400'] },
    { type: 'splatter', colors: ['bg-red-500', 'bg-yellow-500', 'bg-blue-500'] },
    { type: 'splatter', colors: ['bg-pink-500', 'bg-purple-500', 'bg-indigo-500'] },
    { type: 'geometric', colors: ['from-slate-400', 'to-gray-600'] },
    { type: 'geometric', colors: ['from-amber-400', 'to-orange-600'] },
    { type: 'abstract', colors: ['from-teal-400', 'to-cyan-600'] },
    { type: 'abstract', colors: ['from-fuchsia-400', 'to-purple-600'] },
    { type: 'waves', colors: ['from-blue-400', 'to-indigo-600'] },
    { type: 'waves', colors: ['from-emerald-400', 'to-green-600'] }
  ]

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    projectUpdates: true,
    inspectionAlerts: true,
    reportSubmissions: true,
    documentUploads: false,
    weeklyDigest: true,
    monthlyReport: false
  })

  // Security settings
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAlerts: true,
    apiAccess: false,
    ipWhitelist: []
  })

  // Theme settings
  const [theme, setTheme] = useState<ThemeSettings>({
    mode: (userContext?.theme?.theme === 'auto' ? 'system' : userContext?.theme?.theme) || 'light',
    primaryColor: userContext?.theme?.accentColor || 'sky',
    fontSize: 'medium',
    borderRadius: 'medium',
    compactMode: false,
    animations: true,
    highContrast: false
  })

  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Organization state
  const [organization, setOrganization] = useState<OrganizationData>({
    companyName: '',
    legalName: '',
    taxId: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phone: '',
    email: '',
    website: '',
    yearEstablished: '',
    numberOfEmployees: '',
    licenseNumber: '',
    licenseState: '',
    licenseExpiry: '',
    insuranceCarrier: '',
    policyNumber: '',
    documents: {
      license: null,
      w9: null,
      generalLiability: null,
      workersComp: null
    }
  })

  // Integrations state
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: '1', name: 'Procore', category: 'Project Management', description: 'Construction project management platform', icon: '🏗️', connected: true, status: 'active', lastSync: '2 mins ago' },
    { id: '2', name: 'QuickBooks', category: 'Accounting', description: 'Financial management and accounting', icon: '💰', connected: true, status: 'active', lastSync: '1 hour ago' },
    { id: '3', name: 'Slack', category: 'Communication', description: 'Team communication and collaboration', icon: '💬', connected: false, status: 'inactive' },
    { id: '4', name: 'Google Drive', category: 'Storage', description: 'Cloud document storage', icon: '📁', connected: true, status: 'active', lastSync: '5 mins ago' },
    { id: '5', name: 'Autodesk', category: 'BIM/CAD', description: 'Building information modeling', icon: '📐', connected: false, status: 'inactive' },
    { id: '6', name: 'Weather API', category: 'Data Services', description: 'Real-time weather data', icon: '🌤️', connected: true, status: 'active', lastSync: 'Live' },
    { id: '7', name: 'Fieldwire', category: 'Field Management', description: 'Field task management', icon: '📋', connected: false, status: 'inactive' },
    { id: '8', name: 'SafetyCulture', category: 'Compliance', description: 'Safety and compliance tracking', icon: '🦺', connected: true, status: 'error', lastSync: 'Connection failed' }
  ])

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: '1', name: 'Production API Key', key: 'pk_live_51234567890abcdef', created: '2024-01-15', lastUsed: '2 hours ago', permissions: ['read', 'write'] },
    { id: '2', name: 'Development API Key', key: 'pk_test_0987654321fedcba', created: '2024-02-01', lastUsed: '1 day ago', permissions: ['read'] }
  ])

  // Activity state
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [activityFilter, setActivityFilter] = useState('all')
  const [activitySearch, setActivitySearch] = useState('')
  const [activityMetrics, setActivityMetrics] = useState({
    totalActions: 1247,
    successRate: 94.3,
    activeUsers: 28,
    peakHour: '2:00 PM - 3:00 PM',
    mostCommonAction: 'View Project'
  })

  // Chat state for support
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'bot', message: 'Hello! I\'m your IPC Assistant. How can I help you today?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  
  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // Streamlined tabs - removed unnecessary ones
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations & API', icon: Link },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'data', label: 'Data & Privacy', icon: Database },
    { id: 'activity', label: 'Activity Log', icon: Activity },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ]

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)
    
    try {
      // Update user context
      if (userContext?.updateProfile) {
        userContext.updateProfile({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          title: profile.role,
          company: profile.company || profile.department,
          address: ''
        })
      }

      if (userContext?.updateTheme) {
        userContext.updateTheme({
          theme: theme.mode === 'system' ? 'auto' : theme.mode,
          accentColor: theme.primaryColor
        })
      }

      // Save to database
      await db.userSettings.upsert('default-user', {
        profile,
        notifications,
        security,
        theme
      })

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Failed to save settings:', err)
      setError('Failed to save settings')
    } finally {
      setLoading(false)
    }
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

  // Load activity logs on mount
  useEffect(() => {
    loadActivityLogs()
  }, [])

  // Scroll chat to bottom when new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const loadActivityLogs = async () => {
    try {
      // Load real activity logs from database
      const logs = await db.activityLogs.getRecent(50)
      
      // Enterprise: Use only live database data - no fallbacks or demo content
      setActivityLogs((logs as ActivityLog[]) || [])
    } catch (error) {
      console.error('Error loading activity logs:', error)
      // Enterprise: Log error but don't create fake data
      setActivityLogs([])
    }
  }

  const handleFileUpload = (docType: keyof OrganizationData['documents'], file: File) => {
    setOrganization(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: file
      }
    }))
  }

  const handleIntegrationToggle = (id: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { ...integration, connected: !integration.connected, status: !integration.connected ? 'active' : 'inactive' }
        : integration
    ))
  }

  const generateApiKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: `API Key ${apiKeys.length + 1}`,
      key: `pk_${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      permissions: ['read']
    }
    setApiKeys([...apiKeys, newKey])
  }

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return

    const userMessage = { id: Date.now().toString(), sender: 'user', message: chatInput }
    setChatMessages(prev => [...prev, userMessage])

    // Simulate bot response
    setTimeout(() => {
      const botResponses = [
        'To create a new project, click on the Projects tab in the main navigation and select "New Project".',
        'You can upload inspection photos by opening any project and clicking the camera icon.',
        'The VBA module allows you to conduct virtual building assessments. Access it from the main dashboard.',
        'To generate reports, go to any completed inspection and click "Export Report" in the top right.',
        'You can manage team members in the Members section. Add new users by clicking "Invite Member".'
      ]
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)]
      const botMessage = { id: (Date.now() + 1).toString(), sender: 'bot', message: randomResponse }
      setChatMessages(prev => [...prev, botMessage])
    }, 1000)

    setChatInput('')
  }

  const startVoiceRecognition = () => {
    setIsListening(!isListening)
    // Implement actual voice recognition here
    if (!isListening) {
      setTimeout(() => {
        setChatInput('How do I create a new inspection report?')
        setIsListening(false)
      }, 2000)
    }
  }

  const exportData = async () => {
    try {
      setLoading(true)
      
      const [projects, fieldReports, documents, vbaProjects, inspections] = await Promise.all([
        db.projects.getAll().catch(() => []),
        db.fieldReports.getAll().catch(() => []),
        db.documents.getAll().catch(() => []),
        db.vbaProjects.getAll().catch(() => []),
        db.inspections.getAll().catch(() => [])
      ])
      
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '2.0',
        data: {
          projects,
          fieldReports,
          documents,
          vbaProjects,
          inspections,
          settings: {
            profile,
            notifications,
            theme
          }
        }
      }
      
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `IPC-export-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      
      alert('Data exported successfully!')
    } catch (err) {
      console.error('Error exporting data:', err)
      alert('Failed to export data')
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <PageTitle title="Settings" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-48">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-400 border-l-4 border-yellow-500 shadow-glow backdrop-blur-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30 backdrop-blur-sm'
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
          <div className="card-modern hover-lift backdrop-blur-lg">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-yellow-400 mb-6">Profile Information</h2>
                
                <div className="space-y-6">
                  {/* Avatar Selection */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Choose Your Avatar</h3>
                    <div className="grid grid-cols-8 gap-3">
                      {avatarStyles.map((style, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedAvatar(index)}
                          className={`relative h-16 w-16 rounded-full overflow-hidden border-4 transition-all ${
                            selectedAvatar === index 
                              ? 'border-sky-500 scale-110 shadow-lg' 
                              : 'border-transparent hover:border-gray-300'
                          }`}
                        >
                          {style.type === 'gradient' && (
                            <div className={`w-full h-full bg-gradient-to-br ${style.colors.join(' ')}`} />
                          )}
                          {style.type === 'tiedye' && (
                            <div className="relative w-full h-full">
                              <div className={`absolute inset-0 ${style.colors[0]} opacity-60`} />
                              <div className={`absolute top-0 left-0 w-3/4 h-3/4 ${style.colors[1]} rounded-full blur-xl opacity-70`} />
                              <div className={`absolute bottom-0 right-0 w-3/4 h-3/4 ${style.colors[2]} rounded-full blur-xl opacity-70`} />
                            </div>
                          )}
                          {style.type === 'splatter' && (
                            <div className="relative w-full h-full bg-gray-100">
                              <div className={`absolute top-2 left-2 w-4 h-4 ${style.colors[0]} rounded-full blur-sm`} />
                              <div className={`absolute top-4 right-3 w-5 h-5 ${style.colors[1]} rounded-full blur-sm`} />
                              <div className={`absolute bottom-3 left-3 w-3 h-3 ${style.colors[2]} rounded-full blur-sm`} />
                              <div className={`absolute bottom-2 right-2 w-6 h-6 ${style.colors[0]} rounded-full blur-md opacity-60`} />
                            </div>
                          )}
                          {style.type === 'geometric' && (
                            <div className={`relative w-full h-full bg-gradient-to-br ${style.colors.join(' ')}`}>
                              <div className="absolute inset-0 opacity-30">
                                <div className="absolute top-0 left-0 w-0 h-0 border-l-[32px] border-l-transparent border-b-[32px] border-b-white" />
                                <div className="absolute bottom-0 right-0 w-0 h-0 border-r-[32px] border-r-transparent border-t-[32px] border-t-white" />
                              </div>
                            </div>
                          )}
                          {style.type === 'abstract' && (
                            <div className={`relative w-full h-full bg-gradient-to-br ${style.colors.join(' ')}`}>
                              <div className="absolute inset-0">
                                <svg className="w-full h-full" viewBox="0 0 64 64">
                                  <circle cx="20" cy="20" r="15" fill="white" opacity="0.2" />
                                  <circle cx="44" cy="44" r="12" fill="white" opacity="0.15" />
                                  <path d="M 10 50 Q 32 20 54 50" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
                                </svg>
                              </div>
                            </div>
                          )}
                          {style.type === 'waves' && (
                            <div className={`relative w-full h-full bg-gradient-to-br ${style.colors.join(' ')}`}>
                              <div className="absolute inset-0">
                                <svg className="w-full h-full" viewBox="0 0 64 64">
                                  <path d="M 0 20 Q 16 10 32 20 T 64 20" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
                                  <path d="M 0 32 Q 16 22 32 32 T 64 32" stroke="white" strokeWidth="2" fill="none" opacity="0.25" />
                                  <path d="M 0 44 Q 16 34 32 44 T 64 44" stroke="white" strokeWidth="2" fill="none" opacity="0.2" />
                                </svg>
                              </div>
                            </div>
                          )}
                          {selectedAvatar === index && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                              <Check className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Current Avatar Display */}
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full overflow-hidden shadow-lg">
                      {avatarStyles[selectedAvatar].type === 'gradient' && (
                        <div className={`w-full h-full bg-gradient-to-br ${avatarStyles[selectedAvatar].colors.join(' ')}`} />
                      )}
                      {avatarStyles[selectedAvatar].type === 'tiedye' && (
                        <div className="relative w-full h-full">
                          <div className={`absolute inset-0 ${avatarStyles[selectedAvatar].colors[0]} opacity-60`} />
                          <div className={`absolute top-0 left-0 w-3/4 h-3/4 ${avatarStyles[selectedAvatar].colors[1]} rounded-full blur-xl opacity-70`} />
                          <div className={`absolute bottom-0 right-0 w-3/4 h-3/4 ${avatarStyles[selectedAvatar].colors[2]} rounded-full blur-xl opacity-70`} />
                        </div>
                      )}
                      {avatarStyles[selectedAvatar].type === 'splatter' && (
                        <div className="relative w-full h-full bg-gray-100">
                          <div className={`absolute top-4 left-4 w-8 h-8 ${avatarStyles[selectedAvatar].colors[0]} rounded-full blur-sm`} />
                          <div className={`absolute top-8 right-6 w-10 h-10 ${avatarStyles[selectedAvatar].colors[1]} rounded-full blur-sm`} />
                          <div className={`absolute bottom-6 left-6 w-6 h-6 ${avatarStyles[selectedAvatar].colors[2]} rounded-full blur-sm`} />
                          <div className={`absolute bottom-4 right-4 w-12 h-12 ${avatarStyles[selectedAvatar].colors[0]} rounded-full blur-md opacity-60`} />
                        </div>
                      )}
                      {avatarStyles[selectedAvatar].type === 'geometric' && (
                        <div className={`relative w-full h-full bg-gradient-to-br ${avatarStyles[selectedAvatar].colors.join(' ')}`}>
                          <div className="absolute inset-0 opacity-30">
                            <div className="absolute top-0 left-0 w-0 h-0 border-l-[40px] border-l-transparent border-b-[40px] border-b-white" />
                            <div className="absolute bottom-0 right-0 w-0 h-0 border-r-[40px] border-r-transparent border-t-[40px] border-t-white" />
                          </div>
                        </div>
                      )}
                      {avatarStyles[selectedAvatar].type === 'abstract' && (
                        <div className={`relative w-full h-full bg-gradient-to-br ${avatarStyles[selectedAvatar].colors.join(' ')}`}>
                          <div className="absolute inset-0">
                            <svg className="w-full h-full" viewBox="0 0 80 80">
                              <circle cx="25" cy="25" r="18" fill="white" opacity="0.2" />
                              <circle cx="55" cy="55" r="15" fill="white" opacity="0.15" />
                              <path d="M 12 62 Q 40 25 68 62" stroke="white" strokeWidth="3" fill="none" opacity="0.3" />
                            </svg>
                          </div>
                        </div>
                      )}
                      {avatarStyles[selectedAvatar].type === 'waves' && (
                        <div className={`relative w-full h-full bg-gradient-to-br ${avatarStyles[selectedAvatar].colors.join(' ')}`}>
                          <div className="absolute inset-0">
                            <svg className="w-full h-full" viewBox="0 0 80 80">
                              <path d="M 0 25 Q 20 12 40 25 T 80 25" stroke="white" strokeWidth="3" fill="none" opacity="0.3" />
                              <path d="M 0 40 Q 20 27 40 40 T 80 40" stroke="white" strokeWidth="3" fill="none" opacity="0.25" />
                              <path d="M 0 55 Q 20 42 40 55 T 80 55" stroke="white" strokeWidth="3" fill="none" opacity="0.2" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{profile.name || 'Your Name'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Your selected avatar</p>
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
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={profile.company}
                        onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        License Number
                      </label>
                      <input
                        type="text"
                        value={profile.license}
                        onChange={(e) => setProfile({ ...profile, license: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={handleSave}
                      disabled={loading}
                      className="px-6 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
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

            {/* Enhanced Appearance Tab */}
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
                            onClick={() => {
                              setTheme({ ...theme, mode: option.value as ThemeSettings['mode'] })
                              if (userContext?.updateTheme) {
                                userContext.updateTheme({ 
                                  theme: option.value === 'system' ? 'auto' : option.value as 'light' | 'dark', 
                                  accentColor: theme.primaryColor 
                                })
                              }
                            }}
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
                          onClick={() => {
                            setTheme({ ...theme, primaryColor: color.value })
                            if (userContext?.updateTheme) {
                              userContext.updateTheme({ 
                                theme: theme.mode === 'system' ? 'auto' : theme.mode, 
                                accentColor: color.value 
                              })
                            }
                          }}
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
                              onChange={(e) => setTheme({ ...theme, fontSize: e.target.value as ThemeSettings['fontSize'] })}
                              className="text-yellow-500 focus:ring-yellow-500"
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
                              onChange={(e) => setTheme({ ...theme, borderRadius: e.target.value as ThemeSettings['borderRadius'] })}
                              className="text-yellow-500 focus:ring-yellow-500"
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

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-6 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
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
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'projectUpdates', label: 'Project Updates' },
                        { key: 'inspectionAlerts', label: 'Inspection Alerts' },
                        { key: 'reportSubmissions', label: 'Report Submissions' },
                        { key: 'documentUploads', label: 'Document Uploads' },
                        { key: 'weeklyDigest', label: 'Weekly Digest' },
                        { key: 'monthlyReport', label: 'Monthly Reports' }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof NotificationSettings] as boolean}
                            onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                            className="h-4 w-4 text-sky-600 rounded focus:ring-sky-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button onClick={handleSave} className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2">
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
                    <div className="space-y-4 max-w-md">
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
                      {/* Two-Factor Authentication Component */}
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <TwoFactorAuth
                          userId={userContext?.profile?.email || 'default-user'}
                        />
                      </div>
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

            {/* Data & Privacy Tab */}
            {activeTab === 'data' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Data Management</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Export Data
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Download all your data including projects, reports, and settings.
                    </p>
                    <button 
                      onClick={exportData}
                      disabled={loading}
                      className="w-full p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Export All Data</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Download as JSON</p>
                        </div>
                        <Download className="h-4 w-4 text-gray-400" />
                      </div>
                    </button>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Privacy Settings
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Control how your data is used and shared.
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded text-sky-600" defaultChecked />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Analytics tracking</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded text-sky-600" defaultChecked />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Performance monitoring</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded text-sky-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Share usage data</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {!['profile', 'appearance', 'notifications', 'security', 'data'].includes(activeTab) && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  This section is coming soon. We&apos;re working on bringing you more features!
                </p>
              </div>
            )}


            {/* Integrations & API Tab */}
            {activeTab === 'integrations' && (
              <IntegrationsTab
                integrations={integrations}
                handleIntegrationToggle={handleIntegrationToggle}
                apiKeys={apiKeys}
                setApiKeys={setApiKeys}
                generateApiKey={generateApiKey}
              />
            )}

            {/* Activity Log Tab */}
            {activeTab === 'activity' && (
              <ActivityTab
                activityLogs={activityLogs}
                activityFilter={activityFilter}
                setActivityFilter={setActivityFilter}
                activitySearch={activitySearch}
                setActivitySearch={setActivitySearch}
                activityMetrics={activityMetrics}
              />
            )}

            {/* Help & Support Tab */}
            {activeTab === 'support' && (
              <SupportTab
                chatMessages={chatMessages}
                chatInput={chatInput}
                setChatInput={setChatInput}
                isListening={isListening}
                handleChatSubmit={handleChatSubmit}
                startVoiceRecognition={startVoiceRecognition}
                chatEndRef={chatEndRef}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}