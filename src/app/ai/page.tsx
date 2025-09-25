'use client'

import { useState, useEffect } from 'react'
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
  Lightbulb,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import AIAssistant from '@/components/ai/AIAssistant'
import AIVendorRecommendations from '@/components/ai/AIVendorRecommendations'
import AITimelineGenerator from '@/components/ai/AITimelineGenerator'
import AIBudgetOptimizer from '@/components/ai/AIBudgetOptimizer'

export default function AIPage() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'chat' | 'vendors' | 'timeline' | 'budget'>('chat')

  // Set active tab from URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['chat', 'vendors', 'timeline', 'budget'].includes(tab)) {
      setActiveTab(tab as 'chat' | 'vendors' | 'timeline' | 'budget')
    }
  }, [searchParams])

  // Get pre-filled question from URL
  const prefilledQuestion = searchParams.get('question')

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

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Description */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                {(() => {
                  const currentTab = tabs.find(t => t.id === activeTab)
                  const IconComponent = currentTab?.icon || Bot
                  return <IconComponent className="w-5 h-5 text-blue-600" />
                })()}
              </div>
              <div>
                <h2 className="font-semibold text-blue-900">
                  {tabs.find(t => t.id === activeTab)?.name}
                </h2>
                <p className="text-sm text-blue-700">
                  {tabs.find(t => t.id === activeTab)?.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'chat' && (
            <div className="max-w-4xl mx-auto">
              <AIAssistant
                className="h-[600px]"
                compact={false}
                defaultOpen={true}
                prefilledQuestion={prefilledQuestion}
              />
            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AIVendorRecommendations 
                category="venue"
                onVendorSelect={(vendor) => {
                  console.log('Selected vendor:', vendor)
                }}
              />
              <AIVendorRecommendations 
                category="photographer"
                onVendorSelect={(vendor) => {
                  console.log('Selected vendor:', vendor)
                }}
              />
              <AIVendorRecommendations 
                category="catering"
                onVendorSelect={(vendor) => {
                  console.log('Selected vendor:', vendor)
                }}
              />
              <AIVendorRecommendations 
                category="florist"
                onVendorSelect={(vendor) => {
                  console.log('Selected vendor:', vendor)
                }}
              />
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="max-w-4xl mx-auto">
              <AITimelineGenerator 
                onTimelineSave={(timeline) => {
                  console.log('Timeline saved:', timeline)
                  // TODO: Save to timeline module
                }}
              />
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="max-w-4xl mx-auto">
              <AIBudgetOptimizer 
                onOptimizationApply={(optimization) => {
                  console.log('Optimization applied:', optimization)
                  // TODO: Apply to budget module
                }}
              />
            </div>
          )}
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
