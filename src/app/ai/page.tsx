'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import { useGuest } from '@/hooks/useGuest'
import { useBudget } from '@/hooks/useBudget'
import { useTask } from '@/hooks/useTask'
import { useSeating } from '@/hooks/useSeating'
import { useWeddingWebsite } from '@/hooks/useWeddingWebsite'
import { useAccommodation } from '@/hooks/useAccommodation'
import { useShopping } from '@/hooks/useShopping'
import { useCalendar } from '@/hooks/useCalendar'
import { useSearchParams } from 'next/navigation'
import {
  Bot,
  Sparkles,
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  MessageCircle,
  Lightbulb,
  TrendingUp,
  Database,
  CheckCircle,
  AlertCircle,
  Info,
  Armchair,
  Globe,
  Hotel,
  ShoppingCart,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import AIAssistant from '@/components/ai/AIAssistant'
import AIVendorRecommendations from '@/components/ai/AIVendorRecommendations'
import AITimelineGenerator from '@/components/ai/AITimelineGenerator'
import AIBudgetOptimizer from '@/components/ai/AIBudgetOptimizer'
import SvatbotWidget from '@/components/ai/SvatbotWidget'
import MoodTracker from '@/components/ai/MoodTracker'

function AIPageContent() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { guests } = useGuest()
  const { budgetItems, stats } = useBudget()
  const { tasks } = useTask()
  const { tables, stats: seatingStats } = useSeating()
  const { website } = useWeddingWebsite()
  const { accommodations, stats: accommodationStats } = useAccommodation()
  const { items: shoppingItems, stats: shoppingStats } = useShopping()
  const { stats: calendarStats } = useCalendar()
  const searchParams = useSearchParams()
  const [showDataInfo, setShowDataInfo] = useState(true)
  const [quickSearchQuery, setQuickSearchQuery] = useState<string | null>(null)

  // Get pre-filled question from URL
  const prefilledQuestion = searchParams.get('question')

  // Calculate what data AI has access to
  const guestsWithDietary = guests?.filter(g => g.dietaryRestrictions && g.dietaryRestrictions.length > 0) || []
  const overdueTasks = tasks?.filter(t => {
    if (!t.dueDate || t.status === 'completed') return false
    return new Date(t.dueDate) < new Date()
  }) || []
  const totalSeats = seatingStats?.totalSeats || tables?.reduce((sum, table) => sum + table.capacity, 0) || 0
  const assignedSeats = seatingStats?.assignedSeats || 0

  if (!user) {
    return (
      <div className="min-h-screen wedding-gradient flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h2 className="heading-3 mb-2">Přihlaste se pro AI asistenta</h2>
          <p className="body-large text-text-muted mb-6">
            AI funkce jsou dostupné pouze pro přihlášené uživatele
          </p>
          <Link href="/" className="btn-primary">
            Přihlásit se
          </Link>
        </div>
      </div>
    )
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

        {/* Quick Actions - Collapsible */}
        <div className="mb-6">
          <button
            onClick={() => setShowDataInfo(!showDataInfo)}
            className="w-full bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Rychlé akce a tipy</h3>
                  <p className="text-sm text-gray-600">Klikni pro zobrazení rychlých otázek a přehledu dat</p>
                </div>
              </div>
              <div className={`transform transition-transform ${showDataInfo ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Collapsible Content */}
        {showDataInfo && (
          <div className="mb-6 space-y-6 animate-fade-in">
            {/* Quick Search Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Rychlé vyhledávání</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  Real-time
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Klikni na tlačítko pro okamžité vyhledání aktuálních informací z internetu
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <button
                  onClick={() => setQuickSearchQuery('Jaké jsou aktuální svatební trendy pro rok 2025?')}
                  className="p-3 bg-gradient-to-br from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 border border-pink-200 rounded-lg transition-all"
                >
                  <TrendingUp className="w-5 h-5 text-pink-600 mb-2 mx-auto" />
                  <div className="text-xs font-medium text-pink-700">Trendy 2025</div>
                </button>

                <button
                  onClick={() => setQuickSearchQuery(`Najdi mi svatební fotografy v ${wedding?.region || 'Praze'}`)}
                  className="p-3 bg-gradient-to-br from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-200 rounded-lg transition-all"
                >
                  <Users className="w-5 h-5 text-purple-600 mb-2 mx-auto" />
                  <div className="text-xs font-medium text-purple-700">Fotografové</div>
                </button>

                <button
                  onClick={() => setQuickSearchQuery(`Kolik stojí catering pro ${wedding?.estimatedGuestCount || '80'} hostů?`)}
                  className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 rounded-lg transition-all"
                >
                  <DollarSign className="w-5 h-5 text-green-600 mb-2 mx-auto" />
                  <div className="text-xs font-medium text-green-700">Ceny</div>
                </button>

                <button
                  onClick={() => setQuickSearchQuery(`Doporuč svatební místa v ${wedding?.region || 'Praze'}`)}
                  className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-200 rounded-lg transition-all"
                >
                  <Globe className="w-5 h-5 text-blue-600 mb-2 mx-auto" />
                  <div className="text-xs font-medium text-blue-700">Místa</div>
                </button>

                <button
                  onClick={() => setQuickSearchQuery('Jaké jsou nejlepší nápady na svatební dekorace?')}
                  className="p-3 bg-gradient-to-br from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 border border-yellow-200 rounded-lg transition-all"
                >
                  <Lightbulb className="w-5 h-5 text-yellow-600 mb-2 mx-auto" />
                  <div className="text-xs font-medium text-yellow-700">Inspirace</div>
                </button>

                <button
                  onClick={() => setQuickSearchQuery(`Najdi ubytování pro hosty v okolí ${wedding?.region || 'Prahy'}`)}
                  className="p-3 bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 border border-orange-200 rounded-lg transition-all"
                >
                  <Hotel className="w-5 h-5 text-orange-600 mb-2 mx-auto" />
                  <div className="text-xs font-medium text-orange-700">Ubytování</div>
                </button>
              </div>
            </div>

            {/* Data Overview Panel */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Database className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">AI má přístup k tvým datům</h3>
              </div>
              <p className="text-sm text-green-700 mb-4">
                Svatbot vidí všechna tvá data a může odpovídat na konkrétní otázky o tvé svatbě.
              </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Guests */}
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Hosté</span>
                      </div>
                      <p className="text-xs text-green-700">
                        {guests?.length || 0} hostů
                        {guestsWithDietary.length > 0 && (
                          <span className="block mt-1">
                            {guestsWithDietary.length} s dietními omezeními
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Budget */}
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Rozpočet</span>
                      </div>
                      <p className="text-xs text-green-700">
                        {budgetItems?.length || 0} položek
                        {stats && (
                          <span className="block mt-1">
                            {stats.budgetUsed}% využito
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Tasks */}
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Úkoly</span>
                      </div>
                      <p className="text-xs text-green-700">
                        {tasks?.length || 0} úkolů
                        {overdueTasks.length > 0 && (
                          <span className="block mt-1 text-orange-600">
                            {overdueTasks.length} po termínu
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Seating Plan */}
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Armchair className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Seating Plan</span>
                      </div>
                      <p className="text-xs text-green-700">
                        {tables?.length || 0} stolů
                        {totalSeats > 0 && (
                          <span className="block mt-1">
                            {assignedSeats}/{totalSeats} míst obsazeno
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Wedding Website */}
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Globe className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Svatební web</span>
                      </div>
                      <p className="text-xs text-green-700">
                        {website ? (
                          <>
                            {website.isPublished ? 'Publikováno' : 'Nepublikováno'}
                            <span className="block mt-1">
                              {website.analytics?.views || 0} zobrazení
                            </span>
                          </>
                        ) : (
                          'Nevytvořeno'
                        )}
                      </p>
                    </div>

                    {/* Accommodations */}
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Hotel className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Ubytování</span>
                      </div>
                      <p className="text-xs text-green-700">
                        {accommodations?.length || 0} ubytování
                        {accommodationStats && (
                          <span className="block mt-1">
                            {accommodationStats.reservedRooms}/{accommodationStats.totalRooms} pokojů rezervováno
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Shopping List */}
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <ShoppingCart className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Nákupní seznam</span>
                      </div>
                      <p className="text-xs text-green-700">
                        {shoppingItems?.length || 0} položek
                        {shoppingStats && (
                          <span className="block mt-1">
                            {shoppingStats.purchasedItems} zakoupeno
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Calendar */}
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Kalendář</span>
                      </div>
                      <p className="text-xs text-green-700">
                        {calendarStats?.totalEvents || 0} událostí
                        {calendarStats && calendarStats.todayEvents > 0 && (
                          <span className="block mt-1">
                            {calendarStats.todayEvents} dnes
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

              {/* Example questions */}
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Příklady otázek:</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  <button
                    onClick={() => setQuickSearchQuery('Kdo má alergii na lepek?')}
                    className="text-xs text-green-700 hover:text-green-900 text-left hover:underline"
                  >
                    "Kdo má alergii na lepek?"
                  </button>
                  <button
                    onClick={() => setQuickSearchQuery('Jsem v rozpočtu?')}
                    className="text-xs text-green-700 hover:text-green-900 text-left hover:underline"
                  >
                    "Jsem v rozpočtu?"
                  </button>
                  <button
                    onClick={() => setQuickSearchQuery('Co je po termínu?')}
                    className="text-xs text-green-700 hover:text-green-900 text-left hover:underline"
                  >
                    "Co je po termínu?"
                  </button>
                  <button
                    onClick={() => setQuickSearchQuery('Kolik mám stolů?')}
                    className="text-xs text-green-700 hover:text-green-900 text-left hover:underline"
                  >
                    "Kolik mám stolů?"
                  </button>
                  <button
                    onClick={() => setQuickSearchQuery('Je svatební web publikovaný?')}
                    className="text-xs text-green-700 hover:text-green-900 text-left hover:underline"
                  >
                    "Je svatební web publikovaný?"
                  </button>
                  <button
                    onClick={() => setQuickSearchQuery('Kdo ještě nepotvrdil účast?')}
                    className="text-xs text-green-700 hover:text-green-900 text-left hover:underline"
                  >
                    "Kdo ještě nepotvrdil účast?"
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wedding Context Info - Compact */}
        {wedding && showDataInfo && (
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
                    {wedding.weddingDate
                      ? wedding.weddingDate.toLocaleDateString('cs-CZ')
                      : 'Neurčeno'
                    }
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
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
