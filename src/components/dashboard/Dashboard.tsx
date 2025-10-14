'use client'

import { useState } from 'react'
import { useWeddingStore } from '@/stores/weddingStore'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { dateUtils } from '@/utils'
import DragDropWrapper from './DragDropWrapper'
import { CanvasProvider, useCanvas } from '@/contexts/CanvasContext'
import {
  Heart,
  LogOut,
  User,
  Edit,
  StickyNote,
  Crown,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import WeddingSettings from '@/components/wedding/WeddingSettings'
import AccountModal from '@/components/account/AccountModal'
import AIAssistant from '@/components/ai/AIAssistant'
import NotesModal from '@/components/notes/NotesModal'
import LiveNotifications, { LiveToastNotifications } from '@/components/notifications/LiveNotifications'
import SimpleToastContainer, { showSimpleToast } from '@/components/notifications/SimpleToast'
// import { useNotificationTriggers } from '@/hooks/useNotificationTriggers'
import { useWeddingNotifications, useLiveToastNotifications } from '@/hooks/useWeddingNotifications'
import { createDemoNotifications, createTestToast } from '@/utils/demoNotifications'

function DashboardContent() {
  const { currentWedding } = useWeddingStore()
  const { logout, user } = useAuth()
  const { subscription, trialDaysRemaining, hasPremiumAccess } = useSubscription()
  const { getCanvasMaxWidth } = useCanvas()
  const [showWeddingSettings, setShowWeddingSettings] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)

  // Initialize notification triggers - DISABLED to prevent spam
  // useNotificationTriggers()

  // Demo notification hooks (for testing)
  const { createNotification, deleteAllNotifications } = useWeddingNotifications()
  const { showToast } = useLiveToastNotifications()

  // Demo function for testing notifications
  const handleTestNotifications = () => {
    console.log('Testing notifications...', { user: user?.id, createNotification })

    // Test simple toasts first
    showSimpleToast('info', 'Notifikace Test', 'Testování notifikačního systému...')

    setTimeout(() => {
      showSimpleToast('warning', 'Úkol brzy termín', 'Objednat svatební dort má termín zítra.')
    }, 1000)

    setTimeout(() => {
      showSimpleToast('error', 'Rozpočet překročen', 'Překročili jste rozpočet o 15%.')
    }, 2000)

    setTimeout(() => {
      showSimpleToast('success', 'RSVP potvrzeno', 'Jana Nováková potvrdila účast na svatbě.')
    }, 3000)

    // Try Firebase notifications if user is authenticated
    if (user?.id && createNotification) {
      setTimeout(() => {
        createDemoNotifications(createNotification, showToast)
      }, 4000)
    }
  }

  const handleDeleteAllNotifications = async () => {
    const result = await deleteAllNotifications()
    if (result?.success) {
      showSimpleToast('success', 'Notifikace smazány', `Smazáno ${result.deletedCount} notifikací!`)
    } else {
      showSimpleToast('error', 'Chyba', 'Chyba při mazání notifikací')
    }
  }

  const handleTestToast = () => {
    console.log('Testing toast...')
    // Test simple toast
    showSimpleToast('success', 'Test Toast', 'Toto je testovací toast notifikace!')

    // Also test the complex toast if available
    if (showToast) {
      createTestToast(showToast)
    }
  }

  // Use wedding from store (loaded from Firestore for all users including demo)
  const wedding = currentWedding



  if (!wedding) {
    return (
      <div className="min-h-screen wedding-gradient flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h2 className="heading-3 mb-2">Načítáme vaši svatbu...</h2>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        {/* Mobile Header */}
        <div className="sm:hidden">
          <div className="mobile-header">
            <div className="flex items-center">
              <img
                src="/logo.svg"
                alt="SvatBot.cz"
                className="h-8 w-auto"
              />
            </div>
            <div className="flex items-center space-x-2">
              <LiveNotifications />
              <button
                onClick={() => setShowNotesModal(true)}
                className="mobile-nav-button text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title="Poznámky"
              >
                <StickyNote className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowAccountModal(true)}
                className="mobile-nav-button text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title="Účet"
              >
                <User className="w-4 h-4" />
              </button>
              <button
                onClick={logout}
                className="mobile-nav-button text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title="Odhlásit"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile wedding info */}
          <div className="px-4 pb-3 border-t border-gray-100">
            <button
              onClick={() => setShowWeddingSettings(true)}
              className="text-left w-full hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <h2 className="text-sm font-semibold text-gray-900">
                {wedding.brideName} & {wedding.groomName}
              </h2>
              <p className="text-xs text-text-muted">
                {wedding.weddingDate
                  ? `${dateUtils.format(wedding.weddingDate, 'dd.MM.yyyy')}`
                  : 'Klikněte pro nastavení data'
                }
              </p>
            </button>

            {/* Subscription info */}
            {subscription?.status === 'trialing' && trialDaysRemaining !== null && (
              <div className="mt-2 px-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span className={`font-medium ${trialDaysRemaining <= 3 ? 'text-red-600' : 'text-amber-600'}`}>
                    {trialDaysRemaining === 0
                      ? 'Trial vyprší dnes!'
                      : `Trial vyprší za ${trialDaysRemaining} ${trialDaysRemaining === 1 ? 'den' : trialDaysRemaining <= 4 ? 'dny' : 'dní'}`
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className={`hidden sm:block mx-auto px-4 sm:px-6 lg:px-8 py-6 ${getCanvasMaxWidth()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <img
                src="/logo.svg"
                alt="SvatBot.cz"
                className="h-10 w-auto"
              />
              <div className="border-l border-gray-300 pl-6">
                <button
                  onClick={() => setShowWeddingSettings(true)}
                  className="text-left hover:text-primary-600 transition-colors group"
                  title="Klikněte pro úpravu"
                >
                  <h1 className="heading-4 group-hover:text-primary-600 transition-colors">
                    Svatba {wedding.brideName} & {wedding.groomName}
                    <Edit className="w-4 h-4 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h1>
                  <div className="flex items-center gap-4">
                    <p className="body-small text-text-muted">
                      {wedding.weddingDate
                        ? `${dateUtils.format(wedding.weddingDate, 'dd. MMMM yyyy')} • Dnes: ${dateUtils.format(new Date(), 'dd. MMMM yyyy')}`
                        : 'Datum zatím nestanoveno - klikněte pro nastavení'
                      }
                    </p>

                    {/* Subscription info */}
                    {subscription?.status === 'trialing' && trialDaysRemaining !== null && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className={`text-sm font-medium ${trialDaysRemaining <= 3 ? 'text-red-600' : 'text-amber-600'}`}>
                          {trialDaysRemaining === 0
                            ? 'Trial vyprší dnes!'
                            : `Trial vyprší za ${trialDaysRemaining} ${trialDaysRemaining === 1 ? 'den' : trialDaysRemaining <= 4 ? 'dny' : 'dní'}`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right mr-4">
                <p className="body-small text-text-muted">Přihlášen jako</p>
                <p className="body-small font-medium">{user?.displayName || user?.email}</p>
              </div>
              <LiveNotifications />
              <button
                onClick={() => setShowNotesModal(true)}
                className="btn-outline flex items-center space-x-2"
                title="Poznámky"
              >
                <StickyNote className="w-4 h-4" />
                <span className="hidden sm:inline">Poznámky</span>
              </button>
              <button
                onClick={() => setShowAccountModal(true)}
                className="btn-outline flex items-center space-x-2"
                title="Účet"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Účet</span>
              </button>
              <button
                onClick={logout}
                className="btn-outline flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Odhlásit</span>
              </button>
              {/* Development Test Buttons - HIDDEN */}
              {false && (
                <>
                  <button
                    onClick={handleTestToast}
                    className="btn-outline text-xs px-2 py-1"
                    title="Test Toast"
                  >
                    🍞
                  </button>
                  <button
                    onClick={handleTestNotifications}
                    className="btn-outline text-xs px-2 py-1"
                    title="Test Notifications"
                  >
                    🔔
                  </button>
                  <button
                    onClick={handleDeleteAllNotifications}
                    className="btn-outline text-xs px-2 py-1 text-red-600"
                    title="Delete All Notifications"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-4 sm:py-6">
        <DragDropWrapper onWeddingSettingsClick={() => setShowWeddingSettings(true)} />
      </main>

      {/* Wedding Settings Modal */}
      {showWeddingSettings && (
        <WeddingSettings
          onClose={() => setShowWeddingSettings(false)}
          onSave={() => {
            // Refresh the page or update state as needed
            window.location.reload()
          }}
        />
      )}

      {/* Floating AI Assistant */}
      <AIAssistant compact={true} />

      {/* Live Toast Notifications */}
      <LiveToastNotifications />

      {/* Simple Toast Container */}
      <SimpleToastContainer />

      {/* Notes Modal */}
      <NotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
      />

      {/* Account Modal */}
      {showAccountModal && (
        <AccountModal onClose={() => setShowAccountModal(false)} />
      )}
    </div>
  )
}

export default function Dashboard() {
  return (
    <CanvasProvider>
      <DashboardContent />
    </CanvasProvider>
  )
}
