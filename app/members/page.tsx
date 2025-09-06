'use client'

import { useState, useEffect } from 'react'
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
  UserCheck,
  Folder,
  Loader2
} from 'lucide-react'
import PageTitle from '@/components/PageTitle'
import { supabase } from '@/lib/supabase-client'

interface Member {
  id: string
  name: string
  email: string
  phone: string
  company: string
  role: string
  folder: 'team' | 'residents' | 'contractors' | 'design'
  status: 'active' | 'inactive' | 'pending'
  joined_date: string
  last_active: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

interface Message {
  id: string
  sender_id: string
  sender_name: string
  recipient_id: string
  content: string
  timestamp: string
  read: boolean
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'team' | 'residents' | 'contractors' | 'design'>('team')
  const [searchQueries, setSearchQueries] = useState({
    team: '',
    residents: '',
    contractors: '',
    design: ''
  })
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

  // Using imported supabase client

  const folders = [
    { 
      id: 'team' as const, 
      label: 'Team Members', 
      icon: Users, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-700',
      count: members.filter(m => m.folder === 'team').length 
    },
    { 
      id: 'residents' as const, 
      label: 'Residents', 
      icon: Home, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-700',
      count: members.filter(m => m.folder === 'residents').length 
    },
    { 
      id: 'contractors' as const, 
      label: 'Contractors', 
      icon: HardHat, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700',
      count: members.filter(m => m.folder === 'contractors').length 
    },
    { 
      id: 'design' as const, 
      label: 'Design Professionals', 
      icon: Briefcase, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-700',
      count: members.filter(m => m.folder === 'design').length 
    }
  ]

  // Load members from Supabase
  useEffect(() => {
    loadMembers()
    loadMessages()
  }, [])

