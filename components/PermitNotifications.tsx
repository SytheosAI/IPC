'use client'

import { useState, useEffect } from 'react'
import {
  Bell,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  DollarSign,
  X,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { PortalIntegrationManager, PermitData, PermitStatus } from '@/lib/permit-portal-integration'

interface Notification {
  id: string
  type: 'status_change' | 'inspection' | 'document' | 'fee' | 'expiration'
  severity: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  permitNumber?: string
  jurisdiction?: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

export default function PermitNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [autoSync, setAutoSync] = useState(true)
  const [syncInterval, setSyncInterval] = useState(15) // minutes
  const [lastSync, setLastSync] = useState<Date>(new Date())
  const [syncing, setSyncing] = useState(false)

  // Load notifications from localStorage or API
  useEffect(() => {
    loadNotifications()
    if (autoSync) {
      const interval = setInterval(syncPermits, syncInterval * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [autoSync, syncInterval])

  // Update unread count
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications])

  const loadNotifications = async () => {
    // Load from localStorage for now (would be from API in production)
    const stored = localStorage.getItem('permit_notifications')
    if (stored) {
      setNotifications(JSON.parse(stored))
    } else {
      // Sample notifications for demo
      const sampleNotifications: Notification[] = [
        {
          id: '1',
          type: 'status_change',
          severity: 'success',
          title: 'Permit Approved',
          message: 'Building permit #2024-BP-001 has been approved by Lee County',
          permitNumber: '2024-BP-001',
          jurisdiction: 'lee-county',
          timestamp: new Date().toISOString(),
          read: false,
          actionUrl: '/projects/123'
        },
        {
          id: '2',
          type: 'inspection',
          severity: 'info',
          title: 'Inspection Scheduled',
          message: 'Foundation inspection scheduled for tomorrow at 10:00 AM',
          permitNumber: '2024-BP-002',
          jurisdiction: 'fort-myers',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false
        },
        {
          id: '3',
          type: 'document',
          severity: 'warning',
          title: 'Document Required',
          message: 'Additional documents requested for permit #2024-BP-003',
          permitNumber: '2024-BP-003',
          jurisdiction: 'cape-coral',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: false
        },
        {
          id: '4',
          type: 'fee',
          severity: 'warning',
          title: 'Payment Due',
          message: 'Permit fees of $1,250.00 due by end of week',
          permitNumber: '2024-BP-004',
          jurisdiction: 'collier',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          read: true
        },
        {
          id: '5',
          type: 'expiration',
          severity: 'error',
          title: 'Permit Expiring Soon',
          message: 'Permit #2024-BP-005 expires in 7 days. Request extension if needed.',
          permitNumber: '2024-BP-005',
          jurisdiction: 'sarasota',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          read: false
        }
      ]
      setNotifications(sampleNotifications)
      localStorage.setItem('permit_notifications', JSON.stringify(sampleNotifications))
    }
  }

  const syncPermits = async () => {
    setSyncing(true)
    try {
      // Initialize portal integration manager
      const manager = new PortalIntegrationManager()
      await manager.initializeIntegrations()
      
      // Sync all active permits
      await manager.syncAllPermits()
      
      // Check for changes and create notifications
      // This would compare with previous state and generate notifications
      
      setLastSync(new Date())
      
      // Add a sync success notification
      const syncNotification: Notification = {
        id: Date.now().toString(),
        type: 'status_change',
        severity: 'info',
        title: 'Permits Synced',
        message: `Successfully synced permits at ${new Date().toLocaleTimeString()}`,
        timestamp: new Date().toISOString(),
        read: false
      }
      
      setNotifications(prev => [syncNotification, ...prev])
    } catch (error) {
      console.error('Failed to sync permits:', error)
      
      // Add error notification
      const errorNotification: Notification = {
        id: Date.now().toString(),
        type: 'status_change',
        severity: 'error',
        title: 'Sync Failed',
        message: 'Failed to sync permits. Check your API credentials.',
        timestamp: new Date().toISOString(),
        read: false
      }
      
      setNotifications(prev => [errorNotification, ...prev])
    } finally {
      setSyncing(false)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    // Save to localStorage
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n)
    localStorage.setItem('permit_notifications', JSON.stringify(updated))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    const updated = notifications.map(n => ({ ...n, read: true }))
    localStorage.setItem('permit_notifications', JSON.stringify(updated))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    const updated = notifications.filter(n => n.id !== id)
    localStorage.setItem('permit_notifications', JSON.stringify(updated))
  }

  const clearAll = () => {
    setNotifications([])
    localStorage.removeItem('permit_notifications')
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'status_change':
        return <CheckCircle className="h-5 w-5" />
      case 'inspection':
        return <Calendar className="h-5 w-5" />
      case 'document':
        return <FileText className="h-5 w-5" />
      case 'fee':
        return <DollarSign className="h-5 w-5" />
      case 'expiration':
        return <Clock className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getSeverityColor = (severity: Notification['severity']) => {
    switch (severity) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString()
  }

  return (
    <>
      {/* Notification Bell Icon */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black bg-opacity-25"
            onClick={() => setShowPanel(false)}
          />
          
          <div className="relative w-full max-w-md h-full bg-white dark:bg-gray-800 shadow-xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Permit Notifications
                </h2>
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Sync Controls */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSync}
                      onChange={(e) => setAutoSync(e.target.checked)}
                      className="rounded text-sky-600"
                    />
                    <span className="text-gray-600 dark:text-gray-400">Auto-sync</span>
                  </label>
                  {autoSync && (
                    <select
                      value={syncInterval}
                      onChange={(e) => setSyncInterval(Number(e.target.value))}
                      className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                    >
                      <option value={5}>5 min</option>
                      <option value={15}>15 min</option>
                      <option value={30}>30 min</option>
                      <option value={60}>1 hour</option>
                    </select>
                  )}
                </div>
                
                <button
                  onClick={syncPermits}
                  disabled={syncing}
                  className="flex items-center gap-1 text-sky-600 hover:text-sky-700 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Last synced: {formatTimestamp(lastSync.toISOString())}
              </div>

              {/* Actions */}
              {notifications.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-sky-600 hover:text-sky-700"
                  >
                    Mark all as read
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <button
                    onClick={clearAll}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Bell className="h-12 w-12 mb-3 opacity-20" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
                        !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg ${getSeverityColor(notification.severity)}`}>
                          {getIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              
                              {notification.permitNumber && (
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    {notification.permitNumber}
                                  </span>
                                  {notification.jurisdiction && (
                                    <span className="text-xs text-gray-500">
                                      {notification.jurisdiction.replace('-', ' ')}
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                
                                {notification.actionUrl && (
                                  <a
                                    href={notification.actionUrl}
                                    className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1"
                                  >
                                    View
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4 text-gray-400" />
                            </button>
                          </div>
                          
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-sky-600 hover:text-sky-700 mt-2"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}