'use client'

import { useState, useEffect } from 'react'
import { useAI } from '@/hooks/useAI'
import { useRouter } from 'next/navigation'
import {
  Bot,
  Sparkles,
  MessageCircle,
  TrendingUp,
  Lightbulb,
  Calendar,
  DollarSign,
  Users,
  ChevronRight,
  Loader2,
  RefreshCw
} from 'lucide-react'

interface AIAssistantModuleProps {
  className?: string
}

export default function AIAssistantModule({ className = '' }: AIAssistantModuleProps) {
  const { getWeddingInsights, getQuickSuggestions, loading, error } = useAI()
  const router = useRouter()
  
  const [insights, setInsights] = useState<string>('')
  const [quickSuggestions, setQuickSuggestions] = useState<string[]>([])
  const [showFullInsights, setShowFullInsights] = useState(false)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    await Promise.all([
      loadInsights(),
      loadSuggestions()
    ])
  }

  const loadInsights = async () => {
    setLoadingInsights(true)
    try {
      const result = await getWeddingInsights()
      setInsights(result)
    } catch (err) {
      console.error('Failed to load insights:', err)
    } finally {
      setLoadingInsights(false)
    }
  }

  const loadSuggestions = async () => {
    setLoadingSuggestions(true)
    try {
      const suggestions = await getQuickSuggestions()
      setQuickSuggestions(suggestions.slice(0, 3)) // Show only first 3
    } catch (err) {
      console.error('Failed to load suggestions:', err)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleRefreshInsights = () => {
    loadInsights()
  }

  const truncateInsights = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const getInsightIcon = (insight: string) => {
    const insightLower = insight.toLowerCase()
    if (insightLower.includes('rozpočet') || insightLower.includes('peníze')) return DollarSign
    if (insightLower.includes('čas') || insightLower.includes('termín')) return Calendar
    if (insightLower.includes('host') || insightLower.includes('pozvánk')) return Users
    if (insightLower.includes('úspor') || insightLower.includes('optimalizac')) return TrendingUp
    return Lightbulb
  }

  return (
    <div className={`wedding-card h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
            <Bot className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="heading-6">AI Asistent</h3>
            <p className="body-small text-text-muted">Personalizované doporučení</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <button
            onClick={handleRefreshInsights}
            disabled={loadingInsights}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Obnovit doporučení"
          >
            <RefreshCw className={`w-4 h-4 ${loadingInsights ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* AI Insights */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <Lightbulb className="w-4 h-4 text-yellow-500 mr-2" />
          AI Doporučení
        </h4>
        
        {loadingInsights ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-purple-500 mr-2" />
            <span className="text-sm text-gray-500">Analyzuji vaši svatbu...</span>
          </div>
        ) : insights ? (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-purple-100 rounded">
                {(() => {
                  const IconComponent = getInsightIcon(insights)
                  return <IconComponent className="w-4 h-4 text-purple-600" />
                })()}
              </div>
              <div className="flex-1">
                <p className="text-sm text-purple-800 leading-relaxed">
                  {showFullInsights ? insights : truncateInsights(insights)}
                </p>
                {insights.length > 150 && (
                  <button
                    onClick={() => setShowFullInsights(!showFullInsights)}
                    className="text-xs text-purple-600 hover:text-purple-700 mt-2 font-medium"
                  >
                    {showFullInsights ? 'Zobrazit méně' : 'Zobrazit více'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 text-center">
              Nepodařilo se načíst AI doporučení
            </p>
          </div>
        )}
      </div>

      {/* Quick Suggestions */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <MessageCircle className="w-4 h-4 text-blue-500 mr-2" />
          Rychlé otázky
        </h4>
        
        {loadingSuggestions ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200 group"
                onClick={() => {
                  router.push(`/ai?tab=chat&question=${encodeURIComponent(suggestion)}`)
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 group-hover:text-blue-700">
                    {suggestion}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AI Features Quick Access */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 mb-3">AI Nástroje</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/ai?tab=budget')}
            className="p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors group"
          >
            <DollarSign className="w-5 h-5 text-green-600 mb-2" />
            <div className="text-xs font-medium text-green-700">Optimalizace</div>
            <div className="text-xs text-green-600">rozpočtu</div>
          </button>

          <button
            onClick={() => router.push('/ai?tab=timeline')}
            className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group"
          >
            <Calendar className="w-5 h-5 text-blue-600 mb-2" />
            <div className="text-xs font-medium text-blue-700">Timeline</div>
            <div className="text-xs text-blue-600">generator</div>
          </button>

          <button
            onClick={() => router.push('/ai?tab=vendors')}
            className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors group"
          >
            <Users className="w-5 h-5 text-purple-600 mb-2" />
            <div className="text-xs font-medium text-purple-700">Vendor</div>
            <div className="text-xs text-purple-600">doporučení</div>
          </button>

          <button
            onClick={() => router.push('/ai?tab=chat')}
            className="p-3 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg transition-colors group"
          >
            <Bot className="w-5 h-5 text-yellow-600 mb-2" />
            <div className="text-xs font-medium text-yellow-700">AI Chat</div>
            <div className="text-xs text-yellow-600">asistent</div>
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>AI asistent aktivní</span>
          </div>
          <span>Powered by OpenAI</span>
        </div>
      </div>
    </div>
  )
}
