'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Plus, 
  Building2, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Calendar, 
  Map, 
  Camera, 
  FileText, 
  Download, 
  Shield, 
  Brain, 
  Users, 
  TrendingUp, 
  Clock, 
  Filter, 
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Eye,
  Home,
  MapPin,
  Activity,
  Cloud,
  Droplets,
  Wind,
  ExternalLink,
  Newspaper,
  ArrowUp,
  X,
  Sun,
  CloudRain,
  CloudSnow,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface VBAProject {
  id: string
  jobNumber?: string
  projectName: string
  address: string
  inspectionType: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed'
  scheduledDate: string
  inspector: string
  completionRate: number
  complianceScore?: number
  lastUpdated: string
  virtualInspectorEnabled: boolean
  gpsLocation?: { lat: number; lng: number }
  photoCount: number
  violations: number
  aiConfidence?: number
  selectedInspections?: string[]
}

interface InspectionStats {
  totalInspections: number
  completedInspections: number
  pendingInspections: number
  failedInspections: number
  averageComplianceScore: number
  virtualInspectorUsage: number
  timesSaved: number
}

interface WeatherData {
  temp: number
  condition: string
  feelsLike: number
  humidity: number
  forecast: Array<{
    day: string
    high: number
    low: number
    condition: string
  }>
}

interface NewsItem {
  id: string
  title: string
  source: string
  date: string
  category: string
  url?: string
  description?: string
}

interface InspectionSchedule {
  id: string
  projectId: string
  inspectionType: string
  date: string
  time: string
  assignedTo: string
  assignedToEmail?: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  role?: string
}

