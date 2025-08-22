import { Bot, Mic, Send, FileText, MessageSquare, Calendar, Zap, ChevronRight, Mail, ExternalLink } from 'lucide-react'
import { MutableRefObject } from 'react'

interface SupportTabProps {
  chatMessages: Array<{ id: string; sender: string; message: string }>
  chatInput: string
  setChatInput: (input: string) => void
  isListening: boolean
  handleChatSubmit: () => void
  startVoiceRecognition: () => void
  chatEndRef: MutableRefObject<HTMLDivElement | null>
}

export default function SupportTab({
  chatMessages,
  chatInput,
  setChatInput,
  isListening,
  handleChatSubmit,
  startVoiceRecognition,
  chatEndRef
}: SupportTabProps) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Help & Support</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Chat Assistant */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-sky-600" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">IPC Assistant</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>
          </div>
          
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender === 'user' 
                    ? 'bg-sky-600 text-white' 
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                }`}>
                  {msg.message}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                placeholder="Ask me anything about IPC..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <button
                onClick={startVoiceRecognition}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-100 text-red-600 animate-pulse' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                onClick={handleChatSubmit}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Help Resources */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Quick Help</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: FileText, label: 'User Guide', action: 'View comprehensive user documentation' },
                { icon: MessageSquare, label: 'FAQs', action: 'Browse frequently asked questions' },
                { icon: Calendar, label: 'Schedule Demo', action: 'Book a personalized walkthrough' },
                { icon: Zap, label: 'Shortcuts', action: 'Learn keyboard shortcuts' }
              ].map((item, index) => (
                <button
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <item.icon className="h-5 w-5 text-sky-600 mb-2" />
                  <div className="font-medium text-gray-900 dark:text-gray-100">{item.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.action}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Common Topics */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Popular Topics</h3>
            <div className="space-y-2">
              {[
                'How to create a new inspection project',
                'Uploading and managing documents',
                'Generating inspection reports',
                'Managing team members and permissions',
                'Using the VBA module',
                'Integrating with third-party tools'
              ].map((topic, index) => (
                <button
                  key={index}
                  className="w-full px-4 py-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between group"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">{topic}</span>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-sky-600 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Contact Support</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Email</div>
                  <div className="text-xs text-gray-500">support@ipc-app.com</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Live Chat</div>
                  <div className="text-xs text-gray-500">Available 24/7</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ExternalLink className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Knowledge Base</div>
                  <div className="text-xs text-gray-500">help.ipc-app.com</div>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">
              Submit Support Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}