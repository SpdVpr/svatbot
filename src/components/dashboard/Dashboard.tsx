'use client'

import { useState, useEffect } from 'react'
import { useWeddingStore } from '@/stores/weddingStore'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { useWeddingDate } from '@/hooks/useDemoSettings'
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
  Clock,
  Menu
} from 'lucide-react'
import Link from 'next/link'
import WeddingSettings from '@/components/wedding/WeddingSettings'
import AccountModal from '@/components/account/AccountModal'
import AIAssistant from '@/components/ai/AIAssistant'
import NotesModal from '@/components/notes/NotesModal'
import { useViewTransition } from '@/hooks/useViewTransition'
import MobileMenu from '@/components/navigation/MobileMenu'
import LiveNotifications, { LiveToastNotifications } from '@/components/notifications/LiveNotifications'
import SimpleToastContainer, { showSimpleToast } from '@/components/notifications/SimpleToast'
// import { useNotificationTriggers } from '@/hooks/useNotificationTriggers'
import { useWeddingNotifications, useLiveToastNotifications } from '@/hooks/useWeddingNotifications'
import { createDemoNotifications, createTestToast } from '@/utils/demoNotifications'
import { useAutoNotifications } from '@/hooks/useAutoNotifications'
import { useCalendarReminders } from '@/hooks/useCalendarReminders'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'
import ScrollProgress from '@/components/animations/ScrollProgress'
import TrialExpiredModal from '@/components/subscription/TrialExpiredModal'
import { useSearchParams } from 'next/navigation'
// Import test utilities (only in development)
import '@/utils/testTrialExpiry'

