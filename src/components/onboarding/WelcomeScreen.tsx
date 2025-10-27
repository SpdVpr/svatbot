'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Sparkles, CheckSquare, Users, CreditCard, Clock, Calendar, CheckCircle, Wallet, UserPlus, TrendingUp, Smartphone, Zap, Shield, Star, Store, Briefcase, Eye, Image, Award, ArrowRight, Lock, BarChart2, Cloud, Mail, Grip, RefreshCw, Crown } from 'lucide-react'
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

      <section className="bg-gradient-hero py-12 md:py-20 lg:py-32 relative overflow-hidden touch-pan-y">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="w-full h-full transform scale-150"></div>
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 text-center mb-8 lg:mb-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
              <button onClick={handleDemoLogin} disabled={isDemoLoading} className={cn("px-6 py-3 md:px-8 md:py-4 bg-rose-500 text-white font-semibold text-base md:text-lg rounded-full shadow-lg hover:bg-rose-600 transition-all duration-300 button-glow flex items-center justify-center demo-pulse", isDemoLoading && "opacity-50 cursor-not-allowed")}>
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
                <Heart className="w-5 h-5 md:w-6 md:h-6 mr-2 heartbeat" /> Začít plánování zdarma
              </button>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center animate-fade-in w-full" style={{ animationDelay: '0.4s' }}>
            <div className="w-full max-w-[745px] aspect-[5/3.5] rounded-2xl md:rounded-3xl shadow-2xl border-2 md:border-4 border-white overflow-hidden relative">
              <img
                src="/front2.jpg"
                alt="SvatBot.cz Dashboard Preview"
                className="w-full object-cover"
                style={{ height: '114%' }}
              />
            </div>
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
                <div className="text-xs md:text-sm text-gray-500">GPT-4 & Perplexity</div>
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

              {/* AI Logos */}
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                  <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">GPT-4</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Perplexity</span>
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

              {/* Modules count */}
              <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200">
                <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">17+</div>
                  <div className="text-xs text-gray-600">modulů</div>
                </div>
              </div>
            </div>
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
              <p className="flex items-center">© 2025 SvatBot.cz - Vytvořeno s <Heart className="w-4 h-4 inline-block text-rose-400 fill-current mx-1" /> pro české páry.</p>
              <div className="flex space-x-4">
                <a href="/ochrana-soukromi" className="hover:text-rose-300 transition-colors">Ochrana soukromí</a>
                <a href="/obchodni-podminky" className="hover:text-rose-300 transition-colors">Obchodní podmínky</a>
                <a href="/podminky-sluzby" className="hover:text-rose-300 transition-colors">Podmínky služby</a>
                <a href="/gdpr" className="hover:text-rose-300 transition-colors">GDPR</a>
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
    </>
  )
}

