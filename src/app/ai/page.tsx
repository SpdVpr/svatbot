'use client'

import { useState, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import { useSearchParams } from 'next/navigation'
import {
  Bot,
  Sparkles,
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  MessageCircle,
  Info
} from 'lucide-react'
import Link from 'next/link'
import AIAssistant from '@/components/ai/AIAssistant'
import { Timestamp } from 'firebase/firestore'

// Helper funkce pro formátování data z Firebase
const formatDate = (date: any): string => {
  if (!date) return 'Neurčeno'

  let dateObj: Date

  if (date instanceof Date) {
    dateObj = date
  } else if (date instanceof Timestamp) {
    dateObj = date.toDate()
  } else if (typeof date === 'string') {
    dateObj = new Date(date)
  } else if (date.seconds) {
    // Firestore Timestamp object
    dateObj = new Date(date.seconds * 1000)
  } else {
    return 'Neurčeno'
  }

  return dateObj.toLocaleDateString('cs-CZ')
}

function AIPageContent() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const searchParams = useSearchParams()
  const [quickSearchQuery, setQuickSearchQuery] = useState<string | null>(null)

  // Get pre-filled question from URL
  const prefilledQuestion = searchParams.get('question')

  // Don't show auth check - let AppTemplate handle transitions smoothly
  if (!user || !wedding) {
    return null
  }

  const tabs = [
    {
      id: 'chat' as const,
      name: 'AI Chat',
      icon: MessageCircle,
      description: 'Zeptejte se na cokoliv o svatbě'
    },
    {
      id: 'vendors' as const,
      name: 'Doporučení dodavatelů',
      icon: Users,
      description: 'AI doporučí nejlepší dodavatele'
    },
    {
      id: 'timeline' as const,
      name: 'Timeline generátor',
      icon: Calendar,
      description: 'Automatické plánování svatebního dne'
    },
    {
      id: 'budget' as const,
      name: 'Optimalizace rozpočtu',
      icon: DollarSign,
      description: 'Inteligentní úspora peněz'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Compact Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Zpět</span>
              </Link>

              <div className="h-6 w-px bg-gray-300" />

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
                  <Bot className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Svatbot AI</h1>
                  <p className="text-xs text-gray-600 hidden sm:block">
                    Tvůj svatební asistent
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700 hidden sm:inline">GPT-4 + Perplexity</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Main Chat Section - HERO */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Popovídej si se Svatbotem</h2>
                    <p className="text-sm text-purple-100">Zeptej se na cokoliv o své svatbě</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-white">Online</span>
                </div>
              </div>
            </div>

            {/* Chat Component */}
            <div className="p-6">
              <AIAssistant
                className="h-[600px]"
                compact={false}
                defaultOpen={true}
                prefilledQuestion={prefilledQuestion || quickSearchQuery || undefined}
                onQuestionSent={() => setQuickSearchQuery(null)}
              />
            </div>
          </div>
        </div>

        {/* Wedding Context Info - Compact */}
        {wedding && (
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Info className="w-5 h-5 text-blue-500 mr-2" />
                Kontext tvé svatby
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Snoubenec:</span>
                  <div className="font-medium">{wedding.brideName} & {wedding.groomName}</div>
                </div>
                <div>
                  <span className="text-gray-500">Datum:</span>
                  <div className="font-medium">
                    {formatDate(wedding.weddingDate)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Počet hostů:</span>
                  <div className="font-medium">{wedding.estimatedGuestCount || 'Neurčeno'}</div>
                </div>
                <div>
                  <span className="text-gray-500">Rozpočet:</span>
                  <div className="font-medium">
                    {wedding.budget
                      ? `${wedding.budget.toLocaleString()} Kč`
                      : 'Neurčeno'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function AIPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-12 h-12 text-pink-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Načítám AI asistenta...</p>
        </div>
      </div>
    }>
      <AIPageContent />
    </Suspense>
  )
}