export default function VBAPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<VBAProject[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [inspectionStats, setInspectionStats] = useState<InspectionStats>({
    totalInspections: 0,
    completedInspections: 0,
    pendingInspections: 0,
    failedInspections: 0,
    averageComplianceScore: 0,
    virtualInspectorUsage: 0,
    timesSaved: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temp: 82,
    condition: 'Partly Cloudy',
    feelsLike: 88,
    humidity: 65,
    forecast: [
      { day: 'Today', high: 85, low: 74, condition: 'partly-cloudy' },
      { day: 'Tomorrow', high: 86, low: 77, condition: 'cloudy' },
      { day: 'Fri', high: 90, low: 79, condition: 'cloudy' }
    ]
  })
  const [weeklyMetrics, setWeeklyMetrics] = useState({
    completed: 0,
    scheduled: 0,
    passRate: 0,
    complianceAvg: 0
  })
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [selectedNewsCategory, setSelectedNewsCategory] = useState('all')
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedProjectForSchedule, setSelectedProjectForSchedule] = useState<VBAProject | null>(null)
  const [inspectionSchedules, setInspectionSchedules] = useState<InspectionSchedule[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])

  useEffect(() => {
    loadVBAProjects()
    fetchWeatherData()
    fetchNewsData()
    loadContacts()
    loadInspectionSchedules()
  }, [])

  useEffect(() => {
    calculateWeeklyMetrics()
  }, [projects, inspectionSchedules])

  const fetchNewsData = async () => {
    try {
      setNewsLoading(true)
      
      // Using a free news API that doesn't require authentication for construction news
      // You can replace this with your preferred news API
      const response = await fetch(
        'https://newsdata.io/api/1/news?apikey=pub_52993cc6dc6e4de5c1a08c13c5b528dd17bb3&q=construction%20technology%20AI%20robotics&language=en&category=technology,business'
      )
      
      if (!response.ok) {
        console.error('Failed to fetch news')
        // Fallback to mock data if API fails
        setNewsItems([
          {
            id: '1',
            title: 'AI-Powered Construction Management Reduces Project Delays by 35%',
            source: 'Construction AI Weekly',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            category: 'AI & Tech',
            description: 'New AI systems are revolutionizing construction project management'
          },
          {
            id: '2',
            title: 'Construction Robotics Market to Hit $20B by 2026',
            source: 'TechConstruct News',
            date: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            category: 'AI & Tech',
            description: 'Market analysis shows rapid growth in construction automation'
          }
        ])
        return
      }
      
      const data = await response.json()
      
      if (data.results) {
        const formattedNews = data.results.slice(0, 5).map((article: any, index: number) => ({
          id: index.toString(),
          title: article.title,
          source: article.source_name || article.source_id || 'Industry News',
          date: new Date(article.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          category: 'AI & Tech',
          url: article.link,
          description: article.description || article.content?.substring(0, 150) + '...'
        }))
        
        setNewsItems(formattedNews)
      }
    } catch (error) {
      console.error('Failed to fetch news:', error)
      // Set fallback news items
      setNewsItems([
        {
          id: '1',
          title: 'AI-Powered Construction Management Reduces Project Delays by 35%',
          source: 'Construction AI Weekly',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          category: 'AI & Tech'
        }
      ])
    } finally {
      setNewsLoading(false)
    }
  }

  const loadContacts = () => {
    const savedContacts = localStorage.getItem('vba-contacts')
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts))
    } else {
      // Default contacts
      const defaultContacts = [
        { id: '1', name: 'John Smith', email: 'john.smith@example.com', phone: '(239) 555-0101', role: 'Senior Inspector' },
        { id: '2', name: 'Sarah Johnson', email: 'sarah.j@example.com', phone: '(239) 555-0102', role: 'Lead Inspector' },
        { id: '3', name: 'Mike Williams', email: 'mike.w@example.com', phone: '(239) 555-0103', role: 'Inspector' },
        { id: '4', name: 'Emily Davis', email: 'emily.d@example.com', phone: '(239) 555-0104', role: 'Junior Inspector' }
      ]
      setContacts(defaultContacts)
      localStorage.setItem('vba-contacts', JSON.stringify(defaultContacts))
    }
  }

  const loadInspectionSchedules = () => {
    const savedSchedules = localStorage.getItem('vba-inspection-schedules')
    if (savedSchedules) {
      setInspectionSchedules(JSON.parse(savedSchedules))
    }
  }

  const calculateWeeklyMetrics = () => {
    // Get the start of this week (Sunday)
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    // Filter projects for this week
    const thisWeekProjects = projects.filter(project => {
      const projectDate = new Date(project.lastUpdated)
      return projectDate >= startOfWeek
    })
    
    // Get all inspection events from localStorage
    const allInspectionEvents: any[] = []
    projects.forEach(project => {
      const events = localStorage.getItem(`vba-inspection-events-${project.id}`)
      if (events) {
        const parsedEvents = JSON.parse(events)
        allInspectionEvents.push(...parsedEvents.map((e: any) => ({...e, projectId: project.id})))
      }
    })
    
    // Filter events for this week
    const thisWeekEvents = allInspectionEvents.filter(event => {
      const eventDate = new Date(event.date || event.scheduledDate || event.lastUpdated)
      return eventDate >= startOfWeek
    })
    
    // Calculate metrics
    const completed = thisWeekEvents.filter(e => e.status === 'completed').length +
                     thisWeekProjects.filter(p => p.status === 'completed').length
    const scheduled = thisWeekEvents.filter(e => e.status === 'scheduled').length + 
                     thisWeekProjects.filter(p => p.status === 'scheduled').length
    const passed = thisWeekEvents.filter(e => e.status === 'completed' && !e.failed).length +
                  thisWeekProjects.filter(p => p.status === 'completed' && p.violations === 0).length
    const passRate = completed > 0 ? Math.round((passed / completed) * 100) : 0
    
    // Calculate average compliance score
    const completedWithScores = thisWeekProjects.filter(p => p.status === 'completed' && p.complianceScore)
    const complianceAvg = completedWithScores.length > 0 
      ? Math.round(completedWithScores.reduce((sum, p) => sum + (p.complianceScore || 0), 0) / completedWithScores.length)
      : 0
    
    setWeeklyMetrics({
      completed,
      scheduled,
      passRate,
      complianceAvg
    })
  }

  const fetchWeatherData = async () => {
    try {
      setWeatherLoading(true)
      
      // Fort Myers, FL coordinates
      const lat = 26.6406
      const lon = -81.8723
      
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
      
      if (!apiKey) {
        console.error('Weather API key not found')
        return
      }

      // Fetch current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
      )
      const currentData = await currentResponse.json()

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial&cnt=24`
      )
      const forecastData = await forecastResponse.json()

      // Process forecast data to get daily highs/lows
      const dailyForecasts: any = {}
      forecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000)
        const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' })
        
        if (!dailyForecasts[dayKey]) {
          dailyForecasts[dayKey] = {
            high: item.main.temp_max,
            low: item.main.temp_min,
            condition: item.weather[0].main
          }
        } else {
          dailyForecasts[dayKey].high = Math.max(dailyForecasts[dayKey].high, item.main.temp_max)
          dailyForecasts[dayKey].low = Math.min(dailyForecasts[dayKey].low, item.main.temp_min)
        }
      })

      const forecastArray = Object.entries(dailyForecasts).slice(0, 3).map(([day, data]: [string, any], index) => ({
        day: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : day,
        high: Math.round(data.high),
        low: Math.round(data.low),
        condition: data.condition.toLowerCase()
      }))

      setWeatherData({
        temp: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        feelsLike: Math.round(currentData.main.feels_like),
        humidity: currentData.main.humidity,
        forecast: forecastArray
      })
    } catch (error) {
      console.error('Failed to fetch weather data:', error)
    } finally {
      setWeatherLoading(false)
    }
  }

  const loadVBAProjects = async () => {
    try {
      setIsLoading(true)
      // Load projects from API or localStorage
      const savedProjects = localStorage.getItem('vba-projects')
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects))
      }

      // Calculate stats
      const loadedProjects = savedProjects ? JSON.parse(savedProjects) : []
      const stats: InspectionStats = {
        totalInspections: loadedProjects.length,
        completedInspections: loadedProjects.filter((p: VBAProject) => p.status === 'completed').length,
        pendingInspections: loadedProjects.filter((p: VBAProject) => p.status === 'scheduled').length,
        failedInspections: loadedProjects.filter((p: VBAProject) => p.status === 'failed').length,
        averageComplianceScore: loadedProjects.length > 0 ? Math.round(
          loadedProjects
            .filter((p: VBAProject) => p.complianceScore !== undefined)
            .reduce((acc: number, p: VBAProject) => acc + (p.complianceScore || 0), 0) /
          (loadedProjects.filter((p: VBAProject) => p.complianceScore !== undefined).length || 1)
        ) : 0,
        virtualInspectorUsage: loadedProjects.length > 0 ? Math.round(
          (loadedProjects.filter((p: VBAProject) => p.virtualInspectorEnabled).length / loadedProjects.length) * 100
        ) : 0,
        timesSaved: 0
      }

      setInspectionStats(stats)
    } catch (error) {
      console.error('Failed to load VBA projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.inspector.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-gray-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'scheduled':
        return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase()
    if (cond.includes('clear') || cond.includes('sun')) return <Sun className="h-16 w-16" />
    if (cond.includes('rain') || cond.includes('drizzle')) return <CloudRain className="h-16 w-16" />
    if (cond.includes('snow')) return <CloudSnow className="h-16 w-16" />
    return <Cloud className="h-16 w-16" />
  }

  const getSmallWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase()
    if (cond.includes('clear') || cond.includes('sun')) return <Sun className="h-4 w-4" />
    if (cond.includes('rain') || cond.includes('drizzle')) return <CloudRain className="h-4 w-4" />
    if (cond.includes('snow')) return <CloudSnow className="h-4 w-4" />
    return <Cloud className="h-4 w-4" />
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center">Virtual Building Authority</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weather Widget */}
        <div 
          className="relative rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
          onClick={() => window.open('https://earth.nullschool.net/', '_blank')}
          style={{
            background: weatherData.condition.toLowerCase().includes('rain') 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : weatherData.condition.toLowerCase().includes('cloud')
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : weatherData.condition.toLowerCase().includes('clear') || weatherData.condition.toLowerCase().includes('sun')
              ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '320px'
          }}
        >
          {/* Animated background effect */}
          <div className="absolute inset-0 opacity-20">
            {weatherData.condition.toLowerCase().includes('rain') && (
              <div className="absolute inset-0" style={{
                backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)`,
                animation: 'rain 1s linear infinite',
              }}></div>
            )}
            {(weatherData.condition.toLowerCase().includes('clear') || weatherData.condition.toLowerCase().includes('sun')) && (
              <div className="absolute top-8 right-8">
                <div className="w-32 h-32 bg-yellow-300 rounded-full opacity-50 blur-xl animate-pulse"></div>
              </div>
            )}
            {weatherData.condition.toLowerCase().includes('cloud') && (
              <div className="absolute inset-0">
                <div className="absolute top-4 left-8 w-24 h-16 bg-white rounded-full opacity-20 blur-md"></div>
                <div className="absolute top-12 right-12 w-32 h-20 bg-white rounded-full opacity-15 blur-lg"></div>
                <div className="absolute bottom-8 left-16 w-28 h-18 bg-white rounded-full opacity-10 blur-md"></div>
              </div>
            )}
          </div>

          <div className="relative z-10 p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Fort Myers</span>
                <span className="ml-2 text-xs bg-white/20 backdrop-blur px-2 py-1 rounded-full">Live Weather</span>
              </div>
              <ExternalLink className="h-4 w-4 opacity-70" />
            </div>
            
            {weatherLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="opacity-90">
                    {getWeatherIcon(weatherData.condition)}
                  </div>
                  <div>
                    <div className="text-6xl font-bold tracking-tight">{weatherData.temp}°</div>
                    <div className="text-lg font-medium opacity-90">{weatherData.condition}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs opacity-80 mb-1">
                  <Wind className="h-3 w-3" />
                  Feels like
                </div>
                <div className="text-xl font-semibold">{weatherData.feelsLike}°</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs opacity-80 mb-1">
                  <Droplets className="h-3 w-3" />
                  Humidity
                </div>
                <div className="text-xl font-semibold">{weatherData.humidity}%</div>
              </div>
            </div>

            <div className="space-y-2 bg-black/20 backdrop-blur rounded-lg p-3">
              {weatherData.forecast.map((day) => (
                <div key={day.day} className="flex items-center justify-between text-sm">
                  <span className="opacity-80 font-medium">{day.day}</span>
                  <div className="opacity-90">{getSmallWeatherIcon(day.condition)}</div>
                  <span className="font-semibold">{day.high}° / <span className="opacity-70">{day.low}°</span></span>
                </div>
              ))}
            </div>
          </div>

          <style jsx>{`
            @keyframes rain {
              0% {
                transform: translateY(-100%);
              }
              100% {
                transform: translateY(100%);
              }
            }
          `}</style>
        </div>

        {/* This Week Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
            This Week
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Inspections Completed</span>
                <span className="text-lg font-semibold text-gray-900">{weeklyMetrics.completed}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${Math.min(weeklyMetrics.completed * 10, 100)}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Scheduled This Week</span>
                <span className="text-lg font-semibold text-gray-900">{weeklyMetrics.scheduled}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(weeklyMetrics.scheduled * 10, 100)}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Pass Rate</span>
                <span className="text-lg font-semibold text-gray-900">{weeklyMetrics.passRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${weeklyMetrics.passRate}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Compliance Average</span>
                <span className="text-lg font-semibold text-gray-900">{weeklyMetrics.complianceAvg}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${weeklyMetrics.complianceAvg}%` }}></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/vba/inspection-guidelines" className="flex items-center gap-2 text-sm text-gray-600 hover:text-sky-600">
                <FileText className="h-4 w-4" />
                Inspection Guidelines
              </Link>
              <Link href="/vba/compliance-standards" className="flex items-center gap-2 text-sm text-gray-600 hover:text-sky-600">
                <Shield className="h-4 w-4" />
                Compliance Standards
              </Link>
              <Link href="/vba/inspector-directory" className="flex items-center gap-2 text-sm text-gray-600 hover:text-sky-600">
                <Users className="h-4 w-4" />
                Inspector Directory
              </Link>
            </div>
          </div>
        </div>

        {/* Construction News */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
            Construction AI & Industry News
            <Newspaper className="h-5 w-5 text-gray-400" />
          </h3>

          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => setSelectedNewsCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                selectedNewsCategory === 'all' 
                  ? 'bg-sky-100 text-sky-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setSelectedNewsCategory('ai')}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                selectedNewsCategory === 'ai' 
                  ? 'bg-sky-100 text-sky-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              AI & Tech
            </button>
            <button 
              onClick={() => setSelectedNewsCategory('general')}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                selectedNewsCategory === 'general' 
                  ? 'bg-sky-100 text-sky-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              General
            </button>
            <button 
              onClick={() => setSelectedNewsCategory('updates')}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                selectedNewsCategory === 'updates' 
                  ? 'bg-sky-100 text-sky-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Updates
            </button>
          </div>

          <div className="space-y-4">
            {newsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">Loading news...</p>
              </div>
            ) : newsItems.length === 0 ? (
              <p className="text-center py-8 text-gray-500 text-sm">No news available</p>
            ) : (
              newsItems
                .filter(news => selectedNewsCategory === 'all' || news.category.toLowerCase().includes(selectedNewsCategory.toLowerCase()))
                .map((news) => (
                  <div key={news.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <h4 
                      className="text-sm font-medium text-gray-900 mb-1 hover:text-sky-600 cursor-pointer line-clamp-2"
                      onClick={() => news.url && window.open(news.url, '_blank')}
                    >
                      {news.title}
                    </h4>
                    {news.description && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{news.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">ai</span>
                      <span>{news.source}</span>
                      <span>•</span>
                      <span>{news.date}</span>
                    </div>
                  </div>
                ))
            )}
          </div>

          <Link href="/vba/news" className="mt-4 flex items-center justify-center gap-2 text-sm text-sky-600 hover:text-sky-700">
            View More Construction AI News
            <ArrowUp className="h-4 w-4 rotate-90" />
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search inspections..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select
          className="px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        
        <button className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <Filter className="h-5 w-5" />
          More Filters
        </button>
        
        <button className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <Download className="h-5 w-5" />
          Export
        </button>
      </div>

      {/* Inspection Projects Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Inspection Projects</h2>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="inline-flex items-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Project
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Job #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Date Added
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading inspections...</p>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-24 text-center">
                    <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No inspections found</p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr 
                    key={project.id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                      onClick={() => {
                        console.log('Navigating to:', `/vba/project/${project.id}`)
                        router.push(`/vba/project/${project.id}`)
                      }}
                    >
                      {project.jobNumber || `J${project.id.slice(-4)}`}
                    </td>
                    <td 
                      className="px-6 py-4 cursor-pointer"
                      onClick={() => {
                        console.log('Navigating to:', `/vba/project/${project.id}`)
                        router.push(`/vba/project/${project.id}`)
                      }}
                    >
                      <div className="text-sm font-medium text-gray-900 hover:text-sky-600">
                        {project.projectName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{project.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center justify-between">
                        <span>{new Date(project.scheduledDate).toLocaleDateString()}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedProjectForSchedule(project)
                            setShowScheduleModal(true)
                          }}
                          className="ml-4 p-1 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded"
                          title="Schedule Inspection"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI-Powered Inspections */}
      <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI-Powered Inspections</h3>
              <p className="text-white/80">Use computer vision to automatically detect compliance issues</p>
            </div>
          </div>
          <button className="bg-white text-purple-600 px-6 py-2 rounded-lg hover:bg-gray-100 font-medium transition-colors">
            Learn More
          </button>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <NewProjectModal 
          onClose={() => setShowNewProjectModal(false)}
          onSave={(newProject) => {
            const updatedProjects = [newProject, ...projects]
            setProjects(updatedProjects)
            localStorage.setItem('vba-projects', JSON.stringify(updatedProjects))
            setShowNewProjectModal(false)
          }}
        />
      )}

      {/* Schedule Inspection Modal */}
      {showScheduleModal && selectedProjectForSchedule && (
        <ScheduleInspectionModal
          project={selectedProjectForSchedule}
          contacts={contacts}
          onClose={() => {
            setShowScheduleModal(false)
            setSelectedProjectForSchedule(null)
          }}
          onSave={(schedule) => {
            const updatedSchedules = [...inspectionSchedules, schedule]
            setInspectionSchedules(updatedSchedules)
            localStorage.setItem('vba-inspection-schedules', JSON.stringify(updatedSchedules))
            
            // Update the project's inspection events
            const eventKey = `vba-events-${selectedProjectForSchedule.id}`
            const existingEvents = localStorage.getItem(eventKey)
            const events = existingEvents ? JSON.parse(existingEvents) : []
            
            const newEvent = {
              id: schedule.id,
              title: schedule.inspectionType,
              date: new Date(`${schedule.date}T${schedule.time}`),
              type: schedule.inspectionType,
              status: 'scheduled' as const
            }
            
            events.push(newEvent)
            localStorage.setItem(eventKey, JSON.stringify(events))
            
            setShowScheduleModal(false)
            setSelectedProjectForSchedule(null)
          }}
        />
      )}
    </div>
  )
}