function DashboardContent() {
  const { currentWedding } = useWeddingStore()
  const { logout, user } = useAuth()
  const { subscription, trialDaysRemaining, hasPremiumAccess } = useSubscription()
  const { getCanvasMaxWidth } = useCanvas()
  const { startTransition } = useViewTransition()
  const [showWeddingSettings, setShowWeddingSettings] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [accountInitialTab, setAccountInitialTab] = useState<'profile' | 'subscription' | 'payments' | 'statistics' | 'settings' | 'feedback'>('profile')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false)
  const searchParams = useSearchParams()

  // Use DEMO-aware wedding date
  const { weddingDate, isDemoUser } = useWeddingDate(user?.id, currentWedding?.weddingDate || null)

  // Check if trial has expired
  const isTrialExpired = subscription &&
    subscription.status === 'trialing' &&
    (
      // Either isTrialActive is false OR trial end date has passed
      !subscription.isTrialActive ||
      new Date() > subscription.trialEndDate
    ) &&
    !hasPremiumAccess

  // Show trial expired modal when trial expires
  useEffect(() => {
    if (isTrialExpired && user?.email !== 'demo@svatbot.cz') {
      setShowTrialExpiredModal(true)
    }
  }, [isTrialExpired, user])

  // Initialize auto-notifications system
  useAutoNotifications()

  // Initialize calendar reminders system
  const { testNotifications } = useCalendarReminders()

  // Check for payment success/cancel in URL
  useEffect(() => {
    const payment = searchParams.get('payment')
    const openAccount = searchParams.get('openAccount') as 'profile' | 'subscription' | 'payments' | 'statistics' | 'settings' | 'feedback' | null

    if (payment === 'success') {
      showSimpleToast('success', 'Platba úspěšná! 🎉', 'Vaše předplatné bylo aktivováno. Děkujeme!')
      // Remove payment param from URL
      window.history.replaceState({}, '', '/')
    } else if (payment === 'canceled') {
      showSimpleToast('info', 'Platba zrušena', 'Platba byla zrušena. Můžete to zkusit znovu kdykoliv.')
      // Remove payment param from URL
      window.history.replaceState({}, '', '/')
    }

    // Check if we should open account modal with specific tab
    if (openAccount && ['profile', 'subscription', 'payments', 'statistics', 'settings', 'feedback'].includes(openAccount)) {
      console.log('🔍 Opening account modal with tab:', openAccount)
      setAccountInitialTab(openAccount)
      setShowAccountModal(true)
      // Remove openAccount param from URL
      window.history.replaceState({}, '', '/')
    }
  }, [searchParams])

  // Helper functions for opening/closing modals with View Transitions
  const openWeddingSettings = () => {
    startTransition(() => setShowWeddingSettings(true))
  }

  const closeWeddingSettings = () => {
    startTransition(() => setShowWeddingSettings(false))
  }

  const openNotesModal = () => {
    // Set state immediately to hide content, then start transition for modal
    setShowNotesModal(true)
  }

  const closeNotesModal = () => {
    startTransition(() => setShowNotesModal(false))
  }

  const openAccountModal = (tab?: typeof accountInitialTab) => {
    // Set state immediately to hide content, then start transition for modal
    if (tab) setAccountInitialTab(tab)
    setShowAccountModal(true)
  }

  const closeAccountModal = () => {
    startTransition(() => setShowAccountModal(false))
  }

  const openMobileMenu = () => {
    startTransition(() => setShowMobileMenu(true))
  }

  const closeMobileMenu = () => {
    startTransition(() => setShowMobileMenu(false))
  }

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
    <div className="min-h-screen flex flex-col">
      {/* Trial Expired Modal - Blocks access */}
      {showTrialExpiredModal && (
        <TrialExpiredModal
          onUpgrade={() => {
            // Modal will close automatically after successful payment
            setShowTrialExpiredModal(false)
          }}
        />
      )}

      {/* Main content with blur when trial expired */}
      <div className={showTrialExpiredModal ? 'filter blur-sm pointer-events-none' : ''}>
        {/* Scroll Progress Indicator */}
        <ScrollProgress />

      {/* Glassmorphism Header - hidden when modal is open */}
      <header className={`bg-gray-50/95 backdrop-blur-xl border-b border-gray-100/50 shadow-sm sticky top-0 z-50 transition-opacity duration-200 ${
        showNotesModal || showAccountModal ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        {/* Mobile Header */}
        <div className="sm:hidden">
          <div className="mobile-header">
            <div className="flex items-center space-x-2">
              <button
                onClick={openMobileMenu}
                className="mobile-nav-button text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <img
                src="/logo2.png"
                alt="SvatBot.cz"
                className="h-10 w-auto"
              />
            </div>
            <div className="flex items-center space-x-2">
              <LiveNotifications />
              <button
                onClick={openNotesModal}
                className="mobile-nav-button text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title="Poznámky"
              >
                <StickyNote className="w-4 h-4" />
              </button>
              <button
                onClick={() => openAccountModal()}
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
              onClick={openWeddingSettings}
              className="text-left w-full hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <h2 className="text-sm font-semibold text-gray-900">
                {wedding.brideName} & {wedding.groomName}
              </h2>
              <p className="text-xs text-text-muted">
                {weddingDate
                  ? `${dateUtils.format(weddingDate, 'dd.MM.yyyy')}`
                  : 'Klikněte pro nastavení data'
                }
              </p>
            </button>

            {/* Subscription info */}
            {subscription?.status === 'trialing' && trialDaysRemaining !== null && (
              <div className="mt-2 px-2">
                <button
                  onClick={() => openAccountModal('subscription')}
                  className="flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span className={`font-medium ${trialDaysRemaining <= 3 ? 'text-red-600' : 'text-amber-600'}`}>
                    {trialDaysRemaining === 0
                      ? 'Trial vyprší dnes!'
                      : `Trial vyprší za ${trialDaysRemaining} ${trialDaysRemaining === 1 ? 'den' : trialDaysRemaining <= 4 ? 'dny' : 'dní'}`
                    }
                  </span>
                </button>
              </div>
            )}

            {/* Premium subscription info */}
            {subscription?.status === 'active' && hasPremiumAccess && (
              <div className="mt-2 px-2">
                <button
                  onClick={() => openAccountModal('subscription')}
                  className="flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity"
                >
                  <Crown className="w-3.5 h-3.5 text-primary-600" fill="currentColor" />
                  <span className="font-medium text-primary-600">
                    {subscription.plan === 'premium_monthly' && 'Premium Měsíční'}
                    {subscription.plan === 'premium_yearly' && 'Premium Roční'}
                    {subscription.plan === 'test_daily' && '🧪 Test Denní'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className={`hidden sm:block mx-auto px-4 sm:px-6 lg:px-8 py-6 ${getCanvasMaxWidth()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <img
                src="/logo2.png"
                alt="SvatBot.cz"
                className="h-14 w-auto"
              />
              <div className="border-l border-gray-300 pl-6">
                <button
                  onClick={openWeddingSettings}
                  className="text-left hover:text-primary-600 transition-colors group"
                  title="Klikněte pro úpravu"
                >
                  <h1 className="heading-4 group-hover:text-primary-600 transition-colors">
                    Svatba {wedding.brideName} & {wedding.groomName}
                    <Edit className="w-4 h-4 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h1>
                  <p className="body-small text-text-muted">
                    {weddingDate
                      ? `${dateUtils.format(weddingDate, 'dd. MMMM yyyy')} • Dnes: ${dateUtils.format(new Date(), 'dd. MMMM yyyy')}`
                      : 'Datum zatím nestanoveno - klikněte pro nastavení'
                    }
                  </p>
                </button>

                {/* Subscription info - outside button to avoid nesting */}
                {subscription?.status === 'trialing' && trialDaysRemaining !== null && (
                  <button
                    onClick={() => openAccountModal('subscription')}
                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity mt-1"
                  >
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className={`text-sm font-medium ${trialDaysRemaining <= 3 ? 'text-red-600' : 'text-amber-600'}`}>
                      {trialDaysRemaining === 0
                        ? 'Trial vyprší dnes!'
                        : `Trial vyprší za ${trialDaysRemaining} ${trialDaysRemaining === 1 ? 'den' : trialDaysRemaining <= 4 ? 'dny' : 'dní'}`
                      }
                    </span>
                  </button>
                )}

                {/* Premium subscription info */}
                {subscription?.status === 'active' && hasPremiumAccess && (
                  <button
                    onClick={() => openAccountModal('subscription')}
                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity mt-1"
                  >
                    <Crown className="w-4 h-4 text-primary-600" fill="currentColor" />
                    <span className="text-sm font-medium text-primary-600">
                      {subscription.plan === 'premium_monthly' && 'Premium Měsíční'}
                      {subscription.plan === 'premium_yearly' && 'Premium Roční'}
                      {subscription.plan === 'test_daily' && '🧪 Test Denní'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right mr-4">
                <p className="body-small text-text-muted">Přihlášen jako</p>
                <p className="body-small font-medium">{user?.displayName || user?.email}</p>
              </div>
              <LiveNotifications />
              <button
                onClick={openNotesModal}
                className="btn-outline flex items-center space-x-2"
                title="Poznámky"
              >
                <StickyNote className="w-4 h-4" />
                <span className="hidden sm:inline">Poznámky</span>
              </button>
              <button
                onClick={() => openAccountModal()}
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
                    onClick={() => testNotifications()}
                    className="btn-outline text-xs px-2 py-1"
                    title="Test Calendar Reminders"
                  >
                    📅
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

      {/* Main Content - Reduced padding on mobile, hidden when modal is open */}
      <main className={`flex-1 py-2 sm:py-6 px-2 sm:px-6 lg:px-8 transition-opacity duration-200 ${
        showNotesModal || showAccountModal ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <DragDropWrapper onWeddingSettingsClick={openWeddingSettings} />
      </main>

      {/* Wedding Settings Modal */}
      {showWeddingSettings && (
        <WeddingSettings
          onClose={closeWeddingSettings}
          onSave={() => {
            // Refresh the page or update state as needed
            window.location.reload()
          }}
        />
      )}

      {/* Floating AI Assistant - Hidden (using Svatbot module in dashboard instead) */}
      {/* <AIAssistant compact={true} /> */}

      {/* Onboarding Wizard */}
      <OnboardingWizard />

      {/* Live Toast Notifications */}
      <LiveToastNotifications />

      {/* Simple Toast Container */}
      <SimpleToastContainer />

      {/* Notes Modal */}
      <NotesModal
        isOpen={showNotesModal}
        onClose={closeNotesModal}
      />

      {/* Account Modal */}
      {showAccountModal && (
        <AccountModal
          onClose={closeAccountModal}
          initialTab={accountInitialTab}
        />
      )}

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={showMobileMenu}
        onClose={closeMobileMenu}
      />
      </div>
      {/* End of blurred content wrapper */}
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
