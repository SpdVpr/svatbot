'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { UserFeedback } from '@/types/admin'
import {
  MessageCircle,
  Bug,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2
} from 'lucide-react'

export default function FeedbackTab() {
  const { user } = useAuth()
  const [feedback, setFeedback] = useState<UserFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({})
  const [sendingReply, setSendingReply] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (!user?.id) return

    const q = query(
      collection(db, 'feedback'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feedbackData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserFeedback[]
      
      setFeedback(feedbackData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

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
      case 'bug': return 'bg-red-100 text-red-700'
      case 'feature': return 'bg-blue-100 text-blue-700'
      case 'improvement': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: UserFeedback['status']) => {
    switch (status) {
      case 'new': return Clock
      case 'in-progress': return AlertCircle
      case 'resolved': return CheckCircle
      case 'closed': return CheckCircle
    }
  }

  const getStatusColor = (status: UserFeedback['status']) => {
    switch (status) {
      case 'new': return 'bg-gray-100 text-gray-700'
      case 'in-progress': return 'bg-blue-100 text-blue-700'
      case 'resolved': return 'bg-green-100 text-green-700'
      case 'closed': return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusLabel = (status: UserFeedback['status']) => {
    switch (status) {
      case 'new': return 'Nový'
      case 'in-progress': return 'Řeší se'
      case 'resolved': return 'Vyřešeno'
      case 'closed': return 'Uzavřeno'
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

  const handleSendReply = async (feedbackId: string) => {
    const reply = replyText[feedbackId]?.trim()
    if (!reply || !user) return

    setSendingReply({ ...sendingReply, [feedbackId]: true })

    try {
      const feedbackRef = doc(db, 'feedback', feedbackId)

      await updateDoc(feedbackRef, {
        conversation: arrayUnion({
          from: 'user',
          message: reply,
          timestamp: serverTimestamp(),
          userName: user.displayName || user.email
        }),
        updatedAt: serverTimestamp()
      })

      // Clear reply text
      setReplyText({ ...replyText, [feedbackId]: '' })
    } catch (error) {
      console.error('Error sending reply:', error)
      alert('Nepodařilo se odeslat odpověď. Zkuste to prosím znovu.')
    } finally {
      setSendingReply({ ...sendingReply, [feedbackId]: false })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (feedback.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Zatím žádný feedback
        </h3>
        <p className="text-gray-600 mb-6">
          Máte nápad, našli jste chybu nebo chcete něco vylepšit?
        </p>
        <p className="text-sm text-gray-500">
          Použijte tlačítko s ikonou zprávy v pravém dolním rohu obrazovky
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <MessageCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">
              Váš feedback
            </h3>
            <p className="text-sm text-blue-700">
              Zde najdete všechny vaše odeslané zprávy a odpovědi od našeho týmu.
            </p>
          </div>
        </div>
      </div>

      {feedback.map((item) => {
        const TypeIcon = getTypeIcon(item.type)
        const StatusIcon = getStatusIcon(item.status)
        const isExpanded = expandedId === item.id

        return (
          <div
            key={item.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Header - Always visible */}
            <div
              className="p-4 cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                    <TypeIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {item.subject}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(item.status)}`}>
                    <StatusIcon className="w-3 h-3" />
                    {getStatusLabel(item.status)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Preview when collapsed */}
              {!isExpanded && (
                <p className="text-sm text-gray-600 line-clamp-2 ml-11">
                  {item.message}
                </p>
              )}
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
                {/* Full message */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Vaše zpráva</h4>
                  <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
                    {item.message}
                  </p>
                </div>

                {/* Rating */}
                {item.rating && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Hodnocení</h4>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < item.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Conversation thread */}
                {(item.adminNotes || item.conversation) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                      Konverzace
                    </h4>
                    <div className="space-y-3">
                      {/* Admin's initial response */}
                      {item.adminNotes && (
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                            A
                          </div>
                          <div className="flex-1">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm font-medium text-blue-900 mb-1">Tým SvatBot</p>
                              <p className="text-gray-900 whitespace-pre-wrap text-sm">
                                {item.adminNotes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Conversation messages */}
                      {item.conversation && item.conversation.map((msg: any, idx: number) => (
                        <div key={idx} className={`flex gap-3 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                            msg.from === 'user' ? 'bg-primary-600' : 'bg-blue-600'
                          }`}>
                            {msg.from === 'user' ? user?.displayName?.[0]?.toUpperCase() || 'U' : 'A'}
                          </div>
                          <div className="flex-1">
                            <div className={`rounded-lg p-3 ${
                              msg.from === 'user'
                                ? 'bg-primary-50 border border-primary-200'
                                : 'bg-blue-50 border border-blue-200'
                            }`}>
                              <p className={`text-sm font-medium mb-1 ${
                                msg.from === 'user' ? 'text-primary-900' : 'text-blue-900'
                              }`}>
                                {msg.from === 'user' ? (msg.userName || 'Vy') : 'Tým SvatBot'}
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

                      {/* Reply input */}
                      {item.status !== 'closed' && (
                        <div className="flex gap-3 pt-2">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                            {user?.displayName?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="flex gap-2">
                              <textarea
                                value={replyText[item.id] || ''}
                                onChange={(e) => setReplyText({ ...replyText, [item.id]: e.target.value })}
                                placeholder="Napište odpověď..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
                                rows={2}
                                disabled={sendingReply[item.id]}
                              />
                              <button
                                onClick={() => handleSendReply(item.id)}
                                disabled={!replyText[item.id]?.trim() || sendingReply[item.id]}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 self-end"
                              >
                                {sendingReply[item.id] ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Send className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {item.status === 'closed' && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                          <AlertCircle className="w-4 h-4" />
                          <span>Tato konverzace byla uzavřena</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status info */}
                {item.status === 'resolved' && item.resolvedAt && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg p-3">
                    <CheckCircle className="w-4 h-4" />
                    <span>Vyřešeno {formatDate(item.resolvedAt)}</span>
                  </div>
                )}

                {item.status === 'in-progress' && (
                  <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4" />
                    <span>Náš tým na tom pracuje...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

