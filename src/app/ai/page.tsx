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
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Zpět na dashboard</span>
              </Link>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="heading-4">AI Svatební Asistent</h1>
                  <p className="body-small text-text-muted">
                    Inteligentní nástroje pro plánování vaší svatby
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-600">Powered by OpenAI</span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat indicator */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <div className="flex items-center space-x-2 border-b-2 border-primary-500 text-primary-600 py-4 px-1">
              <MessageCircle className="w-4 h-4" />
              <span className="font-medium text-sm">AI Chat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Data Info Panel */}
        {showDataInfo && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <Database className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">AI má přístup k vašim datům</h3>
                  </div>
                  <p className="text-sm text-green-700 mb-4">
                    Chatbot vidí všechna vaše data a může odpovídat na konkrétní otázky o vaší svatbě.
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
                      <p className="text-xs text-green-700">"Kdo má alergii na lepek?"</p>
                      <p className="text-xs text-green-700">"Jsem v rozpočtu?"</p>
                      <p className="text-xs text-green-700">"Co je po termínu?"</p>
                      <p className="text-xs text-green-700">"Kolik mám stolů?"</p>
                      <p className="text-xs text-green-700">"Je svatební web publikovaný?"</p>
                      <p className="text-xs text-green-700">"Kolik mám volných pokojů?"</p>
                      <p className="text-xs text-green-700">"Co ještě musím nakoupit?"</p>
                      <p className="text-xs text-green-700">"Jaké události mám tento týden?"</p>
                      <p className="text-xs text-green-700">"Kdo ještě nepotvrdil účast?"</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDataInfo(false)}
                  className="ml-4 text-green-600 hover:text-green-800"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Description */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-blue-900">AI Chat</h2>
                <p className="text-sm text-blue-700">Zeptejte se na cokoliv o svatbě - AI zná všechna vaše data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Content */}
        <div className="space-y-8">
          <div className="max-w-4xl mx-auto">
            <AIAssistant
              className="h-[600px]"
              compact={false}
              defaultOpen={true}
              prefilledQuestion={prefilledQuestion}
            />
          </div>
        </div>

        {/* Wedding Context Info */}
        {wedding && (
          <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
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
              <div>
                <span className="text-gray-500">Styl:</span>
                <div className="font-medium capitalize">{wedding.style || 'Neurčeno'}</div>
              </div>
              <div>
                <span className="text-gray-500">Region:</span>
                <div className="font-medium">{wedding.region || 'Neurčeno'}</div>
              </div>
              <div>
                <span className="text-gray-500">Pokrok:</span>
                <div className="font-medium">{wedding.progress?.overall || 0}%</div>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <div className="font-medium capitalize">{wedding.status || 'Plánování'}</div>
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