  const loadMembers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading members:', error.message || 'Unknown error occurred')
        setMembers([])
      } else {
        setMembers(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('member_messages')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading messages:', error.message || 'Unknown error occurred')
        setMessages([])
      } else {
        setMessages(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const member = {
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone,
      company: newMember.company,
      role: newMember.role,
      folder: newMember.folder,
      status: 'active' as const,
      joined_date: new Date().toISOString().split('T')[0],
      last_active: new Date().toISOString().split('T')[0]
    }
    
    try {
      const { data, error } = await supabase
        .from('members')
        .insert([member])
        .select()
        .single()

      if (error) {
        console.error('Error adding member:', error)
        alert('Failed to add member')
      } else if (data) {
        setMembers([data, ...members])
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
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to add member')
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return

    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId)

      if (error) {
        console.error('Error deleting member:', error)
        alert('Failed to delete member')
      } else {
        setMembers(members.filter(m => m.id !== memberId))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to delete member')
    }
  }

  const handleSendMessage = async () => {
    if (!selectedMember || !newMessage.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const message = {
      sender_id: user.id,
      sender_name: 'You',
      recipient_id: selectedMember.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false
    }

    try {
      const { data, error } = await supabase
        .from('member_messages')
        .insert([message])
        .select()
        .single()

      if (error) {
        console.error('Error sending message:', error)
        alert('Failed to send message')
      } else if (data) {
        setMessages([...messages, data])
        setNewMessage('')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to send message')
    }
  }

  const handleSearchChange = (folder: typeof activeTab, value: string) => {
    setSearchQueries(prev => ({ ...prev, [folder]: value }))
  }

  const getFilteredMembers = (folder: typeof activeTab) => {
    return members.filter(member => {
      const matchesFolder = member.folder === folder
      const matchesSearch = member.name.toLowerCase().includes(searchQueries[folder].toLowerCase()) ||
                           member.email.toLowerCase().includes(searchQueries[folder].toLowerCase()) ||
                           member.company.toLowerCase().includes(searchQueries[folder].toLowerCase())
      return matchesFolder && matchesSearch
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 flex flex-col">
      {/* Page Header */}
      <PageTitle title="Team Members & Contacts" />
      <div className="mb-4">
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowMessaging(!showMessaging)}
            className="px-6 py-3 bg-gray-700/80 backdrop-blur-sm border border-gray-600 text-gray-200 rounded-xl hover:bg-gray-600/80 transition-all duration-300 hover:scale-105 hover:shadow-glow flex items-center gap-2 font-medium"
          >
            <MessageSquare className="h-5 w-5" />
            {showMessaging ? 'Hide Messages' : 'Messages'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-gray-900 rounded-xl hover:from-yellow-400 hover:to-orange-500 transition-all duration-300 hover:scale-105 shadow-glow flex items-center gap-2 font-semibold"
          >
            <UserPlus className="h-5 w-5" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Main Content with Messaging */}
      <div className={`flex-1 grid grid-cols-1 ${showMessaging ? 'lg:grid-cols-3' : ''} gap-6`}>
        {/* Large Tabbed Folder Box */}
        <div className={`${showMessaging ? 'lg:col-span-2' : ''} card-modern hover-lift backdrop-blur-lg overflow-hidden flex flex-col`}>
          {/* Tab Headers */}
          <div className="border-b border-gray-600/30">
            <div className="flex">
              {folders.map((folder) => {
                const Icon = folder.icon
                return (
                  <button
                    key={folder.id}
                    onClick={() => setActiveTab(folder.id)}
                    className={`flex-1 px-4 py-4 flex items-center justify-center gap-2 transition-all duration-300 border-b-2 ${
                      activeTab === folder.id
                        ? `border-yellow-500 text-yellow-400 bg-yellow-500/10 backdrop-blur-sm`
                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700/30 backdrop-blur-sm'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{folder.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeTab === folder.id
                        ? 'bg-yellow-500/20 text-yellow-300 shadow-glow'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {folder.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 flex flex-col">
            {/* Search Bar for Active Tab */}
            <div className="p-4 border-b border-gray-600/30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${folders.find(f => f.id === activeTab)?.label.toLowerCase()}...`}
                  className="input-modern pl-10 bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-gray-200 placeholder-gray-400"
                  value={searchQueries[activeTab]}
                  onChange={(e) => handleSearchChange(activeTab, e.target.value)}
                />
              </div>
            </div>

            {/* Scrollable Contact List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Loading contacts...</p>
                </div>
              ) : getFilteredMembers(activeTab).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Folder className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No {folders.find(f => f.id === activeTab)?.label.toLowerCase()} found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4 text-center">
                    {searchQueries[activeTab] 
                      ? 'Try adjusting your search terms' 
                      : `Add your first ${folders.find(f => f.id === activeTab)?.label.toLowerCase().slice(0, -1)} to get started`}
                  </p>
                  {!searchQueries[activeTab] && (
                    <button onClick={() => setShowAddModal(true)} className="btn-primary">
                      <UserPlus className="h-5 w-5 mr-2" />
                      Add Contact
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getFilteredMembers(activeTab).map((member) => (
                    <div 
                      key={member.id} 
                      className="card-modern hover-lift backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-glow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white font-semibold text-sm"
                            style={{ background: `linear-gradient(to right, var(--accent-500), var(--accent-600))` }}>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{member.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.status === 'active' 
                            ? 'bg-green-500/20 text-green-400 shadow-glow' 
                            : 'bg-gray-600 text-gray-400'
                        }`}>
                          {member.status}
                        </div>
                      </div>

                      <div className="space-y-1 mb-3">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Building className="h-3.5 w-3.5 mr-2 text-gray-400" />
                          {member.company}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="h-3.5 w-3.5 mr-2 text-gray-400" />
                          {member.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="h-3.5 w-3.5 mr-2 text-gray-400" />
                          {member.phone}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-600/30">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Added {new Date(member.joined_date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => {
                              setSelectedMember(member)
                              setShowMessaging(true)
                            }}
                            className="p-1.5 text-gray-400 hover:text-yellow-400 transition-all duration-300 hover:scale-110"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-yellow-400 transition-all duration-300 hover:scale-110">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteMember(member.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 transition-all duration-300 hover:scale-110"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messaging Portal */}
        {showMessaging && (
          <div className="card-modern hover-lift backdrop-blur-lg overflow-hidden flex flex-col">
            <div className="border-b border-gray-600/30 p-4">
              <h3 className="text-lg font-semibold text-yellow-400">Internal Messaging</h3>
              {selectedMember && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Conversation with {selectedMember.name}
                </p>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!selectedMember ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Select a contact to start messaging</p>
                </div>
              ) : messages.filter(m => m.recipient_id === selectedMember.id || m.sender_id === selectedMember.id).length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.filter(m => m.recipient_id === selectedMember.id || m.sender_id === selectedMember.id).map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === 'current-user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender_id === 'current-user'
                          ? 'text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }`}
                      style={message.sender_id === 'current-user' ? { background: 'linear-gradient(to right, var(--accent-500), var(--accent-600))' } : {}}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === 'current-user' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {selectedMember && (
              <div className="border-t border-gray-600/30 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="input-modern flex-1 bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-gray-200 placeholder-gray-400"
                  />
                  <button className="p-2 text-gray-400 hover:text-yellow-400 transition-all duration-300 hover:scale-110">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <button onClick={handleSendMessage} className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-gray-900 rounded-xl hover:from-yellow-400 hover:to-orange-500 transition-all duration-300 hover:scale-105 shadow-glow">
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card-modern max-w-md w-full shadow-2xl backdrop-blur-lg">
            <div className="p-6 border-b border-gray-600/30">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-yellow-400">Add New Contact</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-gray-600/50 rounded transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddMember} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Contact Folder</label>
                  <select
                    className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-gray-200"
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-gray-200 placeholder-gray-400"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-gray-200 placeholder-gray-400"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-gray-200 placeholder-gray-400"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    placeholder="(555) 555-5555"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                  <input
                    type="text"
                    className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-gray-200 placeholder-gray-400"
                    value={newMember.company}
                    onChange={(e) => setNewMember({ ...newMember, company: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Role/Title</label>
                  <input
                    type="text"
                    className="input-modern bg-gray-800/50 backdrop-blur-sm border-gray-600/50 text-gray-200 placeholder-gray-400"
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
                  className="px-6 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600 text-gray-200 rounded-xl hover:bg-gray-600/80 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-gray-900 rounded-xl hover:from-yellow-400 hover:to-orange-500 transition-all duration-300 hover:scale-105 shadow-glow font-semibold"
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