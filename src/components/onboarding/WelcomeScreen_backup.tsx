'use client'

import { useState } from 'react'
import { Heart, Sparkles, CheckCircle, ArrowRight, Calendar, Users, DollarSign, Clock, Star, Shield, Zap } from 'lucide-react'
import { cn } from '@/utils'
import { useAuth } from '@/hooks/useAuth'
import AuthModal from '@/components/auth/AuthModal'

export default function WelcomeScreen() {
  const { login, clearError } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [isDemoLoading, setIsDemoLoading] = useState(false)

  const mainFeatures = [
    {
      icon: CheckCircle,
      title: 'Chytrý checklist úkolů',
      description: 'Předpřipravené úkoly podle fází svatby s automatickými deadliny',
      implemented: true
    },
    {
      icon: Users,
      title: 'Kompletní správa hostů',
      description: 'RSVP systém, kategorie hostů, komunikace a seating plan',
      implemented: true
    },
    {
      icon: DollarSign,
      title: 'Detailní rozpočet',
      description: 'Sledování výdajů, plateb a porovnání s plánem v reálném čase',
      implemented: true
    },
    {
      icon: Calendar,
      title: 'Timeline svatebního dne',
      description: 'Minutový plán svatby s koordinací dodavatelů a fotografa',
      implemented: true
    }
  ]

  const additionalFeatures = [
    {
      icon: Heart,
      title: 'Marketplace dodavatelů',
      description: 'Databáze ověřených českých dodavatelů s portfolii a recenzemi',
      implemented: true
    },
    {
      icon: Sparkles,
      title: 'Drag & Drop dashboard',
      description: 'Přizpůsobitelný dashboard s modulárním rozvržením',
      implemented: true
    },
    {
      icon: Shield,
      title: 'Pokročilé statistiky',
      description: 'Detailní přehledy pokroku, výdajů a stavu příprav',
      implemented: true
    },
    {
      icon: Star,
      title: 'Automatické zálohování',
      description: 'Všechna data bezpečně uložena v cloudu s GDPR compliance',
      implemented: true
    }
  ]

  const benefits = [
    {
      icon: Zap,
      title: 'Ušetříte čas',
      description: 'Automatizované procesy a šablony zkrátí plánování o týdny'
    },
    {
      icon: Shield,
      title: 'Bezpečné úložiště',
      description: 'Všechna data jsou šifrovaná a zálohovaná v cloudu'
    },
    {
      icon: Star,
      title: 'Bez stresu',
      description: 'Přehledné rozhraní a postupné vedení eliminují chaos'
    }
  ]

  const handleGetStarted = () => {
    setAuthMode('register')
    setShowAuthModal(true)
  }

  const handleLogin = () => {
    setAuthMode('login')
    setShowAuthModal(true)
  }

  const handleDemoLogin = async () => {
    try {
      setIsDemoLoading(true)
      clearError()

      await login({
        email: 'demo@svatbot.cz',
        password: 'demo123'
      })
    } catch (error: any) {
      console.error('❌ Demo login error:', error)
      setAuthMode('login')
      setShowAuthModal(true)
    } finally {
      setIsDemoLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen wedding-gradient">
        {/* Header */}
        <header className="container-desktop py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-primary-500" fill="currentColor" />
              <span className="font-display text-2xl font-bold text-text-primary">
                SvatBot.cz
              </span>
            </div>
            
            <button
              onClick={handleLogin}
              className="btn-outline text-sm px-4 py-2"
            >
              Přihlásit se
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container-desktop py-12 lg:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Column - Content */}
              <div className="space-y-8 fade-in text-center lg:text-left">
                <div className="space-y-6">
                  <div className="flex justify-center lg:justify-start">
                    <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full">
                      <Sparkles className="w-4 h-4 text-primary-600 mr-2" />
                      <span className="text-sm font-medium text-primary-700">
                        Nová generace svatebního plánování
                      </span>
                    </div>
                  </div>

                  <h1 className="heading-1">
                    Plánujte svatbu{' '}
                    <span className="wedding-text-gradient">
                      bez stresu
                    </span>
                    {' '}a chaosu
                  </h1>

                  <p className="body-large text-text-secondary max-w-xl leading-relaxed mx-auto lg:mx-0">
                    Moderní nástroje pro organizaci svatby. Rozpočet, timeline, hosté a dodavatelé
                    na jednom místě. Začněte zdarma a objevte, jak jednoduché může být plánování.
                  </p>
                </div>

                {/* Hlavní funkce - IMPLEMENTOVANÉ */}
                <div className="space-y-8">
                  <div className="text-center lg:text-left">
                    <div className="flex justify-center lg:justify-start">
                      <div className="inline-flex items-center px-4 py-2 bg-success-100 rounded-full">
                        <CheckCircle className="w-4 h-4 text-success-600 mr-2" />
                        <span className="text-sm font-medium text-success-700">
                          Všechny funkce jsou plně implementované a funkční
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto lg:mx-0">
                    {mainFeatures.map((feature, index) => (
                      <div 
                        key={feature.title}
                        className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-primary-200/50 slide-up hover:shadow-xl transition-all duration-300 relative overflow-hidden text-center sm:text-left"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {feature.implemented && (
                          <div className="absolute top-3 right-3">
                            <div className="w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}

                        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4 mx-auto sm:mx-0">
                          <feature.icon className="w-6 h-6 text-primary-600" />
                        </div>

                        <h3 className="font-bold text-text-primary mb-3 text-lg">
                          {feature.title}
                        </h3>

                        <p className="body-normal text-text-secondary leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Buttons - HLAVNÍ AKCE */}
                <div className="space-y-6 text-center lg:text-left">
                  {/* Primární CTA */}
                  <div className="flex justify-center lg:justify-start">
                    <button
                      onClick={handleGetStarted}
                      className="btn-primary flex items-center justify-center space-x-3 group px-12 py-6 text-xl font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                    >
                      <span>🎉 Začít plánování ZDARMA</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                    </button>
                  </div>

                  {/* Sekundární CTA */}
                  <div className="flex flex-col lg:flex-row gap-4 items-center justify-center lg:justify-start">
                    <button
                      onClick={handleDemoLogin}
                      disabled={isDemoLoading}
                      className={cn(
                        "btn-outline flex items-center justify-center space-x-3 px-8 py-4 text-lg font-medium border-2 hover:bg-primary-50 transition-all duration-300",
                        isDemoLoading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isDemoLoading ? (
                        <>
                          <div className="w-5 h-5 loading-spinner" />
                          <span>Načítání demo...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>Vyzkoušet DEMO aplikaci</span>
                        </>
                      )}
                    </button>

                    <div className="text-center lg:text-left">
                      <p className="text-sm text-text-muted">
                        Bez registrace • Plně funkční • Okamžitě
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="pt-8">
                  <div className="grid grid-cols-3 gap-6 text-center max-w-md mx-auto lg:mx-0 lg:max-w-none lg:justify-start">
                    <div>
                      <div className="text-2xl font-bold text-primary-600 mb-1">100%</div>
                      <div className="body-small text-text-muted">Zdarma</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary-600 mb-1">GDPR</div>
                      <div className="body-small text-text-muted">Compliant</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary-600 mb-1">24/7</div>
                      <div className="body-small text-text-muted">Přístup</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Visual */}
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative max-w-md w-full">
                  {/* Main dashboard preview */}
                  <div className="wedding-card p-6 space-y-6 bg-white/80 backdrop-blur-sm mx-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                          <Heart className="w-5 h-5 text-white" fill="currentColor" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary">Moje svatba</h3>
                          <p className="text-sm text-text-secondary">Dashboard</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-text-muted">Pokrok</div>
                        <div className="text-lg font-bold text-primary-600">73%</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Progress sections */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-text-secondary">Celkový pokrok</span>
                          <span className="text-sm font-semibold">73%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: '73%' }} />
                        </div>
                      </div>

                      {/* Quick stats */}
                      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary-600">180</div>
                          <div className="text-xs text-text-muted">dní</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-success-500">24/30</div>
                          <div className="text-xs text-text-muted">úkoly</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-accent-500">85</div>
                          <div className="text-xs text-text-muted">hostů</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating feature cards */}
                  <div className="absolute -top-2 -right-2 bg-white rounded-lg shadow-lg p-3 border border-gray-100 bounce-gentle">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-primary-500" />
                      <span className="text-xs font-medium">Timeline</span>
                    </div>
                  </div>

                  <div className="absolute -bottom-2 -left-2 bg-white rounded-lg shadow-lg p-3 border border-gray-100 bounce-gentle" style={{ animationDelay: '1s' }}>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-success-500" />
                      <span className="text-xs font-medium">Rozpočet</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </>
  )
}
