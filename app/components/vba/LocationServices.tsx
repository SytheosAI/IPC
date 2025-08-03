'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, Navigation, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface Location {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: Date
}

interface GeofenceZone {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number // in meters
  projectId?: string
}

interface LocationServicesProps {
  projectId?: string
  onCheckIn?: (location: Location) => void
  onGeofenceEnter?: (zone: GeofenceZone) => void
  onGeofenceExit?: (zone: GeofenceZone) => void
  zones?: GeofenceZone[]
}

export default function LocationServices({
  projectId,
  onCheckIn,
  onGeofenceEnter,
  onGeofenceExit,
  zones = []
}: LocationServicesProps) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [checkInHistory, setCheckInHistory] = useState<Location[]>([])
  const [activeZones, setActiveZones] = useState<Set<string>>(new Set())
  const [watchId, setWatchId] = useState<number | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt')

  useEffect(() => {
    checkLocationPermission()
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [])

  const checkLocationPermission = async () => {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' })
        setPermissionStatus(result.state as any)
        
        result.addEventListener('change', () => {
          setPermissionStatus(result.state as any)
        })
      } catch (error) {
        console.error('Permission check failed:', error)
      }
    }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
  }

  const checkGeofences = useCallback((location: Location) => {
    const newActiveZones = new Set<string>()

    zones.forEach(zone => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        zone.latitude,
        zone.longitude
      )

      const isInZone = distance <= zone.radius
      const wasInZone = activeZones.has(zone.id)

      if (isInZone) {
        newActiveZones.add(zone.id)
        
        if (!wasInZone && onGeofenceEnter) {
          onGeofenceEnter(zone)
          
          // Send notification
          if ('Notification' in window && Notification.permission === 'granted') {
            const notificationOptions: any = {
              body: `You've arrived at ${zone.name}`,
              icon: '/icons/icon-192x192.png',
              badge: '/icons/badge-72x72.png',
              vibrate: [200, 100, 200]
            }
            new Notification('Arrived at Inspection Site', notificationOptions)
          }
        }
      } else if (wasInZone && onGeofenceExit) {
        onGeofenceExit(zone)
      }
    })

    setActiveZones(newActiveZones)
  }, [zones, activeZones, onGeofenceEnter, onGeofenceExit])

  const startLocationTracking = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your device')
      return
    }

    setIsTracking(true)
    setLocationError(null)

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date()
        }

        setCurrentLocation(location)
        checkGeofences(location)
        
        // Store in localStorage for offline access
        const locationHistory = JSON.parse(
          localStorage.getItem(`vba-location-history-${projectId}`) || '[]'
        )
        locationHistory.push(location)
        localStorage.setItem(
          `vba-location-history-${projectId}`,
          JSON.stringify(locationHistory.slice(-100)) // Keep last 100 locations
        )
      },
      (error) => {
        let errorMessage = 'Unable to get location'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        setLocationError(errorMessage)
        setIsTracking(false)
      },
      options
    )

    setWatchId(id)
  }

  const stopLocationTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
    setIsTracking(false)
  }

  const performCheckIn = () => {
    if (!currentLocation) {
      getCurrentLocation()
      return
    }

    const checkIn = { ...currentLocation, timestamp: new Date() }
    setCheckInHistory(prev => [...prev, checkIn])
    
    // Store check-in
    const checkIns = JSON.parse(
      localStorage.getItem(`vba-checkins-${projectId}`) || '[]'
    )
    checkIns.push(checkIn)
    localStorage.setItem(`vba-checkins-${projectId}`, JSON.stringify(checkIns))
    
    if (onCheckIn) {
      onCheckIn(checkIn)
    }

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Check-in Successful', {
        body: `Location recorded at ${new Date().toLocaleTimeString()}`,
        icon: '/icons/icon-192x192.png'
      })
    }
  }

  const getCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your device')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date()
        }
        setCurrentLocation(location)
        setLocationError(null)
      },
      (error) => {
        setLocationError('Unable to get current location')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    )
  }

  const formatCoordinates = (lat: number, lon: number) => {
    return `${lat.toFixed(6)}°, ${lon.toFixed(6)}°`
  }

  const getGoogleMapsUrl = (lat: number, lon: number) => {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      {/* Location Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${currentLocation ? 'bg-green-100' : 'bg-gray-100'}`}>
            <MapPin className={`h-5 w-5 ${currentLocation ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Location Services</h3>
            <p className="text-sm text-gray-500">
              {permissionStatus === 'granted' ? 'Enabled' : 
               permissionStatus === 'denied' ? 'Disabled' : 'Not configured'}
            </p>
          </div>
        </div>
        
        {isTracking ? (
          <button
            onClick={stopLocationTracking}
            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm"
          >
            Stop Tracking
          </button>
        ) : (
          <button
            onClick={startLocationTracking}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm"
          >
            Start Tracking
          </button>
        )}
      </div>

      {/* Current Location */}
      {currentLocation && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">Current Location</p>
              <p className="text-xs text-gray-600">
                {formatCoordinates(currentLocation.latitude, currentLocation.longitude)}
              </p>
              <p className="text-xs text-gray-500">
                Accuracy: ±{currentLocation.accuracy.toFixed(0)}m
              </p>
            </div>
            <a
              href={getGoogleMapsUrl(currentLocation.latitude, currentLocation.longitude)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700"
            >
              <Navigation className="h-5 w-5" />
            </a>
          </div>
        </div>
      )}

      {/* Check-in Button */}
      <button
        onClick={performCheckIn}
        disabled={!currentLocation}
        className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
          currentLocation
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        <CheckCircle className="h-5 w-5" />
        Check In at Current Location
      </button>

      {/* Active Geofences */}
      {activeZones.size > 0 && (
        <div className="border-t pt-3">
          <p className="text-sm font-medium text-gray-900 mb-2">Active Zones</p>
          <div className="space-y-1">
            {Array.from(activeZones).map(zoneId => {
              const zone = zones.find(z => z.id === zoneId)
              return zone ? (
                <div key={zone.id} className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>{zone.name}</span>
                </div>
              ) : null
            })}
          </div>
        </div>
      )}

      {/* Check-in History */}
      {checkInHistory.length > 0 && (
        <div className="border-t pt-3">
          <p className="text-sm font-medium text-gray-900 mb-2">Recent Check-ins</p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {checkInHistory.slice(-3).reverse().map((checkIn, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="h-3 w-3" />
                <span>{new Date(checkIn.timestamp).toLocaleTimeString()}</span>
                <span className="text-gray-400">•</span>
                <span>±{checkIn.accuracy.toFixed(0)}m</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {locationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-800">{locationError}</p>
            {permissionStatus === 'denied' && (
              <p className="text-xs text-red-600 mt-1">
                Please enable location services in your device settings
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}