'use client'

import { useState, useEffect } from 'react'
import { useAICoach, CoachSuggestion } from '@/hooks/useAICoach'
import { 
  Sparkles, 
  Heart, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Calendar,
  MessageCircle,
  ChevronRight,
  X,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import MoodTracker from './MoodTracker'

interface SvatbotWidgetProps {
  showMoodTracker?: boolean
  compact?: boolean
}

export default function SvatbotWidget({ showMoodTracker = true, compact = false }: SvatbotWidgetProps) {
  const { suggestions, emotionalInsight, loading, svatbot } = useAICoach()
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([])
  const [showAllSuggestions, setShowAllSuggestions] = useState(false)

  const activeSuggestions = suggestions.filter(s => !dismissedSuggestions.includes(s.id))

  const handleDismiss = (id: string) => {
    setDismissedSuggestions(prev => [...prev, id])
  }

  const getSuggestionIcon = (type: CoachSuggestion['type']) => {
    switch (type) {
      case 'motivation': return '🎉'
      case 'task': return '⏰'
      case 'relaxation': return '🧘'
      case 'milestone': return '🎊'
      case 'relationship': return '💑'
      default: return '💡'
    }
  }

  const getPriorityColor = (priority: CoachSuggestion['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50'
      case 'medium': return 'border-l-yellow-500 bg-yellow-50'
      case 'low': return 'border-l-blue-500 bg-blue-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{svatbot.name}</h3>
            <p className="text-xs text-gray-600">{svatbot.tagline}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
          </div>
        ) : activeSuggestions.length > 0 ? (
          <div className="space-y-2">
            {activeSuggestions.slice(0, 2).map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-3 rounded-lg border-l-4 ${getPriorityColor(suggestion.priority)}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">{getSuggestionIcon(suggestion.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{suggestion.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{suggestion.message}</p>
                    {suggestion.actionUrl && (
                      <Link 
                        href={suggestion.actionUrl}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-2 inline-flex items-center gap-1"
                      >
                        Zobrazit <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  <button
                    onClick={() => handleDismiss(suggestion.id)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {activeSuggestions.length > 2 && (
              <button
                onClick={() => setShowAllSuggestions(true)}
                className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium py-2"
              >
                Zobrazit další ({activeSuggestions.length - 2})
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">
              Skvělá práce! Momentálně nemám žádná doporučení. 🎉
            </p>
          </div>
        )}
      </div>
    )
  }

  // Full version
  return (
    <div className="space-y-6">
      {/* Svatbot Header */}
      <div className="bg-gradient-to-r from-primary-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
            <span className="text-3xl">🤖</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{svatbot.name}</h2>
            <p className="text-white/90">{svatbot.tagline}</p>
          </div>
          <Link
            href="/ai"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium">Chat</span>
          </Link>
        </div>

        {/* Emotional Insight Summary */}
        {emotionalInsight && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span className="font-medium">Vaše nálada:</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">
                  {emotionalInsight.overallMood === 'positive' ? '😊 Pozitivní' :
                   emotionalInsight.overallMood === 'neutral' ? '😐 Neutrální' :
                   '😰 Stres'}
                </span>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  Stres: {emotionalInsight.stressLevel}/10
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mood Tracker */}
      {showMoodTracker && <MoodTracker compact />}

      {/* Suggestions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-bold text-gray-900">Doporučení od Svatbota</h3>
          </div>
          {activeSuggestions.length > 0 && (
            <span className="text-sm text-gray-600">
              {activeSuggestions.length} {activeSuggestions.length === 1 ? 'doporučení' : 'doporučení'}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          </div>
        ) : activeSuggestions.length > 0 ? (
          <div className="space-y-3">
            {(showAllSuggestions ? activeSuggestions : activeSuggestions.slice(0, 3)).map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-4 rounded-lg border-l-4 ${getPriorityColor(suggestion.priority)} transition-all hover:shadow-md`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{getSuggestionIcon(suggestion.type)}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1">{suggestion.title}</h4>
                    <p className="text-sm text-gray-700">{suggestion.message}</p>
                    {suggestion.actionUrl && (
                      <Link 
                        href={suggestion.actionUrl}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-2 inline-flex items-center gap-1"
                      >
                        Přejít na akci <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                  <button
                    onClick={() => handleDismiss(suggestion.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    title="Zavřít"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            
            {!showAllSuggestions && activeSuggestions.length > 3 && (
              <button
                onClick={() => setShowAllSuggestions(true)}
                className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium py-3 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Zobrazit všechna doporučení ({activeSuggestions.length - 3} dalších)
              </button>
            )}
            
            {showAllSuggestions && activeSuggestions.length > 3 && (
              <button
                onClick={() => setShowAllSuggestions(false)}
                className="w-full text-sm text-gray-600 hover:text-gray-700 font-medium py-2"
              >
                Zobrazit méně
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-900 font-semibold mb-1">Skvělá práce! 🎉</p>
            <p className="text-sm text-gray-600">
              Momentálně nemám žádná doporučení. Pokračujte v dobré práci!
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/ai"
          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              <MessageCircle className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Zeptat se Svatbota</p>
              <p className="text-xs text-gray-600">Otevřít chat</p>
            </div>
          </div>
        </Link>

        <Link
          href="/tasks"
          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Úkoly</p>
              <p className="text-xs text-gray-600">Zobrazit všechny</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

