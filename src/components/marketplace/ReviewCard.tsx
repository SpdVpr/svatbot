'use client'

import { Star, Calendar, CheckCircle } from 'lucide-react'
import type { VendorReview } from '@/types/review'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

interface ReviewCardProps {
  review: VendorReview
  showVendorName?: boolean
}

export default function ReviewCard({ review, showVendorName = false }: ReviewCardProps) {
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
      return format(date, 'd. MMMM yyyy', { locale: cs })
    } catch {
      return new Date(date).toLocaleDateString('cs-CZ')
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-semibold">
                {review.userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{review.userName}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{formatDate(review.createdAt)}</span>
                {review.weddingDate && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Svatba: {formatDate(review.weddingDate)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2 mb-3">
            {renderStars(review.rating)}
            <span className="text-sm font-medium text-gray-700">
              {review.rating.toFixed(1)}
            </span>
          </div>

          {/* Service Used */}
          {review.serviceUsed && (
            <p className="text-sm text-gray-600 mb-3">
              Služba: <span className="font-medium">{review.serviceUsed}</span>
            </p>
          )}

          {/* Review Text */}
          <p className="text-gray-700 leading-relaxed mb-4">{review.text}</p>

          {/* Detailed Ratings */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Kvalita:</span>
              <div className="flex items-center space-x-1">
                {renderStars(review.ratings.quality)}
                <span className="text-gray-700 ml-1">{review.ratings.quality.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Komunikace:</span>
              <div className="flex items-center space-x-1">
                {renderStars(review.ratings.communication)}
                <span className="text-gray-700 ml-1">{review.ratings.communication.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Poměr cena/výkon:</span>
              <div className="flex items-center space-x-1">
                {renderStars(review.ratings.value)}
                <span className="text-gray-700 ml-1">{review.ratings.value.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Profesionalita:</span>
              <div className="flex items-center space-x-1">
                {renderStars(review.ratings.professionalism)}
                <span className="text-gray-700 ml-1">{review.ratings.professionalism.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Images (if any) */}
          {review.images && review.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {/* Vendor Response */}
          {review.response && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Odpověď dodavatele</span>
                <span className="text-xs text-gray-500">
                  {formatDate(review.response.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-700">{review.response.text}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}