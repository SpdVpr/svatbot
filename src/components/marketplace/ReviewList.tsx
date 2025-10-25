'use client'

import { useState } from 'react'
import ReviewCard from './ReviewCard'
import ReviewStatsComponent from './ReviewStats'
import type { VendorReview, ReviewStats } from '@/types/review'
import { Star, Filter } from 'lucide-react'

interface ReviewListProps {
  reviews: VendorReview[]
  stats: ReviewStats
  showStats?: boolean
}

export default function ReviewList({ reviews, stats, showStats = true }: ReviewListProps) {
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')

  // Filter and sort reviews
  let filteredReviews = [...reviews]

  // Apply rating filter
  if (filterRating) {
    filteredReviews = filteredReviews.filter(r => r.rating === filterRating)
  }

  // Apply sorting
  filteredReviews.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.createdAt.getTime() - a.createdAt.getTime()
      case 'oldest':
        return a.createdAt.getTime() - b.createdAt.getTime()
      case 'highest':
        return b.rating - a.rating
      case 'lowest':
        return a.rating - b.rating
      default:
        return 0
    }
  })

  return (
    <div className="space-y-6">
      {showStats && (
        <div className="wedding-card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Přehled hodnocení</h2>
          <ReviewStatsComponent stats={stats} />
        </div>
      )}

      <div className="wedding-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recenze ({reviews.length})
          </h2>

          <div className="flex items-center space-x-3">
            {/* Rating Filter */}
            <div className="relative">
              <select
                value={filterRating || ''}
                onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Všechna hodnocení</option>
                <option value="5">5 hvězdiček</option>
                <option value="4">4 hvězdičky</option>
                <option value="3">3 hvězdičky</option>
                <option value="2">2 hvězdičky</option>
                <option value="1">1 hvězdička</option>
              </select>
              <Filter className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="newest">Nejnovější</option>
              <option value="oldest">Nejstarší</option>
              <option value="highest">Nejvyšší hodnocení</option>
              <option value="lowest">Nejnižší hodnocení</option>
            </select>
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {filterRating
                ? `Žádné recenze s ${filterRating} hvězdičkami`
                : 'Zatím žádné recenze. Buďte první, kdo ohodnotí tohoto dodavatele!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}