// Inspection types list
const INSPECTION_TYPES = [
  'Pre Construction',
  'Permit Review',
  'Site Survey',
  'Demolition',
  'Silt Fence',
  'UG Plumbing',
  'UG Electrical',
  'UG Gas',
  'Compaction',
  'Termite Pre-Treatment',
  'Footings',
  'Slab',
  'Stem Wall',
  'Post-Tension',
  'Mono Slab',
  'Column',
  'Tie Beam',
  'Lintel',
  'Elevated Slab',
  'Truss/Framing',
  'Framing',
  'Sheathing Nailing',
  'Strapping/Hardware',
  'Wind Mitigation',
  'Window Bucks',
  'Waterproofing',
  'Window Installation',
  'Door Installation',
  'Door/Window Flashing',
  'Roofing Dry-In',
  'Roofing Nailer',
  'Roofing Final',
  'Stucco Lathe',
  'Rough Electrical',
  'Rough Plumbing',
  'Rough Low Voltage/Security',
  'Rough HVAC',
  'Water Meter(Utility)',
  'Duct Pressure Test',
  'Fireplace',
  'Wall Insulation',
  'Attic Insulation',
  'Sound Insulation(STC)',
  'Fire-Penetration',
  'Drywall Screw Pattern',
  'Drywall',
  'Final Electrical',
  'Final Plumbing',
  'Final HVAC',
  'Final Low Voltage',
  'Back-Flow Preventer',
  'Duct Blaster Test',
  'Fire Sprinkler',
  'Fire Alarm',
  'Grading/Drainage',
  'Elevator',
  'Meter Equipment',
  'Transfer Switch',
  'Storm Shutters',
  'Fence',
  'Accessibility',
  'Handrails',
  'Egress',
  'Landscaping/Egress',
  'Final Building',
  'Pool Shell',
  'Pool Plumbing Rough',
  'Pool Bonding',
  'Pool Shell II (Pre-Gunite)',
  'Pool Deck',
  'Pool Equipment',
  'Pool Gas',
  'Pool Alarms',
  'Pool Final'
]

