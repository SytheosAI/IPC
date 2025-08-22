'use client'

import { useState, useEffect } from 'react'
import { 
  MapPin, 
  X, 
  Wind, 
  Droplets, 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Loader2 
} from 'lucide-react'

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

interface WeatherWidgetProps {
  city?: string
  lat?: number
  lon?: number
  apiKey?: string
  onClose?: () => void
  satelliteUrl?: string
}

export default function WeatherWidget({
  city = 'Fort Myers',
  lat = 26.6406,
  lon = -81.8723,
  apiKey,
  onClose,
  satelliteUrl = 'https://earth.nullschool.net/'
}: WeatherWidgetProps) {
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
  const [weatherLoading, setWeatherLoading] = useState(true)

  useEffect(() => {
    fetchWeatherData()
  }, [lat, lon, apiKey])

  const fetchWeatherData = async () => {
    try {
      setWeatherLoading(true)
      
      const key = apiKey || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
      
      if (!key) {
        console.error('Weather API key not found')
        setWeatherLoading(false)
        return
      }

      // Fetch current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=imperial`
      )
      const currentData = await currentResponse.json()

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=imperial&cnt=24`
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

  const getWeatherBackground = () => {
    const cond = weatherData.condition.toLowerCase()
    
    if (cond.includes('clear') || cond.includes('sun')) {
      return (
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-300 to-blue-400 opacity-30" />
          <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-300 rounded-full blur-2xl opacity-40 animate-pulse" />
          <div className="absolute top-5 right-5 w-40 h-40 bg-yellow-200 rounded-full blur-3xl opacity-30 animate-spin-slow" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-yellow-200 opacity-20"
              style={{
                width: '2px',
                height: '100px',
                top: `${20 + i * 15}%`,
                right: `${15 + i * 10}%`,
                transform: `rotate(${-45 + i * 15}deg)`,
                animation: `pulse ${3 + i}s infinite`
              }}
            />
          ))}
        </div>
      )
    }
    
    if (cond.includes('cloud')) {
      return (
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-400 via-gray-300 to-blue-300 opacity-30" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-gray-200 rounded-full blur-2xl opacity-30"
              style={{
                width: `${80 + i * 20}px`,
                height: `${40 + i * 10}px`,
                top: `${10 + i * 15}%`,
                left: `${-10 + i * 25}%`,
                animation: `float ${15 + i * 2}s infinite ease-in-out`
              }}
            />
          ))}
        </div>
      )
    }
    
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) {
      return (
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-600 via-gray-500 to-blue-600 opacity-30" />
          <div className="absolute top-0 left-10 w-32 h-32 bg-gray-400 rounded-full blur-3xl opacity-40" />
          <div className="absolute top-10 right-20 w-40 h-40 bg-gray-500 rounded-full blur-3xl opacity-30" />
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-blue-300 opacity-30"
              style={{
                width: '1px',
                height: `${10 + Math.random() * 20}px`,
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}px`,
                animation: `rain ${0.5 + Math.random() * 0.5}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )
    }
    
    if (cond.includes('snow')) {
      return (
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-blue-100 to-white opacity-40" />
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full opacity-60"
              style={{
                width: `${3 + Math.random() * 5}px`,
                height: `${3 + Math.random() * 5}px`,
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}px`,
                animation: `snow ${3 + Math.random() * 2}s linear infinite`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      )
    }
    
    return (
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-500 via-gray-400 to-blue-400 opacity-30" />
      </div>
    )
  }

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(30px) translateY(-10px); }
          50% { transform: translateX(-20px) translateY(5px); }
          75% { transform: translateX(10px) translateY(-5px); }
        }
        @keyframes rain {
          to { transform: translateY(calc(100% + 20px)); }
        }
        @keyframes snow {
          to { transform: translateY(calc(100% + 20px)) rotate(360deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div 
        className="relative bg-gray-800 text-white rounded-lg p-6 cursor-pointer hover:bg-gray-700 transition-colors duration-200 overflow-hidden"
        onClick={() => window.open(satelliteUrl, '_blank')}
      >
        {getWeatherBackground()}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{city}</span>
              <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded-full">Live Satellite</span>
            </div>
            {onClose && (
              <button 
                className="p-1 hover:bg-gray-700 rounded"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {weatherLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="flex items-center gap-4 mb-6">
              {getWeatherIcon(weatherData.condition)}
              <div>
                <div className="text-5xl font-bold">{weatherData.temp}°</div>
                <div className="text-sm opacity-80">{weatherData.condition}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700/50 backdrop-blur rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs opacity-70 mb-1">
                <Wind className="h-3 w-3" />
                Feels like
              </div>
              <div className="text-lg font-semibold">{weatherData.feelsLike}°</div>
            </div>
            <div className="bg-gray-700/50 backdrop-blur rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs opacity-70 mb-1">
                <Droplets className="h-3 w-3" />
                Humidity
              </div>
              <div className="text-lg font-semibold">{weatherData.humidity}%</div>
            </div>
          </div>

          <div className="space-y-2">
            {weatherData.forecast.map((day) => (
              <div key={day.day} className="flex items-center justify-between text-sm">
                <span className="opacity-70">{day.day}</span>
                {getSmallWeatherIcon(day.condition)}
                <span>{day.high}° / {day.low}°</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}