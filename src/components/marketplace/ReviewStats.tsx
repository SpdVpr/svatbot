'use client'

import { Star } from 'lucide-react'
import type { ReviewStats } from '@/types/review'

interface ReviewStatsProps {
  stats: ReviewStats
}

export default function ReviewStatsComponent({ stats }: ReviewStatsProps) {
  const { totalReviews, averageRating, ratingDistribution, averageRatings } = stats

  if (totalReviews === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Zatím žádné recenze</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Rating */}
      <div className="text-center pb-6 border-b border-gray-200">
        <div className="text-5xl font-bold text-gray-900 mb-2">
          {averageRating.toFixed(1)}
        </div>
        <div className="flex items-center justify-center space-x-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-6 h-6 ${
                star <= Math.round(averageRating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-gray-600">
          Průměr z {totalReviews} {totalReviews === 1 ? 'recenze' : totalReviews < 5 ? 'recenzí' : 'recenzí'}
        </p>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900 mb-3">Rozložení hodnocení</h3>
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingDistribution[rating as keyof typeof ratingDistribution]
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

          return (
            <div key={rating} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-20">
                <span className="text-sm text-gray-700">{rating}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
              </div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">
                {count}
              </span>
            </div>
          )
        })}
      </div>

      {/* Detailed Average Ratings */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3">Průměrné hodnocení kategorií</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Kvalita služeb</span>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRatings.quality)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {averageRatings.quality.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Komunikace</span>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRatings.communication)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {averageRatings.communication.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Poměr cena/výkon</span>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRatings.value)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {averageRatings.value.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Profesionalita</span>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRatings.professionalism)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {averageRatings.professionalism.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}