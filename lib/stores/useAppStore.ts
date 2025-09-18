import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  // UI State
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
  
  // Notifications
  notifications: Notification[]
  unreadCount: number
  
  // Search
  globalSearchQuery: string
  searchResults: SearchResult[]
  isSearching: boolean
  
  // Actions
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  markNotificationAsRead: (id: string) => void
  clearNotifications: () => void
  setGlobalSearch: (query: string) => void
  performGlobalSearch: (query: string) => Promise<void>
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
}

export interface SearchResult {
  id: string
  type: 'project' | 'inspection' | 'document' | 'submittal' | 'contact'
  title: string
  description: string
  url: string
  relevance: number
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      sidebarCollapsed: false,
      theme: 'system',
      notifications: [],
      unreadCount: 0,
      globalSearchQuery: '',
      searchResults: [],
      isSearching: false,
      
      // Actions
      toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      setTheme: (theme) => set({ theme }),
      
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          read: false
        }
        set(state => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1
        }))
      },
      
      markNotificationAsRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        }))
      },
      
      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
      
      setGlobalSearch: (query) => set({ globalSearchQuery: query }),
      
      performGlobalSearch: async (query) => {
        set({ isSearching: true, globalSearchQuery: query })
        
        try {
          // Search across all tables using Supabase
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
          const results = await response.json()
          
          set({ 
            searchResults: results, 
            isSearching: false 
          })
        } catch (error) {
          console.error('Search failed:', error)
          set({ isSearching: false })
        }
      }
    }),
    {
      name: 'ipc-app-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        notifications: state.notifications,
        unreadCount: state.unreadCount
      })
    }
  )
)