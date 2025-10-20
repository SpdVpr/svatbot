'use client'

import { useState } from 'react'
import { useAdminMessages } from '@/hooks/useAdminDashboard'
import { AdminConversation, AdminMessage } from '@/types/admin'
import { 
  MessageSquare, 
  Send, 
  CheckCheck,
  Clock,
  User,
  X
} from 'lucide-react'

export default function AdminMessaging() {
  const { conversations, loading, sendMessage, closeConversation } = useAdminMessages()
  const [selectedConversation, setSelectedConversation] = useState<AdminConversation | null>(null)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || sending) return

    setSending(true)
    const success = await sendMessage(
      selectedConversation.id,
      messageText,
      'admin-001', // TODO: Get from auth context
      'Admin SvatBot'
    )

    if (success) {
      setMessageText('')
    }
    setSending(false)
  }

  const handleCloseConversation = async (conversationId: string) => {
    await closeConversation(conversationId)
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null)
    }
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return ''
    const date = timestamp.toDate()
    return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ''
    const date = timestamp.toDate()
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 86400000) return 'Dnes'
    if (diff < 172800000) return 'Včera'
    
    return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[700px] flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Zprávy</h2>
          <p className="text-sm text-gray-500 mt-1">
            {conversations.filter(c => c.status === 'open').length} otevřených konverzací
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageSquare className="w-12 h-12 mb-2" />
              <p className="text-sm">Žádné zprávy</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {conversation.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {conversation.userName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {conversation.userEmail}
                        </p>
                      </div>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate mb-1">
                    {conversation.messages[conversation.messages.length - 1]?.content || 'Žádné zprávy'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {formatDate(conversation.lastMessageAt)} {formatTime(conversation.lastMessageAt)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      conversation.status === 'open' 
                        ? 'bg-green-100 text-green-700'
                        : conversation.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {conversation.status === 'open' ? 'Otevřeno' : 
                       conversation.status === 'pending' ? 'Čeká' : 'Uzavřeno'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages View */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {selectedConversation.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedConversation.userName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.userEmail}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => handleCloseConversation(selectedConversation.id)}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Uzavřít konverzaci
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${
                    message.senderType === 'admin'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  } rounded-lg p-3`}>
                    <p className="text-xs font-medium mb-1 opacity-75">
                      {message.senderName}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs opacity-75">
                      <Clock className="w-3 h-3" />
                      {formatTime(message.timestamp)}
                      {message.senderType === 'admin' && message.read && (
                        <CheckCheck className="w-3 h-3 ml-1" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Napište zprávu..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={sending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Odeslat
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-medium">Vyberte konverzaci</p>
              <p className="text-sm">Klikněte na konverzaci pro zobrazení zpráv</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

