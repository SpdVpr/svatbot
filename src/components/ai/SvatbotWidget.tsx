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
import Image from 'next/image'
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

  // Remove emojis from text
  const removeEmojis = (text: string) => {
    return text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '').trim()
  }

  const getPriorityColor = (priority: CoachSuggestion['priority']) => {
    switch (priority) {
      case 'high': return 'bg-primary-50'
      case 'medium': return 'bg-primary-50'
      case 'low': return 'bg-primary-50'
      default: return 'bg-primary-50'
    }
  }

  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-primary-500 overflow-hidden" style={{ padding: '0' }}>
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full"
              style={{
                objectFit: 'cover',
                imageRendering: 'auto',
                WebkitFontSmoothing: 'antialiased',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                willChange: 'transform'
              }}
            >
              <source src="/animated2.webm" type="video/webm" />
            </video>
          </div>
          <div>
            <h3 className="font-bold text-gray-900" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Upright', serif", fontSize: '30px' }}>Svatbot - tvůj plánovací parťák</h3>
            <p className="text-xs text-gray-600">Jsem tu pro tebe!</p>
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
                className={`p-3 rounded-lg ${getPriorityColor(suggestion.priority)}`}
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
              ✨ Jsi úžasná! Zatím tu pro tebe nemám žádnou zprávu, ale jsem tu, kdyby ses chtěla popovídat! 💕
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
      <div className="bg-gradient-to-r from-primary-500 to-primary-400 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="bg-white rounded-full flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden" style={{ width: '80px', height: '130px', padding: '0' }}>
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full"
              style={{
                objectFit: 'cover',
                imageRendering: 'auto',
                WebkitFontSmoothing: 'antialiased',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                willChange: 'transform'
              }}
            >
              <source src="/animated2.webm" type="video/webm" />
            </video>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold mb-2 leading-tight" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Upright', serif", fontSize: '30px' }}>Svatbot - tvůj plánovací parťák</h2>
            <p className="text-white/90 text-base leading-relaxed">Jsem tu pro tebe! Povzbudím tě a budu ti dělat společnost!</p>
          </div>
        </div>


      </div>

      {/* Mood Tracker */}
      {showMoodTracker && <MoodTracker compact />}

      {/* Messages from Svatbot */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg text-gray-900" style={{ fontWeight: 600 }}>Zprávy od Svatbota</h3>
          </div>
          {activeSuggestions.length > 0 && (
            <span className="text-sm text-gray-600">
              {activeSuggestions.length} {activeSuggestions.length === 1 ? 'zpráva' : activeSuggestions.length < 5 ? 'zprávy' : 'zpráv'}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          </div>
        ) : activeSuggestions.length > 0 ? (
          <div className="space-y-3">
            {activeSuggestions.slice(0, 2).map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-4 rounded-lg ${getPriorityColor(suggestion.priority)} transition-all hover:shadow-md`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{getSuggestionIcon(suggestion.type)}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1">{removeEmojis(suggestion.title)}</h4>
                    <p className="text-sm text-gray-700">{removeEmojis(suggestion.message)}</p>
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
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">💕</span>
            </div>
            <p className="text-gray-900 font-semibold mb-1">Jsi úžasná! ✨</p>
            <p className="text-sm text-gray-600">
              Zatím tu pro tebe nemám žádnou zprávu, ale jsem tu, kdyby ses chtěla popovídat! 💬
            </p>
          </div>
        )}

        {/* Chat Button */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            href="/ai"
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Popovídat si se Svatbotem</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

