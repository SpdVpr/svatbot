'use client'

import { useState, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useSearchParams } from 'next/navigation'
import {
  Bot,
  Sparkles,
  Calendar,
  DollarSign,
  Users,
  MessageCircle,
  Info
} from 'lucide-react'
import AIAssistant from '@/components/ai/AIAssistant'
import ModuleHeader from '@/components/common/ModuleHeader'
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
  const { formatCurrency } = useCurrency()
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
    <div className="min-h-screen">
      {/* Header */}
      <ModuleHeader
        icon={Bot}
        title="SvatBot AI"
        subtitle="Váš chytrý svatební asistent"
        iconGradient="from-purple-500 to-blue-500"
        actions={
          <div className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">GPT-5</span>
          </div>
        }
      />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Main Chat Section - HERO */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Chat Header - Compact on mobile */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-bold text-white">Popovídej si se Svatbotem</h2>
                    <p className="text-xs sm:text-sm text-purple-100 hidden sm:block">Zeptej se na cokoliv o své svatbě</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-white">Online</span>
                </div>
              </div>
            </div>

            {/* Chat Component - No padding on mobile for full width */}
            <div className="p-0 sm:p-6">
              <AIAssistant
                className="h-[500px] sm:h-[600px]"
                compact={false}
                defaultOpen={true}
                prefilledQuestion={prefilledQuestion || quickSearchQuery || undefined}
                onQuestionSent={() => setQuickSearchQuery(null)}
              />
            </div>
          </div>
        </div>

        {/* Wedding Context Info */}
        {wedding && (
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Info className="w-5 h-5 text-blue-500 mr-2" />
                Kontext vaší svatby
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
                      ? formatCurrency(wedding.budget)
                      : 'Neurčeno'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
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
