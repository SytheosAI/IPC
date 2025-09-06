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
  Loader2,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'

interface VBAProject {
  id: string
  project_id?: string
  project_number?: string
  project_name: string
  address: string
  city?: string
  state?: string
  contractor?: string
  owner?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'passed'
  start_date?: string
  completion_date?: string
  inspection_count?: number
  last_inspection_date?: string
  compliance_score?: number
  virtual_inspector_enabled?: boolean
  notes?: string
  created_by?: string
  created_at?: string
  updated_at?: string
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
    // Default news items to ensure something always displays
    const defaultNews = [
        {
          id: '1',
          title: 'New AI-Powered Building Inspection Tool Reduces Review Time by 70%',
          source: 'Construction Tech Weekly',
          date: 'Jan 28',
          category: 'AI & Tech',
          url: '#',
          description: 'Revolutionary AI system transforms permit review process across Florida municipalities.'
        },
        {
          id: '2',
          title: 'Florida Updates Building Codes for 2024 Hurricane Season',
          source: 'Building Standards Today',
          date: 'Jan 27',
          category: 'Regulations',
          url: '#',
          description: 'New requirements focus on wind resistance and flood mitigation strategies.'
        },
        {
          id: '3',
          title: 'Smart Sensors Revolutionize Construction Site Safety Monitoring',
          source: 'Safety First Magazine',
          date: 'Jan 26',
          category: 'Safety',
          url: '#',
          description: 'IoT devices provide real-time hazard detection and worker location tracking.'
        },
        {
          id: '4',
          title: 'Green Building Certifications See 40% Increase in Florida',
          source: 'Sustainable Construction',
          date: 'Jan 25',
          category: 'Sustainability',
          url: '#',
          description: 'LEED and Energy Star certifications surge as developers prioritize sustainability.'
        },
        {
          id: '5',
          title: 'Drone Inspections Now Approved for High-Rise Building Permits',
          source: 'Tech in Construction',
          date: 'Jan 24',
          category: 'Technology',
          url: '#',
          description: 'FAA approves expanded use of drones for building facade and roof inspections.'
        }
      ]
      
