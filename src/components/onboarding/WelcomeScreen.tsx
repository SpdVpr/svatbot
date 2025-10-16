'use client'

import { useState } from 'react'
import { Heart, Sparkles, CheckSquare, Users, CreditCard, Clock, Calendar, CheckCircle, Wallet, UserPlus, TrendingUp, Smartphone, Zap, Shield, Star, Store, Briefcase, Eye, Image, Award, ArrowRight, Lock, BarChart2, Cloud, Mail, Grip, RefreshCw } from 'lucide-react'
import { cn } from '@/utils'
import { useAuth } from '@/hooks/useAuth'
import AuthModal from '@/components/auth/AuthModal'
import ScrollProgress from '@/components/animations/ScrollProgress'
import NumberCounter from '@/components/animations/NumberCounter'

export default function WelcomeScreen() {
  const { login, clearError } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [isDemoLoading, setIsDemoLoading] = useState(false)

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
      console.error('Demo login error:', error)
      setAuthMode('login')
      setShowAuthModal(true)
    } finally {
      setIsDemoLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      {/* Scroll Progress */}
      <ScrollProgress />

      <header className="relative z-20 w-full bg-white bg-opacity-80 backdrop-blur-sm shadow-sm py-3 md:py-4">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 md:w-7 md:h-7 text-rose-500 fill-rose-100" />
            <a href="#" className="font-display text-xl md:text-3xl font-bold text-gray-900">SvatBot.cz</a>
          </div>
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-rose-500 transition-colors duration-200 font-medium">Funkce</a>
            <a href="#dashboard" className="text-gray-600 hover:text-rose-500 transition-colors duration-200 font-medium">Dashboard</a>
            <a href="#vendors" className="text-gray-600 hover:text-rose-500 transition-colors duration-200 font-medium">Dodavatelé</a>
            <a href="#about" className="text-gray-600 hover:text-rose-500 transition-colors duration-200 font-medium">O nás</a>
            <a href="#contact" className="text-gray-600 hover:text-rose-500 transition-colors duration-200 font-medium">Kontakt</a>
          </nav>
          <div className="flex items-center space-x-2 md:space-x-4">
            <button onClick={handleLogin} className="px-3 py-1.5 md:px-6 md:py-2 text-sm md:text-base rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200 font-medium micro-bounce">
              Přihlásit
            </button>
            <button onClick={handleGetStarted} className="px-3 py-1.5 md:px-6 md:py-2 text-sm md:text-base rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-all duration-200 font-medium button-glow button-pulse-attention">
              Začít
            </button>
          </div>
        </div>
      </header>

      <section className="bg-gradient-hero py-12 md:py-20 lg:py-32 relative overflow-hidden touch-pan-y will-change-scroll">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="w-full h-full transform scale-150"></div>
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 text-center mb-8 lg:mb-0">
            <span className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-rose-100 text-rose-700 text-xs md:text-sm font-semibold rounded-full mb-4 md:mb-6 shadow-sm mx-auto">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 text-rose-500" /> První český svatební plánovač s AI
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-extrabold leading-tight mb-4 md:mb-6 text-gray-900">
              Plánujte svatbu snů <span className="text-gradient-primary">s AI pomocníkem</span> & bez stresu
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-6 md:mb-10 max-w-lg lg:max-w-xl mx-auto">
              SvatBot.cz kombinuje AI technologie s intuitivními nástroji: inteligentní asistent, rozpočet, timeline, hosté, seating plan, svatební web a marketplace ověřených dodavatelů – vše na jedné platformě.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
              <button onClick={handleDemoLogin} disabled={isDemoLoading} className={cn("px-6 py-3 md:px-8 md:py-4 bg-rose-500 text-white font-semibold text-base md:text-lg rounded-full shadow-lg hover:bg-rose-600 transition-all duration-300 button-glow flex items-center justify-center", isDemoLoading && "opacity-50 cursor-not-allowed")}>
                {isDemoLoading ? (
                  <>
                    <div className="w-5 h-5 md:w-6 md:h-6 loading-spinner mr-2" />
                    Načítání...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 mr-2" /> Vyzkoušet živé demo
                  </>
                )}
              </button>
              <button onClick={handleGetStarted} className="px-6 py-3 md:px-8 md:py-4 bg-white text-rose-600 font-semibold text-base md:text-lg rounded-full border border-rose-300 shadow-md hover:bg-rose-50 transition-all duration-300 flex items-center justify-center">
                <Heart className="w-5 h-5 md:w-6 md:h-6 mr-2" /> Začít plánování zdarma
              </button>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center w-full">
            <div className="w-full max-w-[500px] aspect-[5/3.5] bg-gray-200 rounded-2xl md:rounded-3xl shadow-2xl flex items-center justify-center border-2 md:border-4 border-white overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-purple-100 opacity-75"></div>
              <Heart className="w-24 h-24 md:w-36 md:h-36 text-rose-400 opacity-60 relative z-10" />
              <span className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-3 shadow-md text-xs md:text-sm text-gray-700 text-center">
                Placeholder pro interaktivní náhled funkcí nebo obrázek
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-12 md:py-16 lg:py-20 bg-white touch-pan-y will-change-scroll">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12 lg:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4 md:mb-6">
              Vše, co potřebujete pro <span className="text-gradient-primary">dokonalou svatbu</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Komplexní sada nástrojů s AI technologiemi pro bezproblémové plánování svatby od začátku do konce.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200 h-full text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-sm mx-auto">
                <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-rose-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-display font-semibold text-gray-900 mb-2 md:mb-3">AI Svatební Asistent</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">Inteligentní kouč s GPT-4 a Perplexity AI, který odpovídá na otázky a poskytuje personalizované rady 24/7.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200 h-full text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-sm mx-auto">
                <Users className="w-7 h-7 md:w-8 md:h-8 text-purple-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-display font-semibold text-gray-900 mb-2 md:mb-3">Správa hostů & RSVP</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">Kompletní správa hostů s RSVP systémem, dietními omezeními, seating planem a exportem do Excel.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200 h-full text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-sm mx-auto">
                <CreditCard className="w-7 h-7 md:w-8 md:h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-display font-semibold text-gray-900 mb-2 md:mb-3">Inteligentní rozpočet</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">AI optimalizace rozpočtu, sledování výdajů, grafy a statistiky s propojením na dodavatele.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200 h-full text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-sm mx-auto">
                <CheckSquare className="w-7 h-7 md:w-8 md:h-8 text-blue-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-display font-semibold text-gray-900 mb-2 md:mb-3">Úkoly & Timeline</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">Předpřipravený checklist 200+ úkolů s AI prioritizací a automatickým generováním timeline.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 lg:py-20 bg-rose-50 touch-pan-y will-change-scroll">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-4xl mx-auto p-6 md:p-10 lg:p-12 bg-white rounded-2xl md:rounded-3xl shadow-xl border border-rose-100">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4 md:mb-6">
              Připraveni vyzkoušet <span className="text-gradient-primary">plánování bez námahy</span>?
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-6 md:mb-8 lg:mb-10 max-w-2xl mx-auto">
              Udělejte první krok k vaší dokonalé svatbě. Vyzkoušejte naše demo nebo se zaregistrujte zdarma ještě dnes!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
              <button
                onClick={handleDemoLogin}
                disabled={isDemoLoading}
                className={cn(
                  "px-6 py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 bg-rose-500 text-white font-semibold text-base md:text-lg lg:text-xl rounded-full shadow-lg hover:bg-rose-600 transition-all duration-300 button-glow flex items-center justify-center",
                  isDemoLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isDemoLoading ? (
                  <>
                    <div className="w-5 h-5 md:w-6 md:h-6 loading-spinner mr-2 md:mr-3" />
                    Načítání...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" /> Spustit DEMO nyní
                  </>
                )}
              </button>
              <button
                onClick={handleGetStarted}
                className="px-6 py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 bg-white text-rose-600 font-semibold text-base md:text-lg lg:text-xl rounded-full border-2 border-rose-300 shadow-md hover:bg-rose-50 transition-all duration-300 flex items-center justify-center"
              >
                <Heart className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" /> Začít plánování ZDARMA
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 md:gap-6 text-center max-w-md mx-auto mt-6 md:mt-8 lg:mt-10 border-t border-gray-100 pt-6 md:pt-8">
              <div>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-rose-600 mb-1">100%</div>
                <div className="text-xs md:text-sm text-gray-500">Zdarma navždy</div>
              </div>
              <div>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-rose-600 mb-1">GDPR</div>
                <div className="text-xs md:text-sm text-gray-500">Compliant</div>
              </div>
              <div>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-rose-600 mb-1">24/7</div>
                <div className="text-xs md:text-sm text-gray-500">Přístup & Podpora</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="dashboard" className="py-12 md:py-16 lg:py-20 bg-gray-50 touch-pan-y will-change-scroll">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12 lg:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4 md:mb-6">
              Váš přizpůsobitelný dashboard
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Drag & drop dashboard s <NumberCounter end={18} suffix="+" className="text-gradient-accent font-bold" /> moduly včetně AI asistenta. Přesuňte, změňte velikost a skryjte moduly podle vašich potřeb.
            </p>
          </div>
          <div className="relative max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-purple-500 px-4 md:px-6 lg:px-8 py-3 md:py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <Heart className="w-6 h-6 md:w-8 md:h-8 text-white fill-white/30" />
                  <span className="font-display text-lg md:text-xl lg:text-2xl font-bold text-white">SvatBot.cz</span>
                </div>
                <div className="text-white text-xs md:text-sm lg:text-lg font-medium hidden sm:block">Anna & Tomáš • 15. června 2025</div>
              </div>
              <div className="p-4 md:p-6 lg:p-8 bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover-lift glass-morphism">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 text-lg">Odpočet do svatby</h3>
                    <Calendar className="w-6 h-6 text-rose-500 float-slow" />
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-rose-600 mb-1">
                      <NumberCounter end={180} duration={2500} />
                    </div>
                    <div className="text-md text-gray-500">dní do velkého dne!</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover-lift glass-morphism">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 text-lg">Pokrok úkolů</h3>
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-md text-gray-600">Dokončeno</span>
                      <span className="text-md font-semibold text-emerald-600">
                        <NumberCounter end={24} duration={2000} />/30
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow card-hover-scale">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 text-lg">Přehled rozpočtu</h3>
                    <Wallet className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-md text-gray-600">Utraceno</span>
                      <span className="text-md font-semibold text-orange-600">420 000 Kč</span>
                    </div>
                    <div className="text-sm text-gray-500">z 500 000 Kč</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow card-hover-scale">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 text-lg">RSVP hostů</h3>
                    <UserPlus className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">85</div>
                      <div className="text-xs text-gray-500">Pozváno</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">72</div>
                      <div className="text-xs text-gray-500">Potvrzeno</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow card-hover-scale">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 text-lg">Dodavatelé</h3>
                    <Store className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Potvrzeno</span>
                      <span className="font-semibold text-purple-600">8/10</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow card-hover-scale">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 text-lg">Celkový pokrok</h3>
                    <TrendingUp className="w-6 h-6 text-rose-500" />
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-rose-600 mb-1">68%</div>
                    <div className="text-sm text-gray-500">Připraveno na velký den</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 px-8 pb-8">
              <div className="text-center p-4 bg-white/50 rounded-lg border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Grip className="w-5 h-5 text-rose-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">Drag & Drop</h4>
                <p className="text-xs text-gray-600">Snadno přeuspořádejte moduly</p>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-lg border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <RefreshCw className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">Real-time Data</h4>
                <p className="text-xs text-gray-600">Okamžité aktualizace veškerého pokroku</p>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-lg border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">Plně responzivní</h4>
                <p className="text-xs text-gray-600">Bezproblémový zážitek na jakémkoli zařízení</p>
              </div>
            </div>
          </div>
          <div className="absolute -top-6 -right-6 bg-emerald-500 text-white px-4 py-2 rounded-full text-md font-medium shadow-xl rotate-3">✓ Plně funkční</div>
          <div className="absolute -bottom-6 -left-6 bg-rose-500 text-white px-4 py-2 rounded-full text-md font-medium shadow-xl -rotate-3">🎯 Vysoce přizpůsobitelné</div>
        </div>
      </section>

      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 touch-pan-y will-change-scroll">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12 lg:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4 md:mb-6">
              Pokročilé funkce: <span className="text-gradient-accent">Vše pro perfektní svatbu</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Kompletní sada nástrojů pro profesionální plánování svatby s moderními technologiemi.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200 text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-sm mx-auto">
                <Store className="w-7 h-7 md:w-8 md:h-8 text-yellow-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-display font-semibold text-gray-900 mb-2 md:mb-3">Marketplace dodavatelů</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">Databáze 200+ ověřených dodavatelů s reálnými portfolii, Google recenzemi a AI doporučeními.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200 text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-sm mx-auto">
                <Users className="w-7 h-7 md:w-8 md:h-8 text-pink-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-display font-semibold text-gray-900 mb-2 md:mb-3">Seating Plan Editor</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">Interaktivní editor s drag & drop, přizpůsobitelné stoly (kulaté/čtvercové) a automatické rozmístění hostů.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200 text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-sm mx-auto">
                <Cloud className="w-7 h-7 md:w-8 md:h-8 text-teal-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-display font-semibold text-gray-900 mb-2 md:mb-3">Svatební web builder</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">Vytvořte vlastní svatební web s RSVP systémem, fotogalerií a vlastní doménou – vše bez kódování.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200 text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-sm mx-auto">
                <Calendar className="w-7 h-7 md:w-8 md:h-8 text-orange-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-display font-semibold text-gray-900 mb-2 md:mb-3">Google Calendar & Spotify</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">Integrace s Google Calendar pro synchronizaci událostí a Spotify pro vytváření svatebních playlistů.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 lg:py-20 bg-white border-t border-gray-100 touch-pan-y will-change-scroll">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12 lg:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4 md:mb-6">
              Proč zvolit <span className="text-gradient-primary">SvatBot.cz</span>?
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Moderní přístup k plánování svatby, zaměřený na jednoduchost, eleganci a efektivitu.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-12 h-12 text-rose-600" />
              </div>
              <h3 className="text-3xl font-display font-semibold text-gray-900">AI technologie</h3>
              <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">První český svatební plánovač s GPT-4 a Perplexity AI pro inteligentní doporučení a automatizaci.</p>
            </div>
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto shadow-md">
                <Shield className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-3xl font-display font-semibold text-gray-900">Firebase & GDPR</h3>
              <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">Všechna data bezpečně uložená v Google Firebase s GDPR compliance a automatickým zálohováním.</p>
            </div>
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto shadow-md">
                <Clock className="w-12 h-12 text-emerald-600" />
              </div>
              <h3 className="text-3xl font-display font-semibold text-gray-900">Ušetříte čas</h3>
              <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">Automatizované procesy, AI asistent a předpřipravené šablony zkrátí plánování o týdny.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="vendors" className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-yellow-50 to-orange-50 touch-pan-y will-change-scroll">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-1/2 p-6 md:p-10 lg:p-12 bg-gradient-to-br from-rose-500 to-purple-500 text-white flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-6">
                  <Briefcase className="w-7 h-7 md:w-9 md:h-9" />
                  <span className="text-xs md:text-sm font-semibold uppercase tracking-wide">Pro dodavatele</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-4 md:mb-6">Jste poskytovatel svatebních služeb?</h2>
                <p className="text-base md:text-lg lg:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed">
                  Zaregistrujte se na našem tržišti a spojte se s tisíci párů, které aktivně plánují svou svatbu.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 text-lg">Zvyšte svou viditelnost</h4>
                      <p className="text-white/80 text-sm">Vaše služby uvidí páry, které aktivně hledají dodavatele.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 text-lg">Získejte nové klienty</h4>
                      <p className="text-white/80 text-sm">Přímé spojení s potenciálními klienty a páry.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Image className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 text-lg">Ukažte své portfolio</h4>
                      <p className="text-white/80 text-sm">Zobrazte fotografie, recenze a detailní popisy služeb.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-medium">Registrace dodavatele</span>
                  <span className="text-3xl font-bold">ZDARMA</span>
                </div>
                <p className="text-sm text-white/70">Žádné skryté poplatky • Schválení do 24-48 hodin</p>
              </div>
            </div>
            <div className="md:w-1/2 p-6 md:p-10 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-gray-50 to-white">
              <div className="mb-6 md:mb-8">
                <div className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-emerald-100 rounded-full mb-4 md:mb-6 shadow-sm">
                  <Zap className="w-3 h-3 md:w-4 md:h-4 text-emerald-600 mr-1.5 md:mr-2" />
                  <span className="text-xs md:text-sm font-medium text-emerald-700">Rychlé 5minutové nastavení!</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-3 md:mb-4">Začněte růst svůj byznys ještě dnes</h3>
                <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 leading-relaxed">
                  Vyplňte jednoduchý formulář, nahrajte úžasné fotografie z vašich předchozích svateb a začněte získávat nové klienty.
                </p>
                <button className="w-full flex items-center justify-center space-x-2 md:space-x-3 px-6 py-3 md:px-8 md:py-5 text-base md:text-lg font-semibold rounded-full bg-rose-500 text-white shadow-lg hover:bg-rose-600 transition-all duration-300 button-glow mb-4 md:mb-6">
                  <Award className="w-5 h-5 md:w-6 md:h-6" />
                  <span>Registrovat se jako dodavatel</span>
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <div className="text-center">
                  <p className="text-xs md:text-sm text-gray-500">Už máte účet? <button className="text-rose-600 hover:text-rose-700 font-medium">Přihlásit se</button></p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 md:gap-4 pt-6 md:pt-8 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-orange-600 mb-1">500+</div>
                  <div className="text-xs text-gray-600">Aktivních párů</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-rose-600 mb-1">200+</div>
                  <div className="text-xs text-gray-600">Dodavatelů</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-purple-600 mb-1">4.9★</div>
                  <div className="text-xs text-gray-600">Hodnocení</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="w-8 h-8 text-rose-300 fill-rose-900" />
                <span className="font-display text-3xl font-bold text-white">SvatBot.cz</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                Moderní nástroj pro plánování svatby. Vše na jednom místě – rozpočet, hosté, úkoly, timeline a dodavatelé.
              </p>
              <div className="flex space-x-4">
                <button onClick={handleGetStarted} className="px-7 py-3 bg-rose-500 text-white rounded-full font-semibold hover:bg-rose-600 transition-colors">Začít zdarma</button>
                <button onClick={handleDemoLogin} className="px-7 py-3 border border-gray-500 text-gray-300 rounded-full font-semibold hover:bg-gray-800 transition-colors">Zobrazit demo</button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-5 text-white">Funkce</h3>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#features" className="hover:text-rose-300 transition-colors">Checklist úkolů</a></li>
                <li><a href="#features" className="hover:text-rose-300 transition-colors">Správa hostů</a></li>
                <li><a href="#features" className="hover:text-rose-300 transition-colors">Sledování rozpočtu</a></li>
                <li><a href="#features" className="hover:text-rose-300 transition-colors">Tvůrce timeline</a></li>
                <li><a href="#vendors" className="hover:text-rose-300 transition-colors">Tržiště dodavatelů</a></li>
                <li><a href="#features" className="hover:text-rose-300 transition-colors">Plán usazení</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-5 text-white">Podpora</h3>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#contact" className="hover:text-rose-300 transition-colors">Centrum nápovědy</a></li>
                <li><a href="#contact" className="hover:text-rose-300 transition-colors">Kontaktujte nás</a></li>
                <li><a href="#about" className="hover:text-rose-300 transition-colors">FAQ</a></li>
                <li><a href="#about" className="hover:text-rose-300 transition-colors">Průvodci & Tutoriály</a></li>
                <li><a href="#about" className="hover:text-rose-300 transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-6 mb-6 md:mb-0">
              <p className="flex items-center">© 2024 SvatBot.cz - Vytvořeno s <Heart className="w-4 h-4 inline-block text-rose-400 fill-current mx-1" /> pro české páry.</p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-rose-300 transition-colors">Ochrana soukromí</a>
                <a href="#" className="hover:text-rose-300 transition-colors">Podmínky služby</a>
                <a href="#" className="hover:text-rose-300 transition-colors">GDPR</a>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-gray-500" />
                <span>SSL Zabezpečeno</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-gray-500" />
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </div>
  )
}

