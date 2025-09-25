'use client'

import { useState } from 'react'
import { useAI } from '@/hooks/useAI'
import {
  Sparkles,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Loader2,
  RefreshCw,
  Star,
  CheckCircle,
  ExternalLink,
  Heart
} from 'lucide-react'

interface AIVendorRecommendationsProps {
  category: string
  onVendorSelect?: (vendor: any) => void
  className?: string
}

const VENDOR_CATEGORIES = {
  venue: { name: 'Místa konání', icon: MapPin },
  photographer: { name: 'Fotografové', icon: Users },
  catering: { name: 'Catering', icon: Users },
  florist: { name: 'Květinářství', icon: Heart },
  music: { name: 'Hudba & DJ', icon: Users },
  decoration: { name: 'Dekorace', icon: Star }
}

export default function AIVendorRecommendations({ 
  category, 
  onVendorSelect,
  className = '' 
}: AIVendorRecommendationsProps) {
  const { getVendorRecommendations, loading, error, clearError } = useAI()
  
  const [recommendations, setRecommendations] = useState<{
    recommendations: string[]
    reasoning: string
    budgetGuidance: string
  } | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)

  const categoryInfo = VENDOR_CATEGORIES[category as keyof typeof VENDOR_CATEGORIES] || {
    name: category,
    icon: Star
  }
  const IconComponent = categoryInfo.icon

  const handleGenerateRecommendations = async () => {
    clearError()
    try {
      const result = await getVendorRecommendations(category)
      setRecommendations(result)
      setHasGenerated(true)
    } catch (err) {
      console.error('Failed to generate recommendations:', err)
    }
  }

  const handleRefresh = () => {
    setRecommendations(null)
    setHasGenerated(false)
    handleGenerateRecommendations()
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <IconComponent className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Doporučení</h3>
            <p className="text-sm text-gray-500">{categoryInfo.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          {hasGenerated && (
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Obnovit doporučení"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!hasGenerated ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary-500" />
          </div>
          <h4 className="font-medium text-gray-900 mb-2">
            Získejte personalizovaná doporučení
          </h4>
          <p className="text-sm text-gray-500 mb-6">
            AI analyzuje váš rozpočet, styl a preference a doporučí nejlepší {categoryInfo.name.toLowerCase()}
          </p>
          <button
            onClick={handleGenerateRecommendations}
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generuji doporučení...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Získat AI doporučení</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500 mr-3" />
              <span className="text-gray-600">Generuji nová doporučení...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {recommendations && !loading && (
            <>
              {/* Budget Guidance */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Rozpočtové doporučení</h4>
                    <p className="text-sm text-blue-700">{recommendations.budgetGuidance}</p>
                  </div>
                </div>
              </div>

              {/* Reasoning */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900 mb-1">Proč tato doporučení?</h4>
                    <p className="text-sm text-purple-700">{recommendations.reasoning}</p>
                  </div>
                </div>
              </div>

              {/* Recommendations List */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-2" />
                  Doporučení pro vás
                </h4>
                <div className="space-y-3">
                  {recommendations.recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="w-6 h-6 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {index + 1}
                          </span>
                          <h5 className="font-medium text-gray-900">
                            {recommendation}
                          </h5>
                        </div>
                        <p className="text-sm text-gray-500 ml-8">
                          AI doporučení na základě vašich preferencí
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => onVendorSelect?.(recommendation)}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Vybrat
                        </button>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="btn-outline flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Nová doporučení</span>
                </button>
                
                <button
                  className="btn-primary flex items-center space-x-2"
                  onClick={() => {
                    // TODO: Navigate to marketplace with filters
                    console.log('Navigate to marketplace with category:', category)
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Prohlédnout marketplace</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
