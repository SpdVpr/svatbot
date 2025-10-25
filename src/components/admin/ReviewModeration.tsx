'use client'

import { useState, useEffect } from 'react'
import { useVendorReviews } from '@/hooks/useVendorReviews'
import { Star, CheckCircle, XCircle, Clock, Eye, Trash2, Loader2 } from 'lucide-react'
import type { VendorReview } from '@/types/review'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

type ReviewStatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

export default function ReviewModeration() {
  const { allReviews, loading, approveReview, rejectReview, loadReviews } = useVendorReviews()
  const [filter, setFilter] = useState<ReviewStatusFilter>('pending')
  const [selectedReview, setSelectedReview] = useState<VendorReview | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const filteredReviews = allReviews.filter(review => {
    if (filter === 'all') return true
    return review.status === filter
  })

  const pendingCount = allReviews.filter(r => r.status === 'pending').length

  const handleApprove = async (reviewId: string) => {
    setActionLoading(true)
    try {
      await approveReview(reviewId)
      setSelectedReview(null)
    } catch (error) {
      console.error('Error approving review:', error)
      alert('Chyba při schvalování recenze')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (reviewId: string) => {
    if (!rejectReason.trim()) {
      alert('Zadejte důvod zamítnutí')
      return
    }

    setActionLoading(true)
    try {
      await rejectReview(reviewId, rejectReason)
      setShowRejectModal(false)
      setRejectReason('')
      setSelectedReview(null)
    } catch (error) {
      console.error('Error rejecting review:', error)
      alert('Chyba při zamítání recenze')
    } finally {
      setActionLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (date: Date) => {
    try {
      return format(date, 'd. MMMM yyyy HH:mm', { locale: cs })
    } catch {
      return new Date(date).toLocaleDateString('cs-CZ')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Správa recenzí</h2>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">Čeká na schválení</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">{pendingCount}</div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Schváleno</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {allReviews.filter(r => r.status === 'approved').length}
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-900">Zamítnuto</span>
            </div>
            <div className="text-2xl font-bold text-red-900">
              {allReviews.filter(r => r.status === 'rejected').length}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Celkem</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{allReviews.length}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Všechny
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Čeká na schválení ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'approved'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Schváleno
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'rejected'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Zamítnuto
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Žádné recenze k zobrazení</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                {/* Status Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {review.status === 'pending' && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        Čeká na schválení
                      </span>
                    )}
                    {review.status === 'approved' && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Schváleno
                      </span>
                    )}
                    {review.status === 'rejected' && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Zamítnuto
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {review.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{review.userName}</h3>
                    <p className="text-sm text-gray-500">{review.userEmail}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-3">
                  {renderStars(review.rating)}
                  <span className="text-sm font-medium text-gray-700">
                    {review.rating.toFixed(1)}
                  </span>
                </div>

                {/* Review Content */}
                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                <p className="text-gray-700 mb-4">{review.text}</p>

                {/* Detailed Ratings */}
                <div className="grid grid-cols-4 gap-3 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">Kvalita:</span>
                    <span className="ml-2 font-medium">{review.ratings.quality}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Komunikace:</span>
                    <span className="ml-2 font-medium">{review.ratings.communication}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Cena/výkon:</span>
                    <span className="ml-2 font-medium">{review.ratings.value}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Profesionalita:</span>
                    <span className="ml-2 font-medium">{review.ratings.professionalism}</span>
                  </div>
                </div>

                {/* Moderation Note */}
                {review.moderationNote && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">
                      <strong>Poznámka:</strong> {review.moderationNote}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {review.status === 'pending' && (
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(review.id)}
                      disabled={actionLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Schválit</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReview(review)
                        setShowRejectModal(true)
                      }}
                      disabled={actionLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Zamítnout</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Zamítnout recenzi</h3>
            <p className="text-gray-600 mb-4">
              Zadejte důvod zamítnutí recenze od uživatele <strong>{selectedReview.userName}</strong>
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Např. Recenze obsahuje nevhodný obsah..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent h-24 mb-4"
            />
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                  setSelectedReview(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Zrušit
              </button>
              <button
                onClick={() => handleReject(selectedReview.id)}
                disabled={actionLoading || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300"
              >
                {actionLoading ? 'Zamítám...' : 'Zamítnout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}