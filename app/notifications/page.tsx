'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Archive, 
  Filter,
  Search,
  ExternalLink,
  Trash2,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/stores/useAppStore';
import toast from 'react-hot-toast';

interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  category: 'system' | 'inspection' | 'project' | 'security' | 'user';
}

export default function NotificationCenterPage() {
  const { notifications, markNotificationAsRead, clearNotifications, addNotification } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'info' | 'success' | 'warning' | 'error'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  // Load notifications from database on mount
  useEffect(() => {
    loadNotifications();
    
    // Set up real-time subscription for new notifications
    const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      // Load from activity logs and security events
      const [activityResponse, securityResponse] = await Promise.all([
        fetch('/api/activity-logs?limit=50'),
        fetch('/api/security-events?limit=20')
      ]);

      const activityData = await activityResponse.json();
      const securityData = await securityResponse.json();

      // Convert activity logs to notifications
      const activityNotifications = (activityData.data || []).map((log: any) => ({
        id: `activity-${log.id}`,
        type: getNotificationTypeFromAction(log.action),
        title: formatActionTitle(log.action),
        message: formatActivityMessage(log),
        timestamp: log.created_at,
        read: false,
        category: 'system',
        actionUrl: getActionUrl(log)
      }));

      // Convert security events to notifications
      const securityNotifications = (securityData.data || []).map((event: any) => ({
        id: `security-${event.id}`,
        type: event.severity === 'high' ? 'error' : event.severity === 'medium' ? 'warning' : 'info',
        title: `Security Alert: ${event.event_type}`,
        message: event.description || 'Security event detected',
        timestamp: event.created_at,
        read: false,
        category: 'security',
        actionUrl: `/security#event-${event.id}`
      }));

      // Add sample real-time notifications for demo
      const sampleNotifications = [
        {
          id: 'demo-1',
          type: 'success' as const,
          title: 'Inspection Completed',
          message: 'VBA inspection for Project #2024-001 has been completed successfully',
          timestamp: new Date().toISOString(),
          read: false,
          category: 'inspection' as const,
          actionUrl: '/vba/project/demo-1'
        },
        {
          id: 'demo-2',
          type: 'warning' as const,
          title: 'Document Upload Required',
          message: 'Missing structural drawings for permit #P2024-0156',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
          category: 'project' as const,
          actionUrl: '/projects/demo-2'
        },
        {
          id: 'demo-3',
          type: 'info' as const,
          title: 'System Maintenance',
          message: 'Scheduled maintenance window: Tonight 11 PM - 2 AM EST',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: true,
          category: 'system' as const
        }
      ];

      // Combine all notifications
      const allNotifications = [
        ...sampleNotifications,
        ...activityNotifications.slice(0, 10),
        ...securityNotifications.slice(0, 5)
      ];

      // Update store with loaded notifications
      allNotifications.forEach(notification => {
        addNotification(notification);
      });

    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const getNotificationTypeFromAction = (action: string): 'info' | 'success' | 'warning' | 'error' => {
    if (action.includes('create') || action.includes('complete')) return 'success';
    if (action.includes('error') || action.includes('fail')) return 'error';
    if (action.includes('warning') || action.includes('expire')) return 'warning';
    return 'info';
  };

  const formatActionTitle = (action: string): string => {
    return action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatActivityMessage = (log: any): string => {
    if (log.metadata) {
      if (log.action === 'create_vba_project') {
        return `New VBA project created: ${log.metadata.project_name || 'Unknown'}`;
      }
      if (log.action === 'bulk_update_vba_projects') {
        return `${log.metadata.count} VBA projects updated`;
      }
    }
    return log.action.replace(/_/g, ' ');
  };

  const getActionUrl = (log: any): string | undefined => {
    if (log.entity_type === 'vba_project' && log.entity_id) {
      return `/vba/project/${log.entity_id}`;
    }
    if (log.entity_type === 'project' && log.entity_id) {
      return `/projects/${log.entity_id}`;
    }
    return undefined;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBorder = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-green-500';
      case 'warning': return 'border-l-yellow-500';
      case 'error': return 'border-l-red-500';
      default: return 'border-l-blue-500';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    // Filter by type
    if (filter === 'unread' && notification.read) return false;
    if (filter !== 'all' && filter !== 'unread' && notification.type !== filter) return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    toast.success('Notification marked as read');
  };

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => markNotificationAsRead(id));
    setSelectedNotifications([]);
    toast.success(`${selectedNotifications.length} notifications marked as read`);
  };

  const toggleSelection = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">Notification Center</h1>
            <p className="text-gray-300">Stay updated with system activities and alerts</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFilter('unread')}
              className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors"
            >
              <Bell className="h-4 w-4 inline mr-2" />
              {notifications.filter(n => !n.read).length} Unread
            </button>
            <button
              onClick={clearNotifications}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4 inline mr-2" />
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 mb-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {['all', 'unread', 'info', 'success', 'warning', 'error'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterType
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleBulkMarkAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Mark as Read ({selectedNotifications.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No notifications found</h3>
            <p className="text-gray-500">You&apos;re all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border-l-4 border border-gray-700 ${getNotificationBorder(notification.type)} ${
                !notification.read ? 'bg-opacity-90' : 'bg-opacity-50'
              } hover:bg-gray-700/50 transition-all`}
            >
              <div className="flex items-start gap-4">
                {/* Selection Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification.id)}
                  onChange={() => toggleSelection(notification.id)}
                  className="mt-1 w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                />

                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-lg font-semibold ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                      )}
                      <span className="text-sm text-gray-400">
                        {new Date(notification.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-3">{notification.message}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {notification.actionUrl && (
                        <Link
                          href={notification.actionUrl}
                          className="inline-flex items-center gap-1 text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                        >
                          {notification.actionLabel || 'View Details'}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                          title="Mark as read"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {filteredNotifications.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={loadNotifications}
            className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <RotateCcw className="h-4 w-4 inline mr-2" />
            Refresh Notifications
          </button>
        </div>
      )}
    </div>
  );
}