'use client'

import { useState } from 'react'
import { useFeedback } from '@/hooks/useAdminDashboard'
import { UserFeedback } from '@/types/admin'
import { doc, updateDoc, arrayUnion, serverTimestamp, addDoc, collection, increment, Timestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { WeddingNotificationType } from '@/hooks/useWeddingNotifications'
import {
  MessageCircle,
  Bug,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Filter,
  Send,
  Loader2,
  Bell
} from 'lucide-react'

export default function FeedbackManagement() {
  const { feedback, loading, updateFeedbackStatus } = useFeedback()
  const [selectedFeedback, setSelectedFeedback] = useState<UserFeedback | null>(null)
  const [filterType, setFilterType] = useState<'all' | UserFeedback['type']>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | UserFeedback['status']>('all')
  const [adminNotes, setAdminNotes] = useState('')
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  const filteredFeedback = feedback.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    return matchesType && matchesStatus
  })

  const getTypeIcon = (type: UserFeedback['type']) => {
    switch (type) {
      case 'bug': return Bug
      case 'feature': return Lightbulb
      case 'improvement': return TrendingUp
      default: return MessageCircle
    }
  }

  const getTypeColor = (type: UserFeedback['type']) => {
    switch (type) {
      case 'bug': return 'text-red-600 bg-red-50'
      case 'feature': return 'text-blue-600 bg-blue-50'
      case 'improvement': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusColor = (status: UserFeedback['status']) => {
    switch (status) {
      case 'new': return 'bg-yellow-100 text-yellow-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: UserFeedback['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-orange-100 text-orange-800'
      case 'low': return 'bg-gray-100 text-gray-800'
    }
  }

  const handleUpdateStatus = async (feedbackId: string, status: UserFeedback['status']) => {
    const success = await updateFeedbackStatus(feedbackId, status, adminNotes || undefined)
    if (success) {
      setAdminNotes('')
      setSelectedFeedback(null)
    }
  }

  // Mark feedback as read by admin when opened
  const handleSelectFeedback = async (item: UserFeedback) => {
    setSelectedFeedback(item)

    // If there are unread user replies, mark as read
    if (item.unreadUserReplies && item.unreadUserReplies > 0) {
      try {
        const feedbackRef = doc(db, 'feedback', item.id)
        await updateDoc(feedbackRef, {
          unreadUserReplies: 0,
          lastReadByAdmin: serverTimestamp()
        })
      } catch (error) {
        console.error('Error marking feedback as read:', error)
      }
    }
  }

  const handleSaveNote = async () => {
    if (!selectedFeedback || !adminNotes.trim()) return

    const success = await updateFeedbackStatus(
      selectedFeedback.id,
      selectedFeedback.status,
      adminNotes.trim()
    )

    if (success) {
      // Update local state to show the saved note
      setSelectedFeedback({
        ...selectedFeedback,
        adminNotes: adminNotes.trim()
      })
      setAdminNotes('')
    }
  }

  const handleSendReply = async () => {
    if (!selectedFeedback || !replyText.trim()) return

    setSendingReply(true)

    try {
      const feedbackRef = doc(db, 'feedback', selectedFeedback.id)

      // Create timestamp for the message (can't use serverTimestamp inside arrayUnion)
      const messageTimestamp = Timestamp.now()

      // Update feedback with new reply and increment unread counter for user
      // Also reset unread user replies since admin is responding (has seen the messages)
      await updateDoc(feedbackRef, {
        conversation: arrayUnion({
          from: 'admin',
          message: replyText.trim(),
          timestamp: messageTimestamp,
          userName: 'Admin'
        }),
        updatedAt: serverTimestamp(),
        unreadAdminReplies: increment(1),
        unreadUserReplies: 0,  // Reset since admin is responding
        lastReadByAdmin: serverTimestamp()
      })

      // Create notification for user
      await addDoc(collection(db, 'weddingNotifications'), {
        userId: selectedFeedback.userId,
        type: WeddingNotificationType.FEEDBACK_REPLY,
        title: 'Nová odpověď na váš feedback',
        message: `Admin odpověděl na váš feedback: "${selectedFeedback.subject}"`,
        priority: 'medium',
        category: 'system',
        actionUrl: '/?openAccount=feedback',
        data: {
          feedbackId: selectedFeedback.id,
          feedbackSubject: selectedFeedback.subject
        },
        read: false,
        createdAt: serverTimestamp()
      })

      // Update local state
      setSelectedFeedback({
        ...selectedFeedback,
        conversation: [
          ...(selectedFeedback.conversation || []),
          {
            from: 'admin',
            message: replyText.trim(),
            timestamp: messageTimestamp,
            userName: 'Admin'
          }
        ]
      })

      setReplyText('')
    } catch (error) {
      console.error('Error sending reply:', error)
      alert('Nepodařilo se odeslat odpověď. Zkuste to prosím znovu.')
    } finally {
      setSendingReply(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ''
    return timestamp.toDate().toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  // Calculate total unread user replies
  const totalUnreadUserReplies = feedback.reduce((sum, item) => sum + (item.unreadUserReplies || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">
              Feedback Management
            </h2>
            {totalUnreadUserReplies > 0 && (
              <span className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                <Bell className="w-4 h-4" />
                {totalUnreadUserReplies} {totalUnreadUserReplies === 1 ? 'nová zpráva' : totalUnreadUserReplies < 5 ? 'nové zprávy' : 'nových zpráv'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {filteredFeedback.length} položek
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Všechny typy</option>
            <option value="bug">🐛 Bug</option>
            <option value="feature">💡 Feature</option>
            <option value="improvement">📈 Improvement</option>
            <option value="other">💬 Other</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Všechny statusy</option>
            <option value="new">Nové</option>
            <option value="in-progress">V řešení</option>
            <option value="resolved">Vyřešené</option>
            <option value="closed">Uzavřené</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFeedback.map((item) => {
          const TypeIcon = getTypeIcon(item.type)
          const hasUnreadMessages = item.unreadUserReplies && item.unreadUserReplies > 0

          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all cursor-pointer ${
                hasUnreadMessages
                  ? 'border-red-300 bg-red-50 ring-2 ring-red-200'
                  : 'border-gray-100'
              }`}
              onClick={() => handleSelectFeedback(item)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {item.subject}
                      </h3>
                      {/* Unread badge */}
                      {hasUnreadMessages && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full animate-pulse flex-shrink-0">
                          <Bell className="w-3 h-3" />
                          {item.unreadUserReplies}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {item.userEmail}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(item.status)}`}>
                    {item.status === 'new' ? 'Nové' :
                     item.status === 'in-progress' ? 'V řešení' :
                     item.status === 'resolved' ? 'Vyřešené' : 'Uzavřené'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(item.priority)}`}>
                    {item.priority === 'high' ? 'Vysoká' :
                     item.priority === 'medium' ? 'Střední' : 'Nízká'}
                  </span>
                </div>
              </div>

              {/* Message */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {item.message}
              </p>

              {/* Rating */}
              {item.rating && (
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < item.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(item.createdAt)}
                </span>
                {item.page && (
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {item.page}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredFeedback.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Žádný feedback nenalezen</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedFeedback.subject}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Od: {selectedFeedback.userEmail}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Message */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Zpráva</h3>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {selectedFeedback.message}
                </p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Typ</h3>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${getTypeColor(selectedFeedback.type)}`}>
                    {selectedFeedback.type}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Priorita</h3>
                  <span className={`inline-flex px-3 py-1 rounded-lg ${getPriorityColor(selectedFeedback.priority)}`}>
                    {selectedFeedback.priority}
                  </span>
                </div>
              </div>

              {/* Conversation Thread */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  Konverzace
                </h3>
                <div className="space-y-3 bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {/* Initial admin response */}
                  {selectedFeedback.adminNotes && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                        A
                      </div>
                      <div className="flex-1">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-blue-900 mb-1">Admin</p>
                          <p className="text-gray-900 whitespace-pre-wrap text-sm">
                            {selectedFeedback.adminNotes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Conversation messages */}
                  {selectedFeedback.conversation && selectedFeedback.conversation.map((msg: any, idx: number) => (
                    <div key={idx} className={`flex gap-3 ${msg.from === 'admin' ? '' : 'flex-row-reverse'}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        msg.from === 'admin' ? 'bg-blue-600' : 'bg-primary-600'
                      }`}>
                        {msg.from === 'admin' ? 'A' : 'U'}
                      </div>
                      <div className="flex-1">
                        <div className={`rounded-lg p-3 ${
                          msg.from === 'admin'
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-primary-50 border border-primary-200'
                        }`}>
                          <p className={`text-sm font-medium mb-1 ${
                            msg.from === 'admin' ? 'text-blue-900' : 'text-primary-900'
                          }`}>
                            {msg.from === 'admin' ? 'Admin' : (msg.userName || selectedFeedback.userName || 'Uživatel')}
                          </p>
                          <p className="text-gray-900 whitespace-pre-wrap text-sm">
                            {msg.message}
                          </p>
                          {msg.timestamp && (
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(msg.timestamp)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* No messages yet */}
                  {!selectedFeedback.adminNotes && (!selectedFeedback.conversation || selectedFeedback.conversation.length === 0) && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      Zatím žádná konverzace. Napište první odpověď níže.
                    </div>
                  )}
                </div>

                {/* Reply input */}
                {selectedFeedback.status !== 'closed' && (
                  <div className="mt-4">
                    <div className="flex gap-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Napište odpověď..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        disabled={sendingReply}
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || sendingReply}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 self-end"
                      >
                        {sendingReply ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Odeslat</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {selectedFeedback.status === 'closed' && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-100 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4" />
                    <span>Tato konverzace byla uzavřena</span>
                  </div>
                )}
              </div>

              {/* Status Actions */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Změnit stav</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedFeedback.id, 'in-progress')}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    🔄 Začít řešit
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedFeedback.id, 'resolved')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    ✅ Vyřešit
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedFeedback.id, 'closed')}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    🔒 Uzavřít
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

