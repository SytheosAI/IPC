'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Building, Clock, CheckCircle, AlertTriangle, TrendingUp, 
  Calendar, MapPin, Camera, FileText, Users, BarChart3,
  RefreshCw, ChevronRight, Activity
} from 'lucide-react'

interface DashboardWidget {
  id: string
  type: 'stat' | 'chart' | 'list' | 'map'
  title: string
  data: any
}

interface MobileDashboardProps {
  projectId?: string
}

export default function MobileDashboard({ projectId }: MobileDashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [activeWidget, setActiveWidget] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [pullDistance, setPullDistance] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadDashboardData()
  }, [projectId])

  const loadDashboardData = async () => {
    // Simulate loading dashboard data
    const mockWidgets: DashboardWidget[] = [
      {
        id: '1',
        type: 'stat',
        title: 'Today\'s Overview',
        data: {
          inspections: 5,
          completed: 3,
          pending: 2,
          issues: 1
        }
      },
      {
        id: '2',
        type: 'chart',
        title: 'Weekly Progress',
        data: {
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          values: [4, 6, 3, 8, 5]
        }
      },
      {
        id: '3',
        type: 'list',
        title: 'Recent Inspections',
        data: [
          { id: '1', name: 'Electrical - Building A', status: 'completed', time: '2 hours ago' },
          { id: '2', name: 'Plumbing - Unit 203', status: 'in_progress', time: '30 min ago' },
          { id: '3', name: 'Structural - Foundation', status: 'scheduled', time: 'in 1 hour' }
        ]
      }
    ]
    
    setWidgets(mockWidgets)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setPullDistance(0)
    
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1500))
    await loadDashboardData()
    
    setIsRefreshing(false)
  }

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // Pull to refresh
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      const touch = e.targetTouches[0]
      const distance = touch.clientY - 100 // Adjust for initial touch position
      if (distance > 0 && distance < 150) {
        setPullDistance(distance)
      }
    }
    
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = async () => {
    // Handle pull to refresh
    if (pullDistance > 80 && !isRefreshing) {
      await handleRefresh()
    } else {
      setPullDistance(0)
    }
    
    // Handle swipe
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && activeWidget < widgets.length - 1) {
      setActiveWidget(prev => prev + 1)
    }
    if (isRightSwipe && activeWidget > 0) {
      setActiveWidget(prev => prev - 1)
    }
  }

  const StatWidget = ({ data }: { data: any }) => (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-blue-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <Building className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-blue-900">{data.inspections}</span>
        </div>
        <p className="text-sm text-blue-700">Total Inspections</p>
      </div>
      
      <div className="bg-green-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <span className="text-2xl font-bold text-green-900">{data.completed}</span>
        </div>
        <p className="text-sm text-green-700">Completed</p>
      </div>
      
      <div className="bg-yellow-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <Clock className="h-8 w-8 text-yellow-600" />
          <span className="text-2xl font-bold text-yellow-900">{data.pending}</span>
        </div>
        <p className="text-sm text-yellow-700">Pending</p>
      </div>
      
      <div className="bg-red-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          <span className="text-2xl font-bold text-red-900">{data.issues}</span>
        </div>
        <p className="text-sm text-red-700">Issues Found</p>
      </div>
    </div>
  )

  const ChartWidget = ({ data }: { data: any }) => (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Inspections This Week</h3>
        <BarChart3 className="h-5 w-5 text-gray-400" />
      </div>
      <div className="flex items-end justify-between h-32 gap-2">
        {data.days.map((day: string, index: number) => (
          <div key={day} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-blue-500 rounded-t"
              style={{ height: `${(data.values[index] / 10) * 100}%` }}
            />
            <span className="text-xs text-gray-600 mt-1">{day}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const ListWidget = ({ data }: { data: any[] }) => (
    <div className="space-y-3">
      {data.map(item => (
        <div key={item.id} className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{item.name}</h4>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${
                item.status === 'completed' ? 'bg-green-100 text-green-700' :
                item.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {item.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-500">{item.time}</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      ))}
    </div>
  )

  return (
    <div 
      ref={containerRef}
      className="relative h-full overflow-y-auto overscroll-contain"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-blue-50 transition-all"
          style={{ height: `${pullDistance}px` }}
        >
          <div className={`${isRefreshing ? 'animate-spin' : ''}`}>
            <RefreshCw className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      )}

      <div className="p-4 pb-20" style={{ marginTop: pullDistance > 0 ? `${pullDistance}px` : 0 }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">VBA Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <button className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-200">
            <Camera className="h-6 w-6 text-blue-600 mb-1" />
            <span className="text-xs text-gray-700">Photo</span>
          </button>
          <button className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-200">
            <MapPin className="h-6 w-6 text-green-600 mb-1" />
            <span className="text-xs text-gray-700">Check In</span>
          </button>
          <button className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-200">
            <FileText className="h-6 w-6 text-purple-600 mb-1" />
            <span className="text-xs text-gray-700">Report</span>
          </button>
          <button className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-200">
            <Calendar className="h-6 w-6 text-orange-600 mb-1" />
            <span className="text-xs text-gray-700">Schedule</span>
          </button>
        </div>

        {/* Swipeable Widgets */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {widgets[activeWidget]?.title || 'Loading...'}
            </h2>
            <div className="flex gap-1">
              {widgets.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === activeWidget ? 'w-6 bg-blue-600' : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="min-h-[200px]">
            {widgets[activeWidget]?.type === 'stat' && (
              <StatWidget data={widgets[activeWidget].data} />
            )}
            {widgets[activeWidget]?.type === 'chart' && (
              <ChartWidget data={widgets[activeWidget].data} />
            )}
            {widgets[activeWidget]?.type === 'list' && (
              <ListWidget data={widgets[activeWidget].data} />
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">John Smith completed electrical inspection</p>
                <p className="text-xs text-gray-500">Building A - 15 min ago</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">All inspections passed for Unit 502</p>
                <p className="text-xs text-gray-500">45 min ago</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Issue flagged in plumbing inspection</p>
                <p className="text-xs text-gray-500">Unit 203 - 1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}