import { Star } from 'lucide-react'
import { GoogleReview } from '@/types/vendor'
import { useState } from 'react'

interface GoogleReviewCardProps {
  review: GoogleReview
}

export default function GoogleReviewCard({ review }: GoogleReviewCardProps) {
  const [imageError, setImageError] = useState(false)

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Author Photo */}
          {review.profile_photo_url && !imageError ? (
            <img
              src={review.profile_photo_url}
              alt={review.author_name}
              className="w-10 h-10 rounded-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {review.author_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Author Info */}
          <div>
            {review.author_url ? (
              <a
                href={review.author_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-900 hover:text-primary-600 transition-colors"
              >
                {review.author_name}
              </a>
            ) : (
              <p className="font-medium text-gray-900">{review.author_name}</p>
            )}
            <p className="text-xs text-gray-500">{review.relative_time_description}</p>
          </div>
        </div>

        {/* Google Logo Badge */}
        <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded px-2 py-1">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-xs font-medium text-gray-600">Google</span>
        </div>
      </div>

      {/* Rating */}
      <div className="mb-3">
        {renderStars(review.rating)}
      </div>

      {/* Review Text */}
      {review.text && (
        <p className="text-gray-700 text-sm leading-relaxed">
          {review.text}
        </p>
      )}
    </div>
  )
}

