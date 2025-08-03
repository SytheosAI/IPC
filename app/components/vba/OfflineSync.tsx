'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudOff, RefreshCw, Check, AlertTriangle, Wifi, WifiOff } from 'lucide-react'

interface SyncItem {
  id: string
  type: 'inspection' | 'photo' | 'signature' | 'checklist' | 'message'
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: Date
  synced: boolean
  retries: number
}

interface OfflineSyncProps {
  projectId: string
  onSyncComplete?: () => void
}

export default function OfflineSync({ projectId, onSyncComplete }: OfflineSyncProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [dataUsage, setDataUsage] = useState({ sent: 0, received: 0 })
  const [compressionEnabled, setCompressionEnabled] = useState(true)

  useEffect(() => {
    // Load sync queue from IndexedDB
    loadSyncQueue()
    
    // Set up online/offline listeners
    const handleOnline = () => {
      setIsOnline(true)
      // Auto-sync when coming online
      performSync()
    }
    
    const handleOffline = () => {
      setIsOnline(false)
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Register background sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        // Use any type to access sync property
        const reg: any = registration
        if (reg.sync) {
          return reg.sync.register('sync-inspections')
        }
      })
    }
    
    // Set up periodic sync
    const syncInterval = setInterval(() => {
      if (isOnline && syncQueue.length > 0) {
        performSync()
      }
    }, 30000) // Every 30 seconds
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(syncInterval)
    }
  }, [syncQueue, isOnline])

  const loadSyncQueue = async () => {
    // Use IndexedDB for better offline storage
    const db = await openDatabase()
    const transaction = db.transaction(['syncQueue'], 'readonly')
    const store = transaction.objectStore('syncQueue')
    const request = store.getAll()
    
    request.onsuccess = () => {
      setSyncQueue(request.result.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      })))
    }
  }

  const openDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('VBAOfflineDB', 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id' })
        }
        
        if (!db.objectStoreNames.contains('cachedData')) {
          db.createObjectStore('cachedData', { keyPath: 'key' })
        }
      }
    })
  }

  const addToSyncQueue = async (item: Omit<SyncItem, 'id' | 'synced' | 'retries'>) => {
    const syncItem: SyncItem = {
      ...item,
      id: `${Date.now()}-${Math.random()}`,
      synced: false,
      retries: 0
    }
    
    // Save to IndexedDB
    const db = await openDatabase()
    const transaction = db.transaction(['syncQueue'], 'readwrite')
    const store = transaction.objectStore('syncQueue')
    store.add(syncItem)
    
    setSyncQueue(prev => [...prev, syncItem])
    
    // Try to sync immediately if online
    if (isOnline) {
      performSync()
    }
  }

  const compressData = (data: any): string => {
    if (!compressionEnabled) {
      return JSON.stringify(data)
    }
    
    // Simple compression using base64 encoding
    // In production, use a proper compression library like pako
    const jsonStr = JSON.stringify(data)
    const compressed = btoa(encodeURIComponent(jsonStr))
    
    // Only use compressed if it's actually smaller
    return compressed.length < jsonStr.length ? compressed : jsonStr
  }

  const performSync = async () => {
    if (isSyncing || !isOnline || syncQueue.length === 0) return
    
    setIsSyncing(true)
    setSyncProgress(0)
    
    const itemsToSync = syncQueue.filter(item => !item.synced && item.retries < 3)
    const totalItems = itemsToSync.length
    
    for (let i = 0; i < itemsToSync.length; i++) {
      const item = itemsToSync[i]
      
      try {
        // Compress data
        const compressedData = compressData(item.data)
        const originalSize = JSON.stringify(item.data).length
        const compressedSize = compressedData.length
        
        // Simulate API call
        await simulateApiCall(item, compressedData)
        
        // Update sync status
        await updateSyncStatus(item.id, true)
        
        // Update data usage
        setDataUsage(prev => ({
          sent: prev.sent + compressedSize,
          received: prev.received + 100 // Simulate response size
        }))
        
        setSyncProgress(((i + 1) / totalItems) * 100)
      } catch (error) {
        console.error('Sync failed for item:', item.id, error)
        
        // Increment retry count
        await updateSyncStatus(item.id, false, item.retries + 1)
      }
    }
    
    setLastSyncTime(new Date())
    setIsSyncing(false)
    setSyncProgress(0)
    
    // Reload queue
    await loadSyncQueue()
    
    if (onSyncComplete) {
      onSyncComplete()
    }
  }

  const simulateApiCall = (item: SyncItem, data: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 95% success rate
        if (Math.random() > 0.05) {
          resolve()
        } else {
          reject(new Error('Network error'))
        }
      }, 500 + Math.random() * 1000)
    })
  }

  const updateSyncStatus = async (id: string, synced: boolean, retries?: number) => {
    const db = await openDatabase()
    const transaction = db.transaction(['syncQueue'], 'readwrite')
    const store = transaction.objectStore('syncQueue')
    
    const request = store.get(id)
    request.onsuccess = () => {
      const item = request.result
      if (item) {
        item.synced = synced
        if (retries !== undefined) {
          item.retries = retries
        }
        store.put(item)
      }
    }
  }

  const clearSyncedItems = async () => {
    const db = await openDatabase()
    const transaction = db.transaction(['syncQueue'], 'readwrite')
    const store = transaction.objectStore('syncQueue')
    
    const request = store.getAll()
    request.onsuccess = () => {
      const items = request.result
      items.forEach((item: SyncItem) => {
        if (item.synced) {
          store.delete(item.id)
        }
      })
      
      loadSyncQueue()
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getQueueStats = () => {
    const pending = syncQueue.filter(item => !item.synced).length
    const failed = syncQueue.filter(item => !item.synced && item.retries >= 3).length
    const synced = syncQueue.filter(item => item.synced).length
    
    return { pending, failed, synced }
  }

  const stats = getQueueStats()

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Offline Sync</h3>
            <p className="text-sm text-gray-500">
              {isOnline ? 'Connected' : 'Working Offline'}
            </p>
          </div>
        </div>
        
        <button
          onClick={performSync}
          disabled={!isOnline || isSyncing || stats.pending === 0}
          className={`p-2 rounded-lg ${
            isOnline && !isSyncing && stats.pending > 0
              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          <RefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Sync Progress */}
      {isSyncing && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Syncing...</span>
            <span className="font-medium">{Math.round(syncProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${syncProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Queue Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-xs text-gray-600">Pending</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{stats.synced}</p>
          <p className="text-xs text-green-700">Synced</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          <p className="text-xs text-red-700">Failed</p>
        </div>
      </div>

      {/* Data Usage */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Data Usage</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-600">Sent</p>
            <p className="font-medium text-gray-900">{formatBytes(dataUsage.sent)}</p>
          </div>
          <div>
            <p className="text-gray-600">Received</p>
            <p className="font-medium text-gray-900">{formatBytes(dataUsage.received)}</p>
          </div>
        </div>
      </div>

      {/* Compression Toggle */}
      <div className="mb-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg">
        <div>
          <p className="text-sm font-medium text-blue-900">Data Compression</p>
          <p className="text-xs text-blue-700">Reduce data usage on slow connections</p>
        </div>
        <button
          onClick={() => setCompressionEnabled(!compressionEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            compressionEnabled ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              compressionEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Last Sync Time */}
      {lastSyncTime && (
        <div className="text-center text-sm text-gray-500">
          Last synced: {lastSyncTime.toLocaleTimeString()}
        </div>
      )}

      {/* Clear Synced Button */}
      {stats.synced > 0 && (
        <button
          onClick={clearSyncedItems}
          className="w-full mt-3 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Clear {stats.synced} synced items
        </button>
      )}

      {/* Offline Warning */}
      {!isOnline && stats.pending > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800">
              {stats.pending} items waiting to sync
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Data will sync automatically when connection is restored
            </p>
          </div>
        </div>
      )}
    </div>
  )
}