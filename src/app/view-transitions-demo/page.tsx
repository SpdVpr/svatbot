'use client'

import { useState } from 'react'
import { ArrowLeft, Sparkles, MessageCircle, Bell, Heart, Info } from 'lucide-react'
import Link from 'next/link'
import ViewTransitionModal, { 
  ViewTransitionToast, 
  ViewTransitionFloatingButton 
} from '@/components/common/ViewTransitionModal'
import { useViewTransition } from '@/hooks/useViewTransition'

/**
 * Demo stránka pro View Transitions API v Next.js 16
 * 
 * Tato stránka demonstruje různé použití View Transitions API
 * pro floating elements jako modals, toasts, floating buttons, atd.
 */
export default function ViewTransitionsDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isToastVisible, setIsToastVisible] = useState(false)
  const [isFloatingButtonVisible, setIsFloatingButtonVisible] = useState(true)
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info')
  const [cardExpanded, setCardExpanded] = useState<number | null>(null)

  const { startTransition, isSupported } = useViewTransition()

  const showToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    setToastType(type)
    setIsToastVisible(true)
    setTimeout(() => setIsToastVisible(false), 3000)
  }

  const toggleCard = (index: number) => {
    if (isSupported) {
      startTransition(() => {
        setCardExpanded(cardExpanded === index ? null : index)
      })
    } else {
      setCardExpanded(cardExpanded === index ? null : index)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Zpět na Dashboard</span>
          </Link>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  View Transitions API Demo
                </h1>
                <p className="text-gray-600">
                  Next.js 16 - Plynulé animace pro floating elements
                </p>
              </div>
            </div>

            {/* Browser Support Info */}
            <div className={`p-4 rounded-lg ${isSupported ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex items-start space-x-2">
                <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSupported ? 'text-green-600' : 'text-yellow-600'}`} />
                <div>
                  <p className={`font-medium ${isSupported ? 'text-green-900' : 'text-yellow-900'}`}>
                    {isSupported ? '✅ View Transitions API je podporováno' : '⚠️ View Transitions API není podporováno'}
                  </p>
                  <p className={`text-sm ${isSupported ? 'text-green-700' : 'text-yellow-700'}`}>
                    {isSupported 
                      ? 'Váš prohlížeč podporuje View Transitions API. Uvidíte plynulé animace!'
                      : 'Váš prohlížeč nepodporuje View Transitions API. Animace budou okamžité (fallback).'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Modal Demo */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-primary-600" />
              <span>Modal s View Transition</span>
            </h2>
            <p className="text-gray-600 mb-4">
              Klikněte na tlačítko pro otevření modalu s plynulou animací.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-gradient-to-r from-primary-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
            >
              Otevřít Modal
            </button>
          </div>

          {/* Toast Demo */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Bell className="w-5 h-5 text-primary-600" />
              <span>Toast Notifikace</span>
            </h2>
            <p className="text-gray-600 mb-4">
              Vyzkoušejte různé typy toast notifikací s animacemi.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => showToast('success')}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                Success
              </button>
              <button
                onClick={() => showToast('error')}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Error
              </button>
              <button
                onClick={() => showToast('warning')}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
              >
                Warning
              </button>
              <button
                onClick={() => showToast('info')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Info
              </button>
            </div>
          </div>

          {/* Floating Button Demo */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Heart className="w-5 h-5 text-primary-600" />
              <span>Floating Button</span>
            </h2>
            <p className="text-gray-600 mb-4">
              Skrýt/zobrazit plovoucí tlačítko v pravém dolním rohu.
            </p>
            <button
              onClick={() => setIsFloatingButtonVisible(!isFloatingButtonVisible)}
              className={`w-full px-6 py-3 rounded-lg transition-all duration-300 font-medium ${
                isFloatingButtonVisible
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gradient-to-r from-primary-500 to-pink-500 text-white hover:shadow-lg'
              }`}
            >
              {isFloatingButtonVisible ? 'Skrýt Floating Button' : 'Zobrazit Floating Button'}
            </button>
          </div>

          {/* Expandable Cards Demo */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <span>Expandable Cards</span>
            </h2>
            <p className="text-gray-600 mb-4">
              Karty s plynulým rozbalením pomocí View Transitions.
            </p>
            <div className="space-y-2">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-primary-300 transition-colors"
                  onClick={() => toggleCard(index)}
                  style={{ viewTransitionName: `card-${index}` } as React.CSSProperties}
                >
                  <div className="p-4 bg-gradient-to-r from-primary-50 to-pink-50">
                    <h3 className="font-medium text-gray-900">
                      Karta {index}
                    </h3>
                  </div>
                  {cardExpanded === index && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <p className="text-gray-600 text-sm">
                        Toto je rozbalený obsah karty {index}. View Transitions API zajišťuje plynulý přechod mezi stavy.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Implementation Info */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📚 Implementace
          </h2>
          <div className="space-y-4 text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Hook: useViewTransition</h3>
              <code className="block bg-gray-100 p-3 rounded-lg text-sm">
                src/hooks/useViewTransition.ts
              </code>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">CSS Styly:</h3>
              <code className="block bg-gray-100 p-3 rounded-lg text-sm">
                src/styles/view-transitions.css
              </code>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Komponenty:</h3>
              <code className="block bg-gray-100 p-3 rounded-lg text-sm">
                src/components/common/ViewTransitionModal.tsx
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ViewTransitionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="View Transition Modal"
        transitionName="demo-modal"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Tento modal používá View Transitions API pro plynulé animace při otevírání a zavírání.
          </p>
          <p className="text-gray-600">
            Všimněte si, jak se modal plynule objevuje a mizí s fade + scale efektem.
          </p>
          <div className="bg-gradient-to-r from-primary-50 to-pink-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              💡 <strong>Tip:</strong> View Transitions API funguje automaticky bez nutnosti složitých animačních knihoven!
            </p>
          </div>
        </div>
      </ViewTransitionModal>

      {/* Toast */}
      <ViewTransitionToast
        isVisible={isToastVisible}
        type={toastType}
        title={`${toastType.charAt(0).toUpperCase() + toastType.slice(1)} Toast`}
        message="Toto je ukázková toast notifikace s View Transitions!"
        onClose={() => setIsToastVisible(false)}
        transitionName="demo-toast"
      />

      {/* Floating Button */}
      <ViewTransitionFloatingButton
        isVisible={isFloatingButtonVisible}
        onClick={() => alert('Floating button clicked!')}
        icon={<Sparkles className="w-6 h-6" />}
        label="AI Asistent"
        transitionName="demo-floating"
        position="bottom-right"
      />
    </div>
  )
}

