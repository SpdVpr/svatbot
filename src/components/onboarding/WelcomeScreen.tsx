'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Sparkles, CheckSquare, Users, CreditCard, Clock, Calendar, CheckCircle, Wallet, UserPlus, TrendingUp, Smartphone, Zap, Shield, Star, Store, Briefcase, Eye, Image, Award, ArrowRight, Lock, BarChart2, Cloud, Mail, Grip, RefreshCw, Crown, Bot, ListChecks, DollarSign, MapPin, Grid3X3, Globe, ChevronDown, Phone, MessageSquare, Send, Code } from 'lucide-react'
import { cn } from '@/utils'
import { useAuth } from '@/hooks/useAuth'
import AuthModal from '@/components/auth/AuthModal'
import ScrollProgress from '@/components/animations/ScrollProgress'
import NumberCounter from '@/components/animations/NumberCounter'
import InteractiveDashboardDemo from './InteractiveDashboardDemo'
import PricingSection from './PricingSection'

export default function WelcomeScreen() {
  const router = useRouter()
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

  const handleVendorRegister = () => {
    router.push('/marketplace/register')
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
    <>
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
            <a href="#pricing" className="text-gray-600 hover:text-rose-500 transition-colors duration-200 font-medium">Ceník</a>
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

      <section className="bg-gradient-hero py-12 md:py-20 lg:py-32 relative overflow-hidden touch-pan-y" aria-label="Hlavní sekce">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" aria-hidden="true">
          <div className="w-full h-full transform scale-150"></div>
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 text-center mb-8 lg:mb-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <span className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-rose-100 text-rose-700 text-xs md:text-sm font-semibold rounded-full mb-4 md:mb-6 shadow-sm mx-auto" role="status">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 text-rose-500" aria-hidden="true" /> První český svatební plánovač s AI
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-extrabold leading-tight mb-4 md:mb-6 text-gray-900">
              Naplánujte Svatbu za <span className="text-gradient-primary">50+ Hodin Méně</span> s AI Asistentem
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-6 md:mb-10 max-w-lg lg:max-w-xl mx-auto">
              SvatBot.cz kombinuje AI technologie s intuitivními nástroji: inteligentní asistent, rozpočet, timeline, hosté, seating plan, svatební web a marketplace ověřených dodavatelů – vše na jedné platformě.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center" role="group" aria-label="Hlavní akce">
              <button
                onClick={handleDemoLogin}
                disabled={isDemoLoading}
                className={cn("px-6 py-3 md:px-8 md:py-4 bg-rose-500 text-white font-semibold text-base md:text-lg rounded-full shadow-lg hover:bg-rose-600 transition-all duration-300 button-glow flex items-center justify-center demo-pulse", isDemoLoading && "opacity-50 cursor-not-allowed")}
                aria-label="Vyzkoušet živé demo aplikace"
              >
                {isDemoLoading ? (
                  <>
                    <div className="w-5 h-5 md:w-6 md:h-6 loading-spinner mr-2" aria-hidden="true" />
                    Načítání...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 mr-2" aria-hidden="true" /> Vyzkoušet živé demo
                  </>
                )}
              </button>
              <button
                onClick={handleGetStarted}
                className="px-6 py-3 md:px-8 md:py-4 bg-white text-rose-600 font-semibold text-base md:text-lg rounded-full border border-rose-300 shadow-md hover:bg-rose-50 transition-all duration-300 flex items-center justify-center"
                aria-label="Začít plánování svatby zdarma"
              >
                <Heart className="w-5 h-5 md:w-6 md:h-6 mr-2 heartbeat" aria-hidden="true" /> Začít plánování zdarma
              </button>
            </div>
          </div>
          <figure className="lg:w-1/2 flex justify-center animate-fade-in w-full" style={{ animationDelay: '0.4s' }}>
            <div className="w-full max-w-[745px] aspect-[5/3.5] rounded-2xl md:rounded-3xl shadow-2xl border-2 md:border-4 border-white overflow-hidden relative">
              <img
                src="/front2.jpg"
                alt="Náhled dashboardu SvatBot.cz s AI asistentem, správou rozpočtu, timeline a dalšími nástroji pro plánování svatby"
                className="w-full object-cover"
                style={{ height: '114%' }}
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </figure>
        </div>
      </section>

      {/* Hlavní funkce - 8 modulů */}
      <section id="features" className="py-16 md:py-24 lg:py-32 bg-white relative overflow-hidden touch-pan-y" aria-labelledby="features-heading">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <header className="text-center mb-12 md:mb-16 lg:mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-100 to-purple-100 rounded-full mb-6 animate-fade-in" role="status">
              <Star className="w-4 h-4 text-rose-600 mr-2" aria-hidden="true" />
              <span className="text-sm font-semibold text-gray-800">Kompletní svatební plánovač</span>
            </div>
            <h2 id="features-heading" className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-gray-900 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Všechny nástroje pro <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500">dokonalou svatbu</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Od AI asistenta po svatební web – vše, co potřebujete na jedné platformě
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
            {/* AI Asistent - HLAVNÍ DIFERENCIÁTOR */}
            <div className="group bg-gradient-to-br from-rose-50 to-purple-50 rounded-3xl p-8 shadow-lg border-2 border-rose-200 hover:border-rose-400 hover:shadow-2xl transition-all duration-500 text-center animate-fade-in hover:scale-105 relative overflow-hidden" style={{ animationDelay: '0.3s' }}>
              <div className="absolute top-0 right-0 bg-gradient-to-br from-rose-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                PREMIUM
              </div>
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-3 h-3 text-yellow-900" />
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">AI Asistent</h3>
              <p className="text-base text-gray-600 leading-relaxed mb-4">
                Inteligentní pomocník s nejnovějším GPT-5. Doporučení, rady a automatizace 24/7.
              </p>
              <div className="flex items-center justify-center gap-2 pt-4 border-t border-rose-200">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg text-sm font-bold text-emerald-700 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>GPT-5</span>
                </div>
              </div>
            </div>

            {/* Úkoly & Checklist */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-500 text-center animate-fade-in hover:scale-105" style={{ animationDelay: '0.4s' }}>
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                  <ListChecks className="w-10 h-10 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">Úkoly & Checklist</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Předpřipravené šablony úkolů podle fází svatby s automatickými deadliny.
              </p>
            </div>

            {/* Hosté & RSVP */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:border-purple-300 hover:shadow-2xl transition-all duration-500 text-center animate-fade-in hover:scale-105" style={{ animationDelay: '0.5s' }}>
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                  <Users className="w-10 h-10 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">Hosté & RSVP</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Kompletní správa hostů, email pozvánky, RSVP systém a dietní omezení.
              </p>
            </div>

            {/* Rozpočet */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:border-green-300 hover:shadow-2xl transition-all duration-500 text-center animate-fade-in hover:scale-105" style={{ animationDelay: '0.6s' }}>
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                  <DollarSign className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">Rozpočet</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Real-time sledování výdajů, kategorie, platební kalendář a grafy.
              </p>
            </div>

            {/* Timeline & Kalendář */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:border-orange-300 hover:shadow-2xl transition-all duration-500 text-center animate-fade-in hover:scale-105" style={{ animationDelay: '0.7s' }}>
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                  <Calendar className="w-10 h-10 text-orange-600" />
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">Timeline & Kalendář</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Minutový plán svatebního dne a Google Calendar synchronizace.
              </p>
            </div>

            {/* Seating Plan */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:border-indigo-300 hover:shadow-2xl transition-all duration-500 text-center animate-fade-in hover:scale-105" style={{ animationDelay: '0.8s' }}>
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                  <Grid3X3 className="w-10 h-10 text-indigo-600" />
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">Seating Plan</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Interaktivní editor s drag & drop a automatickým rozmístěním hostů.
              </p>
            </div>

            {/* Svatební web */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:border-pink-300 hover:shadow-2xl transition-all duration-500 text-center animate-fade-in hover:scale-105" style={{ animationDelay: '0.9s' }}>
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                  <Globe className="w-10 h-10 text-pink-600" />
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">Svatební web</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Vlastní svatební web s RSVP, fotogalerií a vlastní doménou.
              </p>
            </div>

            {/* Marketplace */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:border-yellow-300 hover:shadow-2xl transition-all duration-500 text-center animate-fade-in hover:scale-105" style={{ animationDelay: '1s' }}>
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                  <Store className="w-10 h-10 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">Marketplace</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                50+ ověřených dodavatelů s reálnými recenzemi a portfolii.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Jak to funguje - 3 kroky */}
      <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden touch-pan-y">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full mb-6 shadow-sm animate-fade-in">
              <Zap className="w-4 h-4 text-rose-600 mr-2" />
              <span className="text-sm font-semibold text-gray-800">Jednoduché jako 1-2-3</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-gray-900 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Jak to <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500">funguje</span>?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Začněte plánovat svatbu za pouhých 7 minut
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
            {/* Krok 1 - Demo */}
            <div className="relative text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <span className="text-5xl font-bold text-white">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <Zap className="w-6 h-6 text-yellow-900" />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-4">Demo účet</h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-4">
                Vyzkoušejte kompletní demo aplikaci na jeden klik. Bez registrace, bez závazků.
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-md text-sm font-semibold text-gray-700">
                <Zap className="w-4 h-4 mr-2 text-emerald-500" />
                1 klik
              </div>
            </div>

            {/* Krok 2 - Registrace */}
            <div className="relative text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <span className="text-5xl font-bold text-white">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.2s' }}>
                  <CheckCircle className="w-6 h-6 text-blue-900" />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-4">Registrace</h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-4">
                Vytvořte si účet zdarma za 2 minuty. Žádná platební karta není potřeba. 30 dní zdarma!
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-md text-sm font-semibold text-gray-700">
                <Clock className="w-4 h-4 mr-2 text-rose-500" />
                2 minuty
              </div>
            </div>

            {/* Krok 3 - Nastavení */}
            <div className="relative text-center animate-fade-in" style={{ animationDelay: '0.7s' }}>
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <span className="text-5xl font-bold text-white">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.4s' }}>
                  <Heart className="w-6 h-6 text-green-900 fill-current" />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-4">Nastavení</h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-4">
                Zadejte datum svatby, místo konání a rozpočet. AI vám pomůže s nastavením a začnete plánovat!
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-md text-sm font-semibold text-gray-700">
                <Clock className="w-4 h-4 mr-2 text-purple-500" />
                5 minut
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12 md:mt-16">
            <button onClick={handleGetStarted} className="px-8 py-4 md:px-10 md:py-5 bg-gradient-to-r from-rose-500 to-purple-500 text-white font-semibold text-lg md:text-xl rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 button-glow flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6 mr-3 heartbeat" />
              Začít plánovat svatbu zdarma
              <ArrowRight className="w-6 h-6 ml-3" />
            </button>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden touch-pan-y">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-20 left-10 w-64 h-64 bg-rose-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-200 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-100 to-purple-100 rounded-full mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-rose-600 mr-2" />
              <span className="text-sm font-semibold text-gray-800">Pokročilé funkce</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-gray-900 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Vše pro <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500">perfektní svatbu</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Kompletní sada nástrojů s moderními technologiemi a unikátními funkcemi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
            {/* Moodboard */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:border-rose-300 hover:shadow-2xl transition-all duration-500 text-center animate-fade-in hover:scale-105" style={{ animationDelay: '0.3s' }}>
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                  <Image className="w-10 h-10 text-rose-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">Moodboard</h3>
              <p className="text-base text-gray-600 leading-relaxed">Vytvářejte vizuální nástěnky s inspiracemi, barvami a stylem vaší svatby. Unikátní funkce!</p>
            </div>

            {/* Seating Plan */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:border-purple-300 hover:shadow-2xl transition-all duration-500 text-center animate-fade-in hover:scale-105" style={{ animationDelay: '0.4s' }}>
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                  <Users className="w-10 h-10 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">Seating Plan</h3>
              <p className="text-base text-gray-600 leading-relaxed">Interaktivní editor s drag & drop, přizpůsobitelné stoly a automatické rozmístění hostů.</p>
            </div>

            {/* Svatební web */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-500 text-center animate-fade-in hover:scale-105" style={{ animationDelay: '0.5s' }}>
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                  <Cloud className="w-10 h-10 text-blue-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">Svatební web</h3>
              <p className="text-base text-gray-600 leading-relaxed">Vytvořte vlastní svatební web s RSVP, fotogalerií a vlastní doménou – bez kódování.</p>
            </div>

            {/* Integrace */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:border-orange-300 hover:shadow-2xl transition-all duration-500 text-center animate-fade-in hover:scale-105" style={{ animationDelay: '0.6s' }}>
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                  <Calendar className="w-10 h-10 text-orange-600" />
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">Integrace</h3>
              <p className="text-base text-gray-600 leading-relaxed">Google Calendar pro synchronizaci událostí a Spotify pro vytváření svatebních playlistů.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 lg:py-20 bg-rose-50 touch-pan-y">
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
                  "px-6 py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 bg-rose-500 text-white font-semibold text-base md:text-lg lg:text-xl rounded-full shadow-lg hover:bg-rose-600 transition-all duration-300 button-glow flex items-center justify-center demo-pulse",
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
                <Heart className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 heartbeat" /> Začít plánování ZDARMA
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 md:gap-6 text-center max-w-2xl mx-auto mt-6 md:mt-8 lg:mt-10 border-t border-gray-100 pt-6 md:pt-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-rose-100 rounded-full flex items-center justify-center mb-2">
                  <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-rose-600" />
                </div>
                <div className="text-base md:text-lg font-bold text-gray-900 mb-1">AI asistent</div>
                <div className="text-xs md:text-sm text-gray-500">GPT-5</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <BarChart2 className="w-6 h-6 md:w-7 md:h-7 text-purple-600" />
                </div>
                <div className="text-base md:text-lg font-bold text-gray-900 mb-1">17+ modulů</div>
                <div className="text-xs md:text-sm text-gray-500">Vše na jednom místě</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6 md:w-7 md:h-7 text-emerald-600" />
                </div>
                <div className="text-base md:text-lg font-bold text-gray-900 mb-1">Ušetříte čas</div>
                <div className="text-xs md:text-sm text-gray-500">-70% času plánování</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="dashboard" className="py-12 md:py-16 lg:py-20 bg-gray-50 touch-pan-y">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12 lg:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4 md:mb-6">
              Váš přizpůsobitelný dashboard
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Drag & drop dashboard s <NumberCounter end={18} suffix="+" className="text-gradient-accent font-bold" /> moduly včetně AI asistenta. Přesuňte, změňte velikost a skryjte moduly podle vašich potřeb.
            </p>
          </div>
          <div className="relative max-w-6xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <InteractiveDashboardDemo />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 relative overflow-hidden touch-pan-y">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-10 left-20 w-72 h-72 bg-rose-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-300 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full mb-6 shadow-sm animate-fade-in">
              <Star className="w-4 h-4 text-rose-600 mr-2" />
              <span className="text-sm font-semibold text-gray-800">Naše výhody</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-gray-900 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Proč zvolit <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500">SvatBot.cz</span>?
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Moderní přístup k plánování svatby s nejnovějšími technologiemi a komplexními nástroji.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
            {/* AI technologie */}
            <div className="group bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-xl border-2 border-white/50 hover:shadow-2xl transition-all duration-500 text-center animate-fade-in hover:scale-105" style={{ animationDelay: '0.3s' }}>
              <div className="relative mb-6">
                <div className="w-28 h-28 bg-gradient-to-br from-rose-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                  <Sparkles className="w-14 h-14 text-rose-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-4">AI technologie</h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
                První český svatební plánovač s pokročilými AI technologiemi pro inteligentní doporučení a automatizaci.
              </p>

              {/* AI Logo */}
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border-2 border-emerald-300 shadow-md">
                  <div className="w-7 h-7 bg-gradient-to-br from-emerald-600 to-green-600 rounded flex items-center justify-center">
                    <Sparkles className="text-white w-4 h-4" />
                  </div>
                  <span className="text-base font-bold text-gray-800">GPT-5</span>
                </div>
              </div>
            </div>

            {/* Ušetříte čas */}
            <div className="group bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-xl border-2 border-white/50 hover:shadow-2xl transition-all duration-500 text-center animate-fade-in hover:scale-105" style={{ animationDelay: '0.4s' }}>
              <div className="relative mb-6">
                <div className="w-28 h-28 bg-gradient-to-br from-emerald-100 to-green-100 rounded-3xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                  <Clock className="w-14 h-14 text-emerald-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-4">Ušetříte čas</h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
                Automatizované procesy, AI asistent a předpřipravené šablony zkrátí plánování o týdny.
              </p>

              {/* Time savings */}
              <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200">
                <div className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                  <div className="text-2xl font-bold text-emerald-600">-70%</div>
                  <div className="text-xs text-gray-600">času</div>
                </div>
              </div>
            </div>

            {/* Vše na jednom místě */}
            <div className="group bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-xl border-2 border-white/50 hover:shadow-2xl transition-all duration-500 text-center animate-fade-in hover:scale-105" style={{ animationDelay: '0.5s' }}>
              <div className="relative mb-6">
                <div className="w-28 h-28 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                  <BarChart2 className="w-14 h-14 text-purple-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-4">Vše na jednom místě</h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
                Kompletní sada 17+ modulů pro plánování svatby – od hostů po rozpočet, vše přehledně na jedné platformě.
              </p>

              {/* Time saved */}
              <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200">
                <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">50+</div>
                  <div className="text-xs text-gray-600">ušetřených hodin</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Recenze */}
      <section className="py-16 md:py-24 lg:py-32 bg-white relative overflow-hidden touch-pan-y">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full mb-6 animate-fade-in">
              <Star className="w-4 h-4 text-yellow-600 mr-2 fill-current" />
              <span className="text-sm font-semibold text-gray-800">Co říkají naši uživatelé</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-gray-900 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Spokojené páry <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500">po celém Česku</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Přečtěte si, jak SvatBot.cz pomohl stovkám párů naplánovat jejich vysněnou svatbu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-8 shadow-lg border-2 border-rose-100 hover:shadow-2xl transition-all duration-500 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 text-base leading-relaxed mb-6 italic">
                "SvatBot.cz nám ušetřil desítky hodin plánování! AI asistent nám pomohl s výběrem dodavatelů a rozpočet máme konečně pod kontrolou. Nemůžeme si vynachválit!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  JP
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Jana & Petr</div>
                  <div className="text-sm text-gray-600">Praha • Svatba 08/2024</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 shadow-lg border-2 border-purple-100 hover:shadow-2xl transition-all duration-500 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 text-base leading-relaxed mb-6 italic">
                "Seating plan editor je naprosto geniální! Za 30 minut jsme měli rozmístění 120 hostů hotové. A svatební web vypadá profesionálně, přitom jsme ho vytvořili sami."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  MT
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Markéta & Tomáš</div>
                  <div className="text-sm text-gray-600">Brno • Svatba 06/2024</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 shadow-lg border-2 border-blue-100 hover:shadow-2xl transition-all duration-500 animate-fade-in" style={{ animationDelay: '0.7s' }}>
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 text-base leading-relaxed mb-6 italic">
                "Marketplace s ověřenými dodavateli je skvělý! Našli jsme fotografa i kapelu během pár dní. RSVP systém nám ušetřil spoustu telefonátů a emailů."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  LM
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Lucie & Martin</div>
                  <div className="text-sm text-gray-600">Ostrava • Svatba 09/2024</div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiky */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto mt-16 md:mt-20">
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.9s' }}>
              <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500 mb-2">
                <NumberCounter end={50} suffix="+" />
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">Ušetřených hodin práce</div>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '1s' }}>
              <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500 mb-2">
                <NumberCounter end={2025} />
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">Vznik aplikace</div>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '1.1s' }}>
              <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 mb-2">
                <span className="text-4xl md:text-5xl font-bold">GPT-5</span>
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">Nejnovější AI</div>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '1.2s' }}>
              <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500 mb-2">
                <NumberCounter end={30} />
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">Dní zdarma</div>
            </div>
          </div>
        </div>
      </section>

      {/* Moderní technologie - Nová sekce */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4 animate-fade-in">
                <Zap className="w-4 h-4 text-yellow-400 mr-2" />
                <span className="text-sm font-semibold text-white">Nejmodernější technologie</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold text-white mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Postaveno na <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">špičkových technologiích</span>
              </h2>
              <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
                První český svatební plánovač využívající nejnovější AI a moderní cloudové technologie
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {/* GPT-5 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">GPT-5</h3>
                <p className="text-sm text-gray-300">Nejnovější AI model</p>
              </div>

              {/* Firebase */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Firebase</h3>
                <p className="text-sm text-gray-300">Google Cloud</p>
              </div>

              {/* Next.js */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Next.js 16</h3>
                <p className="text-sm text-gray-300">React framework</p>
              </div>

              {/* Real-time */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Real-time</h3>
                <p className="text-sm text-gray-300">Okamžitá sync</p>
              </div>
            </div>

            {/* Výhody */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 md:mt-12">
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.7s' }}>
                <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">⚡</div>
                <h4 className="text-lg font-semibold text-white mb-2">Bleskově rychlé</h4>
                <p className="text-sm text-gray-300">Optimalizováno pro maximální výkon</p>
              </div>
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">🔒</div>
                <h4 className="text-lg font-semibold text-white mb-2">100% Bezpečné</h4>
                <p className="text-sm text-gray-300">SSL šifrování a GDPR compliant</p>
              </div>
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.9s' }}>
                <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">☁️</div>
                <h4 className="text-lg font-semibold text-white mb-2">Cloud-based</h4>
                <p className="text-sm text-gray-300">Přístup odkudkoliv, kdykoliv</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Často kladené otázky */}
      <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden touch-pan-y">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6 animate-fade-in">
              <MessageSquare className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-gray-800">Máte otázky?</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-gray-900 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Často kladené <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500">otázky</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Odpovědi na nejčastější dotazy o SvatBot.cz
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* FAQ 1 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border-2 border-gray-100 hover:border-rose-200 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-start">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                  <span className="text-white font-bold">?</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Je SvatBot.cz zdarma?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Můžete vyzkoušet <strong>30 dní zdarma</strong> bez nutnosti zadávat platební údaje! Po zkušební době je vyžadována platba, ale výhoda je, že si můžete vyzkoušet celou aplikaci bez jakýchkoliv závazků.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ 2 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border-2 border-gray-100 hover:border-purple-200 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-start">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                  <span className="text-white font-bold">?</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Potřebuji technické znalosti?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    <strong>Ne!</strong> SvatBot.cz je navržen tak, aby byl intuitivní a jednoduchý. Vše funguje na principu drag & drop a klikání. Svatební web vytvoříte bez jediného řádku kódu. AI asistent vám pomůže s každým krokem.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ 3 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border-2 border-gray-100 hover:border-green-200 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-start">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                  <span className="text-white font-bold">?</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Jsou moje data v bezpečí?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    <strong>Absolutně!</strong> Používáme Firebase od Google s SSL šifrováním a jsme plně GDPR compliant. Vaše data jsou uložena v zabezpečených evropských serverech a nikdy je nesdílíme s třetími stranami.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ 4 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border-2 border-gray-100 hover:border-orange-200 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-start">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                  <span className="text-white font-bold">?</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Jak funguje AI asistent?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    AI asistent využívá <strong>nejnovější GPT-5</strong> s přístupem k vašim reálným datům (hosté, rozpočet, úkoly). Poskytuje personalizovaná doporučení, pomáhá s výběrem dodavatelů, optimalizuje rozpočet a odpovídá na vaše otázky 24/7.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ 5 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border-2 border-gray-100 hover:border-pink-200 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.7s' }}>
              <div className="flex items-start">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                  <span className="text-white font-bold">?</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Mohu zrušit kdykoliv?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    <strong>Ano!</strong> Žádné závazky, žádné skryté poplatky. Můžete zrušit kdykoliv během zkušební doby nebo po ní. Vaše data zůstanou zachována.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12 md:mt-16">
            <p className="text-lg text-gray-600 mb-6">Máte další otázky?</p>
            <button onClick={handleGetStarted} className="px-8 py-4 bg-gradient-to-r from-rose-500 to-purple-500 text-white font-semibold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 button-glow">
              Kontaktujte nás nebo vyzkoušejte demo
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection onGetStarted={handleGetStarted} />

      <section id="vendors" className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-yellow-50 to-orange-50 touch-pan-y">
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
                <button onClick={handleVendorRegister} className="w-full flex items-center justify-center space-x-2 md:space-x-3 px-6 py-3 md:px-8 md:py-5 text-base md:text-lg font-semibold rounded-full bg-rose-500 text-white shadow-lg hover:bg-rose-600 transition-all duration-300 button-glow mb-4 md:mb-6">
                  <Award className="w-5 h-5 md:w-6 md:h-6" />
                  <span>Registrovat se jako dodavatel</span>
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <div className="text-center">
                  <p className="text-xs md:text-sm text-gray-500">Už máte účet? <button onClick={handleLogin} className="text-rose-600 hover:text-rose-700 font-medium">Přihlásit se</button></p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 md:gap-4 pt-6 md:pt-8 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-orange-600 mb-1">Moderní</div>
                  <div className="text-xs text-gray-600">Platforma</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-rose-600 mb-1">100%</div>
                  <div className="text-xs text-gray-600">Zdarma</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-purple-600 mb-1">24-48h</div>
                  <div className="text-xs text-gray-600">Schválení</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kontakt sekce */}
      <section id="contact" className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-rose-500 via-purple-500 to-blue-500 relative overflow-hidden touch-pan-y">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6 animate-fade-in">
              <Mail className="w-4 h-4 text-white mr-2" />
              <span className="text-sm font-semibold text-white">Jsme tu pro vás</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-white mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Máte otázky? <span className="text-yellow-300">Kontaktujte nás!</span>
            </h2>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Náš tým je připraven vám pomoci s čímkoliv potřebujete
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Kontaktní informace */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-10 border-2 border-white/20 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-2xl font-display font-bold text-white mb-8">Kontaktní údaje</h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-white/70 mb-1">Email</div>
                    <a href="mailto:info@svatbot.cz" className="text-lg font-semibold text-white hover:text-yellow-300 transition-colors">
                      info@svatbot.cz
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-white/70 mb-1">Telefon</div>
                    <a href="tel:+420777123456" className="text-lg font-semibold text-white hover:text-yellow-300 transition-colors">
                      +420 777 123 456
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-white/70 mb-1">Adresa</div>
                    <div className="text-lg font-semibold text-white">
                      Praha, Česká republika
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-white/70 mb-1">Pracovní doba</div>
                    <div className="text-lg font-semibold text-white">
                      Po-Pá: 9:00 - 18:00
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/20">
                <div className="text-sm text-white/70 mb-3">Nebo nám napište přímo:</div>
                <div className="flex space-x-4">
                  <button onClick={handleGetStarted} className="flex-1 px-6 py-3 bg-white text-rose-600 rounded-full font-semibold hover:bg-yellow-300 hover:text-gray-900 transition-all duration-300 shadow-lg">
                    Začít zdarma
                  </button>
                  <button onClick={handleDemoLogin} className="flex-1 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/30 transition-all duration-300 border-2 border-white/30">
                    Vyzkoušet demo
                  </button>
                </div>
              </div>
            </div>

            {/* Rychlý kontaktní formulář */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-6">Napište nám</h3>

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Děkujeme za zprávu! Brzy se vám ozveme.'); }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jméno</label>
                  <input
                    type="text"
                    placeholder="Vaše jméno"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="vas@email.cz"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zpráva</label>
                  <textarea
                    placeholder="Jak vám můžeme pomoci?"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-colors resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-gradient-to-r from-rose-500 to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center button-glow"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Odeslat zprávu
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  Odpovídáme obvykle do <strong className="text-rose-600">24 hodin</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - SEO Optimized */}
      <section id="faq" className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white" aria-labelledby="faq-heading">
        <div className="container mx-auto px-4 md:px-6">
          <header className="text-center mb-12 md:mb-16">
            <h2 id="faq-heading" className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold text-gray-900 mb-4">
              Často kladené otázky
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Odpovědi na nejčastější dotazy o svatebním plánovači SvatBot.cz
            </p>
          </header>

          <div className="max-w-4xl mx-auto space-y-4" itemScope itemType="https://schema.org/FAQPage">
            {/* FAQ 1 */}
            <details className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between" itemProp="name">
                Co je SvatBot.cz a jak mi pomůže s plánováním svatby?
                <ChevronDown className="w-5 h-5 text-gray-500" aria-hidden="true" />
              </summary>
              <div className="mt-4 text-gray-600 leading-relaxed" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">
                  SvatBot.cz je první český svatební plánovač s AI asistentem, který vám ušetří 50+ hodin práce při organizaci svatby. Nabízíme kompletní sadu nástrojů: AI chatbot pro rady a tipy, správu rozpočtu, timeline plánování, správu hostů, seating plan editor, svatební web builder, RSVP systém a marketplace ověřených dodavatelů. Vše na jedné platformě, dostupné kdykoliv a odkudkoliv.
                </p>
              </div>
            </details>

            {/* FAQ 2 */}
            <details className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between" itemProp="name">
                Je SvatBot.cz zdarma? Jaké jsou cenové plány?
                <ChevronDown className="w-5 h-5 text-gray-500" aria-hidden="true" />
              </summary>
              <div className="mt-4 text-gray-600 leading-relaxed" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">
                  Ano! SvatBot.cz nabízí bezplatný plán s přístupem k základním funkcím. Pro pokročilé funkce jako AI asistent, neomezený počet hostů a premium šablony svatebního webu nabízíme prémiové plány od 2 999 Kč. Můžete začít zdarma a upgradovat kdykoliv během plánování.
                </p>
              </div>
            </details>

            {/* FAQ 3 */}
            <details className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between" itemProp="name">
                Jak funguje AI svatební asistent?
                <ChevronDown className="w-5 h-5 text-gray-500" aria-hidden="true" />
              </summary>
              <div className="mt-4 text-gray-600 leading-relaxed" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">
                  Náš AI asistent je trénovaný na tisících svatebních scénářů a poskytuje personalizované rady 24/7. Pomůže vám s výběrem dodavatelů, sestavením rozpočtu, časovým harmonogramem, etiketu, dekoracemi a řešením problémů. Stačí se zeptat a AI vám okamžitě odpoví s konkrétními doporučeními přizpůsobenými vaší svatbě.
                </p>
              </div>
            </details>

            {/* FAQ 4 */}
            <details className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between" itemProp="name">
                Mohu sdílet přístup s partnerem nebo rodinou?
                <ChevronDown className="w-5 h-5 text-gray-500" aria-hidden="true" />
              </summary>
              <div className="mt-4 text-gray-600 leading-relaxed" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">
                  Ano! SvatBot.cz podporuje sdílení přístupu. Můžete pozvat svého partnera, rodiče nebo svatební koordinátorku ke spolupráci na plánování. Všechny změny se synchronizují v reálném čase a každý má přístup k aktuálním informacím.
                </p>
              </div>
            </details>

            {/* FAQ 5 */}
            <details className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between" itemProp="name">
                Jsou moje data v bezpečí?
                <ChevronDown className="w-5 h-5 text-gray-500" aria-hidden="true" />
              </summary>
              <div className="mt-4 text-gray-600 leading-relaxed" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">
                  Absolutně! Používáme Firebase od Google s SSL šifrováním a jsme plně GDPR compliant. Vaše data jsou uložena v zabezpečených evropských datových centrech. Nikdy nesdílíme vaše osobní informace s třetími stranami bez vašeho souhlasu.
                </p>
              </div>
            </details>

            {/* FAQ 6 */}
            <details className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between" itemProp="name">
                Jak dlouho trvá vytvoření svatebního webu?
                <ChevronDown className="w-5 h-5 text-gray-500" aria-hidden="true" />
              </summary>
              <div className="mt-4 text-gray-600 leading-relaxed" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">
                  S naším svatebním web builderem vytvoříte krásný svatební web za 10-15 minut! Vyberte si šablonu, přidejte své fotky a informace, a web je hotový. Můžete ho kdykoliv upravovat a sdílet s hosty přes vlastní URL adresu.
                </p>
              </div>
            </details>

            {/* FAQ 7 - SEO: "svatební rozpočet" */}
            <details className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between" itemProp="name">
                Kolik stojí plánování svatby v roce 2025?
                <ChevronDown className="w-5 h-5 text-gray-500" aria-hidden="true" />
              </summary>
              <div className="mt-4 text-gray-600 leading-relaxed" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">
                  Průměrná svatba v České republice stojí 280 000 Kč. S SvatBot.cz můžete ušetřit až 20% díky chytrému rozpočtování a AI asistentovi, který vám poradí, kde optimalizovat náklady. Náš svatební rozpočet kalkulačka vám pomůže sledovat všechny výdaje v reálném čase a vyhnout se překvapením.
                </p>
              </div>
            </details>

            {/* FAQ 8 - SEO: "jak naplánovat svatbu" */}
            <details className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between" itemProp="name">
                Jak dlouho trvá naplánovat svatbu?
                <ChevronDown className="w-5 h-5 text-gray-500" aria-hidden="true" />
              </summary>
              <div className="mt-4 text-gray-600 leading-relaxed" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">
                  Tradiční plánování svatby zabere 100+ hodin práce. S SvatBot.cz to zvládnete za 50 hodin díky AI asistentovi, který vám automaticky vytvoří timeline, doporučí dodavatele a pomůže s organizací. Náš svatební checklist vás provede každým krokem přípravy na svatbu.
                </p>
              </div>
            </details>

            {/* FAQ 9 - SEO: "svatební checklist" */}
            <details className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between" itemProp="name">
                Co je svatební checklist a proč ho potřebuji?
                <ChevronDown className="w-5 h-5 text-gray-500" aria-hidden="true" />
              </summary>
              <div className="mt-4 text-gray-600 leading-relaxed" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">
                  Svatební checklist je seznam všech úkolů před svatbou seřazených podle priority a termínu. SvatBot.cz vám automaticky vytvoří personalizovaný checklist podle data svatby, počtu hostů a stylu. Dostanete upozornění na důležité termíny a nikdy nezapomenete na žádný detail organizace svatby.
                </p>
              </div>
            </details>

            {/* FAQ 10 - SEO: "svatební kalkulačka" */}
            <details className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between" itemProp="name">
                Jak vytvořit svatební rozpočet?
                <ChevronDown className="w-5 h-5 text-gray-500" aria-hidden="true" />
              </summary>
              <div className="mt-4 text-gray-600 leading-relaxed" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">
                  Náš AI asistent vám pomůže sestavit realistický svatební rozpočet podle počtu hostů, lokace a stylu svatby. Svatební kalkulačka automaticky rozdělí náklady do kategorií (místo, catering, fotograf, výzdoba) a sleduje skutečné výdaje. Dostanete přehled v reálném čase a varování při překročení limitu.
                </p>
              </div>
            </details>

            {/* FAQ 11 - SEO: "seating plan" */}
            <details className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between" itemProp="name">
                Co je seating plan a jak ho vytvořit?
                <ChevronDown className="w-5 h-5 text-gray-500" aria-hidden="true" />
              </summary>
              <div className="mt-4 text-gray-600 leading-relaxed" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">
                  Seating plan (usazovací plán) je rozložení hostů u stolů na svatební hostině. SvatBot.cz má jedinečný drag & drop editor, kde můžete vizuálně rozmístit stoly, přiřadit hosty a upravovat kapacity. AI asistent vám poradí optimální rozmístění podle vztahů mezi hosty.
                </p>
              </div>
            </details>

            {/* FAQ 12 - SEO: "svatební web" */}
            <details className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between" itemProp="name">
                Potřebuji svatební web?
                <ChevronDown className="w-5 h-5 text-gray-500" aria-hidden="true" />
              </summary>
              <div className="mt-4 text-gray-600 leading-relaxed" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">
                  Ano! 87% hostů očekává svatební web s informacemi o místě, programu a ubytování. Svatební stránky také usnadňují RSVP potvrzení a sdílení fotek. Vytvořte si svatební web zdarma v SvatBot.cz za 10 minut - žádné programování není potřeba!
                </p>
              </div>
            </details>
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
                První český svatební plánovač s AI asistentem. Vše na jednom místě – od hostů po rozpočet, od úkolů po svatební web.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
                <button onClick={handleGetStarted} className="px-7 py-3 bg-rose-500 text-white rounded-full font-semibold hover:bg-rose-600 transition-colors">Začít zdarma</button>
                <button onClick={handleDemoLogin} className="px-7 py-3 border border-gray-500 text-gray-300 rounded-full font-semibold hover:bg-gray-800 transition-colors">Zobrazit demo</button>
              </div>

              {/* Kontaktní info v patičce */}
              <div className="space-y-2 text-gray-400 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:info@svatbot.cz" className="hover:text-rose-300 transition-colors">info@svatbot.cz</a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+420777123456" className="hover:text-rose-300 transition-colors">+420 777 123 456</a>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Praha, Česká republika</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-5 text-white">Funkce</h3>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#features" className="hover:text-rose-300 transition-colors">AI Asistent</a></li>
                <li><a href="#features" className="hover:text-rose-300 transition-colors">Správa hostů & RSVP</a></li>
                <li><a href="#features" className="hover:text-rose-300 transition-colors">Rozpočet</a></li>
                <li><a href="#features" className="hover:text-rose-300 transition-colors">Úkoly & Timeline</a></li>
                <li><a href="#features" className="hover:text-rose-300 transition-colors">Seating Plan</a></li>
                <li><a href="#features" className="hover:text-rose-300 transition-colors">Svatební web</a></li>
                <li><a href="#vendors" className="hover:text-rose-300 transition-colors">Marketplace</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-5 text-white">Podpora</h3>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#contact" className="hover:text-rose-300 transition-colors">Kontakt</a></li>
                <li><a href="#pricing" className="hover:text-rose-300 transition-colors">Ceník</a></li>
                <li><a href="#dashboard" className="hover:text-rose-300 transition-colors">Demo</a></li>
                <li><a href="#vendors" className="hover:text-rose-300 transition-colors">Pro dodavatele</a></li>
                <li><a href="/ochrana-soukromi" className="hover:text-rose-300 transition-colors">Ochrana soukromí</a></li>
                <li><a href="/gdpr" className="hover:text-rose-300 transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-6 mb-6 md:mb-0">
              <p className="flex items-center">© 2025 SvatBot.cz - Vytvořeno s <Heart className="w-4 h-4 inline-block text-rose-400 fill-current mx-1" /> pro české páry.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="/ochrana-soukromi" className="hover:text-rose-300 transition-colors">Ochrana soukromí</a>
                <a href="/obchodni-podminky" className="hover:text-rose-300 transition-colors">Obchodní podmínky</a>
                <a href="/podminky-sluzby" className="hover:text-rose-300 transition-colors">Podmínky služby</a>
                <a href="/gdpr" className="hover:text-rose-300 transition-colors">GDPR</a>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
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
    </>
  )
}