// New Project Modal Component
function NewProjectModal({ onClose, onSave }: { onClose: () => void; onSave: (project: VBAProject) => void }) {
  const [projectData, setProjectData] = useState({
    projectName: '',
    address: '',
    jobNumber: '',
    owner: '',
    contractor: '',
    projectType: 'Commercial'
  })
  const [selectedInspections, setSelectedInspections] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newProject: VBAProject = {
      id: Date.now().toString(),
      jobNumber: projectData.jobNumber,
      projectName: projectData.projectName,
      address: projectData.address,
      inspectionType: selectedInspections.join(', '),
      status: 'scheduled',
      scheduledDate: new Date().toISOString(),
      inspector: '',
      completionRate: 0,
      lastUpdated: new Date().toISOString(),
      virtualInspectorEnabled: false,
      photoCount: 0,
      violations: 0,
      selectedInspections: selectedInspections
    }

    onSave(newProject)
  }

  const toggleInspection = (inspection: string) => {
    setSelectedInspections(prev =>
      prev.includes(inspection)
        ? prev.filter(i => i !== inspection)
        : [...prev, inspection]
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">New VBA Inspection Project</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Number</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={projectData.jobNumber}
                onChange={(e) => setProjectData({ ...projectData, jobNumber: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={projectData.projectName}
                onChange={(e) => setProjectData({ ...projectData, projectName: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={projectData.address}
                onChange={(e) => setProjectData({ ...projectData, address: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={projectData.owner}
                onChange={(e) => setProjectData({ ...projectData, owner: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contractor</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={projectData.contractor}
                onChange={(e) => setProjectData({ ...projectData, contractor: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Applicable Inspections</label>
            <div className="border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INSPECTION_TYPES.map((inspection) => (
                  <label key={inspection} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-sky-600 focus:ring-sky-500"
                      checked={selectedInspections.includes(inspection)}
                      onChange={() => toggleInspection(inspection)}
                    />
                    <span className="text-sm text-gray-700">{inspection}</span>
                  </label>
                ))}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Selected: {selectedInspections.length} inspection{selectedInspections.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
              disabled={!projectData.projectName || !projectData.jobNumber || selectedInspections.length === 0}
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Schedule Inspection Modal Component
function ScheduleInspectionModal({ 
  project, 
  contacts, 
  onClose, 
  onSave 
}: { 
  project: VBAProject
  contacts: Contact[]
  onClose: () => void
  onSave: (schedule: InspectionSchedule) => void 
}) {
  const [scheduleData, setScheduleData] = useState({
    inspectionType: '',
    date: '',
    time: '',
    assignedTo: '',
    assignedToEmail: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const selectedContact = contacts.find(c => c.id === scheduleData.assignedTo)
    
    const newSchedule: InspectionSchedule = {
      id: Date.now().toString(),
      projectId: project.id,
      inspectionType: scheduleData.inspectionType,
      date: scheduleData.date,
      time: scheduleData.time,
      assignedTo: selectedContact?.name || '',
      assignedToEmail: selectedContact?.email,
      status: 'scheduled'
    }

    onSave(newSchedule)
  }

  const handleContactSelect = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId)
    setScheduleData({
      ...scheduleData,
      assignedTo: contactId,
      assignedToEmail: contact?.email || ''
    })
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Schedule Inspection</h3>
          <p className="text-sm text-gray-600 mt-1">
            Project: {project.projectName} - {project.address}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inspection Type
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={scheduleData.inspectionType}
                onChange={(e) => setScheduleData({ ...scheduleData, inspectionType: e.target.value })}
                required
              >
                <option value="">Select inspection type</option>
                {project.selectedInspections?.map((inspection) => (
                  <option key={inspection} value={inspection}>
                    {inspection}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={scheduleData.date}
                  min={today}
                  onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={scheduleData.time}
                  onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Inspector & Send Notification To:
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={scheduleData.assignedTo}
                onChange={(e) => handleContactSelect(e.target.value)}
                required
              >
                <option value="">Select inspector</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name} - {contact.role || 'Inspector'} ({contact.email})
                  </option>
                ))}
              </select>
              {scheduleData.assignedToEmail && (
                <p className="mt-2 text-sm text-gray-600">
                  Notification will be sent to: {scheduleData.assignedToEmail}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                rows={3}
                value={scheduleData.notes}
                onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                placeholder="Any special instructions or notes for the inspection..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
              disabled={!scheduleData.inspectionType || !scheduleData.date || !scheduleData.time || !scheduleData.assignedTo}
            >
              Schedule & Send Notification
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}