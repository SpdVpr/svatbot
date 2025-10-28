'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { MessageCircle, X, Send, Star } from 'lucide-react'

export default function FeedbackButton() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<'bug' | 'feature' | 'improvement' | 'other'>('other')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState(0)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !subject.trim() || !message.trim()) return

    setSending(true)

    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user.id,
        userEmail: user.email,
        userName: user.displayName || 'Unknown',
        type,
        subject: subject.trim(),
        message: message.trim(),
        rating: rating > 0 ? rating : null,
        page: window.location.pathname,
        status: 'new',
        priority: type === 'bug' ? 'high' : 'medium',
        createdAt: serverTimestamp(),
        unreadAdminReplies: 0,
        unreadUserReplies: 0
      })

      setSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
        setSubject('')
        setMessage('')
        setRating(0)
        setType('other')
      }, 2000)
    } catch (error) {
      console.error('Error sending feedback:', error)
      alert('Nepodařilo se odeslat feedback. Zkuste to prosím znovu.')
    } finally {
      setSending(false)
    }
  }

  if (!user) return null

  return (
    <>
      {/* Floating Button - Closer to edge on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-24 bg-blue-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-40"
        title="Napsat feedback nebo zprávu adminovi"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {success ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Feedback odeslán!
                </h3>
                <p className="text-gray-600">
                  Děkujeme za váš feedback. Brzy se vám ozveme.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">
                        Napište nám
                      </h2>
                      <p className="text-sm text-gray-600">
                        Máte nápad, našli jste chybu nebo chcete něco zlepšit?
                      </p>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Typ zprávy
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setType('bug')}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                          type === 'bug'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        🐛 Bug
                      </button>
                      <button
                        type="button"
                        onClick={() => setType('feature')}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                          type === 'feature'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        💡 Nápad
                      </button>
                      <button
                        type="button"
                        onClick={() => setType('improvement')}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                          type === 'improvement'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        📈 Zlepšení
                      </button>
                      <button
                        type="button"
                        onClick={() => setType('other')}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                          type === 'other'
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        💬 Jiné
                      </button>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Předmět
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Stručně popište problém nebo nápad..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zpráva
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Podrobně popište, co se stalo nebo co byste chtěli..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={5}
                      required
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jak jste spokojeni s aplikací? (volitelné)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      disabled={sending || !subject.trim() || !message.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {sending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Odesílám...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Odeslat
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

