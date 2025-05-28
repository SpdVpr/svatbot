'use client'

import { useState } from 'react'
import { Heart, Sparkles, CheckCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/utils'
import AuthModal from '@/components/auth/AuthModal'

export default function WelcomeScreen() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')

  const features = [
    {
      icon: CheckCircle,
      title: 'Postupné plánování',
      description: 'Vedeme vás krok za krokem od základů po nejmenší detaily'
    },
    {
      icon: Heart,
      title: 'Český trh',
      description: 'Databáze českých míst konání a ověřených dodavatelů'
    },
    {
      icon: Sparkles,
      title: 'Moderní nástroje',
      description: 'Rozpočet, timeline, seating plan a mnoho dalšího'
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8 fade-in">
              <div className="space-y-4">
                <h1 className="heading-1">
                  Váš průvodce krásným{' '}
                  <span className="wedding-text-gradient">
                    svatebním plánováním
                  </span>
                </h1>
                <p className="body-large text-text-secondary max-w-lg">
                  Plánujte svou dokonalou svatbu krok za krokem s moderními nástroji 
                  a databází českých dodavatelů. Jednoduše, přehledně, bez stresu.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div 
                    key={feature.title}
                    className="flex items-start space-x-3 slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <feature.icon className="w-6 h-6 text-primary-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-text-primary">
                        {feature.title}
                      </h3>
                      <p className="body-small text-text-secondary">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStarted}
                  className="btn-primary flex items-center justify-center space-x-2 group"
                >
                  <span>Začít plánování</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button className="btn-secondary">
                  Prohlédnout demo
                </button>
              </div>

              {/* Social Proof */}
              <div className="pt-8 border-t border-primary-200">
                <p className="body-small text-text-muted mb-3">
                  Důvěřuje nám již přes 1000 párů
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-300 to-secondary-300 border-2 border-white"
                      />
                    ))}
                  </div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Heart
                        key={i}
                        className="w-4 h-4 text-accent-500"
                        fill="currentColor"
                      />
                    ))}
                    <span className="body-small text-text-secondary ml-2">
                      4.9/5 hodnocení
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative lg:pl-8">
              <div className="relative">
                {/* Main illustration placeholder */}
                <div className="wedding-card p-8 text-center space-y-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                    <Heart className="w-12 h-12 text-white" fill="currentColor" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="heading-4">
                      Svatba Jana & Petr
                    </h3>
                    <p className="body-normal text-text-secondary">
                      15. června 2025 • 85 hostů
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="body-small">Celkový pokrok</span>
                      <span className="body-small font-semibold">73%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: '73%' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-primary-600">180</div>
                      <div className="body-small text-text-muted">dní do svatby</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-success-500">24/30</div>
                      <div className="body-small text-text-muted">úkolů hotovo</div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-accent-400 rounded-full flex items-center justify-center shadow-lg bounce-gentle">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-secondary-400 rounded-full flex items-center justify-center shadow-lg bounce-gentle" style={{ animationDelay: '1s' }}>
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="container-desktop py-8 border-t border-primary-200">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="body-small text-text-muted">
              © 2025 SvatBot.cz. Všechna práva vyhrazena.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="body-small text-text-muted hover:text-primary-600 transition-colors">
                Podmínky použití
              </a>
              <a href="#" className="body-small text-text-muted hover:text-primary-600 transition-colors">
                Ochrana soukromí
              </a>
              <a href="#" className="body-small text-text-muted hover:text-primary-600 transition-colors">
                Kontakt
              </a>
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
