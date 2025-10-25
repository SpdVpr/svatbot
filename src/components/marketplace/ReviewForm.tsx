'use client'

import { useState } from 'react'
import { Star, X, Upload, Loader2 } from 'lucide-react'
import type { CreateReviewData } from '@/types/review'

interface ReviewFormProps {
  vendorId: string
  vendorName: string
  onSubmit: (data: CreateReviewData) => Promise<void>
  onCancel: () => void
}

export default function ReviewForm({ vendorId, vendorName, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [text, setText] = useState('')
  const [ratings, setRatings] = useState({
    quality: 5,
    communication: 5,
    value: 5,
    professionalism: 5
  })
  const [serviceUsed, setServiceUsed] = useState('')
  const [weddingDate, setWeddingDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (text.length < 1) {
      setError('Recenze musí obsahovat alespoň 1 znak')
      return
    }

    setIsSubmitting(true)

    try {
      const reviewData: CreateReviewData = {
        vendorId,
        rating,
        text,
        ratings,
        serviceUsed: serviceUsed || undefined,
        weddingDate: weddingDate ? new Date(weddingDate) : undefined
      }

      await onSubmit(reviewData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (value: number, onChange: (val: number) => void, name: string) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => name === 'overall' && setHoveredRating(star)}
            onMouseLeave={() => name === 'overall' && setHoveredRating(0)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= (name === 'overall' ? (hoveredRating || value) : value)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Napsat recenzi</h2>
            <p className="text-sm text-gray-600">{vendorName}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Celkové hodnocení *
            </label>
            {renderStars(rating, setRating, 'overall')}
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vaše recenze *
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Popište vaši zkušenost s tímto dodavatelem..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent h-32"
              required
              minLength={1}
            />
            <p className="text-sm text-gray-500 mt-1">
              {text.length} znaků
            </p>
          </div>

          {/* Detailed Ratings */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Detailní hodnocení</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Kvalita služeb</label>
                {renderStars(ratings.quality, (val) => setRatings({ ...ratings, quality: val }), 'quality')}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Komunikace</label>
                {renderStars(ratings.communication, (val) => setRatings({ ...ratings, communication: val }), 'communication')}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Poměr cena/výkon</label>
                {renderStars(ratings.value, (val) => setRatings({ ...ratings, value: val }), 'value')}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Profesionalita</label>
                {renderStars(ratings.professionalism, (val) => setRatings({ ...ratings, professionalism: val }), 'professionalism')}
              </div>
            </div>
          </div>

          {/* Optional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Využitá služba
              </label>
              <input
                type="text"
                value={serviceUsed}
                onChange={(e) => setServiceUsed(e.target.value)}
                placeholder="Např. Kompletní svatební fotografie"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datum svatby
              </label>
              <input
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Upozornění:</strong> Vaše recenze bude před zveřejněním zkontrolována administrátorem. 
              Ujistěte se, že je konstruktivní a dodržuje naše zásady.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={isSubmitting || text.length < 1}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Odesílám...</span>
                </>
              ) : (
                <span>Odeslat recenzi</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}