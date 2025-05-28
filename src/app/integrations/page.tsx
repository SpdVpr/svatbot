'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Calendar, 
  Mail, 
  BarChart3,
  Settings,
  Zap,
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import GoogleCalendarIntegration from '@/components/integrations/GoogleCalendarIntegration'
import EmailNotifications from '@/components/integrations/EmailNotifications'
import AdvancedAnalytics from '@/components/analytics/AdvancedAnalytics'

type IntegrationTab = 'calendar' | 'email' | 'analytics'

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<IntegrationTab>('calendar')

  const tabs = [
    {
      id: 'calendar' as const,
      label: 'Google Calendar',
      icon: Calendar,
      description: 'Synchronizace událostí s kalendářem'
    },
    {
      id: 'email' as const,
      label: 'Email notifikace',
      icon: Mail,
      description: 'Automatické připomínky a aktualizace'
    },
    {
      id: 'analytics' as const,
      label: 'Pokročilá analytika',
      icon: BarChart3,
      description: 'Detailní přehled pokroku svatby'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="heading-1">Integrace a analytika</h1>
              <p className="body-large text-text-muted">
                Propojte SvatBot s externími službami a získejte pokročilé přehledy
              </p>
            </div>
          </div>

          {/* Integration Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="wedding-card text-center">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="heading-4 mb-2">Google Calendar</h3>
              <p className="body-small text-text-muted mb-4">
                Automatická synchronizace všech svatebních událostí
              </p>
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Dostupné</span>
              </div>
            </div>

            <div className="wedding-card text-center">
              <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="heading-4 mb-2">Email systém</h3>
              <p className="body-small text-text-muted mb-4">
                Připomínky, potvrzení a automatické notifikace
              </p>
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Aktivní</span>
              </div>
            </div>

            <div className="wedding-card text-center">
              <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="heading-4 mb-2">Pokročilá analytika</h3>
              <p className="body-small text-text-muted mb-4">
                Detailní přehledy a doporučení pro vaši svatbu
              </p>
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Nové</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="wedding-card">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 bg-gray-100 rounded-lg p-1">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-xs text-gray-500 hidden sm:block">{tab.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'calendar' && (
            <div>
              <div className="mb-6">
                <h2 className="heading-2 mb-2">Google Calendar integrace</h2>
                <p className="body-large text-text-muted">
                  Synchronizujte všechny svatební události, úkoly a schůzky s vaším Google Calendar
                </p>
              </div>
              <GoogleCalendarIntegration />
            </div>
          )}

          {activeTab === 'email' && (
            <div>
              <div className="mb-6">
                <h2 className="heading-2 mb-2">Email notifikace</h2>
                <p className="body-large text-text-muted">
                  Nastavte automatické připomínky a notifikace pro důležité svatební události
                </p>
              </div>
              <EmailNotifications />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <div className="mb-6">
                <h2 className="heading-2 mb-2">Pokročilá analytika</h2>
                <p className="body-large text-text-muted">
                  Získejte detailní přehledy o pokroku vaší svatby a personalizovaná doporučení
                </p>
              </div>
              <AdvancedAnalytics />
            </div>
          )}
        </div>

        {/* Additional Features */}
        <div className="mt-12">
          <h2 className="heading-2 mb-6">Další integrace</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="wedding-card opacity-75">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Settings className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="heading-4">Stripe platby</h3>
                  <p className="body-small text-text-muted">Připravujeme</p>
                </div>
              </div>
              <p className="body-small text-text-muted mb-4">
                Bezpečné online platby dodavatelům přímo z aplikace
              </p>
              <div className="text-sm text-gray-500">Dostupné brzy</div>
            </div>

            <div className="wedding-card opacity-75">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <ExternalLink className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="heading-4">Social media</h3>
                  <p className="body-small text-text-muted">Připravujeme</p>
                </div>
              </div>
              <p className="body-small text-text-muted mb-4">
                Sdílení pokroku a fotek na sociálních sítích
              </p>
              <div className="text-sm text-gray-500">Dostupné brzy</div>
            </div>

            <div className="wedding-card opacity-75">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="heading-4">Export dat</h3>
                  <p className="body-small text-text-muted">Připravujeme</p>
                </div>
              </div>
              <p className="body-small text-text-muted mb-4">
                Export všech dat do PDF, Excel nebo Google Sheets
              </p>
              <div className="text-sm text-gray-500">Dostupné brzy</div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 wedding-card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Settings className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="heading-4 text-primary-900 mb-2">Potřebujete pomoc s nastavením?</h3>
              <p className="body-small text-primary-700 mb-4">
                Naše integrace jsou navrženy tak, aby byly jednoduché na použití. Pokud máte problémy, 
                podívejte se do naší dokumentace nebo nás kontaktujte.
              </p>
              <div className="flex space-x-3">
                <button className="btn-primary">
                  Dokumentace
                </button>
                <button className="btn-outline border-primary-300 text-primary-700 hover:bg-primary-100">
                  Kontakt
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