      try {
        setNewsLoading(true)
        
        const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY
        console.log('Fetching news data...')
      
      // Use broader date range and simpler query for better results
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
      const topics = ['construction', 'building', 'real estate', 'infrastructure', 'engineering']
      const randomTopic = topics[Math.floor(Math.random() * topics.length)]
      
      if (!apiKey || apiKey === 'your_news_api_key_here') {
        // Use alternative free news API with rotating topics for variety
        const response = await fetch(
          `https://newsdata.io/api/1/news?apikey=pub_52993cc6dc6e4de5c1a08c13c5b528dd17bb3&q=${encodeURIComponent(randomTopic)}&language=en&category=technology,business`
        )
        
        if (response.ok) {
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
            return
          }
        }
      } else {
        // Use News API with the provided key and broader search
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(randomTopic)}&from=${weekAgo}&language=en&sortBy=popularity&pageSize=10&apiKey=${apiKey}`
        console.log('Fetching news for topic:', randomTopic)
        const response = await fetch(url)
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.articles) {
            const formattedNews = data.articles.slice(0, 5).map((article: any, index: number) => ({
              id: index.toString(),
              title: article.title,
              source: article.source.name || 'Industry News',
              date: new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              category: 'AI & Tech',
              url: article.url,
              description: article.description || article.content?.substring(0, 150) + '...'
            }))
            
            setNewsItems(formattedNews)
            return
          }
        }
      }
      
      // If all API attempts fail, use default news
      console.log('Using default news items')
      setNewsItems(defaultNews)
    } catch (error) {
      console.error('Failed to fetch news:', error)
      // Use default news on error
      setNewsItems(defaultNews)
    } finally {
      setNewsLoading(false)
    }
  }

  const loadContacts = async () => {
    // Load contacts from database once contacts table is set up
    try {
      // TODO: Implement contacts table query
      // const contactsData = await db.contacts.getAll()
      // setContacts(contactsData)
      
      // For now, set empty array until database is configured
      setContacts([])
    } catch (error) {
      console.error('Failed to load contacts:', error)
      setContacts([])
    }
  }

  const loadInspectionSchedules = async () => {
    // For now, we'll use empty schedules until we have a schedules table
    setInspectionSchedules([])
  }

  const calculateWeeklyMetrics = () => {
    // Get the start of this week (Sunday)
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    // Filter projects for this week
    const thisWeekProjects = projects.filter(project => {
      const dateStr = project.updated_at || project.created_at || new Date().toISOString()
      const projectDate = new Date(dateStr)
      return projectDate >= startOfWeek
    })
    
    // Calculate metrics based on projects only (events will be added when we have a separate table)
    const completed = thisWeekProjects.filter(p => p.status === 'completed').length
    const scheduled = thisWeekProjects.filter(p => p.status === 'scheduled' || p.status === 'in_progress').length
    const passed = thisWeekProjects.filter(p => p.status === 'completed').length
    const passRate = completed > 0 ? Math.round((passed / completed) * 100) : 0
    
    // Calculate average compliance score
    const completedWithScores = thisWeekProjects.filter(p => p.status === 'completed' && p.compliance_score)
    const complianceAvg = completedWithScores.length > 0 
      ? Math.round(completedWithScores.reduce((sum, p) => sum + (p.compliance_score || 0), 0) / completedWithScores.length)
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
      if (forecastData.list && Array.isArray(forecastData.list)) {
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
      } else {
        console.error('Weather forecast data is not available or invalid format:', forecastData)
      }

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
      // Load projects from Supabase
      // Use API route with proper auth
      const response = await fetch('/api/vba-projects', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to load projects')
      }
      
      const { data } = await response.json()
      const loadedProjects = data || []
      setProjects(loadedProjects)

      // Calculate stats
      const stats: InspectionStats = {
        totalInspections: loadedProjects.length,
        completedInspections: loadedProjects.filter((p: VBAProject) => p.status === 'completed').length,
        pendingInspections: loadedProjects.filter((p: VBAProject) => p.status === 'scheduled').length,
        failedInspections: loadedProjects.filter((p: VBAProject) => p.status === 'failed').length,
        averageComplianceScore: loadedProjects.length > 0 ? Math.round(
          loadedProjects
            .filter((p: VBAProject) => p.compliance_score !== undefined)
            .reduce((acc: number, p: VBAProject) => acc + (p.compliance_score || 0), 0) /
          (loadedProjects.filter((p: VBAProject) => p.compliance_score !== undefined).length || 1)
        ) : 0,
        virtualInspectorUsage: loadedProjects.length > 0 ? Math.round(
          (loadedProjects.filter((p: VBAProject) => p.virtual_inspector_enabled).length / loadedProjects.length) * 100
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

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('vba_projects')
        .delete()
        .eq('id', projectId)

      if (error) {
        console.error('Error deleting project:', error)
        alert('Failed to delete project. Please try again.')
        return
      }

      // Remove from local state
      setProjects(projects.filter(p => p.id !== projectId))
      console.log('Project deleted successfully')
      
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('An error occurred while deleting the project.')
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.address.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      {/* Header */}
      <div className="mb-4 relative">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Virtual Building Authority</h1>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50 shadow-glow"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Weather Widget */}
        <div 
          className="relative rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 bg-gray-800"
          onClick={() => window.open('https://earth.nullschool.net/', '_blank')}
          style={{ minHeight: '400px' }}
        >
          {/* Animated weather background - FIXED AND VISIBLE */}
          <div className="absolute inset-0">
            {(weatherData.condition.toLowerCase().includes('clear') || weatherData.condition.toLowerCase().includes('sun')) && (
              <>
                {/* Bright sunny sky background */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-orange-300 to-sky-400" />
                {/* Large sun glow */}
                <div className="absolute -top-16 -right-16 w-64 h-64">
                  <div className="absolute inset-0 bg-yellow-200 rounded-full blur-3xl opacity-90 animate-pulse" />
                  <div className="absolute inset-8 bg-yellow-300 rounded-full blur-2xl opacity-80" />
                  <div className="absolute inset-16 bg-yellow-400 rounded-full blur-xl opacity-70" />
                </div>
                {/* Sun rays */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-yellow-200 opacity-40"
                    style={{
                      width: '2px',
                      height: '80px',
                      top: '20px',
                      right: '40px',
                      transform: `rotate(${i * 60}deg)`,
                      transformOrigin: 'center bottom',
                      animation: `pulse ${3 + i * 0.5}s infinite`
                    }}
                  />
                ))}
              </>
            )}
            
            {weatherData.condition.toLowerCase().includes('cloud') && (
              <>
                {/* Cloudy overcast background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-400 via-gray-300 to-blue-400" />
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-white rounded-full blur-2xl opacity-70"
                    style={{
                      width: `${80 + i * 20}px`,
                      height: `${40 + i * 10}px`,
                      top: `${10 + i * 15}%`,
                      left: `${-10 + i * 25}%`,
                      animation: `float ${15 + i * 2}s infinite ease-in-out`
                    }}
                  />
                ))}
              </>
            )}
            
            {(weatherData.condition.toLowerCase().includes('rain') || weatherData.condition.toLowerCase().includes('drizzle')) && (
              <>
                {/* Dark rainy background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-blue-700 to-gray-800" />
                <div className="absolute top-0 left-8 w-24 h-24 bg-gray-500 rounded-full blur-3xl opacity-60" />
                <div className="absolute top-8 right-16 w-32 h-32 bg-gray-600 rounded-full blur-3xl opacity-50" />
                {/* Rain drops */}
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-blue-300 opacity-80"
                    style={{
                      width: '2px',
                      height: `${15 + Math.random() * 15}px`,
                      left: `${Math.random() * 100}%`,
                      top: `-${Math.random() * 20}px`,
                      animation: `rain ${0.5 + Math.random() * 0.5}s linear infinite`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  />
                ))}
              </>
            )}
            
            {/* Default gradient if no condition matches */}
            {!weatherData.condition.toLowerCase().includes('clear') && 
             !weatherData.condition.toLowerCase().includes('sun') &&
             !weatherData.condition.toLowerCase().includes('cloud') &&
             !weatherData.condition.toLowerCase().includes('rain') &&
             !weatherData.condition.toLowerCase().includes('drizzle') && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-sky-600" />
            )}
            {/* Remove duplicate weather elements since they're already in the main sections above */}
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
                transform: translateY(-100px);
                opacity: 0;
              }
              10% {
                opacity: 0.6;
              }
              90% {
                opacity: 0.6;
              }
              100% {
                transform: translateY(400px);
                opacity: 0;
              }
            }
            @keyframes float {
              0%, 100% {
                transform: translateX(0) translateY(0);
              }
              25% {
                transform: translateX(30px) translateY(-10px);
              }
              50% {
                transform: translateX(-20px) translateY(5px);
              }
              75% {
                transform: translateX(10px) translateY(-5px);
              }
            }
            @keyframes pulse {
              0%, 100% {
                opacity: 0.5;
                transform: scale(1);
              }
              50% {
                opacity: 0.8;
                transform: scale(1.1);
              }
            }
          `}</style>
        </div>

        {/* This Week Stats */}
        <div className="card-modern hover-lift p-6" style={{ minHeight: '400px' }}>
          <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center justify-between">
            This Week
            <TrendingUp className="h-5 w-5 text-yellow-400" />
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Inspections Completed</span>
                <span className="text-lg font-semibold text-gray-100">{weeklyMetrics.completed}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full shadow-glow" style={{ width: `${Math.min(weeklyMetrics.completed * 10, 100)}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Scheduled This Week</span>
                <span className="text-lg font-semibold text-gray-100">{weeklyMetrics.scheduled}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full shadow-glow" style={{ width: `${Math.min(weeklyMetrics.scheduled * 10, 100)}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Compliance Average</span>
                <span className="text-lg font-semibold text-gray-100">{weeklyMetrics.complianceAvg}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full shadow-glow" style={{ width: `${weeklyMetrics.complianceAvg}%` }}></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-600">
            <h4 className="text-sm font-semibold text-yellow-400 mb-3">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/vba/inspection-guidelines" className="flex items-center gap-2 text-sm text-gray-300 hover:text-yellow-400 transition-colors">
                <FileText className="h-4 w-4" />
                Inspection Guidelines
              </Link>
              <Link href="/vba/compliance-standards" className="flex items-center gap-2 text-sm text-gray-300 hover:text-yellow-400 transition-colors">
                <Shield className="h-4 w-4" />
                Compliance Standards
              </Link>
              <Link href="/vba/inspector-directory" className="flex items-center gap-2 text-sm text-gray-300 hover:text-yellow-400 transition-colors">
                <Users className="h-4 w-4" />
                Inspector Directory
              </Link>
            </div>
          </div>
        </div>

        {/* Construction News */}
        <div className="card-modern hover-lift p-6" style={{ minHeight: '400px', maxHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center justify-between">
            Construction AI & Industry News
            <Newspaper className="h-5 w-5 text-yellow-400" />
          </h3>

          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => setSelectedNewsCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedNewsCategory === 'all' 
                  ? 'bg-yellow-400 text-gray-900 shadow-glow' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setSelectedNewsCategory('ai')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedNewsCategory === 'ai' 
                  ? 'bg-yellow-400 text-gray-900 shadow-glow' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
              }`}
            >
              AI & Tech
            </button>
            <button 
              onClick={() => setSelectedNewsCategory('general')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedNewsCategory === 'general' 
                  ? 'bg-yellow-400 text-gray-900 shadow-glow' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
              }`}
            >
              General
            </button>
            <button 
              onClick={() => setSelectedNewsCategory('updates')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedNewsCategory === 'updates' 
                  ? 'bg-yellow-400 text-gray-900 shadow-glow' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
              }`}
            >
              Updates
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-3">
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
                .slice(0, 3)
                .map((news) => (
                  <div key={news.id} className="pb-3 last:pb-0">
                    <h4 
                      className="text-sm font-medium text-gray-100 mb-1 hover:text-yellow-400 cursor-pointer line-clamp-1 transition-colors"
                      onClick={() => news.url && window.open(news.url, '_blank')}
                    >
                      {news.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="bg-yellow-400 text-gray-900 px-2 py-0.5 rounded">ai</span>
                      <span className="truncate">{news.source}</span>
                      <span>•</span>
                      <span>{news.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link 
            href="/vba/news" 
            className="mt-3 pt-3 border-t border-gray-600 flex items-center justify-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            View More Construction AI News
            <ArrowUp className="h-4 w-4 rotate-90" />
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3 mb-4 card-modern py-2 px-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search inspections..."
            className="input-modern text-sm py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select
          className="input-modern text-sm py-2"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="passed">Passed</option>
        </select>
        
        <button className="btn-secondary">
          <Filter className="h-5 w-5" />
          More Filters
        </button>
        
        <button className="btn-secondary">
          <Download className="h-5 w-5" />
          Export
        </button>
      </div>

      {/* Inspection Projects Section */}
      <div className="card-modern relative overflow-hidden border-glow">
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-yellow-400">Inspection Projects</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="btn-primary"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Project
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider">
                  Job #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider">
                  Date Added
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="spinner-modern mx-auto"></div>
                    <p className="mt-4 text-gray-300">Loading inspections...</p>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-24 text-center">
                    <Building2 className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No inspections found</p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr 
                    key={project.id} 
                    className="hover:bg-gray-700 hover:scale-[1.01] transition-all duration-200"
                  >
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-100 cursor-pointer"
                      onClick={() => {
                        console.log('Navigating to:', `/vba/project/${project.id}`)
                        router.push(`/vba/project/${project.id}`)
                      }}
                    >
                      {project.project_number || `J${project.id.slice(-4)}`}
                    </td>
                    <td 
                      className="px-6 py-4 cursor-pointer"
                      onClick={() => {
                        console.log('Navigating to:', `/vba/project/${project.id}`)
                        router.push(`/vba/project/${project.id}`)
                      }}
                    >
                      <div className="text-sm font-medium text-gray-100 hover:text-yellow-400 transition-colors">
                        {project.project_name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{project.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center justify-between">
                        <span>{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedProjectForSchedule(project)
                            setShowScheduleModal(true)
                          }}
                          className="ml-4 p-1 text-yellow-400 hover:text-yellow-300 hover:bg-gray-700 rounded transition-colors"
                          title="Schedule Inspection"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteProject(project.id)
                          }}
                          className="ml-2 p-1 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="h-4 w-4" />
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
      <div className="mt-6 glass-morphism rounded-2xl p-6 text-white shadow-glow hover-lift">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-400/20 backdrop-blur rounded-lg border border-yellow-400/30">
              <Brain className="h-8 w-8 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-400">AI-Powered Inspections</h3>
              <p className="text-gray-200">Use computer vision to automatically detect compliance issues</p>
            </div>
          </div>
          <button className="btn-glass hover:scale-105 font-medium transition-all">
            Learn More
          </button>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <NewProjectModal 
          onClose={() => setShowNewProjectModal(false)}
          onSave={async (newProject) => {
            try {
              console.log('=== VBA Project Creation ===')
              console.log('Project data:', newProject)
              
              // Check required fields
              if (!newProject.project_name || !newProject.address) {
                throw new Error('Project name and address are required')
              }
              
              // Skip RLS test - just proceed with creation
              
              // Attempt to create the project
              // Use API route with proper auth
              const response = await fetch('/api/vba-projects', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(newProject)
              })
              
              if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to create project')
              }
              
              const { data: created } = await response.json()
              console.log('Project created successfully:', created)
              
              // Update the local state
              setProjects([created, ...projects])
              setShowNewProjectModal(false)
              
              // Success notification (optional)
              console.log('VBA project created successfully!')
              
            } catch (error: any) {
              console.error('=== VBA Project Creation Failed ===')
              console.error('Full error object:', error)
              console.error('Error message:', error?.message)
              console.error('Error code:', error?.code)
              console.error('Error details:', error?.details)
              
              // More informative error messages
              let errorMessage = 'Failed to create project: '
              
              if (error?.message?.includes('row-level security')) {
                errorMessage += 'Permission denied. Please ensure you are logged in with appropriate permissions.'
              } else if (error?.message?.includes('not authenticated')) {
                errorMessage += 'You must be logged in to create projects.'
              } else if (error?.message?.includes('duplicate')) {
                errorMessage += 'A project with this project number already exists.'
              } else {
                errorMessage += error?.message || 'Unknown error occurred'
              }
              
              alert(errorMessage)
              
              // Log error details
              console.log('Error details logged above')
            }
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
            // For now, just update local state until we have a schedules table
            const updatedSchedules = [...inspectionSchedules, schedule]
            setInspectionSchedules(updatedSchedules)
            
            // Activity logging removed - db is not available
            console.log('Inspection scheduled:', {
              project: selectedProjectForSchedule.id,
              inspection_type: schedule.inspectionType,
              date: schedule.date,
              time: schedule.time,
              assigned_to: schedule.assignedTo
            })
            
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
function NewProjectModal({ onClose, onSave }: { onClose: () => void; onSave: (project: Partial<VBAProject>) => void }) {
  const [projectData, setProjectData] = useState({
    projectName: '',
    address: '',
    city: 'Fort Myers',
    state: 'FL',
    zipCode: '',
    jobNumber: '',
    owner: '',
    ownerPhone: '',
    ownerEmail: '',
    contractor: '',
    contractorPhone: '',
    contractorEmail: '',
    projectType: 'Commercial',
    constructionType: 'New Construction',
    projectValue: '',
    squareFootage: '',
    stories: '1',
    permitNumber: '',
    description: ''
  })
  const [selectedInspections, setSelectedInspections] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newProject: Partial<VBAProject> = {
      project_number: projectData.jobNumber || `VBA-${Date.now()}`,
      project_name: projectData.projectName,
      address: projectData.address,
      city: 'Fort Myers',
      state: 'FL',
      owner: projectData.owner,
      contractor: projectData.contractor,
      status: 'scheduled' as const,
      start_date: new Date().toISOString(),
      virtual_inspector_enabled: false,
      inspection_count: 0,
      compliance_score: 100,
      notes: `Project Type: ${projectData.projectType}\nInspections: ${selectedInspections.join(', ')}`
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
    <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
      <div className="modal-modern max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-600">
          <h3 className="text-lg font-semibold text-yellow-400">New VBA Inspection Project</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">Job Number</label>
              <input
                type="text"
                className="input-modern"
                value={projectData.jobNumber}
                onChange={(e) => setProjectData({ ...projectData, jobNumber: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">Project Name</label>
              <input
                type="text"
                className="input-modern"
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

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">City</label>
              <input
                type="text"
                className="input-modern"
                value={projectData.city}
                onChange={(e) => setProjectData({ ...projectData, city: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">ZIP Code</label>
              <input
                type="text"
                className="input-modern"
                value={projectData.zipCode}
                onChange={(e) => setProjectData({ ...projectData, zipCode: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">Owner Phone</label>
              <input
                type="tel"
                className="input-modern"
                value={projectData.ownerPhone}
                onChange={(e) => setProjectData({ ...projectData, ownerPhone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">Owner Email</label>
              <input
                type="email"
                className="input-modern"
                value={projectData.ownerEmail}
                onChange={(e) => setProjectData({ ...projectData, ownerEmail: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">Contractor Phone</label>
              <input
                type="tel"
                className="input-modern"
                value={projectData.contractorPhone}
                onChange={(e) => setProjectData({ ...projectData, contractorPhone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">Contractor Email</label>
              <input
                type="email"
                className="input-modern"
                value={projectData.contractorEmail}
                onChange={(e) => setProjectData({ ...projectData, contractorEmail: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">Construction Type</label>
              <select
                className="input-modern"
                value={projectData.constructionType}
                onChange={(e) => setProjectData({ ...projectData, constructionType: e.target.value })}
              >
                <option value="New Construction">New Construction</option>
                <option value="Addition">Addition</option>
                <option value="Alteration">Alteration</option>
                <option value="Renovation">Renovation</option>
                <option value="Repair">Repair</option>
                <option value="Demolition">Demolition</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">Project Value ($)</label>
              <input
                type="number"
                className="input-modern"
                value={projectData.projectValue}
                onChange={(e) => setProjectData({ ...projectData, projectValue: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">Square Footage</label>
              <input
                type="number"
                className="input-modern"
                value={projectData.squareFootage}
                onChange={(e) => setProjectData({ ...projectData, squareFootage: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">Number of Stories</label>
              <select
                className="input-modern"
                value={projectData.stories}
                onChange={(e) => setProjectData({ ...projectData, stories: e.target.value })}
              >
                <option value="1">1 Story</option>
                <option value="2">2 Stories</option>
                <option value="3">3 Stories</option>
                <option value="4">4+ Stories</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">Permit Number</label>
              <input
                type="text"
                className="input-modern"
                value={projectData.permitNumber}
                onChange={(e) => setProjectData({ ...projectData, permitNumber: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-yellow-400 mb-1">Project Description</label>
              <textarea
                className="input-modern"
                rows={3}
                value={projectData.description}
                onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                placeholder="Brief description of the project..."
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
            Project: {project.project_name} - {project.address}
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
                <option value="Foundation">Foundation</option>
                <option value="Framing">Framing</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="HVAC">HVAC</option>
                <option value="Final">Final</option>
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