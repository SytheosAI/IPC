import { CheckCircle, XCircle, Copy, Key, X } from 'lucide-react'

interface Integration {
  id: string
  name: string
  category: string
  description: string
  icon: string
  connected: boolean
  status: 'active' | 'inactive' | 'error'
  lastSync?: string
}

interface ApiKey {
  id: string
  name: string
  key: string
  created: string
  lastUsed: string
  permissions: string[]
}

interface IntegrationsTabProps {
  integrations: Integration[]
  handleIntegrationToggle: (id: string) => void
  apiKeys: ApiKey[]
  setApiKeys: (keys: ApiKey[]) => void
  generateApiKey: () => void
}

export default function IntegrationsTab({
  integrations,
  handleIntegrationToggle,
  apiKeys,
  setApiKeys,
  generateApiKey
}: IntegrationsTabProps) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Integrations & API</h2>
      
      <div className="space-y-8">
        {/* Connected Integrations */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Available Integrations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{integration.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{integration.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{integration.category}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{integration.description}</p>
                      {integration.connected && (
                        <div className="flex items-center gap-2 mt-2">
                          {integration.status === 'active' && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {integration.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                          <span className="text-xs text-gray-500">Last sync: {integration.lastSync}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleIntegrationToggle(integration.id)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      integration.connected 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                    }`}
                  >
                    {integration.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Keys */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">API Keys</h3>
          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{apiKey.name}</h4>
                    <div className="flex items-center gap-4 mt-2">
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {apiKey.key.substring(0, 20)}...
                      </code>
                      <button 
                        onClick={() => navigator.clipboard.writeText(apiKey.key)}
                        className="text-sky-600 hover:text-sky-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Created: {apiKey.created}</span>
                      <span>Last used: {apiKey.lastUsed}</span>
                      <span>Permissions: {apiKey.permissions.join(', ')}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setApiKeys(apiKeys.filter(k => k.id !== apiKey.id))}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={generateApiKey}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-sky-500 hover:text-sky-600 transition-colors"
            >
              <div className="flex items-center justify-center gap-2">
                <Key className="h-4 w-4" />
                Generate New API Key
              </div>
            </button>
          </div>
        </div>

        {/* Webhook Configuration */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Webhook Endpoints</h3>
          <div className="space-y-3">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                placeholder="https://your-server.com/webhook"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <div className="mt-3 space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Project created</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Inspection completed</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Report generated</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}