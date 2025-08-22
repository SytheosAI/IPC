import { Search, Download, RefreshCw, BarChart3, TrendingUp, Users, Clock, PieChart } from 'lucide-react'

interface ActivityLog {
  id: string
  timestamp: string
  user: string
  action: string
  details: string
  type: 'login' | 'create' | 'update' | 'delete' | 'view' | 'export'
  status: 'success' | 'warning' | 'error'
}

interface ActivityTabProps {
  activityLogs: ActivityLog[]
  activityFilter: string
  setActivityFilter: (filter: string) => void
  activitySearch: string
  setActivitySearch: (search: string) => void
  activityMetrics: {
    totalActions: number
    successRate: number
    activeUsers: number
    peakHour: string
    mostCommonAction: string
  }
}

export default function ActivityTab({
  activityLogs,
  activityFilter,
  setActivityFilter,
  activitySearch,
  setActivitySearch,
  activityMetrics
}: ActivityTabProps) {
  const filteredLogs = activityLogs.filter(log => {
    const matchesFilter = activityFilter === 'all' || log.type === activityFilter
    const matchesSearch = log.action.toLowerCase().includes(activitySearch.toLowerCase()) ||
                         log.user.toLowerCase().includes(activitySearch.toLowerCase()) ||
                         log.details.toLowerCase().includes(activitySearch.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Activity Log</h2>
      
      {/* Activity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Actions</span>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activityMetrics.totalActions.toLocaleString()}</div>
          <div className="text-xs text-green-600 mt-1">+12% from last month</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activityMetrics.successRate}%</div>
          <div className="text-xs text-gray-500 mt-1">All operations</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span>
            <Users className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activityMetrics.activeUsers}</div>
          <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Peak Hour</span>
            <Clock className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{activityMetrics.peakHour}</div>
          <div className="text-xs text-gray-500 mt-1">Most active time</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Common Action</span>
            <PieChart className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{activityMetrics.mostCommonAction}</div>
          <div className="text-xs text-gray-500 mt-1">Most frequent</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {['all', 'login', 'create', 'update', 'delete', 'export'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActivityFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activityFilter === filter
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Details
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {log.user}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {log.action}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {log.details}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    log.status === 'success' ? 'bg-green-100 text-green-800' :
                    log.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export Options */}
      <div className="flex justify-end mt-4 gap-2">
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>
    </div>
  )
}