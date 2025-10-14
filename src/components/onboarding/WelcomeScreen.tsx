'use client'

import { useState } from 'react'
import { Heart, Sparkles, CheckCircle, ArrowRight, Calendar, Users, DollarSign, Clock, Star, Shield, Zap, Briefcase, TrendingUp, Award } from 'lucide-react'
import { cn } from '@/utils'
import { useAuth } from '@/hooks/useAuth'
import AuthModal from '@/components/auth/AuthModal'
import Link from 'next/link'

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
            <div className="flex items-center">
              <img
                src="/logo.svg"
                alt="SvatBot.cz"
                className="h-10 w-auto"
              />
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
            <div className="text-center mb-16">
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full">
                  <Sparkles className="w-4 h-4 text-primary-600 mr-2" />
                  <span className="text-sm font-medium text-primary-700">
                    Nová generace svatebního plánování
                  </span>
                </div>
              </div>

              <h1 className="heading-1 mb-6">
                Plánujte svatbu{' '}
                <span className="wedding-text-gradient">
                  bez stresu
                </span>
                {' '}a chaosu
              </h1>

              <p className="body-large text-text-secondary max-w-3xl mx-auto mb-12">
                Moderní nástroje pro organizaci svatby. Rozpočet, timeline, hosté a dodavatelé
                na jednom místě. Začněte zdarma a objevte, jak jednoduché může být plánování.
              </p>

              {/* Hlavní funkce - IMPLEMENTOVANÉ */}
              <div className="mb-16">
                <div className="flex justify-center mb-8">
                  <div className="inline-flex items-center px-4 py-2 bg-success-100 rounded-full">
                    <CheckCircle className="w-4 h-4 text-success-600 mr-2" />
                    <span className="text-sm font-medium text-success-700">
                      Všechny funkce jsou plně implementované a funkční
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                  {mainFeatures.map((feature, index) => (
                    <div
                      key={feature.title}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-primary-200/50 slide-up hover:shadow-xl transition-all duration-300 relative overflow-hidden text-center"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {feature.implemented && (
                        <div className="absolute top-3 right-3">
                          <div className="w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}

                      <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4 mx-auto">
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
              <div className="max-w-4xl mx-auto p-10 bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50">
                <h3 className="heading-3 mb-6">
                  Připraveni začít plánovat?
                </h3>
                <p className="body-large text-text-secondary mb-10 max-w-2xl mx-auto">
                  Vyzkoušejte demo s realistickými daty nebo se zaregistrujte zdarma.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <button
                    onClick={handleDemoLogin}
                    disabled={isDemoLoading}
                    className={cn(
                      "btn-primary flex items-center justify-center space-x-3 px-12 py-6 text-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300",
                      isDemoLoading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isDemoLoading ? (
                      <>
                        <div className="w-5 h-5 loading-spinner" />
                        <span>Načítání...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6" />
                        <span>🚀 Spustit DEMO nyní</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleGetStarted}
                    className="btn-outline flex items-center justify-center space-x-3 px-12 py-6 text-xl font-medium border-2 hover:bg-primary-50 transition-all duration-300"
                  >
                    <span>🎉 Začít plánování ZDARMA</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-3 gap-6 text-center max-w-md mx-auto mt-8">
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
          </div>
        </main>

        {/* Dashboard Preview Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50/30">
          <div className="container-desktop">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="heading-2 mb-6">
                  Přehledný dashboard s modulárním{' '}
                  <span className="wedding-text-gradient">rozvržením</span>
                </h2>
                <p className="body-large text-text-secondary max-w-3xl mx-auto">
                  Všechny funkce přehledně uspořádané v drag & drop modulech.
                  Přizpůsobte si dashboard podle svých potřeb.
                </p>
              </div>

              {/* Dashboard Mockup */}
              <div className="relative max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                  {/* Dashboard Header */}
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src="/logo.svg"
                          alt="SvatBot.cz"
                          className="h-8 w-auto brightness-0 invert"
                        />
                      </div>
                      <div className="text-white text-sm">
                        Anna & Tomáš • 15. 6. 2025
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="p-6 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Wedding Countdown Module */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-800">Odpočet svatby</h3>
                          <Calendar className="w-5 h-5 text-primary-500" />
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary-600 mb-1">180</div>
                          <div className="text-sm text-gray-500">dní do svatby</div>
                        </div>
                      </div>

                      {/* Tasks Module */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-800">Úkoly</h3>
                          <CheckCircle className="w-5 h-5 text-success-500" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Dokončeno</span>
                            <span className="text-sm font-semibold text-success-600">24/30</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-success-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Budget Module */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-800">Rozpočet</h3>
                          <DollarSign className="w-5 h-5 text-accent-500" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Využito</span>
                            <span className="text-sm font-semibold text-accent-600">420 000 Kč</span>
                          </div>
                          <div className="text-xs text-gray-500">z 500 000 Kč</div>
                        </div>
                      </div>

                      {/* Guests Module */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-800">Hosté</h3>
                          <Users className="w-5 h-5 text-secondary-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-xl font-bold text-secondary-600">85</div>
                            <div className="text-xs text-gray-500">Pozvánky</div>
                          </div>
                          <div>
                            <div className="text-xl font-bold text-success-600">72</div>
                            <div className="text-xs text-gray-500">Potvrzeno</div>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Module */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-800">Timeline</h3>
                          <Clock className="w-5 h-5 text-primary-500" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">14:00 Obřad</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            <span className="text-sm text-gray-600">15:30 Focení</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            <span className="text-sm text-gray-600">18:00 Hostina</span>
                          </div>
                        </div>
                      </div>

                      {/* Vendors Module */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-800">Dodavatelé</h3>
                          <Star className="w-5 h-5 text-accent-500" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Fotograf</span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-500">4.9</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Květiny</span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-500">4.8</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dashboard Features */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-white/50 rounded-lg border border-gray-100">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Sparkles className="w-4 h-4 text-primary-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-1">Drag & Drop</h4>
                        <p className="text-xs text-gray-600">Přesuňte moduly podle potřeby</p>
                      </div>
                      <div className="text-center p-4 bg-white/50 rounded-lg border border-gray-100">
                        <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Shield className="w-4 h-4 text-success-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-1">Real-time</h4>
                        <p className="text-xs text-gray-600">Okamžité aktualizace dat</p>
                      </div>
                      <div className="text-center p-4 bg-white/50 rounded-lg border border-gray-100">
                        <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Zap className="w-4 h-4 text-accent-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-1">Responzivní</h4>
                        <p className="text-xs text-gray-600">Funguje na všech zařízeních</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating indicators */}
                <div className="absolute -top-4 -right-4 bg-success-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                  ✓ Plně funkční
                </div>
                <div className="absolute -bottom-4 -left-4 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                  🎯 Přizpůsobitelné
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Další funkce Section */}
        <section className="bg-gradient-to-br from-primary-50/50 to-secondary-50/50 py-20">
          <div className="container-desktop">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="heading-2 mb-6">
                  Další pokročilé funkce
                </h2>
                <p className="body-large text-text-secondary max-w-3xl mx-auto">
                  Kompletní sada nástrojů pro profesionální plánování svatby
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                {additionalFeatures.map((feature, index) => (
                  <div
                    key={feature.title}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-primary-200/50 slide-up hover:shadow-xl transition-all duration-300 relative overflow-hidden text-center"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {feature.implemented && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4 mx-auto">
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
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 border-t border-primary-200/50">
          <div className="container-desktop">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="heading-2 mb-6">
                  Proč si vybrat{' '}
                  <span className="wedding-text-gradient">SvatBot.cz</span>
                </h2>
                <p className="body-large text-text-secondary max-w-3xl mx-auto">
                  Moderní přístup k plánování svatby s důrazem na jednoduchost a efektivitu
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                {benefits.map((benefit, index) => (
                  <div
                    key={benefit.title}
                    className="text-center space-y-6 slide-up"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center mx-auto">
                      <benefit.icon className="w-10 h-10 text-primary-600" />
                    </div>
                    <h3 className="heading-4">{benefit.title}</h3>
                    <p className="body-normal text-text-secondary leading-relaxed max-w-sm mx-auto">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Vendor Registration CTA Section */}
        <section className="py-20 bg-gradient-to-br from-accent-50 to-orange-50">
          <div className="container-desktop">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Left Column - Info */}
                  <div className="p-12 bg-gradient-to-br from-accent-500 to-orange-500 text-white">
                    <div className="flex items-center space-x-2 mb-6">
                      <Briefcase className="w-8 h-8" />
                      <span className="text-sm font-semibold uppercase tracking-wide">Pro dodavatele</span>
                    </div>

                    <h2 className="text-4xl font-bold mb-6">
                      Nabízíte svatební služby?
                    </h2>

                    <p className="text-xl text-white/90 mb-8 leading-relaxed">
                      Zaregistrujte se do našeho marketplace a oslovte tisíce párů, které plánují svatbu.
                    </p>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Zvyšte viditelnost</h4>
                          <p className="text-white/80 text-sm">Vaše služby uvidí páry aktivně hledající dodavatele</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Získejte nové zakázky</h4>
                          <p className="text-white/80 text-sm">Přímý kontakt s potenciálními klienty</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Prezentujte své portfolio</h4>
                          <p className="text-white/80 text-sm">Fotografie, recenze a detailní popis služeb</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Star className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Budujte důvěru</h4>
                          <p className="text-white/80 text-sm">Ověřený profil a hodnocení od klientů</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Registrace</span>
                        <span className="text-2xl font-bold">ZDARMA</span>
                      </div>
                      <p className="text-xs text-white/70">
                        Bez skrytých poplatků • Schválení do 24-48 hodin
                      </p>
                    </div>
                  </div>

                  {/* Right Column - CTA */}
                  <div className="p-12 flex flex-col justify-center bg-gradient-to-br from-gray-50 to-white">
                    <div className="mb-8">
                      <div className="inline-flex items-center px-4 py-2 bg-success-100 rounded-full mb-6">
                        <CheckCircle className="w-4 h-4 text-success-600 mr-2" />
                        <span className="text-sm font-medium text-success-700">
                          Rychlá registrace za 5 minut
                        </span>
                      </div>

                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        Začněte ještě dnes
                      </h3>

                      <p className="text-gray-600 mb-8 leading-relaxed">
                        Vyplňte jednoduchý formulář, nahrajte fotografie z vašich svateb a začněte získávat nové klienty.
                      </p>

                      <Link
                        href="/marketplace/register"
                        className="btn-primary w-full flex items-center justify-center space-x-3 px-8 py-5 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 mb-6"
                      >
                        <Briefcase className="w-5 h-5" />
                        <span>Zaregistrovat se jako dodavatel</span>
                        <ArrowRight className="w-5 h-5" />
                      </Link>

                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-4">
                          Již máte účet?{' '}
                          <button
                            onClick={handleLogin}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Přihlaste se
                          </button>
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent-600 mb-1">500+</div>
                        <div className="text-xs text-gray-600">Aktivních párů</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent-600 mb-1">100+</div>
                        <div className="text-xs text-gray-600">Dodavatelů</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent-600 mb-1">4.8★</div>
                        <div className="text-xs text-gray-600">Průměrné hodnocení</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-primary-900 text-white py-16">
          <div className="container-desktop">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-4 gap-8 mb-12">
                {/* Brand Column */}
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2 mb-4">
                    <Heart className="w-8 h-8 text-primary-300" fill="currentColor" />
                    <span className="font-display text-2xl font-bold">
                      SvatBot.cz
                    </span>
                  </div>
                  <p className="text-primary-100 mb-6 max-w-md">
                    Moderní nástroj pro plánování svatby. Všechno na jednom místě -
                    rozpočet, hosté, úkoly, timeline a dodavatelé.
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleGetStarted}
                      className="btn-primary px-6 py-3"
                    >
                      Začít zdarma
                    </button>
                    <button
                      onClick={handleDemoLogin}
                      disabled={isDemoLoading}
                      className="btn-outline border-primary-300 text-primary-100 hover:bg-primary-800 px-6 py-3"
                    >
                      Demo
                    </button>
                  </div>
                </div>

                {/* Funkce Column */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Funkce</h3>
                  <ul className="space-y-3">
                    <li>
                      <a href="#" className="text-primary-100 hover:text-white transition-colors">
                        Checklist úkolů
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-primary-100 hover:text-white transition-colors">
                        Správa hostů
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-primary-100 hover:text-white transition-colors">
                        Rozpočet
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-primary-100 hover:text-white transition-colors">
                        Timeline
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-primary-100 hover:text-white transition-colors">
                        Marketplace
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-primary-100 hover:text-white transition-colors">
                        Seating plan
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Podpora Column */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Podpora</h3>
                  <ul className="space-y-3">
                    <li>
                      <a href="#" className="text-primary-100 hover:text-white transition-colors">
                        Nápověda
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-primary-100 hover:text-white transition-colors">
                        Kontakt
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-primary-100 hover:text-white transition-colors">
                        FAQ
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-primary-100 hover:text-white transition-colors">
                        Návody
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-primary-100 hover:text-white transition-colors">
                        Blog
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="border-t border-primary-700 pt-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 mb-4 md:mb-0">
                    <p className="text-primary-200 text-sm">
                      © 2024 SvatBot.cz - Vytvořeno s ❤️ pro české páry
                    </p>
                    <div className="flex space-x-4 text-sm">
                      <a href="#" className="text-primary-200 hover:text-white transition-colors">
                        Ochrana soukromí
                      </a>
                      <a href="#" className="text-primary-200 hover:text-white transition-colors">
                        Podmínky použití
                      </a>
                      <a href="#" className="text-primary-200 hover:text-white transition-colors">
                        GDPR
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-primary-200 text-sm">
                      <Shield className="w-4 h-4" />
                      <span>SSL Zabezpečeno</span>
                    </div>
                    <div className="flex items-center space-x-2 text-primary-200 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>GDPR Compliant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
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
