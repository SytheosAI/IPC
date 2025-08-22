'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Send, Paperclip, Image, MapPin, Users, Circle, 
  MoreVertical, Check, CheckCheck, Edit2, X, Download
} from 'lucide-react'

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'location' | 'annotation'
  attachments?: any[]
  read: boolean
  location?: { lat: number; lng: number }
}

interface TeamMember {
  id: string
  name: string
  role: string
  status: 'online' | 'offline' | 'busy'
  location?: { lat: number; lng: number }
  lastSeen?: Date
}

interface Annotation {
  id: string
  x: number
  y: number
  text: string
  author: string
  timestamp: Date
}

interface CollaborationHubProps {
  projectId: string
  currentUserId: string
  currentUserName: string
}

export default function CollaborationHub({
  projectId,
  currentUserId,
  currentUserName
}: CollaborationHubProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'team' | 'photos'>('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [isAnnotating, setIsAnnotating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadCollaborationData()
    simulateTeamActivity()
    
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadCollaborationData = () => {
    // TODO: Load messages from Supabase database instead of localStorage
    // const { data: messages } = await supabase
    //   .from('collaboration_messages')
    //   .select('*')
    //   .eq('project_id', projectId)
    //   .order('timestamp', { ascending: true })
    // if (messages) {
    //   setMessages(messages.map((m: any) => ({
    //     ...m,
    //     timestamp: new Date(m.timestamp)
    //   })))
    // }

    // Mock team members
    setTeamMembers([
      {
        id: '1',
        name: 'John Smith',
        role: 'Lead Inspector',
        status: 'online',
        location: { lat: 25.7617, lng: -80.1918 }
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        role: 'Electrical Inspector',
        status: 'busy',
        lastSeen: new Date(Date.now() - 300000)
      },
      {
        id: '3',
        name: 'Mike Chen',
        role: 'Structural Engineer',
        status: 'offline',
        lastSeen: new Date(Date.now() - 3600000)
      }
    ])
  }

  const simulateTeamActivity = () => {
    // Simulate typing indicator
    setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        // Simulate incoming message
        if (Math.random() > 0.7) {
          const incomingMessage: Message = {
            id: Date.now().toString(),
            senderId: '1',
            senderName: 'John Smith',
            content: 'Just completed the electrical inspection. Found 2 minor issues.',
            timestamp: new Date(),
            type: 'text',
            read: false
          }
          addMessage(incomingMessage)
        }
      }, 2000)
    }, 5000)
  }

  const addMessage = (message: Message) => {
    setMessages(prev => {
      const updated = [...prev, message]
      // TODO: Save message to Supabase database instead of localStorage
      // await supabase
      //   .from('collaboration_messages')
      //   .insert({
      //     project_id: projectId,
      //     sender_id: message.senderId,
      //     sender_name: message.senderName,
      //     content: message.content,
      //     type: message.type,
      //     attachments: message.attachments,
      //     read: message.read,
      //     location: message.location
      //   })
      return updated
    })
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: currentUserName,
      content: newMessage,
      timestamp: new Date(),
      type: 'text',
      read: true
    }

    addMessage(message)
    setNewMessage('')
  }

  const sendLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const message: Message = {
            id: Date.now().toString(),
            senderId: currentUserId,
            senderName: currentUserName,
            content: 'Shared location',
            timestamp: new Date(),
            type: 'location',
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            read: true
          }
          addMessage(message)
        },
        () => {
          alert('Unable to get location')
        }
      )
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageData = event.target?.result as string
      const message: Message = {
        id: Date.now().toString(),
        senderId: currentUserId,
        senderName: currentUserName,
        content: 'Shared a photo',
        timestamp: new Date(),
        type: 'image',
        attachments: [{ type: 'image', data: imageData, name: file.name }],
        read: true
      }
      addMessage(message)
    }
    reader.readAsDataURL(file)
  }

  const handleImageClick = (e: React.MouseEvent, imageUrl: string) => {
    if (!isAnnotating) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    const text = prompt('Add annotation:')
    if (!text) return

    const annotation: Annotation = {
      id: Date.now().toString(),
      x,
      y,
      text,
      author: currentUserName,
      timestamp: new Date()
    }

    setAnnotations(prev => [...prev, annotation])
    
    // Save annotation as a message
    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: currentUserName,
      content: `Added annotation: "${text}"`,
      timestamp: new Date(),
      type: 'annotation',
      attachments: [{ type: 'annotation', data: annotation, imageUrl }],
      read: true
    }
    addMessage(message)
  }

  const ChatTab = () => (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                {!isOwn && (
                  <p className="text-xs text-gray-600 mb-1">{message.senderName}</p>
                )}
                
                <div className={`rounded-lg p-3 ${
                  isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.type === 'text' && (
                    <p className="text-sm">{message.content}</p>
                  )}
                  
                  {message.type === 'image' && message.attachments && (
                    <div>
                      <img 
                        src={message.attachments[0].data} 
                        alt="Shared" 
                        className="rounded-lg max-w-full cursor-pointer"
                        onClick={() => setSelectedImage(message.attachments![0].data)}
                      />
                      <p className="text-xs mt-1 opacity-80">{message.content}</p>
                    </div>
                  )}
                  
                  {message.type === 'location' && message.location && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{message.content}</span>
                      </div>
                      <a
                        href={`https://maps.google.com/?q=${message.location.lat},${message.location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xs underline ${isOwn ? 'text-blue-100' : 'text-blue-600'}`}
                      >
                        View on map
                      </a>
                    </div>
                  )}
                </div>
                
                <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isOwn && (
                    message.read ? <CheckCheck className="h-3 w-3 text-blue-500" /> : <Check className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          )
        })}
        
        {isTyping && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm">Someone is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          
          <button
            onClick={sendLocation}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <MapPin className="h-5 w-5" />
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className={`p-2 rounded-lg ${
              newMessage.trim() 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  )

  const TeamTab = () => (
    <div className="p-4 space-y-3">
      <h3 className="font-medium text-gray-900 mb-3">Team Members</h3>
      {teamMembers.map((member) => (
        <div key={member.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-medium">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                member.status === 'online' ? 'bg-green-500' :
                member.status === 'busy' ? 'bg-yellow-500' :
                'bg-gray-400'
              }`} />
            </div>
            
            <div>
              <p className="font-medium text-gray-900">{member.name}</p>
              <p className="text-xs text-gray-600">{member.role}</p>
              {member.lastSeen && (
                <p className="text-xs text-gray-500">
                  Last seen {new Date(member.lastSeen).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          
          {member.location && (
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
              <MapPin className="h-5 w-5" />
            </button>
          )}
        </div>
      ))}
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Live Location Sharing</h4>
        <p className="text-sm text-blue-700 mb-3">
          Share your location with the team for better coordination
        </p>
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Enable Location Sharing
        </button>
      </div>
    </div>
  )

  const PhotosTab = () => (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Shared Photos</h3>
        <button
          onClick={() => setIsAnnotating(!isAnnotating)}
          className={`px-3 py-1 rounded-lg text-sm ${
            isAnnotating 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isAnnotating ? 'Done Annotating' : 'Add Annotations'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {messages
          .filter(m => m.type === 'image')
          .map((message) => (
            <div key={message.id} className="relative">
              <img
                src={message.attachments![0].data}
                alt="Shared"
                className={`w-full rounded-lg ${isAnnotating ? 'cursor-crosshair' : 'cursor-pointer'}`}
                onClick={(e) => {
                  if (isAnnotating) {
                    handleImageClick(e, message.attachments![0].data)
                  } else {
                    setSelectedImage(message.attachments![0].data)
                  }
                }}
              />
              
              {/* Show annotations */}
              {annotations
                .filter(a => message.attachments?.some(att => att.imageUrl === message.attachments![0].data))
                .map((annotation) => (
                  <div
                    key={annotation.id}
                    className="absolute w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer"
                    style={{ left: `${annotation.x}%`, top: `${annotation.y}%`, transform: 'translate(-50%, -50%)' }}
                    title={annotation.text}
                  >
                    !
                  </div>
                ))
              }
              
              <div className="mt-1">
                <p className="text-xs text-gray-600">{message.senderName}</p>
                <p className="text-xs text-gray-500">
                  {message.timestamp.toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
      }
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow-sm h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Team Collaboration</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'team'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Team
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'photos'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Photos
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && <ChatTab />}
        {activeTab === 'team' && <TeamTab />}
        {activeTab === 'photos' && <PhotosTab />}
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-full max-h-full">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
            >
              <X className="h-6 w-6" />
            </button>
            <button
              onClick={() => {
                const a = document.createElement('a')
                a.href = selectedImage
                a.download = `inspection-photo-${Date.now()}.jpg`
                a.click()
              }}
              className="absolute bottom-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
            >
              <Download className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}