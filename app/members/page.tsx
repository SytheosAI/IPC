'use client'

import { useState } from 'react'
import { 
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Building,
  Home,
  ChevronRight,
  X,
  Shield,
  UserPlus,
  CheckCircle,
  MessageSquare,
  Send,
  Paperclip,
  FolderOpen,
  HardHat,
  Briefcase,
  UserCheck
} from 'lucide-react'

interface Member {
  id: string
  name: string
  email: string
  phone: string
  company: string
  role: string
  folder: 'team' | 'residents' | 'contractors' | 'design'
  status: 'active' | 'inactive' | 'pending'
  joinedDate: string
  lastActive: string
  avatar?: string
}

interface Message {
  id: string
  senderId: string
  senderName: string
  recipientId: string
  content: string
  timestamp: string
  read: boolean
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [selectedFolder, setSelectedFolder] = useState<'all' | 'team' | 'residents' | 'contractors' | 'design'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showMessaging, setShowMessaging] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    folder: 'contractors' as Member['folder']
  })

  const folders = [
    { 
      id: 'team', 
      label: 'Team Members', 
      icon: Users, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-700',
      count: members.filter(m => m.folder === 'team').length 
    },
    { 
      id: 'residents', 
      label: 'Residents', 
      icon: Home, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-700',
      count: members.filter(m => m.folder === 'residents').length 
    },
    { 
      id: 'contractors', 
      label: 'Contractors', 
      icon: HardHat, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700',
      count: members.filter(m => m.folder === 'contractors').length 
    },
    { 
      id: 'design', 
      label: 'Design Professionals', 
      icon: Briefcase, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-700',
      count: members.filter(m => m.folder === 'design').length 
    }
  ]

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    
    const member: Member = {
      id: Date.now().toString(),
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone,
      company: newMember.company,
      role: newMember.role,
      folder: newMember.folder,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0]
    }
    
    setMembers([...members, member])
    setShowAddModal(false)
    setNewMember({
      name: '',
      email: '',
      phone: '',
      company: '',
      role: '',
      folder: 'contractors'
    })
  }

  const handleSendMessage = () => {
    if (!selectedMember || !newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'current-user',
      senderName: 'You',
      recipientId: selectedMember.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false
    }

    setMessages([...messages, message])
    setNewMessage('')
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.company.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFolder = selectedFolder === 'all' || member.folder === selectedFolder
    return matchesSearch && matchesFolder
  })

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-4">Team Members & Contacts</h1>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowMessaging(!showMessaging)}
            className="btn-secondary"
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            {showMessaging ? 'Hide Messages' : 'Messages'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Contact Folders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {folders.map((folder) => {
          const Icon = folder.icon
          return (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(selectedFolder === folder.id ? 'all' : folder.id as any)}
              className={`relative overflow-hidden rounded-xl p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border-2 ${
                selectedFolder === folder.id 
                  ? folder.borderColor + ' shadow-lg' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-opacity-50'
              } ${folder.bgColor}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${folder.color} opacity-10`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${folder.color} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{folder.count}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{folder.label}</h3>
              </div>
            </button>
          )
        })}
      </div>

      {/* Main Content Area */}
      <div className={`grid grid-cols-1 ${showMessaging ? 'lg:grid-cols-3' : ''} gap-6`}>
        {/* Members List */}
        <div className={showMessaging ? 'lg:col-span-2' : ''}>
          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="input-modern pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3">
                <button className="btn-secondary">
                  <Filter className="h-5 w-5" />
                  Filters
                </button>
                <button className="btn-secondary">
                  <Download className="h-5 w-5" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMembers.length === 0 ? (
              <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <FolderOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No contacts found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {selectedFolder === 'all' 
                    ? 'Add your first contact to get started' 
                    : `No contacts in ${folders.find(f => f.id === selectedFolder)?.label.toLowerCase()}`}
                </p>
                <button onClick={() => setShowAddModal(true)} className="btn-primary">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add First Contact
                </button>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 card-hover"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 text-white font-semibold"
                          style={{ background: `linear-gradient(to right, var(--accent-500), var(--accent-600))` }}>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{member.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.status === 'active' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                      }`}>
                        {member.status}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        {member.company}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {member.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {member.phone}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Added {new Date(member.joinedDate).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setSelectedMember(member)
                            setShowMessaging(true)
                          }}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messaging Portal */}
        {showMessaging && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Internal Messaging</h3>
              {selectedMember && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Conversation with {selectedMember.name}
                </p>
              )}
            </div>
            
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {!selectedMember ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Select a contact to start messaging</p>
                </div>
              ) : messages.filter(m => m.recipientId === selectedMember.id || m.senderId === selectedMember.id).length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.filter(m => m.recipientId === selectedMember.id || m.senderId === selectedMember.id).map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.senderId === 'current-user'
                          ? 'text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }`}
                      style={message.senderId === 'current-user' ? { background: 'linear-gradient(to right, var(--accent-500), var(--accent-600))' } : {}}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === 'current-user' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {selectedMember && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="input-modern flex-1"
                  />
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <button onClick={handleSendMessage} className="btn-primary">
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add New Contact</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddMember} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Folder</label>
                  <select
                    className="input-modern"
                    value={newMember.folder}
                    onChange={(e) => setNewMember({ ...newMember, folder: e.target.value as Member['folder'] })}
                  >
                    <option value="team">Team Members</option>
                    <option value="residents">Residents</option>
                    <option value="contractors">Contractors</option>
                    <option value="design">Design Professionals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="input-modern"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    className="input-modern"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    className="input-modern"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    placeholder="(555) 555-5555"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                  <input
                    type="text"
                    className="input-modern"
                    value={newMember.company}
                    onChange={(e) => setNewMember({ ...newMember, company: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role/Title</label>
                  <input
                    type="text"
                    className="input-modern"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    placeholder="e.g., Project Manager, Site Supervisor"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}